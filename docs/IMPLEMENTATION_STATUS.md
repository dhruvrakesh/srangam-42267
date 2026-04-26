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

**Status**: ✅ Complete (canonical tags) / 🔄 DNS pending

**Production Domain Decision**: `srangam.nartiang.org` (subdomain of `nartiang.org`)

| Step | Action | Owner | Status |
|------|--------|-------|--------|
| 1 | Add `srangam.nartiang.org` in Lovable project Settings → Domains | User | ✅ Complete |
| 2 | Configure DNS: A record for `srangam.nartiang.org` → `185.158.133.1` | User | ✅ Complete |
| 3 | Add TXT record `_lovable` for domain verification | User | ✅ Complete |
| 4 | Wait for DNS propagation + SSL provisioning (up to 72h) | User | ✅ Complete |
| 5 | Update all canonical URLs from `srangam-db.lovable.app` → `srangam.nartiang.org` | AI | ✅ Complete (2026-02-12) |
| 6 | Update sitemap base URL in edge function | AI | ✅ Complete (2026-02-12) |
| 7 | Update OG tags in index.html | AI | ✅ Complete (2026-02-12) |
| 8 | Fix "Duplicate without user-selected canonical" — 8 pages missing canonical tags | AI | ✅ Complete (2026-02-15) |
| 9 | Atlas page: hardcode production domain (was using `window.location.origin`) | AI | ✅ Complete (2026-02-15) |
| 10 | Register `srangam.nartiang.org` in Google Search Console (URL prefix) | User | 🔲 Pending |
| 11 | Submit sitemap URL in GSC | User | 🔲 Blocked on Step 10 |
| 12 | Request indexing for priority pages | User | 🔲 Blocked on Step 11 |

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

### Phase F: SEO Remediation — GSC Indexing Fixes (February 2026)

**Status**: ✅ Complete (2026-02-23)

Addressed 5 active GSC indexing issues (page redirects, duplicate content, not-indexed pages).

| Task | Status | Notes |
|------|--------|-------|
| F1: Route deduplication | ✅ Complete | ~27 root routes → `<Navigate replace>` to `/articles/:slug` |
| F1b: Remove duplicate registrations | ✅ Complete | Duplicate `/oceanic/*`, hardcoded `/articles/somnatha-*` removed |
| F1c: Remove unused lazy imports | ✅ Complete | ~27 article page imports pruned from App.tsx |
| F2: Canonical tag consistency | ✅ Verified | `OceanicArticlePage` already emits correct canonical |
| F3: Sitemap alignment | ✅ Complete | Added 8 missing routes, removed root-level article paths |
| F4: Documentation | ✅ Complete | SEO_CONFIGURATION, RELIABILITY_AUDIT, plan.md updated |

**Expected GSC Impact**: Duplicate-without-canonical → 0. Discovered-not-indexed should decrease over 2-4 weeks.

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

### Enterprise Hardening — Phase C (February 2026) - Logic Hardening

**Status**: ✅ Complete (2026-02-15)

| Task | Status | Notes |
|------|--------|-------|
| C1: Shared error-response utility | ✅ Complete | `_shared/error-response.ts` — standardized `ErrorDetail` schema |
| C2: Update 8 edge function catch blocks | ✅ Complete | Backward-compatible structured errors |
| C3: Front-matter validation | ✅ Complete | Language code + title validation before DB writes |
| C4: Slug concurrency guard | ✅ Complete | Atomic upsert + Postgres 23505 → E_DUPLICATE |
| C5: Frontend error handler | ✅ Complete | Reads structured errors, falls back to string-matching |
| C6: Documentation | ✅ Complete | RELIABILITY_AUDIT.md, IMPLEMENTATION_STATUS.md |

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

## Key Metrics (verified 2026-02-15)

| Metric | Current | Target |
|--------|---------|--------|
| Articles | 49 (40 published, 9 draft) | 100 (deferred — growth slower than projected) |
| Cross-references | 1,066 | 2,000 |
| Cultural terms | 1,699 | 2,500 |
| Tags | 170 | 300 |
| Page load time | ~1.5s | < 3s |
| Import latency | ~3s | < 10s |

---

## Known Issues

| Issue | Priority | Status |
|-------|----------|--------|
| ~~GSC registered for wrong domain~~ | ~~Critical~~ | ✅ Resolved — GSC property is `nartiang.org` which encompasses `srangam.nartiang.org` |
| ~~Canonical URLs need migration~~ | ~~High~~ | ✅ Resolved — all pages have canonical tags pointing to `srangam.nartiang.org` (Feb 2026) |
| ~~Route duplication (27 root-level + /articles/)~~ | ~~High~~ | ✅ Resolved — Phase F redirects (Feb 2026) |
| ~~Duplicate /oceanic/* route~~ | ~~Medium~~ | ✅ Resolved — removed duplicate registration (Feb 2026) |
| ~~Sitemap missing routes~~ | ~~Medium~~ | ✅ Resolved — added /search, /sources, /oceanic, /brand, etc. (Feb 2026) |
| 9 tables with zero rows (scaffolded, unused) | Low | Documented — no runtime cost, defer cleanup |
| `srangam_article_versions` invariant #7 untested | Medium | 0 rows — append-only invariant has never been exercised |
| Large file writes can timeout | Medium | Mitigated with incremental phases |
| Mobile Devanagari keyboard | Low | Pending Phase 21.4 |

---

## Documentation Index

- [SANSKRIT_AUTOMATON.md](./SANSKRIT_AUTOMATON.md) - Sanskrit pipeline docs
- [SCALABILITY_ROADMAP.md](./SCALABILITY_ROADMAP.md) - Performance planning
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Quick reference

---

## Phase J — Imaging Bridge

### J.0 — Cross-app HMAC handoff (shipped, 2026-04)

- Edge function `imaging-handoff-token` mints HMAC-signed tokens using
  shared `IMAGING_HANDOFF_SECRET`.
- Receiver (`maps.sankyo.in`) verifies + records replay nonce in
  `srangam_handoff_nonces`.
- Frontend: `useImagingDeepLink` (signed → public-URL fallback),
  `ImagingHubCallout` on `/maps-data`, per-article `ImagingLabLauncher`.
- Docs: `docs/integrations/IMAGING_HANDOFF.md`.

### J.0a — react-leaflet React-18 compatibility fix (shipped, 2026-04)

- Pinned `react-leaflet@^4.2.1`. v5 requires React 19; v4 has the same
  API surface for the components we use (`MapContainer`, `TileLayer`,
  `CircleMarker`, `useMap`).
- Resolved `TypeError: n is not a function` on `/maps-data`.

### J.1 — Universal launcher restoration (shipped, 2026-04-26)

- **Symptom**: per-article map link disappeared for any article without
  geo-pins AND without a curated challenge match.
- **Root cause**: `ImagingLabLauncher` returned `null` early when both
  signals were absent.
- **Fix (3 files, ~80 LOC, zero schema/RBAC changes)**:
  - `ImagingLabLauncher.tsx` — removed early return; card always
    renders; added internal `/maps-data?focus=` Atlas button, always-on
    external Map Explorer button, and admin-only "Add geo-pins" deep-link
    when `isAdmin && pins.length === 0`.
  - `GeographyMedia.tsx` — reads `?article=<slug>`, pre-fills filter,
    scrolls to + flash-highlights the matching row for 2 s.
  - `challengeMap.ts` — added `precession-demo` rule covering harappa /
    indus / sarasvati / ghaggar / dwaraka / "rigveda antiquity" /
    "vedic chronology". First-match-wins, total rules = 7.
- Docs: this file, `docs/integrations/IMAGING_HANDOFF.md`,
  `docs/architecture/SOURCES_PINS_SYSTEM.md` all updated in lockstep.

### J.2 — Pending (future)

- `geo_scope: 'non-spatial'` article-level flag to suppress the admin
  CTA on genuinely placeless articles.
- Cron cleanup of `srangam_handoff_nonces` (5-minute TTL leaves
  short-lived junk; not urgent).
- Dashboard card for handoff issuance metrics (read from edge logs).
