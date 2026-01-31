
# Phase 17: Article Theme Data Accuracy + Enterprise Admin Dashboard

## Context Snapshot (Documentation-First)

### Current Database State (Verified)

**Theme Distribution (from actual DB query):**
| Theme | Published | Draft | Total |
|-------|-----------|-------|-------|
| Ancient India | 28 | 0 | 28 |
| Geology & Deep Time | 1 | 2 | 3 |
| Scripts & Inscriptions | 2 | 1 | 3 |
| Sacred Ecology | 1 | 1 | 2 |
| Indian Ocean World | 0 | 3 | 3 |
| Empires & Exchange | 0 | 2 | 2 |
| **Total** | **32 published** | **9 drafts** | **41** |

**JSON Static Articles (28 total in `ARTICLE_METADATA`):**
- Use legacy theme names: `sacred-geography`, `acoustic-archaeology`
- These map to "Ancient India" but are counted separately

### Root Cause of Theme Count Discrepancy

1. **Homepage theme cards** use `getThemeArticleCount()` from `useResearchStats` hook
2. This hook queries ONLY `srangam_articles` database (ignores JSON articles)
3. Indian Ocean World shows "0" because all 3 articles are in **draft** status
4. Empires & Exchange shows "0" because all 2 articles are in **draft** status
5. The display is technically **accurate** for published content, but misleading for overall platform content

### Existing Admin Dashboard Capabilities
- Located at `/admin` → `src/pages/admin/Dashboard.tsx`
- Shows: Total Articles (41), Tags (68), Cross-References (688), Cultural Terms (1,238)
- Recent Imports table with slug, theme, word count, date
- Basic Tag Growth chart (appears to use mock/static data)
- Missing: Theme distribution, content health indicators, bulk actions

---

## Phase 17.0: Documentation Update (Context Preservation)

### Files to Update

**1. `docs/CURRENT_STATUS.md`**
Add Phase 17 section documenting:
- Theme count accuracy issue and resolution
- JSON vs Database article source architecture
- Admin dashboard enhancement roadmap
- Content health metrics definitions

**2. Create `docs/ADMIN_DASHBOARD.md`**
Document:
- Current admin routes and capabilities
- Theme normalization rules
- Content health indicators
- Bulk action workflows

**3. Create `docs/CONTENT_ARCHITECTURE.md`**
Absorb patterns from uploaded CONTENT_MANAGEMENT.md:
- Document lifecycle (draft → published)
- Translation workflow (EN → HI/PA/TA)
- OG image generation pipeline
- Narration caching architecture

---

## Phase 17a: Fix Theme Article Counts

### Problem Analysis

The theme cards on Begin Journey page show:
- Ancient India: 28 ✓ (correct)
- Indian Ocean World: 0 ✗ (3 drafts exist)
- Scripts & Inscriptions: 2 ✓ (correct)
- Geology & Deep Time: 1 ✓ (correct)
- Empires & Exchange: 0 ✗ (2 drafts exist)

### Decision Point: What Should Counts Represent?

**Option A: Published Only (Current Behavior)**
- Accurate for public-facing content
- Discouraging for themes with 0 published

**Option B: All Articles (Draft + Published)**
- Shows platform content richness
- May mislead visitors about available content

**Option C: Published + "(X drafts)" indicator**
- Best of both worlds
- Requires UI enhancement

**Recommended: Option C** - Show published count with draft indicator

### Implementation

**File: `src/hooks/useResearchStats.ts`**

Add draft counts to ThemeStats interface:
```typescript
export interface ThemeStats {
  theme: string;
  count: number;        // published
  draftCount: number;   // drafts
}
```

Update query to include draft articles:
```typescript
// Articles grouped by theme (all statuses)
supabase
  .from('srangam_articles')
  .select('theme, status')
```

**File: `src/components/research/ResearchThemes.tsx`**

Update card display to show draft indicator:
```
Indian Ocean World
0 articles (+3 drafts)
```

### Theme Normalization

**File: `src/data/researchThemes.ts`**

Current mapping is correct but not used consistently:
```typescript
export const themeIdToDbNames: Record<string, string[]> = {
  "ancient-india": ["Ancient India", "ancient-india", "sacred-geography", "acoustic-archaeology"],
  "indian-ocean": ["Indian Ocean World", "indian-ocean-world", "indian-ocean"],
  // ...
};
```

Ensure all theme counting uses this normalization map.

---

## Phase 17b: Enterprise Admin Dashboard Enhancement

### Current State Analysis

**Existing Components:**
- `src/pages/admin/Dashboard.tsx` - Main dashboard
- `src/pages/admin/Articles.tsx` - Basic article list
- `src/pages/admin/ArticleManagement.tsx` - Full CRUD interface
- `src/pages/admin/DataHealth.tsx` - Data integrity monitoring

**Missing Enterprise Features:**
1. Theme distribution visualization
2. Content health indicators (missing OG, no narration, no translations)
3. Bulk status actions (publish all drafts)
4. Draft workflow management
5. Translation queue visibility

### Target Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SRANGAM ADMIN DASHBOARD                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │Published │ │ Drafts   │ │Missing OG│ │No Audio  │            │
│ │    32    │ │    9     │ │    27    │ │   35     │            │
│ │ ✓ Ready  │ │⚠ Review  │ │⚠ Generate│ │⚠ TTS     │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                 │
│ ┌─────────────────────────┐ ┌─────────────────────────────────┐│
│ │ Theme Distribution      │ │ Content Health                  ││
│ │ [Pie Chart]             │ │ ▓▓▓▓▓▓▓▓░░ OG Images: 34%      ││
│ │ Ancient India: 28       │ │ ▓▓▓▓▓░░░░░ Narrations: 15%     ││
│ │ Geology: 3              │ │ ▓▓▓▓▓▓▓░░░ Hindi Trans: 60%    ││
│ │ Scripts: 3              │ │ ▓▓░░░░░░░░ Bibliography: 20%   ││
│ │ Sacred Ecology: 2       │ │                                 ││
│ │ Indian Ocean: 3 (draft) │ │ [View Data Health →]            ││
│ │ Empires: 2 (draft)      │ │                                 ││
│ └─────────────────────────┘ └─────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Quick Actions                                                ││
│ │ [Publish All Drafts] [Generate OG Images] [Retag Articles]  ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Recent Articles                                              ││
│ │ ┌────┬─────────────────────────┬──────────────┬───────────┐ ││
│ │ │ St │ Title                   │ Theme        │ Updated   │ ││
│ │ ├────┼─────────────────────────┼──────────────┼───────────┤ ││
│ │ │ ✓  │ Vedic Preservation...   │ Ancient India│ 2 days ago│ ││
│ │ │ ⚠  │ Maritime Networks...    │ Indian Ocean │ 5 days ago│ ││
│ │ │ ⚠  │ Chola Trade Routes...   │ Empires      │ 1 week ago│ ││
│ │ └────┴─────────────────────────┴──────────────┴───────────┘ ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### New Components to Create

**1. `src/components/admin/ContentStatusCards.tsx`**
Four metric cards showing:
- Published count (green)
- Draft count (amber)
- Missing OG images count (amber)
- Missing narration count (amber)

**2. `src/components/admin/ThemeDistributionChart.tsx`**
Pie or bar chart using Recharts (already installed):
- Show all 6 themes
- Color-code by theme colors from `researchThemes.ts`
- Distinguish published vs draft

**3. `src/components/admin/ContentHealthProgress.tsx`**
Progress bars showing:
- OG image coverage %
- Narration coverage %
- Hindi translation coverage %
- Bibliography extraction %

**4. `src/components/admin/QuickActionsPanel.tsx`**
Bulk action buttons:
- Publish All Drafts (with confirmation modal)
- Generate Missing OG Images (link to Data Health)
- Retag Untagged Articles

### Database Queries Needed

```sql
-- Content health metrics
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE og_image_url IS NOT NULL) as has_og,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE status = 'draft') as drafts
FROM srangam_articles;

-- Narration coverage
SELECT COUNT(DISTINCT article_slug) as narrated
FROM srangam_audio_narrations;

-- Bibliography coverage
SELECT COUNT(DISTINCT article_id) as has_bib
FROM srangam_article_bibliography;
```

---

## Phase 17c: Admin Article List Enhancement

### Current State
`src/pages/admin/Articles.tsx` shows basic table with:
- Slug, Theme, Status, Tags, Date

### Enhancements

**1. Status Filter Tabs**
```
[All (41)] [Published (32)] [Drafts (9)]
```

**2. Theme Filter Dropdown**
Select to filter by theme

**3. Bulk Selection**
Checkboxes for selecting multiple articles

**4. Bulk Actions**
- Publish Selected
- Change Theme
- Delete Selected (with confirmation)

**5. Inline Status Toggle**
Click to toggle draft/published

---

## Phase 17d: Draft Publishing Workflow

### Current Gap
Drafts exist but no streamlined way to:
1. Preview draft content
2. Review and approve
3. Bulk publish

### Implementation

**File: `src/pages/admin/DraftReview.tsx`** (New)
- List all draft articles
- Preview content inline
- "Publish" button per article
- "Publish All" with confirmation

**Database Update Query:**
```sql
UPDATE srangam_articles 
SET status = 'published', updated_at = now()
WHERE id = ANY($1::uuid[]);
```

---

## Implementation Order

| Phase | Task | Priority | Effort |
|-------|------|----------|--------|
| 17.0 | Update docs/CURRENT_STATUS.md | HIGH | 10 min |
| 17.0 | Create docs/ADMIN_DASHBOARD.md | MEDIUM | 15 min |
| 17a.1 | Add draft counts to useResearchStats | HIGH | 15 min |
| 17a.2 | Update ResearchThemes to show drafts | HIGH | 10 min |
| 17b.1 | Create ContentStatusCards component | MEDIUM | 20 min |
| 17b.2 | Create ThemeDistributionChart | MEDIUM | 25 min |
| 17b.3 | Create ContentHealthProgress | MEDIUM | 15 min |
| 17b.4 | Integrate into Dashboard.tsx | MEDIUM | 15 min |
| 17c | Enhance Articles list with filters | LOW | 30 min |
| 17d | Create DraftReview page | LOW | 45 min |

---

## Files to Modify/Create

**Modify:**
| File | Change |
|------|--------|
| `docs/CURRENT_STATUS.md` | Add Phase 17 documentation |
| `src/hooks/useResearchStats.ts` | Add draft counts to theme stats |
| `src/components/research/ResearchThemes.tsx` | Show draft indicator |
| `src/pages/admin/Dashboard.tsx` | Add new dashboard sections |
| `src/pages/admin/Articles.tsx` | Add filters and bulk actions |

**Create:**
| File | Purpose |
|------|---------|
| `docs/ADMIN_DASHBOARD.md` | Admin capabilities documentation |
| `src/components/admin/ContentStatusCards.tsx` | Status overview cards |
| `src/components/admin/ThemeDistributionChart.tsx` | Theme pie chart |
| `src/components/admin/ContentHealthProgress.tsx` | Health progress bars |
| `src/components/admin/QuickActionsPanel.tsx` | Bulk action buttons |

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Indian Ocean World shown | 0 | "0 (+3 drafts)" |
| Empires & Exchange shown | 0 | "0 (+2 drafts)" |
| Theme visibility in admin | None | Full chart |
| Draft management | Manual DB | UI workflow |
| Content health visibility | Partial (Data Health) | Dashboard overview |
| Bulk publish capability | None | Yes |

---

## Risk Mitigation

1. **Theme count changes are display-only** - No database modifications
2. **Draft indicator is additive** - Published counts unchanged
3. **Dashboard components are modular** - Can be added incrementally
4. **All queries use existing RLS policies** - No security changes needed
5. **Recharts already installed** - No new dependencies

---

## Security Considerations

All admin features already require authentication via existing routes.
RLS policies on `srangam_articles` require `admin` role for INSERT/UPDATE/DELETE.
Read operations are public for published articles only.
Draft articles visible only to authenticated users in admin context.
