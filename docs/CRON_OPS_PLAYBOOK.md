# Cron Ops Playbook

**Status:** Phase H landed 2026-06-01. Phases O (Ops dashboard), G (Lighthouse), T (tests), D (rest of docs) pending.

## The three sources of truth

A nightly background job is healthy **only when all three agree**:

| # | Source | What it proves | Common gotcha |
|---|--------|---------------|---------------|
| 1 | `cron.job_run_details.status` | The SQL `DO` block executed | "succeeded" does NOT mean the edge function ran |
| 2 | `net._http_response.status_code` | The HTTP POST to the edge function returned a status | NULL if the response landed after pg_net's collection window (e.g. >60s snapshots) |
| 3 | `srangam_admin_jobs` row in the same time bucket | The edge function did real work and stamped progress | Some functions (e.g. `batch-enrich-terms`) don't insert here — verify via the artifact instead |

`cron.job_run_details` has **NO `jobname` column**. Always JOIN `cron.job` for the name.

## Paste-ready audit query

```sql
WITH last_run AS (
  SELECT DISTINCT ON (jobid) jobid, status, return_message, start_time, end_time
  FROM cron.job_run_details ORDER BY jobid, start_time DESC
)
SELECT j.jobid, j.jobname, j.schedule, j.command,
       r.status   AS cron_status,
       r.start_time AS cron_start,
       (SELECT status_code FROM net._http_response
        WHERE created BETWEEN r.start_time AND r.start_time + interval '5 min'
        ORDER BY created DESC LIMIT 1)               AS http_status,
       (SELECT left(coalesce(content::text,''),200) FROM net._http_response
        WHERE created BETWEEN r.start_time AND r.start_time + interval '5 min'
        ORDER BY created DESC LIMIT 1)               AS http_body
FROM cron.job j
LEFT JOIN last_run r USING (jobid)
WHERE j.jobname LIKE 'srangam-%'
ORDER BY j.jobid;
```

## Nightly schedule (UTC)

| jobid | name | schedule | command (post-Phase H) | cap |
|---|---|---|---|---|
| 1 | srangam-admin-jobs-watchdog | `*/5 * * * *` | (built-in watchdog) | n/a |
| 2 | srangam-pin-enrichment-nightly | `0 3 * * *` | `enqueue_pin_backfill_sweep_job(20, 1)` (Phase H.2) | 20 / night |
| 6 | srangam-og-nightly | `30 3 * * *` | `enqueue_og_nightly_job(1)` | 5 / night (helper hard-caps) |
| 7 | srangam-term-enrichment-nightly | `45 3 * * *` | `enqueue_term_enrichment_nightly(5)` | 10 / night (helper hard-caps) |
| 8 | srangam-context-snapshot-nightly | `0 4 * * *` | `_cron_invoke_edge('context-save-drive', {})` | 1 / night |

## How to change a cron payload safely

1. **Add or update a SECURITY DEFINER helper** in `public.` schema, `SET search_path = public`, REVOKE from PUBLIC/anon/authenticated, GRANT only to `postgres, service_role`. Helpers must include hard caps.
2. **Rewrite the cron command** with a single statement:
   ```sql
   SELECT cron.alter_job(job_id := <id>, command := $cmd$ SELECT public.<helper>(<args>); $cmd$);
   ```
3. **Verify** the next morning with the audit query above, OR fire manually from psql / SQL editor as a smoke test (helpers are idempotent and cost-capped).

## Phase H change log (2026-06-01)

- **jobid 6** (`srangam-og-nightly`) — was 400 "articleId required" every night because cron sent `{nightly:true,limit:1}` which matched neither Branch A (pump, requires `job_id`) nor Branch B (single, requires `articleId`). Replaced with `enqueue_og_nightly_job(1)` which creates a properly formatted `og_force` job and POSTs via Branch A first-invocation `targets[]` path. Heals incrementally; will fill one OG/night until backlog drained.
- **jobid 7** (`srangam-term-enrichment-nightly`) — was 200 but no-op (empty `articleSlugs`). Replaced with `enqueue_term_enrichment_nightly(5)` which selects up to 5 published articles with empty `tags` arrays and regenerates them. **Never overwrites curated tags.**
- **jobid 8** (`srangam-context-snapshot-nightly`) — pg_net showed NULL status_code, but `srangam_context_snapshots` shows fresh rows landing nightly. Job is healthy; the NULL is a pg_net collection-window artifact for slow (>60s) edge replies. **No change required.** Documented here so the next investigator doesn't waste a debug cycle.

## Phase H.2 change log (2026-06-06)

- **`_cron_invoke_edge`** — was using the pg_net default 5s timeout, silently truncating every AI-backed nightly call. Now passes `timeout_milliseconds := 120000` explicitly. Pin / OG / term-enrichment enqueuers self-pump via `EdgeRuntime.waitUntil` so the 120s only needs to cover the initial 202 ack.
- **jobid 2** (`srangam-pin-enrichment-nightly`) — root-cause: `enqueue_pin_backfill_sweep_job` inserted an `srangam_admin_jobs` row but **never called `_cron_invoke_edge`**, so the edge function was never invoked and the watchdog reaped the orphan row every night with `last_error = "watchdog: no heartbeat"`. Fixed by adding the missing POST (mirroring `enqueue_og_nightly_job` / `enqueue_term_enrichment_nightly`). Verified at 03:57 UTC: `net._http_response` now logs a real response from the function (no longer NULL).
- **jobid 2 follow-up** (discovered during H.2 smoke test 2026-06-07 03:57 UTC) — the enqueuer now correctly POSTs, but `backfill-article-pins` responds `404 {"error":"no articles matched"}` even when 4 zero-pin published articles exist (verified via direct query). The function's candidate filter inside the `only_zero_pin + limit + chunk_size` path disagrees with the helper's `NOT EXISTS` check. **Separate ticket**, does not block H.2 mechanical heal. Investigate in `supabase/functions/backfill-article-pins/index.ts` and align with the `enqueue_pin_backfill_sweep_job` SQL filter.

## Phase P change log (2026-06-06) — Puranic idempotency

- Pre-clean baseline: 69 rows, 17 duplicate groups on `(article_id, purana_name, reference_text, adhyaya)`.
- Archived to `public.srangam_purana_references_dedup_archive_20260606` (RLS: admin SELECT only) before any mutation.
- Normalized `adhyaya`: `''` and literal `"Not mentioned"` → `NULL`.
- Soft-deduplicated to 47 unique rows (22 removed — 3 more than the pre-normalization audit predicted because empty-string vs NULL collisions surfaced after normalization).
- Added `UNIQUE (article_id, purana_name, reference_text, adhyaya)` constraint `srangam_purana_references_dedup_key`. Re-running the extractor on the same article is now a no-op for already-present rows.
- `extract-purana-references` edge function: `.insert()` → `.upsert(..., { onConflict, ignoreDuplicates: true })`; new optional request flag `only_unextracted: true` filters out articles that already have ≥1 reference, enabling cheap resumable batch sweeps.

## Phase B change log (2026-06-06) — Bibliography AI fallback

- Baseline coverage: 5 / 47 published articles have any bibliography rows (10.6%). Regex was missing inline parenthetical citations entirely.
- `backfill-bibliography` now accepts `{ ai_fallback: true }` — when the regex pass yields `< 3` entries, calls `aiExtractCitations` (Gemini → OpenAI) with a 25 k char cap, 60 s timeout, MLA9-shaped JSON schema.
- Hard cap: 50 articles per invocation (~$1 ceiling). AI-derived entries are tagged `ai_extracted` so curators can audit them.
- Trigger manually only (no cron). Curation, not expansion.

## Phase H.3 change log (2026-06-07) — pin-backfill candidate-filter heal

- **Root cause:** `enqueue_pin_backfill_sweep_job` POSTs `{ only_zero_pin: true, ... }` without `all_published: true`. The edge function's resolver was a strict if/else-if (`article_id` → `slug` → `all_published`), so the nightly payload matched no branch, left `totalCandidates = 0`, and returned a misleading 404 even though 4 zero-pin published articles existed.
- **Fix (edge-only, no SQL/cron change):** branch gate widened to `else if (body.all_published || body.only_zero_pin)`; `only_zero_pin` is now self-sufficient.
- **Hardening:** both inner fetches (`srangam_article_pins`, `srangam_articles`) now paginate in 1000-row pages — current scale (171 pins / 47 articles) is safe but the corpus is growing.
- **Contract guard:** if none of `article_id | slug | all_published | only_zero_pin` is set, the function now returns **400 `missing target selector`** with `received_keys`, catching future enqueuer drift loudly instead of silently 404-ing.
- **Observability:** one structured `pin_stage / resolve_candidates` log line at resolver entry with `{ mode, total_candidates, chunk_offset, chunk_size, body_keys, job_id }`.
- **Verified 2026-06-07 04:11 UTC** via direct edge call with the exact nightly payload (`only_zero_pin:true, limit:20, chunk_size:1`): **HTTP 200**, `total: 4`, first chunk processed via Gemini ($0.000487, 2.5s). Nightly chain (with `job_id`) will return 202 as before via `EdgeRuntime.waitUntil`.

## Phase T.1 reference (2026-06-07)

See `RELIABILITY_AUDIT.md` § "Phase T.1 — AI usage ledger". `srangam_ai_usage` is the canonical per-call cost / latency / error ledger for every Gemini and OpenAI invocation routed through `_shared/ai-provider.ts`. Append-only; admin SELECT only.

## Phase S.1 reference (2026-06-07) — Surgical RLS heal

See `RELIABILITY_AUDIT.md` § "Phase S.1". Four policy edits, zero FE/edge wiring change:
- `srangam_media_assets` → admin-only SELECT (OG cost + GDrive IDs no longer anon-readable).
- `narration_analytics` → strict `user_id IS NOT NULL AND auth.uid() = user_id` INSERT (closes anon spam + NULL-owner pollution).
- `srangam_article_chapters` → public SELECT gated to `status='published'` parent article.
- `srangam_markdown_sources` → `COMMENT ON TABLE` intent lock (scanner self-confirmed secure).

Phase S.2 (proposed, not deployed) replicates the published-status gate on `srangam_article_bibliography`, `srangam_article_evidence`, `srangam_cross_references`, `srangam_purana_references`. Pre-flight FE grep required before approval.

## Rollback

Every Phase H / H.2 / H.3 / P / S.1 change is a single `cron.alter_job`, `DROP CONSTRAINT`, or inverse `CREATE POLICY` away from the previous state. Old commands, the full pre-dedup snapshot, and pre-S.1 policy texts are preserved in the migration history. H.3 rollback: revert `supabase/functions/backfill-article-pins/index.ts` to the pre-2026-06-07 branch gate. S.1 rollback: re-create each dropped policy from migration `20260607042423_*.sql` and `20260607_narration_analytics_*` in reverse.

