
-- Phase X.1: heartbeat + watchdog for srangam_admin_jobs.
-- Additive only. No existing column or policy is altered.

ALTER TABLE public.srangam_admin_jobs
  ADD COLUMN IF NOT EXISTS heartbeat_at timestamptz;

-- Backfill existing running rows so the first watchdog tick does not reap them.
UPDATE public.srangam_admin_jobs
   SET heartbeat_at = COALESCE(updated_at, started_at, now())
 WHERE heartbeat_at IS NULL;

COMMENT ON COLUMN public.srangam_admin_jobs.heartbeat_at IS
  'Set by reportItem() and finishJob() in supabase/functions/_shared/jobs.ts. '
  'The reconcile_stuck_admin_jobs() watchdog flips status=running rows whose '
  'heartbeat is older than 5 minutes to status=failed.';

CREATE INDEX IF NOT EXISTS srangam_admin_jobs_running_heartbeat_idx
  ON public.srangam_admin_jobs (heartbeat_at)
  WHERE status = 'running';

-- Watchdog: SECURITY DEFINER so pg_cron (runs as postgres) can call it without
-- needing per-role grants. Returns the number of rows it reaped for log
-- visibility via pg_net response. search_path locked per project policy.
CREATE OR REPLACE FUNCTION public.reconcile_stuck_admin_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reaped integer;
BEGIN
  WITH stuck AS (
    UPDATE public.srangam_admin_jobs
       SET status = 'failed',
           last_error = COALESCE(last_error, 'watchdog: no heartbeat'),
           finished_at = now()
     WHERE status = 'running'
       AND COALESCE(heartbeat_at, started_at, created_at) < now() - interval '5 minutes'
     RETURNING id
  )
  SELECT count(*) INTO reaped FROM stuck;
  RETURN reaped;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_stuck_admin_jobs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_stuck_admin_jobs() TO service_role;
