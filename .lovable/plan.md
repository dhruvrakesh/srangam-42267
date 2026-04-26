## You are exactly right — current behavior is not enterprise-grade

What you saw on `/admin/geography-media` is a **fire-and-forget** pattern:

- Click "Backfill all published (50 max)" → frontend opens **one** HTTP call to the edge function and waits.
- Edge function loops 50 articles **serially**, doing 1 evidence query + 1 content scan + 1 AI call per article (~3–8s each with Gemini NER).
- 50 articles × ~5s ≈ **4+ minutes**, while:
  - Supabase edge functions hard-cap at **150s** wall-clock — your batch will be **killed mid-run** with no partial-progress signal.
  - The browser request hangs for the whole duration, no progress, no ETA, no cancel.
  - "Bulk OG" has the same shape — 42 articles × ~10s Gemini image gen + 1.2s pacing ≈ **8 minutes** of pure spinner.

You also asked specifically: *"Are we taking care of timeouts, edge function limits, etc.?"* — **no, not yet**. That's the gap this plan closes.

---

## Enterprise pattern: durable jobs + chunked workers + live progress

Modelled on patterns from Recogito/Pelagios, Arches HIP, and the way Supabase itself runs long imports. Three small primitives, surgically added — no rewrite.

### 1. Persist the job (single source of truth)

New table `srangam_admin_jobs`:

```text
id            uuid PK
kind          text  ('pin_backfill' | 'og_generate' | 'og_force')
status        text  ('queued' | 'running' | 'succeeded' | 'failed' | 'cancelled')
total         int        -- planned items (e.g. 50)
processed     int        -- finished items
succeeded     int
failed        int
cost_usd      numeric    -- running total
last_item     text       -- e.g. "jakhbar-mercury-networks"
last_error    text
started_at    timestamptz
updated_at    timestamptz
finished_at   timestamptz
created_by    uuid (auth.users)
params        jsonb      -- original request body
```

RLS: admin-only read/write via existing `has_role(auth.uid(),'admin')`. Realtime publication enabled on this table only.

### 2. Chunked worker (respects the 150s wall-clock)

The `backfill-article-pins` and `generate-article-og` functions get a `job_id` + `chunk` mode:

- Frontend calls the function with `{ job_id, offset: 0, chunk_size: 5 }`.
- Function processes **5 articles** (well under 150s even with worst-case AI), updates `srangam_admin_jobs` after **every article** (not just at the end), then returns `{ next_offset, done }`.
- Frontend (or a tiny driver function) immediately re-invokes for the next chunk until `done=true`.
- On any per-article failure → increment `failed`, write `last_error`, **continue** (no all-or-nothing loss).
- Cancellation: frontend writes `status='cancelled'` to the row; worker checks at the top of every chunk and exits cleanly.

This eliminates the 150s ceiling without needing background workers or queues.

### 3. Live progress via Supabase Realtime (no polling)

The admin page subscribes to its job row:

```ts
supabase.channel(`job:${jobId}`)
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'srangam_admin_jobs', filter: `id=eq.${jobId}` },
    (payload) => setJob(payload.new))
  .subscribe();
```

UI gets sub-second progress updates. No polling, no hanging fetch.

---

## What the user will see

A real progress card replaces the single grey log line:

```text
┌─ Pin Backfill — running ──────────────────────────┐
│ 17 / 50 articles                                  │
│ ████████░░░░░░░░░░░░░░░░░░░░  34%                │
│ Last: "jakhbar-mercury-networks"  ✓               │
│ Succeeded 16  ·  Failed 1  ·  Cost $0.0042        │
│ Started 7:39:36 PM  ·  ETA ~2m 10s                │
│                              [ View log ] [Cancel]│
└───────────────────────────────────────────────────┘
```

ETA = `(elapsed_ms / processed) * (total - processed)`, recomputed every update.
On completion the card collapses to a green/red summary with a "Run again" / "Retry failed only" button.
Activity log keeps its current line-by-line stream but is now **secondary** to the progress card.

The same component is reused for "Generate missing", "Force regenerate", and per-article jobs (per-article jobs just have `total=1` so the bar fills in one step, but still reports cost + provider).

---

## Files to add / change (surgical)

**New (3):**
- `supabase/migrations/<ts>_admin_jobs.sql` — table + RLS + realtime publication.
- `supabase/functions/_shared/jobs.ts` — `createJob`, `updateJob`, `checkCancelled`, `finishJob` helpers.
- `src/hooks/useAdminJob.ts` — subscribes to a job row, returns `{job, progress, etaMs, cancel()}`.
- `src/components/admin/JobProgressCard.tsx` — the visual card above.

**Edited (3, surgical):**
- `supabase/functions/backfill-article-pins/index.ts` — add `job_id` + `offset` + `chunk_size` params; per-article job updates; cancellation check; return `next_offset`. Existing single-article path unchanged.
- `supabase/functions/generate-article-og/index.ts` — same pattern (chunkable bulk mode, single-article path unchanged).
- `src/pages/admin/GeographyMedia.tsx` — replace bulk handlers with: `createJob → loop invoke chunks until done`, render `<JobProgressCard jobId=…/>`. Per-article handlers unchanged.

**Documentation (2):**
- `docs/RELIABILITY_AUDIT.md` — add "Long-running admin jobs" invariant section.
- `docs/architecture/SOURCES_PINS_SYSTEM.md` — note chunking contract + cancellation semantics.

---

## Provider strategy (per your earlier instruction)

Already in place from H.3: `_shared/ai-provider.ts` selects **your Gemini key first, your OpenAI key as fallback** — Lovable AI Gateway is **not** used. This plan does not change that. Cost continues to be tracked per article and rolled into `srangam_admin_jobs.cost_usd`.

---

## Why this is safe for the running site

- Zero changes to public read paths (article page, mini-map, Atlas).
- New table is admin-only; no RLS impact on existing tables.
- Edge functions remain backward-compatible: calling them **without** `job_id` keeps the old single-shot behaviour, so any existing automation keeps working.
- Each chunk is its own short-lived edge invocation — well under the 150s ceiling, and a crashed chunk only loses ≤5 articles, never the batch.
- Idempotent upserts (already in place) mean retrying a failed chunk is free.

---

## Out of scope (call out explicitly)

- No queue service (pg_cron / pg_boss / external worker). The chunked self-driving frontend pattern is sufficient for current volumes (~50–500 articles); we can graduate to pg_cron later without changing the table shape.
- No email-on-completion. Toast + persistent job row is enough; can add later.
- Atlas page (`/maps`) wiring is already done in H.3 — not touched here.
