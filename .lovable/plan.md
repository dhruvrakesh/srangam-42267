# Redeploy all edge functions

## Goal
Deploy every edge function from the current repo state so runtime matches the latest code, shared helpers, telemetry, and security gates.

## Functions to deploy
```text
analyze-tag-relationships
backfill-article-pins
backfill-bibliography
backfill-word-counts
batch-enrich-terms
batch-import-from-github
context-bundle-generator
context-diff-generator
context-save-drive
correlate-corpus
cron-self-test
detect-duplicate-articles
enrich-cultural-term
extract-purana-references
gdrive-image-proxy
generate-article-og
generate-article-seo
generate-article-tags
generate-sitemap
get-public-config
imaging-handoff-token
markdown-to-article-import
retire-og-image
scan-github-markdown
suggest-tag-categories
tts-save-drive
tts-stream-elevenlabs
tts-stream-google
tts-stream-openai
```

## Steps
1. Deploy all 28 functions in one `supabase--deploy_edge_functions` call.
2. Wait for deploy results and capture any errors.
3. Smoke-test `get-public-config` for an HTTP 200 response.
4. If any function fails, read the error, address lockfile/import issues if needed, and retry the failed subset.
5. Report deploy status and smoke-test result.

## Scope and risk
- No source edits, no migrations, no frontend changes.
- Risk: low. This is a redeploy of reviewed code already in the repo.
- Possible friction: stale `deno.lock` can cause 500 deploys; the fix is to remove/refresh the lockfile and retry.
