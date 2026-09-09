#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_citations_truth.py  (2026-09-09)  CITATIONS_TRUTH_2026_09_09

Lovable reported: "Import results now show a blank Citations count."

The blank box is the symptom. The cause has a history worth writing down.

On 2026-09-07 this function returned `citationsCreated: citations.length` -
reporting an EXTRACTION count as a CREATION count, for every article ever
imported. It inserts into neither srangam_bibliography_entries nor
srangam_article_bibliography (grep: 0 hits), which is why Sources & Pins is
empty on all of them. That was corrected by renaming the field to the honest
`citationsExtracted` and adding `citationsPersisted: 0`, with a note reading
"see patch step 2".

Patch step 2 never happened, and the rename was never carried into the UI.
So MarkdownImport.tsx still reads `importResult.stats.citationsCreated`,
which is now undefined, and React renders undefined as nothing at all. A
count that was wrong became a count that is absent.

WHAT THIS PATCH DOES NOT DO
---------------------------
It does not start writing bibliography rows from the import. That work
already exists and is already correct: supabase/functions/backfill-bibliography
reads srangam_markdown_sources, extracts citations by regex and by AI, dedupes
on citation_key, inserts into srangam_bibliography_entries (line ~421) and
links through srangam_article_bibliography (line ~446). It is reachable from
Data Health. It is also guarded by requireAdmin from _shared/auth-gate.ts -
the same gate that returned 401 to a server-to-server call in the tag
generator on 2026-09-08 - so having the import invoke it directly is a trap,
not a shortcut.

Nothing is lost today: the import saves the source markdown, so the backfill
can recover every citation whenever it is run.

So the honest fix is to stop the UI lying by omission, and to tell the editor
what to do next:

  1. edge fn: make ImportResponse declare the fields the function actually
     returns. The interface still says `citationsCreated: number` while the
     success path returns citationsExtracted / citationsPersisted. The
     contract and the implementation have disagreed in production.
  2. edge fn: the merge path returns `citationsCreated: 0` - the OLD key - so
     a merge shows 0 and a fresh import shows blank. Two paths, two key
     names, one UI. Unified.
  3. UI: update MarkdownImport.tsx's OWN copy of the response shape. The
     client mirrors the interface locally, and the first version of this
     patcher forgot it - producing four TS2551 errors and, more to the point,
     repeating the exact mistake it exists to repair: one side of a contract
     moved and the other did not. The suite passed 75/75 while that was
     broken, because vitest does not typecheck. Only tsc caught it.
  4. UI: show the count that exists, label it "Citations found", and when
     citations were found but none persisted, say so and link to the backfill.
  5. UI: give every stat box a fallback so none can ever render blank again.

Run from the repo root:  python patch_citations_truth.py
Add --check to verify without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "CITATIONS_TRUTH_2026_09_09"

UI = Path("src/pages/admin/MarkdownImport.tsx")
ED = Path("supabase/functions/markdown-to-article-import/index.ts")


# --------------------------------------------------------------- edge fn
ED_IFACE_OLD = """    citationsCreated: number;
    readTimeMinutes: number;"""

ED_IFACE_NEW = """    // CITATIONS_TRUTH_2026_09_09 - this interface said `citationsCreated:
    // number` while the success path below returned citationsExtracted and
    // citationsPersisted. The contract and the implementation disagreed, and
    // the UI believed the contract, so it read a key that is never sent.
    /** Citations parsed out of the markdown. Not a count of anything stored. */
    citationsExtracted?: number;
    /** Rows written to srangam_bibliography_entries by THIS call. Always 0
     *  today: persistence lives in the backfill-bibliography function. */
    citationsPersisted?: number;
    bibliographyBackfillRun?: boolean;
    /** @deprecated Kept so older callers do not break. Prefer the two above. */
    citationsCreated?: number;
    readTimeMinutes: number;"""

ED_MERGE_OLD = """          termsExtracted: 0,
          citationsCreated: 0,"""

ED_MERGE_NEW = """          termsExtracted: 0,
          // CITATIONS_TRUTH_2026_09_09 - the merge path used to return only
          // the old key, so a merge rendered "0" while a fresh import
          // rendered blank: two paths, two key names, one UI. Both paths now
          // speak the same vocabulary.
          citationsExtracted: 0,
          citationsPersisted: 0,
          bibliographyBackfillRun: false,
          citationsCreated: 0,"""


# ------------------------------------------------------------------- UI
# The client keeps its OWN copy of the response shape. The first version of
# this patcher updated the edge function's ImportResponse and the UI's usage
# but not this local mirror, so `npm run typecheck` failed with four TS2551
# errors: "Property 'citationsExtracted' does not exist ... Did you mean
# 'citationsCreated'?".
#
# That is the same mistake as the defect being repaired here - one side of a
# contract moved and the other did not - made while repairing it. Worth
# recording rather than quietly fixing: the test suite passed 75/75 while
# this was broken, because vitest does not typecheck. Only tsc caught it.
UI_IFACE_OLD = """    termsCreated?: number;
    citationsCreated: number;
    crossReferencesCreated?: number;"""

UI_IFACE_NEW = """    termsCreated?: number;
    // CITATIONS_TRUTH_2026_09_09 - mirror of ImportResponse in
    // supabase/functions/markdown-to-article-import/index.ts. Keep the two in
    // step: this file is the only place the UI learns what the function sends.
    /** Citations parsed out of the markdown. Not a count of anything stored. */
    citationsExtracted?: number;
    /** Rows written by THIS call. Always 0 today - persistence lives in
     *  backfill-bibliography. */
    citationsPersisted?: number;
    bibliographyBackfillRun?: boolean;
    /** @deprecated The success path stopped sending this on 2026-09-07.
     *  Optional so nothing that still reads it breaks. */
    citationsCreated?: number;
    crossReferencesCreated?: number;"""

UI_VALUE_OLD = "{importResult.stats.citationsCreated}</div>"
UI_VALUE_NEW = (
    "{importResult.stats.citationsExtracted "
    "?? importResult.stats.citationsCreated ?? 0}</div>"
)

UI_LABEL_OLD = '<div className="text-muted-foreground text-xs">Citations</div>'
UI_LABEL_NEW = '<div className="text-muted-foreground text-xs">Citations found</div>'

# Harden the two boxes that could also render blank on a missing key.
UI_WORDS_OLD = "{importResult.stats.wordCount?.toLocaleString()}</div>"
UI_WORDS_NEW = "{(importResult.stats.wordCount ?? 0).toLocaleString()}</div>"

UI_TERMS_OLD = "{importResult.stats.termsExtracted}</div>"
UI_TERMS_NEW = "{importResult.stats.termsExtracted ?? 0}</div>"

# The button row directly after the stats grid: our insertion point.
UI_ANCHOR = '<div className="flex gap-2 pt-2">'
UI_NOTE = """{/* CITATIONS_TRUTH_2026_09_09 - a blank box told an editor nothing.
                          This says what was found, what was stored, and what to do next. */}
                      {importResult.stats
                        && (importResult.stats.citationsExtracted ?? 0) > 0
                        && (importResult.stats.citationsPersisted ?? 0) === 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>
                            {importResult.stats.citationsExtracted} citations found, none saved yet
                          </AlertTitle>
                          <AlertDescription className="space-y-2">
                            <p>
                              The import parsed these out of your markdown but does not write
                              bibliography rows. Your source markdown was saved, so nothing is
                              lost &mdash; the Bibliography backfill reads it, deduplicates on
                              citation key, and creates the entries and their article links.
                            </p>
                            <p>
                              <Link to="/admin/data-health" className="underline font-medium">
                                Run it from Data Health
                              </Link>{' '}
                              to populate Sources &amp; Pins for this article.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="flex gap-2 pt-2">"""


def apply(text: str, pairs, label: str) -> tuple[str, list[str]]:
    problems = []
    for old, new in pairs:
        n = text.count(old)
        if n == 0:
            problems.append(f"{label}: anchor not found -> {old.splitlines()[0][:70]!r}")
        elif n > 1:
            problems.append(f"{label}: anchor matched {n} times -> {old.splitlines()[0][:70]!r}")
        else:
            text = text.replace(old, new)
    return text, problems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify anchors, write nothing")
    args = ap.parse_args()

    for p in (UI, ED):
        if not p.exists():
            print(f"FAIL: {p} not found. Run from the repo root.")
            return 2

    ui_src = UI.read_text(encoding="utf-8")
    ed_src = ED.read_text(encoding="utf-8")

    if MARK in ui_src and MARK in ed_src:
        print(f"Already patched ({MARK}). Nothing to do.")
        return 0

    ui_out, ui_bad = apply(ui_src, [
        (UI_IFACE_OLD, UI_IFACE_NEW),
        (UI_VALUE_OLD, UI_VALUE_NEW),
        (UI_LABEL_OLD, UI_LABEL_NEW),
        (UI_WORDS_OLD, UI_WORDS_NEW),
        (UI_TERMS_OLD, UI_TERMS_NEW),
        (UI_ANCHOR,    UI_NOTE),
    ], "MarkdownImport.tsx")

    ed_out, ed_bad = apply(ed_src, [
        (ED_IFACE_OLD, ED_IFACE_NEW),
        (ED_MERGE_OLD, ED_MERGE_NEW),
    ], "markdown-to-article-import/index.ts")

    problems = ui_bad + ed_bad
    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for p in problems:
            print("  " + p)
        return 1

    if args.check:
        print("All 8 anchors matched exactly once. --check: nothing written.")
        return 0

    UI.write_text(ui_out, encoding="utf-8", newline="\n")
    ED.write_text(ed_out, encoding="utf-8", newline="\n")
    print("Patched:")
    print(f"  {UI}  (5 edits)")
    print(f"  {ED}  (2 edits)")
    print("\nNext: npm run typecheck && npm test")
    return 0


if __name__ == "__main__":
    sys.exit(main())
