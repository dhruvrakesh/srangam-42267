
# Phase 1: Immediate Reliability & Scalability Improvements

## Executive Summary

This implementation plan addresses the five highest-priority improvements identified in the reliability audit. The plan first updates documentation to preserve context, then implements changes in order of priority and dependency.

---

## Current State Analysis (Verified from Database - February 2025)

| Metric | Current Count | Previous (Jan 2025) | Growth |
|--------|--------------|---------------------|--------|
| **Total Articles** | 49 | 41 | +19.5% |
| **Published** | 40 | 32 | +25% |
| **Drafts** | 9 | 9 | 0% |
| **Cross-References** | 1,066 | 740 | +44% |
| **Cultural Terms** | 1,699 | 1,628 | +4.4% |
| **Tags** | 170 | 146 | +16.4% |
| **Uncategorized Tags** | 66 (39%) | 42 (29%) | +57% |

### What's Already Complete (Phase 19)

| Component | Status | Location |
|-----------|--------|----------|
| Centralized slug resolver | ✅ Complete | `src/lib/slugResolver.ts` |
| Single OR query with 10s timeout | ✅ Complete | Built into resolver |
| `useArticleId` uses resolver | ✅ Complete | `src/hooks/useArticleId.ts` |
| `useArticleBibliography` uses resolver | ✅ Complete | `src/hooks/useArticleBibliography.ts` |
| `suggest-tag-categories` with Lovable AI | ✅ Complete | Edge function updated |
| Documentation foundation | ✅ Complete | `docs/RELIABILITY_AUDIT.md`, `docs/SCALABILITY_ROADMAP.md` |

### What Remains (This Phase)

| Task | Priority | Status |
|------|----------|--------|
| Update documentation with Phase 1 context | HIGH | 🔲 Pending |
| Paginate article lists | HIGH | 🔲 Pending |
| Batch cultural term upsert | HIGH | 🔲 Pending |
| Refactor OceanicArticlePage | MEDIUM | 🔲 Pending |
| Structured error responses | MEDIUM | 🔲 Pending |

---

## Phase 1.0: Documentation Update (Context Preservation)

### Files to Update

**1. Update `docs/CURRENT_STATUS.md`**

Add Phase 1 implementation section:
- Document current database metrics (49 articles, 1,066 cross-refs)
- Track pagination implementation progress
- Document batch upsert optimization
- Add component refactoring status

**2. Update `docs/SCALABILITY_ROADMAP.md`**

Update Phase 19 completion status and add Phase 1 tasks:
- Mark completed tasks from Phase 19
- Add new Tier 2 bottleneck thresholds based on current growth
- Update data growth projections

**3. Update `docs/RELIABILITY_AUDIT.md`**

Add Phase 1 sections:
- Document cultural term batch pattern
- Add pagination implementation details
- Update performance benchmarks with current data

---

## Phase 1.2: Paginate Article Lists

### Problem

Current `useAllArticles` fetches ALL articles without pagination:
```typescript
// src/hooks/useArticles.ts (lines 37-41)
const { data, error } = await supabase
  .from('srangam_articles')
  .select('*')  // Fetches ALL columns
  .eq('status', 'published')
  .order('published_date', { ascending: false });
  // No .range() - fetches all 49 articles
```

Admin `ArticleManagement` also fetches ALL articles (line 65-68).

### Solution

**1. Create `src/hooks/useArticlesPaginated.ts`**

```typescript
interface PaginationOptions {
  page: number;
  pageSize: number;
  theme?: string;
  status?: 'published' | 'draft' | 'archived';
  searchQuery?: string;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useArticlesPaginated(options: PaginationOptions) {
  return useQuery({
    queryKey: ['articles-paginated', options],
    queryFn: async () => {
      const from = options.page * options.pageSize;
      const to = from + options.pageSize - 1;
      
      let query = supabase
        .from('srangam_articles')
        .select('id, slug, title, theme, author, status, tags, published_date, created_at', 
                { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (options.theme) query = query.eq('theme', options.theme);
      if (options.status) query = query.eq('status', options.status);
      if (options.searchQuery) {
        query = query.ilike('title->>en', `%${options.searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        data: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / options.pageSize),
        currentPage: options.page,
        hasNextPage: to < (count || 0) - 1,
        hasPreviousPage: options.page > 0,
      };
    },
  });
}
```

**2. Add Optional Pagination to `useAllArticles`**

Maintain backward compatibility:
```typescript
export const useAllArticles = (
  language: SupportedLanguage = 'en',
  options?: { limit?: number }
) => {
  return useQuery({
    queryFn: async () => {
      let query = supabase
        .from('srangam_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false });
      
      // Add optional limit for homepage (20 articles) vs full list
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      // ... rest unchanged
    },
  });
};
```

**3. Update `ArticleManagement.tsx`**

Add pagination state and controls:
```typescript
const [page, setPage] = useState(0);
const [pageSize] = useState(20);
const [themeFilter, setThemeFilter] = useState<string | undefined>();

const { data: paginatedData, isLoading } = useArticlesPaginated({
  page,
  pageSize,
  theme: themeFilter,
});

// Add pagination controls to DataTable
<DataTablePagination
  currentPage={paginatedData?.currentPage || 0}
  totalPages={paginatedData?.totalPages || 1}
  onPageChange={setPage}
/>
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/hooks/useArticlesPaginated.ts` | **Create** - New paginated hook |
| `src/hooks/useArticles.ts` | Modify - Add optional limit parameter |
| `src/pages/admin/ArticleManagement.tsx` | Modify - Wire pagination UI |
| `src/components/admin/ArticlePagination.tsx` | **Create** - Pagination controls |

---

## Phase 1.3: Batch Cultural Term Upsert

### Problem

Current N+1 pattern in `markdown-to-article-import/index.ts` (lines 728-792):

```typescript
for (const term of culturalTerms) {
  // Query 1: Check if exists
  const { data: existingTerm } = await supabase
    .from('srangam_cultural_terms')
    .select('id, term, usage_count')
    .ilike('term', normalizedTerm)
    .maybeSingle();

  if (existingTerm) {
    // Query 2: Update usage count
    await supabase.update({ usage_count: existingTerm.usage_count + 1 });
  } else {
    // Query 2: Insert new term
    await supabase.insert({ ... });
  }
}
// Result: 2N queries for N terms (3,398+ queries for 1,699 terms)
```

### Solution

**1. Create Database Function for Atomic Increment**

```sql
-- Migration: Create batch increment function
CREATE OR REPLACE FUNCTION increment_term_usage_counts(term_names text[])
RETURNS TABLE(term text, new_count integer) AS $$
BEGIN
  RETURN QUERY
  UPDATE srangam_cultural_terms
  SET usage_count = usage_count + 1
  WHERE srangam_cultural_terms.term = ANY(term_names)
  RETURNING srangam_cultural_terms.term, srangam_cultural_terms.usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_term_usage_counts(text[]) TO service_role;
```

**2. Replace Loop with Batch Operations**

```typescript
// Step 10: Save cultural terms to database (BATCH VERSION)
console.log(`Processing ${culturalTerms.length} cultural terms...`);

// 1. Filter and normalize all terms
const validTerms = culturalTerms
  .filter(term => {
    const isURL = /^https?:\/\//.test(term);
    const hasMarkdownSyntax = /[\[\]\(\)#`]/.test(term);
    const isTooLong = term.length > 50;
    const isTooShort = term.length < 3;
    const isNumericOnly = /^\d+$/.test(term);
    return !(isURL || hasMarkdownSyntax || isTooLong || isTooShort || isNumericOnly);
  });

// 2. Deduplicate terms (case-insensitive)
const uniqueTermsMap = new Map<string, string>();
for (const term of validTerms) {
  const normalized = term.toLowerCase().trim();
  if (!uniqueTermsMap.has(normalized)) {
    uniqueTermsMap.set(normalized, term); // Keep original display form
  }
}

const termsToProcess = Array.from(uniqueTermsMap.entries()).map(([normalized, display]) => ({
  term: normalized,
  display_term: display,
  module: 'general',
  translations: { en: display },
  usage_count: 1,
}));

console.log(`Deduped ${culturalTerms.length} → ${termsToProcess.length} unique terms`);

// 3. Single upsert with ON CONFLICT
const { data: upsertedTerms, error: upsertError } = await supabase
  .from('srangam_cultural_terms')
  .upsert(termsToProcess, {
    onConflict: 'term',
    ignoreDuplicates: false, // We want to update on conflict
  })
  .select('term');

if (upsertError) {
  console.error('Batch term upsert error:', upsertError);
} else {
  console.log(`✓ Upserted ${upsertedTerms?.length || 0} terms`);
}

// 4. Increment usage counts for existing terms via RPC
const termNames = termsToProcess.map(t => t.term);
const { data: incrementedTerms, error: rpcError } = await supabase
  .rpc('increment_term_usage_counts', { term_names: termNames });

if (rpcError) {
  console.error('Usage count increment error:', rpcError);
} else {
  console.log(`✓ Incremented counts for ${incrementedTerms?.length || 0} existing terms`);
}
```

**Result:** 2N queries → 2 queries (upsert + RPC)

### Files to Modify

| File | Change |
|------|--------|
| Database migration | Add `increment_term_usage_counts` RPC function |
| `supabase/functions/markdown-to-article-import/index.ts` | Replace N+1 loop with batch operations |

---

## Phase 1.4: Refactor OceanicArticlePage

### Problem

`src/components/oceanic/OceanicArticlePage.tsx` is 528 lines with:
- Data fetching mixed with rendering
- No skeleton loaders (only "Loading article..." text)
- Sequential data loading
- Monolithic structure hard to maintain

### Solution

**1. Create Article Subcomponents**

Create `src/components/oceanic/article/` directory with:

| Component | Lines | Responsibility |
|-----------|-------|----------------|
| `ArticleHeroImage.tsx` | ~45 | Hero image with GDrive proxy, error handling |
| `ArticleHeader.tsx` | ~70 | Title, tags, meta, sidebar toggle, back button |
| `ArticleContent.tsx` | ~40 | ProfessionalTextFormatter wrapper |
| `ArticleGeography.tsx` | ~60 | Pins section with map buttons |
| `ArticleBibliography.tsx` | ~50 | MLA references with reading room link |
| `ArticleSidebar.tsx` | ~70 | SourcesAndPins, methods, related |
| `ArticleMethodsDialog.tsx` | ~80 | Research methodology modal |
| `ArticleSkeleton.tsx` | ~60 | Skeleton loaders for each section |
| `ArticleError.tsx` | ~50 | Error state with retry button |
| `ArticleSEO.tsx` | ~80 | Helmet with meta tags, structured data |
| `index.ts` | ~15 | Barrel exports |

**2. Create `src/hooks/useArticle.ts` Unified Hook**

```typescript
export function useArticle(slug: string | undefined) {
  // Parallel data fetching
  const articleQuery = useQuery({
    queryKey: ['article', slug],
    queryFn: () => resolveOceanicArticle(slug!),
    enabled: !!slug,
  });

  const bibliographyQuery = useArticleBibliographyBySlug(slug);
  
  const crossReferencesQuery = useQuery({
    queryKey: ['article-cross-refs', slug],
    queryFn: async () => {
      const resolved = await resolveArticleId(slug!);
      if (!resolved) return [];
      
      const { data } = await supabase
        .from('srangam_cross_references')
        .select('*, target:srangam_articles!target_article_id(slug, slug_alias, title)')
        .eq('source_article_id', resolved.id)
        .order('strength', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!slug,
  });

  return {
    article: articleQuery.data,
    bibliography: bibliographyQuery.data,
    crossReferences: crossReferencesQuery.data,
    isLoading: articleQuery.isLoading,
    isArticleLoading: articleQuery.isLoading,
    isBibliographyLoading: bibliographyQuery.isLoading,
    error: articleQuery.error?.message,
  };
}
```

**3. Add Skeleton Loaders**

```typescript
// src/components/oceanic/article/ArticleSkeleton.tsx
export function ArticleHeaderSkeleton() {
  return (
    <div className="space-y-4 mb-8">
      <div className="h-10 bg-muted rounded animate-pulse w-24" /> {/* Back button */}
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="h-10 bg-muted rounded animate-pulse w-3/4" /> {/* Title */}
      <div className="h-5 bg-muted rounded animate-pulse w-1/4" /> {/* Meta */}
    </div>
  );
}

export function ArticleHeroSkeleton() {
  return (
    <div className="mb-6">
      <div className="w-full h-48 md:h-64 lg:h-72 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}

export function ArticleContentSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" 
               style={{ width: `${90 - i * 5}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}
```

**4. Refactored OceanicArticlePage (~150 lines)**

```typescript
export const OceanicArticlePage: React.FC = () => {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = normalizeSlug(rawSlug);
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { article, bibliography, crossReferences, isLoading, error } = useArticle(slug);

  // Canonical redirect (keep existing logic)
  useEffect(() => {
    if (article?.slug_alias && article.slug_alias !== slug) {
      navigate(`/articles/${article.slug_alias}`, { replace: true });
    }
  }, [article, slug, navigate]);

  if (error) return <ArticleError error={error} />;

  return (
    <>
      <ArticleSEO article={article} bibliography={bibliography} />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {isLoading ? <ArticleHeaderSkeleton /> : (
            <ArticleHeader 
              article={article!} 
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
          
          {isLoading ? <ArticleHeroSkeleton /> : (
            <ArticleHeroImage article={article!} />
          )}
          
          <div className={cn(
            "grid gap-8 transition-all duration-300",
            sidebarCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-4"
          )}>
            <div className={cn("space-y-8", sidebarCollapsed ? "" : "lg:col-span-3")}>
              {isLoading ? <ArticleContentSkeleton /> : (
                <ArticleContent article={article!} />
              )}
              <ArticleGeography pins={article?.pins || []} />
              <ArticleBibliography mlaRefs={article?.mla_refs || []} />
            </div>
            
            <ArticleSidebar 
              article={article} 
              crossReferences={crossReferences}
              collapsed={sidebarCollapsed}
            />
          </div>
          
          <NarrationErrorBoundary>
            <UniversalNarrator ... />
          </NarrationErrorBoundary>
        </div>
      </div>
    </>
  );
};
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/oceanic/article/ArticleHeroImage.tsx` | **Create** |
| `src/components/oceanic/article/ArticleHeader.tsx` | **Create** |
| `src/components/oceanic/article/ArticleContent.tsx` | **Create** |
| `src/components/oceanic/article/ArticleGeography.tsx` | **Create** |
| `src/components/oceanic/article/ArticleBibliography.tsx` | **Create** |
| `src/components/oceanic/article/ArticleSidebar.tsx` | **Create** |
| `src/components/oceanic/article/ArticleMethodsDialog.tsx` | **Create** |
| `src/components/oceanic/article/ArticleSkeleton.tsx` | **Create** |
| `src/components/oceanic/article/ArticleError.tsx` | **Create** |
| `src/components/oceanic/article/ArticleSEO.tsx` | **Create** |
| `src/components/oceanic/article/index.ts` | **Create** |
| `src/hooks/useArticle.ts` | **Create** |
| `src/components/oceanic/OceanicArticlePage.tsx` | Refactor to use subcomponents |

---

## Phase 1.5: Structured Error Responses

### Problem

Current error handling returns generic messages:
```typescript
// markdown-to-article-import (current)
return new Response(JSON.stringify({ 
  success: false, 
  error: error.message  // "Could not insert article" - not actionable
}), ...);
```

Admin UI shows the same generic text without guidance.

### Solution

**1. Create `supabase/functions/_shared/errors.ts`**

```typescript
export interface SrangamError {
  code: string;
  type: 'validation' | 'database' | 'ai' | 'network' | 'permission';
  message: string;
  details?: Record<string, any>;
  hint?: string;
}

export const ErrorCodes = {
  // Validation (E1xx)
  MISSING_FRONTMATTER: { code: 'E101', type: 'validation' as const, 
    hint: 'Add YAML frontmatter with --- delimiters at the start of the file' },
  INVALID_YAML: { code: 'E102', type: 'validation' as const, 
    hint: 'Wrap text values in quotes, especially if they contain colons or special characters' },
  MISSING_TITLE: { code: 'E103', type: 'validation' as const, 
    hint: 'Add a "title:" field in the frontmatter' },
  INVALID_THEME: { code: 'E104', type: 'validation' as const, 
    hint: 'Use one of: Ancient India, Indian Ocean World, Scripts & Inscriptions, Geology & Deep Time, Empires & Exchange, Sacred Ecology' },
  EMPTY_CONTENT: { code: 'E105', type: 'validation' as const,
    hint: 'Article must have content after the frontmatter' },
  
  // Database (E2xx)
  DUPLICATE_SLUG: { code: 'E201', type: 'database' as const, 
    hint: 'Enable "Overwrite existing article" or change the title to generate a different slug' },
  WRITE_FAILED: { code: 'E202', type: 'database' as const, 
    hint: 'Database write failed. Check your connection and try again' },
  
  // AI (E3xx)
  TAG_GENERATION_FAILED: { code: 'E301', type: 'ai' as const, 
    hint: 'Tags will be empty. You can add tags manually or retry import later' },
  AI_RATE_LIMIT: { code: 'E302', type: 'ai' as const,
    hint: 'AI service is busy. Wait a minute and try again' },
  
  // Permission (E4xx)
  RLS_DENIED: { code: 'E401', type: 'permission' as const, 
    hint: 'You need admin permissions for this action' },
  
  // Network (E5xx)
  TIMEOUT: { code: 'E501', type: 'network' as const, 
    hint: 'Request took too long. Try importing a shorter article or check your connection' },
} as const;

export function createError(
  errorDef: typeof ErrorCodes[keyof typeof ErrorCodes],
  message: string,
  details?: Record<string, any>
): SrangamError {
  return {
    ...errorDef,
    message,
    details,
  };
}

export function formatErrorResponse(error: SrangamError, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify({
    success: false,
    error,
  }), {
    status: error.type === 'validation' ? 400 : 
            error.type === 'permission' ? 403 : 
            error.type === 'network' ? 504 : 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

**2. Update Import Function Error Handling**

```typescript
// supabase/functions/markdown-to-article-import/index.ts
import { ErrorCodes, createError, formatErrorResponse } from '../_shared/errors.ts';

// Replace generic error:
if (!frontmatter) {
  return formatErrorResponse(
    createError(ErrorCodes.MISSING_FRONTMATTER, 'No YAML frontmatter found'),
    corsHeaders
  );
}

// For YAML parse errors:
catch (yamlError) {
  return formatErrorResponse(
    createError(
      ErrorCodes.INVALID_YAML, 
      'Failed to parse YAML frontmatter',
      { 
        parseError: yamlError.message,
        lineNumber: yamlError.line,
        preview: frontmatterBlock?.substring(0, 200)
      }
    ),
    corsHeaders
  );
}

// For duplicate slug:
if (existingArticle && !overwriteExisting) {
  return formatErrorResponse(
    createError(
      ErrorCodes.DUPLICATE_SLUG,
      `Article with slug "${generatedSlug}" already exists`,
      { existingSlug: existingArticle.slug, existingTitle: existingArticle.title?.en }
    ),
    corsHeaders
  );
}
```

**3. Update MarkdownImport.tsx Error Display**

```typescript
// Enhanced error display with structured errors
{importResult?.error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle className="flex items-center gap-2">
      {importResult.error.type === 'validation' ? 'Validation Error' : 
       importResult.error.type === 'database' ? 'Database Error' :
       importResult.error.type === 'permission' ? 'Permission Denied' :
       'Import Error'}
      <Badge variant="outline" className="font-mono text-xs">
        {importResult.error.code}
      </Badge>
    </AlertTitle>
    <AlertDescription className="mt-2">
      <p>{importResult.error.message}</p>
      
      {importResult.error.hint && (
        <div className="mt-3 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            {importResult.error.hint}
          </p>
        </div>
      )}
      
      {importResult.error.details && (
        <Collapsible className="mt-3">
          <CollapsibleTrigger className="text-xs text-muted-foreground hover:underline">
            Show technical details
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(importResult.error.details, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </AlertDescription>
  </Alert>
)}
```

**4. Create `docs/ERROR_HANDLING.md`**

Document all error codes with examples and resolution steps.

### Files to Create/Modify

| File | Change |
|------|--------|
| `supabase/functions/_shared/errors.ts` | **Create** - Shared error types |
| `supabase/functions/markdown-to-article-import/index.ts` | Modify - Use structured errors |
| `src/pages/admin/MarkdownImport.tsx` | Modify - Display structured errors |
| `docs/ERROR_HANDLING.md` | **Create** - Error code documentation |

---

## Implementation Order

| Order | Phase | Task | Priority | Effort | Risk |
|-------|-------|------|----------|--------|------|
| 1 | 1.0 | Update documentation | HIGH | 30m | Low |
| 2 | 1.5 | Create `_shared/errors.ts` | HIGH | 30m | Low |
| 3 | 1.5 | Update import function errors | HIGH | 45m | Low |
| 4 | 1.5 | Update MarkdownImport UI | MEDIUM | 30m | Low |
| 5 | 1.3 | Create DB function for batch | HIGH | 15m | Medium |
| 6 | 1.3 | Batch cultural term upsert | HIGH | 1h | Medium |
| 7 | 1.2 | Create useArticlesPaginated | HIGH | 45m | Low |
| 8 | 1.2 | Update ArticleManagement | MEDIUM | 45m | Low |
| 9 | 1.4 | Create article subcomponents | MEDIUM | 2h | Low |
| 10 | 1.4 | Create useArticle hook | MEDIUM | 30m | Low |
| 11 | 1.4 | Refactor OceanicArticlePage | MEDIUM | 45m | Medium |

**Total Estimated Effort:** ~8 hours

---

## Database Migration Required

```sql
-- Phase 1.3: Batch increment function for cultural terms
CREATE OR REPLACE FUNCTION increment_term_usage_counts(term_names text[])
RETURNS TABLE(term text, new_count integer) AS $$
BEGIN
  RETURN QUERY
  UPDATE srangam_cultural_terms
  SET usage_count = usage_count + 1
  WHERE srangam_cultural_terms.term = ANY(term_names)
  RETURNING srangam_cultural_terms.term, srangam_cultural_terms.usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to service role (edge functions)
GRANT EXECUTE ON FUNCTION increment_term_usage_counts(text[]) TO service_role;
```

---

## Files Summary

### Create (16 files)

| File | Purpose |
|------|---------|
| `src/hooks/useArticlesPaginated.ts` | Paginated article fetching |
| `src/hooks/useArticle.ts` | Unified article data hook |
| `src/components/admin/ArticlePagination.tsx` | Pagination controls |
| `src/components/oceanic/article/ArticleHeroImage.tsx` | Hero image component |
| `src/components/oceanic/article/ArticleHeader.tsx` | Header component |
| `src/components/oceanic/article/ArticleContent.tsx` | Content wrapper |
| `src/components/oceanic/article/ArticleGeography.tsx` | Pins section |
| `src/components/oceanic/article/ArticleBibliography.tsx` | Bibliography section |
| `src/components/oceanic/article/ArticleSidebar.tsx` | Sidebar component |
| `src/components/oceanic/article/ArticleMethodsDialog.tsx` | Methods modal |
| `src/components/oceanic/article/ArticleSkeleton.tsx` | Skeleton loaders |
| `src/components/oceanic/article/ArticleError.tsx` | Error state |
| `src/components/oceanic/article/ArticleSEO.tsx` | SEO metadata |
| `src/components/oceanic/article/index.ts` | Barrel exports |
| `supabase/functions/_shared/errors.ts` | Shared error types |
| `docs/ERROR_HANDLING.md` | Error code documentation |

### Modify (6 files)

| File | Change |
|------|--------|
| `docs/CURRENT_STATUS.md` | Add Phase 1 documentation |
| `docs/SCALABILITY_ROADMAP.md` | Update completion status |
| `docs/RELIABILITY_AUDIT.md` | Add new sections |
| `src/hooks/useArticles.ts` | Add optional limit |
| `src/pages/admin/ArticleManagement.tsx` | Wire pagination |
| `supabase/functions/markdown-to-article-import/index.ts` | Batch terms + structured errors |
| `src/pages/admin/MarkdownImport.tsx` | Display structured errors |
| `src/components/oceanic/OceanicArticlePage.tsx` | Refactor to use subcomponents |

---

## Expected Outcomes

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Cultural term import (1699 terms) | ~3400 queries | 2 queries | 99.9% reduction |
| Admin article list query | 49 rows (all) | 20 rows (page 1) | 59% reduction |
| OceanicArticlePage LOC | 528 lines | ~150 lines | 72% reduction |
| Error debugging time | ~5 min (trial/error) | ~30 sec (hint) | 90% reduction |
| Page load feedback | "Loading..." text | Section skeletons | UX improvement |

---

## Risk Mitigation

1. **Batch upsert rollback**: Keep old N+1 code commented for quick revert
2. **Pagination fallback**: Add `fetchAll` admin flag for exports
3. **Component extraction**: Extract one at a time, test between each
4. **Error codes**: Backwards-compatible (old clients see message string)

---

## Testing Checklist

After implementation:

- [ ] Import article with 50+ cultural terms - verify 2 queries in logs
- [ ] Admin article list - verify pagination works (page 1, 2, next/prev)
- [ ] Theme filter - verify articles filter correctly
- [ ] Load article page - verify skeleton loaders appear for each section
- [ ] Trigger YAML parse error - verify code E102 with hint
- [ ] Trigger duplicate slug - verify code E201 with hint
- [ ] Mobile article loading - verify responsive skeletons
- [ ] Run `docs/` grep for Phase 1 - verify documentation updated

---

## Success Criteria

- [ ] Cultural term import uses ≤2 database queries
- [ ] Admin pagination loads 20 articles per page
- [ ] OceanicArticlePage main file < 200 lines
- [ ] All import errors show error code + actionable hint
- [ ] Section-specific skeleton loaders during article load
- [ ] Documentation updated with Phase 1 context
