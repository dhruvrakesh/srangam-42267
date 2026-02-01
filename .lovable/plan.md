
# Phase 1 Completion: Pagination & Article Page Refactor

## Overview

This plan completes the remaining Phase 1 tasks:
1. **Wire pagination into ArticleManagement.tsx** - Replace full-table fetch with paginated hook
2. **Refactor OceanicArticlePage.tsx** - Use the new `useArticle` hook and skeleton loaders

---

## Current State (Verified)

### Already Created
| File | Status |
|------|--------|
| `src/hooks/useArticlesPaginated.ts` | ✅ Created |
| `src/hooks/useArticle.ts` | ✅ Created |
| `src/components/admin/ArticlePagination.tsx` | ✅ Created |
| `src/components/oceanic/article/ArticleSkeleton.tsx` | ✅ Created |
| `src/components/oceanic/article/ArticleError.tsx` | ✅ Created |
| `src/components/oceanic/article/index.ts` | ✅ Created |

### Files to Modify
| File | Lines | Change |
|------|-------|--------|
| `src/pages/admin/ArticleManagement.tsx` | 477 | Wire pagination hook |
| `src/components/oceanic/OceanicArticlePage.tsx` | 528→~200 | Use hooks + skeletons |

---

## Task 1: Wire Pagination into ArticleManagement.tsx

### Changes Required

**1. Add imports**
```typescript
import { useArticlesPaginated, type PaginatedArticle } from '@/hooks/useArticlesPaginated';
import { ArticlePagination } from '@/components/admin/ArticlePagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

**2. Add pagination state (after line 60)**
```typescript
const [page, setPage] = useState(0);
const [pageSize] = useState(20);
const [statusFilter, setStatusFilter] = useState<'published' | 'draft' | 'archived' | undefined>();
const [themeFilter, setThemeFilter] = useState<string | undefined>();
```

**3. Replace query (lines 62-73)**
```typescript
const { data: paginatedData, isLoading } = useArticlesPaginated({
  page,
  pageSize,
  status: statusFilter,
  theme: themeFilter,
});

const articles = paginatedData?.data || [];
```

**4. Update stats calculation (lines 75-85)**
Stats will use totals from paginated response instead of array length.

**5. Add filter UI in CardHeader (around line 412-415)**
Add theme and status filter dropdowns.

**6. Add pagination controls after DataTable (around line 424)**
```typescript
{paginatedData && (
  <ArticlePagination
    currentPage={paginatedData.currentPage}
    totalPages={paginatedData.totalPages}
    totalCount={paginatedData.totalCount}
    pageSize={pageSize}
    onPageChange={setPage}
  />
)}
```

---

## Task 2: Refactor OceanicArticlePage.tsx

### Strategy: Gradual Refactor (Not Full Rewrite)

Replace the inline loading/error states with the new components while keeping the existing layout.

### Changes Required

**1. Update imports (lines 1-20)**
```typescript
import { useArticle } from '@/hooks/useArticle';
import { 
  ArticleFullSkeleton, 
  ArticleError 
} from '@/components/oceanic/article';
```

**2. Replace useState + useEffect with useArticle hook (lines 44-93)**

Current (lines 44-93):
```typescript
const [article, setArticle] = useState<ResolvedArticle | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
// ... useEffect with manual loading
```

Replace with:
```typescript
const { 
  article, 
  bibliography, 
  crossReferences, 
  isLoading: loading, 
  error 
} = useArticle(slug || undefined);
```

**3. Replace loading state (lines 95-103)**
```typescript
if (loading) {
  return <ArticleFullSkeleton />;
}
```

**4. Replace error state (lines 105-139)**
```typescript
if (error || !article) {
  return <ArticleError error={error || 'Article not found'} slug={slug || undefined} />;
}
```

**5. Keep canonical redirect logic but simplify**
Move into the component body after data loads.

**6. Remove inline bibliography query (line 52)**
The `useArticle` hook already fetches bibliography in parallel.

**7. Update sidebar Related Articles to use crossReferences**
Replace static `allCards` with dynamic cross-references when available.

---

## Implementation Details

### ArticleManagement.tsx Final Structure

```typescript
export default function ArticleManagement() {
  // Auth & utils
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [themeFilter, setThemeFilter] = useState<string | undefined>();
  
  // Component state
  const [retagging, setRetagging] = useState(false);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Paginated query
  const { data: paginatedData, isLoading } = useArticlesPaginated({
    page,
    pageSize,
    status: statusFilter as any,
    theme: themeFilter,
  });

  const articles = (paginatedData?.data || []) as Article[];

  // ... rest of component with filters and pagination controls
}
```

### OceanicArticlePage.tsx Final Structure

```typescript
export const OceanicArticlePage: React.FC = () => {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = normalizeSlug(rawSlug);
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMethodsDialog, setShowMethodsDialog] = useState(false);
  
  // Phase 1.4: Unified data hook
  const { 
    article, 
    bibliography, 
    crossReferences, 
    isLoading, 
    error 
  } = useArticle(slug || undefined);

  // Canonical redirect
  useEffect(() => {
    if (article?.slug_alias && article.slug_alias !== slug) {
      navigate(`/articles/${article.slug_alias}`, { replace: true });
    }
  }, [article, slug, navigate]);

  // Loading state with skeleton
  if (isLoading) {
    return <ArticleFullSkeleton />;
  }

  // Error state with retry
  if (error || !article) {
    return <ArticleError error={error || 'Article not found'} slug={slug || undefined} />;
  }

  // ... rest of render (SEO, content, sidebar)
}
```

---

## Files Summary

### Modify (2 files)

| File | Change |
|------|--------|
| `src/pages/admin/ArticleManagement.tsx` | Replace inline query with `useArticlesPaginated`, add filters and pagination UI |
| `src/components/oceanic/OceanicArticlePage.tsx` | Replace useState/useEffect with `useArticle`, use skeleton/error components |

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Admin article list query | All 49 rows | 20 rows/page |
| Article page loading UI | "Loading article..." text | Section-specific skeletons |
| Article page data fetching | Sequential | Parallel (article + bib + cross-refs) |
| OceanicArticlePage LOC | 528 | ~250 |
| Error handling | Inline Card | Dedicated component with retry |

---

## Testing Checklist

After implementation:
- [ ] Admin article list shows first 20 articles
- [ ] Pagination controls work (next/prev/first/last)
- [ ] Status filter shows only published/draft/archived
- [ ] Theme filter narrows results correctly
- [ ] Article page shows skeleton during load
- [ ] Article page shows error with retry button on failure
- [ ] Related articles show cross-references when available
- [ ] Canonical redirect still works for slug_alias
