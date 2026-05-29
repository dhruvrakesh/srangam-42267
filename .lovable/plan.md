# Phase X.8 — Surgical Heal: "Loading articles…" Stall

## Diagnosis (verified against code, DB, and logs)

**Symptom:** On `srangam.nartiang.org/`, theme chips render with full counts and "Show All (28 articles)" is visible, but the article grid is replaced by an indefinite "Loading articles…" spinner.

**Root cause — confirmed, not assumed:**

1. **Render gate too aggressive.** `src/pages/Home.tsx` lines 253–270 and `src/pages/Articles.tsx` lines 178–184 gate the entire grid on `useAllArticles().isLoading`. JSON articles from `getDisplayArticles(currentLanguage)` are synchronous and already merged into `allArticles` — but the spinner hides them while the DB call is pending.
2. **JSON-only fallback proves DB never resolved.** "(28 articles)" equals exactly the JSON corpus size. `mergeArticleSources` returned the synchronous JSON list; `dbArticles` is `undefined` at render time.
3. **Backend is healthy.** `select count(*) from srangam_articles where status='published'` → **44 rows**. ACL: `anon=arwdDxtm/postgres` present on `public.srangam_articles`. No Postgres `ERROR/FATAL/PANIC` in recent logs. No edge-function 4xx/5xx.
4. **`useAllArticles` has no resilience contract.** No `retry` cap, no `networkMode`, no `AbortSignal`, no timeout, no error surfacing. On flaky mobile 5G (per screenshot) + adblocker, React Query stays `pending` indefinitely and the UI offers no escape hatch.
5. **Secondary cosmetic bug** (out of scope here): theme chips show raw i18n keys `themes.sacredecology`, `themes.acoustic-archaeology`, `themes.sacred-geography` — missing entries in `src/locales/*/common.json`. Logged for Phase X.9.

## Guiding principles (per Surgical Healing memory)

- Surgical, additive, reversible. No schema/RLS/edge changes. No Phase X.1–X.7 invariants touched.
- Render what we have **immediately**; treat DB as **enrichment**, not a gate.
- Bounded round-trip budget; degrade gracefully on timeout.
- Documentation-first: `.lovable/plan.md` and `docs/SCALABILITY_ROADMAP.md` updated alongside code.

## Sub-phases

### X.8.1 — Unblock the grid (user-visible fix)

- `src/pages/Home.tsx` lines 253–270: drop the full-screen spinner branch. Render the grid whenever `filteredArticles.length > 0`. When `isLoading && allArticles.length === 0` → 3-card `<Skeleton/>` placeholder, never a blocking spinner. When `!isLoading && isFetching` (background refresh) → tiny inline "Refreshing…" pill above the grid, non-blocking, no layout shift.
- `src/pages/Articles.tsx` lines 178–194: identical treatment. Preserve the genuine empty-state branch (zero-result filters).
- Reuse existing `@/components/ui/skeleton`. No new dependencies.

### X.8.2 — Harden `useAllArticles` (durability fix)

`src/hooks/useArticles.ts`:

- `queryFn` accepts React Query's `signal`; pass to `.abortSignal(signal)` so navigation/unmount cancels the in-flight request.
- `retry: 2`, `retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000)`.
- `networkMode: 'offlineFirst'` so cached payload paints instantly on revisit.
- 12 s `Promise.race` watchdog rejecting with a typed `ArticleFetchTimeoutError`; React Query then settles, JSON-only grid renders, no infinite spinner.
- Return `isFetching` and `error` alongside existing `{ data, isLoading }` (additive — no breakage for `Search`, `ArticleHealthDashboard`, or other consumers).
- **Do not** touch `select('*')` shape. **Do not** edit `types.ts` (auto-generated).

### X.8.3 — Lightweight observability (no infra)

- On timeout/abort, emit one `console.warn(JSON.stringify({ evt: 'articles_fetch_degraded', duration_ms, reason, count_json, count_db }))`. Shape mirrors `supabase/functions/_shared/observability.ts` so it slots into the future `srangam_event_log` table without rework.
- No new tables, no new deps.

### X.8.4 — Docs + memory

- Append "Render-first, hydrate-second" pattern to `docs/SCALABILITY_ROADMAP.md` under "Frontend resilience", with temporal note `(Phase X.8, 2026-05-29)`.
- Add Core rule to `mem://index.md`: *"List pages must render JSON-backed corpus immediately; DB fetches enrich, never gate."*
- Append Phase X.8 section to `.lovable/plan.md` (diagnosis → resolution → validation → rollback).
- Log Phase X.9 candidate: theme-chip i18n key leakage.

## Blast radius

| File | Change | Risk |
|---|---|---|
| `src/pages/Home.tsx` | swap loading gate, add skeleton | low — presentation only |
| `src/pages/Articles.tsx` | swap loading gate, add skeleton | low — presentation only |
| `src/hooks/useArticles.ts` | abort + retry + timeout + networkMode + additive returns | medium — shared hook, but contract preserved |
| `docs/SCALABILITY_ROADMAP.md` | append section | none |
| `.lovable/plan.md` | append Phase X.8 | none |
| `mem://index.md` | add 1 Core line | none |

**Untouched:** routes, RLS, GRANTs, migrations, edge functions, `types.ts`, admin pages, correlation engine, Phase X.7 work, slug resolver, narration, OG pipeline, `useArticlesPaginated`, `useSearchArticles`, `useArticle`, article detail rendering.

## Explicitly NOT doing in this phase

- No global React Query default-config rewrite.
- No service worker / offline cache.
- No change to `mergeArticleSources` precedence (DB still wins on arrival).
- No homepage pagination/virtualization.
- No i18n key fixes.

## Validation

1. DevTools "Slow 3G" + reload `/` → JSON grid paints within ~200 ms, no blocking spinner.
2. DevTools block `*.supabase.co` → grid paints from JSON, degraded inline banner appears after 12 s, no infinite spinner.
3. Normal load → JSON paints first, DB hydrates within ~500 ms, the extra 16 DB-only articles fade in without layout jump.
4. Theme filter → counts/union unchanged vs. current behavior.
5. `/articles` route → URL params preserved, identical behavior.

## Rollback

Each file revertable independently. Hook keeps the `{ data, isLoading }` contract; new `error`/`isFetching` fields are additive — downstream consumers unaffected if they ignore them.

## Out of scope (queued for Phase X.9 if approved)

- Theme-chip i18n key leakage (`themes.sacredecology`, etc.).
- Project-wide `QueryClient` defaults audit.
- Wiring `articles_fetch_degraded` warnings into `srangam_event_log`.

---

## Phase X.8 — Implementation Log (2026-05-29)

**Status:** Implemented.

**Files edited:**
- `src/hooks/useArticles.ts` — added `ArticleFetchTimeoutError`, AbortSignal, 12s watchdog, retry:2, `networkMode:'offlineFirst'`, structured `articles_fetch_degraded` log on timeout/abort/error.
- `src/pages/Home.tsx` — replaced full-screen spinner with render-first grid + 3-card skeleton fallback + inline "Refreshing…" pill + offline-archive notice. Added `Skeleton` import.
- `src/pages/Articles.tsx` — same treatment with 6-card skeleton; preserved genuine empty-state branch for zero-result filters.
- `docs/SCALABILITY_ROADMAP.md` — appended "Frontend resilience" section documenting the render-first / hydrate-second pattern and hook contract.
- `mem://index.md` — added Core rule: "Render-first, hydrate-second (Phase X.8)".

**Untouched:** RLS, GRANTs, migrations, edge functions, `types.ts`, admin pages, correlation engine, slug resolver, narration, OG pipeline, `useArticlesPaginated`, `useSearchArticles`, `useArticle`.

**Hook return shape:** additive — `{ data, isLoading, isFetching, error, ... }`. Existing consumers (`Search`, `ArticleHealthDashboard`, etc.) that only destructure `{ data, isLoading }` continue to work unchanged.

**Phase X.9 candidates:** theme-chip i18n key leakage (`themes.sacredecology`, `themes.acoustic-archaeology`, `themes.sacred-geography`); project-wide `QueryClient` defaults audit; `articles_fetch_degraded` → `srangam_event_log` materialization.
