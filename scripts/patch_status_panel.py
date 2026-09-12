#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_status_panel.py  (2026-09-12)  STATUS_LIVE_2026_09_12

Two edits to ProjectStatusPanel, both forced by what the regenerated
projectStatus.ts now contains.

1. HINDI. The corpus holds 10,036 Hindi verses and this page did not
   mention them - not in a figure, not in a caveat, nowhere. The grid
   goes from four columns to five and "passages translated" becomes
   "English translations", because with Hindi beside it the unqualified
   word stops being accurate.

2. THE DATE SENTENCE. It reads "Every figure below was measured on
   <date>". That is now false: the contamination figures come from
   diag_ocr_contamination.py in the automaton repository and carry their
   own, older date. A page whose whole argument is that it publishes only
   measured numbers cannot also overstate when they were measured.

Run from the repo root:  python scripts/patch_status_panel.py
Add --check to verify anchors without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "STATUS_LIVE_2026_09_12"
PANEL = Path("src/components/ProjectStatusPanel.tsx")
DATA = Path("src/data/projectStatus.ts")

GRID_OLD = '''                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Figure value={nf.format(t.works)} label="works in the corpus" />
                  <Figure value={nf.format(t.passages)} label="passages extracted" />
                  <Figure value={nf.format(t.translated)} label="passages translated" />
                  <Figure value={nf.format(t.embeddings)} label="passages embedded" />
                </div>'''

GRID_NEW = '''                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <Figure value={nf.format(t.works)} label="works in the corpus" />
                  <Figure value={nf.format(t.passages)} label="passages extracted" />
                  {/* STATUS_LIVE_2026_09_12 - "passages translated" was accurate
                      only while English was the sole target. It is not. */}
                  <Figure value={nf.format(t.translated)} label="English translations" />
                  <Figure value={nf.format(t.translatedHi)} label="Hindi translations" />
                  <Figure value={nf.format(t.embeddings)} label="passages embedded" />
                </div>'''

DATE_OLD = '''            Every figure below was measured on{" "}
            <time dateTime={MEASURED_ON}>{MEASURED_ON}</time>. Nothing here is an
            estimate.'''

DATE_NEW = '''            {/* STATUS_LIVE_2026_09_12 - the contamination figures are measured
                by a different tool, in another repository, on their own date.
                Claiming one date for the whole page overstated it. */}
            Corpus figures measured on{" "}
            <time dateTime={MEASURED_ON}>{MEASURED_ON}</time>; the contamination
            figures on{" "}
            <time dateTime={CONTAMINATION_MEASURED_ON}>
              {CONTAMINATION_MEASURED_ON}
            </time>
            . Nothing here is an estimate.'''

IMPORT_OLD = "  MEASURED_ON,"
IMPORT_NEW = "  MEASURED_ON,\n  CONTAMINATION_MEASURED_ON,"


def replace_one(text: str, old: str, new: str, label: str):
    n = text.count(old)
    if n != 1:
        return text, ["%s: matched %d times, expected exactly 1" % (label, n)]
    return text.replace(old, new), []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    if not PANEL.exists():
        print("FAIL: %s not found. Run from the repo root." % PANEL)
        return 2
    if not DATA.exists():
        print("FAIL: %s not found." % DATA)
        return 2

    data = DATA.read_text(encoding="utf-8")
    # Patching the panel to read fields the data file does not export would
    # compile in JS and render "undefined" to a reader. Check first.
    for field in ("translatedHi", "CONTAMINATION_MEASURED_ON"):
        if field not in data:
            print("FAIL: %s does not provide %r." % (DATA, field))
            print("      Run scripts/emit_project_status.py first - the panel")
            print("      would otherwise render undefined to a reader.")
            return 2

    src = PANEL.read_text(encoding="utf-8")
    if MARK in src:
        print("Already patched (%s). Nothing to do." % MARK)
        return 0

    problems: list[str] = []
    src, p = replace_one(src, IMPORT_OLD, IMPORT_NEW, "import"); problems += p
    src, p = replace_one(src, DATE_OLD, DATE_NEW, "date sentence"); problems += p
    src, p = replace_one(src, GRID_OLD, GRID_NEW, "figure grid"); problems += p

    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for x in problems:
            print("  " + x)
        return 1

    if args.check:
        print("All 3 anchors matched exactly once. --check: nothing written.")
        return 0

    PANEL.write_text(src, encoding="utf-8", newline="\n")
    print("Patched: %s  (3 edits)" % PANEL)
    return 0


if __name__ == "__main__":
    sys.exit(main())
