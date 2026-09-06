# UI Integrity Audit — internal links, coverage badges, repo sync

**Date**: 2026-09-06 · **Trigger**: a dead link on `/themes/scripts-inscriptions`
**Method**: `node scripts/link-integrity-check.mjs` over 486 source files and
73 internal links, resolved against 89 declared routes, 28 registry articles,
11 canonical-slug pairs and 106 live DB slugs/aliases.

---

## 1. Broken links — 4 found, not 1

| file | line | link | why it 404s | fix |
|---|---:|---|---|---|
| `src/pages/themes/ScriptsInscriptions.tsx` | 113 | `/sarira-atman-vedic-preservation` | `App.tsx:183` declares `/sarira-**and**-atman-vedic-preservation` | → `/articles/sarira-and-atman-vedic-preservation` |
| `src/pages/themes/AncientIndia.tsx` | 191 | `/sarira-atman-vedic-preservation` | same typo, second page | same |
| `src/components/layout/Footer.tsx` | 102 | `/contact` | no such route; **site-wide** | → `/about` (where `mailto:contact@nartiang.org` actually lives, `About.tsx:92`) |
| `src/pages/BatchBujangNagapattinamOcean.tsx` | 90 | `/maps` | route is `/maps-data` (`App.tsx:146`) | → `/maps-data` |

The reported link was one missing `and-`. Two pages carried it. The footer one
is on every page of the site and had nothing to do with the report.

**Why nothing caught it**: a `<Link to>` is a string. The compiler, the bundler
and all 41 tests are blind to it. `npm run build` succeeds with every one of
these broken.

**Fixed for good**: `src/__tests__/link-integrity.test.ts` runs the audit inside
the vitest suite. `npm run test` now fails on a broken internal link.

### Structural cause
`App.tsx` hand-maintains **29 one-line legacy redirects**, one per article
(`/stone-purana → /articles/stone-purana`, …), and every link is a hand-typed
literal. Two independent hand-typed strings must agree, with nothing checking
that they do. The test closes the hole; a future `articlePath(id)` helper would
remove it. Not changed here — that touches 73 call sites and this repo is live.

---

## 2. Coverage badges overstate translation

On `/themes/scripts-inscriptions`, *Scripts that Sailed II* shows **3/9**.
Its three language bodies are `en` (26,484 chars), `hi` (**69 chars**) and
`ta` (**69 chars**). Two of the three are placeholders, so the honest badge is
**1/9**.

The rule that produces this is the same line, written four times:

| location | code |
|---|---|
| `src/hooks/useArticles.ts:63` | `.filter(([, v]) => typeof v === 'string' && v.trim().length > 0)` |
| `src/components/language/LanguageAvailabilityBadge.tsx:30` | identical |
| `src/lib/i18n/coverage.ts` `calculateCoverage()` | `value && value.trim().length > 0` |
| `scripts/registry-parity-check.mjs` `nonEmptyLangs()` | identical *(fixed by `patch_parity_canonical.py`)* |

Every one measures **presence**, never **substance**. Measured across the 28
registered articles: **69 of 141 non-English bodies are stubs** (<10% of the
English body). `stone-purana.ts:523` is literally
`hi: '…[Professional Hindi translation required - 6,500 words]'`.

`LanguageAvailabilityBadge.tsx:17` already carries the comment *"This stops the
'9/9' lie on cards"* — Phase AA fixed the badge reading **title** keys instead
of **body** keys. It did not add a length floor, so the lie survived in a
quieter form.

**Not patched here.** Adding a floor changes numbers on every card on the live
site; it belongs in one shared helper with its own test, sequenced after the
consolidation SQL. Logged, measured, not silently altered.

---

## 3. Local and online repos were NOT in sync

Measured, not inferred:

```
git ls-remote origin main   ->  0d9060b   (Lovable's last commit)
git rev-parse HEAD          ->  cd66f99   (local)
git log origin/main..HEAD   ->  3 commits
```

**GitHub — and therefore Lovable — has none of today's work**: the Q1 published-
count fix, the parity-gate RLS/offline fixes, the consolidation plan. `origin`
has not moved since `0d9060b`, so the push is a clean fast-forward: no merge,
no conflict.

### Why it went unnoticed
`git status` listed **every tracked file** as modified. None had changed:

```
git diff --ignore-cr-at-eol -- README.md    ->  (empty)
```

Lovable Cloud commits LF; the Windows checkout writes CRLF; there was no
`.gitattributes` and no `core.autocrlf`. Real changes were invisible inside
hundreds of lines of line-ending noise. `.gitattributes` (added) normalises to
LF once and is idempotent thereafter.

### `.env` — checked, not a leak
`.env` is tracked and absent from `.gitignore`, but holds only
`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`.
Those are the anon key and URL, compiled into the client bundle and public by
design; RLS is what protects the data. **No incident.** The forward-looking risk
is that this file is now a normal place to add a key — if a service key ever
lands there it publishes to GitHub. Keep secrets in Lovable's secret store.

---

## 4. Verified clean

- All other 69 internal links resolve.
- 89 declared routes; no duplicate paths.
- All 106 DB slugs and aliases are reachable through `/articles/*` or `/oceanic/*`.
- No link points at a draft article, so publishing the 8 drafts cannot break one.
