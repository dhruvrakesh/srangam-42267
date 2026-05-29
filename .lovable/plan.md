## Read-only findings revived from docs, code, database, and logs (2026-05-29)

- Lovable Cloud backend is healthy; not a platform outage.
- DB truth right now:
  - `srangam_articles` published = **60**, articles with pins = **11**, total pins = **27** (all confidence `B`, source `content_scan`).
  - `srangam_gazetteer` rows = **32** — heavily oceanic/port/inscription, almost no Kashmir / Śakti-pīṭha / Jyotirlinga / inland sacred-geography nodes.
  - Admin screenshot shows **44 published / 24 of 44 stuck**. Live DB shows 60. Either the admin page used a stale snapshot or your admin view is scoped (e.g. cached React Query result for the original 44-article cohort). Must be reconciled in Phase G0 before any code change.
- Pin Backfill jobs (`srangam_admin_jobs`, kind=`pin_backfill`) failure pattern confirmed in edge logs:
  - `pin_ai` for one article reached **110 807 ms** (longest seen). Several articles take 19–50 s.
  - The self-pump fetch then hits Supabase Edge runtime **504 IDLE_TIMEOUT (150 s)**.
  - Heartbeat is updated only after `reportItem()` per article, so during a long AI call the UI correctly flags “No heartbeat for 90s” and the watchdog reaps the row.
  - Multiple recent jobs ended with `last_error = 'watchdog: no heartbeat'`. Latest one was Cancelled by the user mid-run at 24/44.
  - Nightly cron `srangam-pin-enrichment-nightly` is scheduled and enqueues `enqueue_pin_backfill_sweep_job(20, 3)` — but the same single-invocation chunk pattern means the same 504/heartbeat reaping happens silently overnight.
- Article pages: `OceanicArticlePage` only renders the “Geographical Context” section when `article.pins.length > 0`, and even then the Leaflet map is gated behind a manual “View Interactive Map” click. The article in your second screenshot (`satisar-springs-sacred-flow`) has **0 pins**, so the reader sees only the `Maps, Imagery & Astronomy` launcher card — which is correct given current data but feels empty.
- `/maps-data?focus=<slug>` is linked from `ImagingLabLauncher`, but `MapsData.tsx` does not currently read `focus`; the Article Atlas does not filter or scroll to the article’s places.
- `/atlas?id=...` deep-links (used in `ArticleMiniMap` popups) target the static `public/atlas/atlas_nodes.json` registry, which is unrelated to `srangam_gazetteer` IDs — so those links can dead-end.
- RLS + GRANTs verified: public can `SELECT` pins/gazetteer/admin_jobs; only admin can write; service_role used by edge functions. No security change is implied by any phase below.

## Enterprise recovery principle

Heal the existing architecture, do not rebuild it.

```text
Existing durable job table + existing pins + existing mini-map + existing atlas
        ↓
make background jobs truly async, bounded, observable
        ↓
show geography to readers only when truthful
        ↓
expand gazetteer deterministically; AI curates, never expands unattended
```

No broad rewrite. No new framework. No public write access. No change to the slug/article resolver hierarchy. No destructive deletes on production rows.

---

## Phase G0 — Documentation-first freeze and parity check

**Docs**
- `.lovable/plan.md`: dated “Geo Automation Recovery” section pointing at this plan.
- `docs/ADMIN_JOBS.md`: add the observed failure mode (single AI call can exceed self-pump 150 s window; per-article heartbeat is too coarse).
- `docs/architecture/SOURCES_PINS_SYSTEM.md`: state the current truth — maps render only when pins exist; empty-pin articles need enrichment, not UI pretending.

**Read-only validation before any edit**
- Re-confirm: published count (60), with-pins (11), total pins (27), latest job statuses, active cron rows.
- Reconcile the **44 vs 60** mismatch: is the admin page scoped (e.g. theme filter, React Query stale cache, only counting `og_image_status='active'`), or is it a deploy lag? Document the answer; do not patch UI counts until cause is named.

**Rollback**: docs only.

---

## Phase G1 — Stabilize Pin Backfill (no schema change)

**Goal**: stop stalling, make cron + UI runs reliable end-to-end, preserve idempotency.

**Files**
- `supabase/functions/backfill-article-pins/index.ts`
- `supabase/functions/_shared/jobs.ts` (only if a tiny reusable heartbeat helper is justified)
- `src/pages/admin/GeographyMedia.tsx`
- `docs/ADMIN_JOBS.md`

**Surgical changes**
1. **True async pump**: the HTTP entry validates auth, claims the chunk, returns `202 Accepted` immediately, and runs `EdgeRuntime.waitUntil(processChunkAndPump(...))`. The next self-pump is scheduled only after the chunk completes (or aborts cleanly), so the outer 150 s budget no longer caps cumulative AI latency across articles.
2. **Chunk size = 1 in AI mode** for both UI bulk runs and the nightly cron. Deterministic-only runs may keep chunk_size=3.
3. **Heartbeat during long AI**:
   - `touchHeartbeat()` before evidence scan, after deterministic scan, immediately before AI call, and on a setInterval (~25 s) while the AI promise is pending. Cleared on settle.
   - This kills the 90 s false-stall banner and the 5-minute watchdog reap during real work.
4. **Bound AI input/latency**:
   - Keep deterministic regex scan over the full text.
   - For AI, feed a spatially focused window (paragraphs containing existing gazetteer hits ± neighbours; capped at e.g. 20–25 k chars) rather than the whole 75–85 k char article.
   - Tighten per-article AI timeout (e.g. 45 s) inside `aiExtractPlaces` opts. If it trips, log + continue with deterministic-only pins. Never let one article eat the pump.
5. **Idempotency preserved**: keep `upsert` on `(article_id, gazetteer_id)`, never delete; reruns are safe.
6. **Fix admin totals**: when the UI inserts the job row it uses `limit` as `total`. Have the worker patch `total` to the real candidate count returned (already partially in place — make it the first action of chunk 0). Display `processed / actual_total`.
7. **Re-entrancy guard hygiene**: the SQL guard already blocks fresh sweeps inside 30 min; document that a long manual run will skip the next nightly cron, which is the desired safety.

**No DB schema migration expected.** All `srangam_admin_jobs` fields used by the code already exist in the live schema (verified).

**Validation**
- Run one zero-pin article manually → succeeds, heartbeat steady, no 504.
- Run a 3-article bulk → all three terminal, no watchdog reap.
- Confirm no duplicate rows in `srangam_article_pins` for any article.
- Confirm admin “Total pins” and “With pins” counters climb after a run.
- Tail logs for `IDLE_TIMEOUT` — expect zero.

**Rollback**: revert two files; pin data is untouched.

---

## Phase G2 — Make article geography visible to readers, only when truthful

**Goal**: readers immediately grasp Bharatvarsha reach; performance budgets intact; no fake maps.

**Files**
- `src/components/oceanic/OceanicArticlePage.tsx`
- `src/components/articles/ArticleMiniMap.tsx`
- `src/components/imaging/ImagingLabLauncher.tsx`
- `src/pages/MapsData.tsx`
- `src/components/maps/ArticleAtlasMap.tsx`
- `docs/architecture/SOURCES_PINS_SYSTEM.md`

**Surgical UX**
1. **Articles with pins**:
   - Keep “Geographical Context” where it is (after main content) but render a compact summary strip immediately: `N places · confidence legend · top 3 place chips` — no Leaflet bundle needed for this.
   - Lazy-mount `ArticleMiniMap` when the section enters viewport (IntersectionObserver) instead of only on click. Click can still toggle expand/collapse.
2. **Articles without pins**:
   - No empty map, no skeleton pretending. Keep universal Atlas / Map Explorer links and (admin only) the “Add geo-pins” deep-link. Today’s behaviour is correct; only add a small italic “Geography not yet mapped — opening soon as gazetteer expands” line if you approve.
3. **Wire `/maps-data?focus=<slug>` for real**:
   - `MapsData.tsx` reads `focus`, scrolls to the Article Atlas, and passes a filter into `ArticleAtlasMap` that highlights only that article’s places (others dim, not removed). On click of a focused marker, popup opens by default.
4. **Fix deep-link semantics in `ArticleMiniMap` popups**:
   - Replace `/atlas?id=<gazetteer_id>` (which keys against `public/atlas/atlas_nodes.json`, a different namespace) with `/maps-data?focus=<articleSlug>#place=<gazetteer_id>`, so the link lands on the live DB-driven atlas, not the static one.
5. **Corpus reach signal on `/maps-data`**: one quiet line — `27 places mapped across 11 articles` (numbers pulled from `useArticleGeography`), no admin warnings exposed publicly.

**Performance invariants** (must hold)
- No Leaflet/Mapbox bundle on articles with zero pins.
- No new per-article DB roundtrip — `ResolvedArticle.pins` remains the single source.
- Phase X.8 render-first/hydrate-second contract untouched.
- Phase Y “every pinned article surfaces ArticleMiniMap” invariant preserved.

**Rollback**: presentation-only file reverts.

---

## Phase G3 — Curated gazetteer expansion (additive only)

**Goal**: pin counts cannot meaningfully grow if the gazetteer is missing the places articles actually discuss.

**Approach**
- Audit the 49 zero-pin published articles to extract the **recurring** place names (Satīsar, Srinagar, Pahalgam, Varāhamūla/Baramulla, Gopādri, Hinglaj, Kamakhya, Jakhbar, Dwārakā, Prabhāsa, Somnātha, the 12 Jyotirliṅga loci, Sapta-Sindhu sites, etc.).
- Insert curated rows into `srangam_gazetteer` with `canonical_name`, full `name_variants[]` (including IAST + Hunterian + vernacular), `latitude/longitude`, `precision`, `era_tags`, `feature_type`, `country`, `external_refs` (Wikidata Q-id when available).
- Use the **data-change tool** (insert) with explicit description rows per batch (no schema migration; production data is additive and immutable per your rule).
- Keep AI as **curation support only**: the existing `pin_ai` path may *suggest* candidates, but only reviewed canonical rows become durable gazetteer entries. A later optional phase can add an `unmatched_candidates` queue; not in this pass.

**Validation**
- Re-run pin backfill with `skip_ai: true` on a small set first; expect pin growth driven by deterministic matches (confidence `B`), not noisy `C`.
- Confirm new pins point at correct lat/lon by spot-check on the Article Atlas.

**Rollback**: rows are additive; if one is wrong, curate (update) in a follow-up — never destructive delete.

---

## Phase G4 — Standardize the other background jobs to the G1 pattern

**Surfaces to audit/standardize after G1 ships**
- `extract-purana-references` (already chunked; needs same heartbeat-during-AI guarantee, true async pump, chunk_size=1 in AI mode).
- `generate-article-og` (bulk branch already self-pumps per article; verify async pump + heartbeat before image API call).
- `correlate-corpus` (single-shot; verify it heartbeats during the in-DB RPC and chunked inserts).
- Any future deterministic analyzer.

**Each must have**
- Durable `srangam_admin_jobs` row.
- Bounded chunk size.
- Heartbeat during long AI/network waits, not just per-item.
- Cancellation check between chunks.
- Terminal `succeeded | failed | cancelled` always reached.
- Cron re-entrancy guard at the SQL boundary.
- Visible admin progress via existing `JobProgressCard`.

**Cron handling**
- Update schedules only after code is stable. Keep the current 20-article nightly pin cap until you approve a higher one. Document costs in `docs/ADMIN_JOBS.md`.

**Rollback**: per-function, no coupled rollout.

---

## Phase G5 — Tests and observability guardrails

**Tests**
- Edge-function unit tests (Deno):
  - chunk target selection (`only_zero_pin` branch returns expected set).
  - idempotent upsert payload shape.
  - pump continuation decision (done vs. not done).
  - heartbeat wrapper fires at the right boundaries.
- Frontend tests (Vitest):
  - article with pins → summary strip + lazy `ArticleMiniMap` render.
  - article without pins → no map bundle import.
  - `/maps-data?focus=slug` → Article Atlas receives filter + scrolls into view.

**Operational checks after each phase**
- `srangam_admin_jobs`: latest jobs reach a terminal state, no `watchdog: no heartbeat`.
- Edge logs: zero `IDLE_TIMEOUT` for pin backfill.
- Public article pages: no Leaflet in critical path for zero-pin articles.

---

## Out of scope (explicitly)

- No rewrite of the article system, resolver, or list pages.
- No edits to `src/integrations/supabase/{client,types}.ts` or `.env`.
- No new public-write RLS policies.
- No placeholder maps for zero-pin articles.
- No uncontrolled AI expansion of the gazetteer.
- No nightly cap increase without an explicit cost note in `docs/ADMIN_JOBS.md`.
- No changes to Phase X.8 / Phase Y / Phase AA-AB invariants.

## Recommended implementation order

1. **G0 + G1** — unblock the stuck pipeline; this is the only phase that fixes the live symptom in the screenshot.
2. **G2** — make geography visible to readers truthfully; wires `/maps-data?focus=`.
3. **G3** — curated gazetteer expansion so G1 starts producing real pin growth.
4. **G4** — apply the G1 pattern to the other background jobs.
5. **G5** — lock the invariants with tests and post-deploy checks.

## Risk and rollback summary

| Phase | Files touched | Risk | Rollback |
|------|---------------|------|----------|
| G0 | docs only | none | discard doc edits |
| G1 | 1 edge function + 1 admin page + 1 shared helper (maybe) | medium (async semantics) | revert files; pin data intact |
| G2 | 5 frontend files + 1 doc | low (presentation) | per-file revert |
| G3 | data inserts into `srangam_gazetteer` | low (additive) | curate, never delete |
| G4 | per-edge-function | medium | per-function revert |
| G5 | new test files | none | drop test files |
---

## Phase G1 + G2 — Implemented 2026-05-29

**Edge function `backfill-article-pins`:**
- True async pump: chunked jobs now return `202 Accepted` immediately; chunk + self-pump run via `EdgeRuntime.waitUntil`. Removes 504 IDLE_TIMEOUT failure mode.
- Heartbeat-during-AI: 25s `touchHeartbeat` interval ticks while the `aiExtractPlaces` promise is pending. Cleared on settle. Kills the "no heartbeat for 90s" false stall.
- AI input bounded to 25k chars; deterministic regex scan still uses full text.
- Chunk size forced to 1 in AI mode (deterministic-only may keep ≤3).
- First chunk patches `srangam_admin_jobs.total` to the real candidate count.
- Mid-chunk cancellation check between articles.
- Fixed latent bug: slug-mode `.or()` query was unawaited/unassigned → always returned 404. Now properly resolves single-article runs.

**Article page UX (`OceanicArticlePage`):**
- `ArticleMiniMap` auto-mounts via IntersectionObserver (200px rootMargin) when the Geographical Context section scrolls into range — no more click-to-reveal.
- Section header now shows `N places referenced · View in Article Atlas →` link to `/maps-data?focus=<slug>`.
- Zero-pin articles still render no map (Leaflet bundle never loads).

**Article Atlas (`/maps-data`):**
- Reads `?focus=<slug>` query param; scrolls Article Atlas card into view on load.
- `ArticleAtlasMap` accepts `focusSlug` prop — clusters containing the focused article render at fillOpacity 0.85 / weight 2.5; non-matching clusters dim to 0.15 / weight 0.8 with reduced radius.
- Header text shows "Highlighting article: <slug>" when focus is active.

**Out of this phase (deferred):**
- G3 curated gazetteer expansion (Kashmir, Śakti-pīṭha, Jyotirlinga loci).
- G4 standardizing other background jobs to the same async pattern.
- G5 unit tests for chunking, idempotent upsert, and focus filter.
