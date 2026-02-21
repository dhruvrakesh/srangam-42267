

# Srangam Platform — Implementation Plan

## Phase C: Logic Hardening (February 2026) ✅

Standardized error responses across 8 edge functions, added front-matter validation (language code whitelist, title constraints), and implemented atomic slug upsert to eliminate race conditions. See `docs/RELIABILITY_AUDIT.md` Phase C section.

## Phase D: Unified Search (February 2026) ✅

Fixed Search page and navigation bar search to include database articles alongside legacy JSON articles. Both surfaces now use `useAllArticles` hook to merge DB results with JSON results, with deduplication and relevance scoring. See `docs/RELIABILITY_AUDIT.md` Phase D section.

## Phase E: Scalability (Planned)

- Server-side full-text search using Postgres `tsvector` (trigger at 200+ articles)
- Server-side pagination for `useAllArticles` 
- `tag_vector` column with GIN index for O(log N) cross-reference calculation
- Batch upsert for cultural terms (N+1 fix)

## Phase F: Observability (Planned)

- Structured logging across all edge functions
- Performance timing dashboard
- Error rate alerting
