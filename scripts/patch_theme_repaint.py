#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_theme_repaint.py  (2026-09-10)  THEME_REPAINT_2026_09_10

Reported after RADIAL_TIDY shipped:

  "Colours on the Research Network graph are cached the first time they're
   drawn and never refreshed, so if someone switches between light and dark
   mode while viewing the graph, node labels stay in the old theme's colour
   - dark text on a dark background - and become unreadable until the page
   is reloaded."

Correct, and it is an omission of mine: cssColor.ts exported
clearCssColorCache() and documented exactly why it must be called on a theme
change, and then nothing called it. A gate that reports itself present while
nothing invokes it - the same class of fault this whole thread has been about.

It is also understated. There are TWO stale surfaces, not one:

  LABELS   painted with resolveCssColor('hsl(var(--foreground))') at draw
           time, so they are stale because the module cache is stale.
           Clearing the cache fixes these.

  DISCS    node.color and link.color are resolved INSIDE the graphData memo,
  and      so the concrete strings are frozen into the graph objects when
  EDGES    the memo last ran. Clearing the cache does nothing for them; the
           memo has to run again.

So the fix is a subscription, not just an invalidation. cssColor.ts now
exports onThemeColorsChanged(), which clears the cache and then notifies;
this file wires ResearchNetwork to it and adds themeEpoch to the memo deps
so the graph is rebuilt against the new palette.

KNOWN AND ACCEPTED: rebuilding graphData hands react-force-graph new node
objects, so the force simulation re-heats and the nodes settle again. That
already happens on every search, filter and layout change, so it is existing
behaviour rather than a regression - and it is a plainly better trade than
text the same colour as its background. In radial layout the nodes are
pinned with fx/fy, so nothing moves at all.

Run from the repo root:  python scripts/patch_theme_repaint.py
Add --check to verify anchors without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "THEME_REPAINT_2026_09_10"
PAGE = Path("src/pages/ResearchNetwork.tsx")
HELPER = Path("src/lib/cssColor.ts")

IMPORT_OLD = "import { resolveCssColor } from '@/lib/cssColor';"
IMPORT_NEW = "import { onThemeColorsChanged, resolveCssColor } from '@/lib/cssColor';"

REF_OLD = "  const containerRef = useRef<HTMLDivElement>(null);"
REF_NEW = """  const containerRef = useRef<HTMLDivElement>(null);

  // THEME_REPAINT_2026_09_10
  // Node and link colours are resolved inside the graphData memo below, so
  // they are frozen at the palette in force when it last ran. Flushing the
  // colour cache alone would refresh the labels, which resolve at paint
  // time, and leave every disc and edge in the previous theme. Bumping this
  // counter re-runs the memo against the new palette; onThemeColorsChanged
  // clears the cache before it calls us, so the re-read is fresh.
  const [themeEpoch, setThemeEpoch] = useState(0);
  useEffect(() => onThemeColorsChanged(() => setThemeEpoch((n) => n + 1)), []);"""

MEMO_OLD = """  const graphData = useMemo(() => {
    if (!articles || !crossRefs) return { nodes: [], links: [] };"""
MEMO_NEW = """  const graphData = useMemo(() => {
    // Read so the dependency is not merely declared: this memo has no other
    // use for the counter, it exists to force the rebuild described above.
    void themeEpoch;
    if (!articles || !crossRefs) return { nodes: [], links: [] };"""

DEPS_OLD = """  // dimensions joins the deps because the radial radius is now derived from
  // the canvas size; without it a resize would leave a stale ring.
  }, [articles, crossRefs, searchQuery, typeFilters, minStrength, layout,
      connectionCounts, dimensions]);"""
DEPS_NEW = """  // dimensions joins the deps because the radial radius is now derived from
  // the canvas size; without it a resize would leave a stale ring. themeEpoch
  // joins them because the colours below are resolved here, not at paint time.
  }, [articles, crossRefs, searchQuery, typeFilters, minStrength, layout,
      connectionCounts, dimensions, themeEpoch]);"""


def replace_one(text: str, old: str, new: str, label: str):
    n = text.count(old)
    if n != 1:
        return text, [f"{label}: matched {n} times, expected exactly 1"]
    return text.replace(old, new), []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    if not HELPER.exists():
        print(f"FAIL: {HELPER} is missing.")
        return 2
    if not PAGE.exists():
        print(f"FAIL: {PAGE} not found. Run from the repo root.")
        return 2

    if "onThemeColorsChanged" not in HELPER.read_text(encoding="utf-8"):
        print("FAIL: src/lib/cssColor.ts does not export onThemeColorsChanged.")
        print("      The subscription half of this fix is missing; patching the")
        print("      page alone would not compile.")
        return 2

    src = PAGE.read_text(encoding="utf-8")
    if MARK in src:
        print(f"Already patched ({MARK}). Nothing to do.")
        return 0
    if "RADIAL_TIDY_2026_09_09" not in src:
        print("FAIL: RADIAL_TIDY_2026_09_09 not present. This patch builds on it.")
        return 2

    problems: list[str] = []
    src, p = replace_one(src, IMPORT_OLD, IMPORT_NEW, "import"); problems += p
    src, p = replace_one(src, REF_OLD, REF_NEW, "subscription"); problems += p
    src, p = replace_one(src, MEMO_OLD, MEMO_NEW, "memo body"); problems += p
    src, p = replace_one(src, DEPS_OLD, DEPS_NEW, "memo deps"); problems += p

    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for x in problems:
            print("  " + x)
        return 1

    if args.check:
        print("All 4 anchors matched exactly once. --check: nothing written.")
        return 0

    PAGE.write_text(src, encoding="utf-8", newline="\n")
    print(f"Patched: {PAGE}  (4 edits)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
