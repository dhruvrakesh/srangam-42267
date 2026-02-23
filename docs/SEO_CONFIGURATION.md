# SEO Configuration Guide

**Last Updated**: 2026-02-15
**Last Audit**: 2026-02-15

This document outlines the SEO configuration for the Srangam platform.

---

## ✅ Domain Migration Complete (2026-02-12)

**Production domain**: `https://srangam.nartiang.org`

> All canonical URLs, OG tags, sitemap base URL, and structured data now point to `srangam.nartiang.org`.
> Migration completed 2026-02-12: 18 string replacements across 13 code files + 2 edge functions.
> Canonical gap fix 2026-02-15: Added missing `<link rel="canonical">` to 7 pages + hardcoded atlas domain (was using `window.location.origin`). All pages now have canonical tags.

### Remaining User Actions

1. **Google Search Console**: Register `https://srangam.nartiang.org` as URL prefix property
2. **Share** GSC verification code so AI can add meta tag to `index.html`
3. **Submit sitemap** in GSC: `https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/generate-sitemap`
4. **Request indexing** for `/`, `/articles`, `/about`, `/begin-journey`

---

## 🚨 INVARIANT: Canonical Domain Policy

**Current Production URL**: `https://srangam.nartiang.org`

> **ALL** canonical URLs, OG tags, sitemap references, and structured data MUST use a single domain.
> Do NOT use `srangam.com`, `srangam.in`, `srangam.lovable.app`, or any other domain variant.
> This policy was established after a 2026-02-12 audit found 4 different domains fragmenting SEO authority.

### Domain Fragmentation History (Fixed 2026-02-12)

| Domain Used | Files Affected | Issue |
|-------------|---------------|-------|
| `srangam.com` | `ReasessingRigvedaAntiquity.tsx` | Domain does not serve this app |
| `srangam.in` | `AsuraExilesIndoIranian.tsx`, `RishiGenealogiesVedicTradition.tsx` | Domain does not serve this app |
| `srangam.lovable.app` | `Articles.tsx`, `JyotishHoroscope.tsx`, `SanskritTranslator.tsx`, `generate-article-seo` | Wrong Lovable subdomain |
| `srangam-db.lovable.app` | All other files | ✅ Correct |

---

## 🖼️ Open Graph Image

**Dimensions**: 1200 x 630 pixels (1.91:1 ratio)
**Location**: `/public/brand/og-image.png`
**Format**: PNG (required — social platforms do not render SVG)

> **IMPORTANT**: SVG is NOT supported by Twitter, Facebook, LinkedIn, iMessage, WhatsApp, Slack, or Discord for OG image previews. Always use PNG or JPEG.

**Current Configuration:**
```html
<meta property="og:image" content="https://srangam.nartiang.org/brand/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
```

**Brand Colors Used:**
| Color | Hex | Usage |
|-------|-----|-------|
| Ocean Teal | `#2A9D8F` | Outer circle, borders, geometry |
| Epigraphy Maroon | `#7B2D26` | Wave symbol, SRANGAM text |
| Cream | `#F8F5F0` | Background |
| Charcoal | `#111111` | Tagline text |

---

## 🏗️ Structured Data (Schema.org JSON-LD)

Comprehensive Schema.org implementation for Google rich snippets and knowledge panels.

### Site-Wide Schemas

| Schema Type | Location | Google Feature |
|-------------|----------|----------------|
| `Organization` | `src/components/seo/SiteSchema.tsx` | Knowledge panel, branding |
| `WebSite` + `SearchAction` | `src/components/seo/SiteSchema.tsx` | Sitelinks search box |

**Organization Schema Fields:**
- Name, description, logo, founding date
- Founder (Nartiang Foundation)
- `knowsAbout`: Ancient Indian History, Sanskrit Epigraphy, Maritime Archaeology, etc.
- Geographic area served (Indian Ocean region)

**WebSite Schema Fields:**
- Search action targeting `/search?q={query}`
- Multiple language support (en, hi, pa, ta)

### Article Schemas

| Schema Type | Location | Google Feature |
|-------------|----------|----------------|
| `ScholarlyArticle` | `src/components/i18n/ArticleHead.tsx` | Rich snippets with author, date, citations |
| `BreadcrumbList` | `src/components/seo/BreadcrumbSchema.tsx` | Breadcrumb trail in search results |

### Tool Page Schemas

| Schema Type | Location | Google Feature |
|-------------|----------|----------------|
| `WebApplication` | Tool pages | Software app cards |

**Existing implementations**: 
- `JyotishHoroscope.tsx` - Vedic astronomy tool
- `SanskritTranslator.tsx` - Translation tool
- Interactive Atlas page

### Testing Structured Data

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Structured Data Linter**: https://linter.structured-data.org/

---

## 📄 Key Files

### 1. `public/robots.txt`
Controls search engine crawling behavior. Sitemap points to edge function (not React route).

```
User-agent: *
Allow: /

Sitemap: https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/generate-sitemap
```

### 2. `index.html`
Contains critical meta tags for SEO and social sharing.

**Required Meta Tags:**
- `<title>` - Page title (under 60 characters)
- `<meta name="description">` - Page description (under 160 characters)
- `<link rel="canonical">` - Canonical URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`)
- Twitter Card tags (`twitter:card`, `twitter:image`)

### 3. `supabase/functions/generate-sitemap/index.ts`
Generates dynamic XML sitemap with all published articles.

**Base URL**: `https://srangam.nartiang.org`

**Included Routes:**
- Static pages (/, /about, /articles, etc.)
- Theme pages (/themes/ancient-india, etc.)
- All published database articles (using `slug_alias` preference)

---

## 🔍 Google Search Console Setup

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property"
3. Choose "URL prefix" method
4. Enter: `https://srangam.nartiang.org`

### Step 2: Verify Ownership
**Recommended: HTML Meta Tag Method**

Add verification code to `index.html` `<head>`:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

### Step 3: Submit Sitemap
1. In Search Console, go to "Sitemaps"
2. Enter the edge function URL: `https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/generate-sitemap`
3. Click "Submit"

### Step 4: Request Indexing
1. Use URL Inspection tool
2. Enter key page URLs
3. Click "Request Indexing" for priority pages:
   - `/`
   - `/articles`
   - `/about`
   - `/begin-journey`

---

## 📱 Twitter Card

**Card Type**: `summary_large_image`

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://srangam.nartiang.org/brand/og-image.png" />
```

---

## 🗺️ Sitemap Structure

The sitemap is dynamically generated by the `generate-sitemap` edge function and includes:

| Route Type | Priority | Change Frequency |
|------------|----------|------------------|
| Homepage `/` | 1.0 | daily |
| Articles `/articles` | 0.9 | daily |
| Individual articles | 0.9 | monthly |
| Theme pages | 0.8 | weekly |
| About, Sources | 0.7-0.8 | monthly |
| Utility pages | 0.5-0.6 | monthly |

**Access:**
- XML (for crawlers): Edge function endpoint
- HTML (for humans): `https://srangam.nartiang.org/sitemap`

---

## ⚡ Font Loading Strategy

### Render-Critical Fonts (loaded synchronously with `display=swap`)
- IBM Plex Serif (body text)
- Inter (UI elements)

### Deferred Fonts (lazy-loaded via `media="print"` pattern)
- Indian language fonts (Noto Sans Tamil, Telugu, Kannada, Bengali, etc.)
- Ancient script fonts (Brahmi, Grantha, Kawi, Cham)

This reduces render-blocking requests from 7 to 2, improving LCP and FCP.

---

## ⚠️ SPA Limitations

This is a client-side React SPA. Crawlers initially receive empty HTML (`<div id="root"></div>`). Mitigations:

1. **Static meta tags in `index.html`** — always available to crawlers
2. **`react-helmet-async`** — sets per-page meta tags after JS executes
3. **Edge function sitemap** — provides valid XML directly (no JS required)
4. **Schema.org JSON-LD** — embedded via Helmet for pages that render

Google's JavaScript rendering can take days/weeks. Social crawlers (Twitter, Facebook) do NOT execute JavaScript, so they only see `index.html` meta tags for the root URL. Per-article OG tags require SSR/pre-rendering (not available on this platform).

---

## ✅ SEO Checklist

- [x] `robots.txt` with sitemap directive (edge function URL)
- [x] Canonical URL standardized to `srangam.nartiang.org`
- [x] Open Graph meta tags (PNG format)
- [x] Twitter Card meta tags (PNG format)
- [x] Dynamic sitemap generation (edge function)
- [x] Semantic HTML structure
- [x] Proper heading hierarchy (H1 → H6)
- [x] Alt text on images
- [x] Branded OG image (1200x630 PNG)
- [x] Schema.org structured data
  - [x] Organization schema
  - [x] WebSite schema with SearchAction
  - [x] ScholarlyArticle schema
  - [x] BreadcrumbList schema
  - [x] WebApplication schema (tool pages)
- [x] Font loading optimized (display=swap, lazy loading)
- [x] Home page Helmet meta tags
- [x] Route deduplication (Phase F — Feb 2026)
  - [x] ~27 root-level article routes → `<Navigate replace>` to `/articles/:slug`
  - [x] Duplicate `/oceanic/*` route removed
  - [x] Hardcoded `/articles/somnatha-*` and `/articles/ringing-rocks-*` removed (handled by ArticlesRouter)
  - [x] Theme sub-routes (`/themes/geology-deep-time/stone-purana`, `/themes/ancient-india/pepper-routes`) → redirect
  - [x] Sitemap aligned: missing routes added, root-level article paths removed
- [ ] Google Search Console verification (requires user action)

---

## 🔀 Route Deduplication (Phase F — February 2026)

### Policy

**Every article MUST have exactly one canonical URL at `/articles/:slug`.**

Root-level routes (e.g. `/monsoon-trade-clock`) that previously rendered article components directly are now `<Navigate to="/articles/monsoon-trade-clock" replace />` redirects. This ensures:

1. Old bookmarks and external links still work (client-side redirect)
2. Google follows the redirect and consolidates to the canonical URL
3. Only one URL per article exists in the sitemap

### Routes Redirected (~30)

All legacy root-level article slugs now redirect to `/articles/:slug`:
- `/monsoon-trade-clock` → `/articles/monsoon-trade-clock`
- `/scripts-that-sailed` → `/articles/scripts-that-sailed`
- (and ~26 more — see `App.tsx` for full list)

Also:
- `/themes/geology-deep-time/stone-purana` → `/articles/stone-purana`
- `/themes/ancient-india/pepper-routes` → `/articles/indian-ocean-power-networks`

### Lazy Import Cleanup

The ~27 lazy article page imports were removed from `App.tsx` since redirects use `Navigate` (no component needed). Articles render via `ArticlesRouter` → `OceanicArticlePage`.

### Sitemap Alignment

The `generate-sitemap` edge function was updated to:
- Remove root-level article paths from static routes
- Add missing pages: `/search`, `/sources`, `/sources/trade-docs`, `/oceanic`, `/brand`, `/research-submission`, `/partnership`, `/support-research`
- Articles from the database only appear under `/articles/:slug`

## 🔄 Maintenance

### Monthly Tasks
1. Check Search Console for crawl errors
2. Review indexed pages count
3. Monitor Core Web Vitals
4. Validate structured data with Google's tools

### After Content Updates
1. Sitemap auto-updates with new articles
2. Request indexing for important new pages
3. Verify meta tags on new pages

### SEO Audit Checklist
1. Verify all canonical URLs use `srangam.nartiang.org`
2. Confirm OG image is PNG (not SVG)
3. Test `robots.txt` sitemap URL returns valid XML
4. Run Google Rich Results Test on key pages

---

## 📊 Expected Timeline

After proper setup:
- **Week 1-2**: Google discovers and crawls site
- **Week 2-4**: Initial pages indexed
- **Month 1-2**: Most content indexed
- **Month 2-3**: Rankings stabilize

*Note: Actual timeline depends on content quality, backlinks, and domain authority.*
