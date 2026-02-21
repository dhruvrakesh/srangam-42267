

# Phase E1: Server-Side Full-Text Search + Nav Bar Live Dropdown

## Current State (Verified)

- **Search page** (`/search`): Phase D unified search works -- merges JSON + DB results client-side via `useAllArticles` (downloads ALL 41 articles including full `content` JSONB)
- **Nav bar search**: Input submits form and navigates to `/search?query=...`. No live dropdown -- `SearchResults.tsx` component exists but is not rendered in `HeaderNav.tsx`
- **Database**: 41 published articles, no `tsvector` column, no full-text search index

## Why This Matters

- Client-side filtering downloads all articles (full `content` JSONB) on every search page load -- wasteful bandwidth
- Substring `.includes()` matching misses morphological variants
- No live search feedback in the navigation bar -- users must submit and wait for page load
- At 100+ articles, client-side approach becomes a performance bottleneck

## Implementation Plan

### Step 1: Database Migration -- tsvector column + GIN index + RPC function

Add a generated `tsvector` column combining title, dek, tags, theme, slug, and author. Create an RPC function the frontend can call that returns only the fields needed for search results (excluding the heavy `content` JSONB).

**Migration SQL:**
- `search_vector` column: `GENERATED ALWAYS AS ... STORED` -- auto-maintained, no triggers
- GIN index on `search_vector` for sub-millisecond lookups
- `srangam_search_articles_fulltext(search_query, result_limit)` RPC function using `websearch_to_tsquery` with ILIKE fallback on title/slug for partial matches
- Weighted scoring: A = title/tags, B = excerpt/theme/slug, C = author

**Key design decisions:**
- `SECURITY DEFINER` with internal `status = 'published'` filter
- Returns `id, slug, title, dek, theme, tags, author, published_date, read_time_minutes, rank` -- no `content` column (major bandwidth saving)
- `websearch_to_tsquery` handles natural language queries without boolean syntax

### Step 2: Create `src/hooks/useSearchArticles.ts` (NEW, ~60 lines)

A dedicated hook that:
- Calls the `srangam_search_articles_fulltext` RPC for DB articles (server-side)
- Calls `searchArticles()` for legacy JSON articles (client-side, existing logic)
- Deduplicates by building a Set of JSON result IDs
- Merges and sorts by rank/score descending
- Falls back to client-side filtering if RPC fails
- Uses TanStack Query with debounced query key (300ms) to avoid hammering the DB on every keystroke
- Accepts options for theme filter, language, and result limit

### Step 3: Update `src/pages/Search.tsx` (~30 lines changed)

- Replace the inline `useMemo` search block (lines 62-146) with `useSearchArticles(query, options)` hook call
- Remove `useAllArticles` import (no longer needed -- server-side returns only matching rows)
- Keep all existing UI, filters, export, advanced search, Sanskrit detection unchanged
- Same output shape, so no template changes needed

### Step 4: Add live search dropdown to `src/components/navigation/HeaderNav.tsx` (~20 lines)

- Import `SearchResults` component
- Add `showDropdown` state, triggered when `searchQuery.length >= 2` and input is focused
- Render `<SearchResults query={searchQuery} onClose={() => setShowDropdown(false)} />` below the search input
- Close on form submit (navigates to `/search`), on blur (with small delay for click events), or on Escape key

### Step 5: Update `src/components/navigation/SearchResults.tsx` (~25 lines)

- Replace inline client-side filtering with `useSearchArticles` hook
- Keeps `.slice(0, 8)` limit for dropdown context
- Same rendering logic, just different data source

### Step 6: Update documentation

- `docs/RELIABILITY_AUDIT.md`: Add Phase E1 section documenting tsvector schema, search function, and performance characteristics
- `.lovable/plan.md`: Mark Phase E1 complete, update remaining Phase E items
- `docs/DATABASE_SCHEMA.md`: Document new `search_vector` column and RPC function

## Technical Details

### Performance Impact

| Metric | Before (Phase D) | After (Phase E1) |
|--------|------------------|-------------------|
| Data transferred per search | ~200KB+ (all articles with content) | ~2-10KB (matching rows, no content) |
| Query time at 41 articles | ~5ms client-side | ~1ms server-side |
| Query time at 500 articles | ~50ms+ client-side | ~2ms server-side (GIN index) |
| Nav bar feedback | None (page navigation only) | Live dropdown as you type |

### Files Changed Summary

| # | File | Change Type | Risk |
|---|------|------------|------|
| 1 | Database migration | NEW (tsvector column + GIN index + RPC function) | Low -- additive column, no existing data changes |
| 2 | `src/hooks/useSearchArticles.ts` | NEW (~60 lines) | Zero -- new file |
| 3 | `src/pages/Search.tsx` | EDIT (~30 lines: replace useMemo with hook) | Low -- same output shape |
| 4 | `src/components/navigation/HeaderNav.tsx` | EDIT (~20 lines: add dropdown) | Low -- additive UI |
| 5 | `src/components/navigation/SearchResults.tsx` | EDIT (~25 lines: use new hook) | Low |
| 6 | `docs/RELIABILITY_AUDIT.md` | EDIT (add Phase E1 section) | Zero |
| 7 | `.lovable/plan.md` | EDIT (mark E1) | Zero |

## What This Does NOT Do

- Does not change the JSON `searchEngine.ts` internals (still used for legacy deep-content search)
- Does not add new UI components or pages
- Does not change article rendering, routing, or the Articles browse page
- Does not touch authentication, RLS policies, or edge functions
- Does not implement semantic/vector search (remains Phase E2)

## Risk Assessment

- **Risk**: Low. The `search_vector` column is `GENERATED ALWAYS AS ... STORED` -- Postgres maintains it automatically. No triggers to manage.
- **Rollback**: Drop the column (`ALTER TABLE srangam_articles DROP COLUMN search_vector`), drop the function, and revert the 3 frontend files.
- **Testing**: Search for "patiala", "monsoon trade", "Chola dynasty". Check nav dropdown appears on typing. Verify `/search` page still shows JSON + DB merged results.
