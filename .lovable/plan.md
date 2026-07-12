## Redeploy all edge functions

Redeploy every function under `supabase/functions/` to bring the runtime in sync with current source. Idempotent, no code changes.

### Functions (29)
analyze-tag-relationships, backfill-article-pins, backfill-bibliography, backfill-word-counts, batch-enrich-terms, batch-import-from-github, context-bundle-generator, context-diff-generator, context-save-drive, correlate-corpus, cron-self-test, detect-duplicate-articles, enrich-cultural-term, extract-purana-references, gdrive-image-proxy, generate-article-og, generate-article-seo, generate-article-tags, generate-sitemap, get-public-config, imaging-handoff-token, markdown-to-article-import, retire-og-image, scan-github-markdown, suggest-tag-categories, tts-save-drive, tts-stream-elevenlabs, tts-stream-google, tts-stream-openai

### Steps
1. Call `supabase--deploy_edge_functions` with all 29 names in one batch.
2. Smoke test `get-public-config` (expect 200).

### Out of scope
No code, config, cron, RLS, or FE changes.
