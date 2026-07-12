## Plan: Redeploy all edge functions

Force a redeploy of every edge function in `supabase/functions/` so recent shared-module updates (`_shared/auth-gate.ts`, `_shared/context-metrics.ts`, `_shared/google-drive.ts`, `_shared/ai-provider.ts`) are baked into every deployed bundle.

### Functions to redeploy (29)

analyze-tag-relationships, backfill-article-pins, backfill-bibliography, backfill-word-counts, batch-enrich-terms, batch-import-from-github, context-bundle-generator, context-diff-generator, context-save-drive, correlate-corpus, cron-self-test, detect-duplicate-articles, enrich-cultural-term, extract-purana-references, gdrive-image-proxy, generate-article-og, generate-article-seo, generate-article-tags, generate-sitemap, get-public-config, imaging-handoff-token, markdown-to-article-import, retire-og-image, scan-github-markdown, suggest-tag-categories, tts-save-drive, tts-stream-elevenlabs, tts-stream-google, tts-stream-openai

### Steps

1. Invoke `supabase--deploy_edge_functions` with all 29 names in a single call.
2. If any fail (typically `deno.lock` incompatibility per the deploy-error playbook), retry that subset individually and report per-function status.
3. Post-deploy smoke:
   - `GET get-public-config` → 200 (unauth, sanity check).
   - `GET cron-self-test` with service-role bearer → 200 (verifies `_shared/auth-gate.ts` cron path).
   - Tail `edge_function_logs` for `generate-article-og` and `gdrive-image-proxy` (highest-traffic public functions) to confirm no boot errors.
4. Report a table: function → deploy status → smoke result.

### Out of scope

- No code edits to any function or shared module.
- No config.toml, cron, RLS, or FE changes.
- No cache invalidation (OG/TTS/GDrive artifacts remain).

### Rollback

Redeploy is idempotent; if a function regresses, redeploy the prior git revision of that single function.
