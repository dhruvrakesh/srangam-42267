## Phase X (continued) — Puranic extraction reliability + cross-corpus correlation

**Frozen baseline: 2026-05-28.** Additive only. Public routes, components, RLS, end-user UI: untouched. Phases X.1–X.4 already cover pin backfill + OG generation; this extends the same substrate to the Puranic Citation Extraction page and lays a read-only analytics layer over what already exists.

---

### Verified current state (re-checked against repo + live DB schema)

| Claim | Evidence | Status |
|---|---|---|
| `PuranaReferences.tsx` shows progress from **local React state only** — `setProgress` is never updated during the run; "0/44 · 22 minutes" is a static placeholder | `PuranaReferences.tsx` 79-91, `ExtractionProgress` widget | ✅ confirmed bug |
| `extract-purana-references` loops **all 44 articles in one invocation**, no chunking, no job row, no resumability — will hit the 150 s wall-clock on bulk runs | `index.ts` 41-249 | ✅ confirmed |
| Function calls **OpenAI gpt-4o-mini directly** (line 161), bypassing `_shared/ai-provider.ts` which already exposes a Gemini-first `aiExtractPlaces` + `callImage` and is used by pins / OG | `_shared/ai-provider.ts` 277-308 | ✅ ignores user's Gemini key today |
| `srangam_admin_jobs` exists with `heartbeat_at`, RLS admin-only, in realtime publication; `_shared/jobs.ts` exposes `createJob`, `reportItem`, `touchHeartbeat`; `JobKind` is a string-union — adding `'purana_extract'` is a 1-line additive edit | live schema + `_shared/jobs.ts` 24, 50-73, 91, 140 | ✅ substrate ready |
| Per-article `.insert(refsToInsert)` is its own statement — **partial progress is already durable**, only the UI doesn't know about it | `index.ts` 230-238 | ✅ no rollback risk |
| **The correct pin table is `srangam_article_pins`** (columns: `article_id`, `gazetteer_id`, `confidence`, `source`, `display_order`) — *not* `srangam_pins` (that name does not exist) | live schema | ⚠ correction vs. prior draft |
| `srangam_correlation_matrix` **already exists** (theme, source_type, coordinates, pin_data jsonb, bibliography jsonb) — a curated public-read table populated manually | live schema | ⚠ correction — must extend, not duplicate |
| `srangam_cross_references` keys on `source_article_id` / `target_article_id`, has `reference_type`, `strength`, `bidirectional` — public-read, admin-write | live schema | ✅ |
| `srangam_purana_references` keys on `article_id`, has `purana_name`, `purana_category`, `confidence_score`, `validation_status`, `metadata jsonb` — public-read, admin-write | live schema | ✅ |
| `srangam_cultural_terms` is **not** article-keyed — it's a global gloss table (`term`, `module`, `translations`); article ↔ term mapping today is implicit via `{{cultural:term}}` in-prose markers, not a join row | live schema | ⚠ correction — term-correlation needs a derived view, not a direct join |
| `CrossReferencesBrowser.tsx` already imports `react-force-graph-2d` — graph dep is in the bundle | file head | ✅ reuse |
| Admin router lazy-loads pages from `src/pages/admin/` under `<AdminLayout>` gated by `<ProtectedRoute>` — adding one route is additive | `src/App.tsx` 71-84, 224-226 | ✅ |
| Phase X.1 substrate (self-pump, heartbeat watchdog cron, `JobProgressCard`, `useAdminJob`) is live as of 2026-05-28 | prior migrations + `_shared/jobs.ts` | ✅ reusable |

Conclusion: the Puranic page exhibits the **same disease** X.1 cured for pins/OG. Same cure, applied surgically. Correlation work must **extend** what already exists (`srangam_correlation_matrix`, `srangam_cross_references`) and treat cultural-term linkage as a *derived* signal, not invented joins.

---

### Phase X.5 — Puranic extraction: adopt the job substrate (~1 day, zero behaviour risk)

Goal: real per-article progress, survives page refresh, resumable, watchdog-reaped, uses the user's Gemini key first.

1. **Wrap the edge function in the shared job contract.** Add `'purana_extract'` to the `JobKind` union in `_shared/jobs.ts` (1 line). Extend `extract-purana-references/index.ts` request body to `{ article_id?, batch_mode?, job_id?, mode?: 'start' | 'pump', offset?, chunk_size? }`. On `mode:'start'` (or legacy `batch_mode:true`) the function calls `createJob({ kind:'purana_extract', total: published_count, params:{ chunk_size:3 } })`, returns `{ job_id }` immediately, and kicks the first pump via `EdgeRuntime.waitUntil(self-reinvoke)` — same pattern as `backfill-article-pins`. On `mode:'pump'` it processes `params.chunk_size` articles starting at `offset` then self-reinvokes for `offset + chunk_size` if more remain. Single-article (`batch_mode:false` + `article_id`) path stays **synchronous and unchanged** — the per-row "Extract" button keeps working exactly as today.

2. **Heartbeat + tier_totals.** After each article completes, call `reportItem(supabase, { job_id, processed:i+1, succeeded:n, failed:m, cost_usd, last_item: slug })` — `_shared/jobs.ts` already stamps `heartbeat_at` on every write. Accumulate `{ high: ≥0.80, mid: 0.60-0.79, low: <0.60 }` counters into `params.tier_totals` JSONB (same idiom X.1.1 used for A/B/C). The existing `reconcile_stuck_admin_jobs()` cron (every 5 min) reaps zombies for free — no new SQL.

3. **Switch provider to Gemini-first via `_shared/ai-provider.ts`.** Add `aiExtractCitations(text, { system, schema, fallback })` colocated with `aiExtractPlaces` (lines 277-308). Same Gemini → OpenAI fallthrough, same **4xx-terminal** rule from X.4 (no silent double-billing), same implicit-cache-friendly payload ordering (system + schema first, per-article content last). The existing inline OpenAI call in `extract-purana-references` is replaced with one call to this helper. Single source of truth.

4. **Re-plumb the UI to the job substrate.** `PuranaReferences.tsx`:
   - Replace the fake `progress` local state + the `ExtractionProgress` widget (in the **batch** path only) with `<JobProgressCard jobId={activeJobId} />` — proven on Geography & Media.
   - Add `useAdminJob('purana_extract')` rehydrate-on-mount (3 lines, same pattern as `GeographyMedia.tsx` after X.1.4) so refreshing the tab re-attaches to a running job.
   - Wire the "Extract All Published Articles" button to invoke with `mode:'start'`, capture `job_id`, set `activeJobId`. Card then renders real %, last slug, tier breakdown `(H:n M:n L:n)`, running cost, Cancel button — all from Realtime.
   - Keep `ExtractionProgress` for the single-article path untouched.

5. **Documentation.** Append `docs/ADMIN_JOBS.md` with the `purana_extract` row in the kind matrix. Add Phase X.5 invariants + frozen-baseline-2026-05-28 marker to `docs/RELIABILITY_AUDIT.md`. New `docs/PURANIC_EXTRACTION.md`: chunking contract, confidence rubric (already in the prompt at lines 143-149), provider order, cancel-window guarantee (chunk boundary, same as pins/OG).

**Acceptance gate:** mid-run tab refresh re-attaches; closing the browser still completes the job server-side; deliberately-killed worker is reaped by the watchdog within 5 min; tier counters appear in the card; `srangam_admin_jobs.cost_usd` shows Gemini-priced rows (not OpenAI) for the dominant path; zero edits to public components, public routes, public RLS.

---

### Phase X.6 — Centralised correlation substrate (~1.5 days, additive, read-only surface)

Goal: cross-reference pins, Puranic citations, and curated cross-references to surface latent connections — without touching the curation pipelines that produced them, and **without inventing data that does not exist** (cultural-term linkage is treated as derived signal only).

1. **Read-only views over existing tables (no new mutable tables).** One migration. All views `SECURITY INVOKER` so they inherit underlying RLS (public-read tables stay public-read; admin-only tables stay admin-only — no new attack surface).
   - `srangam_corpus_article_summary` — per-article rollup: pin counts split by `confidence` (A/B/C) from `srangam_article_pins`; Puranic citation counts split by `purana_category` (Mahapurana / Itihasa / Veda / Upapurana / Agama / Other) from `srangam_purana_references`; outbound + inbound cross-reference counts from `srangam_cross_references`; `{{cultural:term}}` marker count derived by regex over `srangam_articles.content->>'en'` (no fabricated join row). Powers the overview tiles.
   - `srangam_corpus_purana_pin_overlap` — joins `srangam_purana_references` ↔ `srangam_article_pins` via `article_id`, grouped by `(purana_name, gazetteer_id)`, returning `co_article_count` and `pin_canonical_name` (joined from `srangam_gazetteer`). Substrate for hypothesis-style findings (e.g. *Skanda Purāṇa co-occurs with Kāśī pin in N articles*).
   - `srangam_corpus_xref_evidence` — joins `srangam_cross_references` with both source/target articles' `srangam_purana_references` and reports `shared_purana_count` per edge. Powers the cementing/disproving findings below.

2. **Light Postgres function for graph edges.** `public.get_corpus_correlations(min_co_articles int default 3)` returns weighted edges between `(purana_name, gazetteer_id)` nodes using **Jaccard over shared article membership**, computed entirely in SQL over the views above. `SECURITY DEFINER`, `SET search_path = public`, `REVOKE ALL` then `GRANT EXECUTE TO authenticated` (per the SECURITY DEFINER hardening memory). No row writes. Returns `(source_node, target_node, weight, shared_articles)`.

3. **New admin-only page `/admin/corpus-correlations`** (additive route under `src/pages/admin/CorpusCorrelations.tsx`, lazy-loaded in `src/App.tsx` like the existing admin pages, mounted inside `<AdminLayout>` under `<ProtectedRoute>`).
   - **Top**: four tiles from `srangam_corpus_article_summary` (articles processed / total citations / total pins / total xrefs).
   - **Middle**: a force graph using `react-force-graph-2d` (already in the bundle) rendered from `get_corpus_correlations()`. Node = Purana or Pin; edge weight = Jaccard. Cluster colouring by node type, matching the existing `THEME_COLORS` / `TYPE_COLORS` palette in `CrossReferencesBrowser.tsx` for visual continuity.
   - **Bottom — "Findings" table** (3 preset queries, all SQL-backed, no AI):
     * **Cementing**: rows from `srangam_corpus_xref_evidence` where `shared_purana_count ≥ 3` — strong textual co-grounding for an existing curated xref.
     * **Disproving / Needs review**: rows where `reference_type = 'explicit_citation'` AND `shared_purana_count = 0` — curated edge has no shared Puranic basis, flag for editorial review.
     * **Hitherto unfound**: pairs of `purana_name` that co-occur in ≥5 articles per `srangam_corpus_purana_pin_overlap` but have **no** existing `srangam_cross_references` row connecting any of those articles — candidate edges for the curator to author manually.

4. **Relationship to the existing `srangam_correlation_matrix`.** That table is preserved as the curated public-facing correlation surface (Theme → Source → Location). This phase does **not** modify, populate, or compete with it. The findings table is internal admin tooling — promotion of a finding into either `srangam_cross_references` or `srangam_correlation_matrix` is a manual curator action (per the **AI for curation, not expansion** user memory).

5. **No disruption.** No changes to `CrossReferencesBrowser.tsx` (frozen baseline). No changes to `srangam_correlation_matrix`. No new mutable tables. New page only. Sidebar entry under Admin → Analysis, gated by `isAdmin`.

6. **Documentation.** New `docs/CORPUS_CORRELATION.md`: view definitions, Jaccard formula, three preset findings queries, curator promotion workflow ("promote a finding into a `srangam_cross_references` or `srangam_correlation_matrix` row manually — never auto"), relationship to existing curated tables. Update `docs/SCALABILITY_ROADMAP.md` triggers (rebuild as materialised view + `pg_cron` REFRESH when article count crosses ~500 — current corpus is ~44, plain views are fine).

**Acceptance gate:** the three views return non-empty results on live data; force graph renders for the current corpus in <2 s; one "hitherto unfound" candidate is reviewable end-to-end; zero impact on extraction/import paths; zero writes to existing tables; `srangam_correlation_matrix` is byte-identical before and after.

---

### Out of scope (deferred candidates)

- Auto-promotion of correlation findings into `srangam_cross_references` or `srangam_correlation_matrix` (violates curation-over-expansion; deferred indefinitely).
- A standalone `srangam_event_log` table (independent workstream; `srangam_admin_jobs` covers X.5's needs today).
- Public-facing "related Puranas / co-cited locations" badges on article pages — possible Phase Y; the user-visible UI is explicitly frozen here.
- Embedding-based semantic correlation via `pgvector` on `srangam_article_metadata.embeddings` (column already exists) — heavier lift; Jaccard over curated joins is the right first cut and matches "AI for curation, not expansion".
- Materialised refresh of the three views via `pg_cron` — triggered only at the scalability threshold above.

### Roll-out order

X.5 (heal the broken page, smallest blast radius, zero behaviour risk) → X.6 (additive analytics layer, read-only). Each phase its own approval gate and docs update before the next begins.

### Files that will be touched (planning only — zero edits outside these)

- **X.5** — `supabase/functions/extract-purana-references/index.ts`, `supabase/functions/_shared/ai-provider.ts` (add `aiExtractCitations`), `supabase/functions/_shared/jobs.ts` (1-line `JobKind` union extension), `src/pages/admin/PuranaReferences.tsx`, `src/hooks/usePuranaReferences.ts` (extend with `useAdminJob('purana_extract')` rehydrate). Reuse existing `src/components/admin/JobProgressCard.tsx` and `src/hooks/useAdminJob.ts` **unchanged**. New `docs/PURANIC_EXTRACTION.md`; edits to `docs/ADMIN_JOBS.md` and `docs/RELIABILITY_AUDIT.md`.
- **X.6** — one new migration (3 views + 1 SECURITY DEFINER function + EXECUTE grant), new `src/pages/admin/CorpusCorrelations.tsx`, new `src/hooks/useCorpusCorrelations.ts`, route registration line in `src/App.tsx` only. New `docs/CORPUS_CORRELATION.md`; edits to `docs/SCALABILITY_ROADMAP.md`.

Everything stays inside `src/pages/admin/**`, `src/components/admin/**`, `src/hooks/useAdmin*` / `usePurana*` / `useCorpus*`, `supabase/functions/**`, `supabase/migrations/**`, `docs/**`, plus one route line in `src/App.tsx`. Public site behaviour, `srangam_correlation_matrix`, and Phases X.1–X.4 invariants are preserved.
