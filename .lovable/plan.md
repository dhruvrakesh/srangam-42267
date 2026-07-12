## Goal
1. Trigger `correlate-corpus` immediately to populate `srangam_corpus_correlations_snapshot`.
2. Add a "Recompute now" button on `/admin/corpus-correlations` for future runs.

## Steps

### A. Immediate trigger
- Call `correlate-corpus` via `supabase--curl_edge_functions` (POST, empty body) — uses your admin preview session for `requireAdmin`.
- Verify response `{ ok, job_id, rows, computed_at }`.
- Confirm via `supabase--read_query` that a new row set exists in `srangam_corpus_correlations_snapshot` and `srangam_admin_jobs` shows `succeeded`.

### B. UI: "Recompute now" button
- Edit `src/pages/admin/CorpusCorrelations.tsx`: add a secondary button next to "Refresh" in the query-parameters card.
- On click: `supabase.functions.invoke('correlate-corpus', { body: { /* current weights + min_shared + limit_rows */ } })`.
- Show `toast.success` on `{ ok: true }` with row count + computed_at; `toast.error` on failure.
- After success: `refetch()` the snapshot query (already exposed by `useCorpusCorrelations`) so the table refreshes.
- Disable the button while pending; reuse `Loader2` spinner pattern already in file.
- No changes to the edge function, RLS, cron, or hooks.

## Out of scope
- No changes to weights defaults, cron schedule, or promotion flow.
- No new hooks file; inline `useMutation` (react-query already imported transitively via the hook — will import from `@tanstack/react-query` if needed).

## Risk
Low. Purely additive UI; edge function already gated by `requireAdmin`.
