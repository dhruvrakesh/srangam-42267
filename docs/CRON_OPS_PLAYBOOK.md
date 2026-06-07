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

## Rollback

Every Phase H change is a single `cron.alter_job` away from the previous (broken-but-known) state. Old commands are preserved in the migration file `supabase/migrations/20260601*phase_h*.sql` as comments.
