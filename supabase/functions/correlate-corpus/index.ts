/**
 * Phase X.7.4 — Materialise corpus correlations into a snapshot row-set.
 *
 * Triggered by:
 *   • the nightly pg_cron schedule (service-role bearer), or
 *   • an admin clicking "Recompute now" in the admin UI.
 *
 * Runs get_corpus_correlations_v2 with the supplied (or default) weights,
 * inserts every row into srangam_corpus_correlations_snapshot under a fresh
 * job_id, and updates the srangam_admin_jobs row so JobProgressCard sees
 * normal progress. One job = one snapshot.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { requireAdmin } from '../_shared/auth-gate.ts';
import { createJob, finishJob } from '../_shared/jobs.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  min_shared?: number;
  limit_rows?: number;
  w_place?: number;
  w_purana?: number;
  w_term?: number;
  w_tag?: number;
  w_biblio?: number;
}

const DEFAULTS = {
  min_shared: 1,
  limit_rows: 1000,
  w_place: 0.25,
  w_purana: 0.30,
  w_term: 0.20,
  w_tag: 0.10,
  w_biblio: 0.15,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const body = (await req.clone().json().catch(() => ({}))) as RequestBody;

  // Auth: either service-role (cron) or an admin operator.
  const auth = req.headers.get('Authorization') ?? '';
  const isServiceRole = auth === `Bearer ${serviceKey}`;
  let createdBy: string | null = null;
  if (!isServiceRole) {
    const gate = await requireAdmin(req);
    if (gate.error) return gate.error;
    createdBy = gate.userId ?? null;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const opts = { ...DEFAULTS, ...body };

  let jobId: string | null = null;
  try {
    const job = await createJob(supabase, {
      kind: 'corpus_correlate',
      total: 1,
      created_by: createdBy,
      params: { weights: opts, source: isServiceRole ? 'cron' : 'manual' },
    });
    jobId = job.id;

    const { data, error } = await supabase.rpc('get_corpus_correlations_v2' as any, {
      min_shared: opts.min_shared,
      limit_rows: opts.limit_rows,
      w_place: opts.w_place,
      w_purana: opts.w_purana,
      w_term: opts.w_term,
      w_tag: opts.w_tag,
      w_biblio: opts.w_biblio,
    } as any);
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      article_a: string; article_b: string;
      shared_places: number; shared_puranas: number;
      shared_terms: number; shared_tags: number; shared_biblio: number;
      shared_total: number; jaccard: number;
    }>;

    const weightsJson = {
      w_place: opts.w_place, w_purana: opts.w_purana, w_term: opts.w_term,
      w_tag: opts.w_tag, w_biblio: opts.w_biblio,
    };

    const computedAt = new Date().toISOString();
    const inserts = rows.map((r) => ({
      job_id: jobId,
      computed_at: computedAt,
      article_a: r.article_a,
      article_b: r.article_b,
      shared_places: r.shared_places,
      shared_puranas: r.shared_puranas,
      shared_terms: r.shared_terms,
      shared_tags: r.shared_tags,
      shared_biblio: r.shared_biblio,
      shared_total: r.shared_total,
      jaccard: r.jaccard,
      weights: weightsJson,
    }));

    // Chunked insert: 500 rows per batch keeps the request payload friendly.
    for (let i = 0; i < inserts.length; i += 500) {
      const slice = inserts.slice(i, i + 500);
      const { error: insErr } = await supabase
        .from('srangam_corpus_correlations_snapshot' as any)
        .insert(slice);
      if (insErr) throw insErr;
    }

    // Mark job done with totals reflecting the snapshot size.
    await supabase
      .from('srangam_admin_jobs')
      .update({
        total: rows.length,
        processed: rows.length,
        succeeded: rows.length,
        last_item: `${rows.length} pairs @ ${computedAt}`,
        heartbeat_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    await finishJob(supabase, jobId, 'succeeded');

    return new Response(JSON.stringify({
      ok: true, job_id: jobId, rows: rows.length, computed_at: computedAt,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[correlate-corpus] fatal:', msg);
    if (jobId) {
      try { await finishJob(supabase, jobId, 'failed', msg); } catch { /* swallow */ }
    }
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
