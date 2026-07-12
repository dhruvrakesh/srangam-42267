# Srangam — Enterprise Master Plan (consolidated)

**Date:** 2026-07-12 · **Baseline:** `origin/main` @ `232355e` · **Status of this doc:**
authoritative. It **consolidates and supersedes** `ENTERPRISE_AUDIT_AND_ROADMAP_2026-07-12.md`
and `ENTERPRISE_PATH_FORWARD_2026-07-12.md` (both retained as historical evidence),
resolves the one open product decision that forked them, and sequences all remaining
work into one plan with a Windows-run verification gate on every step.

**Provenance.** Grounded in a fresh re-read of the repo: 64 SQL migrations, 29 edge
functions, the resolver / search / cultural-term code paths, `src/hooks/useResearchStats.ts`,
`package.json`, `src/locales/`, and the two prior audit docs. The live-DB language
finding is independently confirmed by the SQL export the maintainer ran on 2026-07-12
(`query-results-export-2026-07-12_15-39-25.csv`: 47 published rows = 44 `en`, 2
`en,hi,pa`, 1 `bn,en,hi`). Claims that still require the live database or edge-function
logs are marked **[LIVE-VERIFY]**; the agent sandbox cannot reach Supabase, nor run
`vite build` / `vitest` / `tsc` (Windows-native + UTF-8/Devanagari sources).

---

## 0. Where we actually are

| Phase | State | Evidence |
|---|---|---|
| **1 · Load-Time Surgery** | ✅ Shipped | Entry JS 630→277 KB gz; hero 2.8 MB PNG→172 KB WebP; first-load −86%; `manualChunks` in `vite.config.ts`; `meta.ts` generated |
| **2 · Single Source of Truth** | ⚙️ ~40% | Done: 2.1 DB-first resolver + `static_fallback_serve` telemetry, 2.5 30 dead files deleted, 2.7 `title_ml` (9-lang). **Not started (verified absent from tree):** 2.2 `canonicalSlugMap.ts`, 2.3 search unification / `search_static_suppressed`, 2.4 `culturalTermsIndex.ts`, 2.6 registry retirement |
| **3 · UI/UX** | ▫️ Planned | needs a dedicated UX audit before any component is touched |
| **4 · Bundle hygiene** | ▫️ Planned | 3 map stacks + 2 chart stacks still coexist (confirmed in `package.json`) |
| **5 · Hardening** | ▫️ Planned | `gdrive-image-proxy` open; `strict:false`; `srangam_article_versions` = 0 rows |
| **6 · Docs truth** | ▫️ Planned | README drift (gateway / term & article counts / TTS) |

**Working agreement (unchanged, applies to every step below):** one concern per commit,
small and reversible with a stated rollback; a verification gate before commit; no live-DB
write without review (changes ship as repo code, migrations, or reviewed SQL); telemetry
before deletion (nothing static removed until its fallback-event count is zero for 2+ weeks
in production); preserve Part-1 strengths (route code-splitting, `_shared/auth-gate` + RLS,
the test/perf culture, i18n/SEO foundations).

---

## 1. The fork, resolved — recommendation

**The decision:** the DB is effectively English-only. The up-to-9-language article
*bodies* exist only in the static TS registry (~28 articles), surfaced today via the
resolver's static fallback for registry-id slugs that miss the DB. **Note this is about
article-body translations only** — the 9-language *UI* (i18n strings in `src/locales/`:
`as, bn, en, hi, kn, pa, pn, ta, te`) is independent and stays regardless.

Two clean paths were on the table; each has a real cost:

| | Multilingual is live | English-first (park translations) |
|---|---|---|
| **Phase 2 headline work** | Per-article backfill of up-to-9 languages from the static registry + `docs/*.md` into `srangam_articles.content`, one article at a time, parity-verified | Make DB the English source of truth; import 13 missing (English); reconcile 3 duplicates; defer translations |
| **Effort** | Large (28 articles × up to 9 languages, each verified) | Small |
| **Blocks 2.6 (registry retirement)?** | Yes, indefinitely — retiring would strip non-English content | No — unblocks it once fallback traffic hits zero |
| **Aliasing the 7–10 registry→DB targets** | Only *after* that article is multilingual in the DB | Still deferred for the multilingual-bearing ones (aliasing to an English-only DB row drops their static multilingual body) |
| **Risk** | Effort spent before demand is proven; translation *quality* of AI-generated Sanskrit-heavy bodies is high-stakes for a scholarly site | Non-English readers of the ~28 registry slugs lose body translations *if* the static fallback is later retired |

### Recommendation: **staged English-first, multilingual preserved and data-gated**

Adopt English-first as the operational source of truth **without** retiring or aliasing
away the static multilingual bodies. Concretely:

1. **Make the DB the authoritative English source** (finish Phase 2 logic: search
   unification, term highlighting, count fix, import the 13, dedup the 3).
2. **Do NOT run 2.6 (registry retirement) and do NOT alias the multilingual-bearing
   registry slugs.** Keep the resolver's static fallback serving those multilingual
   bodies exactly as today. This costs nothing and preserves current reach.
3. **Instrument demand before investing.** Add lightweight language telemetry (which
   `lang` article reads actually occur, and how many static-fallback multilingual serves
   happen). Let real usage — not the aspiration — decide whether and which articles get a
   full DB multilingual backfill later.

**Why this is the right call for *this* repo:** it is the surgical, reversible, non-breaking
option. It unblocks ~90% of remaining Phase 2 immediately (search, highlighting, imports,
dedup, the count bug) with zero multilingual regression, and it defers only the two
expensive/irreversible moves — the DB backfill and static retirement — until telemetry
justifies them. The static content files stay in the repo as archival source either way
(2.6 is a kill-switch, not a delete), so choosing English-first now forecloses nothing:
a future "multilingual is live" decision re-uses the exact same static bodies as its
backfill input.

**What would flip the recommendation to full multilingual now:** a concrete near-term
commitment (launch, grant, partner) that requires multilingual article bodies on a fixed
date, or telemetry showing material non-English article demand. Absent that, staged is
strictly safer.

**This plan is written for the staged-English-first path.** Where a step differs under a
"multilingual is live" decision, it is called out inline as **[IF-MULTILINGUAL]**.

---

## 2. Safe-regardless quick wins (do first — independent of the fork)

These carry no multilingual risk and can land immediately as small commits.

**Q1 · Fix the published-count discrepancy (homepage "71" vs DB 47).**
`src/hooks/useResearchStats.ts` computes a published total *twice*: a direct
`from('srangam_articles').select(count exact head).eq('status','published')` (≈47), and a
separate `publishedArticles = themes.reduce((s,t)=>s+t.count,0)` derived from the
theme-grouped rows. Isolate which value the homepage/`ResearchMetrics` actually renders and
why it diverges (candidate causes: theme reduction double-counting multi-theme rows, or a
static+DB blend upstream). Fix to the single DB `published` count.
*Gate:* `npm run test`; then load the homepage and confirm the number reads 47 **[LIVE-VERIFY]**.

**Q2 · Import the 13 genuinely-missing articles (English).** Confirmed absent by live
title query in the prior audit: maritime-memories-south-india, riders-on-monsoon,
monsoon-trade-clock, gondwana-to-himalaya, indian-ocean-power-networks,
ashoka-kandahar-edicts, kutai-yupa-borneo, chola-naval-raid, pepper-and-bullion,
earth-sea-sangam, cosmic-island-sacred-land, stone-purana, and **scripts-that-sailed
(part I)** (DB holds only "Scripts that Sailed II"). Several have source `.md` in `docs/`.
Import via Admin → Markdown Import (`markdown-to-article-import`); re-run
`node scripts/registry-parity-check.mjs` after each.
*Gate:* parity report shows each newly-imported slug RESOLVED from DB; no duplicate created **[LIVE-VERIFY]**.

**Q3 · Reconcile the 3 true duplicate rows** (live-verified as genuine dupes, not the
heuristic false-positives): Śarīra/Ātman (×2), Vishnu–Shiva (×2), Janajātiya-traditions
(×2). Deduping is an O-1/versioning concern — pick the canonical row, redirect the other's
slug, and record the merge. Ship as reviewed SQL, not a silent `UPDATE`.
*Gate:* reviewed SQL; post-merge count and a spot-check of both old URLs (canonical serves, old redirects) **[LIVE-VERIFY]**.

---

## 3. Phase 2 — finish Single Source of Truth (logic)

Order: **2.3 → 2.4 → 2.2 (partial) → (park 2.6)**. Search and highlighting are pure logic
firming with no multilingual coupling, so they go first.

### 2.3 · Search unification (DB-authoritative)
Today `useSearchArticles` merges a static-engine result with a DB-RPC result and the
**static result wins** — the same "stale source shadows the DB" defect the resolver had.
Also `srangam_search_articles_fulltext` returns `slug` but **not** `slug_alias`, so an
aliased article can list twice.
- **2.3-a** Additive migration: add `slug_alias` to the RPC's `RETURNS TABLE` + `SELECT`
  (backward compatible).
- **2.3-b** Invert the merge: DB set authoritative; drop a static result whose id /
  normalized slug / canonical value collides with any DB identifier (id, slug, slug_alias);
  DB-first on score ties; emit `search_static_suppressed`. Reuse `normalizeSlugKey`.
*Gate:* `npm run build` + `npm run test` + a new dedup unit test mirroring
`articles-merge-dedup.test.ts`; deploy migration; confirm no double-listing **[LIVE-VERIFY]**.

### 2.4 · Cultural-term highlighting from the DB
`culturalTermEnhancer` reads only the static ~600–800-term file; the DB
(`srangam_cultural_terms`) holds ~1,699 enriched terms, so highlighting drifts from the
curated corpus.
- **2.4-a** `src/lib/culturalTermsIndex.ts`: load the DB corpus once (module-promise +
  react-query cache), exposing term strings + per-term context; fail-safe to static on error.
- **2.4-b** Make the highlighter's term set injectable (union static + DB); null source =
  exact pre-change behaviour.
- **2.4-c** Tooltip: on a static miss, resolve context from the DB index so DB-only
  highlights are never dead.
- **2.4-d** Load the index from `ProfessionalTextFormatter` (react-query dedups across
  articles).
*Gate:* build + test + an injectable-source unit test + visual spot-check of one article;
watch `cultural_terms_db_loaded` telemetry.

### 2.2 · Canonical slug map — English-first scope
`slug_alias` is a single `text` column already holding a live SEO alias per row, so
overwriting it would 404 the existing URL. The safe mechanism is a shared
`src/data/articles/canonicalSlugMap.ts` (`registry id → DB slug/alias`) that the resolver
consults **only on a DB miss and only when the canonical row exists** (degrades to today's
static fallback if wrong), imported by the parity script and search merge so all three agree.

**Critical constraint under the staged decision:** the 7–10 registry→DB targets identified
in the audit are **English-only in the DB but multilingual in the static registry**.
Wiring them into the canonical map now would make the resolver serve the English-only DB
row and **drop the multilingual static body** — a regression. Therefore:
- **2.2 (now):** populate the canonical map **only** with registry ids whose DB row is not
  multilingual-bearing in the registry, or where no translation loss occurs (i.e. the map
  is used by the parity script/search for identity reconciliation, not to override
  multilingual fallback). Keep the multilingual-bearing targets **out** of the resolver
  override path.
- **[IF-MULTILINGUAL]** After an article is backfilled multilingual into the DB, add it to
  the canonical map and let the resolver prefer the DB row.
*Gate:* build + test; **[LIVE-VERIFY]** each wired slug serves DB content and emits
`canonical_alias_resolve` while its `static_fallback_serve` stops — **and** no multilingual
body is lost (diff languages served before/after).

### 2.6 · Registry retirement — **PARKED**
Blocked by design under staged-English-first: the static registry is the *only* source of
multilingual bodies. Do not retire. Revisit only if the decision flips to English-only-final
(then gate on 2+ weeks of zero `static_fallback_serve`) or after a multilingual DB backfill.

### 2.8 · Language-demand telemetry (new — enables the future fork decision)
Add two events: article read with resolved `lang`, and `static_multilingual_serve`
(fallback served a non-English body). Surface a 30-day rollup in the admin data-health view.
This is the evidence that later answers "is multilingual worth backfilling, and which
articles first?"
*Gate:* build + test; confirm events appear for a non-English read **[LIVE-VERIFY]**.

---

## 4. Phase 4 — Bundle-hygiene completion (load times) — next after Phase 2

High user-visible ROI, low logic risk, independent of Phase 2. All deps confirmed present
in `package.json`.

- **4.1 Consolidate map stacks.** `mapbox-gl@3`, `maplibre-gl@5`, and `leaflet@1.9` +
  `react-leaflet@4` all ship. Migrate the 2 mapbox-gl components (`MapboxPortMap.tsx`,
  `MapboxBujangNetwork.tsx`) to MapLibre (patterns exist in `InteractiveAtlas.tsx`/
  `OceanMap.tsx`, tiles in `src/lib/mapTiles.ts`); this kills the ~1.6 MB mapbox chunk +
  the Mapbox token dependency. Drop `mapbox-gl`. Leaflet components migrate opportunistically
  later (leaflet is small; cleanup not perf-critical).
- **4.2 Consolidate chart stacks.** `chart.js@4` + `recharts@2` both ship. Migrate the 2
  chart.js call sites (`ResearchNetwork.tsx`, admin `CrossReferencesBrowser.tsx`) to
  recharts; drop `chart.js` + `@types`. (`d3` + `react-force-graph-2d` are a separate,
  legitimately-used force-graph concern — leave them.)
- **4.3 CI budgets.** Add `size-limit` (entry gz ≤ 400 KB, warn 250) and wire
  `article-perf.spec.ts` + Lighthouse so a regression can't land silently. Configure the
  workflow to run on **push as well as PR** (Lovable pushes directly to main).
*Gate:* `mapbox-gl` and `chart.js` absent from lockfile; rollup-visualizer diff + perf spec
before/after green.

---

## 5. Phase 3 — UI/UX pass (visual) — after an explicit UX audit

Deliverable of this phase's planning step is a short UX audit doc enumerating concrete,
testable fixes *before* any component is touched. Candidate areas the repo already flags:
dark-mode consistency (`DARK_MODE_AUDIT.md`), article typography (`layout-patterns.md`),
mobile tap-targets (responsive tests exist), font diet (11 families × up to 5 weights → 2–3
weights/script), and unifying skeleton/error components (`ArticleFullSkeleton`,
`ArticleError`) across Search/theme pages. Each UI change sits behind the existing
responsive/overflow tests + a before/after screenshot.

---

## 6. Phase 5 — Hardening (security, types, data integrity)

- **5.1 `gdrive-image-proxy` (S-1).** Proxies any Drive `?id=` with no auth/allowlist/
  rate-limit while every other function is gated — an egress-cost and abuse vector. Validate
  ids against `srangam_media_assets` (or a stored allowlist), add `Cache-Control:
  public, max-age=86400`, cap response size, log rejected ids. Export last-30-day logs first
  to size real exposure. *Gate:* function unit test + **[LIVE-VERIFY]** an un-allowlisted id
  is rejected.
- **5.2 Type-safety (T-1).** ~358 `no-explicit-any` lint errors; `strict:false`. Kill `any`
  at the resolver seams first (`dek`/`content`/title fields — see the `any` types still on
  `ResolvedArticle`), then ramp `noImplicitAny` → `strictNullChecks` by folder
  (`src/lib` → `src/hooks` → `src/components/oceanic` → rest). Patch/exclude the upstream
  `force-graph` `.d.ts` that trips `tsc --noEmit`, then add it as a CI gate.
- **5.3 Data integrity (O-1).** Exercise the `srangam_article_versions` append-only
  invariant (0 rows today) so history actually records on admin edits; backfill current rows
  as v1; add a test. Then document or drop the 8 empty scaffold tables. Fold in the Q3 dedup.
  **[LIVE-VERIFY]**.

---

## 7. Phase 6 — Documentation truth (D-1)

README is the drifted artifact humans and AI tools read first. Reconcile against
`CURRENT_STATUS` / `ai-provider.ts`:
- "Powered by Lovable AI Gateway (no API keys)" — `ai-provider.ts` deliberately uses direct
  Gemini/OpenAI; **but** `suggest-tag-categories` *does* use the Lovable gateway
  (`LOVABLE_API_KEY`) per Phase 19a. State both precisely rather than flipping the blanket
  claim.
- "800+ cultural terms" → ~1,699. "30+ articles" → 47 published. Google Neural2 as primary
  TTS → three providers ship (ElevenLabs primary EN, OpenAI fallback, Google for Indic).
- Add a one-page `docs/ARCHITECTURE.md` ("how an article reaches the screen: DB → resolver
  → OceanicArticlePage → ProfessionalTextFormatter") and a docs index marking the 70+ files'
  superseded/historical ones as archived — including tagging the two 2026-07-12 audit docs as
  superseded by this master plan.

---

## 8. Sequencing & rationale

1. **Quick wins (§2)** — count fix, 13 imports, 3 dedups. Safe regardless of the fork;
   immediate correctness/trust ROI.
2. **Phase 2 logic (§3): 2.3 → 2.4 → 2.2(partial) → 2.8.** Firms the biggest remaining
   correctness risk (search/highlighting drift) with no multilingual coupling. 2.6 stays
   parked.
3. **Phase 4 (§4)** — load-time remainder; high visible ROI, low logic risk. Land 4.3 CI
   early so it protects everything after it.
4. **Phase 3 (§5/UI)** — only after an explicit UX audit doc.
5. **Phases 5–6** — continuous hardening + doc truth; safe to interleave.

Nothing here changes schema without a migration, writes live data without review, removes a
static source before telemetry proves it unused, or drops a multilingual body. That is the
heal-not-break guarantee.

## 9. Open decisions still owned by the maintainer

- **The fork's eventual resolution.** Staged-English-first is the operating assumption;
  §2.8 telemetry is designed to convert it into a data-backed final call later.
- **Card-only articles (8 JSON cards):** promote `bharats-ancient-heritage`,
  `samudra-manthan`, `dharmic-heritage-maritime-trade` to real DB articles, or retire?
- **The `pn` locale** in `src/locales/` (non-standard code alongside `pa`) — confirm intended
  vs a stray/duplicate of Punjabi.
