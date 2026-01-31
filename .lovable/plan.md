
# Phase 18: Author & Article Metadata Management System

## Executive Summary

This phase implements a comprehensive author management system and article metadata editor to address the missing content management capabilities identified in the admin dashboard. The solution includes both immediate fixes (article edit dialog) and enterprise enhancements (author registry with normalization).

---

## Audit Findings

### Current Database State (Verified)

**Author Distribution:**
| Author Name | Article Count |
|-------------|---------------|
| NF Research Team | 30 |
| Srangam Research | 8 |
| Srangam Research Team | 2 |
| Nartiang Foundation Research Team | 1 |

**Issues Identified:**
1. 4 different author name variants for what appears to be 2 entities
2. No structured author data (bio, affiliation, ORCID)
3. "Edit Metadata" menu item is a non-functional placeholder
4. No way to correct article metadata after import

### Database Schema (srangam_articles - Author Related)

| Column | Type | Nullable | Current State |
|--------|------|----------|---------------|
| `author` | TEXT | NO | Plain text, 4 variants |
| `title` | JSONB | NO | Multilingual `{en, hi, ta}` |
| `dek` | JSONB | YES | Subtitle/summary |
| `theme` | TEXT | NO | One of 6 themes |
| `status` | TEXT | NO | `draft` or `published` |
| `tags` | TEXT[] | YES | AI-generated array |

---

## Implementation Architecture

### Option A: Inline Author Autocomplete (Minimal - Recommended Start)
- Edit dialog with author text field
- Autocomplete from existing unique authors
- No new database tables
- Quick to implement, immediate value

### Option B: Author Registry (Enterprise - Future Phase)
- New `srangam_authors` table with structured data
- Author profiles with bio, affiliation, ORCID
- Foreign key reference from articles
- Author management page in admin

**Recommendation:** Implement Option A now, with architecture ready for Option B later.

---

## Phase 18.0: Documentation Update (Context Preservation)

### Files to Update

**1. Update `docs/CURRENT_STATUS.md`**
Add Phase 18 section documenting:
- Author management capability gap
- Article edit dialog implementation
- Author normalization approach

**2. Update `docs/ADMIN_DASHBOARD.md`**
Add new sections:
- Article Metadata Editor capabilities
- Author field with autocomplete
- Bulk update workflows

---

## Phase 18a: Article Metadata Edit Dialog

### New Component: `src/components/admin/ArticleEditDialog.tsx`

A Sheet component for editing article metadata:

```
┌─────────────────────────────────────────────────────────┐
│ Edit Article Metadata                                  ✕│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Title (English) *                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Vedic Preservation Techniques in Ancient India      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Author *                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Srangam Research Team                          ▼   │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ ○ NF Research Team (30 articles)                   │ │
│ │ ○ Srangam Research (8 articles)                    │ │
│ │ ○ Srangam Research Team (2 articles)               │ │
│ │ ○ Nartiang Foundation Research Team (1 article)    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Theme *                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Ancient India                                   ▼  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Status *                                                │
│ ○ Draft   ● Published                                   │
│                                                         │
│ Tags                                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [vedic] [preservation] [ancient-india] [+]          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Description/Dek (English)                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ An exploration of how Vedic texts were preserved    │ │
│ │ through oral tradition and early manuscripts...     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│               [Cancel]              [Save Changes]      │
└─────────────────────────────────────────────────────────┘
```

### Component Structure

```typescript
interface ArticleEditDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

// Form fields
interface ArticleEditForm {
  title_en: string;
  title_hi: string;  // Optional
  author: string;
  theme: string;
  status: 'draft' | 'published';
  tags: string[];
  dek_en: string;
  featured: boolean;
}
```

---

## Phase 18b: Wire Edit Dialog to ArticleManagement

### Target File: `src/pages/admin/ArticleManagement.tsx`

**Current State (Line 333):**
```typescript
<DropdownMenuItem>Edit Metadata</DropdownMenuItem>
```

**Updated State:**
```typescript
const [editArticle, setEditArticle] = useState<Article | null>(null);

// In dropdown menu:
<DropdownMenuItem onClick={() => setEditArticle(article)}>
  <Edit className="mr-2 h-4 w-4" />
  Edit Metadata
</DropdownMenuItem>

// After the delete dialog:
<ArticleEditDialog
  article={editArticle}
  open={!!editArticle}
  onOpenChange={() => setEditArticle(null)}
  onSave={() => {
    queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    setEditArticle(null);
    toast({ title: "Article updated successfully" });
  }}
/>
```

---

## Phase 18c: Author Autocomplete Hook

### New Hook: `src/hooks/useUniqueAuthors.ts`

```typescript
export function useUniqueAuthors() {
  return useQuery({
    queryKey: ['unique-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('author');
      
      if (error) throw error;
      
      // Count occurrences and get unique
      const authorCounts = data.reduce((acc, { author }) => {
        acc[author] = (acc[author] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(authorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Usage in ArticleEditDialog:**
```typescript
const { data: authors } = useUniqueAuthors();

// Render as combobox with article counts
{authors?.map(({ name, count }) => (
  <ComboboxItem key={name} value={name}>
    {name} ({count} articles)
  </ComboboxItem>
))}
```

---

## Phase 18d: Bulk Author Normalization

### Problem
4 author variants need consolidation:
- "NF Research Team" (30) → Keep as canonical
- "Srangam Research" (8) → Decide if same entity
- "Srangam Research Team" (2) → Likely same as above
- "Nartiang Foundation Research Team" (1) → Same as NF

### Solution: Add "Bulk Update Author" Action

**New Component: `src/components/admin/BulkAuthorUpdate.tsx`**

```
┌─────────────────────────────────────────────────┐
│ Normalize Author Names                          │
├─────────────────────────────────────────────────┤
│ Select source authors to merge:                 │
│                                                 │
│ ☑ Nartiang Foundation Research Team (1)        │
│ ☑ Srangam Research Team (2)                    │
│ ☐ Srangam Research (8)                         │
│ ☐ NF Research Team (30)                        │
│                                                 │
│ Merge into:                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Srangam Research Team                   ▼  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Preview Changes] [Apply Merge]                 │
└─────────────────────────────────────────────────┘
```

### Database Update Query
```sql
UPDATE srangam_articles
SET author = 'Srangam Research Team', updated_at = NOW()
WHERE author IN ('Nartiang Foundation Research Team', 'NF Research Team');
```

---

## Phase 18e: Admin Settings Page (Optional Enhancement)

### New Page: `src/pages/admin/Settings.tsx`

Platform-wide defaults:
- Default author for new imports
- Default theme for new articles
- Enable/disable narration feature
- AI model preferences

### Add to Admin Navigation

**File: `src/components/admin/AdminLayout.tsx`**

```typescript
{
  title: "Settings",
  url: "/admin/settings",
  icon: Settings,
}
```

---

## Implementation Order

| Phase | Task | Priority | Effort |
|-------|------|----------|--------|
| 18.0 | Update docs/CURRENT_STATUS.md | HIGH | 10 min |
| 18.0 | Update docs/ADMIN_DASHBOARD.md | HIGH | 10 min |
| 18a | Create ArticleEditDialog component | HIGH | 45 min |
| 18b | Wire dialog to ArticleManagement | HIGH | 15 min |
| 18c | Create useUniqueAuthors hook | MEDIUM | 15 min |
| 18d | Create BulkAuthorUpdate component | MEDIUM | 30 min |
| 18e | Create Settings page (optional) | LOW | 30 min |

---

## Files to Create/Modify

### Create

| File | Purpose |
|------|---------|
| `src/components/admin/ArticleEditDialog.tsx` | Article metadata editor |
| `src/hooks/useUniqueAuthors.ts` | Author autocomplete data |
| `src/components/admin/BulkAuthorUpdate.tsx` | Author normalization UI |
| `src/pages/admin/Settings.tsx` | Admin settings (optional) |

### Modify

| File | Change |
|------|--------|
| `src/pages/admin/ArticleManagement.tsx` | Wire edit dialog, add state |
| `src/components/admin/AdminLayout.tsx` | Add Settings nav (optional) |
| `docs/CURRENT_STATUS.md` | Phase 18 documentation |
| `docs/ADMIN_DASHBOARD.md` | Editor capabilities |

---

## Database Considerations

### No Schema Changes Required

The existing `srangam_articles` table has all needed columns:
- `title` (JSONB) - Multilingual
- `author` (TEXT) - Required
- `theme` (TEXT) - Required
- `status` (TEXT) - Required
- `tags` (TEXT[]) - Optional
- `dek` (JSONB) - Optional

### RLS Already Configured

```sql
-- Existing policy
Policy Name: Only admins can update articles
Command: UPDATE
Using: has_role(auth.uid(), 'admin')
```

No new RLS policies needed.

---

## Future: Author Registry (Phase 19)

If structured author data becomes needed:

### New Table: `srangam_authors`

```sql
CREATE TABLE srangam_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT,
  bio JSONB,  -- { en: "...", hi: "..." }
  affiliation TEXT,
  orcid TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to articles
ALTER TABLE srangam_articles 
ADD COLUMN author_id UUID REFERENCES srangam_authors(id);
```

### Migration Path
1. Create authors from unique `author` values
2. Populate `author_id` based on text matching
3. Eventually remove `author` text column (breaking change)

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Can edit article title | No | Yes |
| Can edit author | No | Yes |
| Can change theme | No | Yes |
| Can toggle status | No | Yes |
| Can edit tags | No | Yes |
| Author autocomplete | N/A | Yes (with counts) |
| Bulk author normalization | N/A | Yes |
| Author variants | 4 | 1-2 (normalized) |

---

## UI/UX Guidelines

### ArticleEditDialog Design
- Use Sheet component (slides from right)
- Form validation with react-hook-form + zod
- Optimistic updates with query invalidation
- Toast confirmation on save
- Loading state during save

### Author Combobox Design
- Show article counts next to each author
- Allow typing custom author name
- Keyboard navigable
- "Create new author" option at bottom

---

## Risk Mitigation

1. **Sheet component is non-blocking** - Article list remains usable
2. **Form validation before save** - Prevent empty required fields
3. **Query invalidation** - UI updates immediately after save
4. **No schema changes** - Uses existing database structure
5. **RLS already configured** - Only admins can update

---

## Technical Details

### ArticleEditDialog Save Handler

```typescript
const handleSave = async () => {
  setIsSaving(true);
  try {
    const { error } = await supabase
      .from('srangam_articles')
      .update({
        title: { 
          ...article.title, 
          en: formData.title_en,
          ...(formData.title_hi && { hi: formData.title_hi })
        },
        author: formData.author,
        theme: formData.theme,
        status: formData.status,
        tags: formData.tags,
        dek: formData.dek_en ? { 
          ...article.dek, 
          en: formData.dek_en 
        } : article.dek,
        featured: formData.featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);

    if (error) throw error;
    onSave();
  } catch (err) {
    toast({ 
      title: "Update failed", 
      description: err.message,
      variant: "destructive" 
    });
  } finally {
    setIsSaving(false);
  }
};
```

### Theme Dropdown Options

```typescript
const THEMES = [
  { value: "Ancient India", label: "Ancient India" },
  { value: "Indian Ocean World", label: "Indian Ocean World" },
  { value: "Scripts & Inscriptions", label: "Scripts & Inscriptions" },
  { value: "Geology & Deep Time", label: "Geology & Deep Time" },
  { value: "Empires & Exchange", label: "Empires & Exchange" },
  { value: "Sacred Ecology", label: "Sacred Ecology" },
];
```
