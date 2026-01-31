
# Phase 19: Srangam Platform Reliability & Scalability Implementation

## Executive Summary

This phase implements the comprehensive improvements identified in the reliability and scalability audit. The plan is organized into four sub-phases, each deployable independently with rollback capability.

---

## Current State Analysis (Verified from Code & Database)

### Database Metrics (January 2025)
| Metric | Count | Status |
|--------|-------|--------|
| Total Articles | 41 | 32 published, 9 drafts |
| Cross-References | 740 | 531 same_theme, 209 thematic |
| Cultural Terms | 1,628+ | All AI-enriched |
| Tags | 146 | 42 uncategorized (29%) |
| Bibliography Entries | 25+ | 63 article links |

### Key Issues Identified

**1. Tag Management Context Problem (User's Primary Concern)**
- 42 tags remain **Uncategorized** (29% of 146 total)
- AI categorization is **one-shot per batch** - no persistent memory
- `suggest-tag-categories` uses OpenAI API directly (not Lovable AI)
- No learning from previous categorization decisions
- Screenshots show: Mahāvidyās, Monsoon Patterns, Patiala, Baba Ala Singh all uncategorized

**2. Cross-Reference O(N) Scaling**
- `markdown-to-article-import` scans ALL published articles (lines 808-920)
- For each article: compares tags, checks theme, scans for citations
- Currently manageable with 32 articles, but scales poorly

**3. Cultural Terms N+1 Pattern**
- Lines 728-792: For each extracted term, performs separate SELECT + INSERT/UPDATE
- 1,628 terms × N queries per import = high database load

**4. Slug Resolution Inconsistency**
- `articleResolver.ts` uses single OR query (optimized)
- But `useArticleBibliographyBySlug` and other hooks use sequential queries
- Duplicate logic across 5+ files

**5. Client-Side Data Processing**
- `useAllArticles` fetches all articles without pagination
- Force-directed graph in `CrossReferencesBrowser.tsx` loads all 740+ references

---

## Phase 19.0: Documentation Hardening (Prerequisite)

### Files to Update/Create

**1. Create `docs/RELIABILITY_AUDIT.md`**
Document:
- Core invariants (unique slugs, RLS enforcement, usage count integrity)
- Critical paths (import, resolver, tag generation)
- Failure modes and mitigation strategies
- Performance benchmarks and thresholds

**2. Update `docs/CURRENT_STATUS.md`**
Add Phase 19 section documenting:
- All audit findings
- Implementation progress tracking
- Rollback procedures

**3. Create `docs/SCALABILITY_ROADMAP.md`**
Document:
- Data growth projections (10×, 50×, 100×)
- Bottleneck thresholds and migration triggers
- Long-term architecture evolution

---

## Phase 19a: Tag Categorization with Persistent Context

### Problem
Tags are categorized one batch at a time without memory of previous decisions. The AI prompt includes no historical context, leading to inconsistent categorization.

### Solution: Contextual Tag Categorization

**1. Update `suggest-tag-categories` Edge Function**

Enhance the system prompt to include:
- Previously categorized tags as examples (top 10 per category)
- Tag co-occurrence patterns from articles
- Description of categorization rules with examples

```typescript
// Enhanced system prompt with category examples
const categoryExamples = await fetchCategoryExamples(supabase);

const systemPrompt = `You are an expert in academic taxonomy...

EXISTING CATEGORIZATIONS (learn from these examples):
${categoryExamples.period.map(t => `- "${t.tag_name}" → Period`).join('\n')}
${categoryExamples.concept.map(t => `- "${t.tag_name}" → Concept`).join('\n')}
// ... etc

CATEGORIES WITH DEFINITIONS:
- Period: Historical eras, dynasties, time periods
  Examples: "Mauryan Empire", "Vedic Period", "Chola Dynasty"
- Concept: Abstract ideas, practices, themes
  Examples: "Maritime Trade", "Ritual Practices"
// ...
`;
```

**2. Migrate to Lovable AI Gateway**

Replace OpenAI direct calls with Lovable AI:
- Change endpoint from `api.openai.com` to `ai.gateway.lovable.dev`
- Use `LOVABLE_API_KEY` instead of `OPENAI_API_KEY`
- Model: `google/gemini-3-flash-preview` (fast, reliable)

**3. Add Bulk Categorization with Preview**

Enhance `TagManagement.tsx` to:
- Show preview of suggested categories before applying
- Allow manual override per tag
- Batch apply with confirmation

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/suggest-tag-categories/index.ts` | Add context examples, migrate to Lovable AI |
| `src/pages/admin/TagManagement.tsx` | Add preview/confirm flow for bulk categorization |

---

## Phase 19b: Cross-Reference Scalability

### Problem
O(N) algorithm scans all articles on every import. With 1000 articles, each import would compare against all 1000.

### Solution: Pre-computed Tag Clusters + Incremental Updates

**1. Add Tag Vector Column**

```sql
-- Migration: Add tag_vector column for fast similarity search
ALTER TABLE srangam_articles 
ADD COLUMN IF NOT EXISTS tag_vector tsvector 
GENERATED ALWAYS AS (array_to_tsvector(tags)) STORED;

CREATE INDEX IF NOT EXISTS idx_articles_tag_vector 
ON srangam_articles USING GIN(tag_vector);
```

**2. Optimize Cross-Reference Algorithm**

Replace full scan with indexed search:
```typescript
// Instead of: for each article, check if tags overlap
// Use: SELECT articles WHERE tag_vector @@ to_tsquery(new_tags)

const { data: similarArticles } = await supabase
  .from('srangam_articles')
  .select('id, slug, tags, theme, title')
  .textSearch('tag_vector', tags.join(' | '), { type: 'plain' })
  .eq('status', 'published')
  .neq('id', articleId)
  .limit(50); // Cap at 50 most relevant
```

**3. Add Incremental Re-computation**

When tags change, only recompute affected cross-references:
- Store last computed hash of tags
- On update, if hash differs, recompute only for that article

### Files to Modify

| File | Change |
|------|--------|
| Database migration | Add `tag_vector` column with GIN index |
| `markdown-to-article-import/index.ts` | Replace O(N) scan with indexed query |

---

## Phase 19c: Query Efficiency & Batching

### Problem
- Cultural terms: N+1 pattern (individual SELECT for each term)
- Multiple hooks resolve slugs differently

### Solution: Batch Operations + Centralized Resolver

**1. Batch Cultural Term Upsert**

Replace individual queries with single upsert:
```typescript
// Collect all terms first
const termsToUpsert = culturalTerms.map(term => ({
  term: term.toLowerCase().trim(),
  display_term: term,
  module: 'general',
  translations: { en: term },
  usage_count: 1,
}));

// Single upsert operation
const { data, error } = await supabase
  .from('srangam_cultural_terms')
  .upsert(termsToUpsert, {
    onConflict: 'term',
    ignoreDuplicates: false
  });
```

**2. Centralize Slug Resolution**

Create shared utility used by all hooks:
```typescript
// src/lib/slugResolver.ts
export async function resolveArticleId(slug: string): Promise<{
  id: string;
  slug: string;
  slugAlias?: string;
} | null> {
  const { data, error } = await supabase
    .from('srangam_articles')
    .select('id, slug, slug_alias')
    .or(`slug_alias.eq.${slug},slug.eq.${slug}`)
    .maybeSingle();
  
  return data;
}
```

**3. Update Hooks to Use Central Resolver**

Refactor these hooks:
- `useArticleBibliographyBySlug`
- `useArticleId`
- `useArticleCrossReferences`

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/lib/slugResolver.ts` | Create centralized resolver |
| `markdown-to-article-import/index.ts` | Batch cultural term upsert |
| `src/hooks/useArticleBibliographyBySlug.ts` | Use central resolver |

---

## Phase 19d: Frontend Performance & Pagination

### Problem
- `useAllArticles` fetches entire table
- Graph visualization loads all 740+ cross-references

### Solution: Server-Side Pagination + Lazy Loading

**1. Add Pagination to Article Queries**

```typescript
// src/hooks/useArticlesPaginated.ts
export function useArticlesPaginated(options: {
  page: number;
  pageSize: number;
  theme?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['articles-paginated', options],
    queryFn: async () => {
      const from = options.page * options.pageSize;
      const to = from + options.pageSize - 1;
      
      let query = supabase
        .from('srangam_articles')
        .select('*', { count: 'exact' })
        .range(from, to);
      
      if (options.theme) query = query.eq('theme', options.theme);
      if (options.status) query = query.eq('status', options.status);
      
      return query;
    },
  });
}
```

**2. Graph Visualization Lazy Loading**

Modify `CrossReferencesBrowser.tsx`:
- Initial load: Only articles with ≥3 connections
- Add "Show more" button for full network
- Filter by strength threshold (default: ≥3)

**3. Add Virtual Scrolling for Large Tables**

Use tanstack-virtual for admin tables with 100+ rows.

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/hooks/useArticlesPaginated.ts` | Create new paginated hook |
| `src/pages/admin/CrossReferencesBrowser.tsx` | Add connection threshold filter |
| `src/pages/admin/ArticleManagement.tsx` | Implement pagination |

---

## Phase 19e: Error Handling & Observability

### Problem
- Generic 500 errors without context
- No structured logging across edge functions

### Solution: Structured Errors + Diagnostic Logging

**1. Define Error Types**

```typescript
// supabase/functions/_shared/errors.ts
export class SrangamError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SrangamError';
  }
}

export const ErrorCodes = {
  DUPLICATE_SLUG: 'SRANGAM-E001',
  MISSING_FRONTMATTER: 'SRANGAM-E002',
  INVALID_THEME: 'SRANGAM-E003',
  AI_RATE_LIMIT: 'SRANGAM-E004',
  DATABASE_WRITE_FAILED: 'SRANGAM-E005',
};
```

**2. Enhance Import Function Error Handling**

```typescript
// Catch specific errors and return structured responses
if (frontmatter === null) {
  throw new SrangamError(
    ErrorCodes.MISSING_FRONTMATTER,
    'YAML frontmatter not found or invalid',
    { hint: 'Wrap title and other text in quotes' }
  );
}
```

**3. Add Query Timing Logs**

Consistent timing logs across all edge functions:
```typescript
const startTime = Date.now();
// ... operation ...
console.log(`[${functionName}] Operation completed in ${Date.now() - startTime}ms`);
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `supabase/functions/_shared/errors.ts` | Create shared error types |
| `supabase/functions/markdown-to-article-import/index.ts` | Use structured errors |
| `docs/ERROR_HANDLING.md` | Document error codes |

---

## Implementation Order

| Phase | Task | Priority | Effort | Risk |
|-------|------|----------|--------|------|
| 19.0 | Documentation hardening | HIGH | 2h | Low |
| 19a.1 | Add context to tag categorization | HIGH | 1h | Low |
| 19a.2 | Migrate to Lovable AI | HIGH | 30m | Medium |
| 19a.3 | Add preview flow for bulk categorization | MEDIUM | 1h | Low |
| 19b.1 | Add tag_vector column | MEDIUM | 30m | Medium |
| 19b.2 | Optimize cross-reference algorithm | MEDIUM | 1h | Medium |
| 19c.1 | Batch cultural term upsert | HIGH | 1h | Low |
| 19c.2 | Centralize slug resolution | MEDIUM | 1h | Low |
| 19d.1 | Add pagination hooks | MEDIUM | 1h | Low |
| 19d.2 | Graph lazy loading | LOW | 1h | Low |
| 19e | Structured error handling | MEDIUM | 2h | Low |

---

## Database Changes Required

```sql
-- Phase 19b: Tag vector for similarity search
ALTER TABLE srangam_articles 
ADD COLUMN IF NOT EXISTS tag_vector tsvector 
GENERATED ALWAYS AS (array_to_tsvector(COALESCE(tags, '{}'::text[]))) STORED;

CREATE INDEX IF NOT EXISTS idx_articles_tag_vector 
ON srangam_articles USING GIN(tag_vector);

-- Phase 19b: Track tag hash for incremental updates
ALTER TABLE srangam_articles
ADD COLUMN IF NOT EXISTS tags_hash text;
```

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Uncategorized tags | 42 (29%) | <10 (7%) |
| Cross-ref calculation time | O(N) | O(log N) |
| Cultural term insert time | N queries | 1 batch |
| Initial page load (1000 articles) | Fetch all | Paginated (20/page) |
| Error clarity | Generic 500 | Structured codes |

---

## Risk Mitigation

1. **Feature Flags**: New algorithms behind flags, revert if issues
2. **Rollback Scripts**: SQL to remove new columns if needed
3. **Parallel Deployment**: Keep old code paths until new ones validated
4. **Incremental Rollout**: Test each phase independently

---

## Rollback Procedures

**Phase 19a (Tag Context)**:
- Revert edge function to previous version
- No database changes to roll back

**Phase 19b (Tag Vector)**:
```sql
DROP INDEX IF EXISTS idx_articles_tag_vector;
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS tag_vector;
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS tags_hash;
```

**Phase 19c (Batch Upsert)**:
- Revert edge function to N+1 pattern
- No database changes

**Phase 19d (Pagination)**:
- Keep old hooks, disable new ones via flag

---

## Technical Details

### Tag Categorization Context Fetch

```typescript
async function fetchCategoryExamples(supabase: any) {
  const categories = ['Period', 'Concept', 'Location', 'Methodology', 'Subject'];
  const examples: Record<string, any[]> = {};
  
  for (const category of categories) {
    const { data } = await supabase
      .from('srangam_tags')
      .select('tag_name')
      .eq('category', category)
      .order('usage_count', { ascending: false })
      .limit(10);
    
    examples[category.toLowerCase()] = data || [];
  }
  
  return examples;
}
```

### Lovable AI Integration for Tags

```typescript
// Replace OpenAI with Lovable AI
const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
  }),
});
```

---

## Success Criteria

- [ ] 90%+ tags categorized (from 71%)
- [ ] Cross-reference calculation <100ms (from ~500ms at 32 articles)
- [ ] Cultural term import <500ms (from ~2s with N+1)
- [ ] Admin article list loads in <1s for 1000+ articles
- [ ] Zero uncaught errors in edge function logs
- [ ] Documentation complete for all phases
