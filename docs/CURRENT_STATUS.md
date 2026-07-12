# Srangam Platform - Current Status

**Last Updated**: 2026-07-12 (Enterprise Roadmap Phase 1 — Load-Time Surgery)

---

## 🚀 Latest: Phase 1 Load-Time Surgery (2026-07-12)

- Entry bundle 630 KB gz → 277 KB gz (static article corpus + cultural-terms dataset removed from eager graph; vendor chunks split for cache stability)
- Homepage hero LCP image 2.7 MB PNG → 172 KB WebP with PNG fallback
- Homepage first-load ~3.4 MB → ~0.47 MB (−86%); all 35 unit tests green
- New: `src/data/articles/meta.ts` (generated — run `node scripts/generate-registry-meta.mjs` after editing static registry articles)
- Full audit + Phases 2–5 plan: [ENTERPRISE_AUDIT_AND_ROADMAP_2026-07-12.md](./ENTERPRISE_AUDIT_AND_ROADMAP_2026-07-12.md)

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
- ✅ **1,699 AI-enhanced terms** in database (verified Feb 2026)
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
- ✅ 1,066 total connections (same_theme + thematic) — verified Feb 2026
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
- ✅ Canonical URL: `https://srangam.nartiang.org` (all pages verified Feb 2026)
- ✅ Sitemap generation with correct base URL
- ✅ `robots.txt` with sitemap directive
- ✅ Open Graph meta tags (branded image, description)
- ✅ Twitter Card meta tags
- ✅ Google Search Console ready (verification placeholder)
- ✅ **Canonical tags on all pages** — 8 missing pages fixed Feb 2026 (BeginJourney, Sources, Atlas, etc.)
- ✅ **Atlas page domain hardcoded** — replaced `window.location.origin` with production domain (Feb 2026)
- ✅ **Schema.org Structured Data** (Phase 11-12)
  - ✅ `Organization` schema in `SiteSchema.tsx`
  - ✅ `WebSite` schema with `SearchAction` for sitelinks search box
  - ✅ `ScholarlyArticle` schema in `ArticleHead.tsx` and `OceanicArticlePage.tsx`
  - ✅ `BreadcrumbList` schema in `BreadcrumbSchema.tsx`
  - ✅ `WebApplication` schema on tool pages
  - ✅ **wordCount field** populated for all 49 articles
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

### **Current Data** (verified 2026-02-15 from live database)
- **Articles**: 49 total (40 published, 9 drafts)
  - All in database with standardized slugs
  - All have AI-generated tags (5-8 per article)
  - All have theme categorization
  - **Multilingual**: Multiple articles with EN + HI content
  
- **Cross-references**: 1,066
  - Same-theme and thematic references
  - All integrated on article pages
  - Visible in Research Network visualization
  
- **Cultural terms**: 1,699
  - All terms have etymology and context (AI-enriched)
  - Module distribution: vedic, maritime, geology, other
  - Pagination implemented (bypasses 1000-row limit)

- **Bibliography entries**: 30 (30 article-bibliography links)
  - **Backfill completed** (Jan 2025)
  - Data Health Dashboard available at `/admin/data-health`

- **Tags**: 170 unique tags
  - Average ~6 tags per article
  - Categories: Historical Period, Concept, Location, Methodology

- **Evidence entries**: 79 (stable since Phase 12)

- **Markdown sources**: 38 (11 articles missing markdown)

- **Audio narrations**: 1 (minimal usage — admin-only feature)

- **Book chapters**: 9 chapters, 13 article-chapter links (not previously documented)

- **Context snapshots**: 4 (operational)

### **Scaffolded but Unused Tables** (0 rows each)
These tables are structurally sound but have never been populated:
- `srangam_article_versions` — version control (invariant #7 untested)
- `srangam_article_analytics` — usage tracking
- `srangam_correlation_matrix` — precomputed tag similarity
- `srangam_inscriptions` — epigraphy data
- `srangam_purana_references` — textual references
- `srangam_translation_queue` — translation workflow
- `narration_analytics` — playback analytics

---

## 🔧 **Recent Fixes & Deployments**

### **2025-01-21 (Phase 16: Article Loading Fix + Security Hardening)**

**Status: ✅ DEPLOYED**

1. ✅ **Article Query Timeout** (RELIABILITY):
   - **Problem**: Potential indefinite hang if database query fails silently
   - **Fix**: Added 10-second timeout wrapper using `Promise.race()`
   - **File**: `src/lib/articleResolver.ts`
   - **Result**: Articles either load or show clear error within 10s

2. ✅ **Error State UI** (UX):
   - **Problem**: Only "Loading..." and "Not Found" states, no retry option
   - **Fix**: Added `error` state with specific messages and "Retry" button
   - **File**: `src/components/oceanic/OceanicArticlePage.tsx`
   - **Result**: Users see actionable error messages with retry capability

3. ✅ **Diagnostic Logging** (DEBUG):
   - Added query timing logs: `[articleResolver] Query completed in Xms`
   - Added page load timing: `[OceanicArticlePage] Resolved in Xms`
   - Helps identify slow queries vs network issues

4. ✅ **Security False Positives Marked**:
   - `geography_columns_no_rls`: PostGIS system view, not user data
   - `user_roles_table_public_exposure`: Has proper RLS (3 policies)
   - `spatial_ref_sys_no_rls`: PostGIS system table

5. ⚠️ **Known Security Warnings** (Non-Critical):
   - `SUPA_auth_leaked_password_protection`: Enable in Supabase Auth settings
   - `SUPA_rls_policy_always_true`: Audit overly permissive policies

---

### **2025-01-21 (Phase 15: Server-Side Audio Caching + GDrive Image Proxy)**

**Status: ✅ DEPLOYED**

### Phase 15.2 Hotfixes (2025-01-21)

1. ✅ **Server-Side Audio Caching** (CRITICAL):
   - **Problem**: `srangam_audio_narrations` table empty (0 rows) - client INSERT blocked by RLS
   - **Fix**: TTS edge functions now cache audio to GDrive and write to DB using service role
   - **Files**: `tts-stream-openai/index.ts`, `tts-stream-google/index.ts`, `tts-stream-elevenlabs/index.ts`
   - **Phase 15.1**: Added ElevenLabs caching (primary English provider was missing)
   - **Result**: Audio now cached for repeat plays, ~95% cost reduction

2. ✅ **GDrive Image Proxy** (CRITICAL):
   - **Problem**: OG hero images from GDrive fail with CORS/403 errors
   - **Fix**: Created `gdrive-image-proxy` edge function to fetch images server-side
   - **Files**: `supabase/functions/gdrive-image-proxy/index.ts`, `src/lib/gdriveProxy.ts`
   - **Result**: Hero images now display reliably with 24h caching

3. ✅ **Frontend Proxy Integration**:
   - Updated `ArticleHead.tsx` and `OceanicArticlePage.tsx` to use proxied URLs
   - Helper function `getProxiedImageUrl()` extracts GDrive file IDs

4. ✅ **NarrationService Cleanup**:
   - Removed broken client-side `saveToStorage()` DB writes
   - Now passes `articleSlug` and `contentHash` to edge functions for caching

### **2025-01-21 (Phase 14e: Admin-Only Narration + OpenAI TTS Fix)**

**Status: ✅ DEPLOYED**

1. ✅ **Admin-Only Access Control** (CRITICAL):
   - **Problem**: Any user could trigger expensive TTS generation
   - **Fix**: Added `isAdmin` gate in `UniversalNarrator.tsx` using existing `AuthContext`
   - **Result**: Non-admin users see no narration controls; zero TTS cost for public visitors
   - **File**: `src/components/narration/UniversalNarrator.tsx`

2. ✅ **OpenAI TTS as Primary Fallback** (CRITICAL):
   - **Problem**: Google TTS failing with "5000 bytes exceeded" due to SSML byte-bloat from Sanskrit
   - **Fix**: Updated `VoiceStrategyEngine.getFallbackVoice()` to return OpenAI `onyx` for English
   - **Files**: `src/services/narration/VoiceStrategyEngine.ts`, `src/hooks/useNarration.ts`

3. ✅ **OpenAI TTS Edge Function Fixed**:
   - **Problem**: Used SSE format but client expected NDJSON
   - **Fix**: Changed to NDJSON format (`{ audio: base64 }\n`), added chunked base64 encoding
   - **File**: `supabase/functions/tts-stream-openai/index.ts`

4. ✅ **Google TTS Byte-Limit Fix**:
   - **Problem**: Per-character prosody wrapping for Sanskrit caused SSML to exceed 5000 bytes
   - **Fix**: Simplified SSML to `<speak><lang>...</lang></speak>`, reduced chunk size to 1500 chars
   - **File**: `supabase/functions/tts-stream-google/index.ts`

**Fallback Chain (Updated)**:
```
ElevenLabs (primary for English)
    ↓ 401/403 blocked
OpenAI TTS (fallback #1 for English) ← NEW
    ↓ if fails
Google Cloud (fallback for Indic languages)
```

### **2025-01-20 (Phase 14d: Memory Crash Fix + Stream Resilience)**

**Status: ✅ DEPLOYED**

1. ✅ **ElevenLabs Memory Crash Fix** (CRITICAL):
   - **Problem**: Edge function dies mid-stream with "Memory limit exceeded" due to base64-encoding large audio buffers
   - **Root Cause**: `base64Encode(audioBuffer)` on ~500KB chunks causes memory spike
   - **Fix**: Reduced `MAX_CHUNKS` to 8, added chunked base64 encoding to process in 32KB segments
   - **File**: `supabase/functions/tts-stream-elevenlabs/index.ts`

2. ✅ **Stream-Death Fallback** (CRITICAL):
   - **Problem**: When backend dies mid-stream, no `done` event arrives, UI shows 0:00 forever
   - **Fix**: `useNarration.ts` now detects zero-chunk streams and auto-retries with Google TTS
   - **File**: `src/hooks/useNarration.ts`

3. ✅ **Content Sanitization**:
   - **Problem**: Raw HTML/URLs sent to TTS waste characters and produce poor audio
   - **Fix**: Added `extractNarrationText()` in `UniversalNarrator.tsx` to strip HTML, URLs, and footnotes
   - **Result**: ~30% reduction in character count, cleaner audio output

4. ✅ **Google TTS Optimization**:
   - Increased chunk size from 1500 to 3000 chars (halves API calls)
   - Token fetch moved outside loop (cached for session)

### **2025-01-20 (Phase 14c: Stream Buffering Fix)**

**Status: ✅ DEPLOYED**

1. ✅ **NDJSON Stream Buffering Bug Fixed**:
   - **Problem**: Network chunks split mid-JSON line, causing "Failed to parse TTS chunk" errors
   - **Root Cause**: `processStreamResponse()` split on `\n` without accumulating incomplete lines
   - **Fix**: Added line buffer accumulator - keeps partial JSON until complete line received
   - **File**: `src/services/narration/NarrationService.ts` (lines 49-139)

2. ✅ **Article Length Guard**:
   - **Problem**: Very long articles (54+ chunks) caused edge function CPU timeout
   - **Fix**: Added `MAX_CHUNKS = 12` limit (~90,000 chars, ~20-25 min audio)
   - **File**: `supabase/functions/tts-stream-elevenlabs/index.ts`

3. ✅ **Increased Chunk Size**:
   - Changed from 4500 to 7500 chars per chunk
   - Reduces API calls by ~40% for same content
   - Improves reliability and reduces CPU time

### **2025-01-20 (Phase 14b: Verification & Hardening)**

**Status: ✅ Complete**

1. ✅ **Diagnostic Logging Added**:
   - `NarrationService.ts`: `[NarrationService] PRIMARY:` and `[NarrationService] FALLBACK:` logs
   - `tts-stream-google/index.ts`: Request logging with config details
   - `articleResolver.ts`: Query result logging
   
2. ✅ **Article Query Optimization**:
   - Reduced from 2 sequential queries to 1 with `OR` condition
   - Improves page load time for database articles

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

### **2025-01-31 (Phase 17: Theme Data Accuracy + Enterprise Admin Dashboard)**

**Status: 🟡 IN PROGRESS**

#### Phase 17a: Theme Article Count Accuracy

**Root Cause Analysis:**
- Homepage theme cards use `getThemeArticleCount()` from `useResearchStats` hook
- Hook queries ONLY `srangam_articles` database (ignores JSON static articles)
- Indian Ocean World shows "0" because all 3 articles are in **draft** status
- Empires & Exchange shows "0" because all 2 articles are in **draft** status
- Display is technically accurate for published content, but misleading for platform content

**Current Database Distribution (Verified):**
| Theme | Published | Draft | Total |
|-------|-----------|-------|-------|
| Ancient India | 28 | 0 | 28 |
| Geology & Deep Time | 1 | 2 | 3 |
| Scripts & Inscriptions | 2 | 1 | 3 |
| Sacred Ecology | 1 | 1 | 2 |
| Indian Ocean World | 0 | 3 | 3 |
| Empires & Exchange | 0 | 2 | 2 |
| **Total** | **32** | **9** | **41** |

**Solution Implemented:**
1. ✅ Updated `ThemeStats` interface to include `draftCount`
2. ✅ Modified `fetchResearchStats()` to query articles with status
3. ✅ Updated `ResearchThemes.tsx` to display draft indicator
4. ✅ Theme cards now show: "0 articles (+3 drafts)"

#### Phase 17b: Enterprise Admin Dashboard

**New Components Created:**
- `src/components/admin/ContentStatusCards.tsx` - Published/Draft/OG/Audio metrics
- `src/components/admin/ThemeDistributionChart.tsx` - Pie chart with dharmic colors
- `src/components/admin/ContentHealthProgress.tsx` - OG/Narration/Bibliography coverage
- `src/components/admin/QuickActionsPanel.tsx` - Bulk publish/generate actions

**Dashboard Enhancements:**
- Theme distribution visualization using Recharts
- Content health progress bars
- Quick action buttons for common workflows
- Status-aware recent articles table

#### Documentation Created:
- `docs/ADMIN_DASHBOARD.md` - Admin routes and capabilities
- `docs/CONTENT_ARCHITECTURE.md` - Document lifecycle and workflows

### **2025-01-31 (Phase 18: Author & Article Metadata Management)**

**Status: ✅ DEPLOYED**

#### Problem Identified:
- "Edit Metadata" menu item was a non-functional placeholder
- No way to edit article title, author, theme, or tags after import
- 4 author name variants existed in database with no normalization:
  - "NF Research Team" (30 articles)
  - "Srangam Research" (8 articles)
  - "Srangam Research Team" (2 articles)
  - "Nartiang Foundation Research Team" (1 article)

#### Solution Implemented:

**1. Article Metadata Edit Dialog:**
- Created `src/components/admin/ArticleEditDialog.tsx`
- Sheet component with form for editing:
  - Title (English)
  - Author (with autocomplete from existing authors)
  - Theme (dropdown with 6 standard themes)
  - Status (draft/published)
  - Tags (array editor)
  - Description/Dek (English)
  - Featured toggle
- Validation before save
- Query invalidation for immediate UI refresh

**2. Author Autocomplete Hook:**
- Created `src/hooks/useUniqueAuthors.ts`
- Returns unique authors with article counts
- Sorted by frequency for quick selection
- Powers autocomplete in edit dialog

**3. Bulk Author Normalization:**
- Created `src/components/admin/BulkAuthorUpdate.tsx`
- Select source authors to merge
- Choose target author name
- Preview affected articles before merge
- Single database transaction for consistency

**4. Wired to ArticleManagement:**
- Updated `src/pages/admin/ArticleManagement.tsx`
- "Edit Metadata" now opens ArticleEditDialog
- Delete confirmation dialog retained

#### Database Considerations:
- No schema changes required
- Uses existing RLS policies (admin role required for UPDATE)
- All updates use service role through existing policies

### **2025-01-31 (Phase 19: Reliability & Scalability Implementation)**

**Status: ✅ DEPLOYED**

#### Issues Addressed:

1. **Tag Categorization Context Problem:**
   - 42 tags (29%) remained "Uncategorized" due to one-shot AI prompts
   - AI had no memory of previous categorization decisions

2. **Slug Resolution Inconsistency:**
   - Multiple hooks implemented slug resolution differently
   - Some used sequential queries (2 DB calls), others used OR conditions

3. **OpenAI Direct Dependency:**
   - `suggest-tag-categories` used OpenAI API directly, not Lovable AI

#### Solutions Implemented:

**1. Contextual Tag Categorization (Phase 19a):**
- Updated `suggest-tag-categories` edge function
- Now fetches top 10 categorized tags per category as examples
- Includes historical patterns in AI prompt for consistency
- Migrated from OpenAI to **Lovable AI Gateway** (`google/gemini-3-flash-preview`)
- Added `LOVABLE_API_KEY` usage (auto-provisioned)

**2. Centralized Slug Resolver (Phase 19c):**
- Created `src/lib/slugResolver.ts` with single OR query
- Includes 10-second timeout for reliability
- Performance logging: `[slugResolver] Query completed in Xms`
- Refactored hooks to use central resolver:
  - `src/hooks/useArticleId.ts` - Now uses `resolveArticleId()`
  - `src/hooks/useArticleBibliography.ts` - Uses `resolveArticleId()`

**3. Documentation Hardening (Phase 19.0):**
- Created `docs/RELIABILITY_AUDIT.md` - Core invariants, critical paths, failure modes
- Created `docs/SCALABILITY_ROADMAP.md` - Growth projections, bottleneck thresholds

#### Files Changed:
- `supabase/functions/suggest-tag-categories/index.ts` - Lovable AI + context
- `src/lib/slugResolver.ts` - New centralized resolver
- `src/hooks/useArticleId.ts` - Refactored to use resolver
- `src/hooks/useArticleBibliography.ts` - Refactored to use resolver
- `docs/RELIABILITY_AUDIT.md` - New documentation
- `docs/SCALABILITY_ROADMAP.md` - New documentation

#### Future Phases (Pending):
- **19b**: Add `tag_vector` column with GIN index for O(log N) cross-ref calculation
- **19c**: Batch cultural term upsert (resolve N+1 pattern)
- **19d**: Server-side pagination for article lists
- **19e**: Structured error codes for edge functions

---

## 🎯 **Next Steps**

### **Short Term**
1. Google Search Console setup (manual)
   - Property registered for `nartiang.org` (encompasses `srangam.nartiang.org`)
   - ✅ Canonical tags on all pages (Feb 2026)
   - Submit sitemap URL
   - Request indexing for key pages

2. ⏳ Publish draft articles (9 pending review)
   - Indian Ocean World: 3 drafts
   - Empires & Exchange: 2 drafts
   - Geology & Deep Time: 2 drafts
   - Sacred Ecology: 1 draft
   - Scripts & Inscriptions: 1 draft

3. ✅ Normalize author names using BulkAuthorUpdate
   - Consolidate 4 variants to 2 canonical names

### **Medium Term** 
1. Phase 19b: Tag Vector Index
   - Add `tag_vector` column for fast similarity search
   - Replace O(N) cross-reference algorithm

2. Phase 19c: Batch Operations
   - Batch cultural term upsert
   - Reduce import latency

3. Author Registry (Phase 20 - Optional)
   - Create `srangam_authors` table with structured data
   - Author profiles with bio, affiliation, ORCID
   - Foreign key reference from articles

### **Long Term**
1. Full multilingual support (PA, TA)
2. Translation queue management
3. Content analytics dashboard

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
- `docs/RELIABILITY_AUDIT.md` - Core invariants and failure modes
- `docs/SCALABILITY_ROADMAP.md` - Growth projections and bottleneck analysis
- `docs/ADMIN_DASHBOARD.md` - Admin routes and capabilities
- `docs/CONTENT_ARCHITECTURE.md` - Document lifecycle and workflows
