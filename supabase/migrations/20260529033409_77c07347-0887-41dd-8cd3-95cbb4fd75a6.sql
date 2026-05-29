-- Phase Z.2 — automated pin enrichment scaffolding
-- Creates a SECURITY DEFINER RPC that queues a "zero-pin sweep" job row.
-- The actual cron schedule + net.http_post lives in user-scoped SQL (not in
-- this migration) because it contains the project URL + anon key.

CREATE OR REPLACE FUNCTION public.enqueue_pin_backfill_sweep_job(
  p_limit int DEFAULT 20,
  p_chunk int DEFAULT 3
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_job_id     uuid;
  v_zero_count int;
  v_running    int;
BEGIN
  -- Re-entrancy guard: skip if a fresh sweep is already running.
  SELECT count(*) INTO v_running
    FROM srangam_admin_jobs
   WHERE kind = 'pin_backfill'
     AND status = 'running'
     AND started_at > now() - interval '30 minutes';
  IF v_running > 0 THEN
    RETURN NULL;
  END IF;

  -- Skip if there is nothing to do.
  SELECT count(*) INTO v_zero_count
    FROM srangam_articles a
   WHERE a.status = 'published'
     AND NOT EXISTS (
       SELECT 1 FROM srangam_article_pins p WHERE p.article_id = a.id
     );
  IF v_zero_count = 0 THEN
    RETURN NULL;
  END IF;

  INSERT INTO srangam_admin_jobs (kind, status, total, started_at, params)
  VALUES (
    'pin_backfill',
    'running',
    LEAST(v_zero_count, p_limit),
    now(),
    jsonb_build_object(
      'all_published', true,
      'only_zero_pin', true,
      'limit',        p_limit,
      'chunk_size',   p_chunk,
      'scheduled',    true
    )
  )
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- Lock down execution: only service_role (used by the cron-invoked edge
-- function caller) needs to run this. No anon/authenticated access.
REVOKE ALL ON FUNCTION public.enqueue_pin_backfill_sweep_job(int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enqueue_pin_backfill_sweep_job(int, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_pin_backfill_sweep_job(int, int) TO service_role;