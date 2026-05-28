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

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminJobRow {
  id: string;
  kind: 'pin_backfill' | 'og_generate' | 'og_force' | 'purana_extract';
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


const RECENT_CAP = 8;
const STALL_MS = 90_000;

export function useAdminJob(jobId: string | null) {
  const [job, setJob] = useState<AdminJobRow | null>(null);
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const lastItemRef = useRef<string | null>(null);

  // Heartbeat tick — re-evaluates `stalled` every 5s without DB chatter.
  useEffect(() => {
    if (!jobId) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 5_000);
    return () => window.clearInterval(id);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setRecentItems([]);
      lastItemRef.current = null;
      return;
    }
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('srangam_admin_jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      if (!cancelled && data) {
        setJob(data as AdminJobRow);
        if ((data as AdminJobRow).last_item) {
          lastItemRef.current = (data as AdminJobRow).last_item;
          setRecentItems([(data as AdminJobRow).last_item as string]);
        }
      }
    })();

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
        (payload) => {
          const next = payload.new as AdminJobRow;
          setJob(next);
          if (next.last_item && next.last_item !== lastItemRef.current) {
            lastItemRef.current = next.last_item;
            setRecentItems((prev) => {
              const merged = [next.last_item as string, ...prev];
              return merged.slice(0, RECENT_CAP);
            });
          }
        },
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

  /** Phase X.5.1 — true when the row is still `running` but no heartbeat
   *  has landed for STALL_MS. Watchdog reaps at 5 min; we surface a
   *  yellow banner well before that so operators aren't left guessing. */
  const stalled = useMemo(() => {
    if (!job || job.status !== 'running') return false;
    const beat = job.heartbeat_at ?? job.started_at;
    if (!beat) return false;
    return nowTick - new Date(beat).getTime() > STALL_MS;
  }, [job, nowTick]);

  async function cancel() {
    if (!jobId || !job || job.status !== 'running') return;
    await supabase
      .from('srangam_admin_jobs')
      .update({ status: 'cancelled', finished_at: new Date().toISOString() })
      .eq('id', jobId);
  }

  return { job, progress, etaMs, cancel, recentItems, stalled };
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
