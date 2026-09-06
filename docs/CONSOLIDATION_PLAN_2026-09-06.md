# Srangam Corpus Consolidation Plan

**Date**: 2026-09-06
**Status**: measured, not yet executed
**Supersedes**: Master Plan Q2 (import 13) and Q3 (3 duplicates) — both are
restated below with corrected numbers.

Every figure here was computed from two artefacts and can be recomputed:

```
node   scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
python scripts/reconcile-inventory.py
node   scripts/registry-language-census.mjs
```

---

## 1. What the reconciliation found

The parity report names **24 registry articles as "MISSING IN DB"** and tells
you to import them. Reconciled against the privileged 58-row SQL-editor
inventory:

| | count | what it really is | correct action |
|---|---:|---|---|
| exists as a **draft**, exact slug | 9 | the anon key cannot see drafts (RLS) | **publish** |
| exists **published** under another slug | 10 | `canonicalSlugMap.ts` already records the pair | **nothing** |
| genuinely absent | 5 | | **import** |
| | **24** | | |

**Importing the list as printed would create 19 duplicate rows** — the exact
defect Q3 exists to clean up. The gate manufactures the problem it prevents.

The five genuinely absent articles are `ashoka-kandahar-edicts`,
`cosmic-island-sacred-land`, `gondwana-to-himalaya`,
`maritime-memories-south-india`, `pepper-and-bullion`.

### Q2 restated
> ~~Import the 13 genuinely-missing articles~~ → **import 5, publish 8.**

Eight of Q2's thirteen are already rows in the table. The ninth draft,
`geomythology-land-reclamation`, is not on Q2's list and must not be published —
it duplicates a published row (see §3).

---

## 2. Why the gate was wrong three times over

Each defect has the same shape: **the gate scores presence, never substance.**

1. **RLS blindness** — the script authenticates with the anon key; RLS restricts
   public `SELECT` to `status='published'`, so drafts are invisible. Its own
   `📝 DRAFT` branch was unreachable dead code. The file's line-90 comment says
   "2026-07-12 fix: drafts were being misreported as missing" — the comment was
   updated, the key never was, so the fix never took effect for two months.
   *Fixed by `patch_parity_rls.py` + `patch_parity_offline.py`.*

2. **It ignores the repo's own slug map** — `src/data/articles/canonicalSlugMap.ts`
   holds 11 hand-verified registry-id → DB-slug pairs and is used by the list
   page, but the parity script matches only `slug` and `slug_alias`. Ten
   published articles were reported missing.
   *Fixed by `patch_parity_canonical.py`.*

3. **It counts placeholders as translations** —
   `nonEmptyLangs()` accepted any string with `trim().length > 0`. Measured over
   the 28 registered articles:

   | non-English bodies | count |
   |---|---:|
   | stub (<10% of the English body) | **69** |
   | short (10–60%) | 67 |
   | full (≥60%) | 5 |
   | **total** | **141** |

   `src/data/articles/stone-purana.ts:523` literally reads
   `hi: '…[Professional Hindi translation required - 6,500 words]'`.
   `janajati-oral-traditions` has 71,299 English characters against eight
   32-character "translations". The report's two `⚠️ CONTENT GAP` rows
   (`jambudvipa-connected`, `sacred-tree-harvest-rhythms`, both "DB missing
   languages: as,bn,hi,kn,pa,pn,ta,te") are measuring placeholders. Acting on
   them would push placeholder text onto the public site.
   *Fixed by `patch_parity_canonical.py`.*

---

## 3. Duplicates — what is proven and what is not

Token overlap on **raw slugs finds nothing**: the importer's slugifier drops
diacritics to nothing, so one twin reads `sarira` and its pair reads `ar-ra`.
Overlap on **`slug_alias`** (clean on all 58 rows) finds four candidates.

| pair | status | evidence |
|---|---|---|
| `geomythology-land-reclamation` (draft) ↔ `geomythology-cultural-continuity` (published) | **CONFIRMED** | `canonicalSlugMap.ts` maps the registry id to the published row while a draft of the same id also exists |
| `janajatiya-oral-traditions` ↔ `janajatiya-traditions-oral-continuities` | candidate | alias Jaccard 0.75 |
| `vedic-preservation-sarira` ↔ `sarira-atman-preservation-vedas` | candidate | alias Jaccard 0.40 |
| `vishnu-shiva-hari-hara` ↔ `vishnu-shiva-interplay` | candidate | alias Jaccard 0.40 |
| `scripts-that-sailed` ↔ `scripts-sailed-epigraphic-atlas` | **false positive** | Part I and Part II are different articles |

The three candidates match Q3's three named pairs, but **candidate is not
confirmed**. Each must be checked on title and body length
(`consolidate_01_evidence.sql` §3) before any merge. A merge decided from a slug
is how these rows got here.

### Root cause
`docs/` holds the original imported markdown, and several exist in numbered
copies — `Janajātiya Traditions… (1).md` and `(2).md`; `Stone, Song, and Sea… (1).md`
and `(2).md`; `Under the Sacred Tree… (2).md` and `(3).md`; `Scripts that Sailed II….md`
and `(1).md`. **These are not a database defect. They are repeated imports of
near-identical files.** Deduping without a uniqueness constraint fixes today
and guarantees a repeat (`consolidate_03` §5).

---

## 4. Slug damage — do NOT "fix" it

39 of 58 slugs are damaged: diacritics dropped (`the-n-ga-compact` for
*Nāga*, `gop-dri-k-yapa-and-var-ham-la` for *Gopādri, Kāśyapa, Varāhamūla*),
`.docx` leaked into one, a stray leading `x` on another, numeric suffixes, and
one `untitled-article`.

**All 39 already carry a clean `slug_alias`, and `articleResolver.ts` resolves
alias-first.** No user ever sees a damaged slug. Renaming them is cosmetic and
is the single most dangerous action available here — it breaks every existing
URL and external link for zero user-visible gain.

**Decision: do not rename.** Repair the *slugifier* so new imports are clean,
and leave the existing rows alone. The two rows whose damage is user-visible
are metadata, not slugs, and are fixed in the admin UI:
`untitled-article` (title) and the imported titles ending `.docx (1)`.

---

## 5. Multilingual reality

| | DB | static registry |
|---|---:|---:|
| articles | 58 | 28 |
| rows with >1 language | **3** | 20 |
| non-English bodies | 6 | 141 (**69 are placeholders**) |
| non-English characters | — | 58,517 (11.6% of registry text) |

The site is effectively English-only, and **the registry is not the multilingual
reserve it appears to be**: half its non-English bodies are placeholder strings.

**Consequence for roadmap 2.6 (registry retirement):** the blocker is smaller
than assumed, but it is not zero. Before retiring, migrate the ~72 substantive
non-English bodies and the four articles whose registry English body exceeds
the DB's. Do not migrate the 69 stubs.

⚠️ `maritime-memories-south-india-complete.ts` — the file the registry imports —
holds **1,674** English characters, while the unimported
`maritime-memories-south-india.ts` holds **7,963**. Import the longer one.
Check the same for `indian-ocean-power-networks` (697 imported vs 803 not).

---

## 6. Order of execution

Read-only first, reversible next, irreversible last. Nothing below is a bulk
`UPDATE` run on trust.

| # | step | file | reversible? |
|---|---|---|---|
| 0 | apply the parity fix, re-run the gate | `patch_parity_canonical.py` | yes (git) |
| 1 | gather title + body-length evidence | `consolidate_01_evidence.sql` | read-only |
| 2 | publish the 8 drafts, gated on body length | `consolidate_02_publish_drafts.sql` | yes (one UPDATE) |
| 3 | import the 5 genuinely absent | Admin → Markdown Import | delete the row |
| 4 | record + retire the confirmed duplicate | `consolidate_03` §1–3 | yes (audit table) |
| 5 | confirm the 3 candidate pairs, then merge | `consolidate_03` §4 | yes |
| 6 | add the title-uniqueness index | `consolidate_03` §5 | drop the index |
| 7 | fix the slugifier (new imports only) | — | — |

After step 2 the parity report should read **5 MISSING, 10 ALIASED, 0 DRAFT,
0 CONTENT GAP**. If it does not, stop: the export is stale — re-run
`parity_inventory.sql` and re-export before doing anything else.

---

## 7. Q2 again: only 2 of the 5 "absent" articles are actually articles

Before importing the five genuinely-absent registry articles, measure what
would be imported. There is **no markdown source in `docs/` for any of them** —
the static `.ts` module is the only source — and their English bodies are:

| registry article | English body | verdict |
|---|---:|---|
| `cosmic-island-sacred-land` | 38,894 | **import** |
| `ashoka-kandahar-edicts` | 6,086 | **import** (from `-complete.ts`) |
| `maritime-memories-south-india` | 1,674 imported / **7,963** in the unimported file | import — **but take `maritime-memories-south-india.ts`, not `-complete.ts`** |
| `gondwana-to-himalaya` | 780 | card blurb, not an article — **hold** |
| `pepper-and-bullion` | 271 | card blurb, not an article — **hold** |

`index.ts` imports `maritime-memories-south-india-complete.ts` (1,674 English
chars with eight real translations) while `maritime-memories-south-india.ts`
holds 7,963 English chars with Tamil only. The file named "complete" is the
shorter one. Check the same for `indian-ocean-power-networks`: the imported
`-complete` variant has 697 English chars, the unimported one 803.

So Master Plan Q2, measured end to end:

> ~~Import 13~~ → **import 2, import 1 from the correct file, publish 8, hold 2, do nothing for 10.**

`gondwana-to-himalaya` and `pepper-and-bullion` are the same category of problem
as a short draft: importing them puts a 271-character "article" on a public
research site. They need writing, not importing.

---

## 8. Card badges count placeholders (see `docs/UI_LINK_AUDIT_2026-09-06.md` §2)

`src/data/articles/meta.ts` is generated, and its `contentLanguages` drives the
n/9 badge. `scripts/generate-registry-meta.mjs:35` used `v.trim().length > 0`,
so `scripts-that-sailed-ii` records `["en","hi","ta"]` → **3/9** when `hi` and
`ta` are 69 characters each. Truth: **1/9**.

`patch_badge_truth.py` moves the rule into `scripts/lib/substance.mjs` — one
definition, imported by the generator and the parity gate. Preview the exact
effect on all 28 cards with `python scripts/preview-badge-truth.py`: 13 change,
15 are already truthful, seven go 9/9 → 1/9.

The three remaining copies of the rule (`useArticles.ts:63`,
`LanguageAvailabilityBadge.tsx:30`, `coverage.ts`) act on DB rows, whose bodies
are real, so they are logged and left alone. They belong in their own commit.
