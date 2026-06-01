
# Corrected Path Forward — Evidence-Led, Surgical, Reversible

> **Phase H status: SHIPPED 2026-06-01.** Migration applied; both nightly enqueuer helpers (`enqueue_og_nightly_job`, `enqueue_term_enrichment_nightly`) created with hard caps and REVOKEd from PUBLIC/anon/authenticated (GRANT only to postgres + service_role). Cron commands for jobid 6 and 7 rewritten via `cron.alter_job`. Pre-flight check confirmed real candidates (1 OG, 2 term). jobid 8 self-cleared — `srangam_context_snapshots` has a fresh row from last night; the NULL `net._http_response` was a pg_net collection-window artifact for the >60s reply, not a failure. Verification will run automatically at 03:30 / 03:45 UTC tomorrow. See `docs/CRON_OPS_PLAYBOOK.md`.
>
> **Next:** Phase O (Ops dashboard + `get_recent_cron_runs` RPC). Awaiting user approval to proceed.



## What the real ground truth says (verified just now, not guessed)

I queried `net._http_response` (the actual HTTP outcomes of cron's POSTs). The four nightly jobs reported `pg_cron status = succeeded` last night, but **only because pg_cron's "succeeded" means the SQL `DO` block ran — not that the edge function did real work**. The actual HTTP responses:

| Job | Schedule | HTTP code | Body | Real verdict |
|---|---|---|---|---|
| 2 — pin-enrichment | 03:00 UTC | **404** | `{"error":"no articles matched"}` | Working as designed — Phase Z drained the queue, nothing left to enrich. Healthy. |
| 6 — og-nightly | 03:30 UTC | **400** | `{"error":"articleId required"}` | **Bug.** Cron sends `{"nightly":true,"limit":1}` but `generate-article-og` only has Branch A (job pump, requires `job_id`) and Branch B (single article, requires `articleId`). There is **no sweep branch**. The cron command was never valid. |
| 7 — term-enrichment | 03:45 UTC | **200** | `{"summary":{"total":0,...}}` | **No-op.** Cron sends `{"articleSlugs":[]}`. The function iterates an empty array. It always reports "success" while doing nothing. |
| 8 — context-snapshot | 04:00 UTC | `NULL` | (empty) | **Unknown.** `pg_net` never recorded a response and `timed_out` is `NULL`. Could be in-flight, dropped, or returned after pg_net's housekeeping window. Need observability before guessing. |

Yesterday's `og_generate`/`og_force` "watchdog: no heartbeat" failures were a **different code path** (admin-triggered Branch A jobs, not the broken cron line). The previous plan conflated them.

**True conclusion:** the cron infrastructure (pg_cron → `_cron_invoke_edge` → HTTP → gateway → edge function) is fully wired. Three of four cron *payloads* are wrong, and we have no observability surface to make this kind of root-cause obvious. That's what we fix.

## Revised phases (re-ordered by evidence, not by ideology)

### Phase H — Heal the three broken nightly payloads (do this first, ~1 hour)

This is the surgical, additive heal. No schema churn. No new public surface. The pg_cron jobs already exist — we only patch their `command` strings via `cron.alter_job` and add thin enqueue helpers where required.

**H1 — `srangam-og-nightly` (jobid 6).** The function has no sweep mode. Two options, pick the simpler:
- *(Preferred)* Add ~30 lines to `generate-article-og` Branch A so `{nightly:true,limit:N}` enqueues an `og_force` job covering published articles with `og_image_url IS NULL OR og_image_status='retired'`, then starts the existing pump. Same pattern as `enqueue_pin_backfill_sweep_job`.
- *(Cheaper, no edge change)* Create SQL function `public.enqueue_og_nightly_job(p_limit int)` that inserts an `og_force` row in `srangam_admin_jobs` with the article slugs in `params.targets`, then POSTs to `generate-article-og` with `{job_id, cursor:0}` (valid Branch A payload). Rewrite cron command to call this. Zero edge-function risk.

**H2 — `srangam-term-enrichment-nightly` (jobid 7).** Patch the cron command to compute `articleSlugs` at fire time:
```sql
-- New SQL helper (SECURITY DEFINER, search_path=public):
CREATE OR REPLACE FUNCTION public.enqueue_term_enrichment_nightly(p_limit int DEFAULT 10)
RETURNS jsonb ... -- selects N published articles whose body contains
                  -- {{cultural:...}} tokens missing from srangam_cultural_terms,
                  -- POSTs to batch-enrich-terms with the slug array.
```
Then `cron.alter_job(7, command => $$ SELECT public.enqueue_term_enrichment_nightly(10); $$)`. Same daily cap pattern as Phase Z (cost-aware).

**H3 — `srangam-context-snapshot-nightly` (jobid 8).** Two distinct unknowns:
- Why didn't `pg_net` record a response? Likely the snapshot bundle takes >60s and the response landed after `pg_net`'s default poll cycle. Confirm by querying `net.http_request_queue` for status; if `'success'` but no `_http_response` row, raise pg_net's `response_collect_interval`/check job. We do NOT touch the edge function until we see one fresh nightly response.
- The bigger risk: if it ran, it appended a snapshot row to `srangam_context_snapshots`. Check `snapshot_date > now() - interval '24 hours'`. If a row exists, the snapshot worked and the issue is purely observational. If not, debug.

**H4 — Idempotency canary.** Add `enqueue_cron_canary` (1-line job) on a 10-minute schedule that POSTs `{ping:true}` to `cron-self-test` with `{write:true}`. This gives us a guaranteed-green signal independent of the four real jobs. Delete after Phase O lands.

**Why H before O:** the user said "heal it, don't kill it." H is the actual heal. O is just visibility. Healing three one-line cron commands is lower risk than landing a new admin page; we should fix the actual bugs first while the diagnosis is fresh, then build the dashboard so we'd catch the next regression automatically.

### Phase O — Observability surface (after H lands)

Same scope I proposed before, narrower delivery:

1. **One read-only RPC** `public.get_recent_cron_runs(p_hours int default 24)` that LEFT JOINs `cron.job` ↔ `cron.job_run_details` (latest per job) ↔ `srangam_admin_jobs` (by `kind` within ±10 min of `start_time`) ↔ `net._http_response` (by `id` from `return_message` parsing where possible). SECURITY DEFINER, `SET search_path=public,cron,net`, body gated by `has_role(auth.uid(),'admin')`, EXECUTE granted to `authenticated` only. Returns one row per cron job with: `jobname, schedule, cron_status, cron_start, http_status, http_body_excerpt, edge_kind, edge_status, edge_processed, edge_total, edge_last_error, heartbeat_age_s`.
2. **`/admin/ops` page** (`src/pages/admin/CronOps.tsx`), admin-gated via existing `ProtectedRoute`, lazy-loaded, polled at 30s via `react-query` (no realtime). Three cards:
   - **Nightly cron health** — table from `get_recent_cron_runs`, traffic-light colored on the *HTTP* column (not the cron column — that was the whole bug we just found).
   - **Recent admin jobs** (last 20 `srangam_admin_jobs`) with "Re-run" buttons that call existing edge functions with `{force:true}` via authenticated supabase-js (no new public surface).
   - **Raw `net._http_response`** (last 20 rows for our edge URLs) for forensic debugging.
3. **Sidebar entry** in existing admin nav — one line in `Dashboard.tsx`. No router restructuring.
4. **Memory invariant** added to `mem://index.md` Core: *"pg_cron `succeeded` ≠ edge success. Always cross-check `srangam_admin_jobs` AND `net._http_response`. The `command` text is the contract — when payloads change, `cron.alter_job` it."*

### Phase G — Lighthouse guardrail (after O)

Unchanged from previous proposal, slimmed:
- `lighthouserc.json` with budgets `LCP ≤ 2500ms, CLS ≤ 0.1, TBT ≤ 300ms, perf ≥ 0.85` targeting `/`, `/articles`, one representative article.
- `.github/workflows/lighthouse.yml` — `workflow_dispatch` + `0 6 * * *` cron. Runs against the published URL. Fails workflow on regression.
- New table `srangam_lighthouse_runs(url, lcp_ms, cls, tbt_ms, perf_score, commit_sha, ran_at)` with GRANTs (authenticated SELECT via has_role, service_role ALL) + RLS.
- Tiny `lighthouse-ingest` edge function (~40 LOC), `requireAdminOrCron` gate, accepts LHCI JSON and writes a row.
- Ops page gains a 4th card: 14-day LCP sparkline from that table.
- Explicitly **out of scope:** PR-blocking (no PR workflow exists today).

### Phase T — Testing playbook (codify, don't rebuild)

Already in repo: `vitest` + `playwright` + 8 specs (`e2e/article-*.spec.ts`, `src/__tests__/responsive/*`, `src/__tests__/articles-merge-dedup.test.ts`, `src/__tests__/language-badge-body-truth.test.tsx`). What's missing is the contract:
1. `docs/TESTING_PLAYBOOK.md` documenting the three tiers (unit / RTL component / Playwright e2e+perf) with the existing files as canonical examples.
2. **Two new edge-function smoke tests** following the `edge-function-testing` knowledge file pattern: `cron-self-test_test.ts` (probe with `{ping:true}` and `{write:true}` paths) and `lighthouse-ingest_test.ts`. No retrofits of working functions.
3. Pre-publish checklist in `docs/MAINTENANCE_GUIDE.md`: `npm run lint && vitest run && npx playwright test`; then manually trigger `lighthouse.yml` and the new `/admin/ops` page.

### Phase D — Documentation & memory

- **New:** `docs/CRON_OPS_PLAYBOOK.md` (the three-source-of-truth diagram: pg_cron status / `srangam_admin_jobs` / `net._http_response`), `docs/PERFORMANCE_BUDGETS.md`, `docs/TESTING_PLAYBOOK.md`.
- **Update:** `docs/IMPLEMENTATION_STATUS.md`, `docs/SCALABILITY_ROADMAP.md`, `docs/MAINTENANCE_GUIDE.md`, `.lovable/plan.md` — replace the stale "Phase H complete" claim with the corrected H1–H4 above.
- **Memory:** `mem://ops/cron-truth-gap`, `mem://ops/perf-budgets`, `mem://testing/three-tier-contract`. Update `mem://index.md` Core (one line on the truth gap).

## Invariants preserved (do-not-break)

- No edits to `src/integrations/supabase/{client,types}.ts`, `.env`, project-level `supabase/config.toml`.
- No realtime additions (30s polling on Ops page only).
- No new public-callable surface — every RPC and edge function admin-gated.
- No `chunk_size > 1` in AI mode; no AI-prompt widening; no relaxing confidence gates.
- Every new public-schema table ships with `GRANT` + RLS in the same migration.
- Frozen contracts untouched: article rendering, gazetteer governance, CX.3 identity diffing, render-first/hydrate-second, mobile invariants.
- `cron.alter_job` is reversible — we can revert the `command` text in one SQL if anything regresses. No structural cron changes.

## Working SQL you can paste right now

```sql
-- Real cron commands (now you can see what each job actually POSTs):
SELECT jobid, jobname, schedule, command
FROM cron.job WHERE jobname LIKE 'srangam-%' ORDER BY jobid;

-- The truth pg_cron hides — HTTP outcomes:
SELECT id, status_code, left(coalesce(content::text,''),200) AS body, timed_out, created
FROM net._http_response
WHERE created > now() - interval '36 hours' ORDER BY created DESC;

-- Did the context snapshot land?
SELECT id, snapshot_date, status, articles_count, terms_count, tags_count
FROM srangam_context_snapshots
WHERE snapshot_date > now() - interval '36 hours' ORDER BY snapshot_date DESC;
```

## Order, sizing, blast radius

| Phase | Files | Migrations | Reversible? | Blast radius |
|---|---|---|---|---|
| H1 OG sweep | 1 edge OR 1 SQL fn | 1 (helper + `cron.alter_job`) | Yes — revert command | None until cron fires at 03:30 UTC |
| H2 term enrich | 0 edge, 1 SQL fn | 1 (helper + `cron.alter_job`) | Yes | None until 03:45 UTC |
| H3 context diagnosis | 0 | 0 (read-only) | n/a | None |
| H4 canary | 0 | 1 (`cron.schedule`) | Yes — `cron.unschedule` | None |
| O Ops page + RPC | 1 page, 1 nav line | 1 (RPC + grants) | Yes | Read-only, admin-only |
| G Lighthouse | 2 config + 1 edge + 1 chart | 1 (lighthouse table) | Yes | Additive |
| T Tests + docs | 2 tests + 1 doc | 0 | Yes | Zero |
| D Docs + memory | 4 docs + 3 mem | 0 | Yes | Zero |

## What I need from you

This is the enterprise sequence: **fix the bugs the data exposed (H), then build the surface that would have caught them (O), then add the perf guardrail (G), then codify the contract (T, D).**

Reply with one of:
- **"approve H1 only"** — fix og-nightly first, verify tomorrow morning's HTTP body is 200, then approve H2/H3/H4 incrementally. Most conservative.
- **"approve H"** — fix all four cron payloads in one migration session, observe tomorrow.
- **"approve H+O"** — H plus the Ops page in the same pass, so the next morning we have visual proof.
- **"approve all"** — full pipeline H → O → G → T → D, pausing for review after each phase.

I'll stop here for your call.
