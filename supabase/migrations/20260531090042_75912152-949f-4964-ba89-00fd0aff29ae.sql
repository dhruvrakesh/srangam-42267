-- Phase H1 verification: one-shot canary call to cron-self-test through the
-- production _cron_invoke_edge helper (same path nightly crons use).
-- Idempotent; no schema change.
DO $$
DECLARE v_req bigint;
BEGIN
  SELECT public._cron_invoke_edge('cron-self-test', '{"probe":true}'::jsonb) INTO v_req;
  RAISE NOTICE 'cron-self-test dispatched, request_id=%', v_req;
END $$;