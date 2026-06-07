-- Phase H.2 (2026-06-06): enqueue_pin_backfill_sweep_job was inserting an
-- admin_jobs row but never invoking the edge function — every nightly run was
-- reaped by the 5-min watchdog ("watchdog: no heartbeat"). Mirror its sibling
-- enqueuers (og_nightly, term_enrichment_nightly) by calling _cron_invoke_edge
-- with the correct payload for backfill-article-pins before returning.

CREATE OR REPLACE FUNCTION public.enqueue_pin_backfill_sweep_job(
  p_limit integer DEFAULT 20,
  p_chunk integer DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_job_id     uuid;
  v_zero_count int;
  v_running    int;
  v_req_id     bigint;
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

  INSERT INTO srangam_admin_jobs (kind, status, total, started_at, heartbeat_at, params)
  VALUES (
    'pin_backfill',
    'running',
    LEAST(v_zero_count, p_limit),
    now(),
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

  -- Phase H.2: actually invoke the edge function (the missing piece).
  -- backfill-article-pins runs chunks in EdgeRuntime.waitUntil and returns
  -- 202 immediately; the 120s pg_net timeout from Phase H is plenty for the
  -- initial ack. AI mode forces chunk_size=1 inside the function (Phase G1).
  v_req_id := public._cron_invoke_edge(
    'backfill-article-pins',
    jsonb_build_object(
      'job_id',        v_job_id::text,
      'only_zero_pin', true,
      'chunk_size',    p_chunk,
      'limit',         p_limit,
      'source',        'nightly_cron'
    )
  );

  RETURN v_job_id;
END;
$function$;

-- Lock down (re-assert revokes — CREATE OR REPLACE preserves grants but be explicit).
REVOKE ALL ON FUNCTION public.enqueue_pin_backfill_sweep_job(integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enqueue_pin_backfill_sweep_job(integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.enqueue_pin_backfill_sweep_job(integer, integer) FROM authenticated;