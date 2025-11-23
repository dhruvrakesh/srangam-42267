# Srangam Platform - Documentation

## Overview

Srangam is a multilingual research platform exploring the cultural, historical, and geographical connections across the Indian Ocean World and ancient Bhāratvarṣa. The platform combines rigorous academic research with modern technology to make complex historical narratives accessible to global audiences.

## Platform Statistics

- **31 Published Articles** - Comprehensive research across multiple themes
- **940+ AI-Enhanced Cultural Terms** - Sanskrit and dharmic terminology database
- **5 Research Themes** - Interconnected topics spanning history, geology, epigraphy
- **8 Languages** - English, हिन्दी, தமிழ், తెలుగు, ಕನ್ನಡ, বাংলা, অসমীয়া, Pnar
- **100% Slug Standardization** - SEO-optimized URLs for all articles

## Key Features

### 1. Multilingual Content
- Full support for 8 languages with professional translations
- Cultural term tooltips with contextual definitions
- Language-aware navigation and SEO

### 2. Interactive Visualizations
- **Global Map**: `/maps-data` - Interactive Indian Ocean trade routes
- **Data Visualizations**: `/data-viz` - Research analytics and insights
- **Field Notes**: `/field-notes` - Epistemology and research methodology

### 3. AI-Powered Enhancements
- **Cultural Terms Database**: 940 terms with etymology, translations, and context
- **Audio Narration**: Text-to-speech in multiple languages (future)
- **Cross-References**: AI-detected thematic connections between articles

### 4. Research Themes
- **Ancient India**: Vedic traditions, inscriptions, tribal animism
- **Indian Ocean World**: Maritime trade, ports, monsoon patterns
- **Scripts & Inscriptions**: Epigraphic evidence, multilingual edicts
- **Geology & Deep Time**: Plate tectonics, geomythology, port migration
- **Empires & Exchange**: Trade networks, cultural exchange, Dashanami monks

## Technical Architecture

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6
- **State Management**: TanStack Query for server state
- **i18n**: react-i18next with dynamic language switching

### Backend (Lovable Cloud)
- **Database**: Supabase PostgreSQL with PostGIS
- **Authentication**: Supabase Auth (admin/moderator/user roles)
- **Storage**: Google Drive integration for audio narrations
- **Edge Functions**: AI tagging, context snapshots, imports

### Database Schema
Key tables:
- `srangam_articles` - Main content with JSONB translations
- `srangam_cultural_terms` - 940 AI-enriched terms
- `srangam_cross_references` - Article relationships
- `srangam_tags` - Taxonomy system with usage tracking
- `srangam_inscriptions` - Epigraphic database
- `srangam_audio_narrations` - TTS metadata

## Content Pipeline

1. **Markdown Import** → YAML frontmatter parsing
2. **AI Tag Generation** → Gemini-powered categorization
3. **Cultural Terms Extraction** → Sanskrit/Devanagari detection
4. **Cross-Reference Detection** → Thematic relationship mapping
5. **Slug Standardization** → SEO-friendly URL generation

## Development Status

### ✅ Completed
- [x] 31 articles fully migrated to database
- [x] 940 cultural terms with AI enrichment
- [x] Slug standardization (100% complete)
- [x] Interactive maps and visualizations
- [x] Data visualization dashboard
- [x] Sanskrit terminology browser
- [x] Multilingual navigation
- [x] Admin import UI

### 🚧 In Progress
- [ ] Audio narration system (backend complete, UI pending)
- [ ] Chapter compilation for book volumes
- [ ] Newsletter signup integration

### 📋 Future Roadmap
- [ ] PDF export with custom formatting
- [ ] Semantic search with vector embeddings
- [ ] User analytics tracking
- [ ] Community contributions

## File Structure

```
src/
├── pages/
│   ├── oceanic/           # Theme landing pages
│   ├── articles/          # Individual article pages
│   ├── sources/           # Research tools
│   │   ├── SanskritTerminology.tsx (940 terms)
│   │   ├── Epigraphy.tsx
│   │   └── Edicts.tsx
│   ├── DataVisualization.tsx (NEW)
│   └── MapsData.tsx
├── components/
│   ├── articles/          # Article rendering
│   ├── interactive/       # Maps, animations
│   └── cosmic-ocean/      # Theme components
├── data/
│   ├── cosmic_ocean/      # Port/monsoon data
│   └── articles/          # Legacy JSON articles
└── integrations/
    └── supabase/          # Auto-generated types

docs/
├── README.md              # This file
├── ARTICLE_STATUS.md      # Content tracking
├── SLUG_STANDARDIZATION.md
└── IMPLEMENTATION_LOG_2025-11-23.md
```

## Quick Start Guide

### For Developers
1. **Clone & Install**: Standard React/Vite setup
2. **Environment**: `.env` auto-configured via Lovable Cloud
3. **Database**: Pre-seeded with 31 articles, 940 terms
4. **Run**: `npm run dev` → http://localhost:5173

### For Content Creators
1. Navigate to `/admin/import` (requires admin role)
2. Upload markdown with YAML frontmatter
3. AI generates tags and extracts cultural terms
4. Review and publish

### For Researchers
1. **Browse Articles**: `/articles` or theme pages
2. **Explore Terms**: `/sources/sanskrit-terminology`
3. **View Maps**: `/maps-data` for spatial data
4. **Analytics**: `/data-viz` for research insights

## API Documentation

### Key Queries
```typescript
// Fetch all articles
const { data } = await supabase
  .from('srangam_articles')
  .select('*')
  .eq('status', 'published');

// Search cultural terms
const { data } = await supabase
  .from('srangam_cultural_terms')
  .select('*')
  .ilike('term', `%${query}%`);

// Get cross-references
const { data } = await supabase
  .from('srangam_cross_references')
  .select('*, source:srangam_articles(*), target:srangam_articles(*)')
  .eq('source_article_id', articleId);
```

## Deployment

- **Platform**: Lovable Cloud (auto-deploy)
- **Domain**: Custom domain configured
- **CDN**: Cloudflare for static assets
- **Database**: Supabase hosted PostgreSQL

## Support & Contribution

- **Issues**: Report via project management tools
- **Documentation**: Keep updated in `docs/` folder
- **Testing**: Manual QA before each deployment

## License & Credits

All research content © Srangam Research Foundation
Platform code licensed under MIT
Built with Lovable.dev

---

**Last Updated**: 2025-11-23
**Version**: 1.0.0 (Soft Launch)
