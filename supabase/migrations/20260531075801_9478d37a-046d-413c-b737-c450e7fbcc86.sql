
-- Phase Z2.1 — Cron-auth dispatch helper
-- A SECURITY DEFINER function that reads service-role + cron secret from
-- vault.decrypted_secrets and POSTs to an edge function with the cron
-- triple (Authorization bearer + x-cron-secret header + body._cron flag).
-- Used by every nightly cron entry so credentials never appear in cron.job text.

CREATE OR REPLACE FUNCTION public._cron_invoke_edge(
  _function_name text,
  _body jsonb
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_service_key text;
  v_cron_secret text;
  v_url text;
  v_request_id bigint;
BEGIN
  SELECT decrypted_secret INTO v_service_key
    FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
  SELECT decrypted_secret INTO v_cron_secret
    FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET';

  IF v_service_key IS NULL OR v_cron_secret IS NULL THEN
    RAISE EXCEPTION '_cron_invoke_edge: missing SUPABASE_SERVICE_ROLE_KEY or CRON_SECRET in vault.secrets';
  END IF;

  v_url := 'https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/' || _function_name;

  SELECT net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'Authorization',   'Bearer ' || v_service_key,
      'x-cron-secret',   v_cron_secret
    ),
    body    := _body || jsonb_build_object('_cron', true)
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public._cron_invoke_edge(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._cron_invoke_edge(text, jsonb) TO postgres, service_role;
