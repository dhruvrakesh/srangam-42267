# Srangam — Enterprise Path Forward (revived context, 2026-07-12)

**Author's note on provenance.** This plan was written after re-reading the
134-line `ENTERPRISE_AUDIT_AND_ROADMAP_2026-07-12.md`, all 65 SQL migrations,
the 29 edge functions, the resolver / search / cultural-term code paths, and
`PARITY_REPORT.md`. Every "verified" claim below is grounded in the repo. Every
claim that requires the **live Supabase database or edge-function logs** is
marked **[LIVE-VERIFY]** because those are not reachable from the build/agent
sandbox (network allowlist) — the same limitation the original audit recorded.

---

## 0. Baseline — where we actually are

- **`origin/main` is at `232355e`** ("Phase 2 (partial)…"). Nothing newer has
  been pushed.
- **Phase 1 (Load-Time Surgery): shipped.** Entry JS 630 KB → 277 KB gz;
  hero 2.8 MB PNG → 172 KB WebP; homepage first-load −86%. `manualChunks`
  (react / supabase / i18n) is in place.
- **Phase 2 (Single Source of Truth): partially shipped.**
  - 2.1 DB-first resolver + `static_fallback_serve` telemetry — done.
  - 2.5 30 dead files deleted (0-importer verified) — done.
  - 2.7 `title_ml` / 9-language `getArticleTitle` — done.
  - 2.0 parity-check script — written; runs locally against live DB.
  - **Remaining: 2.2 backfill, 2.3 search unification, 2.4 DB term-highlighting,
    2.6 registry retirement.**
- **Phases 3–6 are named but not yet written.** The roadmap's issue catalog
  (P-3, T-1, S-1, D-1, O-1) defines their scope; this document turns them into
  sequenced, surgical phases.

### Verification reality (important)

The agent sandbox **cannot** run `vite build`, `vitest`, or `tsc` (Windows-only
native binaries; `tsc` also misparses the repo's UTF-8/Devanagari sources), and
**cannot** reach Supabase. Therefore every phase below defines a **local
verification gate that the developer runs on Windows** before the change is
committed. No change is considered done on the strength of an agent claim alone.

---

## 1. Working agreement (the "enterprise way" for this repo)

Applied to every step in every phase:

1. **One concern per commit.** Small, named, reversible. A commit message states
   what changed, why, and the rollback (`git revert <sha>` or a one-line undo).
2. **Verification gate before commit.** Minimum: `npm run build` succeeds and
   the 35 unit tests pass locally. Logic changes add one focused test. Perf
   changes run `article-perf.spec.ts` + a bundle diff.
3. **No live-DB write without explicit review.** Content/parity fixes are
   expressed as repo code (maps, migrations) or as SQL you review and run — not
   silent `UPDATE`s. Schema changes ship as a migration file.
4. **Telemetry before deletion.** Nothing static is removed until its
   `static_fallback_serve` (or equivalent) event count is zero for 2+ weeks in
   production. This is already the Phase 2.6 gate; it is the pattern for all
   retirements.
5. **Preserve the Part-1 strengths.** Route-level code-splitting, the
   `_shared/auth-gate` security model, RLS, the test/perf culture, and the i18n
   /SEO foundations are not to be disturbed by any change here.

---

## 2. Phase 2 — finish Single Source of Truth (logic)

### 2.2 Content parity — the real breakdown

`PARITY_REPORT.md` says "34 gaps." Read against its own fuzzy-match table, that
number is misleading. The accurate decomposition (DB = 47 published articles):

**(a) Already OK (2):** `somnatha-prabhasa-itihasa`, `ringing-rocks-rhythmic-cosmology`.

**(b) Alias-resolvable — high confidence, 100% token overlap + matching English
title (7):** the article is in the DB under a standardized slug; the fix is a
mapping, not a re-import.

| Registry id | DB slug_alias (canonical) |
|---|---|
| reassessing-ashoka-legacy | ashoka-legacy-buddhism |
| rishi-genealogies-vedic-tradition | rishi-genealogies-vedic |
| reassessing-rigveda-antiquity | reassessing-antiquity-rigvedadocx |
| dashanami-ascetics-sacred-geography | dashanami-jyotirlinga-geography |
| stone-song-and-sea | stone-song-sea-janajati |
| sarira-and-atman-vedic-preservation | vedic-preservation-sarira |
| geomythology-land-reclamation | geomythology-cultural-continuity |

**(c) Alias candidates — lower confidence (67%), confirm before wiring (3+1):**
`asura-exiles-indo-iranian → asura-exiles-mitanni`;
`janajati-oral-traditions → janajatiya-oral-traditions`;
`continuous-habitation-uttarapatha → continuous-habitation-india`; and the
ambiguous pair `scripts-that-sailed` / `scripts-that-sailed-ii` which both point
near `scripts-sailed-epigraphic-atlas` (DB title = "Scripts that Sailed II").
**[LIVE-VERIFY]** — resolve by reading the DB rows' titles/bodies.

**(d) Genuinely missing — candidates for import (~12):** `maritime-memories-
south-india`, `riders-on-monsoon`, `monsoon-trade-clock`, `gondwana-to-himalaya`,
`indian-ocean-power-networks`, `ashoka-kandahar-edicts`, `kutai-yupa-borneo`,
`chola-naval-raid`, `pepper-and-bullion`, `earth-sea-sangam`,
`cosmic-island-sacred-land`, `stone-purana`. **[LIVE-VERIFY]** — the report's
"no match" is a slug-fuzzy result only; each must be confirmed truly absent by a
live title query before importing (importing a duplicate is worse than a gap).
Several already have source `.md` files in `docs/`.

**(e) Content gaps — exist but incomplete (2):** `jambudvipa-connected` and
`sacred-tree-harvest-rhythms` are in the DB missing 8 languages of body content;
re-import those languages.

**(f) JSON cards (8):** most are served by the resolver's card fallback;
`bharats-ancient-heritage`, `samudra-manthan`, `dharmic-heritage-maritime-trade`
exist only as cards. Decision needed: promote to real DB articles or retire.

**(g) Duplicate DB rows to reconcile [LIVE-VERIFY]:** the unmatched-DB list shows
likely duplicates (e.g. two Śarīra/Ātman rows, two janajātiya rows, two
geomythology rows). Deduping is an O-1 (versioning) concern; note now, act in
Phase 5.

#### 2.2 — the critical constraint (why "just set slug_alias" is wrong)

`slug_alias` is a **single `text` column** (migration `20251123012234`) and
**every** candidate DB row already holds a distinct, live SEO alias. Overwriting
it to the registry id would 404 the existing URL. Two safe, in-repo mechanisms
instead:

- **Preferred: a shared `CANONICAL_SLUG_MAP`** (`registry id → DB slug/alias`)
  that the **resolver** consults on a DB miss (retry the lookup under the
  canonical slug *before* the static fallback), and that the **parity script**
  and **search merge** import so all three agree from one edit. No DB write.
- **Alternative:** router-level `Navigate` redirects (the pattern already in
  `App.tsx`) from legacy id → canonical `/articles/<db-slug>`.

Either way, the resolver only trusts a mapping when the direct lookup already
missed **and** the canonical row exists — a wrong entry degrades to today's
static fallback, never to a hard error.

**Steps, each its own commit + gate:**

- **2.2-a** Add `src/data/articles/canonicalSlugMap.ts` with the 7 high-
  confidence entries (b). Wire the resolver retry. Import the map into the
  parity script so those rows report "RESOLVED VIA ALIAS," not "MISSING."
  *Gate:* build + tests; then **[LIVE-VERIFY]** the 7 pages serve DB content and
  emit `canonical_alias_resolve` while `static_fallback_serve` stops for them.
- **2.2-b** Confirm (c) against the live DB; extend the map only for confirmed
  matches; disambiguate scripts-that-sailed vs -ii.
- **2.2-c** For (d), run one live title query to confirm true absence, then
  import confirmed-missing via Admin → Markdown Import
  (`markdown-to-article-import`). Re-run parity after each.
- **2.2-d** Re-import the missing languages for (e).
- **2.2-e** Decide promote-vs-retire for the card-only (f) items.

### 2.3 Search unification (DB-authoritative)

Today `useSearchArticles` merges a static-engine result set with a DB RPC set,
and the **static result wins** — the same "stale source shadows the DB" defect
as the resolver (L-1). Also the RPC `srangam_search_articles_fulltext` returns
`slug` but **not** `slug_alias`, so an aliased article can appear twice.

- **2.3-a** Additive migration: add `slug_alias` to the RPC's `RETURNS TABLE`
  and `SELECT` (backward compatible; older callers ignore the new column).
- **2.3-b** Invert the merge: DB result set is authoritative; drop a static
  result when its id / normalized slug / `CANONICAL_SLUG_MAP` value collides
  with any DB identifier (id, slug, slug_alias). Sort DB-first on score ties.
  Emit a `search_static_suppressed` event. Reuse `normalizeSlugKey`.
  *Gate:* build + tests + a new dedup unit test mirroring
  `articles-merge-dedup.test.ts`; deploy migration; confirm no double-listing.

### 2.4 Cultural-term highlighting from the DB

The highlighter (`culturalTermEnhancer`) reads only the static ~600-term file;
the DB (`srangam_cultural_terms`) holds ~1,699 enriched terms, so highlighting
drifts from the curated corpus (L-1 again).

- **2.4-a** `src/lib/culturalTermsIndex.ts`: load the DB corpus once (cached
  module promise + react-query), exposing term strings + per-term context.
  Fail-safe to static on error.
- **2.4-b** Make the highlighter's term set injectable (union of static + DB);
  null source = exact pre-change behaviour.
- **2.4-c** Tooltip: on a static miss, resolve context from the DB index so
  DB-only highlights are never "dead."
- **2.4-d** Load the index from `ProfessionalTextFormatter` (react-query dedups
  across articles). *Gate:* build + tests + injectable-source unit test + a
  visual spot-check of one article; watch `cultural_terms_db_loaded` telemetry.

### 2.6 Registry retirement (the gated finale)

Only after **full parity** AND **2+ weeks of zero `static_fallback_serve`** in
production: delete the static registry bodies and the static search path, leaving
the DB as the sole source. This is the payoff for all of Phase 2 and must not be
rushed.

---

## 3. Phase 3 — UI/UX pass (visual; roadmap "no visual changes until Phase 3")

Scope to be set by a dedicated UX audit (not invented here). Candidate areas the
repo already flags: dark-mode consistency (`DARK_MODE_AUDIT.md`), article
typography/`layout-patterns.md`, mobile tap-targets (responsive tests exist),
and unifying the visual language across the map/chart components. Each UI change
is behind the existing responsive/overflow tests plus a before/after screenshot.
**Deliverable of this phase's planning step:** a short UX audit doc enumerating
concrete, testable UI fixes before any component is touched.

---

## 4. Phase 4 — Bundle-hygiene completion (load times, issue P-3)

Phase 1 fixed the entry-bundle data problem; the vendor-stack duplication
remains:

- **4.1 Consolidate map stacks.** Three coexist — mapbox-gl (1.6 MB chunk +
  token), maplibre-gl, leaflet/react-leaflet (~12 components). Pick one
  (leaflet is the widest-used and lightest) and migrate the 4 mapbox/maplibre
  components, or lazy-isolate mapbox so only its 2 pages pay for it.
- **4.2 Consolidate chart stacks.** recharts + chart.js both ship; standardize
  on one (recharts is already the admin/article default).
- **4.3 CI budgets (roadmap 1.4).** Add `size-limit` (entry gz ≤ 400 KB) and
  wire `article-perf.spec.ts` + Lighthouse into CI so a regression can't land
  silently. *Gate:* rollup-visualizer diff + perf spec before/after.

---

## 5. Phase 5 — Hardening (security, types, data integrity)

- **5.1 `gdrive-image-proxy` (S-1).** Today it proxies any Drive `?id=` with no
  auth/allowlist/rate-limit — an egress-cost and abuse vector while every other
  function is gated. Validate ids against `srangam_media_assets` (or a stored
  allowlist), add rate-limit + cache headers. *Gate:* function unit test +
  **[LIVE-VERIFY]** an un-allowlisted id is rejected.
- **5.2 Type-safety (T-1).** Kill `no-explicit-any` at the resolver seams first
  (`dek`/`content`/title fields, L-2), then move `strict`/`noImplicitAny` on
  incrementally. Add a `tsc --noEmit` CI gate (excluding the upstream
  force-graph `.d.ts` that currently trips it).
- **5.3 Data integrity (O-1).** Dedupe the duplicate DB rows found in 2.2(g);
  exercise the `srangam_article_versions` append-only invariant (0 rows today)
  so history actually records. **[LIVE-VERIFY]**.

---

## 6. Phase 6 — Documentation truth (D-1)

The README is the drifted artifact both humans and AI tools read first: it
claims the Lovable AI gateway (code uses direct Gemini/OpenAI by design), "800+
cultural terms" (DB ~1,699), "30+ articles" (47), and Google Neural2 TTS as
primary (three providers ship). Reconcile README against `CURRENT_STATUS` /
`ai-provider.ts`, and fold Phases 3–6 back into the master roadmap so the
planning record stays single-source too.

---

## Sequencing & rationale

1. **Phase 2 first** — it is the "firm up logic" work, is already half-done, and
   unblocks the biggest correctness risk (admin edits not rendering / search &
   highlighting drift). Order: 2.2-a → 2.3 → 2.4 → 2.2-b/c/d/e → (wait) → 2.6.
2. **Phase 4 (load-time remainder)** next — high user-visible ROI, low logic
   risk, independent of Phase 2.
3. **Phase 3 (UI/UX)** after an explicit UX audit, so visual change is
   intentional and testable.
4. **Phases 5–6** are continuous hardening/documentation, safe to interleave.

Nothing in this plan changes schema without a migration, writes to live data
without review, or removes a static source before its telemetry proves it is
unused. That is the healing-not-breaking guarantee.
