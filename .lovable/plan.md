

# Srangam Platform — Implementation Plan

## Completed Phases

### Phase D: Unified Search ✅ (February 2026)
Search page and navigation bar merged JSON + DB article sources client-side.

### Phase E1: Server-Side Full-Text Search + Nav Live Dropdown ✅ (February 2026)
- Added `search_vector` tsvector column with trigger-based maintenance and GIN index
- Created `srangam_search_articles_fulltext` RPC function (weighted `websearch_to_tsquery` + ILIKE fallback)
- Created `useSearchArticles` hook: server-side RPC + legacy JSON merge with deduplication
- Updated `Search.tsx` to use hook instead of client-side `useAllArticles` filtering
- Updated `SearchResults.tsx` to use hook for unified results
- Added live search dropdown to `HeaderNav.tsx` (≥2 chars, 200ms blur delay)
- Bandwidth reduced from ~200KB to ~2-10KB per search

## Remaining Phases

### Phase E2: Semantic/Vector Search
- Use existing `srangam_search_articles_semantic` RPC with embeddings
- Add "Related articles" powered by cosine similarity
- Requires embedding generation pipeline

### Phase F: Server-Side Pagination
- Replace `useAllArticles` on Articles browse page with paginated queries
- Cursor-based pagination for infinite scroll
- Threshold: 100+ articles

### Phase G: Batch Processing
- Batch upsert for cultural terms (fix N+1 pattern)
- `tag_vector` column with GIN index for cross-reference calculation
- Reduce cross-ref algorithm from O(N) to O(log N)
