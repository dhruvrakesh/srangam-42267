
## Honest state check (verified against live DB + cron logs, just now)

Before re-planning, I queried `cron.job`, `cron.job_run_details`, and `srangam_admin_jobs` directly. The picture is **not** what the previous plan claimed.

### What is actually working
- `srangam-admin-jobs-watchdog` (jobid 1, `*/5 * * * *`) — running fine; it is in fact the only thing keeping the job board from looking permanently "running".
- `srangam-pin-enrichment-nightly` (jobid 2, `0 3 * * *`) — **dispatches** every night (last run 2026-05-31 03:00:00 → `succeeded`, return `DO`) but the **work fails**: the `srangam_admin_jobs` row it creates is killed 5 min later by the watchdog with `processed=0, last_error='watchdog: no heartbeat'`. Same story on 2026-05-30. So pg_cron is healthy; the edge invocation path is broken.
- Manual admin-UI pin runs from 07:29–08:01 today all **succeeded** (processed=4–7, cost ≈ $0.002 each). So `backfill-article-pins` itself works — only the cron-invocation path doesn't.

### What is NOT working (contrary to the previous plan)
- `srangam-og-nightly` (jobid 6, `30 3 * * *`), `srangam-term-enrichment-nightly` (jobid 7, `45 3 * * *`), `srangam-context-snapshot-nightly` (jobid 8, `0 4 * * *`) — **zero rows** in `cron.job_run_details` so far. They were scheduled after today's 03:30–04:00 window, so we can't even claim they fired once. Marking Phases 3/4/5 "done" was premature.
- **OG self-reinvoke (Phase 1-FIX-B)** — source carries the `SELF_URL = ${SUPABASE_URL}/functions/v1/generate-article-og` patch (line 387), but the bulk run started by an admin at 08:21:53 today still died at `processed=1/2` with `watchdog: no heartbeat`. Either the function was not redeployed after the edit, or pump death has a second cause. Cannot claim "fixed" until a bulk run completes end-to-end with `status='succeeded'`.
- **Cron auth contract is observable as broken**: the cron command `SELECT public._cron_invoke_edge('backfill-article-pins', '{"chunk_size":1,"only_zero_pin":true,"limit":20}')` does not include `_cron:true` in the body argument. The helper is supposed to merge it, but the rows it produces still suggest the function rejected the request after the row was created (heartbeat never ticks). Needs a direct trace.

### Implications for "enterprise way"
- The previous plan jumped to building a dashboard and CI guardrails on top of an automation layer that is silently failing in production. That is the wrong order. We must **prove the existing crons green for two consecutive nights** before we layer observability over them, otherwise the dashboard will just be a prettier way to look at red.
- We also cannot wait until 03:00 tomorrow to learn whether a fix worked. We need an **on-demand smoke harness** that exercises each cron path with a one-minute schedule, watches the resulting `srangam_admin_jobs` row, and tears itself down. This is the enterprise pattern (canary + auto-teardown).

---

## Revised phased plan — Heal → Observe → Guard

Ordering principle (per `mem://~user`: Surgical Healing): fix what is broken first, then add observability, then add guardrails. Never invert.

### Phase H — Heal cron automation (must come first, no new surface area)

H1. **Trace the failing nightly pin run end-to-end** with admin-callable diagnostics — no new public surface. New edge function `cron-self-test` (admin/cron-gated, idempotent, returns JSON only). It:
   - Reads the last `srangam_admin_jobs` row for a given `kind`, returns `{exists, processed, status, last_error, age_seconds, heartbeat_age_seconds}`.
   - For `kind='cron_probe'`, inserts a row, calls itself again via the same `_cron_invoke_edge` path, and reports whether the second invocation could find and heartbeat the row.
   This produces a single deterministic test we can run from a one-minute canary cron and from the admin UI.

H2. **Fix `_cron_invoke_edge` body merge** (DB migration): always merge `jsonb_build_object('_cron', true)` into the second argument (currently the helper may or may not — the failing rows suggest not, since `params._cron` is `nil` on the cron-created rows). Pin `search_path = public, vault`, keep `SECURITY DEFINER`, EXECUTE revoked from PUBLIC. Idempotent rewrite.

H3. **Verify `requireAdminOrCron` accepts the cron path post-fix** (no code change expected; add a unit test in `_shared/auth-gate.test.ts` for the two-condition pair using `Deno.test`).

H4. **Re-deploy** `generate-article-og`, `batch-enrich-terms`, `context-save-drive`, `backfill-article-pins` explicitly via `supabase--deploy_edge_functions` so the SELF_URL fix and the `requireAdminOrCron` switch are actually live (source ≠ deployed until we redeploy).

H5. **Canary harness** (`srangam-canary-every-min`, schedule `* * * * *`, lifespan ≤ 10 min):
   - Calls `cron-self-test` with `{kind:'cron_probe'}`.
   - A second `cron.alter_job` call at T+10 min unschedules it.
   - Acceptance gate: 5 consecutive green runs → un-schedule canary, mark Phase H green. Without this gate we do not move on.

H6. **Backfill-failed cleanup**: a one-shot `INSERT … SELECT` that re-queues the zero-pin articles missed by the two failed nightly runs (additive, idempotent, capped at 20). Goes through `enqueue_pin_backfill_sweep_job(20,3)` — no new logic.

H7. **OG self-reinvoke verification**: a single manual `og_force` over 3 known slugs in dry-run mode (`only_missing:true, dry_run:true`) — confirm `processed → total` and `status='succeeded'` without watchdog kill. If it still dies at 1/N, the bug is in the pump fetch (not the URL), and we file Phase H7-bis: replace `EdgeRuntime.waitUntil(fetch(...))` self-pump with an in-process loop bounded by `CPU_TIME_SOFT_LIMIT - 5s` (no extra HTTP hop, no auth needed).

H8. **Documentation**: update `docs/ADMIN_JOBS.md` "Auth" section with the verified two-condition cron contract; add a new `docs/AUTH_AND_CRON.md` (small) with the canary recipe and the green-gate definition.

**Exit criteria for Phase H** (all must be true before Phase O starts):
- `cron.job_run_details` shows two consecutive green runs (status='succeeded' AND admin job row reached `status='succeeded'`, not just dispatch-OK) for jobid 2, 6, 7, 8.
- No `last_error='watchdog: no heartbeat'` from cron-originated rows for 48 h.
- Canary unschedules itself cleanly.

### Phase O — Observability ("Cron Ops" admin dashboard)

Only after Phase H is green. Surgical, read-mostly.

O1. **Single SECURITY DEFINER RPC** `public.get_recent_cron_runs(_limit int default 50)` returning `(jobid, jobname, schedule, start_time, end_time, status, return_message, duration_ms)` filtered to `jobname ~ '^srangam-'`. EXECUTE granted to `authenticated` only, `search_path = public, cron` pinned.

O2. **Page** `src/pages/admin/CronOps.tsx`, wired into `AdminLayout` + a new `/admin/ops` route under `ProtectedRoute(isAdmin)`. Reads:
   - `get_recent_cron_runs(50)` (the new RPC).
   - `srangam_admin_jobs` last 50 rows joined to the cron run by time window (`start_time, end_time + 6 h grace`).
   - `srangam_event_log` last 20 rows where `category in ('cron','job','og','enrichment','context')`.
   - `srangam_lighthouse_runs` last 14 days (Phase G).
   Uses `react-query` poll @ 30 s (no realtime — low-frequency data).

O3. **Sections**:
   - **Cron health** table: one row per `srangam-*` cron, last run start/duration/status, "Open last admin job" link.
   - **Admin jobs** table: kind, status, progress, duration, cost, `last_error` (truncated with hover).
   - **Lighthouse trend** chart (Recharts line, LCP per route, budget line at 2500 ms).
   - **Error tray**: failed admin jobs in last 24 h with one-click "Re-queue" that calls `enqueue_pin_backfill_sweep_job` (pins) or inserts a row consumed by the next cron tick. **Never** invokes the edge function from the browser.

O4. **Docs**: new `docs/CRON_OPS_DASHBOARD.md` (data sources, RPC contract, "name your cron `srangam-*` and it auto-appears"). Update `mem://ops/cron-ops-dashboard`.

### Phase G — Guardrails (Lighthouse CI)

Only after Phase O can read perf history. Then we make regressions auto-fail.

G1. **Lighthouse CI infra**:
   - `@lhci/cli` as devDependency.
   - `lighthouserc.json` (desktop, preset=desktop) and `lighthouserc.mobile.json` (mobile preset, devtools throttling), 3 runs each.
   - Budgets (errors): `largest-contentful-paint ≤ 2500`, `cumulative-layout-shift ≤ 0.1`. (Warnings): `total-blocking-time ≤ 300`, `categories:performance ≥ 0.85`.
   - Targets: `https://srangam.nartiang.org/`, `/articles`, `/about` (representative routes).
   - `upload.target: 'temporary-public-storage'` (no infra; report URL in logs).

G2. **`.github/workflows/lighthouse.yml`** — `workflow_dispatch` + nightly `0 6 * * *` (after Phase H crons settle). Steps: checkout → setup-node 20 → `npm ci` → run both configs. Build fails on budget breach; HTML report uploaded as artifact.

G3. **Local fallback** `scripts/lh-local.sh` documented in `docs/PERFORMANCE_BUDGETS.md`.

G4. **Persist headline numbers** for Phase O. New table `public.srangam_lighthouse_runs (id, url, device, perf_score, lcp_ms, cls, tbt_ms, fcp_ms, report_url, recorded_at)`. Migration follows the mandatory `CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY` order: `GRANT SELECT ON … TO anon` (numbers are non-sensitive, enables a future public badge); admin ALL; service_role ALL. New edge function `lighthouse-ingest` (admin/cron-gated via `requireAdminOrCron`) called by the GitHub job with `x-cron-secret`. The Action will use a `CRON_SECRET` Actions secret (same value as Cloud → Secrets and vault — I'll show the exact `gh secret set` command at implementation time; never echoed).

### Phase T — Testing playbook (lands alongside H/O/G, not after)

T1. **`docs/TESTING_PLAYBOOK.md`** — three tiers:
   - **Unit (vitest)**: `mergeArticleSources` (Phase AA+AB cross-source dedup), `slugifyHeading` (AR.1 shared slug), `resolveCulturalTokens` leaf-only (AR.2), `getText` whitespace rules (AR.3).
   - **Component (vitest + RTL)**: `ArticleMiniMap` mount-on-pins (Phase Y), `LanguageAvailabilityBadge` body-derived N/9 (i18n/coverage-badge-truth), `OceanicArticlePage` exactly-one-`<ReactMarkdown>` invariant.
   - **E2E (Playwright)**: `/articles` renders within 1 s even with a stubbed 12 s DB delay (Phase X.8 render-first); `/admin/ops` loads for an admin session; atlas `?focus=<slug>` dims non-matching clusters; homepage hero has `fetchpriority="high"` + explicit dims (Phase 6c).

T2. **Edge-function smoke tests** under `supabase/functions/*/index_test.ts` (`Deno.test`), runnable via `supabase--test_edge_functions`:
   - `backfill-article-pins` `{dry_run:true, limit:1}` → 202 + admin job row.
   - `generate-article-og` `{slug:'<known>', dry_run:true}` → non-zero cost estimate, no Drive write.
   - `context-save-drive` `{dry_run:true}` → `identity_sets` shape returned, no Drive write.
   - `auth-gate` negative: missing `x-cron-secret` → 401; admin JWT → 200.

T3. **Pre-publish checklist** in the same doc: `npm run lint && npm test && npm run test:e2e && npm run test:perf`. After publish: trigger `lighthouse.yml` once. On failure: open `/admin/ops`, identify regression, ship a surgical fix — do not re-trigger blindly.

---

## Documentation & memory updates (per phase, not at the end)

- `docs/AUTH_AND_CRON.md` (new) — verified cron contract, canary recipe, green-gate definition (Phase H).
- `docs/ADMIN_JOBS.md` — section "Cron invocation path" added with the verified flow (Phase H).
- `docs/CRON_OPS_DASHBOARD.md` (new) — Phase O.
- `docs/PERFORMANCE_BUDGETS.md` (new) — Phase G.
- `docs/TESTING_PLAYBOOK.md` (new) — Phase T.
- `docs/IMPLEMENTATION_STATUS.md` — append Phase H (Heal), Phase O (Observe), Phase G (Guard), Phase T (Test) with datestamps and the green-gate evidence.
- `docs/SCALABILITY_ROADMAP.md` — add "Perf budgets enforced in CI" + "Cron canary harness" (Phase G/H).
- `.lovable/plan.md` — replace the optimistic "all phases done" entries with verified current status from this check, then track H→O→G→T.
- Memory:
  - `mem://ops/cron-green-gate` — definition of "green" (two consecutive nights + admin job row succeeded, not just dispatch-OK). Required reading before any future cron addition.
  - `mem://ops/cron-canary-pattern` — canary one-minute schedule + auto-teardown recipe.
  - `mem://ops/perf-budgets` — LCP ≤ 2500 ms, CLS ≤ 0.1, where budgets live, how to bump.
  - `mem://ops/cron-ops-dashboard` — RPC contract, `srangam-*` naming convention.
  - `mem://testing/three-tier-contract` — unit / component / e2e split + smoke edge tests.

---

## Order of execution

1. **Phase H** (Heal) — proves automation actually runs end-to-end. Two-night green gate.
2. **Phase O** (Observe) — admin dashboard reads what Phase H now reliably produces.
3. **Phase G** (Guard) — Lighthouse CI + new table + ingest function; trend chart in O lights up.
4. **Phase T** (Test) — playbook + missing specs; ratchets the floor under the next change.

## Rollback per phase

- **H**: drop `cron-self-test` function, revert `_cron_invoke_edge` migration (snapshotted before change), unschedule canary. Manual paths remain functional throughout.
- **O**: remove `/admin/ops` route + drop `get_recent_cron_runs` RPC. Zero impact on public surface.
- **G**: delete workflow file + drop `srangam_lighthouse_runs` + delete `lighthouse-ingest`. No FKs, no consumers outside the dashboard.
- **T**: docs and tests are additive; rollback = delete files.

## What this plan will NOT do

- No changes to `requireAdmin` user-JWT path, RLS, gazetteer rows (G3), CX baseline snapshots (≤2026-05-29 frozen), `articleResolver.ts`, `src/integrations/supabase/{client,types}.ts`, `.env`, `supabase/config.toml` project-level keys.
- No new public-callable surface (`cron-self-test`, `lighthouse-ingest` admin/cron-only).
- No schema changes in reserved schemas (`cron`, `vault`, `auth`, `storage`) — cron data is read via a `public` RPC.
- No realtime subscriptions on `/admin/ops`.
- No widening of AI prompts, no relaxing of confidence gates, no `chunk_size > 1` when AI is on (G1 invariant).
- No claim of "fixed" without a green canary or two-night green gate. We will not mark anything green by inspection of source code alone again.

## What I need from you

Reply **"approve"** and I'll start with **Phase H1–H4** (trace + helper fix + redeploys), wait for two green canary runs, then proceed H5→H8→O→G→T. No secrets needed at this step; the `CRON_SECRET` GitHub Actions seed only matters when Phase G ships.
