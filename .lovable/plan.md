

# Phase D: Unified Search -- Surgical Fix

## Problem

The Search page (`/search`) and navigation bar search dropdown only query **hardcoded JSON data** (`MULTILINGUAL_ARTICLES` / `ARTICLES`). The database holds **41 published articles** (including "Patiala", "Hinglaj", etc.) that are completely invisible to search. The Articles browse page already works correctly using `useAllArticles` + `mergeArticleSources`.

**Verified**: `SELECT count(*) FROM srangam_articles WHERE status = 'published'` returns 41. Searching "patiala" on `/search` returns 0 results because the JSON source has no Patiala article.

## Root Cause

Two data pipelines exist but search only uses one:

```text
Articles page (works):    JSON articles + useAllArticles(DB) --> mergeArticleSources --> filter
Search page (broken):     JSON articles only (MULTILINGUAL_ARTICLES) --> searchArticles() --> results
Nav search (broken):      JSON articles only (ARTICLES from siteData) --> filter --> results
```

## Surgical Fix (4 files, no new dependencies, no schema changes)

### 1. `src/pages/Search.tsx` (~40 lines changed)

- Import `useAllArticles` hook and `Loader2`
- Call `useAllArticles(currentLanguage)` to fetch DB articles
- In the `searchResults` useMemo, after the existing `searchArticles()` call for JSON results:
  - Filter DB articles client-side by matching query against title, excerpt, tags, theme, and slug (case-insensitive substring match)
  - Score DB results: title match = 80, slug match = 60, tag match = 30, excerpt match = 20, theme match = 10
  - Deduplicate: build a Set of JSON result IDs, skip any DB article whose ID is already present
  - Merge both arrays and re-sort by score descending
- Fix link path: currently `slug: \`/${result.article.id}\`` -- DB articles need their actual slug path (`/articles/...`), already set by `useAllArticles`
- Add loading indicator while DB articles fetch

### 2. `src/components/navigation/SearchResults.tsx` (~25 lines changed)

- Import `useAllArticles` and `useLanguage`
- Call `useAllArticles()` to get DB articles
- Before filtering, merge `ARTICLES` (JSON) with DB articles into a unified list, extracting title/excerpt as plain strings from the JSONB format
- Filter the merged list by query (same substring match on title, excerpt, tags, theme)
- Fix link: use `article.slug` directly (already `/articles/...` for DB articles)

### 3. `docs/RELIABILITY_AUDIT.md`

Add Phase D section documenting:
- Search unification with database articles
- Client-side filtering approach
- Deduplication strategy

### 4. `.lovable/plan.md`

Mark Phase D as complete with description.

## What This Does NOT Do

- Does not change `searchEngine.ts` internals or its JSON-based algorithm
- Does not add server-side full-text search (Phase E item for 200+ articles)
- Does not change any database schema or RLS policies
- Does not touch the Articles browse page (already correct)
- Does not add new dependencies

## Risk Assessment

- **Risk**: Low. Additive change -- the existing JSON search path is completely untouched. DB articles are merged as a second data source.
- **Rollback**: Remove `useAllArticles` import and the DB merge block from both files.
- **Testing**: Search for "patiala", "ala singh", "hinglaj" (DB-only articles) and "Muziris", "Chola" (JSON articles) to verify both sources return results.

