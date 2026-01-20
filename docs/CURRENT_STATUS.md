# Srangam Platform - Current Status

**Last Updated**: 2025-01-20 (Phase 14: TTS Provider Fallback + OG Image Display)

---

## ✅ **Completed Features**

### **1. Markdown Import Pipeline**
- ✅ YAML frontmatter parsing with special character handling
- ✅ Markdown to HTML conversion (marked.js)
- ✅ Word count & read time calculation
- ✅ **Word count persistence** to database for ScholarlyArticle schema (Phase 12)
- ✅ Duplicate slug detection with "Overwrite if exists" option
- ✅ Markdown source preservation in separate table
- ✅ Slug standardization (110 → 38 chars avg, 65% reduction)
- ✅ Slug alias system for SEO-friendly URLs
- ✅ Multilingual content support (EN, HI, PA merged into single article)
- ✅ Unicode-safe content hashing (SHA-256 for non-Latin scripts)
- ✅ Escaped markdown character sanitization (\#, \*, \-)
- ✅ Auto slug_alias generation for all new imports
- ✅ **Evidence extraction** - 79 entries backfilled from markdown tables (Phase 12)

### **2. AI-Powered Tag Generation**
- ✅ OpenAI GPT-4o-mini integration (migrated Nov 2025)
- ✅ Auto-generates 5-8 contextually relevant tags when frontmatter is empty
- ✅ Fuzzy matching against existing tag taxonomy
- ✅ Tag normalization (prevents duplicates like "Mauryan Empire" vs "Mauryans")
- ✅ Self-improving tag registry with usage tracking

### **3. Cultural Terms Extraction**
- ✅ **1,628+ AI-enhanced terms** in database (updated Jan 2025)
- ✅ 217+ Sanskrit/diacritics pattern detection
- ✅ Devanagari script recognition (U+0900-U+097F)
- ✅ Italic text pattern matching (non-greedy across newlines)
- ✅ Validation filtering (URLs, markdown syntax, numbers)
- ✅ Auto-increment usage_count for existing terms
- ✅ Etymology and context enriched via Gemini AI
- ✅ Module categorization (vedic, maritime, geology, etc.)
- ✅ Frontend connected to live database (`/sources/sanskrit-terminology`)
- ✅ Auto-highlighting in articles via `culturalTermEnhancer.ts`

### **4. Cross-Reference Detection & Integration**
- ✅ **Thematic** references (shared tags ≥ 2, strength: tag_count × 2)
- ✅ **Same theme** references (matching theme field, strength: 7)
- ✅ **Explicit citation** detection (pattern: `(see: article-slug)`, strength: 10)
- ✅ Bidirectional linking for thematic/theme references
- ✅ Context descriptions with detection method and reasoning
- ✅ **Frontend integration complete** - Cross-references visible on all article pages
- ✅ 700+ total connections (same_theme + thematic)
- ✅ `useArticleId` hook for slug-to-ID resolution
- ✅ `ArticleCrossReferences` component with grouped display
- ✅ **Cross References Browser** at `/research-network` with force-directed graph
- ✅ Bug fix: "Unknown → Unknown" display resolved (2025-12-27)

### **5. Tag Taxonomy System**
- ✅ `srangam_tags` table with usage tracking
- ✅ Automatic usage_count increment via database trigger
- ✅ Related tags field for co-occurrence analysis
- ✅ Tag categorization (Period, Concept, Location, Methodology, Subject)

### **6. Typography & Design System**
- ✅ Academic-standard typography implemented
- ✅ Tailwind CSS semantic tokens (HSL colors)
- ✅ **Dark/light/system mode support** (added Jan 2025)
- ✅ **Dark mode rationalization** - proper contrast for all chips/badges (Jan 2025)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Custom color palette (ocean, vedic, maritime, geology)
- ✅ Multilingual fonts (Noto Sans Devanagari, Gurmukhi, Tamil)

### **7. Navigation System**
- ✅ Primary navigation via `HeaderNav.tsx` (active)
- ✅ Mobile bottom tabs for quick access (Home, Themes, Map, Search)
- ✅ Keyboard shortcuts: `/` (search), `m` (maps), `gs` (sources)
- ✅ Visual separator between logo and nav items with hover effect
- ✅ Smooth scroll-to-top on logo click
- ✅ **Global scroll restoration** - all navigation scrolls to top (added Jan 2025)
- ✅ **Theme toggle** in header navigation (added Jan 2025)
- ✅ Language switcher integration
- ⚠️ `TopNavigation.tsx` deprecated (kept for reference)

### **8. SEO & Discoverability** (updated Jan 2025)
- ✅ Canonical URL: `https://srangam-db.lovable.app`
- ✅ Sitemap generation with correct base URL
- ✅ `robots.txt` with sitemap directive
- ✅ Open Graph meta tags (branded image, description)
- ✅ Twitter Card meta tags
- ✅ Google Search Console ready (verification placeholder)
- ✅ **Schema.org Structured Data** (Phase 11-12)
  - ✅ `Organization` schema in `SiteSchema.tsx`
  - ✅ `WebSite` schema with `SearchAction` for sitelinks search box
  - ✅ `ScholarlyArticle` schema in `ArticleHead.tsx` and `OceanicArticlePage.tsx`
  - ✅ `BreadcrumbList` schema in `BreadcrumbSchema.tsx`
  - ✅ `WebApplication` schema on tool pages
  - ✅ **wordCount field** populated for all 41 articles (Phase 12)
  - ✅ **citation field** wired from `useArticleBibliographyBySlug` hook (Phase 12)
- ✅ **Dynamic OG Images** (Phase 12)
  - ✅ AI-generated article-specific OG images (OpenAI DALL-E 3)
  - ✅ `generate-article-og` edge function
  - ✅ `og-images` storage bucket for caching
  - ✅ `og_image_url` column in `srangam_articles`
  - ⏳ Generate OG images for 32 published articles via Data Health Dashboard
### **9. Research Tool Showcase Pages**
- ✅ **Sanskrit Translator** landing page (`/sanskrit-translator`)
- ✅ **Jyotish Horoscope** landing page (`/jyotish-horoscope`)
- ✅ **Navigation Integration**: "Tools" menu in primary navigation

### **10. Landing Page Redesign** (2025-12-23)
- ✅ **Begin Journey Page** (`/begin-journey`)
- ✅ **About Page Restructure** (`/about`)
- ✅ **New Hooks & Components**: `useResearchStats`, `useIntersectionObserver`, `useCountUp`, `ResearchMetrics`, `ResearchThemes`

---

## 📊 **Database State** (Current)

### **Current Data** (as of 2025-01-20)
- **Articles**: 41 total (32 published, 9 drafts)
  - All in Supabase database with standardized slugs
  - All have AI-generated tags (5-8 per article)
  - All have theme categorization
  - **Multilingual**: Multiple articles with EN + HI content
  
- **Cross-references**: 700+
  - Same-theme and thematic references
  - All integrated on article pages
  - Visible in Research Network visualization
  
- **Cultural terms**: 1,628+
  - All terms have etymology and context (AI-enriched)
  - Module distribution: vedic, maritime, geology, other
  - Pagination implemented (bypasses 1000-row limit)

- **Bibliography entries**: 25 (+2 new, 63 article links)
  - **Backfill completed** (Jan 2025) - 30 articles processed
  - 63 article-bibliography links created
  - Data Health Dashboard available at `/admin/data-health`

- **Tags**: 127 unique tags
  - Average 6.2 tags per article
  - Categories: Historical Period, Concept, Location, Methodology

---

## 🔧 **Recent Fixes & Deployments**

### **2025-01-20 (Phase 14: TTS Provider Fallback + OG Image Display)**

1. ✅ **ElevenLabs Free Tier Blocked - Auto-Fallback System**:
   - Problem: ElevenLabs returning 401 "Unusual activity detected. Free Tier usage disabled"
   - Solution: Implemented intelligent provider fallback in `NarrationService.ts`
   - On 401/403 errors, automatically retries with Google Cloud Neural2 (en-US-Neural2-D)
   - User experience: seamless narration without visible error

2. ✅ **VoiceStrategyEngine Fallback Methods**:
   - Added `getFallbackVoice(language, contentType)` method
   - Returns Google Cloud Neural2 for English, retains Google WaveNet for Indic languages
   - Added `needsFallbackCapability(config)` to detect ElevenLabs provider

3. ✅ **Article Hero Image Display**:
   - OG images now visually displayed on article pages (not just in meta tags)
   - Constrained height (h-48 md:h-64 lg:h-72) to not overwhelm content
   - Graceful degradation: hidden if image fails to load (CORS issues)
   - Subtle AI-generated caption for scholarly integrity

4. ✅ **ElevenLabs Edge Function Error Handling**:
   - Structured 401/403 error response with `auth_blocked` flag
   - Returns `fallback_provider: 'google-cloud'` for client-side handling
   - Improved console logging for diagnostics

5. ✅ **Evidence Deduplication**:
   - Added unique constraint on `srangam_article_evidence(article_id, date_approx, place, event_description)`
   - Backfill function now uses upsert with onConflict for idempotency

### **2025-01-20 (Phase 13: Audio Narration System Overhaul)**

1. ✅ **Critical JWT Signing Bug Fix**:
   - Fixed `tts-save-drive/index.ts` line 59 - was using string concatenation instead of `crypto.subtle.sign()`
   - Proper RS256 JWT now created for Google OAuth2 (same method as working `tts-stream-google`)
   - Audio caching to Google Drive now functional

2. ✅ **ElevenLabs TTS Integration**:
   - Created `tts-stream-elevenlabs` edge function with streaming NDJSON output
   - Uses `eleven_turbo_v2_5` model for low latency, high quality
   - Request stitching enabled for multi-chunk content
   - Voice mapping: George (scholarly), Brian (dramatic), Matilda (reverent), Daniel (short-form)
   - Free tier: 10,000 characters/month

3. ✅ **Voice Strategy Engine Update**:
   - ElevenLabs now default provider for English content
   - Google Neural2/WaveNet retained for Indic languages (hi, ta, pa, bn, kn)
   - Profile-based voice selection (Sanskrit content → George, dramatic → Brian)

4. ✅ **NarrationService Provider Routing**:
   - Added ElevenLabs endpoint routing (`/functions/v1/tts-stream-elevenlabs`)
   - Updated cost estimation to include ElevenLabs pricing
   - Debug logging added for stream diagnostics

### **2025-01-20 (Phase 12: Evidence Extraction Fix + Dynamic OG Images)**

1. ✅ **Evidence Table Extraction Fix**:
   - Enhanced `hasScholarlyHeaders` regex in `backfill-bibliography/index.ts`
   - Added multilingual support: Punjabi (ਤਾਰੀਖ, ਥਾਂ), Tamil (தேதி, இடம்), Hindi (तिथि, स्थान)
   - Added debug logging for markdown→HTML table conversion verification
   - Generic pattern fallback for 6+ column tables with source quality indicators

2. ✅ **Dynamic OG Image Generation**:
   - Created `generate-article-og` edge function using OpenAI DALL-E 3 ($0.04/image)
   - Added `og_image_url` column to `srangam_articles` table
   - Updated `ArticleHead.tsx` to use dynamic OG images with fallback
   - Added bulk generation UI to Data Health Dashboard
   - ⚠️ **MIGRATION PENDING**: Edge function updated to upload to GDrive, but existing 32 images still in Supabase Storage

3. ✅ **Cost Optimization**:
   - Decision: Use existing `OPENAI_API_KEY` instead of Lovable AI (50% cost savings)
   - Total cost for 32 articles: ~$1.28
   - Storage cost: Will be $0 after GDrive migration (currently ~$0.0005/month in Supabase)

### **Storage Architecture (Target State)**

| Asset Type | Current Location | Target Location | Migration Status |
|------------|------------------|-----------------|------------------|
| Audio narrations | Google Drive | Google Drive | ✅ Complete |
| OG images (32) | Supabase Storage | Google Drive | ⏳ Pending - run regeneration |
| Context snapshots | Google Drive | Google Drive | ✅ Complete |
| User uploads | Supabase Storage | Supabase Storage | ✅ Correct (stays here) |

**Migration Path for OG Images**:
1. Clear `og_image_url` for all 32 published articles
2. Regenerate via Data Health Dashboard (uses updated edge function)
3. New images upload directly to GDrive via `generate-article-og`
4. Total cost: ~$1.28 (DALL-E 3)

### **2025-01-20 (Phase 9: Dark Mode Rationalization + Bibliography Backfill)**

1. ✅ **Dark Mode Visibility Fixes**:
   - Added dark mode overrides for `--sand`, `--ocean`, `--saffron` in `index.css`
   - Updated `TagChip.tsx` with explicit `dark:bg-card dark:text-card-foreground` classes
   - Fixed `ArticleThemeChips.tsx` selected/unselected states for dark mode contrast
   - Updated `ArticleCard.tsx` tag chips with dark mode styles
   - All filter pills and tags now readable in dark mode

2. ✅ **Bibliography Backfill Completed**:
   - Ran `/backfill-bibliography` edge function (dry run OFF)
   - Processed: 30 articles
   - Created: 2 new bibliography entries, 63 article-bibliography links
   - Total bibliography entries: 25

### **2025-01-20 (Phase 8: Navigation UX, Dark Mode, SEO)**

1. ✅ **Global Scroll Restoration**:
   - Created `ScrollToTop.tsx` component
   - Added to `App.tsx` inside `BrowserRouter`
   - All navigation now scrolls to top of target page

2. ✅ **Dark/Light/System Mode**:
   - Added `ThemeProvider` from `next-themes` to `App.tsx`
   - Created `theme-toggle.tsx` component with Sun/Moon/Monitor icons
   - Added theme toggle to `HeaderNav.tsx` next to language switcher
   - Dark mode CSS variables already configured in `index.css`

3. ✅ **SEO Critical Fixes**:
   - Updated `robots.txt` with sitemap directive for `srangam-db.lovable.app`
   - Fixed `index.html` OG image, canonical URL, Twitter card
   - Updated sitemap edge function with correct base URL
   - Added `slug_alias` preference in sitemap URLs
   - Added missing routes (`/begin-journey`, `/research-network`)

4. ✅ **Import UI Improvements**:
   - Added success state with "View Article" button after import
   - Form now clears after successful import
   - Progress indicators for all import steps

### **2025-01-18 (Phase 5: Robust English Table Rendering Fix)**
- ✅ Robust table data extraction in `ProfessionalTextFormatter.tsx`
- ✅ Hindi pattern support in `EvidenceTable.tsx`
- ✅ Cultural term enhancement protection for tables

### **2025-12-27 (Security Fixes & Cross References Browser)**
- ✅ Cross References Browser bug fix ("Unknown → Unknown")
- ✅ 8 missing articles imported across all themes
- ✅ Security function hardening (search_path fixes)

### **2026-01-20 (Phase 10: Dark Mode Audit & WCAG Compliance)**
- ✅ Comprehensive audit of 52+ UI components for dark mode contrast
- ✅ Fixed critical components: GeomythologySection, CrossReferencePanel, OceanicIndex, InteractiveAtlas
- ✅ Replaced hardcoded Tailwind grays with semantic tokens (`text-muted-foreground`, `bg-card`)
- ✅ Updated PuranaCategoryBadge to use dharmic color palette
- ✅ Added dark mode CSS overrides for `--sand`, `--ocean`, `--saffron`, `--cream`
- ✅ Created `src/lib/darkModeUtils.ts` utility library for consistent color mappings
- ✅ Created `docs/DARK_MODE_AUDIT.md` documenting all findings and exempt components
- ✅ Bibliography backfill executed: 25 entries, 63 article-bibliography links

### **2026-01-20 (Phase 12b: Dashboard Resilience & Accuracy)**
- ✅ **OG Image Generation Retry Logic**: Added 3-attempt exponential backoff (2s, 4s, 6s) for DALL-E 500 errors
- ✅ **Data Health Dashboard Accuracy**: Now queries actual database counts vs regex pattern detection
- ✅ **Resume Capability**: OG generation automatically resumes from where it left off
- ✅ **Visual Improvements**: Green badges show extracted counts, amber icons show detected-but-not-extracted
- ✅ **ScholarlyArticle Schema Citations**: Wired `useArticleBibliographyBySlug` to populate `citation` field

---

## 🎯 **Next Steps**

### **Short Term**
1. Google Search Console setup (manual)
   - Add property: `https://srangam-db.lovable.app`
   - Verify ownership via HTML meta tag
   - Submit sitemap URL
   - Request indexing for key pages

2. Create branded OG image (1200x630px)
   - Design and upload to `/public/brand/og-image.png`
   - Update `index.html` reference

### **Medium Term** 
1. Enhanced Cross-Reference UX
   - Add strength badges (strong/medium/weak)
   - Implement hover previews with article metadata

2. Bibliography & Sources Integration (Phase 7)
   - Connect `srangam_bibliography_entries` to article sidebar
   - Populate `srangam_article_evidence` table

### **Long Term**
1. Audio narration UI implementation
2. GitHub repository links for research tools
3. Full multilingual support (PA, TA)

---

## 📁 **Key Files Reference**

### **Configuration**
- `public/robots.txt` - SEO robots with sitemap
- `index.html` - Meta tags, OG images, fonts
- `src/index.css` - Design system tokens, dark mode CSS
- `tailwind.config.ts` - Theme configuration

### **Core Components**
- `src/App.tsx` - Router, providers, theme
- `src/components/ScrollToTop.tsx` - Navigation scroll restoration
- `src/components/ui/theme-toggle.tsx` - Dark/light/system toggle
- `src/components/navigation/HeaderNav.tsx` - Primary navigation
- `src/components/layout/Layout.tsx` - Page wrapper

### **Edge Functions**
- `supabase/functions/generate-sitemap/index.ts` - Dynamic sitemap
- `supabase/functions/markdown-to-article-import/index.ts` - Article import
- `supabase/functions/tts-stream-google/index.ts` - Google Cloud TTS (Indic languages)
- `supabase/functions/tts-stream-elevenlabs/index.ts` - ElevenLabs TTS (English, Phase 13)
- `supabase/functions/tts-save-drive/index.ts` - Audio caching to Google Drive
- `supabase/functions/generate-article-og/index.ts` - DALL-E OG image generation

### **Documentation**
- `docs/CURRENT_STATUS.md` - This file
- `docs/SEO_CONFIGURATION.md` - SEO setup guide
- `docs/ARTICLE_DISPLAY_GUIDE.md` - Markdown authoring standards
