
# Phase X.7 — Correlation Vision Hardening

Surgical, additive, admin-only. Public site, RLS, routes, and Phases X.1–X.6 invariants are not touched. Each sub-phase is independently shippable and revertable.

## Why now (frozen baseline, 2026-05-28)

Live counts: 44 published articles · 55 purana refs (9 articles covered) · 12 pins (5 covered) · 32 gazetteer · **1,718 cultural terms** · **1,233 curated cross_references** · 0 rows in legacy `srangam_correlation_matrix`. The X.6 Jaccard view runs over only the two thinnest signals (pins + purana refs), so only 5 pairs surface and the top score is 0.286 from a single shared place. The substrate is correct; the inputs are starved. Meanwhile `purana_extract` failed at 3/44 on a 30 s Gemini timeout; `pin_backfill` is healthy on the self-pump fix. The job substrate and correlation views are the right enterprise shape — Phase X.7 feeds them properly and tightens the UX around them.

## Sub-phases

### X.7.1 — Stabilise `purana_extract` (no schema change)

Goal: one slow article never kills the run; progress is always visible.

- `supabase/functions/extract-purana-references/index.ts`
  - Replace paragraph-count chunking with **char-budget chunking** (~6 000 chars/chunk, hard cap 25 chunks per article; tail-truncate with a logged warning).
  - Per chunk: 2 retries with exponential backoff (2 s, 6 s); on second timeout fall back from Gemini → OpenAI inside the chunk via the existing `aiExtractCitations` provider list.
  - `await touchHeartbeat` between every chunk (today it only fires every 6 chunks).
  - Persist per-article resume state in `srangam_admin_jobs.params.resume = { article_id, chunk_offset }` so a pump reinvoke can continue mid-article on the next slot.
  - Lower `chunk_size` default from 3 articles to 2 (long articles dominate the 150 s wall clock).
- `supabase/functions/_shared/ai-provider.ts`
  - `aiExtractCitations`: accept a `timeoutMs` array `[18000, 28000]` so the second attempt gets more headroom; surface `provider_used` in the result for telemetry.
- `src/pages/admin/PuranaReferences.tsx`
  - Remove the `ExtractionProgress` "Processing… 0/0" branch entirely. Show `JobProgressCard` from the optimistic job row inserted in `useExtractReferences` (the row is created client-side **before** invoke, so `activeJobId` is non-null on first render — eliminates the flicker the user saw).
  - Surface `last_error` and `last_item` in the existing card; add a tier legend (H ≥ 0.8 / M 0.6–0.8 / L < 0.6).
- `src/hooks/usePuranaReferences.ts`
  - Move the `srangam_admin_jobs` insert above the `functions.invoke` call (it already does this — verify and keep) and return `job_id` synchronously so the page sets `activeJobId` before the invoke promise resolves.

**Blast radius:** edge function + shared helper + one page + one hook. Zero schema. Zero RLS. Zero public-site touch.

### X.7.2 — Expand correlation axes (additive, read-only)

Goal: enrich `get_corpus_correlations` with the dense signals already in the DB.

Migration adds three `security_invoker` views and extends the RPC; no table writes, no destructive changes.

```sql
-- New views, mirroring the X.6 pair-view pattern
CREATE VIEW public.srangam_corpus_article_term_pairs AS
  SELECT a.id AS article_a, b.id AS article_b, count(*) AS shared
  FROM srangam_articles a
  JOIN srangam_articles b ON a.id < b.id AND a.status='published' AND b.status='published'
  JOIN LATERAL (
    SELECT unnest(regexp_matches(a.content::text, '\{\{cultural:([^}|]+)', 'g')) AS term
  ) ta ON true
  JOIN LATERAL (
    SELECT unnest(regexp_matches(b.content::text, '\{\{cultural:([^}|]+)', 'g')) AS term
  ) tb ON ta.term = tb.term
  GROUP BY 1, 2;

CREATE VIEW public.srangam_corpus_article_tag_pairs AS ...        -- intersect tags[]
CREATE VIEW public.srangam_corpus_article_biblio_pairs AS ...     -- intersect bibliography_id via srangam_article_bibliography
```

Extend `public.get_corpus_correlations(min_shared int, limit_rows int, w_place numeric, w_purana numeric, w_term numeric, w_tag numeric, w_biblio numeric)` to compute a weighted Jaccard sum with sane defaults (0.25 / 0.30 / 0.20 / 0.10 / 0.15). Keep the old 2-arg signature as a wrapper for back-compat.

- `src/hooks/useCorpusCorrelations.ts` — pass the new weights through.
- `src/pages/admin/CorpusCorrelations.tsx` — add 5 weight sliders (collapsible "Advanced") and 3 new columns (TERMS, TAGS, BIBLIO). Existing table layout stays; the new columns join the row tail so mobile horizontal-scroll invariant MV-01 still holds.

**Blast radius:** one migration (views + RPC), one hook, one page. No edits to public components, public RLS, or non-admin routes.

### X.7.3 — Findings persistence (curator-in-the-loop)

Goal: make the Corpus Correlations page actionable. A curator clicking "Promote" turns a Jaccard pair into a row in the existing `srangam_cross_references` table (no schema change — `srangam_cross_references` already has `source_article_id`, `target_article_id`, `reference_type`, `strength`, `context_description`).

- `src/pages/admin/CorpusCorrelations.tsx` — per-row "Promote → cross-reference" button; uses the **existing** admin RLS on `srangam_cross_references`. Pre-fill `reference_type='discovered'`, `strength=ceil(jaccard*10)`, `context_description={ axes:{places,puranas,terms,tags,biblio}, source:'corpus-correlations' }`.
- `src/hooks/useCorpusCorrelations.ts` — add `promotePair` mutation; invalidate `cross_references` query keys.
- Optional UI affordance: a "Promoted" badge on rows whose `(a,b)` already exists in `srangam_cross_references` (left-join the RPC result client-side).

**Blast radius:** one page + one hook. Zero migration. Reuses an RLS-policied table that already exists.

### X.7.4 — Nightly materialised snapshot (`corpus_correlate` job kind)

Goal: page load < 200 ms instead of running the multi-view RPC per refresh; gives us a temporal series for trend analysis later.

- Migration:
  - Extend `srangam_admin_jobs_kind_check` to include `'corpus_correlate'`.
  - Create `public.srangam_corpus_correlations_snapshot (job_id, computed_at, article_a, article_b, places, puranas, terms, tags, biblio, total, jaccard, weights jsonb, PRIMARY KEY (job_id, article_a, article_b))` + GRANT SELECT to authenticated, admin-only write via RLS, indexed on `(computed_at DESC, jaccard DESC)`.
- New edge function `supabase/functions/correlate-corpus/index.ts` — admin/service-role gated, inserts an `srangam_admin_jobs` row, computes via the RPC, bulk-inserts the snapshot, then `finishJob`.
- pg_cron: 02:30 UTC daily invocation (registered via `supabase--insert` tool, not migration, because it embeds the anon key — per project convention).
- `src/pages/admin/CorpusCorrelations.tsx` — add a "Source" toggle: **Live RPC** (current behaviour) vs **Latest snapshot** (default, fast). Show snapshot `computed_at` timestamp.
- `supabase/functions/_shared/jobs.ts` — register the new `JobKind`.

**Blast radius:** one migration (one new table + one check-constraint extension), one new edge function, one cron registration, one shared types touch, one page toggle. Public site untouched.

### X.7.5 — Documentation + memory refresh

- New: `docs/CORPUS_CORRELATION.md` — axes, weights, snapshot lifecycle, promotion workflow, temporal notes for the X.7 baseline.
- Update: `docs/SCALABILITY_ROADMAP.md` — mark X.6 done, X.7 in progress; record the snapshot table as a new growth-watch surface.
- Update: `docs/ADMIN_JOBS.md` — add `purana_extract` adaptive-chunking notes and `corpus_correlate` job lifecycle.
- Update: `.lovable/plan.md` — append X.7.1–X.7.5 with file-level deltas (this plan, transcribed).
- Update: `mem://index.md` Core — add "Correlation axes: place + purana + cultural-term + tag + biblio, weighted Jaccard, nightly snapshot".

## Sequencing & rollback

| Step | Ships independently | Rollback |
|---|---|---|
| X.7.1 | Yes — edge fn + UI only | Revert edge fn; UI still renders JobProgressCard on existing schema |
| X.7.2 | Yes after X.7.1 | `DROP VIEW` + restore 2-arg RPC wrapper |
| X.7.3 | Yes after X.7.2 | Hide promote button; no data loss (rows are normal cross_references) |
| X.7.4 | Yes after X.7.2 | Unschedule cron, leave snapshot table empty, toggle defaults to Live |
| X.7.5 | Anytime | Docs only |

## What is intentionally **out of scope**

- No changes to `srangam_correlation_matrix` (legacy, empty, orphaned) — decision deferred to a later "retire vs hydrate" review.
- No automated cross-reference creation — promotion is always a human click (matches the user's "AI for curation, not expansion" memory).
- No embeddings/vector search — that is a separate Phase Y, not part of the Jaccard substrate.
- No public-facing correlation surface — admin-only until findings persistence proves quality.

## File-level blast radius (complete)

**Edge functions**
- `supabase/functions/extract-purana-references/index.ts` (X.7.1, edit)
- `supabase/functions/_shared/ai-provider.ts` (X.7.1, edit)
- `supabase/functions/_shared/jobs.ts` (X.7.4, edit — add `'corpus_correlate'`)
- `supabase/functions/correlate-corpus/index.ts` (X.7.4, new)

**Migrations**
- 1 migration for X.7.2 (3 views + extend RPC, additive)
- 1 migration for X.7.4 (snapshot table + GRANTs + RLS + kind_check extension)

**Frontend (admin-only)**
- `src/pages/admin/PuranaReferences.tsx` (X.7.1, edit — drop legacy ExtractionProgress branch, surface last_error/last_item)
- `src/hooks/usePuranaReferences.ts` (X.7.1, edit — ensure job row inserted before invoke)
- `src/pages/admin/CorpusCorrelations.tsx` (X.7.2 + X.7.3 + X.7.4, edits — sliders, promote button, snapshot toggle)
- `src/hooks/useCorpusCorrelations.ts` (X.7.2 + X.7.3, edits — weights, promotePair)

**Docs / memory**
- `docs/CORPUS_CORRELATION.md` (new)
- `docs/SCALABILITY_ROADMAP.md`, `docs/ADMIN_JOBS.md`, `.lovable/plan.md`, `mem://index.md` (edits)

**Cron registration (via `supabase--insert`, not migration)**
- `cron.schedule('corpus-correlate-nightly', '30 2 * * *', …)` invoking `/functions/v1/correlate-corpus`

Zero touches outside: `supabase/functions/**`, `supabase/migrations/**`, `src/pages/admin/**`, `src/hooks/useAdmin*` + `usePurana*` + `useCorpus*`, `docs/**`, memory. Public routes, public components, public RLS, end-user UI: untouched.
