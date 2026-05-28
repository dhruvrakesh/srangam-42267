/**
 * Phase X.5 — Puranic citation extraction with the shared admin-job substrate.
 *
 * Three call modes:
 *
 *   1. Single article (legacy, synchronous):
 *      { article_id: "<uuid>", batch_mode: false }
 *      → unchanged behaviour, returns { success, references } directly.
 *
 *   2. Batch start (user-initiated):
 *      { batch_mode: true, job_id: "<uuid>" }
 *      → caller (frontend) already inserted the row in srangam_admin_jobs;
 *        this invocation processes chunk 0 then schedules self-reinvoke
 *        for the next chunk via EdgeRuntime.waitUntil. Returns immediately.
 *
 *   3. Internal pump (server self-reinvoke):
 *      { _pump: true, job_id, offset, chunk_size }
 *      → authenticated by service-role bearer (not the user's admin JWT).
 *
 * AI provider order: Gemini (user's GEMINI_API_KEY) → OpenAI fallback,
 * via `_shared/ai-provider.ts::aiExtractCitations`. Single source of truth
 * for cost + retry semantics.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireAdmin } from '../_shared/auth-gate.ts';
import { reportItem, isCancelled, finishJob, touchHeartbeat } from '../_shared/jobs.ts';
import { aiExtractCitations, NoAIProviderError } from '../_shared/ai-provider.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PuranaReference {
  purana_name: string;
  purana_category: string;
  kanda?: string;
  adhyaya?: string;
  shloka_start?: number;
  shloka_end?: number;
  reference_text: string;
  context_snippet: string;
  claim_made: string;
  confidence_score: number;
  is_primary_source: boolean;
}

interface RequestBody {
  article_id?: string;
  batch_mode?: boolean;
  job_id?: string;
  offset?: number;
  chunk_size?: number;
  _pump?: boolean;
}

const SYSTEM_PROMPT =
  'You are a Sanskrit scholar specialized in Puranic literature citation extraction. ' +
  'Extract citations with precision and academic rigor. Return ONLY valid JSON.';

function buildUserPrompt(chunk: string): string {
  return `Analyze this text and extract ALL Puranic/Vedic/Itihasa citations with precise details.

Extract references in this JSON format:
{
  "references": [
    {
      "purana_name": "Exact name (e.g., Matsya Purana, Rigveda, Mahabharata)",
      "purana_category": "Mahapurana|Upapurana|Itihasa|Veda|Agama|Other",
      "kanda": "Book/Kanda name if mentioned",
      "adhyaya": "Chapter/Adhyaya number if mentioned",
      "shloka_start": "Starting verse number (integer only)",
      "shloka_end": "Ending verse number if range (integer only)",
      "reference_text": "Exact citation as written (e.g., '114.10-44')",
      "context_snippet": "2-3 sentences surrounding the citation",
      "claim_made": "What historical/geographical/theological claim this citation supports",
      "confidence_score": "0.00-1.00 based on citation explicitness",
      "is_primary_source": "true if citing original text, false if secondary"
    }
  ]
}

CONFIDENCE SCORING RULES:
- 1.00: Exact verse citation (e.g., "Matsya Purāṇa 114.10-44")
- 0.90: Chapter + verse range (e.g., "Rigveda 10.75.5-6")
- 0.80: Chapter only (e.g., "Mahabharata, Sabha Parva, Chapter 28")
- 0.70: Named text without specifics (e.g., "according to the Matsya Purana")
- 0.60: Vague reference (e.g., "Puranic tradition")
- 0.50: Generic mention (e.g., "ancient texts")

CATEGORY MAPPING:
- Mahapurana: 18 Mahā-Purāṇas (Matsya, Vishnu, Bhagavata, etc.)
- Upapurana: 18 Upa-Purāṇas
- Itihasa: Mahabharata, Ramayana
- Veda: Rigveda, Samaveda, Yajurveda, Atharvaveda + Brahmanas/Aranyakas
- Agama: Shaiva/Vaishnava Agamas, Tantras
- Other: Dharmashastra, Kavya, Kosha, etc.

If no references found, return {"references": []}

TEXT:
${chunk}`;
}

function extractText(article: { content: any; slug: string }): string {
  let textContent = '';
  if (typeof article.content?.en === 'string') {
    textContent = article.content.en
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  } else if (article.content?.en?.sections) {
    for (const section of article.content.en.sections) {
      if (section.heading) textContent += section.heading + '\n\n';
      if (section.content) textContent += section.content + '\n\n';
    }
  }
  return textContent;
}

interface PerArticleResult {
  extracted: number;
  high: number;
  mid: number;
  low: number;
  cost_usd: number;
}

async function processArticle(
  supabase: SupabaseClient,
  article: { id: string; slug: string; content: any },
  jobId: string | null,
): Promise<PerArticleResult> {
  const textContent = extractText(article);
  if (!textContent || textContent.length < 100) {
    console.log(`⚠️ Skipping ${article.slug} (insufficient text, ${textContent.length} chars)`);
    return { extracted: 0, high: 0, mid: 0, low: 0, cost_usd: 0 };
  }

  const paragraphs = textContent.split('\n\n').filter((p) => p.trim().length > 50);
  const extractedRefs: PuranaReference[] = [];
  let totalCost = 0;

  for (let i = 0; i < paragraphs.length; i += 3) {
    const chunk = paragraphs.slice(i, i + 3).join('\n\n');
    try {
      const result = await aiExtractCitations({
        system: SYSTEM_PROMPT,
        user: buildUserPrompt(chunk),
        timeoutMs: 30_000,
      });
      totalCost += result.cost_usd_estimate;
      const parsed = result.parsed as { references?: PuranaReference[] } | null;
      if (parsed?.references && Array.isArray(parsed.references)) {
        extractedRefs.push(...parsed.references);
      }
    } catch (e) {
      console.error(`[${article.slug}] AI chunk ${i} failed:`,
        e instanceof Error ? e.message : e);
      // continue — partial extraction is better than none
    }

    // Heartbeat between chunks so the 5-minute watchdog never reaps a
    // long article that is making real progress.
    if (jobId && i % 6 === 3) {
      await touchHeartbeat(supabase, jobId).catch(() => {});
    }
  }

  // Dedupe
  const uniqueRefs = extractedRefs.filter((ref, idx, self) =>
    idx === self.findIndex((r) =>
      r.purana_name === ref.purana_name &&
      r.reference_text === ref.reference_text &&
      r.adhyaya === ref.adhyaya,
    ),
  );

  const refsToInsert = uniqueRefs.map((ref) => ({
    article_id: article.id,
    purana_name: ref.purana_name,
    purana_category: ref.purana_category || 'Other',
    kanda: ref.kanda || null,
    adhyaya: ref.adhyaya || null,
    shloka_start: ref.shloka_start || null,
    shloka_end: ref.shloka_end || null,
    reference_text: ref.reference_text,
    context_snippet: ref.context_snippet?.substring(0, 500) || '',
    claim_made: ref.claim_made?.substring(0, 500) || '',
    confidence_score: Math.min(1.0, Math.max(0.0, ref.confidence_score || 0.5)),
    is_primary_source: ref.is_primary_source ?? true,
    extraction_method: 'ai',
    validation_status: (ref.confidence_score ?? 0) >= 0.8 ? 'verified' : 'pending',
  }));

  if (refsToInsert.length > 0) {
    const { error } = await supabase.from('srangam_purana_references').insert(refsToInsert);
    if (error) console.error(`[${article.slug}] insert error:`, error.message);
  }

  let high = 0, mid = 0, low = 0;
  for (const r of uniqueRefs) {
    const s = r.confidence_score ?? 0;
    if (s >= 0.80) high++;
    else if (s >= 0.60) mid++;
    else low++;
  }

  console.log(`✓ ${article.slug}: ${uniqueRefs.length} refs (H:${high} M:${mid} L:${low}) cost=$${totalCost.toFixed(4)}`);
  return { extracted: uniqueRefs.length, high, mid, low, cost_usd: totalCost };
}

// ---------- Phase X.5: self-pump helper ----------
function schedulePumpReinvoke(selfUrl: string, body: RequestBody) {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) {
    console.error('[extract-purana-references] pump: missing SERVICE_ROLE_KEY');
    return;
  }
  // @ts-ignore — EdgeRuntime is provided by Supabase Edge Runtime
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
      console.error('[extract-purana-references] pump reinvoke failed:', r.status, await r.text());
    }
  }).catch((e) => {
    console.error('[extract-purana-references] pump reinvoke error:', e?.message ?? e);
  });
  if (typeof waitUntil === 'function') waitUntil(fetchP);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const body = (await req.clone().json().catch(() => ({}))) as RequestBody;

  // ---- Auth gate -------------------------------------------------------
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

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // ---- Single-article (synchronous, legacy) ------------------------
    if (!body.batch_mode && !body.job_id && body.article_id) {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, content, title')
        .eq('id', body.article_id)
        .single();
      if (error) throw error;
      const result = await processArticle(supabase, data as any, null);
      return new Response(JSON.stringify({
        success: true,
        processed_articles: 1,
        total_references: result.extracted,
        results: [{ article_id: data.id, article_slug: data.slug, ...result }],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ---- Batch / pump path -------------------------------------------
    if (!body.job_id) {
      return new Response(JSON.stringify({ error: 'batch_mode requires job_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cancellation check between chunks
    if (await isCancelled(supabase, body.job_id)) {
      return new Response(JSON.stringify({ ok: true, cancelled: true, done: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chunkOffset = body.offset ?? 0;
    const chunkSize = Math.min(Math.max(body.chunk_size ?? 3, 1), 5);

    // Count once (cheap with count: 'exact', head: true)
    const { count } = await supabase
      .from('srangam_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');
    const total = count ?? 0;

    const sliceEnd = Math.min(chunkOffset + chunkSize, total);
    let articles: any[] = [];
    if (chunkOffset < total) {
      const { data } = await supabase
        .from('srangam_articles')
        .select('id, slug, content, title')
        .eq('status', 'published')
        .order('slug', { ascending: true })
        .range(chunkOffset, sliceEnd - 1);
      articles = data ?? [];
    }

    for (const article of articles) {
      try {
        const r = await processArticle(supabase, article, body.job_id);
        await reportItem(supabase, body.job_id, {
          ok: true,
          item: article.slug,
          cost_delta_usd: r.cost_usd,
          tier_delta: { a: r.high, b: r.mid, c: r.low },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[purana_extract] ${article.slug} failed:`, msg);
        await reportItem(supabase, body.job_id, {
          ok: false, item: article.slug, error: msg,
        });
      }
    }

    const nextOffset = chunkOffset + articles.length;
    const done = nextOffset >= total;

    if (done) {
      await finishJob(supabase, body.job_id, 'succeeded');
    } else {
      // Phase X.5.1 — build pump target from env (req.url is internal → 404s).
      const pumpUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-purana-references`;
      console.log(`[extract-purana-references] pump target=${pumpUrl} next_offset=${nextOffset}`);
      schedulePumpReinvoke(pumpUrl, {
        batch_mode: true,
        job_id: body.job_id,
        offset: nextOffset,
        chunk_size: chunkSize,
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: articles.length,
      total,
      next_offset: nextOffset,
      done,
      pumped: !done,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[extract-purana-references] fatal:', msg);
    try {
      if (body?.job_id) await finishJob(supabase, body.job_id, 'failed', msg);
    } catch { /* swallow */ }
    if (error instanceof NoAIProviderError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.',
      }), { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
