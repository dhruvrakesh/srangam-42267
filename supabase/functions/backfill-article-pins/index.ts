/**
 * Phase H.2b — Backfill article ↔ gazetteer pins.
 *
 * Admin-only edge function. For each target article it:
 *
 *   1. Pulls geographic seeds already present in `srangam_article_evidence`
 *      (place / lat / lon) — confidence A.
 *   2. Scans the article's plain-text content for every gazetteer
 *      `canonical_name` and `name_variants[]` entry — confidence B.
 *   3. (Optional, default ON) Calls the tenant-aware AI helper
 *      (`_shared/ai-provider.ts` → Gemini primary, OpenAI fallback) to NER
 *      additional historical place names, then matches them back against
 *      the gazetteer — confidence C. Skipped when neither key is set.
 *
 * Idempotent: writes to `srangam_article_pins` via `.upsert()` on the
 * composite primary key (article_id, gazetteer_id), so re-running the
 * function on the same article never duplicates rows. The display_order
 * is recomputed deterministically per run.
 *
 * Observability: emits the standard structured-log shape from
 * `_shared/observability.ts` — one `pin_stage` per stage and one
 * `pin_complete` per article, including provider / model / token / cost
 * fields when AI ran.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { stage } from '../_shared/observability.ts';
import { aiExtractPlaces, NoAIProviderError } from '../_shared/ai-provider.ts';
import { reportItem, isCancelled, finishJob } from '../_shared/jobs.ts';

import { requireAdmin } from '../_shared/auth-gate.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  /** Backfill a single article by id. */
  article_id?: string;
  /** Or by slug / slug_alias (ignored if article_id is set). */
  slug?: string;
  /** Or backfill ALL published articles. */
  all_published?: boolean;
  /** Cap when `all_published` is true. Default 25. */
  limit?: number;
  /** Skip the AI NER pass (deterministic-only run). Default false. */
  skip_ai?: boolean;

  // ---- Phase H.4 chunked-job mode ----
  /** Existing job row id from `srangam_admin_jobs`. When set, the worker
   *  reports per-item progress to that row and respects cancellation. */
  job_id?: string;
  /** Where in the candidate list to start (default 0). */
  offset?: number;
  /** Articles to process in THIS invocation. Default 5, max 10 — sized to
   *  stay well under the 150 s edge-function wall-clock. */
  chunk_size?: number;

  // ---- Phase X.1 self-pump mode ----
  /** Internal flag set by the function itself when re-invoking for the
   *  next chunk via EdgeRuntime.waitUntil. Authenticated by service-role
   *  bearer instead of the user's admin JWT. */
  _pump?: boolean;
}


interface GazetteerRow {
  id: string;
  canonical_name: string;
  name_variants: string[] | null;
  latitude: number | string;
  longitude: number | string;
}

interface PinUpsertRow {
  article_id: string;
  gazetteer_id: string;
  confidence: 'A' | 'B' | 'C';
  source: string;
  display_order: number;
}

// ---------- helpers ----------

/** Strip markdown / HTML to a flat text blob suitable for regex + LLM input. */
function flattenContent(content: unknown): string {
  if (!content) return '';
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (typeof content === 'object') {
    const c = content as Record<string, unknown>;
    text = [c.en, c.hi, c.pa, c.ta].filter((v): v is string => typeof v === 'string').join('\n\n');
  }
  // Drop fenced code, html tags, markdown link syntax, and excess whitespace.
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_>`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Escape user-provided gazetteer names for safe RegExp construction. */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Build a single mega-regex for fast O(n) gazetteer scanning. */
function buildGazetteerRegex(gaz: GazetteerRow[]): {
  re: RegExp;
  index: Map<string, string>; // lowercased name -> gazetteer_id
} {
  const index = new Map<string, string>();
  const names: string[] = [];
  for (const g of gaz) {
    const all = [g.canonical_name, ...(g.name_variants ?? [])];
    for (const n of all) {
      if (!n || n.length < 3) continue;
      const key = n.toLowerCase();
      if (index.has(key)) continue;
      index.set(key, g.id);
      names.push(escapeRe(n));
    }
  }
  // Word-bounded, case-insensitive, Unicode.
  const re = new RegExp(`\\b(${names.join('|')})\\b`, 'giu');
  return { re, index };
}

function detectFromText(text: string, idx: { re: RegExp; index: Map<string, string> }): Set<string> {
  const found = new Set<string>();
  if (!text) return found;
  for (const m of text.matchAll(idx.re)) {
    const id = idx.index.get(m[1].toLowerCase());
    if (id) found.add(id);
  }
  return found;
}

/** Fuzzy-match an AI-extracted name to a gazetteer id. Returns null if no hit. */
function matchAiName(name: string, idx: Map<string, string>): string | null {
  const k = name.toLowerCase().trim();
  if (idx.has(k)) return idx.get(k)!;
  // Strip diacritics and retry.
  const normalised = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, id] of idx) {
    if (key.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalised) return id;
  }
  return null;
}

// ---------- core per-article worker ----------

interface PerArticleAiStats {
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  cost_usd_estimate: number;
}

async function backfillOne(
  supabase: ReturnType<typeof createClient>,
  article: { id: string; slug: string; content: unknown },
  gaz: GazetteerRow[],
  gazIdx: { re: RegExp; index: Map<string, string> },
  skipAi: boolean,
): Promise<{
  inserted: number;
  pins_a: number;
  pins_b: number;
  pins_c: number;
  ai?: PerArticleAiStats;
}> {
  const t0 = performance.now();
  const pinMap = new Map<string, 'A' | 'B' | 'C'>(); // gazetteer_id -> highest-tier confidence

  // ---- Stage 1: evidence rows (confidence A) ----
  await stage('pin_evidence', { article_id: article.id }, async () => {
    const { data: evidence } = await supabase
      .from('srangam_article_evidence')
      .select('place,latitude,longitude')
      .eq('article_id', article.id);
    for (const e of evidence ?? []) {
      const place = (e as any).place as string | null;
      if (!place) continue;
      const id = matchAiName(place, gazIdx.index);
      if (id) pinMap.set(id, 'A');
    }
  });

  // ---- Stage 2: deterministic content scan (confidence B) ----
  const flat = flattenContent(article.content);
  await stage('pin_scan', { article_id: article.id, chars: flat.length }, () => {
    const hits = detectFromText(flat, gazIdx);
    for (const id of hits) {
      if (!pinMap.has(id)) pinMap.set(id, 'B');
    }
  });

  // ---- Stage 3: AI NER (confidence C) ----
  let aiStats: PerArticleAiStats | undefined;
  if (!skipAi && flat.length > 200) {
    try {
      await stage('pin_ai', { article_id: article.id }, async () => {
        const result = await aiExtractPlaces(flat);
        aiStats = {
          provider: result.provider,
          model: result.model,
          prompt_tokens: result.prompt_tokens,
          completion_tokens: result.completion_tokens,
          latency_ms: result.latency_ms,
          cost_usd_estimate: Number(result.cost_usd_estimate.toFixed(6)),
        };
        for (const p of result.places) {
          const id = matchAiName(p.name, gazIdx.index);
          if (id && !pinMap.has(id)) pinMap.set(id, 'C');
        }
      });
    } catch (e) {
      if (e instanceof NoAIProviderError) {
        console.log(JSON.stringify({
          evt: 'pin_stage', stage: 'pin_ai', ok: false,
          article_id: article.id, error: 'no_ai_keys', ts: new Date().toISOString(),
        }));
      } else {
        // already logged by stage(), swallow so deterministic pins still write
      }
    }
  }

  // ---- Stage 4: idempotent upsert ----
  const sortOrder = (c: 'A' | 'B' | 'C') => (c === 'A' ? 0 : c === 'B' ? 1 : 2);
  const rows: PinUpsertRow[] = [...pinMap.entries()]
    .sort((a, b) => sortOrder(a[1]) - sortOrder(b[1]))
    .map(([gazetteer_id, confidence], display_order) => ({
      article_id: article.id,
      gazetteer_id,
      confidence,
      source: confidence === 'A' ? 'evidence' : confidence === 'B' ? 'content_scan' : 'ai_ner',
      display_order,
    }));

  let inserted = 0;
  if (rows.length > 0) {
    await stage('pin_upsert', { article_id: article.id, n: rows.length }, async () => {
      const { error } = await supabase
        .from('srangam_article_pins')
        .upsert(rows, { onConflict: 'article_id,gazetteer_id' });
      if (error) throw error;
      inserted = rows.length;
    });
  }

  const counts = { pins_a: 0, pins_b: 0, pins_c: 0 };
  for (const c of pinMap.values()) {
    if (c === 'A') counts.pins_a++;
    else if (c === 'B') counts.pins_b++;
    else counts.pins_c++;
  }
  console.log(JSON.stringify({
    evt: 'pin_complete',
    article_id: article.id,
    slug: article.slug,
    inserted,
    ...counts,
    total_ms: Math.round(performance.now() - t0),
    ai: aiStats,
    ts: new Date().toISOString(),
  }));

  return { inserted, ...counts, ai: aiStats };
}

// ---------- Phase X.1: self-pump helper ----------
// Re-invokes this same function with the next offset, authenticated by the
// service-role key. Runs in the background via EdgeRuntime.waitUntil so the
// current response returns immediately. Removes the "browser tab closed →
// job stalls" failure mode without introducing any new infrastructure.
function schedulePumpReinvoke(selfUrl: string, body: RequestBody) {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) {
    console.error('[backfill-article-pins] pump: missing SERVICE_ROLE_KEY');
    return;
  }
  // @ts-ignore — EdgeRuntime is provided by Supabase Edge Runtime.
  const waitUntil = (globalThis as any).EdgeRuntime?.waitUntil;
  const fetchP = fetch(selfUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ ...body, _pump: true }),
  }).then(async (r) => {
    if (!r.ok) {
      console.error('[backfill-article-pins] pump reinvoke failed:', r.status, await r.text());
    }
  }).catch((e) => {
    console.error('[backfill-article-pins] pump reinvoke error:', e?.message ?? e);
  });
  if (typeof waitUntil === 'function') waitUntil(fetchP);
}

    total_ms: Math.round(performance.now() - t0),
    ai: aiStats,
    ts: new Date().toISOString(),
  }));

  return { inserted, ...counts, ai: aiStats };
}

// ---------- HTTP entry ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Parse body up-front so we can distinguish a user-initiated call from
  // an internal self-pump re-invocation (Phase X.1).
  const body = (await req.clone().json().catch(() => ({}))) as RequestBody;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // ---- Auth gate ---------------------------------------------------------
  // Self-pump: authenticated by service-role bearer + a valid existing
  // job_id (the original caller already passed requireAdmin to create it).
  const isPump = body._pump === true && !!body.job_id;
  if (isPump) {
    const auth = req.headers.get('Authorization') ?? '';
    if (auth !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: 'pump auth required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    const gate = await requireAdmin(req);
    if (gate.error) return gate.error;
  }

  try {
    const skipAi = body.skip_ai === true;
    const admin = createClient(supabaseUrl, serviceKey);

    // Load entire gazetteer once — small (~100s of rows).
    const { data: gaz, error: gazErr } = await admin
      .from('srangam_gazetteer')
      .select('id,canonical_name,name_variants,latitude,longitude');
    if (gazErr) throw gazErr;
    if (!gaz || gaz.length === 0) {
      return new Response(JSON.stringify({ error: 'gazetteer empty — seed first' }), {
        status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const gazIdx = buildGazetteerRegex(gaz as GazetteerRow[]);

    // Resolve target article(s).
    let articles: { id: string; slug: string; content: unknown }[] = [];
    let totalCandidates = 0;          // population size for chunked mode
    const chunkOffset = body.offset ?? 0;
    const chunkSize = Math.min(Math.max(body.chunk_size ?? 5, 1), 10);

    if (body.article_id) {
      const { data } = await admin
        .from('srangam_articles')
        .select('id,slug,content')
        .eq('id', body.article_id)
        .maybeSingle();
      if (data) articles = [data as any];
      totalCandidates = articles.length;
    } else if (body.slug) {
      const { data } = await admin
        .from('srangam_articles')
        .select('id,slug,content')
        .or(`slug.eq.${body.slug},slug_alias.eq.${body.slug}`)
        .maybeSingle();
      if (data) articles = [data as any];
      totalCandidates = articles.length;
    } else if (body.all_published) {
      const limit = Math.min(Math.max(body.limit ?? 25, 1), 200);

      const { count } = await admin
        .from('srangam_articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');
      totalCandidates = Math.min(count ?? 0, limit);

      const sliceEnd = Math.min(chunkOffset + chunkSize, totalCandidates);
      if (chunkOffset < totalCandidates) {
        const { data } = await admin
          .from('srangam_articles')
          .select('id,slug,content')
          .eq('status', 'published')
          .order('updated_at', { ascending: false })
          .range(chunkOffset, sliceEnd - 1);
        articles = (data ?? []) as any;
      }
    }

    if (totalCandidates === 0) {
      return new Response(JSON.stringify({ error: 'no articles matched' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Chunked-job cancellation check -----------------------------------
    if (body.job_id && (await isCancelled(admin, body.job_id))) {
      return new Response(JSON.stringify({
        ok: true, cancelled: true, done: true,
        next_offset: chunkOffset, total: totalCandidates,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results: any[] = [];
    let total_cost = 0;
    for (const a of articles) {
      try {
        const r = await backfillOne(admin, a, gaz as GazetteerRow[], gazIdx, skipAi);
        if (r.ai) total_cost += r.ai.cost_usd_estimate;
        results.push({ slug: a.slug, ...r });

        if (body.job_id) {
          await reportItem(admin, body.job_id, {
            ok: true,
            item: a.slug,
            cost_delta_usd: r.ai?.cost_usd_estimate ?? 0,
            tier_delta: { a: r.pins_a, b: r.pins_b, c: r.pins_c },
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[backfill-article-pins] ${a.slug} failed:`, msg);
        results.push({ slug: a.slug, error: msg });
        if (body.job_id) {
          await reportItem(admin, body.job_id, { ok: false, item: a.slug, error: msg });
        }
        // continue — never fail the whole chunk on one bad article
      }
    }

    const nextOffset = chunkOffset + articles.length;
    const done = nextOffset >= totalCandidates;

    if (body.job_id && done) {
      await finishJob(admin, body.job_id, 'succeeded');
    }

    // ---- Phase X.1: server-side self-pump for next chunk ------------------
    // Only when the job is chunked AND there is more work AND no cancel.
    if (body.job_id && !done) {
      schedulePumpReinvoke(req.url, {
        ...body,
        offset: nextOffset,
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: articles.length,
      gazetteer_size: gaz.length,
      total_cost_usd_estimate: Number(total_cost.toFixed(6)),
      results,
      total: totalCandidates,
      next_offset: nextOffset,
      done,
      pumped: !!(body.job_id && !done),
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[backfill-article-pins] fatal:', msg);
    try {
      if (body?.job_id) {
        const admin = createClient(supabaseUrl, serviceKey);
        await finishJob(admin, body.job_id, 'failed', msg);
      }
    } catch { /* swallow */ }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

