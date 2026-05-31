DO $$
DECLARE v_req bigint;
BEGIN
  SELECT public._cron_invoke_edge('backfill-article-pins',
    '{"only_zero_pin":true,"limit":1,"chunk_size":1}'::jsonb) INTO v_req;
  RAISE NOTICE 'pin canary dispatched, request_id=%', v_req;
END $$;