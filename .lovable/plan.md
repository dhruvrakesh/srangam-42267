# Srangam Enterprise Implementation - Phase 1 Complete

**Status**: READY FOR IMPLEMENTATION  
**Last Updated**: 2025-02-01

---

## Implementation Summary

This plan implements the approved Enterprise Reliability & Scalability Roadmap.

---

## Changes to Implement

### 1. Documentation Updates

**Create:** `docs/IMPLEMENTATION_STATUS.md`
- Master tracking document for all Phase 1-3 tasks
- Status tracking for each completed and pending item
- Success metrics and changelog

**Update:** `docs/RELIABILITY_AUDIT.md`
- Add resolved 404 routing issues section
- Update phase number to 20

### 2. Fix 404 Broken Links (Phase 1.6)

**File:** `src/App.tsx`

Add redirect components for `/field-notes/:slug` and `/maps/:slug`:

```typescript
// Add import at top
import { Navigate, useParams } from "react-router-dom";

// Create redirect components (after imports, before App component)
function FieldNotesRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}

function MapsRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}

// Add routes (around line 161, after /field-notes route)
<Route path="/field-notes/:slug" element={<FieldNotesRedirect />} />
<Route path="/maps/:slug" element={<MapsRedirect />} />
```

**File:** `src/data/ocean_networks/tabs.json`

Update draft slugs to use `/articles/` prefix:
- `/field-notes/bujang-industrial-sites` → `/articles/bujang-industrial-sites`
- `/maps/bujang-valley` → `/articles/bujang-valley`
- `/maps/nagapattinam-ocean` → `/articles/nagapattinam-ocean`
- `/maps/monsoon-windows` → `/articles/monsoon-windows`

### 3. Migrate OG Image Generation to Gemini (Phase 1.8)

**File:** `supabase/functions/generate-article-og/index.ts`

Replace DALL-E 3 with Gemini (`google/gemini-2.5-flash-image`):

1. Remove OpenAI API call
2. Add Lovable AI Gateway call with `modalities: ["image", "text"]`
3. Update prompt to use article dek/abstract for context
4. Maintain Google Drive upload workflow

**Key Changes:**
```typescript
// Replace OpenAI with Lovable AI Gateway
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image",
    messages: [{ role: "user", content: prompt }],
    modalities: ["image", "text"]
  })
});
```

### 4. Updated Prompt Strategy for OG Images

Instead of generic theme-based prompts, use article abstract/dek:

```typescript
const prompt = `Create a professional academic Open Graph image (1792x1024) for:

TITLE: "${title}"
ABSTRACT: "${dek || 'A scholarly article about Indian civilization research'}"
THEME: ${theme}

DESIGN: Clean academic aesthetic with sacred geometry, ${colors.primary} primary color, ${colors.accent} accent. NO photographs, NO human faces. Display title prominently in elegant serif font. Background: warm cream with subtle ${colors.motif} motif.`;
```

---

## Files Summary

### Create
| File | Purpose |
|------|---------|
| `docs/IMPLEMENTATION_STATUS.md` | Master tracking for all phases |

### Modify
| File | Change |
|------|--------|
| `src/App.tsx` | Add redirect routes for `/field-notes/:slug` and `/maps/:slug` |
| `src/data/ocean_networks/tabs.json` | Update draft slugs to use `/articles/` prefix |
| `supabase/functions/generate-article-og/index.ts` | Replace DALL-E 3 with Gemini |
| `docs/RELIABILITY_AUDIT.md` | Add 404 section, update phase number |

---

## Testing Checklist

- [ ] Navigate to `/field-notes/bujang-industrial-sites` → should redirect to `/articles/bujang-industrial-sites`
- [ ] Navigate to `/maps/bujang-valley` → should redirect to `/articles/bujang-valley`
- [ ] Generate OG image via Data Health Dashboard → should use Gemini
- [ ] Verify OG images include article-specific context

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| 404 errors on known routes | 4 | 0 |
| OG image generation cost | $0.04 | ~$0.02 |
| Phase 1 completion | 5/8 | 8/8 |
