
# Fix Related Articles Formatting

## Problem Analysis

Based on the screenshots and code review, two issues exist in the Related Articles section:

1. **Title text truncation**: Article titles are being cut off (e.g., "Chapter 6: Śarīra and Ātman – Preserving the Body and S...") because the Button component lacks proper text wrapping styles

2. **Hardcoded read time**: The `read_time_min` is hardcoded to `5` instead of being fetched from the database

## Root Causes

### Issue 1: Text Truncation
Location: `src/components/oceanic/OceanicArticlePage.tsx` (lines 369-381)

```typescript
<Button
  variant="ghost"
  className="w-full justify-start p-2 h-auto text-left"
>
  <div>
    <div className="font-medium text-sm">{relatedArticle.title}</div>
    ...
  </div>
</Button>
```

The Button with `w-full` doesn't allow the inner text to wrap properly. The default Button styles may include `whitespace-nowrap` or overflow hidden.

### Issue 2: Missing Read Time Data
Location: `src/hooks/useArticle.ts` (lines 62-68)

```typescript
target:srangam_articles!target_article_id(slug, slug_alias, title)
```

The query doesn't fetch `read_time_minutes` from the target article.

Location: `src/components/oceanic/OceanicArticlePage.tsx` (lines 123-129)

```typescript
read_time_min: 5,  // Hardcoded instead of using actual data
```

---

## Solution

### 1. Update useArticle.ts - Add read_time_minutes to query

**File:** `src/hooks/useArticle.ts`

Change the select query to include `read_time_minutes`:

```typescript
// Line 19-21: Update interface
target: {
  slug: string;
  slug_alias: string | null;
  title: Record<string, string> | null;
  read_time_minutes: number | null;  // ADD THIS
} | null;
```

```typescript
// Line 62-68: Update query
target:srangam_articles!target_article_id(slug, slug_alias, title, read_time_minutes)
```

### 2. Update OceanicArticlePage.tsx - Use actual data and fix styling

**File:** `src/components/oceanic/OceanicArticlePage.tsx`

```typescript
// Lines 123-129: Use actual read_time_minutes
const relatedArticles = crossReferences && crossReferences.length > 0
  ? crossReferences.slice(0, 3).map(ref => ({
      slug: ref.target?.slug_alias || ref.target?.slug || '',
      title: (ref.target?.title as Record<string, string>)?.en || 'Related Article',
      read_time_min: ref.target?.read_time_minutes || 5,  // Use actual value
    }))
  : [];
```

```typescript
// Lines 369-381: Fix button styling for text wrapping
<Button
  key={index}
  variant="ghost"
  className="w-full justify-start p-3 h-auto text-left whitespace-normal"
  onClick={() => navigate(`/articles/${relatedArticle.slug}`)}
>
  <div className="text-left overflow-hidden">
    <div className="font-medium text-sm break-words line-clamp-2">
      {relatedArticle.title}
    </div>
    <div className="text-xs text-muted-foreground">
      {relatedArticle.read_time_min} min
    </div>
  </div>
</Button>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useArticle.ts` | Add `read_time_minutes` to CrossReference interface and query |
| `src/components/oceanic/OceanicArticlePage.tsx` | Use actual read time data + fix text wrapping styles |

---

## Expected Outcome

| Before | After |
|--------|-------|
| Titles cut off after container width | Titles wrap to 2 lines with ellipsis |
| All articles show "5 min" | Each article shows its actual read time |
| Poor visual hierarchy | Clean, readable article cards |

---

## Testing Checklist

- [ ] Related articles titles wrap properly (not cut off)
- [ ] Read times show actual values from database
- [ ] Clicking related article navigates correctly
- [ ] Long titles show 2 lines with ellipsis (line-clamp-2)
