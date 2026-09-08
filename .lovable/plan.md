# Deploy tag-enrichment functions to production

## Goal
Bring the two tag-enrichment backend functions up to date with the repo, so nightly tag enrichment actually writes tags and reports failures honestly.

## Why
The repo version of `batch-enrich-terms` (commit 8fadbcf):
- sends the payload shape `generate-article-tags` actually reads (`title`, `theme`, `culturalTerms`, `contentPreview`)
- persists generated tags back to `srangam_articles`
- returns HTTP 207 with `success: false` when any article fails

The live version sends `{articleId, title, content}`, never writes, and always returns HTTP 200 with `success: true` — which is why last night's run reported `successful: 0, failed: 5` under a 200.

## Steps
1. Deploy `batch-enrich-terms` and `generate-article-tags` (deploy both, since the caller/callee payload contract changed on both sides).
2. Smoke-test `batch-enrich-terms` with a single known slug and confirm the response reports tags actually written, and that a failure would surface as 207 / `success:false`.
3. Re-read the tags on that article from the database to confirm persistence — report what the database returns, not what the response claims.
4. Report the deploy result and the smoke-test evidence.

## Scope and risk
- No database changes, no migrations, no frontend changes, no source edits.
- Deploy only; code is already in the repo and reviewed.
- Risk: low. The new code is additive (it now writes tags where it previously wrote none) and only touches articles named explicitly in the request payload.
- Existing curated tags: the repo code overwrites `tags` for the slugs it is given. Step 2 uses a single slug so this is observable before any batch run.

## Technical notes
- Functions: `supabase/functions/batch-enrich-terms/index.ts`, `supabase/functions/generate-article-tags/index.ts`.
- Both are `verify_jwt = false` in `config.toml` with in-code gating (`requireAdminOrCron` / `requireAdmin`); the smoke test runs with an admin session.
- `generate-article-tags` requires `OPENAI_API_KEY`; if the smoke test returns a 500 mentioning that key, report it rather than working around it.
