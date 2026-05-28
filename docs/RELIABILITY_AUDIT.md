# Srangam Platform Reliability Audit

**Last Updated**: 2026-02-15 (Enterprise Hardening Roadmap — Phase C)

---

## Executive Summary

This document captures the findings from a comprehensive reliability and scalability audit of the Srangam platform. It defines core invariants that must never break, identifies critical paths, and documents failure modes with mitigation strategies.

---

## Core Invariants (DO NOT BREAK)

### 1. Unique Slugs and Slug Aliases

Every article must have:
- A unique `slug` column value
- A unique `slug_alias` column value (if set)

**Enforcement:**
- Unique constraint on `slug` column
- Unique constraint on `slug_alias` column
- Import function checks for duplicates before insert

**Violation Impact:** Broken article URLs, 404 errors, SEO issues

### 2. Row-Level Security (RLS)

All tables with user data must have RLS enabled:
- Unauthenticated users: Read-only access to published articles
- Authenticated users: CRUD on own data
- Admins: Full access via `user_roles` table

**Critical Tables with RLS:**
- `srangam_articles` - Admin-only write, public read (published)
- `srangam_tags` - Admin-only write, public read
- `srangam_cultural_terms` - Authenticated write, public read
- `srangam_cross_references` - Authenticated write, public read
- `user_roles` - Admin-only access

**Violation Impact:** Data breach, unauthorized modifications

### 3. Usage Count Integrity

Usage counters must accurately reflect actual usage:
- `srangam_tags.usage_count` - Number of articles using tag
- `srangam_cultural_terms.usage_count` - Number of term occurrences

**Enforcement:**
- Database triggers on article updates
- `update_tag_stats` function with `SET search_path = 'public'`

**Violation Impact:** Incorrect analytics, broken AI context

### 4. Cross-Reference Integrity

Cross-references must maintain referential integrity:
- Source and target articles must exist
- No duplicate references
- Bidirectional references should be symmetric

**Enforcement:**
- Foreign key constraints on `source_article_id` and `target_article_id`
- Unique constraint on (source, target, type) tuple

**Violation Impact:** Broken "Related Articles" sections, orphaned references

### 5. Immutability of Historical Data

Version history must be preserved:
- `srangam_article_versions` - Previous article states (**⚠️ 0 rows as of Feb 2026 — this invariant is untested**)
- `srangam_markdown_sources` - Original markdown content (38 rows; 11 articles missing markdown)

**Violation Impact:** Lost audit trail, reproducibility failures

**Known Gap:** `srangam_article_versions` has never been populated. The append-only invariant exists in policy but has never been exercised in production. This should be verified when the versioning feature is activated.

### 6. Canonical URL Uniqueness (Phase F — February 2026)

Every article MUST have exactly one canonical URL at `/articles/:slug`. Root-level routes (e.g. `/monsoon-trade-clock`) MUST redirect to the canonical path using `<Navigate to="/articles/:slug" replace />`. No article content may be rendered at two different URLs.

**Enforcement:**
- All ~27 legacy root-level article routes in `App.tsx` are `Navigate` redirects
- `ArticlesRouter` handles all `/articles/*` routing
- `OceanicArticlePage` emits `<link rel="canonical" href="https://srangam.nartiang.org/articles/{slug}" />`
- Sitemap edge function only includes `/articles/:slug` paths for articles

**Violation Impact:** Google flags duplicate content, splits page authority, reduces indexing

### 7. Article Resolver Source Chain (Phase G — March 2026)

`resolveOceanicArticle(slug)` MUST check three sources in order:
1. `oceanic_cards_8.json` — 8 oceanic card articles (fast, local)
2. `MULTILINGUAL_ARTICLES` registry — 28 full multilingual articles (fast, local)
3. Database `srangam_articles` with `status=published` (async, network)

**Enforcement:**
- `src/lib/articleResolver.ts` contains the ordered lookup chain
- `MULTILINGUAL_ARTICLES` fallback prevents Phase F redirect regressions
- Database query uses `.or()` to match both `slug` and `slug_alias`

**Violation Impact:** Articles return "not found" despite having full content in the codebase

### 8. Slug Deduplication in Article Listings (Phase G — March 2026)

`mergeArticleSources()` MUST deduplicate articles when the same content exists in both JSON and database sources. Database version is preferred. Slug keys are normalized by stripping `/articles/` prefix.

**Enforcement:**
- `src/lib/unifiedArticleUtils.ts` uses `Set`-based deduplication
- DB articles are added first (preferred), JSON articles only if not already seen

**Violation Impact:** Duplicate article cards on listing/browse pages

## Critical Paths

### 1. Markdown Import Pipeline

**Path:** Admin Dashboard → `markdown-to-article-import` → Database

**Components:**
- YAML frontmatter parsing
- Slug generation and normalization
- Cultural term extraction
- Cross-reference calculation
- Tag generation (AI)

**Failure Modes:**
- Invalid YAML syntax → Returns `SRANGAM-E002`
- Duplicate slug → Returns `SRANGAM-E001`
- AI rate limit → Returns 429 with fallback
- Database timeout → 10s timeout with error state

**Monitoring:**
- Edge function logs with timing
- Import success/failure counts in dashboard

### 2. Article Resolution

**Path:** URL slug → `resolveOceanicArticle()` → Article data

**Components:**
- `src/lib/articleResolver.ts` - Main resolver
- `src/lib/slugResolver.ts` - Centralized slug lookup
- Supabase query with OR condition

**Failure Modes:**
- Query timeout (10s) → Shows error with retry button
- Article not found → Shows 404 page
- Network error → Shows error state

**Monitoring:**
- Query timing logs: `[articleResolver] Query completed in Xms`
- Resolution logs: `[slugResolver] Resolved: slug → id`

### 3. Tag Generation

**Path:** Article content → `generate-article-tags` → Normalized tags

**Components:**
- OpenAI/Lovable AI GPT-4o-mini integration
- Fuzzy matching against existing taxonomy
- Tag normalization and deduplication

**Failure Modes:**
- AI rate limit → 429 response
- No API key → 500 with configuration error
- Empty content → Returns default tags

### 4. Cross-Reference Calculation

**Path:** Article import → Tag/theme comparison → `srangam_cross_references`

**Current Algorithm (O(N)):**
1. Load all published articles
2. For each article: compare tags (≥2 shared), check theme
3. Insert bidirectional references

**Performance Note:** With 49 articles (Feb 2026), takes ~500ms. Threshold for optimization is >1s. Well within capacity.

**Future Optimization (Phase 19b):**
- Add `tag_vector` column with GIN index
- Use text search for similarity matching
- Reduce to O(log N) complexity

### 5. Audio Narration

**Path:** Article → TTS Edge Function → Google Drive cache → Audio playback

**Components:**
- ElevenLabs (primary English)
- OpenAI TTS (fallback English)
- Google Cloud TTS (Indic languages)
- `tts-save-drive` for caching

**Failure Modes:**
- Provider 401/403 → Auto-fallback to next provider
- Rate limit → 429 with retry guidance
- Memory limit → Chunked processing (8 chunks max)

---

## Performance Benchmarks

### Target SLAs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Article page load | < 2s | ~1.5s | ✅ |
| Slug resolution | < 100ms | ~50ms | ✅ |
| Cross-ref calculation | < 500ms | ~300ms | ✅ |
| Tag generation | < 5s | ~3s | ✅ |
| Cultural term import | < 500ms | ~2s | ⚠️ (N+1) |

### Thresholds for Action

| Metric | Warning | Critical |
|--------|---------|----------|
| Article count | 100 | 500 |
| Cross-references | 2,000 | 10,000 |
| Cultural terms | 5,000 | 20,000 |
| Tags | 500 | 2,000 |

---

## Known Issues and Mitigations

### 1. Cultural Terms N+1 Pattern

**Issue:** Each term extraction triggers individual SELECT + INSERT
**Impact:** Slow imports with many terms
**Mitigation (Phase 19c):** Batch upsert with single query

### 2. Cross-Reference O(N) Scaling

**Issue:** Full article scan on every import
**Impact:** Import time grows linearly with article count
**Mitigation (Phase 19b):** `tag_vector` column with GIN index

### 3. Tag Categorization One-Shot

**Issue:** AI has no memory of previous categorizations
**Impact:** 29% of tags remain uncategorized
**Mitigation (Phase 19a):** Include historical examples in prompt

### 4. Client-Side Data Processing

**Issue:** `useAllArticles` fetches entire table
**Impact:** Slow initial load at scale
**Mitigation (Phase 19d):** Server-side pagination

---

## Rollback Procedures

### Edge Function Rollback

1. Navigate to Lovable Cloud → Functions
2. Select the affected function
3. View deployment history
4. Redeploy previous version

### Database Rollback

Schema changes are additive - no destructive migrations.

To remove Phase 19b columns:
```sql
DROP INDEX IF EXISTS idx_articles_tag_vector;
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS tag_vector;
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS tags_hash;
```

---

## Security Considerations

### Verified RLS Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| srangam_articles | Public (published) | Admin | Admin | Admin |
| srangam_tags | Public | Admin | Admin | Admin |
| srangam_cultural_terms | Public | Auth | Auth | Auth |
| srangam_cross_references | Public | Auth | Auth | Auth |
| srangam_article_metadata | Public (published) | Auth | Auth | Auth |
| srangam_context_snapshots | Admin | Admin | — | — |
| user_roles | Own/Admin | Admin | Admin | Admin |

**✅ Phase B complete (February 2026)**: Overly permissive write policies tightened to `has_role(auth.uid(), 'admin')` on 10 tables: `srangam_articles` (redundant ALL dropped), `srangam_article_analytics`, `srangam_article_evidence`, `srangam_article_metadata`, `srangam_article_versions`, `srangam_correlation_matrix`, `srangam_cultural_terms`, `srangam_inscriptions`, `srangam_purana_references`, `srangam_translation_queue`. Edge functions using service role key are unaffected.

**Deferred** (not flagged by linter, `auth.role() = 'authenticated'` — stricter than `true`):
- `srangam_cross_references`, `srangam_markdown_sources`, `srangam_article_chapters`, `srangam_book_chapters`, `srangam_article_bibliography`, `srangam_bibliography_entries`

### False Positive Security Warnings (Permanently Acknowledged)

The following warnings are acknowledged and safe:
- `spatial_ref_sys` RLS disabled — PostGIS system catalog table, not user data
- `st_estimatedextent` mutable search path (×3) — PostGIS C-language system functions, cannot be altered
- `geography_columns` / `geometry_columns` no RLS — PostGIS system views
- `user_roles` public exposure — Has proper RLS (3 policies verified)
- Extensions in public schema (PostGIS) — Required by geospatial features
- Leaked password protection disabled — Platform-level setting, not configurable via migration

---

## Phase C: Logic Hardening (February 2026) ✅

### Structured Error Schema

All 8 key edge functions now return standardized error responses via `_shared/error-response.ts`:

```json
{
  "success": false,
  "error": {
    "code": "E_VALIDATION | E_DUPLICATE | E_TIMEOUT | E_RATE_LIMIT | E_CONFIG | E_INTERNAL",
    "type": "validation | conflict | timeout | external_service | config | internal",
    "message": "Human-readable error message",
    "hint": "Actionable guidance for the admin"
  }
}
```

**Functions updated**: `markdown-to-article-import`, `generate-article-tags`, `enrich-cultural-term`, `backfill-bibliography`, `detect-duplicate-articles`, `generate-article-seo`, `batch-import-from-github`, `analyze-tag-relationships`.

**Backward compatibility**: Functions that return extra fields in errors (e.g., `tags: []`, `is_duplicate: false`, `metaDescription`) continue returning those fields alongside the new structured `error` object.

### Front-matter Validation

The import pipeline now validates before any database writes:
- **Language code**: Must be one of `en`, `hi`, `pa`, `ta`, `te`, `ml`, `kn`, `bn`, `gu`, `mr`, `sa`
- **Title**: Required, max 500 characters
- Invalid input returns `E_VALIDATION` with actionable hint

### Slug Concurrency Guard

- **Overwrite mode**: Uses atomic `.upsert({ onConflict: 'slug' })` — eliminates race window
- **Non-overwrite mode**: Catches Postgres `23505` specifically and returns `E_DUPLICATE` with HTTP 409 — no raw database errors leak to frontend

### Frontend Error Handler

`MarkdownImport.tsx` reads structured `error.code` first, falling back to legacy string-matching for backward compatibility.

---

## Phase D: Unified Search (February 2026) ✅

### Problem Fixed

Search page (`/search`) and navigation bar search dropdown only queried hardcoded JSON data (`MULTILINGUAL_ARTICLES` / `ARTICLES`), missing 41 published database articles (e.g., "Patiala", "Hinglaj"). The Articles browse page already worked correctly using `useAllArticles` + `mergeArticleSources`.

### Solution

Both search surfaces now merge JSON articles with database articles via `useAllArticles` hook:

- **`src/pages/Search.tsx`**: After existing `searchArticles()` call for JSON results, DB articles are filtered client-side with relevance scoring (title: 80, slug: 60, tags: 30, excerpt: 20, theme: 10). Results are deduplicated by ID and merged.
- **`src/components/navigation/SearchResults.tsx`**: Merges `ARTICLES` (JSON) with `useAllArticles()` (DB) before filtering. Increased result limit from 5 to 8.

### Deduplication

A `Set` of JSON result IDs is built first; DB articles with matching IDs are skipped. This prevents duplicate entries when an article exists in both sources.

### Performance

- `useAllArticles` has 5-minute `staleTime` via TanStack Query -- no redundant DB hits
- Client-side filtering of 41 articles is negligible overhead
- No new API calls, edge functions, or schema changes

### Future (Phase E2)

Semantic/vector search using existing `srangam_search_articles_semantic` RPC and embeddings column.

---

## Phase E1: Server-Side Full-Text Search (February 2026) ✅

### Problem Fixed

Phase D's unified search downloaded ALL articles (including full `content` JSONB) to the client for filtering. Navigation bar had no live search dropdown — users had to submit and wait for page load.

### Solution

Server-side full-text search using Postgres `tsvector` + GIN index via `srangam_search_articles_fulltext` RPC function:

- **`search_vector` column**: Trigger-maintained tsvector combining title (A), tags (A), dek (B), theme (B), slug (B), author (C)
- **GIN index**: `idx_srangam_articles_search_vector` for sub-millisecond lookups
- **RPC function**: `srangam_search_articles_fulltext(search_query, result_limit)` using `websearch_to_tsquery` with ILIKE fallback on title/slug
- **`SECURITY DEFINER`** with `SET search_path = 'public'` and internal `status = 'published'` filter
- Returns only metadata fields (no `content` JSONB) — major bandwidth reduction

### Architecture

```
Search page / Nav dropdown
  → useSearchArticles hook
    → srangam_search_articles_fulltext RPC (server-side, GIN-indexed)
    → searchArticles() JSON (client-side, legacy)
    → Deduplicate + merge + sort by rank
```

### Performance

| Metric | Before (Phase D) | After (Phase E1) |
|--------|------------------|-------------------|
| Data transferred per search | ~200KB+ (all articles) | ~2-10KB (matching rows only) |
| Query time at 500 articles | ~50ms+ client-side | ~2ms server-side (GIN) |
| Nav bar feedback | None (page navigation) | Live dropdown as you type |

### Nav Bar Live Dropdown

`HeaderNav.tsx` now renders `SearchResults` as a positioned dropdown when input has ≥2 characters. Closes on submit (navigates to `/search`), on blur (200ms delay for click), or when a result is clicked.

### Rollback

```sql
DROP INDEX IF EXISTS idx_srangam_articles_search_vector;
DROP TRIGGER IF EXISTS trg_srangam_articles_search_vector ON srangam_articles;
DROP FUNCTION IF EXISTS srangam_update_search_vector();
DROP FUNCTION IF EXISTS srangam_search_articles_fulltext(text, integer);
ALTER TABLE srangam_articles DROP COLUMN IF EXISTS search_vector;
```

---

## Monitoring Checklist

- [ ] Edge function error rate < 1%
- [ ] Query timeout errors = 0
- [ ] Import success rate > 95%
- [ ] Tag categorization rate > 90%
- [ ] Cross-reference orphan count = 0
- [ ] Usage count accuracy = 100%
- [ ] Search covers both JSON and DB articles

---

## Phase H Invariant — Markdown Import Pipeline

**Invariant:** PUA characters (U+E000–U+F8FF), `citeturn…` placeholder
tokens, and unfenced mermaid blocks **MUST NOT** reach `marked.parse`.
The importer enforces this by composing a pure-function pipeline
(`supabase/functions/_shared/markdown-pipeline.ts`):

```
sanitizeEscapes  →  stripExportArtifacts  →  normalizeDiagrams  →  marked.parse
```

Modelled on Pandoc / Quarto Lua filter chains. Each step is independently
testable, idempotent, and side-effect free. Future importers (DOCX bridge,
GitHub batch import) MUST reuse `runImportPipeline` rather than
re-implement sanitisation.

**Frontend invariant:** fenced ```mermaid blocks are rendered exclusively
through `<MermaidBlock>` (`src/components/articles/enhanced/MermaidBlock.tsx`),
which lazy-imports `mermaid`, runs with `securityLevel: 'strict'`, reserves
height to eliminate CLS, and re-renders on light/dark theme changes.

---

## Phase H.1 Invariants — Defence-in-Depth, Observability, Performance

### Sanitiser invariants (defence-in-depth)

PUA / `citeturn…` artefacts MUST be stripped at **two** independent layers:

1. **Ingest layer** — `runImportPipeline` (shared edge module) is invoked
   by every importer (`markdown-to-article-import`,
   `batch-import-from-github`). New importers MUST call it; never
   re-implement sanitisation.
2. **Render layer** — `sanitizeSnippet` / `stripExportArtifacts` are
   called wherever article text crosses a presentation surface:
   - `src/components/oceanic/OceanicArticlePage.tsx` (`<Helmet>` title /
     description / OG tags)
   - `src/hooks/useSearchArticles.ts` (search snippets + highlighted hits)
   - `supabase/functions/generate-article-og` (image-prompt construction)
   - `supabase/functions/generate-article-seo` (meta description fallback)

Either layer is sufficient on its own; both are required so a regression
in one cannot reach end users. Frontend (`src/lib/textSanitizer.ts`) and
edge (`supabase/functions/_shared/text-sanitizer.ts`) implementations are
**string-identical regex pairs**, kept in sync by Deno test
`text-sanitizer: edge re-export matches pipeline impl`.

### Observability log shape (OpenTelemetry-aligned)

Every importer stage emits **exactly one** structured JSON line via
`stage()` from `supabase/functions/_shared/observability.ts`:

```json
{ "evt": "import_stage", "stage": "<name>", "ms": 12, "ts": "<ISO>", "...": "..." }
```

Each import run terminates with a single `import_complete` summary line
carrying total duration and per-stage timings. Free-form `console.log`
for per-import events is forbidden — query stability depends on the
shape above. Stage names are stable identifiers
(`pipeline_clean`, `frontmatter`, `marked_parse`, `metadata_extract`,
`db_upsert`); renaming is a breaking change for log queries.

### Performance invariants

- **`mermaid` (~600 KB)** MUST remain a **dynamic import** inside
  `MermaidBlock`. Articles without diagrams MUST NOT pay its bundle cost.
  Verify with `bun run build` — `mermaid` should appear in its own chunk,
  never in the main entry.
- **Mermaid render timing** is exposed via `performance.measure('mermaid:<id>')`
  so DevTools / Lighthouse / RUM tools see it natively. In dev
  (`import.meta.env.DEV`) a `[mermaid]` console line reports
  `{ importMs, renderMs, totalMs }`.
- The shared pipeline (`runImportPipeline`) is O(n) on text length and
  runs once per import. Adding new regex stages MUST preserve linearity
  and idempotency (`pipeline(pipeline(x)) === pipeline(x)`), enforced by
  Deno test `runImportPipeline: idempotent`.

### Test coverage contract

`supabase/functions/markdown-to-article-import/pipeline_test.ts` (18
tests) is the canonical regression suite for the import pipeline. It
runs without network or DB access via `supabase--test_edge_functions`.
Any change to `markdown-pipeline.ts` or either `text-sanitizer.ts` MUST
keep this suite green.

---

## Phase H.2 — Geographical Context (Gazetteer + Pins)

### Invariants (DO NOT BREAK)

1. **Gazetteer is canonical.** All article ↔ place links MUST go through
   `srangam_gazetteer` (one row per real-world place, with diacritic-correct
   `canonical_name`, `name_variants[]`, lat/lon, `precision`).
   Free-text place strings on `srangam_article_evidence` remain for
   provenance but MUST NOT be rendered on maps.
2. **Pin storage is idempotent.** `srangam_article_pins` uses the composite
   PK `(article_id, gazetteer_id)`. The backfill function MUST upsert with
   `onConflict: 'article_id,gazetteer_id'` so re-running is safe.
3. **Confidence is a closed enum.** `'A' | 'B' | 'C'` only.
   - `A` — direct evidence row (`srangam_article_evidence.place` matched).
   - `B` — deterministic gazetteer regex matched in article content.
   - `C` — AI NER (`_shared/ai-provider.ts`) suggested + matched.
   Adding a new tier requires a migration and a docs update here first.
4. **Tenant-aware AI only.** `_shared/ai-provider.ts` MUST call the user's
   `GEMINI_API_KEY` (primary, `gemini-2.5-flash`) and `OPENAI_API_KEY`
   (fallback, `gpt-4o-mini`) directly. The Lovable AI Gateway MUST NOT be
   used for pin extraction — billing and observability already live on the
   user's own provider accounts.
5. **Backfill is admin-only.** `backfill-article-pins` validates the caller's
   JWT and checks `user_roles.role = 'admin'` server-side. Never expose to
   anonymous traffic.
6. **Map is lazy.** Leaflet (~150 kB gz) MUST stay behind a `React.lazy`
   boundary (`ArticleMiniMap`) and the user MUST opt in via the
   "View Interactive Map" toggle. Articles without pins MUST NOT mount the
   component or render the card at all.

### Performance budgets

- Article-page critical path bundle MUST NOT include `leaflet` or
  `leaflet/dist/leaflet.css`. Verify with `bun run build` — both belong
  to a separate chunk.
- Pin loader (`src/lib/articlePins.ts`) does **one** Supabase round-trip
  per article (join `srangam_article_pins` → `srangam_gazetteer`),
  hard-bounded at 4 s. On timeout it returns `[]` so the article still
  renders.
- `ArticleMiniMap` emits `performance.measure('article-map:<slug>', …)`,
  parallel to Phase H.1's `mermaid:<id>` measure, so DevTools / RUM see
  map render cost natively.

### Observability log shape (extends Phase H.1)

`backfill-article-pins` emits the same `stage()` lines as the importer,
plus a per-article summary:

```json
{ "evt": "pin_stage", "stage": "pin_evidence|pin_scan|pin_ai|pin_upsert",
  "article_id": "...", "ms": 12, "ok": true, "ts": "<ISO>" }

{ "evt": "pin_complete", "article_id": "...", "slug": "...",
  "inserted": 7, "pins_a": 2, "pins_b": 4, "pins_c": 1,
  "total_ms": 1820, "ts": "<ISO>",
  "ai": { "provider": "gemini", "model": "gemini-2.5-flash",
          "prompt_tokens": 512, "completion_tokens": 128,
          "latency_ms": 940, "cost_usd_estimate": 0.000077 } }
```

Renaming `evt`, `stage`, or top-level field names is a breaking change
for cost dashboards and log queries.

---

## 2026-05-17 baseline — Phase K.3 (Mobile-viewport invariant MV-01)

**MV-01 — Mobile-viewport invariant.** No article-body component may
emit a `min-w-[≥640px]` element that is not wrapped in an
`overflow-x-auto` container (or a Radix `ScrollArea` with a horizontal
scrollbar). Violations cause the document body to grow to the inner
min-width on mobile, forcing the browser to zoom out and surface the
desktop layout — which the user perceives as "site opened in desktop
mode on phone."

### Audited offenders (2026-05-17)

| File                                                         | Element        | Status        |
| ------------------------------------------------------------ | -------------- | ------------- |
| `src/components/geology/DeepTimeTimeline.tsx`                | `min-w-[1200px]` | Wrapped in `overflow-x-auto` (Phase K.3) |
| `src/components/oceanic/CorrelationTable.tsx`                | `min-w-[300px]` etc. | Already wrapped at line 111 |
| `src/components/i18n/GatedLanguageSwitcher.tsx`              | `min-w-[200px]`  | `max-w-full` added (Phase K.3) |
| `src/components/i18n/EnhancedLanguageSwitcher.tsx`           | `min-w-[120px]`  | Safe (<640 px), no change |
| `src/components/narration/NarrationControls.tsx`             | `min-w-[120px]`  | Safe inside flex, no change |

### Regression check

When adding a new article-body component with a fixed `min-w-[…]`
element, grep for `min-w-\[` in `src/components/` and re-confirm each
hit either (a) sits inside `overflow-x-auto` / `ScrollArea`, or (b)
uses a value `< 640px` and lives in a flex container with `max-w-full`.

---

## 2026-05-17 update — MV-01 Verification (Phase L.3)

Two complementary nets enforce MV-01:

1. **Automated (source scan).** `src/__tests__/responsive/article-overflow-360.test.ts`
   walks `src/**/*.{ts,tsx}` and fails CI if any file declares a Tailwind
   `min-w-[Npx]` (N ≥ 360) without an `overflow-x-auto`/`overflow-auto`
   sibling in the same source file. Catches the exact regression class
   that broke mobile in Phase K (fixed-width child rendered into article
   body without a horizontal scroll container).

2. **Manual cross-browser sweep (pre-release).** On the Bhṛgu/Aṅgiras
   article (`/articles/rishi-genealogies-vedic-tradition`) at 360×640:

   - [ ] iOS Safari 17 — no horizontal page scroll; `DeepTimeTimeline`
     scrolls internally only.
   - [ ] Android Chrome 124 — same.
   - [ ] Samsung Internet 24 — same.
   - [ ] Language switcher trigger fits within viewport.

`ArticlePage.tsx` exposes a stable `[data-testid="article-body"]` anchor
for future Playwright instrumentation.

---

## 2026-05-17 — Phase M Security Hardening

Enterprise resolution of all six Security panel findings. Aligned with `mem://security/rls-write-policy-standardization` and `mem://security/database-function-hardening`.

### M.1 — jspdf upgraded
- `^3.0.2` → `^3.0.4`. Only consumer is `src/lib/pdfGenerator.ts`, which uses `new jsPDF`, `text`, `addImage`, `save` — none of the vulnerable surfaces (`AcroForm`, `addJS`, `FreeText`, BMP/GIF, XMP).
- If supply-chain scanner re-flags v3, upgrade to `^4.2.1` (API unchanged for our surface).

### M.2 — user_roles role-enumeration surface closed
- Migration dropped `"Users can view their own roles"` SELECT policy on `public.user_roles`.
- `src/contexts/AuthContext.tsx#checkAdminRole` now calls `supabase.rpc('has_role', { _user_id, _role: 'admin' })`. Returns only a boolean. SECURITY DEFINER with `SET search_path = public`.
- `"Admins can view all roles"` policy preserved (Admin Dashboard listing of all roles).
- Only client reader of `user_roles` was `AuthContext.tsx`; switching to RPC removes the only direct-read code path.

### M.3 — HIBP leaked-password protection enabled
- `password_hibp_enabled: true`. Other auth posture preserved: signups open, no anonymous, email verification still required.
- Verify: signup with `password123` → API rejection.

### M.4 — Accepted Risks

| Item | Reason |
| ---- | ------ |
| `public.spatial_ref_sys` RLS disabled | PostGIS extension-owned reference table; only standard EPSG entries; app never writes. RLS on extension tables is contraindicated by Supabase and breaks PostGIS internals. |

Recorded in security memory; do not re-flag.

### Verification matrix

- [x] Migration applied — `DROP POLICY ... user_roles` succeeded.
- [x] HIBP enabled via `configure_auth`.
- [x] `jspdf` 3.0.4 installed, dev server restarted clean.
- [x] `AuthContext.checkAdminRole` routed through `has_role` RPC.
- [ ] Manual: admin sign-in → admin sidebar visible.
- [ ] Manual: non-admin sign-in → no admin nav, no console errors.
- [ ] Manual: PDF export from Reading Room renders.
- [ ] Manual: signup with weak password rejected.

---

## Phase N — Hardening Pass (Post-Phase-M Re-scan, 2026-05-17)

Re-scan after Phase M surfaced 5 errors + 8 warnings + 1 info that were always present but masked by prior policy ordering. Phase N resolves every finding in 5 reversible commits. See `.lovable/plan.md` for the full plan.

### N.1 — Draft articles hidden from anon
- Dropped `"Anyone can view articles"` (`USING(true)`) on `srangam_articles`.
- Added `"Admins can view all articles"` (admin-only via `has_role`).
- Public anonymous reads now flow exclusively through `"Public read published articles"` (`status='published'`).

### N.2 — Admin-jobs Realtime locked to admins
- Kept `srangam_admin_jobs` in `supabase_realtime` publication so `useAdminJob` keeps live UI.
- Added restrictive `realtime.messages` SELECT policy requiring `has_role(auth.uid(),'admin')`.

### N.3 — Server-side auth gate on edge functions
- New `_shared/auth-gate.ts` exports `requireUser()` and `requireAdmin()`.
- `requireUser` applied to `tts-stream-openai|elevenlabs|google` (cost back-stop for admin-only narration).
- `requireAdmin` applied to all write/cost/generation functions (19 total). Public exceptions documented: `generate-sitemap`, `gdrive-image-proxy`, `get-public-config`, `imaging-handoff-token`.

### N.4 — `jspdf` ≥ 4.2.1
- All v3 CVEs cleared. Stable API surface (`new jsPDF`, `text`, `addImage`, `save`) used in `pdfGenerator.ts`.

### N.5 — `ProtectedRoute` admin gate
- `if (!user || !isAdmin) → /auth`. Backed by Phase M `has_role` RPC.

### N.6 — RLS tightening
- `narration_analytics`: SELECT restricted to owner or admin (anon row read closed).
- `srangam_audio_narrations`: writes restricted to admin or service-role.
- Editorial content tables (book chapters, article chapters, bibliography entries, article bibliography, markdown sources, cross references): blanket `authenticated` write replaced with admin-only.

### N.7 — `SECURITY DEFINER` EXECUTE lockdown
- Revoked from `public/anon/authenticated`: `update_tag_stats`, `srangam_update_updated_at`, `srangam_increment_bibliography_usage`, `srangam_increment_term_usage`, `increment_term_usage_counts`, `analyze_tag_cooccurrence`, `get_purana_statistics`.
- Kept: `has_role`, `srangam_search_articles_fulltext`, `srangam_search_articles_semantic`.

### N.8 — Storage bucket listing closed
- Dropped public `SELECT` policies on `storage.objects` for `srangam-articles` and `og-images`.
- Replaced with admin-only `SELECT` policies. Direct CDN URLs still serve public files.

## Accepted Risks (updated)

- PostGIS `spatial_ref_sys` — extension-owned reference table, no PII, no application writes. RLS not enabled by design.

## Invariants Added (Phase N)

11. Every cost-bearing edge function requires a valid Supabase JWT (and admin role where applicable).
12. `srangam_articles` SELECT for anon = `status='published'` only.
13. `realtime.messages` requires `has_role(auth.uid(),'admin')` for SELECT.
14. Public buckets serve files via CDN URLs; object listing is admin-only.
15. `SECURITY DEFINER` functions are EXECUTE-restricted by default; only explicitly listed RPCs are callable by `anon`/`authenticated`.

---

## Phase O — Residual Security Triage (2026-05-17)

Re-scan after Phase N flagged 14 items; live `pg_policies` / `pg_proc` inspection found 6 stale, 3 informational/accepted, and 5 real. Real ones fixed in one migration + one follow-up migration + ~6 LOC FE.

### O.1 — `srangam_book_chapters` RLS `OR true` bug
- Dropped policy with `((status='published') OR true)`; replaced with `status='published'` for `public` and a separate admin-all-rows SELECT.

### O.2 — `srangam_audio_narrations` cost/metadata leak
- Created `public.srangam_audio_narrations_public` view (`security_invoker=on`) exposing only playback-safe columns plus `content_hash`/`character_count` needed for the in-app cache lookup. `cost_usd`, `provider_metadata`, `google_drive_file_id` excluded.
- Base table SELECT restricted to `has_role(auth.uid(),'admin') OR auth.role()='service_role'`.
- `NarrationService.getCachedAudio` now reads from the view.

### O.3 — `srangam-articles` bucket write hardening
- Replaced authenticated-wide INSERT/UPDATE/DELETE policies on `storage.objects` with admin-only equivalents (`has_role(auth.uid(),'admin')`). Public CDN reads unchanged.

### O.4 — SECURITY DEFINER EXECUTE lockdown (residual)
- Revoked EXECUTE on `analyze_tag_cooccurrence` and `get_purana_statistics` from `PUBLIC/anon/authenticated`. Service-role tooling unaffected.

### O.5 — Markdown XSS hardening
- Added `rehype-sanitize@6.0.0`. `ProfessionalTextFormatter` now applies `[rehypeRaw, [rehypeSanitize, articleSanitizeSchema]]` at every render site. Schema permits footnote anchors, `data-*` cultural-term markers, `colSpan/rowSpan`, `dir/lang`, `className`; strips `<script>`, event handlers, `javascript:` URLs.

## Accepted Risks (updated 2026-05-17)

- PostGIS `spatial_ref_sys` — extension-owned, no RLS by design.
- PostGIS `st_estimatedextent` SECURITY DEFINER — extension-owned, no app-data impact.
- PostGIS extensions installed in `public` schema — Supabase project default.
- Function-search-path warnings on built-in PostGIS functions — not user-defined; not actionable.

## Invariants Added (Phase O)

16. Public consumers of audio narration metadata MUST read `srangam_audio_narrations_public`; base table reads require admin or service role.
17. Article HTML rendering MUST flow through `rehype-sanitize` with the project's allow-list schema.
18. Book chapters with `status != 'published'` are visible only to admins.

---

## 2026-05-28 — Phase P (Mobile prose overflow invariant MV-02)

**Context.** Field report (`srangam.nartiang.org` at 384 px CSS, DPR 2.81): the Satīsar article was clipped at the right edge — H1, dek, body paragraphs, and the `Jalodbhava` cultural-term chip all extended past the viewport. The `<article>` itself was wider than `window.innerWidth`. MV-01 was intact (the `min-w-[900px]` table at `ProfessionalTextFormatter.tsx:407` still sits inside `overflow-x-auto`) — this is a **different** overflow class that MV-01 does not cover.

### Root cause

Three compounding presentation defects:

1. **Article container had no overflow guard** — `ArticlePage.tsx:70` declared `max-w-4xl mx-auto px-4 py-8 relative` with no `min-w-0` (so a `min-content` child could inflate it) and no `overflow-x-clip` (so an escaping descendant pushed the page scroll).
2. **Double horizontal gutter** — `ArticlePage.tsx:70` applied `px-4`, then `ArticlePage.tsx:145` wrapped content in `<div class="max-w-4xl mx-auto px-6">`. 16 + 24 = 40 px of side padding on a 384 px viewport left only 344 px for `prose-xl` (20 px body).
3. **Cultural-term chip rendered `inline-block`** — `CulturalTermTooltip.tsx:59` (`relative inline-block …`) prevented the row "chip + space + 22-char token" from breaking; `overflow-wrap: break-word` only breaks tokens that *alone* exceed the line, not chip-adjacent rows.

### MV-02 — Mobile prose overflow invariant

No article-body component may emit text whose natural inline row exceeds the viewport width. Specifically:

- `<article data-testid="article-body">` MUST declare `overflow-x-clip` (with bracketed `[overflow-x:clip]` fallback for older Android WebView) and `min-w-0 w-full`.
- `.article-content` paragraphs, list items, and `h1`–`h3` MUST use `overflow-wrap: anywhere` at `@media (max-width: 640px)` (scoped to avoid desktop rhythm shifts).
- Cultural-term chips, inline anchors, and `<code>` inside `.article-content` MUST be `inline` (never `inline-block`) at mobile widths and MUST cap at `max-width: 100%`.
- Article body typography ramps from `prose-lg` (< 640 px, 18 px) to `prose-xl` (≥ 640 px, 20 px).
- Article H1 ramps `text-3xl → sm:text-4xl → md:text-5xl → lg:text-6xl` (smooth ramp; no `text-4xl → text-6xl` jump).

### Code changes (Phase P, 2026-05-28)

| File | Change |
|------|--------|
| `src/components/articles/ArticlePage.tsx` L70 | Added `overflow-x-clip [overflow-x:clip] w-full min-w-0`; gutter consolidated to `px-4 sm:px-6 lg:px-8` |
| `src/components/articles/ArticlePage.tsx` L92 | Icon halo `p-5 sm:p-8`; icon size `48` mobile / `64` desktop via `useIsMobile()` |
| `src/components/articles/ArticlePage.tsx` L97 | H1 ramp + `break-words [overflow-wrap:anywhere] [hyphens:auto]` |
| `src/components/articles/ArticlePage.tsx` L103 | Dek `break-words [overflow-wrap:anywhere]` |
| `src/components/articles/ArticlePage.tsx` L145 | Inner wrapper changed to `px-0 min-w-0` (removes double gutter) |
| `src/components/articles/enhanced/ProfessionalTextFormatter.tsx` L591 | `prose prose-lg sm:prose-xl max-w-none article-content` |
| `src/components/language/CulturalTermTooltip.tsx` L59 | `inline-block` → `inline break-words [overflow-wrap:anywhere]` |
| `src/index.css` (new `@media (max-width: 640px)` block) | `overflow-wrap: anywhere` on `.article-content` text + chip cap |

### Regression net (MV-02)

`src/__tests__/responsive/article-prose-overflow.test.ts` (new):

1. `ArticlePage.tsx`: the `data-testid="article-body"` element must include both `overflow-x-clip` and `min-w-0`.
2. `index.css`: must contain a `@media (max-width: 640px)` block declaring `overflow-wrap: anywhere` for `.article-content`.
3. `CulturalTermTooltip.tsx`: trigger className must NOT contain `inline-block`.
4. Source-walk under `src/components/articles/**`: any className combining `inline-block` + `px-` must also include `max-w-full` (allowlist: `MagadhaReligiousTimeline` event badge, `ArticleMiniMap` legend dot — both non-text-flow decorative).

MV-01 is now scoped as "table/wide-child overflow only" and complemented by MV-02.

### Manual cross-browser sweep (pre-release)

On `/articles/satisar-springs-and-shifting-shores`, `/articles/reassessing-ashoka-legacy`, `/articles/rishi-genealogies-vedic-tradition` at 320 / 360 / 390 / 414 px:

- [ ] iOS Safari 17 — `document.documentElement.scrollWidth === window.innerWidth`.
- [ ] Android Chrome 124 — same; cultural-term chip wraps with text, tooltip tap still works.
- [ ] Samsung Internet 24 — same.

### Accepted desktop delta

Removing the inner `px-6` and switching outer to `px-4 sm:px-6 lg:px-8` produces a net −8 px desktop gutter (40 → 32 px). Within visual tolerance; no regression for Cross-References / data components, which remain `mx-auto max-w-4xl`.


