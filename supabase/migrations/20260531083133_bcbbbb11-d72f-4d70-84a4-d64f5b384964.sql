DO $preflight$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET') THEN
    RAISE EXCEPTION 'Phase 1-FIX preflight failed: CRON_SECRET missing from vault.';
  END IF;
END
$preflight$;

DROP FUNCTION IF EXISTS public._cron_invoke_edge(text, jsonb);

CREATE FUNCTION public._cron_invoke_edge(_function_slug text, _body jsonb DEFAULT NULL)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $fn$
DECLARE
  v_cron_secret text;
  v_anon_jwt    text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYWl6ZmpjcGtqY3FieW9iY3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY3NDAsImV4cCI6MjA3NzE1Mjc0MH0.9qMkzlS7JzE5nKAbUUjfFotDlWszyZh_27QdlkX8AS4';
  v_url         text := 'https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/' || _function_slug;
  v_req_id      bigint;
BEGIN
  SELECT decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1;
  IF v_cron_secret IS NULL THEN
    RAISE EXCEPTION '_cron_invoke_edge: CRON_SECRET not in vault';
  END IF;

  SELECT net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',   'application/json',
                 'apikey',         v_anon_jwt,
                 'Authorization',  'Bearer ' || v_anon_jwt,
                 'x-cron-secret',  v_cron_secret
               ),
    body    := COALESCE(_body, '{}'::jsonb) || jsonb_build_object('_cron', true)
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public._cron_invoke_edge(text, jsonb) FROM PUBLIC;

DO $rewire$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'srangam-pin-enrichment-nightly' LIMIT 1;
  IF v_jobid IS NULL THEN
    PERFORM cron.schedule(
      'srangam-pin-enrichment-nightly',
      '0 3 * * *',
      $cmd$ SELECT public._cron_invoke_edge('backfill-article-pins', '{"chunk_size":1,"only_zero_pin":true,"limit":20}'::jsonb); $cmd$
    );
  ELSE
    PERFORM cron.alter_job(
      job_id   := v_jobid,
      schedule := '0 3 * * *',
      command  := $cmd$ SELECT public._cron_invoke_edge('backfill-article-pins', '{"chunk_size":1,"only_zero_pin":true,"limit":20}'::jsonb); $cmd$
    );
  END IF;
END
$rewire$;

SELECT cron.schedule(
  'pin-cron-smoke-once',
  '* * * * *',
  $cmd$
    SELECT public._cron_invoke_edge('backfill-article-pins', '{"chunk_size":1,"only_zero_pin":true,"limit":1}'::jsonb);
    SELECT cron.unschedule('pin-cron-smoke-once');
  $cmd$
);