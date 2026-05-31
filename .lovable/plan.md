## NEW FINDING — OG generation "stuck at 1/2" is a self-reinvoke URL bug

Edge logs (`generate-article-og`, today 08:21–08:22 UTC) show **both** OG images succeeded:

```
08:22:12 og_image_generated  slug=breached-within-internal-fracture  v1  $0.039  drive_id=1m0t…
08:22:13 ERROR  pump reinvoke failed: 404 {"error":"requested path is invalid"}
08:22:44 og_image_generated  slug=stone-sun-vitasta  v2  $0.039  drive_id=1uh1…
08:22:46 ERROR  pump reinvoke failed: 404 {"error":"requested path is invalid"}
```

Root cause — `generate-article-og/index.ts:384` calls `schedulePumpReinvoke(req.url, …)`. Inside a Supabase edge worker, `req.url` resolves to the **internal** worker hostname (not `https://<ref>.supabase.co/functions/v1/generate-article-og`). The gateway rejects that path with `404 requested path is invalid`. The work itself completes; only the **progress signalling** loop dies, so the UI is stuck at 50 % even though `srangam_media_assets` and Drive both got the second file.

Surgical fix (Phase 1-FIX-B, 3 lines):

```ts
// generate-article-og/index.ts:384 — current
schedulePumpReinvoke(req.url, { job_id: body.job_id, cursor: nextCursor, force });

// fixed
const SELF_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-article-og`;
schedulePumpReinvoke(SELF_URL, { job_id: body.job_id, cursor: nextCursor, force });
```

Also patch the still-running stale job so the UI un-sticks immediately: a tiny SQL `UPDATE srangam_admin_jobs SET status='succeeded', finished_at=now(), processed=total WHERE kind='og_generate' AND status='running' AND finished_at IS NULL AND heartbeat_at < now()-interval '5 min'` (additive, idempotent, only touches abandoned rows).

## Why the previous Phase 1-FIX preflight failed (unchanged from last turn)

`vault.secrets` is missing `SUPABASE_SERVICE_ROLE_KEY`. Service-role JWT is **not exposed in the Cloud UI** (your screenshot confirms — no "API keys" subview). Asking you to paste it violates "never display secret values".

The Supabase Edge gateway only requires *any* valid project JWT in `apikey`/`Authorization` (anon passes). True authorization happens inside the function via `requireAdminOrCron`. So the actual security boundary is `CRON_SECRET` + `_cron:true`, not the bearer token.

## Revised Phase 1-FIX — single-secret cron auth

### 1. Loosen `requireAdminOrCron` (auth-gate.ts lines 121–129)

Two-condition cron path:
- `x-cron-secret` header equals env `CRON_SECRET`, AND
- body contains `_cron:true`

Drop the `Authorization == Bearer <service_role>` requirement. Defense-in-depth preserved (high-entropy `CRON_SECRET`, only ever transits pg_cron → edge function, never in client network logs). `requireAdmin` (admin UI path) untouched.

### 2. Simplify `public._cron_invoke_edge(text, jsonb)`

Drop `SUPABASE_SERVICE_ROLE_KEY` vault lookup. Read only `CRON_SECRET` from `vault.decrypted_secrets`. Headers:

```
Content-Type:   application/json
apikey:         <anon JWT — hardcoded literal, same as src/integrations/supabase/client.ts>
Authorization:  Bearer <anon JWT — same literal>
x-cron-secret:  <CRON_SECRET from vault>
```

Body: `_body || jsonb_build_object('_cron', true)`. Function stays `SECURITY DEFINER`, `search_path` pinned to `public, vault`.

### 3. Single vault seed you CAN actually do

```sql
SELECT vault.create_secret('<paste CRON_SECRET — same value as the existing edge-function secret>', 'CRON_SECRET');
```

You generated `CRON_SECRET` yourself (already in Cloud → Secrets). If forgotten: rotate via `secrets--update_secret` to a fresh `openssl rand -hex 32`, paste into both Cloud → Secrets and `vault.create_secret`.

### 4. Migration: rewire `srangam-pin-enrichment-nightly`

`cron.alter_job` → `public._cron_invoke_edge('backfill-article-pins', {...})` with `chunk_size:1`, `only_zero_pin:true`, `limit:20`. Preflight checks only `CRON_SECRET`.

### 5. Verification gate

`cron.schedule('pin-cron-smoke', '* * * * *', …)` for one minute → `srangam_admin_jobs` row with `created_by IS NULL`, `processed > 0`, `status='succeeded'`, no `watchdog: no heartbeat`. Drop the smoke job. Rollback = revert `cron.alter_job` to the snapshotted prior command.

## Verified state of all phases (this session)

| Phase | Status |
|---|---|
| 1 — Cron auth helper deployed | Code present, command not yet rewritten. |
| 1-FIX — Cron command rewrite | Blocked by old vault dependency. Above design removes the block. |
| **1-FIX-B — OG self-reinvoke URL bug** | **NEW.** 3-line edit in `generate-article-og/index.ts` + 1 stale-job UPDATE. |
| 2 — Deccan gazetteer +15 | Done (admin tile 43/47). |
| 3 — OG nightly cron | Not started. `generate-article-og` still on `requireAdmin` (line 315). |
| 4 — Term enrichment cron | Not started. `batch-enrich-terms` still on `requireAdmin` (line 15). |
| 5 — CX.3 snapshot cron | Not started. `context-save-drive` still on `requireAdmin` (line 28). |
| 6 — Counter polish | Done (`Home.tsx`). |
| 7 — Candidate funnel | Table + harvesting wired (`recordGazetteerCandidates` at `backfill-article-pins/index.ts:165`). Admin UI not built. |
| LCP — Lighthouse perf finding | Open (hero `fetchpriority`/dimensions, `font-display: swap`). |

## Phase order

1. **Phase 1-FIX-B** — OG pump URL fix + stale-job unsticker (fastest user-visible relief; un-sticks today's 1/2 progress UI; unblocks any future Phase 3 cron). 5-min change.
2. **Phase 1-FIX** — auth-gate two-condition path + helper migration + cron-rewrite migration + smoke gate. Needs your one-time `CRON_SECRET` vault seed.
3. **Phase 3** — flip `generate-article-og` to `requireAdminOrCron`; schedule `srangam-og-backfill-nightly` at `30 3 * * *`, `{only_missing:true, limit:5}`. Re-read function first to confirm `only_missing`/`limit` are accepted body fields.
4. **Phase 4** — flip `batch-enrich-terms`; cron `0 4 * * *`, `{only_stale:true, limit:10}`. Re-read `enrich-cultural-term` for the actual stale-field set; never fabricate columns.
5. **Phase 5** — flip `context-save-drive`; cron `30 4 * * *`. Verify first row has `stats_detail->>'generated_with'='CX.3'` + `identity_sets IS NOT NULL`.
6. **Phase 7-FIX** — `/admin/gazetteer/candidates` page only. Sortable list + Promote (modal pre-filled by new admin-only `gazetteer-variant-suggest` edge function calling Gemini for IAST/ASCII/Devanagari/historic variants; admin reviews before `INSERT … ON CONFLICT (canonical_name) DO NOTHING`) / Reject / Merge actions. No auto-promote.
7. **Phase 6b** — honest admin counter in `GeographyMedia.tsx`: subtitle "4 conceptual articles · no places to resolve" via additive `tags:['conceptual']` on `srangam_articles`. Pure presentation.
8. **Phase 6c (LCP fix)** — surgical:
   - Identify the homepage hero image / H1 in `src/pages/Home.tsx`.
   - Hero `<img>`: explicit `width`/`height`, remove any `loading="lazy"`, add `fetchpriority="high"`.
   - Add `font-display: swap` to every `@font-face` rule (`src/index.css` + any `src/styles/*.css`).
   - Mark SEO finding fixed + trigger publish dialog.
9. **Phase 2b** — evidence backfill, deferred 48 h after Phases 3/4/5 are green.

## Documentation updates (shipped per phase)

- `.lovable/plan.md` — phase status + datestamps.
- `docs/SCALABILITY_ROADMAP.md` — three nightly crons under "Automated intelligence loops" with cost caps.
- `docs/architecture/SOURCES_PINS_SYSTEM.md` — candidate funnel admin UI + conceptual-articles definition.
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` — CX.3 nightly.
- `docs/AUTH_AND_CRON.md` (new, tiny) — two-condition cron auth contract + rationale for keeping service-role JWT out of vault.
- Memory: update `mem://phase-z/pin-enrichment-automation` (new auth contract, vault seed recipe, smoke recipe, OG pump-URL invariant).

## Invariants this plan will NOT touch

- No widening of AI prompts / no relaxing of confidence gates (Core).
- No DELETE on gazetteer (G3).
- No retroactive UPDATE on `≤2026-05-29` CX snapshots (frozen baseline).
- No edits to `src/integrations/supabase/{client,types}.ts` or `.env`.
- No re-introduction of manual-only pin flows (Phase Z).
- No `chunk_size > 1` when AI is on (G1).
- No change to `articleResolver.ts` JSON-source pin path.
- `requireAdmin` (user-JWT path) unchanged — admin UI behaviour identical.

## What I need from you

Reply **"go"** and I'll execute in this order:
1. Phase 1-FIX-B (no secrets needed, immediate).
2. Then Phase 1-FIX (you paste `CRON_SECRET` into one `vault.create_secret` call).
3. Then Phases 3 → 4 → 5 → 7-FIX → 6b → 6c → 2b.
