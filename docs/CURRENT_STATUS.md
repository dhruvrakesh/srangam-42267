# Srangam Platform - Current Status

**Last Updated**: 2025-12-28 (Phase 0 Documentation Update - Context Preservation)

---

## ✅ **Completed Features**

### **1. Markdown Import Pipeline**
- ✅ YAML frontmatter parsing with special character handling
- ✅ Markdown to HTML conversion (marked.js)
- ✅ Word count & read time calculation
- ✅ Duplicate slug detection with "Overwrite if exists" option
- ✅ Markdown source preservation in separate table
- ✅ Slug standardization (110 → 38 chars avg, 65% reduction)
- ✅ Slug alias system for SEO-friendly URLs
- ✅ Multilingual content support (EN, HI, PA merged into single article)
- ✅ Unicode-safe content hashing (SHA-256 for non-Latin scripts)
- ✅ Escaped markdown character sanitization (\#, \*, \-)

### **2. AI-Powered Tag Generation**
- ✅ OpenAI GPT-4o-mini integration (migrated Nov 2025)
- ✅ Auto-generates 5-8 contextually relevant tags when frontmatter is empty
- ✅ Fuzzy matching against existing tag taxonomy
- ✅ Tag normalization (prevents duplicates like "Mauryan Empire" vs "Mauryans")
- ✅ Self-improving tag registry with usage tracking

### **3. Cultural Terms Extraction**
- ✅ 1,221+ AI-enhanced terms in database
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
- ✅ Dark/light mode support
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Custom color palette (ocean, vedic, maritime, geology)
- ✅ Multilingual fonts (Noto Sans Devanagari, Gurmukhi, Tamil)

### **7. Navigation System**
- ✅ Primary navigation via `HeaderNav.tsx` (active)
- ✅ Mobile bottom tabs for quick access (Home, Themes, Map, Search)
- ✅ Keyboard shortcuts: `/` (search), `m` (maps), `gs` (sources)
- ✅ Visual separator between logo and nav items with hover effect
- ✅ Smooth scroll-to-top on logo click
- ✅ Language switcher integration
- ⚠️ `TopNavigation.tsx` deprecated (kept for reference)

### **8. Research Tool Showcase Pages**
- ✅ **Sanskrit Translator** landing page (`/sanskrit-translator`)
  - 7-stage translation pipeline showcase (OCR → Sandhi → Morphology → Translation)
  - Sample Mahābhārata verse analysis with BORI critical edition citations
  - Integration with 1,108-term cultural database for named-entity recognition
  - Methodology article published: `sanskrit-translator-methodology` (1,200+ words)
  - Request access workflow via `mailto:research@srangam.app`
  - SEO-optimized with schema.org structured data
  
- ✅ **Jyotish Horoscope** landing page (`/jyotish-horoscope`)
  - Sidereal astronomy calculator showcase (Swiss Ephemeris + Lahiri Ayanāṃśa)
  - Sample birth chart (15 Aug 1947) with D1/D9 charts and Vimśottarī Daśā timeline
  - "Celestial Mathematics, Not Fortune-Telling" ethical positioning
  - Methodology article published: `jyotish-methodology` (1,200+ words with Python code)
  - Request access workflow via `mailto:research@srangam.app`
  - SEO-optimized with schema.org structured data
  
- ✅ **Navigation Integration**: "Tools" menu in primary navigation
- ✅ **Backend Integration**: N/A (external Python scripts by design)
- 🔜 **GitHub Repository Links**: Pending publication of research scripts

### **9. Landing Page Redesign** (2025-12-23)
- ✅ **Begin Journey Page** (`/begin-journey`)
  - Mission statement hero with Sanskrit invocation
  - Five research pillars with **live article counts** from database
  - Research metrics (articles, cross-refs, terms) fetched in real-time
  - Intersection observer scroll animations for all sections
  - Cultural database teaser with sample terms
  - "Choose Your Path" entry points for different reader interests
  - SEO-optimized with dynamic meta descriptions
  
- ✅ **About Page Restructure** (`/about`)
  - **Mission-first** layout: Srangam Vision at top
  - Three methodological pillars (Archaeological, Textual, Geo-mythological)
  - Knowledge Corpus section with live database stats
  - Scholar Assembly moved below mission
  - Institutional Support moved to bottom
  - Scroll animations via intersection observer
   
- ✅ **New Hooks & Components Created**:
  - `useResearchStats`: Fetches live article counts, cross-refs, cultural terms
  - `useIntersectionObserver`: Reusable scroll animation hook with triggerOnce option
  - `useCountUp`: Animated number counter with easeOutQuart easing, returns `{ count, isComplete }`
  - `getThemeArticleCount`: Helper to map theme IDs to article counts
  - `ResearchMetrics`: Shared component with staggered animations, pulse effect on complete, supports "minimal" and "cards" variants
  - `ResearchThemes`: Shared component for theme display with "pills" and "cards" variants (2025-12-24)
  - `researchThemes.ts`: Centralized theme configuration data (2025-12-24)

---

## 📊 **Database State** (Current)

### **Current Data** (as of 2025-12-28)
- **Articles**: 40 published
  - All in Supabase database with standardized slugs
  - **12 articles missing `slug_alias`** (fix pending Phase 1)
  - Theme distribution:
    - Ancient India: 27 articles
    - Indian Ocean World: 3 articles
    - Geology & Deep Time: 3 articles
    - Scripts & Inscriptions: 3 articles
    - Empires & Exchange: 2 articles
    - Sacred Ecology: 2 articles
  - All 6 research themes now have articles (fixed 2025-12-27)
  - All have AI-generated tags (5-8 per article)
  - All have theme categorization
  - **Multilingual**: Baba Ala Singh has EN + HI content
  
- **Cross-references**: 700+
  - Same-theme and thematic references
  - All integrated on article pages via `ArticleCrossReferences` component
  - Visible in Research Network visualization
  - Cross References Browser "Unknown" bug fixed (2025-12-27)
  
- **Cultural terms**: 1,221+
  - All terms have etymology and context (AI-enriched)
  - Module distribution: vedic, maritime, geology, other
  - Connected to Sanskrit Translator named-entity recognition showcase
  - Pagination implemented (bypasses 1000-row limit)

- **Tags**: 127 unique tags
  - Average 6.2 tags per article
  - Categories: Historical Period (43), Concept (38), Location (29), Methodology (17)
  - Top tags: "ancient-india", "epigraphy", "maritime-trade"

- **Audio Narrations**: 940
  - All stored in Google Drive
  - Metadata not yet linked to database
  - UI implementation pending (Phase 4)

### **Database Schema**
```
srangam_articles
├── id (uuid, PK)
├── slug (text, UNIQUE)
├── slug_alias (text) ← SEO-friendly short slugs (12 missing)
├── title (jsonb)
├── content (jsonb)
├── theme (text)
├── tags (text[])
├── status (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

srangam_cross_references
├── id (uuid, PK)
├── source_article_id (uuid, FK)
├── target_article_id (uuid, FK)
├── reference_type (text)  ← 'thematic' | 'same_theme' | 'explicit_citation'
├── strength (integer)  ← 1-10 scale
├── bidirectional (boolean)
├── context_description (jsonb)
└── created_at (timestamptz)

srangam_cultural_terms
├── id (uuid, PK)
├── term (text, UNIQUE)
├── display_term (text)
├── translations (jsonb)
├── etymology (jsonb)  ← AI-generated
├── context (jsonb)  ← AI-generated
├── usage_count (integer)
├── module (text)
├── related_terms (text[])
└── created_at (timestamptz)

srangam_tags
├── id (uuid, PK)
├── tag_name (text, UNIQUE)
├── category (text)
├── usage_count (integer)
├── related_tags (jsonb)
├── created_at (timestamptz)
└── last_used (timestamptz)
```

---

## 🔧 **Recent Fixes & Deployments**

### **2025-12-28 (Phase 0-2: Documentation, Slugs & Table Rendering)**
1. 📄 **Documentation Update (Phase 0)**:
   - Updated CURRENT_STATUS.md with 40 article count
   - Documented 12 articles missing slug_alias
   - Created ARTICLE_DISPLAY_GUIDE.md for markdown best practices
   - Updated ARTICLE_STATUS.md with integration status

2. 🔗 **Slug Alias Generation (Phase 1)**:
   - Added slug_alias for 12 articles via database migration
   - All articles now have SEO-friendly short URLs
   - Enables proper URL routing for all articles

3. 📊 **Enhanced Table Rendering (Phase 2)**:
   - Upgraded ProfessionalTextFormatter.tsx with:
     - Sticky table headers on scroll
     - Zebra striping (alternating row colors)
     - Hover highlights for active rows
     - Max-width with text wrapping
     - Mobile scroll indicator gradient
     - First column emphasis for dates
     - Script-aware font classes in cells

### **2025-12-27 (Security Fixes & Cross References Browser)**
1. ✅ **Cross References Browser Bug Fix**:
   - Fixed "Unknown → Unknown" display in Reference List table
   - Added `getNodeId` helper to handle `react-force-graph-2d` link mutation
   - The library mutates link objects, replacing UUID strings with node objects
   - Now correctly extracts IDs via `typeof node === 'string' ? node : node?.id`

2. ✅ **Missing Articles Imported**:
   - Added 8 articles to populate all 6 research themes:
     - `scripts-that-sailed`, `riders-on-monsoon`, `monsoon-trade-clock` (Indian Ocean World)
     - `gondwana-to-himalaya`, `earth-sea-sangam`, `stone-purana` (Geology & Deep Time)
     - `indian-ocean-power-networks`, `chola-naval-raid` (Empires & Exchange)

3. ✅ **Security Function Fixes**:
   - Added `SET search_path = 'public'` to 5 SECURITY DEFINER functions:
     - `analyze_tag_cooccurrence`
     - `get_purana_statistics`
     - `srangam_increment_bibliography_usage`
     - `srangam_increment_term_usage`
     - `update_tag_stats`
   - Prevents search path injection attacks

4. ✅ **Security Warnings Resolved**:
   - Marked PostGIS system table warnings as acceptable (spatial_ref_sys is not user data)
   - Marked extension-in-public warnings as acceptable (required for PostGIS/pgvector)
   - Remaining function warnings are PostGIS system functions (st_estimatedextent)

### **2025-12-24 (Theme System & Shared Components)**
1. ✅ **Database Theme Corrections**:
   - Fixed `scripts-sailed-epigraphic-atlas` → `Scripts & Inscriptions`
   - Fixed `geomythology-cultural-continuity` → `Sacred Ecology`
   - Fixed `ringing-rocks-rhythmic-cosmology` → `Geology & Deep Time`

2. ✅ **Shared ResearchThemes Component**:
   - Created `src/data/researchThemes.ts` - centralized theme configuration
   - Created `src/components/research/ResearchThemes.tsx` - shared component with "pills" and "cards" variants
   - Updated `BeginJourney.tsx` and `About.tsx` to use shared component
   - Reduced code duplication (~80 lines removed)

3. ✅ **Enhanced useCountUp Hook**:
   - Now returns `{ count, isComplete }` instead of just count
   - Enables triggering effects when animation completes

4. ✅ **Pulse Animation on Count Complete**:
   - Added `pulse-complete` keyframe to tailwind.config.ts
   - Updated `ResearchMetrics` to apply pulse when count finishes
   - Creates visual feedback when numbers finish animating

### **2025-12-14 (Navigation UI Enhancements)**
1. ✅ **Visual Separator Enhancement**:
   - Added subtle vertical separator between logo and navigation
   - Implemented hover effect (opacity 50% → 70% on nav hover)
   - Used Tailwind group hover with named group (`group/nav`)

2. ✅ **Smooth Scroll-to-Top**:
   - Added `scrollToTop()` function with smooth behavior
   - Integrated with logo click handler
   - Works when on home page and scrolled down

3. ✅ **Code Refactoring**:
   - Added deprecation comment to `TopNavigation.tsx`
   - Updated documentation with navigation system section

### **2025-11-23 (Phase 3 - Cross-Reference Integration)**
1. ✅ **Frontend Cross-Reference Integration**:
   - Created `useArticleId` hook for slug-to-ID resolution
   - Updated `ArticleCrossReferences` component to accept `articleSlug` prop
   - Modified `ArticlePage` component to pass slug and render cross-references
   - Updated all 14 article pages to integrate cross-reference component
   - Cross-references now visible and functional on all pages

2. ✅ **Typography Standardization**:
   - Implemented academic typography standards
   - Updated design system with semantic tokens
   - Fixed color contrast issues
   - Standardized heading hierarchy

3. ✅ **Slug Standardization** (Session 3):
   - Standardized all 23 database articles
   - Average slug length reduced 65% (110 → 38 chars)
   - Implemented slug_alias system for backward compatibility
   - Updated resolver logic to prioritize aliases

### **2025-11-09 (Phase 2 - AI Tagging Deployment)**
1. ✅ **Deployed 3 Edge Functions**:
   - `generate-article-tags` - AI tag generation using Lovable AI
   - `markdown-to-article-import` - Updated with AI tag integration
   - `analyze-tag-relationships` - Tag co-occurrence analysis

2. ✅ **Fixed Database Constraints**:
   - `srangam_cross_references.strength` now allows 1-10 (was 1-5)
   - Added support for `same_theme` and `explicit_citation` reference types
   - Fixed `srangam_markdown_sources.article_id` unique constraint

3. ✅ **Fixed Cultural Terms Insertion**:
   - Added `display_term` field (defaults to term value)
   - Added `module` field (defaults to 'srangam')
   - Improved validation filtering (removes URLs, markdown, numbers)

---

## 🎯 **Next Steps** (Current Phase)

### **Immediate** (Phase 3: Enhanced Article Display)
1. 🔜 **Evidence Table Component** (Optional)
   - Create `src/components/articles/enhanced/EvidenceTable.tsx`
   - Specialized 6-column scholarly table (Date/Place/Actors/Event/Meaning/Evidence)
   - Card-based mobile layout with collapsible rows
   - Source quality badges (Primary/Secondary/Tradition)

2. 🔜 **Markdown Import Enhancement**
   - Auto-generate slug_alias on new imports
   - Better evidence table detection

### **Short Term** (Sessions 3B & 3C - 2 hours)
1. Enhanced Cross-Reference UX
   - Add strength badges (strong/medium/weak)
   - Implement hover previews with article metadata
   - Create inline callout boxes for `{{related:slug|text}}` patterns

2. Map Loading Diagnostics
   - Fix "Map temporarily unavailable" errors
   - Diagnose Leaflet/MapLibre initialization issues
   - Ensure all article maps render correctly

### **Medium Term** (Phase 4 - Deferred)
1. Audio Narration UI (backend complete, UI pending)
2. Advanced network graph features (clustering, filtering)
3. Chapter compilation system
4. Bibliography consolidation

### **Long Term**
1. AI-powered semantic similarity (vector embeddings)
2. Topic clustering with K-means
3. Manual curation tool for cross-references
4. Advanced analytics dashboard

---

## 🐛 **Known Issues**

### **Critical Issues** (Resolved 2025-12-28)
- ~~**12 Articles Missing slug_alias**~~: Fixed via database migration
- ~~**Evidence Table Poor Rendering**~~: Fixed via enhanced CSS

### **Minor Issues** (Non-Blocking)
- ⚠️ **Map "Temporarily Unavailable"**: ErrorBoundary fallback on 2-3 article pages
  - Impact: Low
  - Timeline: Post-launch patch (Session 3C)

- ⚠️ **Audio Narration UI Not Built**: Backend complete (940 narrations), UI pending
  - Impact: Medium (feature not visible to users)
  - Timeline: Phase 4 (deprioritized per user request)

- ⚠️ **59 Cultural Terms with Zero Usage**: Terms extracted but not appearing in articles
  - Impact: Low
  - Action: Review and potentially merge or remove

- ⚠️ **Hindi Table Content OCR Issues**: Some Hindi tables have formatting artifacts
  - Impact: Low (content still readable)
  - Action: Manual cleanup if needed

---

## 📝 **Platform Readiness**

### **Content Completeness**
- ✅ 40/40 articles accessible (100%)
- ✅ 1,221/1,221 cultural terms in database (100%)
- ✅ 700+/700+ cross-references visible (100%)
- ✅ 127 tags with categorization (100%)

### **Feature Completeness**
- ✅ Core reading experience (100%)
- ✅ Cross-reference discovery (100%)
- ✅ Cultural term tooltips (100%)
- ✅ Responsive design (100%)
- ✅ Evidence table rendering (100% - Phase 2 complete)
- ✅ Public network browser (100%)
- ⏳ Audio narration UI (0% - Phase 4)

### **Launch Readiness**: **100%** ✅
- All critical features complete
- Research tool showcase pages published
- Both methodology articles accessible
- Minor issues documented and deprioritized
- Platform ready for public announcement

---

## 🔗 **Related Documentation**
- [Article Status & Testing](./ARTICLE_STATUS.md)
- [Article Display Guide](./ARTICLE_DISPLAY_GUIDE.md)
- [Soft Launch Checklist](./SOFT_LAUNCH_CHECKLIST.md)
- [Cross-Reference System Architecture](./architecture/CROSS_REFERENCE_SYSTEM.md)
- [AI Tag Generation System](./AI_TAG_GENERATION.md)
- [Import Workflow](./IMPORT_WORKFLOW.md)
