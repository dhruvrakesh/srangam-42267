/**
 * Phase H.4 — Live admin-job subscription hook.
 *
 * Subscribes to a single row in `srangam_admin_jobs` via Supabase
 * Realtime so the admin UI sees per-item progress (succeeded / failed
 * / cost / last_item) within a few hundred ms — no polling, no
 * hanging fetch, no 150 s ceiling on the visible work.
 *
 * Usage:
 *   const { job, progress, etaMs, cancel } = useAdminJob(jobId);
 *
 * Lifecycle:
 *   • If `jobId` is null, the hook is inert (returns nulls).
 *   • Always fetches the row once on mount (so we have an initial
 *     snapshot even if the first UPDATE happened before subscribe).
 *   • Tears the channel down on unmount or when `jobId` changes.
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminJobRow {
  id: string;
  kind: 'pin_backfill' | 'og_generate' | 'og_force';
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  cost_usd: number;
  last_item: string | null;
  last_error: string | null;
  started_at: string | null;
  finished_at: string | null;
  /** Phase X.1 — watchdog freshness marker. */
  heartbeat_at?: string | null;
  /** Phase X.1 — JSONB bag including `tier_totals: {a,b,c}` and other
   *  job-specific accumulators reported by the worker. */
  params?: { tier_totals?: { a?: number; b?: number; c?: number } } & Record<string, unknown>;
}


export function useAdminJob(jobId: string | null) {
  const [job, setJob] = useState<AdminJobRow | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }
    let cancelled = false;

    // 1. Initial snapshot.
    (async () => {
      const { data } = await supabase
        .from('srangam_admin_jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      if (!cancelled && data) setJob(data as AdminJobRow);
    })();

    // 2. Realtime UPDATE subscription scoped to this row.
    const channel = supabase
      .channel(`admin-job:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'srangam_admin_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => setJob(payload.new as AdminJobRow),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const progress = useMemo(() => {
    if (!job || job.total === 0) return 0;
    return Math.min(100, Math.round((job.processed / job.total) * 100));
  }, [job]);

  const etaMs = useMemo(() => {
    if (!job || !job.started_at || job.processed === 0 || job.status !== 'running') {
      return null;
    }
    const elapsed = Date.now() - new Date(job.started_at).getTime();
    const remaining = job.total - job.processed;
    if (remaining <= 0) return 0;
    return Math.round((elapsed / job.processed) * remaining);
  }, [job]);

  async function cancel() {
    if (!jobId || !job || job.status !== 'running') return;
    await supabase
      .from('srangam_admin_jobs')
      .update({ status: 'cancelled', finished_at: new Date().toISOString() })
      .eq('id', jobId);
  }

  return { job, progress, etaMs, cancel };
}

export function formatEta(ms: number | null): string {
  if (ms === null) return '—';
  if (ms <= 0) return 'finishing…';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m ${r}s`;
}
