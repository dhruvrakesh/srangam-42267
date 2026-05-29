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

## Gazetteer Governance (Phase G3, 2026-05-29)

`public.srangam_gazetteer` is the single source of truth for atlas pins. Both the deterministic name-variant scan and the AI NER pass in `backfill-article-pins` match article text against `[canonical_name, ...name_variants]`. If a place isn't in the gazetteer, no pin can be generated for it — that is the **only** reason a published article can show 0 pins after a successful backfill.

**Schema invariants:**

- `canonical_name` is **UNIQUE** (constraint `srangam_gazetteer_canonical_name_key`, added Phase G3). All ingest paths must use `ON CONFLICT (canonical_name) DO NOTHING` — never duplicate a row.
- `name_variants TEXT[]` should carry the IAST diacritic form, an ASCII fallback, the Devanagari (or appropriate script) form when unambiguous, and 1–2 historic exonyms.
- `feature_type` is a controlled vocabulary: `port`, `harbour`, `city`, `capital`, `pitha`, `jyotirlinga`, `temple_complex`, `inscription_site`, `archaeological_site`, `cave_shelter`, `mountain`, `monolith_site`. Do not introduce ad-hoc values without updating this list.
- `era_tags TEXT[]` vocabulary: `prehistoric`, `vedic`, `puranic`, `maurya`, `gupta`, `medieval`, `mughal`, `colonial`.
- `precision` is `'point'` for atlas-level entries (±0.05° is acceptable).
- `external_refs` is `jsonb` keyed by source (e.g. `{ "wikidata": "Q…" }`).

**Deletion guard:** Never `DELETE` a gazetteer row referenced by `srangam_article_pins` — it would orphan pin rows and corrupt the public map. To retire a place, soft-mark it via `notes` and leave the row in place. To rename, `UPDATE` the row; do not delete-and-reinsert.

**Coverage baseline (2026-05-29):** 112 rows. Phase G3 expanded the original 32-row maritime-only set with ~80 inland places (Śakti Pīṭhas, Jyotirliṅgas, Mahājanapada capitals, Kashmir sacred geography, Indus/BMAC archaeology, Janajāti petroglyph shelters, SE-Asian temple complexes, and Bunjils Shelter). Future growth happens additively through the same INSERT … ON CONFLICT pattern.

---

## Related Documentation

- `docs/CURRENT_STATUS.md` - Platform status
- `docs/ADMIN_DASHBOARD.md` - Admin capabilities
- `docs/ARTICLE_DISPLAY_GUIDE.md` - Markdown authoring
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` - Context snapshots & bundles

