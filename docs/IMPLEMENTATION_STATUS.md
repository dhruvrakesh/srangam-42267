# Srangam Implementation Status

**Last Updated**: 2026-02-12

---

## Active Phases

### SEO Repair (February 2026) - Critical Fixes

**Status**: ✅ Complete (2026-02-12)

| Task | Status | Notes |
|------|--------|-------|
| OG image SVG→PNG | ✅ Complete | Social platforms don't render SVG |
| Canonical URL standardization | ✅ Complete | 7 files fixed (4 domains → 1) |
| robots.txt sitemap URL | ✅ Complete | Points to edge function now |
| Home page Helmet tags | ✅ Complete | Title, description, OG tags |
| Font loading optimization | ✅ Complete | `display=swap` + lazy loading |
| Edge function domain fix | ✅ Complete | `generate-article-seo` updated |
| Documentation update | ✅ Complete | `docs/SEO_CONFIGURATION.md` |

**Audit Reference**: See `docs/SEO_CONFIGURATION.md` for canonical domain policy.

### SEO Activation (February 2026) - Domain & GSC Setup

**Status**: 🔄 In Progress

**Production Domain Decision**: `srangam.nartiang.org` (subdomain of `nartiang.org`)

| Step | Action | Owner | Status |
|------|--------|-------|--------|
| 1 | Add `srangam.nartiang.org` in Lovable project Settings → Domains | User | 🔲 Pending |
| 2 | Configure DNS: A record for `srangam.nartiang.org` → `185.158.133.1` | User | 🔲 Pending |
| 3 | Add TXT record `_lovable` for domain verification | User | 🔲 Pending |
| 4 | Wait for DNS propagation + SSL provisioning (up to 72h) | User | 🔲 Pending |
| 5 | Update all canonical URLs from `srangam-db.lovable.app` → `srangam.nartiang.org` | AI | ✅ Complete (2026-02-12) |
| 6 | Update sitemap base URL in edge function | AI | ✅ Complete (2026-02-12) |
| 7 | Update OG tags in index.html | AI | ✅ Complete (2026-02-12) |
| 8 | Register `srangam.nartiang.org` in Google Search Console (URL prefix) | User | 🔲 Pending |
| 9 | Add GSC verification meta tag to `index.html` | AI | 🔲 Blocked on Step 8 |
| 10 | Submit sitemap URL in GSC | User | 🔲 Blocked on Step 9 |
| 11 | Request indexing for priority pages | User | 🔲 Blocked on Step 10 |

**Files to update in Step 5–7** (canonical migration):
- `index.html` (canonical, OG URL, Twitter URL)
- `src/components/seo/SiteSchema.tsx`
- `src/components/i18n/ArticleHead.tsx`
- `src/components/oceanic/OceanicArticlePage.tsx`
- `src/pages/Articles.tsx`
- `src/pages/JyotishHoroscope.tsx`
- `src/pages/SanskritTranslator.tsx`
- `supabase/functions/generate-sitemap/index.ts`
- `supabase/functions/generate-article-seo/index.ts`
- `public/robots.txt`

---

### Phase 21 (February 2026) - Sanskrit Automaton Integration

**Status**: 🔄 In Progress

| Task | Status | Notes |
|------|--------|-------|
| 21.1 Documentation | ✅ Complete | `docs/SANSKRIT_AUTOMATON.md` |
| 21.2 Edge Function Proxy | 🔲 Pending | `sanskrit-analyze` function |
| 21.3 React Hook | 🔲 Pending | `useSanskritAnalysis.ts` |
| 21.4 Input Component | 🔲 Pending | `SanskritInputPanel.tsx` |
| 21.5 Results Component | 🔲 Pending | `SanskritResultsPanel.tsx` |
| 21.6 Landing Page Update | 🔲 Pending | Interactive demo section |
| 21.7 Python API Deployment | 🔲 Pending | External hosting required |

**Architecture**: Three-tier (React → Edge Function → Python API/Lovable AI)

**Access Control**: Admin-only (mirrors narration pattern)

---

## Completed Phases

### Phase 20 (January 2026) - Narration System

| Feature | Status |
|---------|--------|
| Multi-provider TTS | ✅ Complete |
| ElevenLabs integration | ✅ Complete |
| Google Drive caching | ✅ Complete |
| Admin-only access | ✅ Complete |
| Voice strategy engine | ✅ Complete |

### Phase 19 (January 2026) - Reliability & Scalability

| Feature | Status |
|---------|--------|
| Tag categorization context | ✅ Complete |
| Centralized slug resolver | ✅ Complete |
| Documentation updates | ✅ Complete |
| RLS policy hardening | ✅ Complete |

### Phase 18 (December 2025) - Context Snapshots

| Feature | Status |
|---------|--------|
| Snapshot generation | ✅ Complete |
| Google Drive export | ✅ Complete |
| Admin UI | ✅ Complete |

---

## Upcoming Phases

### Phase 22 - Search & Discovery

**Trigger**: 500+ articles or user feedback

| Task | Description |
|------|-------------|
| 22a | Add pgvector extension |
| 22b | Generate article embeddings |
| 22c | Implement semantic search |
| 22d | "Similar articles" recommendations |

### Phase 23 - Infrastructure Scaling

**Trigger**: 1000+ articles or 10k+ monthly visitors

| Task | Description |
|------|-------------|
| 23a | Evaluate table partitioning |
| 23b | Add read replicas if needed |
| 23c | Implement CDN for static assets |
| 23d | Review and optimize indexes |

---

## Feature Matrix

| Feature | Public | User | Admin |
|---------|--------|------|-------|
| Read articles | ✅ | ✅ | ✅ |
| Cultural term tooltips | ✅ | ✅ | ✅ |
| Cross-reference graph | ✅ | ✅ | ✅ |
| Audio narration | ❌ | ❌ | ✅ |
| Sanskrit analysis | ❌ | ❌ | ✅ |
| Article import | ❌ | ❌ | ✅ |
| Context snapshots | ❌ | ❌ | ✅ |

---

## Database Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `srangam_articles` | Article content | Public read, admin write |
| `srangam_cultural_terms` | Glossary | Public read, admin write |
| `srangam_cross_references` | Article links | Public read, auth write |
| `srangam_tags` | Tag taxonomy | Public read, admin write |
| `srangam_audio_narrations` | TTS cache | Public read, auth write |
| `user_roles` | RBAC | Self read, admin manage |

---

## Edge Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `tts-generate` | Text-to-speech | Admin only |
| `tts-save-drive` | Google Drive upload | Admin only |
| `process-article` | Import pipeline | Admin only |
| `tag-categorize` | AI tag assignment | Admin only |
| `sanskrit-analyze` | Sanskrit NLP | Admin only (Phase 21) |

---

## Key Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Articles | 41 | 100 (6 months) |
| Cross-references | 740 | 2,000 |
| Cultural terms | 1,628 | 2,500 |
| Page load time | ~1.5s | < 3s |
| Import latency | ~3s | < 10s |

---

## Known Issues

| Issue | Priority | Status |
|-------|----------|--------|
| GSC registered for wrong domain (`nartiang.org` not `srangam-db.lovable.app`) | **Critical** | Pending domain migration to `srangam.nartiang.org` |
| Canonical URLs need migration to `srangam.nartiang.org` after DNS active | High | Blocked on custom domain setup |
| Large file writes can timeout | Medium | Mitigated with incremental phases |
| Mobile Devanagari keyboard | Low | Pending Phase 21.4 |

---

## Documentation Index

- [SANSKRIT_AUTOMATON.md](./SANSKRIT_AUTOMATON.md) - Sanskrit pipeline docs
- [SCALABILITY_ROADMAP.md](./SCALABILITY_ROADMAP.md) - Performance planning
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Quick reference
