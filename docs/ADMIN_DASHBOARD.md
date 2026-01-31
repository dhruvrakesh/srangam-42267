# Srangam Admin Dashboard

**Last Updated**: 2025-01-31 (Phase 17)

---

## Overview

The Srangam Admin Dashboard provides enterprise-grade content management capabilities for the research platform. Access is restricted to authenticated users with the `admin` role.

---

## Admin Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | `Dashboard.tsx` | Overview metrics, theme distribution, content health |
| `/admin/articles` | `Articles.tsx` | Article list with filters and bulk actions |
| `/admin/article-management` | `ArticleManagement.tsx` | Full CRUD for articles |
| `/admin/data-health` | `DataHealth.tsx` | Data integrity monitoring, OG generation |
| `/admin/import` | `MarkdownImport.tsx` | Markdown article import pipeline |
| `/admin/tags` | `TagManagement.tsx` | Tag taxonomy management |

---

## Dashboard Sections

### 1. Content Status Cards

Four metric cards providing at-a-glance content state:

| Card | Metric | Color | Action |
|------|--------|-------|--------|
| Published | Articles with `status = 'published'` | Green | View articles list |
| Drafts | Articles with `status = 'draft'` | Amber | Review for publishing |
| Missing OG | Articles without `og_image_url` | Amber | Generate via Data Health |
| No Audio | Articles without cached narration | Amber | Generate via TTS |

### 2. Theme Distribution Chart

Pie chart visualization showing article distribution across 6 research themes:

- **Ancient India** (saffron)
- **Indian Ocean World** (peacock blue)
- **Scripts & Inscriptions** (indigo)
- **Geology & Deep Time** (terracotta)
- **Empires & Exchange** (turmeric)
- **Sacred Ecology** (lotus pink)

Draft articles shown with lighter shades to distinguish from published.

### 3. Content Health Progress

Progress bars showing completion percentages:

| Metric | Calculation | Target |
|--------|-------------|--------|
| OG Images | `articles_with_og / total_articles × 100` | 100% |
| Narrations | `unique_narrated / total_articles × 100` | 100% |
| Bibliography | `articles_with_bib / total_articles × 100` | 100% |
| Hindi Translation | `articles_with_hindi / total_articles × 100` | 80% |

### 4. Quick Actions Panel

Bulk action buttons for common workflows:

| Action | Function | Confirmation |
|--------|----------|--------------|
| Publish All Drafts | Sets `status = 'published'` for all drafts | Yes (modal) |
| Generate OG Images | Links to Data Health OG generator | No |
| Retag Articles | Triggers AI tag regeneration | Yes |

### 5. Recent Articles Table

Last 10 articles sorted by `updated_at`:

| Column | Data | Notes |
|--------|------|-------|
| Status | 🟢 Published / 🟡 Draft | Visual indicator |
| Title | `title.en` | Links to article |
| Theme | Theme name | Color-coded badge |
| Tags | First 3 tags + count | Expandable |
| Updated | Relative time | "2 days ago" |

---

## Theme Normalization

Database themes must map to the 6 standard theme IDs for accurate counting:

```typescript
export const themeIdToDbNames: Record<string, string[]> = {
  "ancient-india": [
    "Ancient India", 
    "ancient-india", 
    "sacred-geography",      // Legacy
    "acoustic-archaeology"   // Legacy
  ],
  "indian-ocean": [
    "Indian Ocean World", 
    "indian-ocean-world", 
    "indian-ocean"
  ],
  "scripts-inscriptions": [
    "Scripts & Inscriptions", 
    "scripts-inscriptions", 
    "scripts-and-inscriptions"
  ],
  "geology-deep-time": [
    "Geology & Deep Time", 
    "geology-deep-time", 
    "geology"
  ],
  "empires-exchange": [
    "Empires & Exchange", 
    "empires-exchange", 
    "empires-and-exchange"
  ],
  "sacred-ecology": [
    "Sacred Ecology", 
    "sacred-ecology"
  ]
};
```

---

## Content Health Indicators

### OG Image Status

- **Has OG**: `og_image_url IS NOT NULL`
- **Missing OG**: `og_image_url IS NULL`
- **Generation**: Via `generate-article-og` edge function ($0.04/image)

### Narration Status

- **Has Audio**: Entry exists in `srangam_audio_narrations` for article slug
- **Missing Audio**: No cached narration
- **Cost**: ElevenLabs free tier (10K chars/month), Google Cloud fallback

### Bibliography Status

- **Linked**: Entry exists in `srangam_article_bibliography` 
- **Unlinked**: No bibliography associations
- **Backfill**: Via `backfill-bibliography` edge function

---

## Database Queries

### Content Status Metrics

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE status = 'draft') as drafts,
  COUNT(*) FILTER (WHERE og_image_url IS NOT NULL) as has_og
FROM srangam_articles;
```

### Theme Distribution

```sql
SELECT theme, status, COUNT(*) as count 
FROM srangam_articles 
GROUP BY theme, status 
ORDER BY count DESC;
```

### Narration Coverage

```sql
SELECT COUNT(DISTINCT article_slug) as narrated
FROM srangam_audio_narrations;
```

### Bibliography Coverage

```sql
SELECT COUNT(DISTINCT article_id) as has_bib
FROM srangam_article_bibliography;
```

---

## Security

All admin routes protected by:

1. **Route Guard**: `AuthContext` checks for authenticated user
2. **RLS Policies**: Database operations require `admin` role
3. **Edge Functions**: Service role key for privileged operations

```sql
-- Example RLS policy
CREATE POLICY "Only admins can update articles" 
ON srangam_articles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));
```

---

## Related Documentation

- `docs/CURRENT_STATUS.md` - Platform status and recent changes
- `docs/CONTENT_ARCHITECTURE.md` - Document lifecycle
- `docs/DATA_HEALTH_DASHBOARD.md` - Data integrity monitoring
