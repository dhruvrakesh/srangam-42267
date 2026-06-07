# Phase S.2 — Surgical Published-Gate on Per-Article Child Tables

**Status:** Pre-flight audit complete · code change = SQL only · zero FE / edge edits · single-transaction migration · single reversible step.

This plan extends the Phase S.1 RLS heal (2026-06-07) by replicating the `srangam_article_chapters` published-only public-SELECT pattern across the four sibling tables flagged by `supabase_lov` after the Phase T.1 re-scan. No functional regression for any audited consumer. Counts on `/research-network` and `/about` will drop to the **public-corpus truth** (a desired correctness fix, not a regression).

## 1. Verified consumer inventory

Every `.from('<table>')` call site grepped under `src/` and `supabase/functions/` and reasoned through the policy change. Service-role edge functions bypass RLS entirely; admin pages run under `admin` role and use the existing admin ALL policies.

### `srangam_article_bibliography`
| Surface | File | Role at runtime | Effect of gate |
|---|---|---|---|
| Public sidebar | `src/hooks/useArticleBibliography.ts` | anon | None — `articleId` only resolves for published rows (parent `srangam_articles` RLS already filters drafts for anon) |
| Admin | `pages/admin/DataHealth.tsx`, `GeographyMedia.tsx`, `ArticleManagement.tsx` (cascade delete), `useAdminDashboardStats.ts` | admin | None — admin ALL policy |
| Edge | `backfill-bibliography/index.ts` (`SUPABASE_SERVICE_ROLE_KEY`) | service | None — bypasses RLS |

### `srangam_article_evidence`
| Surface | File | Role | Effect |
|---|---|---|---|
| Public | `useArticleEvidence.ts` (+ `useArticleEvidenceBySlug` resolves id from `srangam_articles` first) | anon | None — slug→id lookup already constrained to published as anon |
| Admin | `DataHealth.tsx`, `GeographyMedia.tsx` | admin | None |
| Edge | `backfill-article-pins`, `backfill-bibliography` | service | None |

### `srangam_cross_references`
| Surface | File | Role | Effect |
|---|---|---|---|
| Article page | `useArticle.ts`, `components/academic/ArticleCrossReferences.tsx` | anon | Edges where `target` is a draft disappear — **desired**: today they render as orphan edges or leak draft slugs through the `target:srangam_articles!...` join |
| Network graph | `pages/ResearchNetwork.tsx` (parent already filters `articles` to `status='published'`) | anon | Edges drop to published↔published only — matches the node set the page already enforces |
| Public stats | `useResearchStats.ts` (head/count) consumed by `/begin-journey`, `/about`, `ResearchThemes` | anon | Count drops from raw row count to public-corpus count — truer public stat |
| Admin | `Dashboard.tsx`, `CrossReferencesBrowser.tsx`, `CorpusCorrelations.tsx`, `useCorpusCorrelations.ts`, `ArticleManagement.tsx` cascade-delete | admin | None |
| Edge | `markdown-to-article-import`, `_shared/context-metrics.ts`, `context-bundle-generator`, `context-save-drive` | service | None |

Nullable-endpoint nuance: `source_article_id` / `target_article_id` are nullable. The `EXISTS` gate evaluates to false on NULL endpoints, so any NULL-endpoint row is hidden from public (admin still sees via admin ALL). This is the desired behaviour.

### `srangam_purana_references`
| Surface | File | Role | Effect |
|---|---|---|---|
| `/admin/purana-references` | `usePuranaReferences.ts` (`!inner` join on `srangam_articles`) | admin (logged in) | **Risk** — table currently has *no admin SELECT policy*; admins read via the public `USING (true)` today. Gating it without adding admin SELECT would blank the admin page for any draft-article rows. **Mitigation: add `Admin read purana references` SELECT policy in the same migration (mirrors bibliography/evidence pattern).** |
| Admin delete cascade | `ArticleManagement.tsx` | admin | None — existing admin DELETE policy |
| Edge | `extract-purana-references` (service role) | service | None |

## 2. Behaviour matrix

| Risk | Verdict | Note |
|---|---|---|
| Public article page loses bibliography / evidence / cross-refs / purana data | None | Article never resolves for anon if draft |
| `/research-network` edge count drops | Acceptable & correct | Currently can render draft-target edges as orphans; gate aligns edge set with node set |
| `/about`, `/begin-journey` cross-ref count drops | Acceptable & truer | Public stat now reflects public corpus |
| `/admin/purana-references` blank for draft rows | **Mitigated** via added admin SELECT in same migration |
| Cross-ref source published → target draft | Hidden from public, visible to admin | Closes the draft-slug-leak via target join |
| NULL-endpoint cross-ref rows | Hidden from public | Desired side-effect |

## 3. Migration (single transaction)

```sql
-- Phase S.2: published-status gate on per-article child tables.
-- Mirrors srangam_article_chapters / srangam_article_metadata pattern from Phase S.1.

BEGIN;

-- 1. srangam_article_bibliography
DROP POLICY IF EXISTS "Public read article bibliography"
  ON public.srangam_article_bibliography;

CREATE POLICY "Public read article bibliography for published articles"
  ON public.srangam_article_bibliography
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_article_bibliography.article_id
      AND a.status = 'published'
  ));

-- 2. srangam_article_evidence
DROP POLICY IF EXISTS "Evidence is publicly readable"
  ON public.srangam_article_evidence;

CREATE POLICY "Public read article evidence for published articles"
  ON public.srangam_article_evidence
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_article_evidence.article_id
      AND a.status = 'published'
  ));

-- 3. srangam_cross_references — BOTH endpoints must be published
DROP POLICY IF EXISTS "Public read cross references"
  ON public.srangam_cross_references;

CREATE POLICY "Public read cross references between published articles"
  ON public.srangam_cross_references
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.srangam_articles a
      WHERE a.id = srangam_cross_references.source_article_id
        AND a.status = 'published'
    )
    AND
    EXISTS (
      SELECT 1 FROM public.srangam_articles a
      WHERE a.id = srangam_cross_references.target_article_id
        AND a.status = 'published'
    )
  );

-- 4. srangam_purana_references — admin SELECT first, then gate public SELECT
CREATE POLICY "Admin read purana references"
  ON public.srangam_purana_references
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read purana references"
  ON public.srangam_purana_references;

CREATE POLICY "Public read purana references for published articles"
  ON public.srangam_purana_references
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_purana_references.article_id
      AND a.status = 'published'
  ));

COMMIT;
```

## 4. Performance note

Each gate is a single `EXISTS` against `srangam_articles` via primary key (`id`) — pure index lookup, sub-microsecond per row. `srangam_articles` has ~63 rows; even a full-table parent scan would be irrelevant. No new index needed. The `ResearchNetwork` query (single `select('*')` on cross_references) gains one PK lookup per edge — cost-neutral against current latency.

## 5. Verification (Phase S.2.1 — runs immediately after migration approval)

1. `supabase_lov` re-scan: expect the 4 findings (`srangam_article_bibliography_public_read_unfiltered`, `srangam_article_evidence_public_read_unfiltered`, `srangam_cross_references_public_read_unfiltered`, `srangam_purana_references_public_read_unfiltered`) cleared.
2. Anon smoke (incognito):
   - Open one published article from each section → bibliography sidebar, evidence table, cross-refs panel render unchanged.
   - `/research-network` loads; edge count recorded before/after.
   - `/about` and `/begin-journey` cross-ref stat recorded before/after.
3. Admin smoke (logged in):
   - `/admin/purana-references` lists all rows (admin SELECT works).
   - `/admin/cross-references-browser` and `/admin/dashboard` counts unchanged.
4. `supabase--read_query` sanity:
   - `SELECT count(*) FROM srangam_cross_references` as service-role vs `set role anon; SELECT count(*) FROM srangam_cross_references; reset role;` — record the delta in the playbook.

If any signal disagrees, single-statement rollback (see § 7), no retry-loop in production.

## 6. Documentation & memory updates (Phase S.2.2)

- `docs/RELIABILITY_AUDIT.md` → append "Phase S.2" subsection under § Phase S.1 with the diff + verification numbers + invariant 22 ("public reads on per-article child tables MUST be gated to `status='published'` parent").
- `docs/CRON_OPS_PLAYBOOK.md` → add Phase S.2 one-liner under the existing S.1 reference + extend rollback paragraph.
- `mem://security/phase-s1-rls-heal.md` → flip Phase S.2 from "proposed" to "deployed 2026-06-07", with the verified count deltas.
- `mem://index.md` Core → update the Phase S.1 line to note S.2 landed.
- `security--update_memory` → add invariant 22 + remove the "Phase S.2 follow-ups" open item.
- `security--manage_security_finding` → mark all 4 scanner findings as `mark_as_fixed` with the migration filename as evidence.

## 7. Rollback

```sql
BEGIN;
DROP POLICY "Public read article bibliography for published articles" ON public.srangam_article_bibliography;
CREATE POLICY "Public read article bibliography" ON public.srangam_article_bibliography FOR SELECT USING (true);

DROP POLICY "Public read article evidence for published articles" ON public.srangam_article_evidence;
CREATE POLICY "Evidence is publicly readable" ON public.srangam_article_evidence FOR SELECT USING (true);

DROP POLICY "Public read cross references between published articles" ON public.srangam_cross_references;
CREATE POLICY "Public read cross references" ON public.srangam_cross_references FOR SELECT USING (true);

DROP POLICY "Public read purana references for published articles" ON public.srangam_purana_references;
DROP POLICY "Admin read purana references" ON public.srangam_purana_references;
CREATE POLICY "Public read purana references" ON public.srangam_purana_references FOR SELECT USING (true);
COMMIT;
```

## 8. Out of scope (locked)

- No FE edits — every audited consumer works unchanged.
- No edge-function edits — all four child-table writers run under service-role.
- No change to admin ALL / write policies, no `srangam_articles` policy edits, no GRANT changes.
- No new indexes (cost analysis above).
- No cron, AI prompt, gazetteer-rule, or nightly-cap touch.
- No retroactive backfill or data UPDATE (per `mem://~user` "production data is immutable").

## 9. Sequencing

1. (this turn) Plan approval.
2. **Phase S.2** — single migration via `supabase--migration` (the four policy edits + admin-read addition above, in one transaction).
3. **Phase S.2.1** — verification block (scanner + anon/admin smoke + count deltas). Captured in playbook.
4. **Phase S.2.2** — docs + memory + scanner-finding triage in one batched edit pass.
