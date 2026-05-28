/**
 * Phase H.4 — Shared admin-job helpers.
 *
 * A tiny façade over `srangam_admin_jobs` so chunked workers
 * (`backfill-article-pins`, `generate-article-og`, …) can:
 *
 *   • create a job row up-front with the planned `total`;
 *   • report per-item progress (succeeded / failed / cost / last_item);
 *   • check whether the operator clicked Cancel between chunks;
 *   • mark the job terminally (succeeded / failed / cancelled).
 *
 * The browser subscribes to UPDATE events on the row via Supabase
 * Realtime — see `src/hooks/useAdminJob.ts` — so every call here
 * is automatically visible in the admin UI within a few hundred ms.
 *
 * All writes use the service-role client so RLS does not block the
 * worker, but **callers must already have validated the operator's
 * admin role** before invoking these helpers (the existing edge
 * functions all do this at the HTTP boundary).
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export type JobKind = 'pin_backfill' | 'og_generate' | 'og_force' | 'purana_extract';
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface JobRow {
  id: string;
  kind: JobKind;
  status: JobStatus;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  cost_usd: number;
  last_item: string | null;
  last_error: string | null;
  params: Record<string, unknown>;
  started_at: string | null;
  finished_at: string | null;
  created_by: string | null;
}

export function adminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key);
}

export async function createJob(
  supabase: SupabaseClient,
  args: {
    kind: JobKind;
    total: number;
    created_by?: string | null;
    params?: Record<string, unknown>;
  },
): Promise<JobRow> {
  const { data, error } = await supabase
    .from('srangam_admin_jobs')
    .insert({
      kind: args.kind,
      total: args.total,
      status: 'running',
      started_at: new Date().toISOString(),
      created_by: args.created_by ?? null,
      params: args.params ?? {},
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as JobRow;
}

export async function getJob(
  supabase: SupabaseClient,
  jobId: string,
): Promise<JobRow | null> {
  const { data } = await supabase
    .from('srangam_admin_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();
  return (data as JobRow) ?? null;
}

/**
 * Atomic per-item progress update. Increments counters via SQL math so two
 * concurrent chunks (rare, but possible) cannot clobber each other.
 */
export async function reportItem(
  supabase: SupabaseClient,
  jobId: string,
  patch: {
    ok: boolean;
    item: string;
    cost_delta_usd?: number;
    error?: string | null;
    /** Optional per-item tier deltas (Phase X.1). Accumulated into
     *  `params.tier_totals = { a, b, c }` so the progress card can
     *  surface pin confidence alongside throughput. */
    tier_delta?: { a?: number; b?: number; c?: number };
  },
): Promise<void> {
  // Re-read → patch → update. Cheap (one row, indexed PK) and correct
  // for the single-driver pattern the frontend uses.
  const current = await getJob(supabase, jobId);
  if (!current) return;

  // Accumulate tier totals in params JSONB (additive, never overwrites
  // unrelated keys callers may have set at job creation time).
  let nextParams = current.params;
  if (patch.tier_delta) {
    const prev = (current.params?.tier_totals ?? {}) as Record<string, number>;
    nextParams = {
      ...current.params,
      tier_totals: {
        a: (prev.a ?? 0) + (patch.tier_delta.a ?? 0),
        b: (prev.b ?? 0) + (patch.tier_delta.b ?? 0),
        c: (prev.c ?? 0) + (patch.tier_delta.c ?? 0),
      },
    };
  }

  const next: Partial<JobRow> & { heartbeat_at?: string; params?: Record<string, unknown> } = {
    processed: current.processed + 1,
    succeeded: current.succeeded + (patch.ok ? 1 : 0),
    failed: current.failed + (patch.ok ? 0 : 1),
    cost_usd: Number(current.cost_usd) + (patch.cost_delta_usd ?? 0),
    last_item: patch.item,
    last_error: patch.ok ? current.last_error : (patch.error ?? 'unknown error'),
    heartbeat_at: new Date().toISOString(),
    params: nextParams,
  };
  await supabase.from('srangam_admin_jobs').update(next).eq('id', jobId);
}

/** Pure heartbeat — call between long stages so the watchdog does not
 *  reap a job that is making slow but real progress on one item. */
export async function touchHeartbeat(
  supabase: SupabaseClient,
  jobId: string,
): Promise<void> {
  await supabase
    .from('srangam_admin_jobs')
    .update({ heartbeat_at: new Date().toISOString() })
    .eq('id', jobId);
}

export async function isCancelled(
  supabase: SupabaseClient,
  jobId: string,
): Promise<boolean> {
  const j = await getJob(supabase, jobId);
  return j?.status === 'cancelled';
}

export async function finishJob(
  supabase: SupabaseClient,
  jobId: string,
  status: 'succeeded' | 'failed' | 'cancelled',
  last_error?: string | null,
): Promise<void> {
  const patch: Record<string, unknown> = {
    status,
    finished_at: new Date().toISOString(),
    heartbeat_at: new Date().toISOString(),
  };
  if (last_error !== undefined) patch.last_error = last_error;
  await supabase.from('srangam_admin_jobs').update(patch).eq('id', jobId);
}

