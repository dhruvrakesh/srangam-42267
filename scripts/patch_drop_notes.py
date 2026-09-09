#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_drop_notes.py  (2026-09-09)  NOTES_DROPPED_2026_09_09

Removes `Notes` from the reference-heading set in
supabase/functions/_shared/reference-sections.ts.

THE MEASUREMENT THAT DECIDES IT
-------------------------------
Pre-flight v2, Q1, against the live database with the corrected boundary:

    heading set      articles   candidate lines   author-shaped
    WITH Notes            18               539             103
    WITHOUT Notes         12               436             103

Including `Notes` adds six articles and 103 candidate lines and EXACTLY ZERO
parseable entries. Everything it contributes is rejected downstream, so the
only thing it can do is find a false positive.

WHY, FROM THE ACTUAL TEXT (Q2)
------------------------------
Three of the six are plain commentary:

  breached-from-within        "These notes are interpretive and
                               source-critical; full bibliographic detail
                               appears in the Works Cited below."
                               It says so itself - and Q3 confirms that
                               article has a real ## Works Cited section.
  stone-sun-and-vitasta       "The Odisha or Kalinga origin-story ... should,
                               for now, remain outside the chapter's asserted
                               history."
  under-the-sacred-tree       "1. **Walking the grammar.** We foreground
                               places that a reader can physically traverse"

The other three are scholarly endnotes that DO contain real citations -
the-custodians-of-unfinished-time, the-land-before-the-name and
the-lion-at-the-western-gate cite the Padma Purana, Encyclopaedia Iranica,
2 Maccabees and the Rabatak inscription. But they cite them in prose and in
markdown links, mid-sentence, numbered "1." and "**[1]**". parseMLA9Entry
needs a line that opens with a surname and a comma. None of these do, which
is exactly why the author-shaped column does not move.

So those citations are real and they are not lost - they are inline
citations, which is AI-pass territory, not regex territory. Reaching them
with a heading rule was never going to work, and pretending otherwise costs
103 lines of noise fed to a parser that will reject them.

I added `Notes` because two files used "## **Notes (commentary footnotes)**"
and I did not read what was underneath. That is the same error as the bug
this whole thread is about: widening a pattern to fit a label without
checking the content.

Run from the repo root:  python scripts/patch_drop_notes.py
Add --check to verify without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "NOTES_DROPPED_2026_09_09"
SHARED = Path("supabase/functions/_shared/reference-sections.ts")
TEST = Path("src/__tests__/reference-sections.test.ts")

RE_OLD = ("  /^(#{2,4})[ \\t]*\\**[ \\t]*"
          "(Bibliography|References|Works\\s+Cited|Works\\s+Consulted|Sources|"
          "Further\\s+Reading|Notes)\\b[^\\n]*$/gim;")
RE_NEW = ("  /^(#{2,4})[ \\t]*\\**[ \\t]*"
          "(Bibliography|References|Works\\s+Cited|Works\\s+Consulted|Sources|"
          "Further\\s+Reading)\\b[^\\n]*$/gim;")

DOC_OLD = """/**
 * Heading levels 2 to 4, optional bold wrapper, any trailing qualifier.
 *
 * `Notes` is included because two files title their apparatus
 * "## **Notes (commentary footnotes)**". Commentary prose that is not a
 * citation is rejected downstream by parseMLA9Entry(), which requires an
 * author-shaped opening, so widening here does not lower the bar there.
 */"""

DOC_NEW = """/**
 * Heading levels 2 to 4, optional bold wrapper, any trailing qualifier.
 *
 * NOTES_DROPPED_2026_09_09. `Notes` was in this list and has been removed.
 * Measured against the live database with a corrected section boundary,
 * including it reached six more articles and 103 more candidate lines and
 * produced EXACTLY ZERO additional parseable entries - so its only possible
 * effect was a false positive.
 *
 * Three of those six sections are commentary; breached-from-within opens its
 * with "These notes are interpretive and source-critical; full bibliographic
 * detail appears in the Works Cited below", and that article does have a real
 * Works Cited. The other three are scholarly endnotes carrying genuine
 * citations - the Padma Purana, Encyclopaedia Iranica, 2 Maccabees, the
 * Rabatak inscription - but cited in prose and markdown links, mid-sentence,
 * numbered "1." or "**[1]**". parseMLA9Entry() needs a line opening with a
 * surname and a comma. None of them do. Those citations are real and they are
 * inline, which is the AI pass, not a heading rule.
 */"""

TEST_ANCHOR = """describe('reference sections: boundaries', () => {"""

TEST_NEW = """describe('reference sections: Notes is deliberately NOT a reference heading', () => {
  /**
   * NOTES_DROPPED_2026_09_09. Measured on the live corpus, including `Notes`
   * reached six more articles and 103 more candidate lines and produced zero
   * additional parseable entries. Everything it added was rejected by
   * parseMLA9Entry, so the only outcome available to it was a false positive.
   *
   * This is a decision, not an oversight, and it is easy to undo by accident.
   */
  it('does not treat a Notes heading as a reference section', () => {
    const commentary =
      'These notes are interpretive and source-critical; full bibliographic ' +
      'detail appears in the Works Cited below.';
    const md = `# T\\n\\n## Notes\\n\\n${commentary}\\n`;
    expect(collectReferenceSections(md)).toEqual([]);
    expect(collectReferenceLines(md, 20)).toEqual([]);
  });

  it('still reads the real Works Cited in an article that has both', () => {
    const md = [
      '# T', '',
      '## Notes', '',
      'These notes are interpretive and source-critical, see below.', '',
      '## Works Cited', '', ENTRY, '',
    ].join('\\n');
    const lines = collectReferenceLines(md, 20);
    expect(lines).toContain(ENTRY);
    expect(lines.some((l) => l.startsWith('These notes'))).toBe(false);
  });
});

describe('reference sections: boundaries', () => {"""


def apply(text: str, pairs, label: str):
    problems = []
    for old, new in pairs:
        n = text.count(old)
        if n != 1:
            problems.append(f"{label}: anchor matched {n} times -> {old.splitlines()[0][:66]!r}")
        else:
            text = text.replace(old, new)
    return text, problems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    for p in (SHARED, TEST):
        if not p.exists():
            print(f"FAIL: {p} not found. Run from the repo root.")
            return 2

    shared = SHARED.read_text(encoding="utf-8")
    test = TEST.read_text(encoding="utf-8")

    if MARK in shared and MARK in test:
        print(f"Already patched ({MARK}). Nothing to do.")
        return 0

    problems = []
    shared, p = apply(shared, [(RE_OLD, RE_NEW), (DOC_OLD, DOC_NEW)], "reference-sections.ts")
    problems += p
    test, p = apply(test, [(TEST_ANCHOR, TEST_NEW)], "reference-sections.test.ts")
    problems += p

    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for x in problems:
            print("  " + x)
        return 1

    if args.check:
        print("All 3 anchors matched exactly once. --check: nothing written.")
        return 0

    SHARED.write_text(shared, encoding="utf-8", newline="\n")
    TEST.write_text(test, encoding="utf-8", newline="\n")
    print("Patched:")
    print(f"  {SHARED}")
    print(f"  {TEST}   (+2 tests)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
