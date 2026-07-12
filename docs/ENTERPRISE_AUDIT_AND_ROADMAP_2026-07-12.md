# Srangam Enterprise Audit & Phased Roadmap

**Date**: 2026-07-12
**Method**: Full repo review (docs, src, supabase/migrations, supabase/functions), fresh `npm install` + production build with bundle analysis, unit test run, lint run, git history review.
**Not audited live**: The production Supabase instance and edge-function logs were unreachable from the audit sandbox (network allowlist). All database/observability statements below are grounded in migrations, edge-function source, and the repo's own verified-count docs (CURRENT_STATUS.md, SCALABILITY_ROADMAP.md, Feb 2026). A short SQL verification checklist is included at the end to re-confirm live state before Phase 2.

---

## Part 1 — What Works (keep, do not touch)

These are verified strengths. Every phase below is designed to preserve them.

**1. Route-level code splitting is already correct.** `App.tsx` lazy-loads every page except Home/NotFound, with Suspense fallback and an ErrorBoundary at the root. Mermaid is dynamically imported inside `MermaidBlock` with CLS-safe space reservation — articles without diagrams pay zero cost. This is genuinely good engineering; the load-time problem is *not* the routing layer.

**2. Edge-function security architecture is sound.** All 25 cost-bearing functions route through `_shared/auth-gate.ts` (`requireAdmin`/`requireUser`, JWT + `has_role()` SECURITY DEFINER RPC), verified per-function. `verify_jwt = false` in config.toml is intentional (auth handled in-code) and consistent. AI calls go through a single tenant-aware provider (`_shared/ai-provider.ts`) with timeout, retry, Gemini→OpenAI fallback, and a per-call cost ledger (`srangam_ai_usage`, Phase T.1). This is enterprise-grade for a passion project.

**3. RLS is real, recent, and specific.** 110 policies across 28 tables; the June 2026 migration gates public reads on `status = 'published'` for articles, cross-references, and purana references, including both-endpoints-published checks on cross-refs. Roles live in a separate `user_roles` table.

**4. Test and reliability culture exists.** 35 unit tests pass (merge-dedup logic, responsive overflow, tap targets, language-badge truth). Playwright e2e includes a throttled Fast-3G/4x-CPU perf budget spec (`article-perf.spec.ts`: body paint < 2.5s, LCP < 3s). Queries are timeout-bounded (10s resolver, 12s list watchdog, 4s pins) with typed timeout errors — no infinite spinners.

**5. Documentation is unusually deep.** 60+ docs including RELIABILITY_AUDIT (with named invariants), SCALABILITY_ROADMAP (with growth-rate honesty — projections corrected against reality), CRON_OPS_PLAYBOOK, and per-phase implementation logs through June 2026. The main doc problem is drift, not absence (see D-1).

**6. i18n and SEO foundations.** 9-language i18n with script-aware fonts, slug + slug_alias system with centralized resolver, canonical URLs, Schema.org ScholarlyArticle/Breadcrumb/Organization, sitemap, robots.txt, llms.txt.

---

## Part 2 — What Doesn't Work (measured evidence)

### P-1 · CRITICAL (load time): 1.39 MB of static article data is compiled into the entry bundle

Production build measured today:

| Chunk | Minified | Gzip |
|---|---|---|
| `index-*.js` (entry — paid by every visitor on every page) | 2.1 MB | **630 KB** |
| `MapboxBujangNetwork-*.js` | 1.6 MB | 437 KB |
| `MapsData-*.js` | 968 KB | 262 KB |
| Total JS emitted | 12 MB | — |

Bundle analysis of the entry chunk (rollup-plugin-visualizer):

| Source | Rendered size in entry |
|---|---|
| **`/src/data` (28 full multilingual article bodies + cultural-terms DBs)** | **1,391 KB** |
| @supabase/* (incl. realtime-js 75 KB) | ~297 KB |
| react-dom | 130 KB |
| i18next + backends | ~108 KB |
| tailwind-merge | 70 KB |
| everything else | remainder |

Root cause chain: `Home.tsx` (eagerly imported in App.tsx) → `multilingualArticleUtils` / `unifiedArticleUtils` → `@/data/articles/index.ts`, which statically imports 28 articles **with full body content in up to 9 languages** plus `cultural-terms.ts` (108 KB) — all to render title cards. The e2e perf budget (LCP < 3s on Fast-3G) cannot survive a 630 KB gz entry script; the docs' "~1.5s page load" figure reflects warm-cache/fast-network conditions.

### P-2 · CRITICAL (load time): all imagery is multi-MB PNG, zero WebP/AVIF

`public/images` totals 25 MB, 8 PNGs over 1 MB. The homepage hero — the LCP element, preloaded with `fetchpriority=high` — is a **2.8 MB PNG**. Format conversion alone typically yields 85–95% reduction on photographic content.

### P-3 · HIGH (bundle hygiene): three map stacks + two chart stacks coexist

- Maps: **mapbox-gl** (2 components; drags a 1.6 MB chunk + token dependency), **maplibre-gl** (2 components), **leaflet/react-leaflet** (~12 components).
- Charts: **recharts** (admin + articles) and **chart.js** (2 files: ResearchNetwork, CrossReferencesBrowser), plus d3 and react-force-graph-2d.
- No `manualChunks` in vite.config.ts, so vendor and app code cache-bust together on every deploy.

### L-1 · HIGH (logic): three sources of truth for articles, and the stale one wins

`articleResolver.resolveOceanicArticle()` checks, in order: (1) `oceanic_cards_8.json` (8 articles), (2) the static TS registry (28 articles), (3) the database (49 articles per Feb 2026 verification). **Static sources shadow the database**: any edit made via the admin dashboard to one of the 28/8 statically-registered articles will never render. Search runs both a static engine (`searchEngine.ts`) and a DB path (`useSearchArticles`) and merges. The cultural-term auto-highlighter reads only the static 108 KB file while the DB holds 1,699 enriched terms — highlighting drifts from the curated database. The repo's own merge-dedup tests (Phase AB) exist precisely because this duality keeps generating bugs.

### L-2 · MEDIUM (logic): language handling is inconsistent at the resolver seam

`getArticleTitle()` special-cases only hi/pa/ta despite 9 supported languages; `ResolvedArticle` carries `title_hi/title_pa/title_ta` as flat fields while the rest of the pipeline uses multilingual objects. `dek`/`content` are typed `any` at this seam.

### L-3 · LOW (dead code): 28 legacy article page components with zero importers

`src/pages/articles/*.tsx` (≈3,140 lines) are superseded by `ArticlesRouter → OceanicArticlePage`; spot-checks of 5 confirmed 0 importers each. They no longer ship in the bundle (unreferenced), but they mislead maintenance and AI-assisted editing.

### T-1 · MEDIUM (type safety): `strict: false`, `noImplicitAny: false`, 358 lint errors

ESLint reports 397 problems (358 errors, mostly `no-explicit-any`). This is the single biggest "future regression" risk: the resolver seams (L-1/L-2) are exactly where `any` hides bugs. Also `tsc --noEmit` currently trips on a syntax error inside `force-graph`'s bundled `.d.ts` (upstream), which blocks adding a typecheck CI gate until excluded or the dep is updated.

### S-1 · MEDIUM (security/cost): `gdrive-image-proxy` is an open proxy

It fetches **any** Google Drive file ID passed in `?id=` with no auth, no allowlist, no rate limit — an egress-cost and abuse vector (all other functions are gated). Should validate IDs against `srangam_media_assets` (or a stored allowlist) and add cache headers.

### D-1 · MEDIUM (documentation truth): README materially contradicts the code

README claims "Powered by Lovable AI Gateway (no API keys required)" — `ai-provider.ts` explicitly *never* uses the gateway (direct Gemini/OpenAI keys, by design). README says "800+ cultural terms" (DB: 1,699), "30+ articles" (49), and describes Google Neural2 TTS as primary while the code ships three TTS providers including ElevenLabs. CURRENT_STATUS/RELIABILITY docs are much more accurate — the README is the drifted artifact, and it's the file both humans and AI tools read first.

### O-1 · LOW (known, documented): `srangam_article_versions` has 0 rows — the append-only history invariant has never been exercised; 9 scaffolded tables are empty.

---

## Part 3 — Phased Roadmap (surgical; nothing breaks)

Ordering principle: each phase is independently shippable, verified by the existing test suite plus one new gate, and reversible. No schema changes until Phase 2, no visual changes until Phase 3.

### Phase 1 — Load-Time Surgery (highest ROI, lowest risk) — ✅ SHIPPED 2026-07-12

**Measured results (production build, gzip):**

| Asset | Before | After |
|---|---|---|
| Entry JS (critical path) | 630 KB (one 2.1 MB chunk) | 277 KB (171 app + 52 react + 34 supabase + 20 i18n, separately cacheable) |
| Hero LCP image | 2,765 KB PNG | 172 KB WebP (same 1536×1024 pixels, PNG fallback kept) |
| Homepage first-load total | ~3.4 MB | ~0.47 MB (**−86%**) |

All 35 unit tests pass post-change. Files touched: `src/data/articles/meta.ts` (new, generated), `scripts/generate-registry-meta.mjs` (new), `src/data/articles/index.ts`, `src/lib/{multilingualArticleUtils,unifiedArticleUtils,articleResolver}.ts`, `src/hooks/useSearchArticles.ts`, `src/components/language/CulturalTermTooltip.tsx`, `src/pages/Home.tsx`, `index.html`, `vite.config.ts`, `public/images/hero_indian-ocean_aerial_21x9_v1.webp` (new).

Three eager import chains were dragging ~2 MB of static data into the entry bundle; all three are now lazy:
1. `Home → multilingualArticleUtils → data/articles/index.ts` (28 full bodies) → cards now read generated `meta.ts` (~80 KB); bodies load per-article via `ARTICLE_CONTENT_LOADERS` dynamic imports in the resolver.
2. `HeaderNav → SearchResults → useSearchArticles → searchEngine` (full corpus on every page) → engine now dynamic-imported inside the query fn, loads only when the user searches.
3. `ArticleCard/GeomythologySection → CulturalTermTooltip → cultural-terms.ts` (~610 KB) → tooltip loads the dataset lazily on first mount (also fixed a latent rules-of-hooks violation); Home's below-the-fold sections are `React.lazy`.

Note: after editing/adding a static registry article, run `node scripts/generate-registry-meta.mjs` to refresh `meta.ts`.

**1.1 Split content out of the static registry.** Refactor `src/data/articles/index.ts` into (a) a lightweight metadata module (titles, deks, tags, slugs, SLUG_TO_ID_MAP — what cards/search suggestions actually need) and (b) per-article content loaded via `import()` only inside the resolver's step-2 fallback. No behavior change, no data moved. *Expected: entry gz ~630 KB → roughly 300–350 KB.*

**1.2 Image pipeline.** Convert the 8 >1 MB PNGs to AVIF+WebP with `<picture>`/srcset fallback; re-point the hero preload at the AVIF. *Expected: LCP asset 2.8 MB → ~200–300 KB.*

**1.3 Vendor chunking.** Add `manualChunks` (react vendor / supabase / i18n) for stable caching across deploys; dynamic-import the Supabase realtime path used only by admin job progress if feasible.

**1.4 Lock it in.** Run `article-perf.spec.ts` + Lighthouse before/after; once green, tighten the frozen budgets in RELIABILITY_AUDIT.md and add a bundle-size budget (e.g. size-limit: entry gz ≤ 400 KB) to CI so regressions can't land silently.

### Phase 2 — Single Source of Truth (logic firming) — est. 2–3 sessions

The core defect this phase removes: `articleResolver` checks static sources *before* the database, so admin-dashboard edits to any of the 36 statically-registered articles (8 JSON cards + 28 registry articles) silently never render. Order of operations matters — nothing gets deleted until parity is proven and fallback traffic is measured at zero.

**2.0 Pre-flight (blocking gate).** Run the SQL verification checklist (end of this doc) against live Supabase. Write `scripts/registry-parity-check.mjs`: for each of the 36 static articles, fetch the DB row by slug/slug_alias and diff title/dek/content per language plus pins vs `srangam_article_pins`. Output a parity report. **Pins parity matters most for the 8 JSON-card articles** — their pins/mla_refs live in `oceanic_cards_8.json`, while DB articles get pins from the gazetteer system; flipping resolver order before pins parity would silently drop map pins on those 8 pages.

**2.1 Invert resolver order.** In `articleResolver.ts`: query DB first (existing 10s timeout preserved), fall back to JSON card → static loader only on miss/timeout. Emit a structured event (`evt: 'static_fallback_serve', slug, reason`) matching the existing Phase AB logging style, so fallback traffic is measurable in production before step 2.6. Update `articles-merge-dedup` tests; the list-page merge (`mergeArticleSources`) already prefers DB on ties, so it needs no change.

**2.2 Backfill gaps found by 2.0.** Use the existing `markdown-to-article-import` pipeline (admin-gated) for missing/stale content; `backfill-article-pins` for pins. Re-run parity until clean.

**2.3 Unify search.** Compare static `searchEngine.ts` results vs the `srangam_search_articles_fulltext` RPC on a fixed query set (top themes, Sanskrit terms, multilingual queries). Close ranking gaps in the RPC (it already returns rank). Then make DB search primary in `useSearchArticles` and drop the static engine path. Term *search* coverage (1,699 DB terms vs ~800 static) actually improves.

**2.4 Unify term highlighting.** `culturalTermEnhancer.ts` + `CulturalTermTooltip` currently read the static ~800-term file while the DB holds 1,699 enriched terms. Serve a compact terms JSON from the DB — either a build-time export committed like `meta.ts`, or an edge function with `Cache-Control` (pattern exists in `get-public-config`). Keep the module-level cache pattern added in Phase 1.

**2.5 Delete dead code (verification-gated).** Candidates, each deleted only after a fresh 0-importer grep: the 28 legacy pages in `src/pages/articles/*.tsx` (keep `ArticlesRouter.tsx`; audit `enhanced/` subfolder separately), `src/pages/GeomythologyLandReclamation.tsx` (only referenced by a redirect), `src/components/navigation/TopNavigation.tsx` (documented as deprecated). After deletion, the 7 multi-MB PNGs referenced only by those pages become unreferenced → convert/remove (−22 MB deploy weight).

**2.6 Retire the static registry.** Once 2.1's fallback event shows zero production hits for 2+ weeks: put `ARTICLE_CONTENT_LOADERS` behind a kill-switch env flag (default off), leaving the content files in the repo as archival source.

**2.7 Type the seams.** Generalize `getArticleTitle` to all 9 languages via the multilingual object (drop hi/pa/ta special-casing — `title_hi/title_pa/title_ta` flat fields on `ResolvedArticle` go away); replace `any` on `dek`/`content`/`title` with `MultilingualContent`.

**Acceptance gates:** parity report clean · fallback events zero · search result-parity report reviewed · vitest + e2e green · admin edit to a formerly-static article visibly renders in production.

### Phase 3 — UI/UX Consolidation — est. 2 sessions

**3.1 One map stack — MapLibre.** Migrate the 2 mapbox-gl components (`MapboxPortMap.tsx`, `MapboxBujangNetwork.tsx`) to maplibre-gl, matching the patterns already used in `InteractiveAtlas.tsx` / `OceanMap.tsx` and the tile config in `src/lib/mapTiles.ts`. This kills the 1.6 MB mapbox chunk and the Mapbox token dependency. Then drop `mapbox-gl` from package.json. The ~12 leaflet components migrate opportunistically later — one per PR, screenshot-verified — leaflet is comparatively small (148 KB chunk) so this is cleanup, not perf-critical.

**3.2 One chart stack — recharts.** Migrate the 2 chart.js call sites (`src/pages/ResearchNetwork.tsx`, `src/pages/admin/CrossReferencesBrowser.tsx` — both already co-exist with recharts elsewhere in admin); drop `chart.js` and `@types`.

**3.3 Font diet.** 11 Google font families, most at 5 weights (300–700). Keep the async-load pattern (already correct); cut to 2–3 weights per script family (400/600/700 typically suffices for the existing type scale); verify no visual regression on Devanagari/Tamil/Gurmukhi article pages, then re-run the e2e perf budget.

**3.4 UX consistency pass.** Extend the article path's skeleton/error components (`ArticleFullSkeleton`, `ArticleError`) to Search and theme pages; align the generic "Loading sacred knowledge..." route fallback with per-page skeletons; re-run the responsive/tap-target test suite as the gate.

**Acceptance gates:** mapbox-gl and chart.js absent from lockfile · all map/chart pages screenshot-compared · e2e perf + responsive suites green.

### Phase 4 — Type Safety & CI Gates — est. 2 sessions (burndown can trail)

**4.1 Strictness ramp.** Current: `strict: false`, `noImplicitAny: false`, 358 lint errors (mostly `no-explicit-any`). Enable `noImplicitAny` first; fix by folder in priority order: `src/lib` (resolver seams — highest bug risk) → `src/hooks` → `src/components/oceanic` → rest. `strictNullChecks` second wave. Patch or exclude the syntactically-broken `force-graph` `.d.ts` (package.json `overrides` or a patch file) so `tsc --noEmit` runs clean and can gate CI.

**4.2 CI pipeline (GitHub Actions — repo is on GitHub).** One workflow: install → `eslint` → `tsc --noEmit` → `vitest run` → `vite build` → bundle budget (size-limit: entry chunk ≤ 300 KB gz, warn at 250) → Playwright perf spec (chromium, existing Fast-3G budgets). Every gate already runs locally; this wires them to PRs. Note Lovable pushes commits directly to main — configure the workflow to run on push as well as PR.

**Acceptance gates:** green pipeline on main · a deliberately-oversized test PR fails the size gate.

### Phase 5 — Ops, Security & Documentation Truth — est. 1–2 sessions

**5.1 Close the open proxy.** `gdrive-image-proxy` currently fetches any Drive file ID unauthenticated. Validate `?id=` against known asset IDs (`srangam_media_assets` lookup, or an allowlist synced from it), add `Cache-Control: public, max-age=86400` (cuts repeat egress), cap response size, and log rejected IDs via the existing observability helper. Export last-30-day function logs first to size real abuse exposure.

**5.2 Exercise the versioning invariant.** `srangam_article_versions` has 0 rows — the append-only invariant (RELIABILITY_AUDIT invariant #5) has never run. Add the write path on admin article updates (DB trigger, or explicit insert in the update flow), backfill current rows as v1, and add a unit/integration test. Then either document or drop the other 8 empty scaffold tables.

**5.3 Documentation truth pass.** README currently contradicts the code on: Lovable AI Gateway (code deliberately uses direct Gemini/OpenAI keys), term counts (800+ vs 1,699), article counts (30+ vs 49), TTS description (3 providers incl. ElevenLabs). Fix README; add a one-page `docs/ARCHITECTURE.md` ("how an article reaches the screen: DB → resolver → OceanicArticlePage → ProfessionalTextFormatter"); add a docs index marking superseded/historical docs as archived (60+ files currently, several stale).

**5.4 Asset cleanup (follows 2.5).** Convert/remove the 7 remaining multi-MB PNGs once their only referrers (dead legacy pages) are deleted; deploy artifact shrinks ~22 MB.

**Acceptance gates:** proxy rejects unknown IDs in production logs · `srangam_article_versions` grows on an admin edit · README claims spot-checked against code.

### Suggested sequencing

Phase 2 next (it fixes the only user-visible *correctness* bug — shadowed DB edits), then 4.2 (CI) early — it protects everything after it — then 3, then 4.1 burndown in the background, then 5. Each phase lands as one or more small PRs; nothing spans phases.

---

## Pre-Phase-2 live verification checklist (run in Supabase SQL editor)

```sql
-- counts & drift candidates
select count(*), status from srangam_articles group by status;
select count(*) from srangam_article_versions;        -- expect 0 today
select count(*) from srangam_cultural_terms;          -- expect ~1,699
-- parity: articles present in DB for every static-registry slug
select slug, slug_alias from srangam_articles
 where slug in ('maritime-memories-south-india', 'scripts-that-sailed', /* ...all 28 registry ids... */ 'ringing-rocks-rhythmic-cosmology');
```

Also export edge-function logs for `tts-stream-*`, `gdrive-image-proxy`, and `backfill-article-pins` (last 30 days) before Phase 5 to size the proxy-abuse and AI-cost surfaces from real traffic.
