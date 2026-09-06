#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_parity_truth.py — three defects I introduced in the previous patches.
(2026-09-06, after the 14:12 run)

All three are the SAME failure I have been documenting in this codebase all
session: a tool asserting something it did not measure. I wrote them, so they
are named plainly here.

──────────────────────────────────────────────────────────────────────────────
DEFECT A — the gate lies about where its data came from
──────────────────────────────────────────────────────────────────────────────
Your 14:12 run printed:

    Inventory: docs\\db_inventory.csv (SQL-editor export — drafts visible, no key required)
    Service-role key in use; 9 draft(s) are visible ...

There is no service-role key. This is Lovable Cloud; that was the whole reason
for the --inventory path. patch_parity_rls.py wrote those two messages under
`if (BLIND) ... else`, and patch_parity_offline.py then redefined
`BLIND = !IS_SERVICE && !INVENTORY_ARG` without updating them. An inventory run
is not blind, so it falls into the else and claims a key it does not have.

Harmless today because you know the truth. Not harmless in six months, when
this line is the only record of how a report was produced.

──────────────────────────────────────────────────────────────────────────────
DEFECT B — "DB 1 chars vs static 27477 (−100%)" is an artefact of my own shim
──────────────────────────────────────────────────────────────────────────────
Four CONTENT GAP rows in the 14:12 report say the DB body is ONE character:

    jambudvipa-connected              en: DB 1 chars vs static 27477 (−100%)
    sacred-tree-harvest-rhythms       en: DB 1 chars vs static 13446 (−100%)
    somnatha-prabhasa-itihasa         en: DB 1 chars vs static 16390 (−100%)
    ringing-rocks-rhythmic-cosmology  en: DB 1 chars vs static  2670 (−100%)

The database holds no such rows. parity_inventory.sql deliberately does NOT
export the `content` blob (it does not survive CSV), and my loadInventory()
rebuilds it as `{ en: 'x' }` — a one-character presence marker. The length
comparison then runs against that marker and reports a fabricated −100%.

Two of these four (somnatha-prabhasa-itihasa, ringing-rocks-rhythmic-cosmology)
were ✅ OK in the 13:23 anon run. They did not regress; my shim invented the gap.

FIX: on the inventory path, skip the length comparison entirely and say so.
A check that cannot be performed must report that it was not performed — it
must never report a result.

──────────────────────────────────────────────────────────────────────────────
DEFECT C — the placeholder floor is too generous
──────────────────────────────────────────────────────────────────────────────
    STUB_ABS = 500, and the test was  (len < 500) AND (len < 10% of en)

The AND lets a 696-character "Bengali translation" of a 27,477-character
article through as real, because 696 > 500. That is 2.5% of the source. The
14:12 report shows the consequence:

    jambudvipa-connected  DB missing languages: bn,hi,kn,ta,te

bn=696, hi=653, kn=651, ta=1148, te=634 — every one a placeholder, all reported
as content the DB is missing. Acting on that line would import placeholders.

The absolute floor exists for a real reason: kutai-yupa-borneo has a 235-char
English body and ~110-char translations, which are genuine, and a pure ratio
test would not save them. But the floor must apply only where it is needed —
to short articles — not as a blanket rescue.

FIX, and the numbers it produces on this corpus:

    en >= 2000 chars : stub iff  len < 10% of en      (ratio alone)
    en <  2000 chars : stub iff  len < 100            (catch titles/empties only)

    jambudvipa      en 27,477 -> floor 2,748 : all 8 correctly stubs
    scripts-sailed-ii en 26,484 -> floor 2,648 : hi=69, ta=69 stubs -> truth 1/9
    ashoka-kandahar en  6,086 -> floor   609 : as/bn/kn/pa/pn stubs;
                                               hi 3125, ta 2880, te 2661 REAL
    riders-on-monsoon en 9,210 -> floor   921 : 5 stubs; hi/ta/te REAL
    kutai-yupa      en    235 -> floor   100 : all 8 correctly REAL
    maritime-memories en 1,674 -> floor   100 : all 8 correctly REAL

Both thresholds print in the report, so the number is auditable.

  python patch_parity_truth.py            # dry run
  python patch_parity_truth.py --apply
  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "PARITY_TRUTH_2026_09_06"
JS = os.path.join("scripts", "registry-parity-check.mjs")

EDITS = [
    # A ── say which source this run actually used
    ("""} else if (draftCount === 0) {
  console.log('Service-role key in use; the database genuinely holds no drafts.');
} else {
  console.log(`Service-role key in use; ${draftCount} draft(s) are visible and will be reported as DRAFT, not MISSING.`);
}""",
     """} else {
  // PARITY_TRUTH_2026_09_06 — name the real source. Before this fix an
  // --inventory run printed "Service-role key in use", which was false: this is
  // Lovable Cloud and no service key exists. BLIND was redefined to account for
  // --inventory but these two messages were not updated with it.
  const source = INVENTORY_ARG
    ? `SQL-editor inventory (${INVENTORY_ARG}) — no key involved`
    : 'service-role key';
  console.log(draftCount === 0
    ? `Source: ${source}; the database genuinely holds no drafts.`
    : `Source: ${source}; ${draftCount} draft(s) are visible and will be reported as DRAFT, not MISSING.`);
}"""),

    # B ── never compare lengths against a presence marker
    ("""  for (const l of staticLangs) {
    const sLen = (art.content?.[l] || '').length;
    const dLen = (db.content?.[l] || '').length;
    if (dLen > 0 && dLen < sLen * 0.9) { bad = true; details.push(`${l}: DB ${dLen} chars vs static ${sLen} (−${Math.round((1 - dLen / sLen) * 100)}%)`); }
  }""",
     """  // PARITY_TRUTH_2026_09_06 — the inventory CSV deliberately omits the body
  // blob; loadInventory() rebuilds content as { en: 'x' }, a 1-char presence
  // marker. Comparing lengths against that produced four fabricated
  // "DB 1 chars vs static N (−100%)" rows in the 2026-09-06T14:12 report, two
  // of them on articles that were ✅ OK in the previous run. A check that
  // cannot be performed must say so, not return a result.
  if (INVENTORY_ARG) {
    details.push('length comparison SKIPPED (inventory export carries no body text — run without --inventory to compare lengths)');
  } else {
    for (const l of staticLangs) {
      const sLen = (art.content?.[l] || '').length;
      const dLen = (db.content?.[l] || '').length;
      if (dLen > 0 && dLen < sLen * 0.9) { bad = true; details.push(`${l}: DB ${dLen} chars vs static ${sLen} (−${Math.round((1 - dLen / sLen) * 100)}%)`); }
    }
  }"""),

    # C ── a placeholder floor that actually holds
    ("""const STUB_RATIO = 0.10;   // shorter than 10% of the English body ...
const STUB_ABS   = 500;    // ... AND shorter than 500 characters
const isStub = (content, lang) => {
  if (lang === 'en') return false;
  const v = (content?.[lang] || '').trim();
  const en = (content?.en || '').trim().length;
  if (!v.length) return true;
  return v.length < STUB_ABS && (en > 0 ? v.length < en * STUB_RATIO : false);
};""",
     """// PARITY_TRUTH_2026_09_06 — the previous rule was
//     (len < 500) AND (len < 10% of en)
// The AND let a 696-char "translation" of a 27,477-char article count as real
// (696 > 500), so the 14:12 report claimed jambudvipa-connected was missing
// bn,hi,kn,ta,te when all five are placeholders.
//
// The absolute floor exists to protect genuinely SHORT articles —
// kutai-yupa-borneo has a 235-char English body and ~110-char translations that
// are real — so it now applies only where it is needed, to short sources.
const STUB_RATIO   = 0.10;   // long article: a real translation is never under 10%
const SHORT_SOURCE = 2000;   // below this the ratio is not meaningful ...
const STUB_ABS     = 100;    // ... so only titles/empties are treated as stubs
const isStub = (content, lang) => {
  if (lang === 'en') return false;
  const v = (content?.[lang] || '').trim();
  const en = (content?.en || '').trim().length;
  if (!v.length) return true;
  if (en >= SHORT_SOURCE) return v.length < en * STUB_RATIO;
  return v.length < STUB_ABS;
};"""),

    # report legend must match the rule it describes
    ("""- Language counts ignore placeholder bodies (shorter than ${Math.round(STUB_RATIO * 100)}% of the English body AND under ${STUB_ABS} characters). Measured 2026-09-06: 69 of the registry's 141 non-English bodies are placeholders, so a CONTENT GAP on those languages was never real.""",
     """- Language counts ignore placeholder bodies. Rule: for an English body of ${SHORT_SOURCE}+ characters, anything under ${Math.round(STUB_RATIO * 100)}% of it is a placeholder; for a shorter source, anything under ${STUB_ABS} characters. Measured 2026-09-06 over the 28 registered articles: most non-English "translations" are placeholders, so a CONTENT GAP on those languages was never real.
- **Length deltas are only computed on a live fetch.** With \\`--inventory\\` the CSV carries no body text, so the comparison is skipped and says so rather than reporting a false −100%."""),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(JS):
        sys.exit(f"not found: {JS} - run from the srangam repo root")
    s = io.open(JS, encoding="utf-8").read()
    if MARKER in s:
        print("Already applied (marker found). Nothing to do."); return
    if "PARITY_CANONICAL_2026_09_06" not in s:
        sys.exit("Run patch_parity_canonical.py first.")

    bad = False
    for i, (old, _new) in enumerate(EDITS, 1):
        n = s.count(old)
        print(f"  edit {i}: {n} match(es) (need exactly 1)")
        if n != 1: bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAnchors OK (4/4). Re-run with --apply."); return

    os.makedirs("backups", exist_ok=True)
    b = os.path.join("backups", f"registry-parity-check.mjs.preTruth.{time.strftime('%Y%m%d_%H%M%S')}")
    shutil.copy2(JS, b)
    print(f"  backup: {b}")
    try:
        for old, new in EDITS:
            assert s.count(old) == 1
            s = s.replace(old, new, 1)
        s = s.replace("// PARITY_CANONICAL_2026_09_06\n",
                      f"// PARITY_CANONICAL_2026_09_06\n// {MARKER}\n", 1)
        io.open(JS, "w", encoding="utf-8", newline="\n").write(s)
    except Exception as exc:
        shutil.copy2(b, JS)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. Expected change to the report:")
    print("   'Service-role key in use'  -> 'Source: SQL-editor inventory (...) — no key involved'")
    print("   4 CONTENT GAP (all fabricated by the shim) -> 0")
    print("   23 gaps -> 19  (5 registry MISSING + 9 DRAFT + 5 json_card MISSING)")
    print("\n  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv")


if __name__ == "__main__":
    main()
