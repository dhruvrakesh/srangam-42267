#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_badge_truth.py — the card badges count placeholders as translations.
(2026-09-06)

WHAT YOU SAW
On /themes/scripts-inscriptions:
    "Scripts that Sailed II"   badge 3/9
    "The Kutai Yupa..."        badge 9/9 (green)

Scripts II has en = 26,484 chars, hi = 69 chars, ta = 69 chars. Two of its three
"languages" are placeholders, so the honest badge is 1/9. Kutai's 9/9 is
correct — its English body is 235 chars and its translations are ~110 each,
genuinely proportionate.

WHERE IT COMES FROM
src/data/articles/meta.ts is a GENERATED file. Its `contentLanguages` field is
what the card badge renders, and scripts/generate-registry-meta.mjs line 35
builds it with

    .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)

meta.ts currently records  scripts-that-sailed-ii: ["en","hi","ta"]  -> 3/9.

THE SAME LINE, FIVE TIMES
    scripts/generate-registry-meta.mjs:35                  <- drives the badge
    scripts/registry-parity-check.mjs      nonEmptyLangs()
    src/hooks/useArticles.ts:63            computeBodyLanguages()
    src/components/language/LanguageAvailabilityBadge.tsx:30
    src/lib/i18n/coverage.ts               calculateCoverage()

Fixing them one at a time is how it became five. This patch creates
scripts/lib/substance.mjs as the single definition and makes the generator and
the parity gate import it. (The three src/ copies operate on DB rows, whose
bodies are real; they are logged in docs/UI_LINK_AUDIT_2026-09-06.md and are
NOT changed here — that is a live-UI change for its own commit.)

WHAT WILL VISIBLY CHANGE — run the preview first, it prints all 28
    python scripts/preview-badge-truth.py

13 of 28 cards drop. Seven go 9/9 -> 1/9 (janajati-oral-traditions,
cosmic-island-sacred-land, stone-purana, jambudvipa-connected,
geomythology-land-reclamation, stone-song-and-sea, sacred-tree-harvest-rhythms
— every one has eight 25-to-400-character "translations" of a 13,000-to-71,000
character article). Fifteen are already truthful and do not move.

The numbers go DOWN. They are supposed to: they were counting
'…[Professional Hindi translation required - 6,500 words]' as a Hindi
translation. The new figures are also your translation backlog in priority
order.

  python patch_badge_truth.py            # dry run
  python patch_badge_truth.py --apply
  node scripts/generate-registry-meta.mjs
  npm run test
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "SUBSTANCE_SHARED_2026_09_06"
GEN = os.path.join("scripts", "generate-registry-meta.mjs")
JS  = os.path.join("scripts", "registry-parity-check.mjs")
LIB = os.path.join("scripts", "lib", "substance.mjs")

GEN_EDITS = [
    ("""const cards = full.MULTILINGUAL_ARTICLES.map(a => ({
  id: a.id, title: a.title, dek: a.dek, tags: a.tags,
  contentLanguages: Object.entries(a.content || {}).filter(([, v]) => typeof v === 'string' && v.trim().length > 0).map(([k]) => k),
}));""",
     """// SUBSTANCE_SHARED_2026_09_06 — was `v.trim().length > 0`, which counted a
// placeholder as a translation and produced the 3/9 badge on an article whose
// hi and ta bodies are 69 characters each. substantiveLangs() applies the
// shared placeholder rule; see scripts/lib/substance.mjs for the measurements.
const cards = full.MULTILINGUAL_ARTICLES.map(a => ({
  id: a.id, title: a.title, dek: a.dek, tags: a.tags,
  contentLanguages: substantiveLangs(a.content),
  placeholderLanguages: placeholderLangs(a.content),
}));"""),
]

# the interface gains the new field, so the generated file still type-checks
GEN_IFACE = ("""  /** Languages whose body content is non-empty in the static registry. */
  contentLanguages: SupportedLanguage[];""",
             """  /** Languages with a REAL body in the static registry (placeholders excluded). */
  contentLanguages: SupportedLanguage[];
  /** Languages present but placeholder-only. Reported, never counted. */
  placeholderLanguages?: SupportedLanguage[];""")

JS_EDITS = [
    ("""const STUB_RATIO   = 0.10;   // long article: a real translation is never under 10%
const SHORT_SOURCE = 2000;   // below this the ratio is not meaningful ...
const STUB_ABS     = 100;    // ... so only titles/empties are treated as stubs
const isStub = (content, lang) => {
  if (lang === 'en') return false;
  const v = (content?.[lang] || '').trim();
  const en = (content?.en || '').trim().length;
  if (!v.length) return true;
  if (en >= SHORT_SOURCE) return v.length < en * STUB_RATIO;
  return v.length < STUB_ABS;
};""",
     """// SUBSTANCE_SHARED_2026_09_06 — moved to scripts/lib/substance.mjs so the gate
// and the meta generator cannot drift apart. Imported at the top of this file."""),
]


def add_import(src, line):
    """Insert an import after the last existing top-level import."""
    if line in src:
        return src
    idx, last = 0, None
    for ln in src.split("\n"):
        if ln.startswith("import "):
            last = idx
        idx += 1
    if last is None:
        return line + "\n" + src
    parts = src.split("\n")
    parts.insert(last + 1, line)
    return "\n".join(parts)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    for p in (GEN, JS, LIB):
        if not os.path.exists(p):
            sys.exit(f"not found: {p}")
    g = io.open(GEN, encoding="utf-8").read()
    j = io.open(JS, encoding="utf-8").read()
    if MARKER in g and MARKER in j:
        print("Already applied (marker found in both). Nothing to do."); return
    if "PARITY_TRUTH_2026_09_06" not in j:
        sys.exit("Run patch_parity_truth.py first.")

    bad = False
    checks = [(GEN, g, GEN_EDITS + [GEN_IFACE]), (JS, j, JS_EDITS)]
    for path, src, edits in checks:
        for i, (old, _new) in enumerate(edits, 1):
            n = src.count(old)
            print(f"  {os.path.basename(path)} edit {i}: {n} match(es) (need exactly 1)")
            if n != 1:
                bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAnchors OK (3/3). Preview the visible effect first:")
        print("  python scripts/preview-badge-truth.py")
        print("Then: python patch_badge_truth.py --apply")
        return

    os.makedirs("backups", exist_ok=True)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    bg = os.path.join("backups", "generate-registry-meta.mjs.preSubstance." + stamp)
    bj = os.path.join("backups", "registry-parity-check.mjs.preSubstance." + stamp)
    shutil.copy2(GEN, bg); shutil.copy2(JS, bj)
    print(f"  backups: {bg}\n           {bj}")
    try:
        for old, new in GEN_EDITS + [GEN_IFACE]:
            assert g.count(old) == 1
            g = g.replace(old, new, 1)
        g = add_import(g, "import { substantiveLangs, placeholderLangs } from './lib/substance.mjs';")
        io.open(GEN, "w", encoding="utf-8", newline="\n").write(g)

        for old, new in JS_EDITS:
            assert j.count(old) == 1
            j = j.replace(old, new, 1)
        j = add_import(j, "import { STUB_RATIO, SHORT_SOURCE, STUB_ABS, isStub } from './lib/substance.mjs';")
        io.open(JS, "w", encoding="utf-8", newline="\n").write(j)
    except Exception as exc:
        shutil.copy2(bg, GEN); shutil.copy2(bj, JS)
        sys.exit(f"FAILED ({exc}) - both files restored from backup.")

    print("\nApplied. Now REGENERATE meta.ts - the patch alone changes no badge:")
    print("  node scripts/generate-registry-meta.mjs")
    print("  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv")
    print("  npm run test")
    print("\n13 of 28 card badges will drop. That is the correction, not a regression.")


if __name__ == "__main__":
    main()
