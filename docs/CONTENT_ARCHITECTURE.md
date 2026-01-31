# Srangam Content Architecture

**Last Updated**: 2025-01-31 (Phase 17)

---

## Overview

This document describes the content lifecycle, data sources, and management workflows for the Srangam research platform.

---

## Data Sources

### 1. Database Articles (Primary)

**Table**: `srangam_articles`
**Count**: 41 total (32 published, 9 drafts)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `slug` | TEXT | URL path (unique) |
| `slug_alias` | TEXT | SEO-friendly alternative |
| `title` | JSONB | `{ en: "...", hi: "..." }` |
| `content` | JSONB | `{ en: "...", hi: "..." }` |
| `theme` | TEXT | One of 6 standard themes |
| `status` | TEXT | `draft` or `published` |
| `tags` | TEXT[] | AI-generated tags |
| `og_image_url` | TEXT | Dynamic OG image URL |

### 2. JSON Static Articles (Legacy)

**File**: `src/data/articles/index.ts`
**Count**: 28 articles in `ARTICLE_METADATA`

These are legacy articles with hardcoded metadata. They are:
- Served from static files (faster initial load)
- Not editable via admin dashboard
- Use legacy theme names (e.g., `sacred-geography`)

**Theme Normalization Required:**
| Legacy Theme | Normalized Theme |
|--------------|------------------|
| `sacred-geography` | Ancient India |
| `acoustic-archaeology` | Ancient India |
| `Indian Ocean World` | Indian Ocean World |
| `Empires & Exchange` | Empires & Exchange |

### 3. Unified Article System

**Hook**: `src/hooks/useArticles.ts`
**Utility**: `src/lib/unifiedArticleUtils.ts`

The unified system merges both sources:

```typescript
// Priority: Database > JSON
function mergeArticleSources(dbArticles, jsonArticles) {
  const merged = new Map();
  
  // Add JSON articles first
  jsonArticles.forEach(a => merged.set(a.slug, a));
  
  // Database articles override JSON
  dbArticles.forEach(a => merged.set(a.slug, a));
  
  return Array.from(merged.values());
}
```

---

## Document Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   AUTHOR    │────▶│    DRAFT    │────▶│  PUBLISHED  │
│  (Markdown) │     │  (Review)   │     │   (Live)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  ┌─────────┐        ┌─────────┐        ┌─────────┐
  │ Import  │        │ Preview │        │ Public  │
  │   UI    │        │  Only   │        │ Access  │
  └─────────┘        └─────────┘        └─────────┘
```

### Stage 1: Authoring

**Input**: Markdown file with YAML frontmatter

```markdown
---
title: Article Title
theme: Ancient India
tags: []
status: draft
---

# Content here...
```

**Process**: Upload via `/admin/import`

### Stage 2: Draft Review

**Visibility**: Admin only (RLS protected)
**Capabilities**:
- Preview content rendering
- Edit metadata (tags, theme)
- Generate OG image
- Generate narration

### Stage 3: Publishing

**Action**: Set `status = 'published'`
**Result**:
- Article visible on public pages
- Included in sitemap
- Indexed by search engines
- Cross-references activated

---

## Translation Workflow

### Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English | Primary |
| `hi` | Hindi | Active |
| `pa` | Punjabi | Planned |
| `ta` | Tamil | Planned |

### Content Structure

```json
{
  "title": {
    "en": "The Ringing Rocks of Kupgal",
    "hi": "कुपगल की गूंजती चट्टानें"
  },
  "content": {
    "en": "<p>English content...</p>",
    "hi": "<p>हिंदी सामग्री...</p>"
  }
}
```

### Translation Queue

**Table**: `srangam_translation_queue`

| Column | Purpose |
|--------|---------|
| `article_id` | Target article |
| `target_language` | Language code |
| `status` | `pending`, `in_progress`, `completed` |
| `assigned_translator` | Translator name |
| `due_date` | Deadline |

---

## OG Image Generation

### Pipeline

```
Article Created
      │
      ▼
┌─────────────┐
│ og_image_url│ = NULL
│  (Draft)    │
└─────────────┘
      │
      ▼ Admin triggers generation
┌─────────────────────────────┐
│ generate-article-og         │
│ (Edge Function)             │
│                             │
│ 1. Extract title & theme    │
│ 2. Generate prompt          │
│ 3. Call DALL-E 3            │
│ 4. Upload to GDrive         │
│ 5. Update og_image_url      │
└─────────────────────────────┘
      │
      ▼
┌─────────────┐
│ og_image_url│ = "https://..."
│ (Complete)  │
└─────────────┘
```

### Cost

- DALL-E 3: $0.04 per image
- Storage: Free (Google Drive)
- Total for 41 articles: ~$1.64

---

## Narration Caching

### Architecture

```
User Requests Narration
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Cache     │────▶│ srangam_audio_  │
│ (content_hash)  │     │ narrations      │
└─────────────────┘     └─────────────────┘
         │                      │
         │ Cache Miss           │ Cache Hit
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│ TTS Edge Func   │     │ Return GDrive   │
│ (ElevenLabs/    │     │ URL             │
│  Google/OpenAI) │     └─────────────────┘
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Upload to       │
│ Google Drive    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Cache Entry     │
│ Created         │
└─────────────────┘
```

### Provider Priority

1. **ElevenLabs** (English) - Best quality
2. **OpenAI TTS** (Fallback) - When ElevenLabs blocked
3. **Google Cloud** (Indic) - Hindi, Tamil, Punjabi

---

## Cross-Reference System

### Reference Types

| Type | Detection | Strength |
|------|-----------|----------|
| `explicit_citation` | `(see: article-slug)` | 10 |
| `same_theme` | Matching theme field | 7 |
| `thematic` | Shared tags ≥ 2 | `tag_count × 2` |

### Table: `srangam_cross_references`

| Column | Purpose |
|--------|---------|
| `source_article_id` | From article |
| `target_article_id` | To article |
| `reference_type` | Type of connection |
| `strength` | 1-10 relevance score |
| `bidirectional` | Two-way link |

---

## Cultural Terms

### Extraction Pipeline

1. **Pattern Detection**: Sanskrit diacritics, Devanagari, italics
2. **AI Enrichment**: Gemini adds etymology, context
3. **Module Classification**: vedic, maritime, geology, etc.
4. **Usage Tracking**: Auto-increment on article display

### Table: `srangam_cultural_terms`

| Column | Purpose |
|--------|---------|
| `term` | Normalized lookup key |
| `display_term` | Original form |
| `translations` | JSONB multilingual |
| `etymology` | AI-generated origin |
| `module` | Classification |
| `usage_count` | Popularity metric |

---

## Related Documentation

- `docs/CURRENT_STATUS.md` - Platform status
- `docs/ADMIN_DASHBOARD.md` - Admin capabilities
- `docs/ARTICLE_DISPLAY_GUIDE.md` - Markdown authoring
