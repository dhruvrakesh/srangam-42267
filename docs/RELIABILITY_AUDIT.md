# Srangam Platform Reliability Audit

**Last Updated**: 2026-02-15 (Enterprise Hardening Roadmap — Phase C)

---

## Executive Summary

This document captures the findings from a comprehensive reliability and scalability audit of the Srangam platform. It defines core invariants that must never break, identifies critical paths, and documents failure modes with mitigation strategies.

---

## Core Invariants (DO NOT BREAK)

### 1. Unique Slugs and Slug Aliases

Every article must have:
- A unique `slug` column value
- A unique `slug_alias` column value (if set)

**Enforcement:**
- Unique constraint on `slug` column
- Unique constraint on `slug_alias` column
- Import function checks for duplicates before insert

**Violation Impact:** Broken article URLs, 404 errors, SEO issues

### 2. Row-Level Security (RLS)

All tables with user data must have RLS enabled:
- Unauthenticated users: Read-only access to published articles
- Authenticated users: CRUD on own data
- Admins: Full access via `user_roles` table

**Critical Tables with RLS:**
- `srangam_articles` - Admin-only write, public read (published)
- `srangam_tags` - Admin-only write, public read
- `srangam_cultural_terms` - Authenticated write, public read
- `srangam_cross_references` - Authenticated write, public read
- `user_roles` - Admin-only access

**Violation Impact:** Data breach, unauthorized modifications

### 3. Usage Count Integrity

Usage counters must accurately reflect actual usage:
- `srangam_tags.usage_count` - Number of articles using tag
- `srangam_cultural_terms.usage_count` - Number of term occurrences

**Enforcement:**
- Database triggers on article updates
- `update_tag_stats` function with `SET search_path = 'public'`

**Violation Impact:** Incorrect analytics, broken AI context

### 4. Cross-Reference Integrity

Cross-references must maintain referential integrity:
- Source and target articles must exist
- No duplicate references
- Bidirectional references should be symmetric

**Enforcement:**
- Foreign key constraints on `source_article_id` and `target_article_id`
- Unique constraint on (source, target, type) tuple

**Violation Impact:** Broken "Related Articles" sections, orphaned references

### 5. Immutability of Historical Data

Version history must be preserved:
- `srangam_article_versions` - Previous article states (**⚠️ 0 rows as of Feb 2026 — this invariant is untested**)
- `srangam_markdown_sources` - Original markdown content (38 rows; 11 articles missing markdown)

**Violation Impact:** Lost audit trail, reproducibility failures

**Known Gap:** `srangam_article_versions` has never been populated. The append-only invariant exists in policy but has never been exercised in production. This should be verified when the versioning feature is activated.

---

## Critical Paths

### 1. Markdown Import Pipeline

**Path:** Admin Dashboard → `markdown-to-article-import` → Database

**Components:**
- YAML frontmatter parsing
- Slug generation and normalization
- Cultural term extraction
- Cross-reference calculation
- Tag generation (AI)

**Failure Modes:**
- Invalid YAML syntax → Returns `SRANGAM-E002`
- Duplicate slug → Returns `SRANGAM-E001`
- AI rate limit → Returns 429 with fallback
- Database timeout → 10s timeout with error state

**Monitoring:**
- Edge function logs with timing
- Import success/failure counts in dashboard

### 2. Article Resolution

**Path:** URL slug → `resolveOceanicArticle()` → Article data

**Components:**
- `src/lib/articleResolver.ts` - Main resolver
- `src/lib/slugResolver.ts` - Centralized slug lookup
- Supabase query with OR condition

**Failure Modes:**
- Query timeout (10s) → Shows error with retry button
- Article not found → Shows 404 page
- Network error → Shows error state

**Monitoring:**
- Query timing logs: `[articleResolver] Query completed in Xms`
- Resolution logs: `[slugResolver] Resolved: slug → id`

### 3. Tag Generation

**Path:** Article content → `generate-article-tags` → Normalized tags

**Components:**
- OpenAI/Lovable AI GPT-4o-mini integration
- Fuzzy matching against existing taxonomy
- Tag normalization and deduplication

**Failure Modes:**
- AI rate limit → 429 response
- No API key → 500 with configuration error
- Empty content → Returns default tags

### 4. Cross-Reference Calculation

**Path:** Article import → Tag/theme comparison → `srangam_cross_references`

**Current Algorithm (O(N)):**
1. Load all published articles
2. For each article: compare tags (≥2 shared), check theme
3. Insert bidirectional references

**Performance Note:** With 49 articles (Feb 2026), takes ~500ms. Threshold for optimization is >1s. Well within capacity.

**Future Optimization (Phase 19b):**
- Add `tag_vector` column with GIN index
- Use text search for similarity matching
- Reduce to O(log N) complexity

### 5. Audio Narration

**Path:** Article → TTS Edge Function → Google Drive cache → Audio playback

**Components:**
- ElevenLabs (primary English)
- OpenAI TTS (fallback English)
- Google Cloud TTS (Indic languages)
- `tts-save-drive` for caching

**Failure Modes:**
- Provider 401/403 → Auto-fallback to next provider
- Rate limit → 429 with retry guidance
- Memory limit → Chunked processing (8 chunks max)

---

## Performance Benchmarks

### Target SLAs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Article page load | < 2s | ~1.5s | ✅ |
| Slug resolution | < 100ms | ~50ms | ✅ |
| Cross-ref calculation | < 500ms | ~300ms | ✅ |
| Tag generation | < 5s | ~3s | ✅ |
| Cultural term import | < 500ms | ~2s | ⚠️ (N+1) |

### Thresholds for Action

| Metric | Warning | Critical |
|--------|---------|----------|
| Article count | 100 | 500 |
| Cross-references | 2,000 | 10,000 |
| Cultural terms | 5,000 | 20,000 |
| Tags | 500 | 2,000 |

---

## Known Issues and Mitigations

### 1. Cultural Terms N+1 Pattern

**Issue:** Each term extraction triggers individual SELECT + INSERT
**Impact:** Slow imports with many terms
**Mitigation (Phase 19c):** Batch upsert with single query

### 2. Cross-Reference O(N) Scaling

**Issue:** Full article scan on every import
**Impact:** Import time grows linearly with article count
**Mitigation (Phase 19b):** `tag_vector` column with GIN index

### 3. Tag Categorization One-Shot

**Issue:** AI has no memory of previous categorizations
**Impact:** 29% of tags remain uncategorized
**Mitigation (Phase 19a):** Include historical examples in prompt

### 4. Client-Side Data Processing

**Issue:** `useAllArticles` fetches entire table
**Impact:** Slow initial load at scale
**Mitigation (Phase 19d):** Server-side pagination

---

## Rollback Procedures

### Edge Function Rollback

1. Navigate to Lovable Cloud → Functions
2. Select the affected function
3. View deployment history
4. Redeploy previous version

### Database Rollback

Schema changes are additive - no destructive migrations.

To remove Phase 19b columns:
```sql
DROP INDEX IF EXISTS idx_articles_tag_vector;
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS tag_vector;
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS tags_hash;
```

---

## Security Considerations

### Verified RLS Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| srangam_articles | Public (published) | Admin | Admin | Admin |
| srangam_tags | Public | Admin | Admin | Admin |
| srangam_cultural_terms | Public | Auth | Auth | Auth |
| srangam_cross_references | Public | Auth | Auth | Auth |
| srangam_article_metadata | Public (published) | Auth | Auth | Auth |
| srangam_context_snapshots | Admin | Admin | — | — |
| user_roles | Own/Admin | Admin | Admin | Admin |

**✅ Phase B complete (February 2026)**: Overly permissive write policies tightened to `has_role(auth.uid(), 'admin')` on 10 tables: `srangam_articles` (redundant ALL dropped), `srangam_article_analytics`, `srangam_article_evidence`, `srangam_article_metadata`, `srangam_article_versions`, `srangam_correlation_matrix`, `srangam_cultural_terms`, `srangam_inscriptions`, `srangam_purana_references`, `srangam_translation_queue`. Edge functions using service role key are unaffected.

**Deferred** (not flagged by linter, `auth.role() = 'authenticated'` — stricter than `true`):
- `srangam_cross_references`, `srangam_markdown_sources`, `srangam_article_chapters`, `srangam_book_chapters`, `srangam_article_bibliography`, `srangam_bibliography_entries`

### False Positive Security Warnings (Permanently Acknowledged)

The following warnings are acknowledged and safe:
- `spatial_ref_sys` RLS disabled — PostGIS system catalog table, not user data
- `st_estimatedextent` mutable search path (×3) — PostGIS C-language system functions, cannot be altered
- `geography_columns` / `geometry_columns` no RLS — PostGIS system views
- `user_roles` public exposure — Has proper RLS (3 policies verified)
- Extensions in public schema (PostGIS) — Required by geospatial features
- Leaked password protection disabled — Platform-level setting, not configurable via migration

---

## Phase C: Logic Hardening (February 2026) ✅

### Structured Error Schema

All 8 key edge functions now return standardized error responses via `_shared/error-response.ts`:

```json
{
  "success": false,
  "error": {
    "code": "E_VALIDATION | E_DUPLICATE | E_TIMEOUT | E_RATE_LIMIT | E_CONFIG | E_INTERNAL",
    "type": "validation | conflict | timeout | external_service | config | internal",
    "message": "Human-readable error message",
    "hint": "Actionable guidance for the admin"
  }
}
```

**Functions updated**: `markdown-to-article-import`, `generate-article-tags`, `enrich-cultural-term`, `backfill-bibliography`, `detect-duplicate-articles`, `generate-article-seo`, `batch-import-from-github`, `analyze-tag-relationships`.

**Backward compatibility**: Functions that return extra fields in errors (e.g., `tags: []`, `is_duplicate: false`, `metaDescription`) continue returning those fields alongside the new structured `error` object.

### Front-matter Validation

The import pipeline now validates before any database writes:
- **Language code**: Must be one of `en`, `hi`, `pa`, `ta`, `te`, `ml`, `kn`, `bn`, `gu`, `mr`, `sa`
- **Title**: Required, max 500 characters
- Invalid input returns `E_VALIDATION` with actionable hint

### Slug Concurrency Guard

- **Overwrite mode**: Uses atomic `.upsert({ onConflict: 'slug' })` — eliminates race window
- **Non-overwrite mode**: Catches Postgres `23505` specifically and returns `E_DUPLICATE` with HTTP 409 — no raw database errors leak to frontend

### Frontend Error Handler

`MarkdownImport.tsx` reads structured `error.code` first, falling back to legacy string-matching for backward compatibility.

---

## Phase D: Unified Search (February 2026) ✅

### Problem Fixed

Search page (`/search`) and navigation bar search dropdown only queried hardcoded JSON data (`MULTILINGUAL_ARTICLES` / `ARTICLES`), missing 41 published database articles (e.g., "Patiala", "Hinglaj"). The Articles browse page already worked correctly using `useAllArticles` + `mergeArticleSources`.

### Solution

Both search surfaces now merge JSON articles with database articles via `useAllArticles` hook:

- **`src/pages/Search.tsx`**: After existing `searchArticles()` call for JSON results, DB articles are filtered client-side with relevance scoring (title: 80, slug: 60, tags: 30, excerpt: 20, theme: 10). Results are deduplicated by ID and merged.
- **`src/components/navigation/SearchResults.tsx`**: Merges `ARTICLES` (JSON) with `useAllArticles()` (DB) before filtering. Increased result limit from 5 to 8.

### Deduplication

A `Set` of JSON result IDs is built first; DB articles with matching IDs are skipped. This prevents duplicate entries when an article exists in both sources.

### Performance

- `useAllArticles` has 5-minute `staleTime` via TanStack Query -- no redundant DB hits
- Client-side filtering of 41 articles is negligible overhead
- No new API calls, edge functions, or schema changes

### Future (Phase E2)

Semantic/vector search using existing `srangam_search_articles_semantic` RPC and embeddings column.

---

## Phase E1: Server-Side Full-Text Search (February 2026) ✅

### Problem Fixed

Phase D's unified search downloaded ALL articles (including full `content` JSONB) to the client for filtering. Navigation bar had no live search dropdown — users had to submit and wait for page load.

### Solution

Server-side full-text search using Postgres `tsvector` + GIN index via `srangam_search_articles_fulltext` RPC function:

- **`search_vector` column**: Trigger-maintained tsvector combining title (A), tags (A), dek (B), theme (B), slug (B), author (C)
- **GIN index**: `idx_srangam_articles_search_vector` for sub-millisecond lookups
- **RPC function**: `srangam_search_articles_fulltext(search_query, result_limit)` using `websearch_to_tsquery` with ILIKE fallback on title/slug
- **`SECURITY DEFINER`** with `SET search_path = 'public'` and internal `status = 'published'` filter
- Returns only metadata fields (no `content` JSONB) — major bandwidth reduction

### Architecture

```
Search page / Nav dropdown
  → useSearchArticles hook
    → srangam_search_articles_fulltext RPC (server-side, GIN-indexed)
    → searchArticles() JSON (client-side, legacy)
    → Deduplicate + merge + sort by rank
```

### Performance

| Metric | Before (Phase D) | After (Phase E1) |
|--------|------------------|-------------------|
| Data transferred per search | ~200KB+ (all articles) | ~2-10KB (matching rows only) |
| Query time at 500 articles | ~50ms+ client-side | ~2ms server-side (GIN) |
| Nav bar feedback | None (page navigation) | Live dropdown as you type |

### Nav Bar Live Dropdown

`HeaderNav.tsx` now renders `SearchResults` as a positioned dropdown when input has ≥2 characters. Closes on submit (navigates to `/search`), on blur (200ms delay for click), or when a result is clicked.

### Rollback

```sql
DROP INDEX IF EXISTS idx_srangam_articles_search_vector;
DROP TRIGGER IF EXISTS trg_srangam_articles_search_vector ON srangam_articles;
DROP FUNCTION IF EXISTS srangam_update_search_vector();
DROP FUNCTION IF EXISTS srangam_search_articles_fulltext(text, integer);
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS search_vector;
```

---

## Monitoring Checklist

- [ ] Edge function error rate < 1%
- [ ] Query timeout errors = 0
- [ ] Import success rate > 95%
- [ ] Tag categorization rate > 90%
- [ ] Cross-reference orphan count = 0
- [ ] Usage count accuracy = 100%
- [ ] Search covers both JSON and DB articles
