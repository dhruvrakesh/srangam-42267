# Admin Jobs Contract

**Frozen baseline: 2026-05-28 (Phase X.1).**

Long-running admin operations (pin backfill, OG image bulk generation) run as durable, observable, resumable jobs on top of `srangam_admin_jobs`. This doc is the single source of truth for how they behave.

## Job kinds
`pin_backfill`, `og_generate`, `og_force`.

## Lifecycle
1. **Create** — Browser inserts a `srangam_admin_jobs` row with `status='running'`, `total`, and `params` (bulk OG persists `params.targets[]` so the server can pump without the browser).
2. **Kick-off** — Browser invokes the edge function ONCE with `job_id` and the initial cursor/offset. This is the only client-side fetch in the chunked path.
3. **Self-pump** — After processing its chunk, the edge function calls `EdgeRuntime.waitUntil(fetch(self_url, {_pump: true, …}))` for the next cursor. Service-role bearer authenticates the re-invocation. Closing the browser tab no longer stalls the job.
4. **Per-item update** — `reportItem()` in `_shared/jobs.ts` increments counters, sets `heartbeat_at`, appends `params.tier_totals = {a,b,c}` when the worker passes `tier_delta` (pin backfill does). Realtime UPDATE pushes drive `JobProgressCard`.
5. **Terminal** — `finishJob()` flips `status` to `succeeded | failed | cancelled` and stamps `finished_at` + `heartbeat_at`.

## Heartbeat watchdog
- `srangam_admin_jobs.heartbeat_at` is bumped by every `reportItem()` and every `touchHeartbeat()`.
- `public.reconcile_stuck_admin_jobs()` (SECURITY DEFINER, search_path=public, EXECUTE revoked from PUBLIC) marks any `status='running'` row with `heartbeat_at < now() - interval '5 minutes'` as `failed` with `last_error = 'watchdog: no heartbeat'`.
- Scheduled by `pg_cron` job `srangam-admin-jobs-watchdog` every 5 minutes.

## Rehydrate on mount
`GeographyMedia.tsx` queries the most recent running job (any of the three kinds) on mount and binds `JobProgressCard` to it. A tab refresh mid-run re-attaches; the user does not need a stable browser session.

## Cancel semantics
- `useAdminJob.cancel()` flips `status='cancelled'`.
- The current in-flight chunk completes; the next pump invocation checks `isCancelled()` and returns early without re-invoking.
- Worst-case extra work after Cancel: one chunk (pins) or one article (OG).

## Auth
- User-initiated calls: `requireAdmin` (JWT + `has_role('admin')`).
- Self-pump calls: `Authorization: Bearer <SERVICE_ROLE_KEY>` + a valid `job_id` (whose `created_by` was admin-validated at creation time).
- No new public-callable surface area.

## Files
- `supabase/functions/_shared/jobs.ts` — `createJob`, `reportItem` (with `tier_delta`), `touchHeartbeat`, `isCancelled`, `finishJob`.
- `supabase/functions/backfill-article-pins/index.ts` — chunked + self-pump.
- `supabase/functions/generate-article-og/index.ts` — single-shot + bulk self-pump branch (`targets[]` in params).
- `src/hooks/useAdminJob.ts` — Realtime subscription, exposes `heartbeat_at` and `params.tier_totals`.
- `src/components/admin/JobProgressCard.tsx` — renders A/B/C breakdown alongside last-item.
- `src/pages/admin/GeographyMedia.tsx` — rehydrate-on-mount.

## Out of scope (deferred to later X phases)
- X.2 pin extraction quality (IAST→Hunterian fold, `srangam_gazetteer_unmatched` curation log).
- X.3 OG model toggle + auto-QA quarantine.
- X.4 implicit-cache request reordering, smarter Gemini fallback, no-new-schema cost telemetry.
