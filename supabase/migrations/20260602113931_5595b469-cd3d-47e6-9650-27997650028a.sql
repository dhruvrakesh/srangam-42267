CREATE OR REPLACE FUNCTION public._cron_invoke_edge(_function_slug text, _body jsonb DEFAULT NULL::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'vault'
AS $function$
DECLARE
  v_cron_secret text;
  v_anon_key    text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYWl6ZmpjcGtqY3FieW9iY3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY3NDAsImV4cCI6MjA3NzE1Mjc0MH0.9qMkzlS7JzE5nKAbUUjfFotDlWszyZh_27QdlkX8AS4';
  v_url         text := 'https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/' || _function_slug;
  v_req_id      bigint;
BEGIN
  SELECT decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1;
  IF v_cron_secret IS NULL THEN
    RAISE EXCEPTION '_cron_invoke_edge: CRON_SECRET not in vault';
  END IF;

  -- Phase H (2026-06-02): pg_net defaults to a 5s timeout which silently truncated
  -- every nightly edge call. Cron-fired helpers MUST allow up to 120s for AI-backed
  -- functions to respond (they self-pump via EdgeRuntime.waitUntil after returning
  -- 202 within seconds, but the initial response itself can take 10-60s).
  SELECT net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'apikey',        v_anon_key,
                 'Authorization', 'Bearer ' || v_anon_key,
                 'x-cron-secret', v_cron_secret
               ),
    body    := COALESCE(_body, '{}'::jsonb) || jsonb_build_object('_cron', true),
    timeout_milliseconds := 120000
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$function$;

-- Phase H step 2: restore documented helper path for nightly pin enrichment so the
-- 30-min re-entrancy guard, zero-candidate skip, and synchronous admin-job row all
-- fire. The previous command bypassed enqueue_pin_backfill_sweep_job and the
-- watchdog reaped two consecutive nights as "no heartbeat".
SELECT cron.alter_job(
  job_id  := 2,
  command := $$ SELECT public.enqueue_pin_backfill_sweep_job(20, 1); $$
);