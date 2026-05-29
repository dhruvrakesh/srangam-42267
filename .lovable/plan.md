## Verified context (from DB + codebase, 2026-05-29)

Before changing anything, I re-ran the truth checks:

- **DB titles & bodies are English-only.** All 44 published rows in `srangam_articles` have `title_langs = [en]` and `content_keys = en` (verified via `jsonb_object_keys`). The two newest rows are `2026-05-27` and `2026-05-25`.
- **JSON articles ship multilingual titles.** `src/data/articles/*.ts` files declare ~9 locale keys per `title` (e.g. `maritime-memories-south-india-complete.ts` has 36 locale-key occurrences across title/dek/tags). Newest JSON `date` is `2025-10-29`.
- **Badge math today** (`LanguageAvailabilityBadge.tsx` line 21–23): `Object.keys(content).length / 9`. `ArticleCard.tsx` line 68 passes `normalizedTitle`. ⇒ JSON cards print **9/9** even though only the title is translated; DB cards print **1/9**.
- **Dedup keys are asymmetric** (`unifiedArticleUtils.ts`): DB rows key on `normalizeSlugKey(article.slug)` = `slug_alias`; JSON rows key on `article.id`. The `SLUG_TO_ID_MAP` in `src/data/articles/index.ts` proves the two namespaces don't agree (e.g. JSON id `maritime-memories-south-india` vs DB `slug_alias` `…-complete-…`). Same article appears twice → with `limit:6` on Home, the older JSON dupe can push the DB dupe below the fold.
- **`useAllArticles` watchdog is silent** (`src/hooks/useArticles.ts` line 70 → 12 s timeout, lines 92–112). On degraded settle the page renders JSON-only (newest 2025-10-29), which is exactly the "latest not on top" symptom on slow mobile (user's viewport is 384 × 737).
- **Phase Y/Z invariants are live** (per Core memory). Render-first/hydrate-second contract must not regress. Resolver attaches pins; consumer never re-fetches. Both are respected by this plan.

Nothing about the badge or sort regression requires DB, RLS, edge functions, or schema. This is a frontend healing exercise.

---

## Phase AA — Body-aware language badge (presentation only)

### AA.1 Documentation-first
- Append a temporal note to `.lovable/plan.md` and `docs/MULTILINGUAL_IMPLEMENTATION.md`:  *"As of 2026-05-29, only `en` body content is stored in `srangam_articles.content`; multilingual titles in JSON corpus must not be conflated with translation coverage. Badge truth = body keys, not title keys."*
- New `mem://i18n/coverage-badge-truth` memory referenced from index Core.

### AA.2 Make the badge body-aware (non-breaking)
`src/components/language/LanguageAvailabilityBadge.tsx`:
- Add optional `bodyContent?: MultilingualContent` **and** optional `availableLanguagesOverride?: SupportedLanguage[]`. When either is provided, compute availability from those (filter for non-empty trimmed strings). When neither is provided, retain today's behaviour (title-keys), so other callers (`MultilingualSearchResults.tsx`) are unaffected.
- Tooltip line under the chip ("body translated in N/9 languages") to disambiguate from title coverage. Title languages still surface in the `showDetails` grid as a secondary signal but no longer drive the headline number.

### AA.3 Carry body coverage cheaply on every card
`src/hooks/useArticles.ts`:
- Add `bodyLanguages: SupportedLanguage[]` to `DisplayArticle`. Compute once in the `.map(...)` projection: `Object.keys(article.content).filter(k => typeof article.content[k] === 'string' && (article.content[k] as string).trim().length > 0)`.
- Keep returned payload small — we project, we don't ship the full `content` JSONB to the card.

### AA.4 JSON-side coverage parity
`src/lib/unifiedArticleUtils.ts` + `src/lib/multilingualArticleUtils.ts`:
- When merging JSON entries, attach `bodyLanguages` derived from `getArticleCoverageMap(article.id)` (already present in `src/lib/i18n/coverageData.ts`). For JSON articles with no coverage record, default to `['en']`. This stops the 9/9 lie for JSON dupes too.

### AA.5 Wire it in
`src/components/ui/ArticleCard.tsx`:
- Pass `availableLanguagesOverride={article.bodyLanguages}` to `<LanguageAvailabilityBadge>`. Keep `content={normalizedTitle}` so the existing per-language grid (in `showDetails`) still works.

**Blast radius:** 4 files, all presentation/data-shape. JSON-only callers untouched. No tests need rewriting; add one targeted unit test that an English-only DB article reports `1/9`.

---

## Phase AB — Restore "newest first" on Home and Articles (logic + observability)

### AB.1 Documentation-first
- Append to `.lovable/plan.md` and `docs/architecture/SYSTEM_ARCHITECTURE.md`:  *"List-page merge uses a cross-source alias index. Same article from JSON and DB must collapse to one card. DB wins on tie-break."*
- Add `mem://articles/cross-source-alias-dedup` and update existing `mem://articles/unified-source-deduplication` with a "Phase AB amendment" cross-link.

### AB.2 Cross-source alias dedup (no behaviour change for unique rows)
`src/lib/unifiedArticleUtils.ts`:
- Build `dbIdentifiers: Set<string>` by walking DB rows and inserting **all** of `{normalizeSlugKey(slug), slug_alias, id}` (lowercased, trimmed, trailing-punctuation stripped — matches `src/lib/slugResolver.ts`).
- When walking JSON rows, derive candidate keys `{id, normalizeSlugKey(slug), SLUG_TO_ID_MAP[slug]}` (re-uses the existing alias table). Skip if any candidate is already in `dbIdentifiers`.
- Tie-break the sort: when two rows share the same `date`, prefer `source === 'database'`.

### AB.3 Deterministic DB ordering
`src/hooks/useArticles.ts`:
- Chain `.order('published_date', { ascending: false }).order('created_at', { ascending: false })` so two same-day rows never flip between renders.

### AB.4 Make degradation visible (don't break render-first/hydrate-second)
`src/hooks/useArticles.ts`:
- Export an `isDegraded: boolean` (true when the watchdog timed out / aborted on the last attempt). React Query already settles; this is read off the existing structured `articles_fetch_degraded` log line.
- `src/pages/Home.tsx` and `src/pages/Articles.tsx`: when `isDegraded`, render a small `bg-card` pill near the sort controls: *"Showing cached articles — syncing latest…"* with a single "Retry" button calling `refetch()`. Pill disappears as soon as `dbArticles` arrives. **Does not gate the grid** — the Phase X.8 invariant still holds.

### AB.5 Observability
- Lift the existing `articles_fetch_degraded` console.warn into `srangam_event_log` via a small fire-and-forget `supabase.from('srangam_event_log').insert(...)` (table already exists, RLS already accepts public inserts). Same JSON shape, now durable. Cost: 1 row per degraded session; well under noise floor.
- Add `articles_merge_dedup` event once per session with `{ db_count, json_count, merged_count, dedup_drops }` so we can verify in production that the dedup change is doing real work.

**Blast radius:** 4 files + 1 optional log row insert. No DB migration. Reverts independently per file.

---

## Phase AC — Regression guardrails (test only)

`src/__tests__/responsive/` already houses targeted tests. Add:
- `articles-merge-dedup.test.ts` — given DB row with `slug_alias='maritime-memories-…-complete'` and JSON row with `id='maritime-memories-south-india'`, expect **one** merged card and DB wins.
- `language-badge-body-truth.test.tsx` — DB-source row with `bodyLanguages=['en']` renders `1/9`; JSON-source row with `bodyLanguages=['en','ta','hi']` renders `3/9`.
- `articles-sort-determinism.test.ts` — two rows with identical `date`, DB row first.

No production code changes here; tests pin the invariants from AA and AB so future refactors fail loudly.

---

## What is explicitly NOT in this plan

- No DB migration, no RLS change, no edge-function deploy.
- No new tables, no schema bump on `srangam_articles`.
- No change to `slugResolver`, `articleResolver`, or the article-detail page rendering.
- No change to render-first/hydrate-second invariant (Phase X.8) or per-article pin map (Phase Y).
- No mobile typography or layout changes (Phase P invariants untouched).
- No restructuring of `MULTILINGUAL_ARTICLES`, `SLUG_TO_ID_MAP`, or the JSON corpus.
- No re-introduction of any of the rejected approaches from previous rounds.

## Rollout & rollback

| Phase | Files | Revert cost | User-visible signal |
|------|------|------|------|
| AA | 4 files | per-file revert | badge reads body truth (1/9 today) |
| AB | 4 files + 1 log insert | per-file revert | newest DB articles back on top; degraded pill on slow networks |
| AC | tests only | drop file | CI red on regression |

Each phase is independently shippable in the order AA → AB → AC. AA is the cheapest visible win and unblocks a truthful translation-roadmap discussion; AB restores the "latest on top" expectation without changing the merge contract elsewhere in the app.
