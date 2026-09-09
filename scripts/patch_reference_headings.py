#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_reference_headings.py  (2026-09-09)  REFERENCE_HEADINGS_2026_09_09

Points both citation extractors at the shared reference-section matcher.

THE MEASUREMENT THAT JUSTIFIES THIS
-----------------------------------
Run against the 33 source documents in data/, using the compiled TypeScript
module itself, not a paraphrase of it:

                       files   candidate lines   author-shaped
    current regex          1                63               0
    shared module         15               609             112

"author-shaped" is a line beginning with a capitalised surname and a comma -
an approximation of what parseMLA9Entry() will actually accept. The current
regex finds sixty-three candidate lines in one file and NOT ONE of them
parses. That is why srangam_bibliography_entries has not grown since
2026-06-02: the regex path yields nothing from this corpus, and every run has
reported success while creating nothing.

The three heading shapes it loses, all present in data/:
    ### **Works Cited**                    h3, and bold-wrapped
    ## **Sources (primary, Devanagari-first)**   bold-wrapped
    ## Works Cited (MLA 9)                 right level, plain - but the old
                                           pattern demanded a newline
                                           immediately after "Cited"

WHAT THIS DOES NOT TOUCH
------------------------
parseMLA9Entry, the AI fallback, the auth gate, the insert logic. Only the
question of WHERE to look for a reference list changes. 36 published articles
have no reference section at all and cite entirely inline - roughly 3,455
URLs across them - and no regex reaches those. That is the AI pass, and a
separate decision.

Run from the repo root:  python scripts/patch_reference_headings.py
Add --check to verify anchors without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "REFERENCE_HEADINGS_2026_09_09"

SHARED = Path("supabase/functions/_shared/reference-sections.ts")
IMPORT_FN = Path("supabase/functions/markdown-to-article-import/index.ts")
BACKFILL_FN = Path("supabase/functions/backfill-bibliography/index.ts")

IMPORT_ANCHOR = "import { requireAdmin } from '../_shared/auth-gate.ts';"
NEW_IMPORT = (
    "import { collectReferenceLines } from '../_shared/reference-sections.ts';"
)

# ----------------------------------------------------- markdown-to-article-import
IMP_START = "  // Pattern 3: Bibliography section"
IMP_END = """    entries.forEach(entry => citations.push({ text: entry }));
  }"""

IMP_NEW = """  // Pattern 3: reference sections.
  // REFERENCE_HEADINGS_2026_09_09 - this was one regex demanding "##", no
  // bold wrapper, and a newline immediately after the heading word. Across
  // the 33 documents in data/ it matched ONE file and produced zero entries
  // that parseMLA9Entry() would accept. See _shared/reference-sections.ts
  // for the three shapes it lost and the numbers.
  for (const entry of collectReferenceLines(markdown, 1)) {
    citations.push({ text: entry });
  }"""

# ------------------------------------------------------------ backfill-bibliography
BF_START = "  // Find bibliography section"
BF_END = "    .filter(line => line.length > 20 && !line.startsWith('#'));"

BF_NEW = """  // REFERENCE_HEADINGS_2026_09_09 - see _shared/reference-sections.ts.
  // The 20-character floor and the leading-# skip are preserved exactly;
  // only the search for the section itself is broadened.
  const lines = collectReferenceLines(markdown, 20);

  if (lines.length === 0) {
    console.log('No reference section found');
    return entries;
  }"""


def splice(text: str, start: str, end: str, new: str, label: str) -> tuple[str, list[str]]:
    problems: list[str] = []
    if text.count(start) != 1:
        problems.append(f"{label}: start anchor matched {text.count(start)} times")
    if text.count(end) != 1:
        problems.append(f"{label}: end anchor matched {text.count(end)} times")
    if problems:
        return text, problems
    i = text.index(start)
    j = text.index(end, i) + len(end)
    if j <= i:
        return text, [f"{label}: end anchor appears before start anchor"]
    return text[:i] + new + text[j:], []


def add_import(text: str, label: str) -> tuple[str, list[str]]:
    if NEW_IMPORT in text:
        return text, []
    if text.count(IMPORT_ANCHOR) != 1:
        return text, [f"{label}: import anchor matched {text.count(IMPORT_ANCHOR)} times"]
    return text.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + "\n" + NEW_IMPORT), []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify anchors, write nothing")
    args = ap.parse_args()

    if not SHARED.exists():
        print(f"FAIL: {SHARED} is missing. It must be in place before patching.")
        return 2
    for p in (IMPORT_FN, BACKFILL_FN):
        if not p.exists():
            print(f"FAIL: {p} not found. Run from the repo root.")
            return 2

    imp = IMPORT_FN.read_text(encoding="utf-8")
    bff = BACKFILL_FN.read_text(encoding="utf-8")

    if MARK in imp and MARK in bff:
        print(f"Already patched ({MARK}). Nothing to do.")
        return 0

    problems: list[str] = []
    imp, p = splice(imp, IMP_START, IMP_END, IMP_NEW, "markdown-to-article-import"); problems += p
    imp, p = add_import(imp, "markdown-to-article-import"); problems += p
    bff, p = splice(bff, BF_START, BF_END, BF_NEW, "backfill-bibliography"); problems += p
    bff, p = add_import(bff, "backfill-bibliography"); problems += p

    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for x in problems:
            print("  " + x)
        return 1

    if args.check:
        print("All anchors matched exactly once. --check: nothing written.")
        return 0

    IMPORT_FN.write_text(imp, encoding="utf-8", newline="\n")
    BACKFILL_FN.write_text(bff, encoding="utf-8", newline="\n")
    print("Patched:")
    print(f"  {IMPORT_FN}")
    print(f"  {BACKFILL_FN}")
    print("\nNext: npm run typecheck && npm test, then a DRY RUN from Data Health.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
