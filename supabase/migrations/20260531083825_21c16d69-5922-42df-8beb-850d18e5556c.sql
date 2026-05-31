CREATE OR REPLACE FUNCTION public._cron_invoke_edge(_function_slug text, _body jsonb DEFAULT NULL)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $fn$
DECLARE
  v_cron_secret text;
  v_url         text := 'https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/' || _function_slug;
  v_req_id      bigint;
BEGIN
  SELECT decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1;
  IF v_cron_secret IS NULL THEN
    RAISE EXCEPTION '_cron_invoke_edge: CRON_SECRET not in vault';
  END IF;

  -- Notes:
  -- Target edge functions MUST have verify_jwt = false in supabase/config.toml.
  -- We intentionally OMIT apikey/Authorization headers: the gateway's stricter
  -- validator (post signing-keys migration) rejects legacy anon JWTs from
  -- server-to-server callers. verify_jwt=false lets the gateway accept the
  -- call unauthenticated; real authorization happens inside the function via
  -- requireAdminOrCron(): x-cron-secret + body._cron=true.
  SELECT net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'x-cron-secret', v_cron_secret
               ),
    body    := COALESCE(_body, '{}'::jsonb) || jsonb_build_object('_cron', true)
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public._cron_invoke_edge(text, jsonb) FROM PUBLIC;

-- Re-arm the smoke job.
SELECT cron.schedule(
  'pin-cron-smoke-3',
  '* * * * *',
  $cmd$
    SELECT public._cron_invoke_edge('backfill-article-pins', '{"chunk_size":1,"only_zero_pin":true,"limit":1}'::jsonb);
    SELECT cron.unschedule('pin-cron-smoke-3');
  $cmd$
);