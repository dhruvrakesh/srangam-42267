## Phase G3 — Gazetteer expansion (shipped 2026-05-29)

**Before:** 32 rows (maritime-only). 11/45 articles with pins, 27 total pins.
**After migration:** 112 rows. UNIQUE(canonical_name) constraint added; ~80 inland places inserted idempotently (Śakti Pīṭhas 10, Jyotirliṅgas 12, Janapada capitals/cities 16, Kashmir 8, Indus/Iron-Age 7, Indo-Iranian/BMAC 5, Janajāti 7, SE-Asia 8, acoustic/temple 6, Australia 1).

**User action required to complete:** open Admin → Geography & Media → click "Backfill all published" with `only_zero_pin:true`, `limit:50`. Phase Z's nightly cron also picks up the rest at 03:00 UTC at 20/night. Expected cost ≤ $0.04.

**Acceptance gates (verify after backfill run):**
1. `SELECT count(*) FROM srangam_gazetteer` → 112. ✅ (already true).
2. `srangam_admin_jobs` row for the run: `status='succeeded'`, `failed=0`.
3. `SELECT count(DISTINCT article_id), count(*) FROM srangam_article_pins` → expect ≥ 30 / ≥ 100.
4. Admin · Geography & Media stat card → "With pins" ≥ 30 / 45; spot-check Hinglaj, Somnātha, Saffron-and-Blue, Sat-Sar Springs rows.
5. Public `/articles/hinglaj-…` → `ArticleMiniMap` auto-mounts (IntersectionObserver, 200px rootMargin) under "Geographical Context".
6. `/maps-data?focus=<slug>` → cluster dims non-matching to 0.15 opacity.

**Documentation deliverables (done in this turn):**
- `docs/CONTENT_ARCHITECTURE.md` → new "Gazetteer Governance" section (taxonomy frozen, deletion guard, baseline).
- `mem://geo/gazetteer-coverage-baseline` → 112-row baseline + rules.
- `mem://index.md` → Core invariant updated.

---

## Approved roadmap (one phase per turn)


## Revived context (all verified live, 2026-05-29)

### Why "11 / 45 with pins" is correct — and what the real bottleneck is

The pin pipeline executed cleanly on every published article (edge logs show `pin_complete` for all 45). The numbers in the admin UI are honest:

```text
published articles ............... 45
distinct articles with ≥1 pin .... 11
total pins ....................... 27
gazetteer rows ................... 32
```

The DB-backed gazetteer is **maritime-only**. Every one of the 32 rows is `feature_type ∈ {port, harbour, inscription_site, city}` along the Indian Ocean rim — Aden, Muziris, Tāmralipti, Kāveripattinam, Berenike, Quanzhou, Kedukan Bukit, Võ Cảnh, Kandahar, Bujang Valley, Zanzibar, etc. There is **not a single** Śakti Pīṭha, Jyotirliṅga, Mahājanapada capital, Janajāti cave, Indo-Iranian site, Vedic-period city, or Kashmir/Kangra sacred-geography entry. So:

- All 11 articles that produced pins are the maritime / inscription / Indian-Ocean ones (`scripts-that-sailed-ii` → 8 pins, `untitled-article` (Ocean as Archive) → 7 pins, `vishnu-shiva-hari-hara` → 2, etc.).
- Inland sacred-geo articles (`hinglaj-kamakhya`, `somn-tha-prabh-sa`, `mah-vidy-s-mountains`, `the-saffron-and-the-blue` (Ayodhya), `sat-sar-springs`, `gop-dri-k-yapa-and-var-ham-la`, `dashanami-ascetics-n-th-yogis`, `indo-iranian-schism…-dwaraka`, `the-asura-exiles`, `under-the-sacred-tree`, etc.) return `inserted:0` because their places aren't in the gazetteer.
- Both the deterministic name-variant scan and the AI NER pass match against the same 32 rows, so AI cannot rescue what the gazetteer doesn't know.

`GeographyMedia.tsx` is wired correctly (`pin_count = COUNT(pins) per article_id`, `withPins = pin_count > 0`). The "0 pins" badge on Hinglaj/Naga-Compact/Somnātha rows is the truth, not a UI bug.

Article pages already auto-mount `ArticleMiniMap` (lazy-loaded in `OceanicArticlePage.tsx:556`) whenever `pins.length > 0` — so the moment the DB has pins for an article, the in-article map appears with no client changes.

### CX.1 — fully shipped, verified

Latest snapshot row `2026-05-29 12:32:52`:
`articles=45, terms=1724, tags=185, cross_refs=1273, modules=13`, `stats_detail.generated_with='CX.1'`, populated `correlation` object, structured `top_terms` array. Bundle uses the same authoritative path and the corrected 9-language list (Pnar in, Pali out). No CX.1 follow-up required.

### GDrive duplication — confirmed bigger than I claimed

`tts-save-drive/index.ts` (lines 44–170) re-implements the **identical** RS256 JWT + `oauth2.googleapis.com/token` exchange + `upload/drive/v3/files?uploadType=multipart` + `permissions` flow that `context-save-drive/index.ts` (lines 251–345) uses. CX.2's `_shared/google-drive.ts` will collapse both. No third caller exists today.

---

## Enterprise sequencing — one phase per turn

Each phase is additive, independently revertible, gated by verification, and never breaks the previous behaviour (a fallback path stays alive until the new path is confirmed).

---

### Phase G3 — Gazetteer expansion (the UI-visible fix)

**Surgical, additive, no schema change.** One INSERT-only migration; one admin-button re-run of `backfill-article-pins`.

**Coverage targets (audited against actual published slugs, not invented):**

| Category | Rows | Articles unblocked |
|---|---|---|
| Śakti Pīṭhas (10) | Hinglaj, Kāmākhyā, Vindhyāchal, Kālīghāt, Jvālāmukhī (Kangra), Naina Devi, Tārā Tāriṇī, Chinnamastā (Rajrappa), Bagalāmukhī (Datia), Mātaṅgī | `hinglaj-kamakhya`, `mah-vidy-s-mountains-and-mysteries`, `from-dev-s-kta-to-dev-m-h-tmya` |
| Jyotirliṅgas (12) | Somnātha, Mahākāleśvara (Ujjain), Omkāreśvara, Kedārnāth, Bhīmaśankar, Kāśī Viśvanāth, Tryambakeśvar, Vaidyanāth (Deoghar), Nāgeśvar, Rāmeśvaram, Ghṛṣṇeśvar, Mallikārjuna | `somn-tha-prabh-sa`, `dashanami-ascetics-n-th-yogis`, `vishnu-shiva-interplay`, `har-har-hari-hari` |
| Janapada capitals / sacred cities (15) | Ayodhyā, Mathurā, Vārāṇasī, Hastināpura, Indraprastha, Pāṭaliputra, Kauśāmbī, Ujjain, Vidiśā, Sanchi, Nālandā, Takṣaśilā, Dvārakā, Prabhāsa, Gwalior, Patiala | `the-saffron-and-the-blue`, `reassessing-ashoka-s-legacy`, `indo-iranian-schism…-dwaraka`, `the-gwalior-interface`, `baba-ala-singh`, `ancient-tribes-of-bh-ratavar-a`, `where-civilization-never-slept`, `tracing-ancient-k-atriya-tribes` |
| Kashmir sacred geography (8) | Satīsar (Anantnag), Gopādri (Gwalior hill, distinct), Varāhamūla (Baramulla), Mārtāṇḍ, Śaṅkarācārya Hill (Srinagar), Jakhbar, Nartiang Monoliths, Kheer Bhawani | `sat-sar-springs`, `gop-dri-k-yapa-and-var-ham-la`, `srangam-project-research-report-on-jakhbar`, `n-ga-compact-across-kashmir-kerala-and-bali` |
| Indus / Iron-Age archaeology (7) | Mehrgarh, Mohenjo-daro, Harappa, Dholavira, Kalibangan, Rakhigarhi, Bhirrana | `reassessing-the-antiquity-of-the-rigveda`, `deep-dive-indo-iranian-origins-and-zoroastrianism`, `geomythological-research-dossier`, `the-anu-and-the-druhyu` |
| Indo-Iranian / BMAC (5) | Gonur Tepe (BMAC), Tell Halaf (Mitanni heartland), Nausharo, Shahr-i Sokhta, Ganj Dareh | `the-asura-exiles`, `deep-dive-indo-iranian-origins`, `indo-iranian-schism…-dwaraka` |
| Janajāti / petroglyph / megalith (8) | Bhimbetka, Edakkal, Kupgal (Bellary), Sanganakallu, Konthagai, Adichanallur, Pattanam, Khasi-Jaintia plateau (Nartiang already above) | `stone-song-and-sea`, `ringing-rocks-and-rhythmic-cosmology`, `janaj-tiya-oral-traditions`, `graphic-transmission-from-rock-art` |
| Maritime gaps to fill alongside existing rim (8) | Borneo (Sambas), Champa (Mỹ Sơn), Srivijaya (Palembang already as city — add inscription-site row), Bali (Pejeng / Goa Gajah), Java (Prambanan), Funan (Óc Eo), Angkor, Kedah inscription (already in DB) | `scripts-that-sailed-ii`, `untitled-article` (Ocean as Archive), `jambudvipa-connected`, `n-ga-compact-across-kashmir-kerala-and-bali` |
| Acoustic / temple / harvest tree (6) | Hampi, Sittannavasal, Tigawa, Belur, Halebidu, Lepakshi | `ringing-rocks-and-rhythmic-cosmology`, `under-the-sacred-tree` |
| Australia (1) | Bunjils Shelter (Black Range, Victoria) | `shiva-bunjil-altair-connections`, `the-celestial-bridge` |

Total: **~80 new rows**, taking the gazetteer from 32 → ~112. Conservative; can grow later via the same channel.

**Per-row content contract:**
- `canonical_name`: most-common English form, with disambiguator if needed (e.g. `Gopādri (Mathurā / Govardhana hill)`).
- `name_variants`: array containing IAST diacritic form, common ASCII fallback, Devanagari (where unambiguous), and 1–2 historic exonyms (e.g. `[Pāṭaliputra, Pataliputra, Patna, पाटलिपुत्र]`).
- `latitude` / `longitude`: from public sources (Wikidata / OpenStreetMap), rounded to 4 decimals — atlas-level precision is sufficient.
- `feature_type`: extend the existing taxonomy strictly — `pitha`, `jyotirlinga`, `capital`, `city`, `port`, `harbour`, `inscription_site`, `archaeological_site`, `cave_shelter`, `temple_complex`, `mountain`, `monolith_site`.
- `era_tags`: `['vedic'|'puranic'|'maurya'|'gupta'|'medieval'|'mughal'|'colonial'|'prehistoric']` subset; powers future filtering.
- `country`: ISO English name. `precision = 'point'` for everything in this batch.
- `external_refs`: `{ wikidata: 'Qxxxxx' }` when known; empty `{}` otherwise.

**Execution (build-mode):**
1. **Migration** — single transactional INSERT block, idempotent via `ON CONFLICT (canonical_name) DO NOTHING`. No schema change. (Will need a one-line additive `ALTER TABLE … ADD CONSTRAINT srangam_gazetteer_canonical_name_key UNIQUE (canonical_name)` if it doesn't already exist — check first; harmless if it does.)
2. **Re-run backfill** — admin clicks "Backfill all published (50 max)" with `only_zero_pin:true` (or call the function with that body directly). Phase Z's nightly cap of 20/night does not apply to manual runs. Estimated cost @ ≤ $0.001/article × ~34 zero-pin articles ≈ **$0.034**.
3. **Cache invalidation** — none required. `GeographyMedia.tsx` uses TanStack Query keyed `['admin', 'geography-media', 'articles']`; the "Refresh stats" button already calls `refetch()`. Same for public article pages — they re-query pins through `articleResolver`/`articlePins` on next load.

**Verification (must pass before phase is declared done):**
1. `SELECT count(*) FROM srangam_gazetteer` → ≥ 110.
2. Job row in `srangam_admin_jobs`: `status='succeeded'`, `processed=total`, `failed=0`.
3. `SELECT count(DISTINCT article_id), count(*) FROM srangam_article_pins` → ≥ 30 / ≥ 100.
4. Admin · Geography & Media stat card → `With pins` ≥ 30 / 45; spot-check rows for Hinglaj, Somnātha, Saffron-and-Blue.
5. Public `/articles/hinglaj-k-m-khy-…` → `ArticleMiniMap` mounts under "Geographical Context".
6. `/maps-data?focus=hinglaj-k-m-khy-…` → cluster on the public Article Atlas dims correctly.

**Documentation deliverables:**
- `docs/CONTENT_ARCHITECTURE.md` → new "Gazetteer governance" subsection (canonical_name uniqueness, IAST + Devanagari variants required, feature_type taxonomy frozen, era_tags vocabulary, "never delete a gazetteer row referenced by `srangam_article_pins` — soft-mark via `notes` instead").
- `docs/SYSTEM_FLOWCHARTS.md` → update the pin-backfill flow to show the gazetteer as a first-class input, not implicit.
- `.lovable/plan.md` → append G3 entry with before/after counts and the per-article delta.
- New memory file `mem://geo/gazetteer-coverage-baseline-2026-05` capturing the 112-row baseline, the taxonomy, and the deletion guard.

---

### Phase CX.2 — Shared metrics + GDrive helpers (no migration) — SHIPPED 2026-05-29

**Status:** Deployed. Snapshots from `/admin/context` now write `generated_with:'CX.2'` and no `_compat` key.

**Shipped modules:**
1. `supabase/functions/_shared/google-drive.ts` — `loadServiceAccount()`, `getDriveAccessToken()`, `uploadToDrive()` (handles base64 + text bodies, anyone-with-link sharing, Shared Drive parent). Lifted the duplicated RS256 JWT + multipart-upload block out of both `context-save-drive` and `tts-save-drive`.
2. `supabase/functions/_shared/context-metrics.ts` — `countAuthoritative()` (head:true, count:'exact' for the four tables + paginated `countDistinctModules`), `topThemes()`, `topTags()`, `topTerms()`, `recentCrossRefs()`, `latestCorrelationSummary()`. Every helper takes the client as a parameter.

**Refactors (behavior identical):**
- `context-save-drive/index.ts` → uses both helpers; `_compat` removed; `generated_with` bumped to `'CX.2'`.
- `tts-save-drive/index.ts` → uses `_shared/google-drive.ts`; inline JWT/upload block deleted.
- `context-bundle-generator/index.ts` → uses `_shared/context-metrics.ts` for counts + correlation; inline blocks deleted.
- `context-diff-generator/index.ts` → consumes structured `themes` (Record) + `top_tags` (Array<{name,...}>); falls back to `mode:'count_only'` with a `reason` when either snapshot predates CX.2 (frozen baseline).

**Verification (user-side, post-deploy):**
1. Trigger a new snapshot from `/admin/context`; row has `generated_with:'CX.2'`, no `_compat` key, counts identical to last CX.1 row.
2. Diff CX.2 vs CX.1 → succeeds with structured changes + `mode:'identity'`.
3. Diff CX.2 vs a pre-2026-05-29 snapshot → succeeds with `mode:'count_only'` + a `reason` (no crash).
4. Smoke-test one narration via admin "Generate narration" button → `tts-save-drive` still uploads, GDrive share URL returned.

**Documentation deliverables (this loop):**
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` → mark `_compat` retired; document the shared module API surface.
- Core memory invariant updated: "GDrive JWT + multipart upload lives in `_shared/google-drive.ts` — never re-inline in a new function. Snapshot counts come from `_shared/context-metrics.ts:countAuthoritative()`."


---

### Phase CX.3 — Identity-set diffs (the only CX phase with a migration)

**Goal:** turn diff reports from count-deltas into real "these slugs / tags / terms were added/removed" lists — what the diff UI implicitly promises.

**Migration (additive, reversible):**
```sql
ALTER TABLE public.srangam_context_snapshots
  ADD COLUMN IF NOT EXISTS identity_sets jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_srangam_context_snapshots_identity_sets
  ON public.srangam_context_snapshots USING gin (identity_sets jsonb_path_ops);
```
Shape:
```json
{
  "article_slugs": ["slug-a", "slug-b", "…"],
  "tag_names":     ["…"],
  "term_slugs":    ["…"],
  "module_names":  ["vedic-puranic", "…"]
}
```
No new GRANTs / RLS — the table is already admin-read/admin-insert; the column inherits. No public exposure. No UPDATE policy added — snapshots stay immutable.

**Edge-function changes:**
- `context-save-drive` (already CX.2 at this point) populates `identity_sets` from paginated `select('slug')` / `select('tag_name')` / `select('slug')` / `select('module' DISTINCT)`. Bump `generated_with` to `'CX.3'`.
- `context-diff-generator` performs set-diff per dimension and returns:
  ```ts
  {
    mode: 'identity' | 'count_only',
    articles: { added: string[], removed: string[], unchanged_count: number },
    tags:     { … },
    terms:    { … },
    modules:  { … },
  }
  ```
  Falls back to `mode:'count_only'` when `previous.identity_sets` is `{}` (pre-CX.3) — never raises.

**Verification:**
1. Snapshot → publish one new article → snapshot again → diff returns `articles.added=['new-slug']`.
2. Diff CX.3 ↔ CX.2 → `mode:'count_only'` (no crash).
3. `SELECT pg_column_size(identity_sets) FROM srangam_context_snapshots ORDER BY snapshot_date DESC LIMIT 5;` → expect a few KB per row (≪ 100 KB), well within Postgres TOAST defaults.

**Documentation deliverables:**
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` → CX.3 section + diff UX explanation + screenshot of new diff payload.
- `docs/DATABASE_SCHEMA.md` → add `identity_sets jsonb` to the `srangam_context_snapshots` table card.
- Memory invariant: "Snapshots ≥ CX.3 carry `identity_sets`; diff generator tries identity-diff first, count-only fallback never raises."

---

## Out of scope (deferred deliberately)

- **CX.4** — AI executive summary into the existing-but-unused `context_summary` column.
- **Daily snapshot cron** — separate small phase once CX.3 lands and the diff UI is trusted.
- **G4** — standardising other background jobs (correlate-corpus, batch-enrich-terms, backfill-bibliography) on the Phase Z self-pump+heartbeat pattern.
- **G5** — Playwright e2e for the pin + atlas flow.
- **Imaging-handoff visual QA** — orthogonal to context/geo.

## Suggested order

1. **G3** — immediate user-visible fix, 1 migration + 1 admin click, ~$0.04.
2. **CX.2** — pure refactor, no migration, drops ~320 LOC.
3. **CX.3** — 1 additive migration, unlocks the diff UI.

Each phase is independently shippable. The previous behaviour stays alive at every step via explicit fallbacks (`_compat` array, `mode:'count_only'`, idempotent INSERT, `loadArticlePins` already tolerates an empty pin set). Nothing here changes the public RLS surface or the article rendering contract (Phase AR.1–AR.3 invariants).
