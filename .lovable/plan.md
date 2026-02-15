

# Backend Health Assessment Response: Enterprise Hardening Roadmap

## February 2026 -- Verified State from Live Database

### Live Data Census (queried just now)

| Table | Rows | Documented | Delta |
|-------|------|------------|-------|
| srangam_articles | 49 (40 published, 9 draft) | 41 | +8 since Jan 2025 |
| srangam_cultural_terms | 1,699 | 1,628 | +71 |
| srangam_tags | 170 | 146 | +24 |
| srangam_cross_references | 1,066 | 740 | +326 |
| srangam_bibliography_entries | 30 | 25 | +5 |
| srangam_article_bibliography | 30 | 63 (stale doc) | Docs overcounted |
| srangam_article_evidence | 79 | 79 | Stable |
| srangam_markdown_sources | 38 | -- | 11 articles missing MD |
| srangam_audio_narrations | 1 | -- | Minimal usage |
| srangam_book_chapters | 9 | -- | Not documented |
| srangam_article_chapters | 13 | -- | Not documented |
| srangam_context_snapshots | 4 | -- | Operational |
| srangam_article_versions | 0 | -- | Never used |
| srangam_article_analytics | 0 | -- | Never used |
| srangam_correlation_matrix | 0 | -- | Never used |
| srangam_inscriptions | 0 | -- | Never used |
| srangam_purana_references | 0 | -- | Never used |
| srangam_translation_queue | 0 | -- | Never used |
| narration_analytics | 0 | -- | Never used |

**Key finding**: 9 of 19 tables have zero rows. These represent scaffolded-but-unused features. They are not harmful (no runtime cost) but inflate documentation and create false expectations.

---

## Security Linter Results (queried just now)

| Finding | Severity | Count | Action |
|---------|----------|-------|--------|
| RLS Disabled in Public | ERROR | 1 | Identify and fix the table |
| RLS Policy Always True (write ops) | WARN | 9+ | Tighten to admin-only where appropriate |
| Function Search Path Mutable | WARN | 3 | Add `SET search_path = 'public'` |
| Extension in Public | WARN | 2 | PostGIS -- acknowledged, no action needed |

The ERROR-level finding (RLS disabled on a public table) is the only critical security gap and must be addressed in Phase 1.

---

## Documentation Decay Analysis

The `docs/` directory contains 60+ files. Classification:

| Category | Files | Action |
|----------|-------|--------|
| Canonical (schema, invariants, scalability) | 5 | Update with live data |
| Supporting (workflows, architecture) | 8 | Consolidate into 2 |
| Article manuscripts (.md/.docx) | ~25 | Should not be in docs/ |
| Historical (implementation logs, test summaries) | 6 | Archive label |
| Stale (outdated counts, wrong domains) | 4 | Update or remove |

**Specific staleness**:
- `CURRENT_STATUS.md`: Last updated 2025-01-21, says "41 articles" (now 49), "700+ cross-refs" (now 1,066), canonical URL still partially stale
- `DATABASE_CONTEXT.md`: Says "30+ articles", "800+ terms" -- months out of date
- `SCALABILITY_ROADMAP.md`: Says "January 2025", projections are now verifiable against actuals
- `IMPLEMENTATION_STATUS.md`: Steps 1-4 of SEO Activation still marked pending (already done)

---

## Phased Enterprise Hardening Plan

### Phase A: Documentation Truth (no code changes)

Update all canonical docs to reflect verified February 2026 state. This preserves context for future AI sessions and prevents hallucinated advice based on stale numbers.

**Files to update:**

| File | Changes |
|------|---------|
| `docs/CURRENT_STATUS.md` | Update all data counts to Feb 2026 actuals; mark zero-row tables as "scaffolded, unused"; update canonical URL to `srangam.nartiang.org`; add audio narration and book chapters to documented tables |
| `docs/DATABASE_CONTEXT.md` | Update article count (49), term count (1,699), tag count (170); correct "30+ articles" and "800+ terms" references; add srangam_book_chapters and srangam_article_chapters to table documentation |
| `docs/SCALABILITY_ROADMAP.md` | Update "Current State" table with Feb 2026 actuals; compare Jan 2025 projections against actuals (projections were optimistic for terms, conservative for cross-refs); mark Phase 19 tasks as complete where done |
| `docs/IMPLEMENTATION_STATUS.md` | Mark SEO Activation steps 1-4 as complete; update Known Issues (remove resolved domain migration items); update canonical URL references; add Feb 2026 canonical tag audit to SEO section |
| `docs/RELIABILITY_AUDIT.md` | Update "Last Updated" date; add srangam_article_versions (0 rows -- invariant #7 is untested) as known gap; note that batch cultural term upsert is now implemented per memory |

**Risk**: Zero. Documentation-only changes.

---

### Phase B: Security Hardening (surgical DB migrations)

Address the linter findings. Each is a single SQL statement.

**B1. Fix RLS-disabled table**
- Identify which public table lacks RLS (the linter flagged 1 ERROR)
- Enable RLS and add appropriate policies

**B2. Tighten overly-permissive RLS policies**
- Tables with `USING (true)` on write operations that should require admin role:
  - `srangam_cross_references` (currently: any authenticated user can write)
  - `srangam_article_versions` (currently: any authenticated user can write)
  - `srangam_article_chapters` (currently: any authenticated user can write)
  - `srangam_markdown_sources` (currently: any authenticated user can write)
  - `srangam_translation_queue` (currently: any authenticated user can write)
  - `srangam_correlation_matrix` (currently: any authenticated user can write)
  - `srangam_inscriptions` (currently: any authenticated user can write)
  - `srangam_article_analytics` (currently: any authenticated user can write)
- Change write policies from `auth.role() = 'authenticated'` or `true` to `has_role(auth.uid(), 'admin')` for INSERT/UPDATE/DELETE
- Edge functions using service role key are unaffected (bypass RLS)

**B3. Fix mutable search paths**
- Add `SET search_path = 'public'` to the 3 remaining SECURITY DEFINER functions

**Risk**: Low. All write operations currently go through edge functions using service role key. Tightening RLS on direct client access is purely defensive.

---

### Phase C: Logic Hardening (non-breaking edge function improvements)

These address the risks identified in your Backend Health Assessment.

**C1. Structured error semantics** (already partially implemented per memory)
- Audit all 23 edge functions for consistent error response format
- Ensure all return `{ success, error?: { code, type, message, hint } }`
- No behaviour change; only error format standardization

**C2. Front-matter validation hardening**
- Add pre-flight checks in `markdown-to-article-import` for:
  - Required fields: title (mandatory)
  - Language code validation (only known ISO codes accepted)
  - Numeric bounds on word_count and read_time_minutes
- Rejects invalid input earlier with clear E-codes

**C3. Slug generation concurrency guard**
- Replace current check-then-insert with `INSERT ... ON CONFLICT DO NOTHING`
- On conflict, append `-2`, `-3` suffix deterministically
- Eliminates the race condition identified in the assessment

**Risk**: Low. All changes are additive validation; existing valid inputs unaffected.

---

### Phase D: Observability (new table + logging, no behaviour change)

**D1. Create `srangam_event_log` table**
- Columns: id, event_type, entity_type, entity_id, status, details (jsonb), created_at
- RLS: admin-only read, service-role write
- Purpose: structured audit trail for import, tag generation, cross-ref jobs

**D2. Instrument import pipeline**
- Log events at: import_start, frontmatter_parsed, article_upserted, terms_extracted, crossrefs_calculated, import_complete/import_failed
- Each event includes timing and entity counts
- No change to success/failure paths

**Risk**: Low-to-moderate. Adds ~6 INSERT calls per import. Rollback by dropping the table.

---

### Phase E: Scalability Preparation (deferred, trigger-based)

These items are from the existing SCALABILITY_ROADMAP.md and should only be implemented when thresholds are reached:

| Item | Trigger | Current vs Threshold |
|------|---------|---------------------|
| Tag vector column + GIN index | Cross-ref calc > 1s | ~500ms at 49 articles -- not yet |
| Async cross-reference queue | Import latency > 10s | ~3s -- not yet |
| Article list pagination | > 100 articles | 49 -- not yet |
| Idempotency token for imports | Concurrent operators | Single operator -- not yet |

**Recommendation**: Do not implement these now. Document the triggers clearly and revisit when article count reaches 100.

---

## Implementation Sequence

```text
Phase A (Documentation)     -- 1 session, zero risk
  |
Phase B (Security)          -- 1 session, low risk, DB migrations
  |
Phase C (Logic Hardening)   -- 1-2 sessions, low risk, edge function edits
  |
Phase D (Observability)     -- 1 session, low-moderate risk, new table + logging
  |
Phase E (Scalability)       -- deferred until thresholds met
```

## What This Plan Does NOT Do

- Does not create new features or UI components
- Does not expand the codebase with new pages or routes
- Does not change routing, auth flows, or business logic
- Does not touch the frontend beyond documentation
- Does not add tests for expansion -- uses AI for curation (per your directive)
- Does not implement Phase E items prematurely

## Recommended Starting Point

Phase A (documentation truth) should be implemented first. It costs nothing, breaks nothing, and ensures every future AI session starts with accurate context rather than hallucinating from stale numbers.

