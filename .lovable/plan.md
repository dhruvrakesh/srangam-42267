

# SEO Repair: Diagnostic Report and Surgical Fix Plan

**Last Audited**: 2026-02-12
**Scope**: Fix broken SEO without expanding codebase or changing business logic

---

## Part 1: Confirmed Issues (Evidence-Based)

### CRITICAL-1: OG Image is SVG -- Social Previews Completely Broken

**Files affected**: `index.html` (lines 44, 47, 54), `src/components/seo/SiteSchema.tsx` (line 27), `src/components/i18n/ArticleHead.tsx` (line 64), `src/components/oceanic/OceanicArticlePage.tsx` (lines 84, 107)

**Evidence**: `public/brand/og-image.svg` is an SVG file. Twitter, Facebook, LinkedIn, iMessage, WhatsApp, Slack, and Discord **do not render SVG** for link previews. Every share of this site shows a blank or broken preview image.

**Fix**: Create `public/brand/og-image.png` (a 1200x630 PNG rendering of the existing SVG design). Update all 6 file references from `.svg` to `.png`.

---

### CRITICAL-2: Canonical URL Fragmentation -- 4 Different Domains

**Evidence from codebase search**:

| File | Canonical Domain Used |
|------|-----------------------|
| `index.html` | `srangam-db.lovable.app` (correct) |
| `ArticleHead.tsx` | `srangam-db.lovable.app` (correct) |
| `OceanicArticlePage.tsx` | `srangam-db.lovable.app` (correct) |
| `SiteSchema.tsx` | `srangam-db.lovable.app` (correct) |
| `Articles.tsx` (line 103) | `srangam.lovable.app` (WRONG) |
| `JyotishHoroscope.tsx` (lines 44, 50) | `srangam.lovable.app` (WRONG) |
| `SanskritTranslator.tsx` (lines 45, 51) | `srangam.lovable.app` (WRONG) |
| `ReasessingRigvedaAntiquity.tsx` (line 33) | `srangam.com` (WRONG) |
| `AsuraExilesIndoIranian.tsx` (line 41) | `srangam.in` (WRONG) |
| `RishiGenealogiesVedicTradition.tsx` (line 39) | `srangam.in` (WRONG) |
| `generate-article-seo/index.ts` (line 146) | `srangam.lovable.app` (WRONG) |

Google treats these as **separate properties**. Pages pointing to non-existent domains (`srangam.com`, `srangam.in`) are telling Google to index a domain that does not serve this app.

**Fix**: Replace all incorrect canonical domains with `https://srangam-db.lovable.app` in 7 files.

---

### CRITICAL-3: Sitemap URL in robots.txt Points to SPA Route

**Evidence**: `robots.txt` line 16 declares `Sitemap: https://srangam-db.lovable.app/sitemap.xml`. But `/sitemap.xml` is a React component (`SitemapXML.tsx`) that renders HTML wrapping the XML in a `<pre>` tag. Crawlers receive `<!DOCTYPE html>` not `<?xml version="1.0"?>`.

The actual valid XML is served by the edge function at `/functions/v1/generate-sitemap`.

**Fix**: Update `robots.txt` to point to the edge function URL.

---

### MODERATE-4: Home Page Has Zero SEO Tags

**Evidence**: `src/pages/Home.tsx` imports no `Helmet` component. No `<title>`, `<meta description>`, or OG tags are set for the homepage. It relies entirely on static `index.html` defaults, which is adequate for the root URL but means no dynamic metadata.

**Fix**: Add `Helmet` with homepage-specific title, description, and OG tags.

---

### MODERATE-5: Google Search Console Not Verified

**Evidence**: `index.html` line 14 -- verification meta tag is commented out with placeholder text `YOUR_VERIFICATION_CODE`.

**Fix**: Uncomment and prompt user for their verification code. (Requires user action.)

---

### MODERATE-6: Font Loading Blocks Rendering

**Evidence**: `index.html` lines 23-37 load **12 font families** across 7 separate `<link>` requests. All are render-blocking. Lines 28-34 (Indian language fonts) and line 37 (ancient script fonts) are rarely needed on first paint.

**Fix**: Add `&display=swap` to all font URLs. Move ancient script fonts (Brahmi, Grantha, Kawi, Cham) to lazy loading via `media="print" onload="this.media='all'"` pattern.

---

### LOW-7: generate-article-seo Uses Wrong Domain and Requires OpenAI Key

**Evidence**: `supabase/functions/generate-article-seo/index.ts` line 146 uses `srangam.lovable.app` (wrong domain). Line 93 requires `OPENAI_API_KEY` which may not be configured, causing the `useDynamicSEO` hook to always fall back to static content.

**Fix**: Update domain to `srangam-db.lovable.app`. Migrate from OpenAI to Lovable AI Gateway (no API key needed).

---

## Part 2: Implementation Plan

### Phase A: Documentation Update (1 file, zero risk)

Update `docs/SEO_CONFIGURATION.md` to reflect the actual current state, document all issues found, and record the canonical domain policy as an invariant.

Update `docs/IMPLEMENTATION_STATUS.md` to add SEO repair as a tracked task.

---

### Phase B: Critical Canonical and OG Fixes (8 files, zero functional risk)

These are pure string replacements with no logic changes.

| File | Change |
|------|--------|
| `index.html` (lines 44, 47, 54) | `og-image.svg` to `og-image.png`, image type to `image/png` |
| `src/pages/Articles.tsx` (line 103) | `srangam.lovable.app` to `srangam-db.lovable.app` |
| `src/pages/JyotishHoroscope.tsx` (lines 44, 50) | `srangam.lovable.app` to `srangam-db.lovable.app` |
| `src/pages/SanskritTranslator.tsx` (lines 45, 51) | `srangam.lovable.app` to `srangam-db.lovable.app` |
| `src/pages/articles/ReasessingRigvedaAntiquity.tsx` (line 33) | `srangam.com` to `srangam-db.lovable.app` |
| `src/pages/articles/AsuraExilesIndoIranian.tsx` (line 41) | `srangam.in` to `srangam-db.lovable.app` |
| `src/pages/articles/RishiGenealogiesVedicTradition.tsx` (line 39) | `srangam.in` to `srangam-db.lovable.app` |
| `public/robots.txt` (line 16) | Update sitemap URL to edge function endpoint |

---

### Phase C: OG Image PNG Creation (1 file)

Create `public/brand/og-image.png` -- a 1200x630 PNG rendering of the existing SVG design using the same brand colors (Ocean Teal #2A9D8F, Epigraphy Maroon #7B2D26, Cream #F8F5F0).

Since we cannot run image conversion tools, we will create a simple branded PNG using an SVG-to-canvas approach within an edge function, or provide a static fallback PNG with text-based branding.

---

### Phase D: Home Page SEO + Font Performance (2 files)

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Add `Helmet` import and homepage-specific meta tags |
| `index.html` (lines 28-37) | Add `&display=swap` to Indian language fonts; lazy-load ancient script fonts |

---

### Phase E: Edge Function Domain Fix (1 file)

| File | Change |
|------|--------|
| `supabase/functions/generate-article-seo/index.ts` (line 146) | `srangam.lovable.app` to `srangam-db.lovable.app` |

Optionally migrate from OpenAI API to Lovable AI Gateway to remove the API key dependency.

---

## Part 3: Execution Order

| Step | Phase | Files | Risk |
|------|-------|-------|------|
| 1 | A: Documentation | 2 docs | None |
| 2 | B: Canonical + OG refs | 8 files (string replacements only) | None |
| 3 | C: PNG creation | 1 asset | None |
| 4 | D: Home SEO + fonts | 2 files | Low |
| 5 | E: Edge function fix | 1 edge function | Low |

**Total files touched**: 14
**Lines of logic changed**: 0 (all are config/string fixes)
**New components created**: 0
**Risk to existing functionality**: Zero

---

## Part 4: What This Plan Does NOT Do

- Does not add SSR or pre-rendering (not available on this platform)
- Does not expand the codebase with new features
- Does not change routing, auth, or business logic
- Does not touch database schema or RLS policies
- Does not create new edge functions

---

## Part 5: User Actions Required

1. **Google Search Console**: Register at search.google.com/search-console, get verification code, provide it so we can uncomment the meta tag
2. **Submit sitemap**: After fixes, manually submit the edge function sitemap URL in Search Console
3. **Request indexing**: Use URL Inspection tool for priority pages (/, /articles, /about)

---

## Part 6: Success Criteria

After all phases:
- Sharing any Srangam URL on Twitter/LinkedIn/Slack shows a branded preview image
- All canonical URLs point to `srangam-db.lovable.app`
- `robots.txt` sitemap URL returns valid XML (not HTML)
- Home page has proper meta description and OG tags
- Fonts load with `display=swap` (no render blocking)
- Core Web Vitals improve (LCP reduction from fewer blocking requests)

