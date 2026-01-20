# Dynamic OG Image System

**Created**: 2025-01-20

---

## Overview

Srangam generates article-specific Open Graph images using OpenAI's DALL-E 3 API. This provides unique, on-brand social preview images for each article, improving click-through rates from social sharing.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Health Dashboard                    │
│                     (/admin/data-health)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ Trigger Generation
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               generate-article-og Edge Function              │
│  - Receives articleId, title, theme, slug                   │
│  - Generates DALL-E 3 prompt with theme-specific colors     │
│  - Requests 1792x1024 image (landscape, closest to 1.91:1)  │
│  - Uploads to og-images bucket                               │
│  - Updates srangam_articles.og_image_url                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ Store Image
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Storage (og-images)                 │
│  - Public bucket for CDN delivery                           │
│  - Path: articles/{slug}.png                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ Serve via URL
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    ArticleHead.tsx                           │
│  - Reads og_image_url from article record                   │
│  - Falls back to /brand/og-image.svg if missing             │
│  - Sets og:image and twitter:image meta tags                │
└─────────────────────────────────────────────────────────────┘
```

## Theme-to-Color Mapping

| Theme | Primary Color | Accent Color |
|-------|---------------|--------------|
| Ancient India | Saffron orange | Deep burgundy |
| Indian Ocean World | Ocean teal | Coral gold |
| Scripts & Inscriptions | Stone gray | Copper brown |
| Geology & Deep Time | Laterite red | Earth brown |
| Empires & Exchange | Royal purple | Gold metallic |

## Cost Analysis

| Provider | Model | Size | Cost per Image |
|----------|-------|------|----------------|
| OpenAI | DALL-E 3 (standard) | 1792×1024 | **$0.04** |
| OpenAI | DALL-E 3 (HD) | 1792×1024 | $0.08 |
| Lovable AI | gemini-flash-image | 1024×1024 | ~$0.05-0.10 |

**Decision**: Use OpenAI DALL-E 3 (standard) for ~50% cost savings over Lovable AI.

**Total Cost Projection**:
- 32 published articles × $0.04 = **$1.28** initial generation
- New articles: $0.04 each (on-demand or bulk generation)

## Database Schema

### Column Added to `srangam_articles`

```sql
ALTER TABLE srangam_articles 
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

COMMENT ON COLUMN srangam_articles.og_image_url IS 
  'AI-generated Open Graph image URL for social sharing';
```

### Storage Bucket

```sql
-- Create og-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('og-images', 'og-images', true, 5242880) -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "Public OG image read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'og-images');

-- Service role write policy  
CREATE POLICY "Service role OG image write"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'og-images');
```

## Prompt Engineering Guidelines

The DALL-E 3 prompt is structured for academic, dharmic aesthetics:

1. **Clear Title Display**: Article title must be readable in large serif font
2. **Theme Colors**: Use theme-specific color palette (see mapping above)
3. **Sacred Geometry**: Subtle mandala, yantra, or architectural motifs as background
4. **No Photography**: Avoid photographs or human faces for consistency
5. **Academic Tone**: Professional, dignified appearance suitable for LinkedIn/Twitter
6. **Aspect Ratio**: 1792×1024 (closest to OG standard 1.91:1)

## Usage

### Manual Generation (Single Article)

```typescript
const { data, error } = await supabase.functions.invoke('generate-article-og', {
  body: {
    articleId: 'uuid-here',
    title: 'Article Title',
    theme: 'Ancient India',
    slug: 'article-slug'
  }
});
```

### Bulk Generation (All Articles)

Use the "Generate OG Images" button in Data Health Dashboard:
- Fetches all published articles without `og_image_url`
- Generates images sequentially (to manage rate limits)
- Displays progress and cost estimate

## Fallback Strategy

```typescript
// In ArticleHead.tsx
const ogImageUrl = article.og_image_url 
  || `${BASE_URL}/brand/og-image.svg`;  // Default fallback
```

## Validation

Test generated images with:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Files Reference

| File | Purpose |
|------|---------|
| `supabase/functions/generate-article-og/index.ts` | Edge function for image generation |
| `src/components/i18n/ArticleHead.tsx` | Consumes og_image_url in meta tags |
| `src/pages/admin/DataHealth.tsx` | Bulk generation UI |
| `docs/OG_IMAGE_SYSTEM.md` | This documentation |
