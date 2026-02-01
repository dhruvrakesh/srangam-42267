
# Implementation Plan: Phase 20 - Fix 404 Routes, Migrate OG to Gemini, Update Documentation

## Overview

This implementation addresses three critical areas:
1. Fix 404 broken links in `tabs.json` by adding redirect routes
2. Migrate OG image generation from DALL-E 3 to Gemini with contextual prompts
3. Create and update documentation to track Phase 20 implementation

---

## Part 1: Fix 404 Broken Links

### Current Problem
The `src/data/ocean_networks/tabs.json` references 4 routes that don't exist:
- `/maps/bujang-valley` (line 15)
- `/field-notes/bujang-industrial-sites` (line 23)
- `/maps/nagapattinam-ocean` (line 46)
- `/maps/monsoon-windows` (line 77)

### Solution
Add redirect components in `src/App.tsx` that capture `/field-notes/:slug` and `/maps/:slug` and redirect to `/articles/:slug`.

### Files to Modify

**File: `src/App.tsx`**

Add two redirect wrapper components and routes:

```typescript
// After line 104 (after Auth import)
// Redirect components for legacy routes
const FieldNotesRedirect = lazy(() => import("./pages/redirects/FieldNotesRedirect"));
const MapsRedirect = lazy(() => import("./pages/redirects/MapsRedirect"));

// Add routes after line 160 (after /field-notes route)
<Route path="/field-notes/:slug" element={<FieldNotesRedirect />} />
<Route path="/maps/:slug" element={<MapsRedirect />} />
```

**New File: `src/pages/redirects/FieldNotesRedirect.tsx`**

```typescript
import { useParams, Navigate } from 'react-router-dom';

export default function FieldNotesRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}
```

**New File: `src/pages/redirects/MapsRedirect.tsx`**

```typescript
import { useParams, Navigate } from 'react-router-dom';

export default function MapsRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}
```

---

## Part 2: Migrate OG Image Generation to Gemini

### Current State
- Uses OpenAI DALL-E 3 (`dall-e-3` model)
- Generic prompt based only on title and theme
- Cost: $0.04 per image
- No article context (dek/abstract)

### Target State
- Use Gemini (`google/gemini-3-pro-image-preview`) via Lovable AI
- Contextual prompts using article's `dek` (abstract/summary)
- Lower cost, faster generation
- Article-specific imagery based on content

### Implementation

**File: `supabase/functions/generate-article-og/index.ts`**

Replace DALL-E 3 with Gemini image generation:

1. Change API endpoint from OpenAI to Lovable AI (Gemini)
2. Fetch article's `dek` field for contextual prompt generation
3. Build richer prompts using the article abstract
4. Update response handling for Gemini format

```text
Key Changes:

1. Remove OPENAI_API_KEY check, use GEMINI_API_KEY
2. Fetch article dek from database before generating
3. Build enhanced prompt:
   - Include article title
   - Include dek/abstract (first 200 chars)
   - Include theme colors and motifs
   - Request scholarly academic aesthetic
4. Call Gemini image generation API
5. Handle base64 image response
6. Upload to Google Drive (existing logic)
```

### Prompt Template

```text
Generate a professional academic Open Graph image (1792x1024 landscape) for:

ARTICLE: "{title}"
SUMMARY: "{dek_en}"
THEME: {theme}

DESIGN:
- Sacred geometry background ({colors.motif})
- Primary: {colors.primary}, Accent: {colors.accent}
- Clean typography, no photographs
- Scholarly aesthetic suitable for academic sharing
```

---

## Part 3: Documentation Updates

### New File: `docs/IMPLEMENTATION_STATUS.md`

Master tracking document for all phases:

```markdown
# Srangam Implementation Status

## Phase 20 (February 2025)

| Task | Status | PR/Commit |
|------|--------|-----------|
| 1.1 Centralize slug resolution | ✅ COMPLETE | Phase 19 |
| 1.2 Paginate article lists | ✅ COMPLETE | Phase 19 |
| 1.3 Batch cultural term upsert | 🔲 PENDING | - |
| 1.4 Refactor OceanicArticlePage | ✅ COMPLETE | Phase 19 |
| 1.5 Structured error responses | 🔲 PENDING | - |
| 1.6 Fix 404 broken links | ✅ COMPLETE | Phase 20 |
| 1.7 Related Articles formatting | ✅ COMPLETE | Phase 20 |
| 1.8 Migrate OG to Gemini | ✅ COMPLETE | Phase 20 |

## Phase 2 Preview (March 2025)
...
```

### Update: `docs/RELIABILITY_AUDIT.md`

Add new section after line 215 (before Rollback Procedures):

```markdown
---

## 404 Routing Issues (Phase 20)

### Identified Broken Routes

| Route | Source | Resolution |
|-------|--------|------------|
| `/field-notes/:slug` | tabs.json | Redirect to `/articles/:slug` |
| `/maps/:slug` | tabs.json | Redirect to `/articles/:slug` |

### Implementation

Added redirect routes in `src/App.tsx`:
- `FieldNotesRedirect.tsx` - Captures `/field-notes/:slug`
- `MapsRedirect.tsx` - Captures `/maps/:slug`

Both redirect to `/articles/:slug` where content is resolved via the unified article system.

**Status:** ✅ RESOLVED (Phase 20)
```

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `src/pages/redirects/FieldNotesRedirect.tsx` | Redirect `/field-notes/:slug` to `/articles/:slug` |
| CREATE | `src/pages/redirects/MapsRedirect.tsx` | Redirect `/maps/:slug` to `/articles/:slug` |
| CREATE | `docs/IMPLEMENTATION_STATUS.md` | Master implementation tracking |
| MODIFY | `src/App.tsx` | Add redirect route handlers |
| MODIFY | `supabase/functions/generate-article-og/index.ts` | Replace DALL-E with Gemini |
| MODIFY | `docs/RELIABILITY_AUDIT.md` | Add 404 resolution section, update to Phase 20 |

---

## Technical Details

### Gemini Image API Configuration

```typescript
// Using Lovable AI gateway
const LOVABLE_AI_URL = 'https://api.lovable.dev/v1';
const model = 'google/gemini-3-pro-image-preview';

// Request format
{
  model: 'google/gemini-3-pro-image-preview',
  prompt: enhancedPrompt,
  size: '1792x1024',
  response_format: 'b64_json'
}
```

### Route Priority

The redirect routes must be placed AFTER the base `/field-notes` and `/maps-data` routes but BEFORE the wildcard `*` route to ensure proper matching:

```text
/field-notes        → FieldNotes.tsx (list)
/field-notes/:slug  → FieldNotesRedirect → /articles/:slug
/maps-data          → MapsData.tsx
/maps/:slug         → MapsRedirect → /articles/:slug
```

---

## Testing Checklist

- [ ] Navigate to `/field-notes/bujang-industrial-sites` - should redirect to `/articles/bujang-industrial-sites`
- [ ] Navigate to `/maps/bujang-valley` - should redirect to `/articles/bujang-valley`
- [ ] Generate OG image for an article - verify Gemini is used
- [ ] Verify OG image contains contextual elements from article dek
- [ ] Check Google Drive upload still works
- [ ] Verify documentation reflects current state
