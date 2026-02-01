
# Enterprise Reliability & Scalability Implementation Roadmap

## Executive Summary

This document outlines a comprehensive multi-phase implementation plan to address critical routing issues (404 errors), complete Phase 1 reliability tasks, and establish a scalable architecture for the Srangam platform.

---

## Critical Issue: 404 Broken Links Audit

### Identified 404 Routes

| Route | Source File | Issue |
|-------|-------------|-------|
| `/field-notes/bujang-industrial-sites` | `src/data/ocean_networks/tabs.json:23` | No `/field-notes/:slug` route exists |
| `/maps/bujang-valley` | `src/data/ocean_networks/tabs.json:15` | No `/maps/:slug` route exists |
| `/maps/nagapattinam-ocean` | `src/data/ocean_networks/tabs.json:46` | No `/maps/:slug` route exists |
| `/maps/monsoon-windows` | `src/data/ocean_networks/tabs.json:77` | No `/maps/:slug` route exists |

### Root Cause

The `src/data/ocean_networks/tabs.json` file references routes that were never implemented. The current routing structure only has:
- `/field-notes` (FieldNotes.tsx - lists entries but no individual pages)
- `/maps-data` (MapsData.tsx - no dynamic routing)

### Fix Options

**Option A: Mark as "Coming Soon"**
Update `tabs.json` to flag draft content with `status: "coming_soon"` and render disabled links in the UI.

**Option B: Route to Articles**
Redirect `/field-notes/:slug` and `/maps/:slug` to `/articles/:slug` where the content will exist once imported.

**Option C: Create Dynamic Routes**
Add proper routing for `/field-notes/:slug` and `/maps/:slug` that resolve content from the database.

**Recommended: Option B** - Simplest fix that leverages existing infrastructure.

---

## Documentation Update: Master Implementation Status

### File: `docs/IMPLEMENTATION_STATUS.md` (NEW)

Track all Phase 1-3 tasks with current status, blocking issues, and dependencies.

### File: `docs/RELIABILITY_AUDIT.md` (UPDATE)

Add 404 routing issues section and mark resolved items.

### File: `.lovable/plan.md` (UPDATE)

Reset to track current implementation focus.

---

## Phase 1 Implementation Status (January 2025)

| Task | Status | Notes |
|------|--------|-------|
| **1.1 Centralize slug resolution** | ✅ COMPLETE | `src/lib/slugResolver.ts` with 10s timeout |
| **1.2 Paginate article lists** | ✅ COMPLETE | `useArticlesPaginated` hook + admin pagination |
| **1.3 Batch cultural term upsert** | 🔲 PENDING | N+1 pattern in import function (lines 728-792) |
| **1.4 Refactor OceanicArticlePage** | ✅ COMPLETE | `useArticle` hook + skeleton loaders |
| **1.5 Structured error responses** | 🔲 PENDING | Generic error messages in edge function |
| **1.6 Fix 404 broken links** | 🔲 NEW | Routes in `tabs.json` have no handlers |
| **1.7 Related Articles formatting** | ✅ COMPLETE | Text wrapping + actual read times |

---

## Detailed Implementation Plan

### Phase 1.6: Fix 404 Broken Links (IMMEDIATE)

**Priority:** CRITICAL (user-facing errors)

**Files to Modify:**

1. `src/App.tsx` - Add route handler for `/field-notes/:slug`
2. `src/data/ocean_networks/tabs.json` - Update draft slugs to use `/articles/` prefix
3. `src/pages/FieldNotes.tsx` - Add coming soon handling for unlinked content

**Implementation:**

```typescript
// App.tsx - Add redirect routes
<Route path="/field-notes/:slug" element={<Navigate to={(params) => `/articles/${params.slug}`} replace />} />
<Route path="/maps/:slug" element={<Navigate to={(params) => `/articles/${params.slug}`} replace />} />
```

**Alternative: Update JSON data to correct paths:**

```json
// tabs.json - Change draft slugs
{
  "slug": "/articles/bujang-industrial-sites",  // was: /field-notes/...
  "status": "draft"
}
```

---

### Phase 1.3: Batch Cultural Term Upsert (MEDIUM)

**Priority:** MEDIUM (performance at scale)

**Current Problem:** Lines 728-792 of `markdown-to-article-import/index.ts` perform individual SELECT + UPDATE for each term.

**Solution:**

```typescript
// Collect all terms first
const termBatch = culturalTerms.map(term => ({
  term: term.toLowerCase().trim(),
  display_term: term,
  module: 'general',
  translations: { en: term },
  usage_count: 1,
}));

// Single upsert with ON CONFLICT
const { data, error } = await supabase
  .from('srangam_cultural_terms')
  .upsert(termBatch, {
    onConflict: 'term',
    ignoreDuplicates: false,
  });

// Batch increment usage counts via RPC
await supabase.rpc('increment_term_usage_counts', { 
  terms: culturalTerms.map(t => t.toLowerCase().trim()) 
});
```

**Database Migration Required:**

```sql
-- RPC function for batch usage count increment
CREATE OR REPLACE FUNCTION increment_term_usage_counts(terms text[])
RETURNS void AS $$
BEGIN
  UPDATE srangam_cultural_terms
  SET usage_count = usage_count + 1
  WHERE term = ANY(terms);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Phase 1.5: Structured Error Responses (MEDIUM)

**Priority:** MEDIUM (admin UX improvement)

**Current Problem:** Line 952 returns generic error messages.

**Solution - Define Error Schema:**

```typescript
// shared/errors.ts
interface SrangamError {
  errorType: 'validation' | 'database' | 'ai' | 'network' | 'permission';
  code: string;  // e.g., "E101", "E201"
  message: string;
  details?: Record<string, unknown>;
  hint?: string;
}

// Error codes
const ERROR_CODES = {
  E101: { type: 'validation', message: 'Missing frontmatter' },
  E102: { type: 'validation', message: 'Invalid YAML syntax' },
  E201: { type: 'database', message: 'Duplicate slug exists' },
  E202: { type: 'database', message: 'Foreign key violation' },
  E301: { type: 'ai', message: 'Tag generation failed' },
  E302: { type: 'ai', message: 'Rate limit exceeded' },
};
```

**Admin UI Enhancement:**

Display error codes with actionable hints in the import dialog.

---

## Phase 2 Preview (1-3 Months)

| Task | Trigger Condition | Complexity |
|------|-------------------|------------|
| **2.1 Cross-reference scalability** | 100+ articles | HIGH - requires pgvector |
| **2.2 Tag generation sampling** | 500+ tags | MEDIUM |
| **2.3 Graph API pagination** | 2000+ cross-refs | MEDIUM |
| **2.4 Language role expansion** | Translator onboarding | MEDIUM |
| **2.5 Monitoring & observability** | Any production issue | LOW |

### Phase 2.1: Tag Vector Index (Future)

```sql
-- When article count exceeds 100
ALTER TABLE srangam_articles 
ADD COLUMN tag_vector tsvector 
GENERATED ALWAYS AS (array_to_tsvector(COALESCE(tags, '{}'))) STORED;

CREATE INDEX idx_articles_tag_vector 
ON srangam_articles USING GIN(tag_vector);
```

---

## Files Summary

### Create (2 files)

| File | Purpose |
|------|---------|
| `docs/IMPLEMENTATION_STATUS.md` | Master tracking for all phases |
| `supabase/functions/_shared/errors.ts` | Shared error schema definitions |

### Modify (5 files)

| File | Change |
|------|--------|
| `src/App.tsx` | Add redirect routes for `/field-notes/:slug` and `/maps/:slug` |
| `src/data/ocean_networks/tabs.json` | Update draft slugs to use `/articles/` prefix |
| `supabase/functions/markdown-to-article-import/index.ts` | Batch cultural term upsert + structured errors |
| `docs/RELIABILITY_AUDIT.md` | Add 404 routing section, update completion status |
| `.lovable/plan.md` | Reset to current Phase 1.3/1.5/1.6 focus |

### Database Migration (1 migration)

| Migration | Purpose |
|-----------|---------|
| `increment_term_usage_counts` RPC function | Enable batch term updates |

---

## Implementation Order

1. **Week 1: Documentation + 404 Fix**
   - Create `IMPLEMENTATION_STATUS.md`
   - Update `tabs.json` slugs
   - Add redirect routes in `App.tsx`

2. **Week 2: Batch Cultural Terms**
   - Create database RPC function
   - Refactor import function
   - Test with sample import

3. **Week 3: Structured Errors**
   - Define error schema
   - Update edge function
   - Enhance admin UI feedback

4. **Week 4: Testing & Documentation**
   - End-to-end import testing
   - Update reliability audit
   - Performance benchmarking

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| 404 errors on known routes | 4 | 0 |
| Cultural term import time (50 terms) | ~2s | < 500ms |
| Admin error actionability | Generic | Specific codes + hints |
| Phase 1 completion | 4/7 | 7/7 |

---

## Technical Details

### Current Route Structure

```text
/articles/*          → ArticlesRouter → OceanicArticlePage
/oceanic/*           → OceanicRouter → OceanicArticlePage  
/field-notes         → FieldNotes.tsx (list only, no :slug)
/maps-data           → MapsData.tsx (no dynamic routing)
```

### Proposed Route Structure

```text
/articles/*          → ArticlesRouter → OceanicArticlePage
/oceanic/*           → OceanicRouter → OceanicArticlePage
/field-notes         → FieldNotes.tsx
/field-notes/:slug   → Redirect to /articles/:slug
/maps/:slug          → Redirect to /articles/:slug
```

### Cultural Term Batch Upsert Flow

```text
Current (N+1):
For each term:
  1. SELECT by term → 1 query
  2. UPDATE or INSERT → 1 query
Total: 2N queries for N terms

Optimized (Batch):
1. UPSERT all terms → 1 query
2. RPC increment counts → 1 query  
Total: 2 queries for N terms
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Redirect breaks existing links | Low | Medium | Test with all known URLs |
| Batch upsert conflicts | Low | Low | Use onConflict handler |
| Error codes not helpful | Medium | Low | Include actionable hints |

---

## Testing Checklist

- [ ] Navigate to `/field-notes/bujang-industrial-sites` - should redirect or show proper error
- [ ] Navigate to `/maps/bujang-valley` - should redirect or show proper error
- [ ] Import article with 50+ cultural terms - verify batch performance
- [ ] Import article with invalid YAML - verify structured error response
- [ ] Admin dashboard shows error codes with hints
