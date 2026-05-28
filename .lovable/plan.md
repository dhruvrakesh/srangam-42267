## Phase X — Admin Pipelines: Reliability, Resumability, Quality & API Optimization

**Frozen baseline: 2026-05-28.** Anything stamped before this date in `docs/RELIABILITY_AUDIT.md` is treated as Do-Not-Break.

A surgical, additive, multi-phase plan addressing four operator complaints from the Geography & Media admin page:

1. Pin backfill shows no visible progress and can't be resumed.
2. Stop / resume / per-chunk commit semantics are undocumented.
3. Quality of pin extraction and OG image generation.
4. Whether the user's Gemini / OpenAI keys are utilised optimally.

This is **plan-only**. No production behaviour changes until each sub-phase is approved individually. Every step is additive to the substrate that already exists: `srangam_admin_jobs` (RLS admin-only, in `supabase_realtime` publication), `useAdminJob` (Realtime subscription), `JobProgressCard`, `backfill-article-pins` (chunked, `job_id` / `offset` / `chunk_size`), `generate-article-og` (Gemini-first via `_shared/ai-provider.ts`), `_shared/observability.ts` (structured `evt` logs).

---

### Verified current state (read from repo + DB schema)

| Claim | Evidence | Status |
|---|---|---|
| `srangam_admin_jobs` exists, admin-RLS, in realtime publication | schema + migration `20260426141244` | ✅ |
| Pin chunked driver runs **in the browser** (`backfillPinsBulk` while-loop in `GeographyMedia.tsx`) | lines 188-217 | ✅ (bug source) |
| `JobProgressCard` only mounts while `activeJobId` is in local state | line 427-428 | ✅ (no rehydrate) |
| OG bulk loop is also browser-driven (`bulkOg`, lines 302-340) | same | ✅ (same failure mode) |
| `cancel()` flips status only; current chunk completes before next `isCancelled` check | `useAdminJob.ts` + edge `isCancelled` at chunk boundary | ✅ (documented gap) |
| Pin tiers A/B/C exist but admin UI shows only a total count | column "Pins" in row table | ✅ |
| `aiExtractPlaces` truncates input at 60 000 chars | `_shared/ai-provider.ts` line 286 | ✅ |
| OG model is hardcoded `gemini-2.5-flash-image` (Nano Banana v1) | `_shared/ai-provider.ts` line 346 | ✅ |
| Fallback on **any** Gemini error → OpenAI (no 4xx-terminal check) | line 449-453 | ✅ |
| `srangam_event_log` table — **planned but does not exist yet** (per comment in `observability.ts`) | observability.ts line 19 | ⚠ |
| Platform policy: **no backend rate limiting** | knowledge `no-backend-rate-limiting` | ⚠ kills RPM guard idea |
| Gemini explicit `cachedContent` has a **~1024-token floor**; current SYSTEM_PROMPT is ~80 tokens | Gemini docs | ⚠ kills explicit cache idea |
| `srangam_admin_jobs` has no `heartbeat_at` column | schema dump | ✅ |
| Per-article pin upsert is its own transaction (durable after each article) | `backfillOne` Stage 4 | ✅ |

Two ideas from the prior draft are **withdrawn** because of the above:

- ❌ Backend RPM token bucket — forbidden by platform policy. Replaced with client-side pacing + smarter fallback.
- ❌ Explicit `cachedContent` for the NER system prompt — too small to fit the 1024-token floor. Replaced with implicit caching by **reordering** the request payload so static parts are first (Gemini implicit cache kicks in automatically at the eligible prefix).

---

### Phase X.1 — Resumable, observable jobs (no behaviour risk, ~1 day)

Goal: progress always visible, jobs survive page reload, no orphan `running` rows.

1. **Server-driven self-pump.** Extend `backfill-article-pins` and `generate-article-og` with a `mode: "pump"` body field. When set with a `job_id`, after writing per-item progress and before returning, the function calls `EdgeRuntime.waitUntil(fetch(self_url, { body: { job_id, offset: next_offset, mode: "pump" } }))`. The browser kicks off chunk 0 only; the server walks the rest. Stays well inside the 150 s wall-clock per invocation (chunks are 5 articles).
2. **Heartbeat watchdog.** Additive migration: add `heartbeat_at timestamptz` to `srangam_admin_jobs`. `reportItem` in `_shared/jobs.ts` sets it on every write. New SQL function `public.reconcile_stuck_admin_jobs()` (SECURITY DEFINER, search_path=public) flips `status='running' AND heartbeat_at < now() - interval '5 min'` to `failed` with `last_error='watchdog: no heartbeat'`. Scheduled via `pg_cron` every 5 min (uses the existing `pg_cron + pg_net` pattern documented in our edge-function knowledge).
3. **Rehydrate on mount.** `GeographyMedia.tsx` queries `srangam_admin_jobs where status='running' and kind in ('pin_backfill','og_generate','og_force') order by started_at desc limit 1` on mount; if found, hydrates `activeJobId` so `JobProgressCard` reappears after refresh.
4. **A/B/C breakdown in progress card.** `reportItem` payload patched to include `{a,b,c}` counters that accumulate in `params.tier_totals` JSONB; `JobProgressCard` renders `Last: <slug> (A:2 B:5 C:1)`. Additive — no schema change.
5. **Documentation.** New `docs/ADMIN_JOBS.md` (job contract, kinds, params shape, pump semantics, watchdog SLA, cancel-window guarantee). Update `docs/RELIABILITY_AUDIT.md` with Phase X.1 invariants and a frozen-baseline-2026-05-28 marker per user preference. Update `docs/SCALABILITY_ROADMAP.md` triggers.

**Acceptance gate:** mid-run tab refresh re-attaches to the running job; closing the browser entirely still completes the job server-side; a deliberately-killed worker is reaped by the watchdog within 5 min; A/B/C counters appear in the card. Zero edits to public components, public routes, public RLS.

---

### Phase X.2 — Pin extraction quality (~1 day)

Goal: more correct pins per article, with visible confidence, without spurious noise.

1. **Wider variant matching.** Extend `matchAiName` in `backfill-article-pins/index.ts` with a single deterministic fold: lowercase → NFD diacritic strip → IAST→Hunterian rewrite (`ā→a, ī→i, ū→u, ṛ→ri, ś→sh, ṣ→sh, ñ→n, ṭ→t, ḍ→d, ṇ→n, ṅ→ng, ḥ→''`). Pure function, unit-testable, no schema change. Catches *Dwāraka / Dvaraka / Dwarka* collisions without expanding the gazetteer.
2. **Self-healing curation log.** New table `srangam_gazetteer_unmatched (id, ai_name text, normalized text, occurrences int, last_seen_article_id, last_seen_at)` with admin-only RLS, `GRANT` block per platform contract. AI-returned names that fail `matchAiName` increment `occurrences` via `ON CONFLICT (normalized) DO UPDATE`. Admin page gains a small "Pending gazetteer additions (top 20 by occurrences)" panel — operator can promote real toponyms with one click into `srangam_gazetteer` (curation-over-expansion philosophy preserved). No automatic promotion.
3. **Confidence surfaced in per-article table.** Pins column changes from `7` to `7 (A:2 B:4 C:1)` using counts already computed by `backfillOne`. One extra `select confidence, count(*) ... group by` query in the admin page's article fetch.
4. **Token-budget lift.** Raise `aiExtractPlaces` input cap from 60 000 → 200 000 chars for the **Gemini path only** (still <5 % of 1 M-token ceiling, marginal cost ≤$0.02/article at current pricing). OpenAI fallback stays at 60 000 because gpt-4o-mini has a 128 K context window.

**Acceptance gate:** representative 5-article sample shows ≥15 % more correct pins (manual spot-check), no false positives, `srangam_gazetteer_unmatched` populates and the admin promote-flow works end-to-end.

---

### Phase X.3 — OG image quality & safety (~1.5 days)

Goal: better covers, never silently publish a bad render.

1. **Model upgrade behind a feature flag.** Add optional `model` to the `generate-article-og` request body. `_shared/ai-provider.ts` `callImage` learns three Gemini paths: `gemini-2.5-flash-image` (default, current), `gemini-3.1-flash-image-preview` (Nano Banana 2, better composition), `gemini-3-pro-image-preview` (hero articles, highest fidelity). Pricing table updated. Default unchanged until acceptance gate passes.
2. **Admin toggle.** `GeographyMedia.tsx` gains a compact `Model: [Default | NB2 | Pro]` selector that flows into both single and bulk OG actions; per-image cost shows in the activity log.
3. **Auto-QA on upload.** Before flipping the new asset to `status='active'`, the edge function runs three cheap checks on the returned bytes: (a) decoded dimensions = the requested aspect (1792×1024 ± 2 px), (b) file-size between 80 KB and 4 MB (catches transparent-output regressions and bloated re-encodes), (c) image is not >95 % single-colour (catches blank/solid-fill failures). On any failure: mark new asset `status='quarantined'`, leave the existing `active` row in place, surface a "needs review" badge on the per-article row. No external library — pure-Deno PNG header parse + sample-pixel scan keeps the function self-contained.
4. **Prompt-hash idempotency stays correct.** Hash already includes the prompt text; we extend it to include `model` so a Pro regen never silently no-ops against a prior NB1 hash.
5. **Documentation.** Append `docs/OG_IMAGE_SYSTEM.md` with model matrix, QA contract, and frozen-baseline marker.

**Acceptance gate:** one admin-triggered Pro regen produces a visibly better image and bumps `srangam_media_assets.version`; quarantine path is provable by forcing a deliberately broken prompt (e.g. empty); zero accidental supersedes of good covers.

---

### Phase X.4 — API-key utilisation (~1 day)

Goal: lower cost per call, fewer wasted tokens, predictable provider behaviour. **No backend rate limiting** (platform-forbidden).

1. **Implicit-cache friendly request shape.** In `callGemini`, move `systemInstruction` + `generationConfig.responseSchema` (the static prefix) ahead of the per-article `contents`. Gemini's implicit cache kicks in automatically when the eligible prefix exceeds the model floor; this reordering is a no-op when it doesn't and a free token discount when it does. No `cachedContent` API call needed (which our 80-token system prompt cannot satisfy anyway).
2. **Smarter fallback decision.** Today `callImage` and `aiExtractPlaces` fall through to OpenAI on **any** Gemini error. Tighten to: fall back only on `429 | 5xx | timeout | quota`; treat `400 | 403 | safety-block` as **terminal** per platform "4xx is terminal" guidance and emit a single human-readable `last_error` on the job row. Stops us from silently double-billing OpenAI when the real problem is a malformed prompt or content-safety reject.
3. **Client-side pacing on bulk pin backfill.** `backfillPinsBulk` already paces 0 ms between chunks (OG paces 600 ms). Add a matching `await new Promise(r => setTimeout(r, 400))` between pin chunks. This is **client-side** (browser tab driving the loop today; the X.1 pump replaces it with a server-side `await` of identical duration), so it does not violate the no-backend-rate-limiting policy.
4. **Telemetry via existing rows, not a new view.** Skip the materialised view (would require `srangam_event_log`, which is still on the roadmap). Instead, add a tiny `useAdminJobHistory(kind, days)` hook over `srangam_admin_jobs` (already has `cost_usd, processed, started_at, finished_at, kind, status`) and a "Last 30 days" stacked bar on the admin Analytics page — zero schema change, real cost visibility today, and a clean upgrade path when `srangam_event_log` lands.
5. **Documentation.** New `docs/AI_PROVIDER_OPTIMIZATION.md`: implicit-cache rationale, fallback decision matrix, client-side pacing rules, why backend rate-limiting is intentionally absent (platform policy link). Frozen-baseline marker.

**Acceptance gate:** a 50-article bulk pin backfill costs ≤80 % of the previous run measured from `srangam_admin_jobs.cost_usd`; zero unjustified OpenAI invocations (verified from `last_error` on synthetic 400s); admin Analytics chart renders without new tables.

---

### Out of scope (deferred candidates)

- `srangam_event_log` table itself (separate workstream — already planned in `observability.ts`).
- pg_boss / external queue worker — overkill while self-pump satisfies the 150 s wall-clock budget.
- Bulk re-QA of the existing 44 published OG images — admin discretion to control AI spend.
- Visual-regression snapshots for OG covers (candidate for Phase Y).
- Per-tenant API-key rotation UI (keys live in Supabase secrets; one-line rotation today).

### Roll-out order (each its own approval gate + doc update)

X.1 (job substrate, zero behaviour risk) → X.4 (cost guard rails before we scale model usage) → X.2 (pin quality) → X.3 (image quality, the riskiest because output is user-visible).

### Files that will be touched (per phase, planning only)

- **X.1** — `supabase/functions/backfill-article-pins/index.ts`, `supabase/functions/generate-article-og/index.ts`, `supabase/functions/_shared/jobs.ts`, `src/pages/admin/GeographyMedia.tsx`, `src/components/admin/JobProgressCard.tsx`, `src/hooks/useAdminJob.ts`, new migration for `heartbeat_at` + `reconcile_stuck_admin_jobs()` + `pg_cron`, new `docs/ADMIN_JOBS.md`, edits to `docs/RELIABILITY_AUDIT.md` and `docs/SCALABILITY_ROADMAP.md`.
- **X.2** — `supabase/functions/backfill-article-pins/index.ts`, `src/pages/admin/GeographyMedia.tsx`, new migration for `srangam_gazetteer_unmatched` (with `GRANT` block per platform contract), edits to `docs/ARTICLE_DISPLAY_GUIDE.md` or new `docs/PIN_QUALITY.md`.
- **X.3** — `supabase/functions/_shared/ai-provider.ts`, `supabase/functions/generate-article-og/index.ts`, `src/pages/admin/GeographyMedia.tsx`, edits to `docs/OG_IMAGE_SYSTEM.md`.
- **X.4** — `supabase/functions/_shared/ai-provider.ts`, `src/pages/admin/GeographyMedia.tsx`, new `src/hooks/useAdminJobHistory.ts`, edits to `src/pages/admin/Analytics.tsx` (if it exists; else a new card), new `docs/AI_PROVIDER_OPTIMIZATION.md`.

Zero edits anywhere outside `src/pages/admin/**`, `src/components/admin/**`, `src/hooks/useAdmin*`, `supabase/functions/**`, `supabase/migrations/**`, and `docs/**`. Public routes, public components, public RLS, end-user UI: **untouched**.
