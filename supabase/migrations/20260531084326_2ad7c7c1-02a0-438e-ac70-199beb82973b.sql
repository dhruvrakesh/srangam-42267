-- Phase 4: nightly OG image sweep. Targets oldest published article with no og_image_url.
SELECT cron.schedule(
  'srangam-og-nightly',
  '30 3 * * *',
  $cmd$ SELECT public._cron_invoke_edge('generate-article-og', '{"nightly":true,"limit":1}'::jsonb); $cmd$
);

-- Phase 5: nightly cultural term enrichment (slug list resolved inside the function).
SELECT cron.schedule(
  'srangam-term-enrichment-nightly',
  '45 3 * * *',
  $cmd$ SELECT public._cron_invoke_edge('batch-enrich-terms', '{"articleSlugs":[]}'::jsonb); $cmd$
);

-- Phase 7-FIX: nightly CX.3 context snapshot to Google Drive.
SELECT cron.schedule(
  'srangam-context-snapshot-nightly',
  '0 4 * * *',
  $cmd$ SELECT public._cron_invoke_edge('context-save-drive', '{}'::jsonb); $cmd$
);