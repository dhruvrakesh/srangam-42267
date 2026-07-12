## Redeploy all edge functions

Redeploy every function under `supabase/functions/` to bring the runtime in sync with the current source (post Phase S.2 healing).

### Functions (29)
analyze-tag-relationships, backfill-article-pins, backfill-bibliography, backfill-word-counts, batch-enrich-terms, batch-import-from-github, context-bundle-generator, context-diff-generator, context-save-drive, correlate-corpus, cron-self-test, detect-duplicate-articles, enrich-cultural-term, extract-purana-references, gdrive-image-proxy, generate-article-og, generate-article-seo, generate-article-tags, generate-sitemap, get-public-config, imaging-handoff-token, markdown-to-article-import, retire-og-image, scan-github-markdown, suggest-tag-categories, tts-save-drive, tts-stream-elevenlabs, tts-stream-google, tts-stream-openai

### Steps
1. Call `supabase--deploy_edge_functions` with all 29 names in one batch.
2. Smoke test: `get-public-config` (expect 200), `cron-self-test` with service-role (expect 200).
3. Tail logs for `gdrive-image-proxy` and `generate-article-og` to confirm no cold-start errors.

### Out of scope
No code edits, config changes, cron changes, RLS changes, or FE changes. Idempotent — safe to re-run.
