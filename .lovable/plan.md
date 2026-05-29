# Phases 2–5 — Context-Revived, Audit-Corrected Plan

Each phase is independently shippable, fully reversible, and gated by a concrete verification step. No DB destructive ops. No mass re-renders.

---

## What the audit changed vs. the previous proposal

| Previous assumption | Audit finding | Plan impact |
|---|---|---|
| Pins may be duplicated, need composite UNIQUE | `srangam_article_pins_pkey PRIMARY KEY (article_id, gazetteer_id)` already exists | **Dropped** — upsert is already idempotent. Repetition perception comes from re-running without `only_zero_pin` (fixed in Phase 1) and from articles re-appearing in lists, not from row dupes. |
| Source enum mismatch blocking A/C pins | CHECK is `evidence_table / content_scan / ai_extract / manual` — Phase 1 mapping was correct | **Confirmed** — A/C-tier inserts are now unblocked. |
| Evidence empty is mostly a UI bug | Only **6 / 45** published articles have evidence rows; **1 / 45** has bibliography; pins are **135/135 B-tier content_scan** (zero A, zero C) | UX must tell the truth (sparse corpus), AND we must surface that A-tier (evidence → gazetteer) never produced pins because evidence `place` strings don't match `gazetteer.name_variants`. |
| CX.2 refactor "almost done" | Latest snapshot is still `generated_with: CX.1` — no CX.2 snapshot has ever been written | Phase 4 must finish dedup AND produce a verified CX.2 snapshot before CX.3 migration. |

---

## Phase 2 — Evidence Honesty + Slug-Prop Wiring

**Goal:** stop the "blank Evidence tab" illusion; make sparse-evidence reality visible to readers and admins.

### Changes
1. `src/components/oceanic/SourcesAndPins.tsx`
   - Add a truthful empty state inside the `showEvidence && evidence.length === 0` branch (currently renders nothing).
   - Add a guard for `legacyData.claims.length === 0` in legacy fallback.
   - Change the amber "Using cached sources" copy from a vague warning to: *"No structured evidence/bibliography rows are stored for this article in the database yet — showing legacy correlation snapshot."*
2. Audit every `<SourcesAndPins …/>` call site; ensure `articleSlug={article.slug_alias ?? article.slug}` is always passed (current optional prop silently disables DB queries).
3. `src/pages/admin/ArticleManagement.tsx` (and the article table on `DataHealth`) — add three small badges per article: **EV n** / **BIB n** / **PINS n**, with the count colored red at 0. Read from cheap `count: 'exact', head: true` queries batched by `article_id IN (…)`.
4. `src/lib/slugResolver.ts` — log a single grouped `console.warn` when the resolver returns null (helps the next slug-mismatch hunt).

### Phase 2 — A-tier pin gap mitigation (additive, no AI cost)
- In `backfill-article-pins`, when iterating `srangam_article_evidence.place`, also match against `gazetteer.name_variants` with the existing tokenizer (currently only canonical names compared). Counters reported in the job: `evidence_rows_scanned`, `evidence_rows_matched`, `evidence_rows_unmatched_sample[]`. This converts the existing 79 evidence rows into A-tier pins where the gazetteer already knows the place — no AI call.

### Verification gate
- DB: `SELECT source, count(*) FROM srangam_article_pins GROUP BY 1` shows non-zero `evidence_table` rows.
- UI: on an article with `evidence_rows = 0`, Evidence tab shows the honest empty state instead of a blank panel; admin row shows `EV 0` red badge.

---

## Phase 3 — OG Image Visibility (Reader + Admin Lightbox)

**Goal:** make the generated 1200×630 OG image actually inspectable; stop silent hide on proxy failure.

### Changes
1. `src/lib/gdriveProxy.ts` — guard: if `import.meta.env.VITE_SUPABASE_URL` is falsy, return the raw URL instead of building `undefined/functions/v1/gdrive-image-proxy?id=…`. Prevents the silent `onError → hidden` cascade.
2. `src/components/oceanic/OceanicArticlePage.tsx` (lines ~247–267)
   - Wrap the hero `<img>` in a `<Dialog>` trigger (`shadcn/ui`); dialog content uses `<AspectRatio ratio={1200/630}>` and renders full-resolution image with a Download anchor (`<a href={ogImageUrl} download …/>`).
   - Replace the `classList.add('hidden')` fallback with a visible neutral placeholder ("Header image unavailable") so failures are observable, not invisible.
   - Use `loading="lazy"` + explicit `width/height` to preserve CLS.
3. `src/pages/admin/GeographyMedia.tsx` (OG column, lines ~464–494)
   - Render a 64×40 thumbnail (`object-cover rounded`) next to the existing version badge. Click → same Dialog as the reader. Add a "Download" menu item alongside Regen/Retire.

### Verification gate
- Reader: clicking the hero opens the full 1200×630 in a lightbox with a working Download link; if the proxy is misconfigured, the placeholder appears (no silent hide).
- Admin: thumbnail visible for every row that has `og_image_url`; click opens the same dialog.

No business-logic change, no edge function change.

---

## Phase 4 — Finish CX.2: Dedupe GDrive Logic + Produce a Verified CX.2 Snapshot

**Goal:** retire inline GDrive/JWT in `context-bundle-generator`, then write the first real CX.2 snapshot so CX.3 has a valid baseline to diff from.

### Changes
1. `supabase/functions/context-bundle-generator/index.ts`
   - Remove the inline `uploadToGoogleDrive`, RS256 signing, multipart helpers (~lines 231–389).
   - Import from the already-created shared modules:
     - `loadServiceAccount, getDriveAccessToken, uploadToDrive` from `../_shared/google-drive.ts`
     - `countAuthoritative, topThemes, topTags, topTerms, recentCrossRefs, latestCorrelationSummary` from `../_shared/context-metrics.ts`
   - Stamp `stats_detail.generated_with = 'CX.2'` in the row it writes (per Phase CX.2 invariant in memory).
   - Ensure the bundle markdown language list mirrors `src/lib/i18n.ts` exactly (`en, ta, te, kn, bn, as, pn, hi, pa`) — guarded by a 1-line locale-array import or a comment-pinned constant.
2. `supabase/functions/_shared/context-metrics.ts`, `google-drive.ts` — already exist; no change. (Re-verified in context.)
3. After deploy, trigger one bundle from `src/pages/admin/ContextManagement.tsx` (existing button) and verify the new row.

### Verification gate
- `SELECT stats_detail->>'generated_with', articles_count, terms_count, tags_count, cross_refs_count, modules_count FROM srangam_context_snapshots ORDER BY snapshot_date DESC LIMIT 1` → `CX.2`, `articles=45`, `terms≈1724`, `tags≈185`, `cross_refs≈1273`, `modules=13` (must match prior CX.1 row within ±1%; large drift = regression, roll back).
- No `[object Object]` in `last_error` for the bundle job (Phase 1 serializeErr is already in place — confirm it's imported by `context-bundle-generator` too; add the import if not).

---

## Phase 5 — CX.3: `identity_sets` Migration + Identity-Aware Diff

**Goal:** move snapshot diffs from "count went up by 3" to "these specific slugs/term ids/tag names were added/removed", without touching the immutable frozen baseline.

### Migration (additive only)
```sql
ALTER TABLE public.srangam_context_snapshots
  ADD COLUMN identity_sets jsonb;             -- nullable; old rows stay null

CREATE INDEX srangam_context_snapshots_identity_gin
  ON public.srangam_context_snapshots USING gin (identity_sets jsonb_path_ops);
```
- No data backfill (frozen-baseline invariant).
- No RLS change (admins-only already).
- `generated_with` advances to `'CX.3'` only when `identity_sets` is populated.

### `identity_sets` shape (small, bounded — cap each set at the corpus size, no AI cost)
```jsonb
{
  "articles":     ["slug-a", "slug-b", …],          // from srangam_articles.slug
  "terms":        ["uuid", …],                      // from srangam_cultural_terms.id
  "tags":         ["tag_name", …],                  // from srangam_tags.tag_name
  "modules":      ["module-name", …],               // distinct srangam_cultural_terms.module
  "cross_refs":   ["src_id::tgt_id::reference_type", …]  // composite identity
}
```

### Edge function changes
- `supabase/functions/context-save-drive/index.ts` — additionally compute and write `identity_sets`, stamp `generated_with='CX.3'`.
- `supabase/functions/context-diff-generator/index.ts` —
  - Mode resolution:
    - both snapshots have `identity_sets` → `mode: 'identity'`, return `{added, removed}` per set (capped at 200 each, plus total counts).
    - either is null → `mode: 'count_only'` with `reason: 'identity_sets_missing_in_<previous|current>'` (existing CX.2 fallback shape — preserve).
  - Never UPDATE old rows; never re-run on baseline (`snapshot_date <= 2026-05-29`).

### Verification gate
- Generate two CX.3 snapshots back-to-back; diff returns `mode: 'identity'`, `articles.added=[]`, `articles.removed=[]` for an unchanged corpus.
- Add a throwaway tag → diff shows `tags.added=['<that-tag>']`. Remove it → next diff shows it in `removed`.
- Old CX.1/CX.2 → CX.3 diff returns `mode: 'count_only'` with the documented `reason`, no crash.

---

## Execution order & rollback

```
Phase 2  →  Phase 3  →  Phase 4  →  Phase 5
(UI only)   (UI only)   (edge fn)   (migration + edge fn)
```

- Phases 2 and 3 are pure frontend; rollback = revert commits.
- Phase 4 is edge-function refactor only; rollback = redeploy previous `context-bundle-generator`.
- Phase 5's migration is additive (new nullable column + GIN index); rollback = `DROP COLUMN identity_sets` — safe because no other code path will reference it until CX.3 ships.

## Documentation updates (in the same PRs)
- `.lovable/plan.md` — append "Phase 2–5 Audit Reconciliation" section noting: PK already existed; A-tier pins enabled via variant-aware evidence scan; CX.2 snapshot finally produced.
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` — add CX.3 `identity_sets` shape + diff modes.
- `docs/architecture/SOURCES_PINS_SYSTEM.md` — record the variant-aware evidence→gazetteer matching and the `EV/BIB/PINS` admin badges.
- Memory: extend the `Geo Automation Recovery (G1+G2)` entry with the A-tier evidence-variant matcher, and add a `Context Metrics Honesty (CX.3)` entry once Phase 5 lands.

## Out of scope (explicitly)
- No changes to `articleResolver.ts` JSON-source pin path (separate decision; current behavior is documented).
- No changes to AI provider keys, prompts, or cost caps.
- No edits to frozen baseline snapshots (`snapshot_date <= 2026-05-29`).
- No new gazetteer rows in this plan (Phase G3 baseline stays at 112; expand in a dedicated content PR).

Approve to proceed with Phase 2 first.
