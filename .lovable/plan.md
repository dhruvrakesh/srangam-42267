
# Enterprise Hardening Roadmap

## Completed Phases

### Phase A: Data Integrity Audit ✅ (February 2026)
- Full database audit: 49 articles, 1066 cross-refs, 1699 terms, 170 tags
- Verified all core invariants (unique slugs, RLS, usage counts, cross-ref integrity)

### Phase B: Security Hardening ✅ (February 2026)
- Tightened 11 overly permissive write policies to admin-only on 10 tables
- Verified PostGIS false positives, documented in RELIABILITY_AUDIT.md

### Phase C: Logic Hardening ✅ (February 2026)
- Created `_shared/error-response.ts` with `ErrorDetail`, `createErrorResponse`, `classifyError`
- Updated 8 edge functions to return structured errors (backward-compatible)
- Added language code validation (11 codes) and title validation to import pipeline
- Replaced check-then-insert slug pattern with atomic `.upsert()` + Postgres 23505 handling
- Updated `MarkdownImport.tsx` to read structured errors with legacy fallback

## Upcoming Phases

### Phase D: Observability (Planned)
- Structured logging with correlation IDs
- Import success/failure metrics dashboard
- Edge function latency tracking

### Phase E: Scalability (Planned)
- Batch cultural term upsert (eliminate N+1)
- Tag vector column with GIN index for O(log N) cross-refs
- Server-side pagination for article listings
