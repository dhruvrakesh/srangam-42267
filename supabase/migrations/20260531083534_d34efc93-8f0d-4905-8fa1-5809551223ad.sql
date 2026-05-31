SELECT cron.schedule(
  'pin-cron-smoke-2',
  '* * * * *',
  $cmd$
    SELECT public._cron_invoke_edge('backfill-article-pins', '{"chunk_size":1,"only_zero_pin":true,"limit":1}'::jsonb);
    SELECT cron.unschedule('pin-cron-smoke-2');
  $cmd$
);