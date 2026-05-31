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
import { reportItem, isCancelled, finishJob, touchHeartbeat } from '../_shared/jobs.ts';
import { serializeErr } from '../_shared/errors.ts';

import { requireAdminOrCron } from '../_shared/auth-gate.ts';
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
  /** Phase Z.3 — only target published articles that currently have ZERO pins.
   *  Used by the nightly pg_cron sweep so manual bulk-runs keep current behaviour. */
  only_zero_pin?: boolean;

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

/**
 * Phase 7 — Persist AI-extracted place names that did NOT resolve to any
 * existing gazetteer row. Admin-curated promotion happens elsewhere. We
 * upsert by `normalized_name`, bumping `occurrences` and appending the
 * article_id to `source_articles` on conflict. Best-effort: failures here
 * never block pin writes.
 */
async function recordGazetteerCandidates(
  supabase: ReturnType<typeof createClient>,
  articleId: string,
  rawNames: string[],
  provider: string,
  model: string,
): Promise<void> {
  // Dedupe within this run; cap to avoid pathological prompt output.
  const seen = new Map<string, string>();
  for (const raw of rawNames) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const norm = trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!seen.has(norm)) seen.set(norm, trimmed);
    if (seen.size >= 40) break;
  }
  if (seen.size === 0) return;

  for (const [norm, raw] of seen) {
    // Try update first (cheap path for frequent candidates).
    const { data: existing } = await supabase
      .from('srangam_gazetteer_candidates')
      .select('id, source_articles, occurrences')
      .eq('normalized_name', norm)
      .maybeSingle();

    if (existing) {
      const articles = Array.isArray(existing.source_articles) ? existing.source_articles as string[] : [];
      const nextArticles = articles.includes(articleId) ? articles : [...articles, articleId];
      await supabase
        .from('srangam_gazetteer_candidates')
        .update({
          occurrences: (existing.occurrences ?? 0) + 1,
          source_articles: nextArticles,
          last_seen_at: new Date().toISOString(),
          ai_provider: provider,
          ai_model: model,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('srangam_gazetteer_candidates')
        .insert({
          normalized_name: norm,
          raw_name: raw,
          first_seen_article_id: articleId,
          source_articles: [articleId],
          ai_provider: provider,
          ai_model: model,
        });
    }
  }
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
  jobId?: string,
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
    // Phase G1 — heartbeat-during-AI: tick every 25s while the AI promise is
    // pending so the watchdog does not reap a job that is making real progress
    // on a single long article. Cleared on settle in finally block.
    let hbTimer: number | undefined;
    if (jobId) {
      try { await touchHeartbeat(supabase, jobId); } catch { /* noop */ }
      hbTimer = setInterval(() => {
        touchHeartbeat(supabase, jobId).catch(() => { /* noop */ });
      }, 25_000) as unknown as number;
    }
    try {
      await stage('pin_ai', { article_id: article.id }, async () => {
        // Phase G1 — bound AI input to keep one article from consuming the
        // entire pump slot. Deterministic scan already used the full text.
        const aiInput = flat.length > 25_000 ? flat.slice(0, 25_000) : flat;
        const result = await aiExtractPlaces(aiInput);
        aiStats = {
          provider: result.provider,
          model: result.model,
          prompt_tokens: result.prompt_tokens,
          completion_tokens: result.completion_tokens,
          latency_ms: result.latency_ms,
          cost_usd_estimate: Number(result.cost_usd_estimate.toFixed(6)),
        };
        const unresolved: string[] = [];
        for (const p of result.places) {
          const id = matchAiName(p.name, gazIdx.index);
          if (id) {
            if (!pinMap.has(id)) pinMap.set(id, 'C');
          } else if (p.name && p.name.trim().length >= 2) {
            unresolved.push(p.name.trim());
          }
        }
        // Phase 7 — Gazetteer candidate funnel: persist unresolved AI place
        // names for admin review (Loop A). Never auto-promotes; only enqueues.
        if (unresolved.length > 0) {
          try {
            await recordGazetteerCandidates(
              supabase,
              article.id,
              unresolved,
              result.provider,
              result.model,
            );
          } catch (e) {
            console.log(JSON.stringify({
              evt: 'pin_stage', stage: 'pin_candidates', ok: false,
              article_id: article.id, error: serializeErr(e), ts: new Date().toISOString(),
            }));
          }
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
    } finally {
      if (hbTimer !== undefined) clearInterval(hbTimer);
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
      source: confidence === 'A' ? 'evidence_table' : confidence === 'B' ? 'content_scan' : 'ai_extract',
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
    const gate = await requireAdminOrCron(req, body as unknown as Record<string, unknown>);
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
    // Phase G1 — when AI is on, force chunk_size=1 so a single long AI call
    // cannot starve the chunk budget. Deterministic-only runs may stay at 3.
    const requestedChunk = Math.min(Math.max(body.chunk_size ?? 5, 1), 10);
    const chunkSize = body.skip_ai === true ? requestedChunk : 1;

    if (body.article_id) {
      const { data } = await admin
        .from('srangam_articles')
        .select('id,slug,content')
        .eq('id', body.article_id)
        .maybeSingle();
      if (data) articles = [data as any];
      totalCandidates = articles.length;
    } else if (body.slug) {
      // Phase G1 — fix latent bug: previous code never awaited or assigned
      // the result of the .or() query, so slug-mode always returned 404.
      const { data } = await admin
        .from('srangam_articles')
        .select('id,slug,content')
        .or(`slug.eq.${body.slug},slug_alias.eq.${body.slug}`)
        .limit(1);
      if (data && data.length > 0) articles = [data[0] as any];
      totalCandidates = articles.length;
    } else if (body.all_published) {
      const limit = Math.min(Math.max(body.limit ?? 25, 1), 200);

      // Phase Z.3 — when `only_zero_pin` is set, restrict to published articles
      // that currently have NO pins. Implemented as a two-step query to avoid
      // PostgREST limitations on NOT-EXISTS joins.
      let zeroPinIds: string[] | null = null;
      if (body.only_zero_pin) {
        const { data: pinned } = await admin
          .from('srangam_article_pins')
          .select('article_id');
        const pinnedSet = new Set((pinned ?? []).map((r: any) => r.article_id));
        const { data: pubIds } = await admin
          .from('srangam_articles')
          .select('id')
          .eq('status', 'published');
        zeroPinIds = (pubIds ?? [])
          .map((r: any) => r.id)
          .filter((id: string) => !pinnedSet.has(id));
        totalCandidates = Math.min(zeroPinIds.length, limit);
      } else {
        const { count } = await admin
          .from('srangam_articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published');
        totalCandidates = Math.min(count ?? 0, limit);
      }

      const sliceEnd = Math.min(chunkOffset + chunkSize, totalCandidates);
      if (chunkOffset < totalCandidates) {
        let query = admin
          .from('srangam_articles')
          .select('id,slug,content')
          .eq('status', 'published');
        if (zeroPinIds) {
          const slice = zeroPinIds.slice(chunkOffset, sliceEnd);
          query = query.in('id', slice);
        } else {
          query = query.order('updated_at', { ascending: false }).range(chunkOffset, sliceEnd - 1);
        }
        const { data } = await query;
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

    // Phase G1 — patch job.total on the first chunk so the admin UI reflects
    // the worker's actual candidate count, not the user's optimistic `limit`.
    if (body.job_id && chunkOffset === 0) {
      try {
        await admin.from('srangam_admin_jobs')
          .update({ total: totalCandidates, heartbeat_at: new Date().toISOString() })
          .eq('id', body.job_id);
      } catch (e) {
        console.error('[backfill-article-pins] failed to patch job total:', e);
      }
    }

    // Phase G1 — extract chunk processing so it can run either inline (single
    // article / unchunked) or in EdgeRuntime.waitUntil (chunked job mode).
    const processChunk = async (): Promise<{ processed: number; total_cost: number; results: any[] }> => {
      const results: any[] = [];
      let total_cost = 0;
      for (const a of articles) {
        // Phase G1 — re-check cancellation between articles so a Cancel click
        // takes effect within one article instead of one full chunk.
        if (body.job_id && (await isCancelled(admin, body.job_id))) {
          console.log(`[backfill-article-pins] cancelled mid-chunk before ${a.slug}`);
          return { processed: results.length, total_cost, results };
        }
        try {
          const r = await backfillOne(admin, a, gaz as GazetteerRow[], gazIdx, skipAi, body.job_id);
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
          const msg = serializeErr(e);
          console.error(`[backfill-article-pins] ${a.slug} failed:`, msg);
          results.push({ slug: a.slug, error: msg });
          if (body.job_id) {
            await reportItem(admin, body.job_id, { ok: false, item: a.slug, error: msg });
          }
          // continue — never fail the whole chunk on one bad article
        }
      }
      return { processed: results.length, total_cost, results };
    };

    // ---- Phase G1: true async pump for chunked jobs ------------------------
    // When a job_id is present, return 202 Accepted immediately and run the
    // chunk + pump in the background via EdgeRuntime.waitUntil. This removes
    // the 504 IDLE_TIMEOUT failure mode that fires when one article's AI call
    // exceeds the outer 150s HTTP wall-clock.
    if (body.job_id) {
      const waitUntil = (globalThis as any).EdgeRuntime?.waitUntil;
      const work = (async () => {
        try {
          const { processed } = await processChunk();
          const nextOffset = chunkOffset + processed;
          const done = nextOffset >= totalCandidates;
          if (done) {
            await finishJob(admin, body.job_id!, 'succeeded');
          } else {
            const pumpUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/backfill-article-pins`;
            console.log(`[backfill-article-pins] pump target=${pumpUrl} next_offset=${nextOffset}`);
            schedulePumpReinvoke(pumpUrl, { ...body, offset: nextOffset });
          }
        } catch (e) {
          const msg = serializeErr(e);
          console.error('[backfill-article-pins] background chunk failed:', msg);
          try { await finishJob(admin, body.job_id!, 'failed', msg); } catch { /* noop */ }
        }
      })();
      if (typeof waitUntil === 'function') waitUntil(work);
      else work.catch(() => { /* noop */ });

      return new Response(JSON.stringify({
        ok: true,
        accepted: true,
        chunk_offset: chunkOffset,
        chunk_size: articles.length,
        total: totalCandidates,
      }), {
        status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Unchunked path (single article / slug / one-off) ------------------
    const { processed, total_cost, results } = await processChunk();
    const nextOffset = chunkOffset + processed;
    const done = nextOffset >= totalCandidates;

    return new Response(JSON.stringify({
      ok: true,
      processed,
      gazetteer_size: gaz.length,
      total_cost_usd_estimate: Number(total_cost.toFixed(6)),
      results,
      total: totalCandidates,
      next_offset: nextOffset,
      done,
      pumped: false,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = serializeErr(e);
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

