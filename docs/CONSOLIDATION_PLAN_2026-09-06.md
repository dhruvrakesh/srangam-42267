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

### CORRECTION, measured 2026-09-06 19:58 in the SQL editor

`consolidate_01_evidence.sql` §6 returned:

```
non_english_chars_in_db = 160,991     rows_multilingual = 3     rows_total = 58
```

Set against the registry, scored with the placeholder rule:

| | non-English characters |
|---|---:|
| static registry, total | 58,517 |
| &nbsp;&nbsp;of which placeholder | 11,660 |
| &nbsp;&nbsp;**of which real** | **46,857** |
| **live database** (3 rows) | **160,991** |

**The database already holds 3.4× more real non-English text than the entire
static registry.** The three multilingual rows — `baba-ala-singh-patiala`
(en,hi,pa), `devi-sukta-mahatmya` (bn,en,hi) and `saffron-blue-ayodhya`
(en,hi,pa) — average roughly 27,000 characters per non-English body. Those are
full translations, not blurbs.

This inverts the assumption this section previously recorded. The registry is
**not** the multilingual reserve; the DB is. "3 of 58 rows are multilingual"
counts rows and undercounts the corpus by a wide margin — the same
presence-versus-substance error, made in the opposite direction.

**Consequence for roadmap 2.6 (registry retirement):** the multilingual blocker
is far smaller than the Master Plan assumed. The 46,857 real registry characters
are worth migrating, but they are concentrated in three or four articles
(`riders-on-monsoon` hi/ta/te, `ashoka-kandahar-edicts` hi/ta/te,
`scripts-that-sailed` hi/pa/ta) plus a handful of short card blurbs. Migrate
those; do not migrate the 11,660 characters of placeholder.

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


---

## 9. EVIDENCE LANDED — the plan above is superseded where it conflicts

`docs/db_evidence.csv`, exported 2026-09-06 20:04, is the first look at actual
body lengths. Three conclusions replace earlier guidance.

### 9.1 The nine "drafts" are empty shells

| chars | slug | | chars | slug |
|---:|---|---|---:|---|
| 109 | kutai-yupa-borneo | | 88 | scripts-that-sailed |
| 93 | earth-sea-sangam | | 86 | monsoon-trade-clock |
| 92 | chola-naval-raid | | 81 | stone-purana |
| 90 | indian-ocean-power-networks | | 80 | riders-on-monsoon |
| | | | 60 | geomythology-land-reclamation |

Characters, not words. Published rows run from 7,462 to 568,471 characters. The
gap between 109 and 7,462 is the entire finding.

So **publish is the wrong verb**. Q2's "import" would duplicate; my "publish 8"
would put ~90-character pages on the site. The content exists in the static
registry; the row exists in the DB; they have never been joined. The operation
is **UPDATE the existing row**, which preserves its id and every foreign key.
`scripts/emit-draft-fill-sql.mjs` generates that SQL, idempotently
(guarded by `en body < 200 chars`, so it can only ever fill a shell).

Of the eight fillable shells, only three have a registry body worth publishing —
`stone-purana` (38,844), `riders-on-monsoon` (9,210), `scripts-that-sailed`
(7,181). The other five have registry bodies of 235–975 characters; they are
filled but held as drafts, because they need writing, not publishing.

### 9.2 Wherever both exist, the DATABASE always wins

Joining the registry census to the evidence export across all 28 registry
articles:

- **14** have a published DB row that is **larger** — from 1.3× (`jambudvipa`)
  to 143.7× (`reassessing-rigveda-antiquity`: registry 289 chars, DB 41,538).
- **9** appear "registry larger" only because the DB row is one of the shells.
- **5** are absent from the DB entirely.

**There is not one case where a published DB row is smaller than its registry
twin.** The static registry is a stale, smaller copy everywhere the two overlap.
That removes the main objection to roadmap 2.6: for the 14, retiring the
registry loses nothing. The only registry-only content is the 5 absent articles,
of which `gondwana-to-himalaya` (780) and `pepper-and-bullion` (271) are blurbs.

### 9.3 Q3's duplicate count is right; two of its three pairs are not

Two rows with byte-identical English lengths are the same document imported
twice. Nothing else produces an exact collision at 34,000+ characters.

| chars | winner (human title) | loser (filename title) |
|---:|---|---|
| 54,798 | `celestial-bridge-shaivism-bunjil` | `shiva-bunjil-altair-connections` |
| 36,359 | `har-har-hari-hari` | `vishnu-shiva-hari-hara` |
| 34,178 | `asura-exiles-mitanni` | `deep-dive-indoiranian-origins` |

Disproven from the earlier list: `janajatiya-oral-traditions` (107,177) vs
`janajatiya-traditions-oral-continuities` (63,183) — different lengths and
titles; and `vishnu-shiva-hari-hara` vs `vishnu-shiva-interplay` (538,809) — a
15× gap. I paired both by slug similarity and both were wrong. Slug text does
not survive this importer's diacritic stripping; **length does**.

Still unresolved: `vedic-preservation-sarira` (47,288) vs
`sarira-atman-preservation-vedas` (28,736) — plausibly a chapter and the full
paper. `consolidate_03` §6 prints both openings so a person decides.

---

## 10. Incident: a shell redirect corrupted a file that writes article bodies

**2026-09-06 15:10 UTC.** The command in the runbook was

```powershell
node scripts\emit-draft-fill-sql.mjs > consolidate_02b_fill_shells.sql
```

Windows PowerShell 5.1 decodes a program's stdout using the OEM console code
page (437/850), then `>` writes the result as UTF-16LE. Node emitted correct
UTF-8; two layers of the shell destroyed it before it reached disk.

| in the registry | in the file that was run |
|---|---|
| `Purāṇa` | `Pur─üß╣ça` |
| `Śāstra` | `┼Ü─üstra` |
| `Geo‑Heritage` | `GeoΓÇæHeritage` |
| `यस्य आज्ञया` | `αñ»αñ╕αÑìαñ» αñåαñ£αÑìαñ₧αñ»αñ╛` |

The file carried **8 UPDATE statements that write article bodies**, and it was
run. Whether it committed is what `consolidate_05_ENCODING_DAMAGE_CHECK.sql`
determines.

The size difference is itself the proof: the corrupt file decoded to 139,198
characters, the regenerated one is 92,563. OEM mis-decoding expands every
multi-byte character into two to four, so the 46,635-character gap is exactly
the corruption.

### Fixes, all structural rather than procedural

1. **`scripts/emit-draft-fill-sql.mjs` and `scripts/coherence/pipeline.py`
   write their own files** with explicit UTF-8. Neither prints SQL to stdout.
   There is no redirect left to get wrong.
2. **`scripts/split-sql-sections.py`.** The Supabase editor shows only the last
   statement's result, and that hid the answer four separate times today —
   `consolidate_01` §1 behind §6, `consolidate_03` §4 failing because §1 was
   never pasted with it, `consolidate_03` §6 behind §7, `consolidate_05` §1–§3
   behind §4. Telling a person to "run one section at a time" does not fix a
   trap; splitting the file does.
3. **`consolidate_05` is a single statement** and returns one table with a
   plain-English `verdict` column per row.

### The rule this establishes

Any generated artefact that will be executed — SQL, JSON, a data file — is
written by the program that generates it, in an encoding that program names.
It never travels through a shell redirect, a clipboard, or a console. The three
Devanagari-bearing projects in this estate make that non-negotiable: a mangled
diacritic in a build script is an annoyance, and a mangled diacritic in a
Sanskrit corpus is data loss.
