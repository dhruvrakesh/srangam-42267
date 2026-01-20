# SEO Configuration Guide

**Last Updated**: 2025-01-20

This document outlines the SEO configuration for the Srangam platform.

---

## 🌐 Canonical Domain

**Production URL**: `https://srangam-db.lovable.app`

All SEO configurations, sitemaps, and canonical URLs should reference this domain.

---

## 📄 Key Files

### 1. `public/robots.txt`
Controls search engine crawling behavior.

```
User-agent: *
Allow: /

Sitemap: https://srangam-db.lovable.app/sitemap.xml
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

**Base URL**: `https://srangam-db.lovable.app`

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
4. Enter: `https://srangam-db.lovable.app`

### Step 2: Verify Ownership
**Recommended: HTML Meta Tag Method**

Add this to `index.html` `<head>`:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

### Step 3: Submit Sitemap
1. In Search Console, go to "Sitemaps"
2. Enter: `sitemap.xml`
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

## 🖼️ Open Graph Image

**Recommended Dimensions**: 1200 x 630 pixels (1.91:1 ratio)
**Location**: `/public/brand/og-image.png`

**Current Configuration:**
```html
<meta property="og:image" content="https://srangam-db.lovable.app/brand/srangam_mark_simple.svg" />
```

**For optimal social sharing, create a dedicated OG image with:**
- Srangam logo/branding
- Tagline: "Histories of the Indian Ocean World"
- Visual elements representing archaeology/history

---

## 📱 Twitter Card

**Card Type**: `summary_large_image`

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://srangam-db.lovable.app/brand/srangam_mark_simple.svg" />
```

---

## 🗺️ Sitemap Structure

The sitemap is dynamically generated and includes:

| Route Type | Priority | Change Frequency |
|------------|----------|------------------|
| Homepage `/` | 1.0 | daily |
| Articles `/articles` | 0.9 | daily |
| Individual articles | 0.9 | monthly |
| Theme pages | 0.8 | weekly |
| About, Sources | 0.7-0.8 | monthly |
| Utility pages | 0.5-0.6 | monthly |

**Access:** 
- XML: `https://srangam-db.lovable.app/sitemap.xml`
- HTML: `https://srangam-db.lovable.app/sitemap`

---

## ✅ SEO Checklist

- [x] `robots.txt` with sitemap directive
- [x] Canonical URL in `index.html`
- [x] Open Graph meta tags
- [x] Twitter Card meta tags
- [x] Dynamic sitemap generation
- [x] Semantic HTML structure
- [x] Proper heading hierarchy (H1 → H6)
- [x] Alt text on images
- [ ] Google Search Console verification
- [ ] Branded OG image (1200x630)
- [ ] Schema.org structured data

---

## 🔄 Maintenance

### Monthly Tasks
1. Check Search Console for crawl errors
2. Review indexed pages count
3. Monitor Core Web Vitals

### After Content Updates
1. Sitemap auto-updates with new articles
2. Request indexing for important new pages
3. Verify meta tags on new pages

---

## 📊 Expected Timeline

After proper setup:
- **Week 1-2**: Google discovers and crawls site
- **Week 2-4**: Initial pages indexed
- **Month 1-2**: Most content indexed
- **Month 2-3**: Rankings stabilize

*Note: Actual timeline depends on content quality, backlinks, and domain authority.*
