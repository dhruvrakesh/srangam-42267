## Goal
Populate `srangam_corpus_correlations_snapshot` with a fresh multi-signal correlation set by invoking the `correlate-corpus` edge function once.

## Steps
1. Call `correlate-corpus` via `supabase--curl_edge_functions` with default weights (min_shared=1, limit_rows=1000, w_place=0.25, w_purana=0.30, w_term=0.20, w_tag=0.10, w_biblio=0.15) using service-role bearer so it runs in cron mode.
2. Verify response: expect `{ ok: true, job_id, rows, computed_at }`.
3. Confirm snapshot rows via `supabase--read_query` on `srangam_corpus_correlations_snapshot` filtered by the returned `job_id` and check `srangam_admin_jobs` row = `succeeded`.

## Out of scope
- No code, migration, cron, RLS, or FE changes.
- No weight tuning beyond defaults.
- No promotion of pairs into `srangam_cross_references` (curator action, stays manual).

## Risk
Low. Function is idempotent-per-invocation (one job = one snapshot); admin UI already reads latest snapshot by `computed_at`.
