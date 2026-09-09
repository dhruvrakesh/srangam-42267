#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_radial_tidy.py  (2026-09-09)  RADIAL_TIDY_2026_09_09

"the radial heirarchy in the analysis with tags etc can be far better.
 it is very untidy at the moment"  - 2026-09-08

src/pages/ResearchNetwork.tsx, routed at /research-network. Four defects,
all measurable in the source, none of them matters of taste.

1. THE COLOUR SYSTEM HAS NEVER WORKED.
   THEME_COLORS, TYPE_COLORS and getNodeColor all return strings shaped like
   'hsl(var(--peacock-blue))'. `var()` is resolved by the CSS cascade against
   an element; a canvas 2D context has no element, so that string is not a
   parseable <color>. Per the HTML specification an unparseable assignment to
   fillStyle is IGNORED and the previous value persists. So:
       ctx.fillStyle = node.color;              // ignored
       ctx.arc(...); ctx.fill();                // painted in whatever came before
       ctx.fillStyle = 'hsl(var(--foreground))' // ignored
       ctx.fillText(label, ...)                 // label painted in the DISC's colour
   Every node the same colour, every label the colour of the disc beneath it.
   That alone accounts for "very untidy".

2. THE RING ALWAYS HAS A GAP.
   The angle used `(i / nodes.length)` where i ran over ALL nodes including
   the hub, which is then pinned at the origin. One slot on the circle is
   therefore always empty.

3. THE RADIUS WAS A CONSTANT 300.
   Independent of node count and of canvas size. At 50 nodes the arc spacing
   is 2*pi*300/50 = 37.7px while node radii reach 30+, so the ring overlaps
   itself; with a handful of nodes they are stranded far from the hub.

4. LABELS WERE ALWAYS DRAWN BELOW THE NODE.
   `node.y + node.value + fontSize`, on a circle. On the lower arc the text
   runs straight into the ring and into its neighbours.

NOT A DEFECT, and I said it was before checking: the canvas IS responsive.
There is a resize effect at line ~94 that sets dimensions from the container.
I claimed it was hard-locked to 1200x800 and that was wrong.

Run from the repo root:  python scripts/patch_radial_tidy.py
Add --check to verify anchors without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "RADIAL_TIDY_2026_09_09"
PAGE = Path("src/pages/ResearchNetwork.tsx")
HELPER = Path("src/lib/cssColor.ts")

IMPORT_ANCHOR = "import { Link } from 'react-router-dom';"
IMPORT_NEW = (IMPORT_ANCHOR +
              "\nimport { resolveCssColor } from '@/lib/cssColor';")

NODE_COLOR_OLD = """  const getNodeColor = (article: any) => {
    if (!article?.theme) return 'hsl(var(--muted))';
    return THEME_COLORS[article.theme] || 'hsl(var(--muted))';
  };"""

NODE_COLOR_NEW = """  // RADIAL_TIDY_2026_09_09 - these tokens are painted onto a canvas, which
  // cannot resolve var(). Resolve here, once, against the document.
  const getNodeColor = (article: any) => {
    const token = !article?.theme
      ? 'hsl(var(--muted))'
      : THEME_COLORS[article.theme] || 'hsl(var(--muted))';
    return resolveCssColor(token, '#94a3b8');
  };"""

LINK_COLOR_OLD = "        color: TYPE_COLORS[ref.reference_type] || 'hsl(var(--muted-foreground))',"
LINK_COLOR_NEW = ("        color: resolveCssColor(\n"
                  "          TYPE_COLORS[ref.reference_type] || 'hsl(var(--muted-foreground))',\n"
                  "          '#64748b',\n"
                  "        ),")

RADIAL_START = "    if (layout === 'radial' && nodes.length > 0) {"
RADIAL_END = "\n    } else {"   # newline-anchored: the 4-space form is a
                              # substring of the nested 8-space one
RADIAL_NEW = """    if (layout === 'radial' && nodes.length > 0) {
      // RADIAL_TIDY_2026_09_09
      // The hub used to consume a slot on the ring - the index ran over every
      // node including the one pinned at the origin - so the circle always
      // carried one empty gap. The radius was a constant 300 whatever the
      // node count or the canvas size. And the order was whatever the query
      // returned, so adjacency on the ring meant nothing.
      const hub = nodes.reduce((max, node) => (node.value > max.value ? node : max));
      const ring = nodes
        .filter((n) => n.id !== hub.id)
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

      hub.fx = 0;
      hub.fy = 0;

      if (ring.length > 0) {
        // Room for each node's own diameter plus a gap, then held inside the
        // canvas so the ring cannot walk off the edge.
        const widest = ring.reduce((m, n) => Math.max(m, n.value), 0);
        const needed = (ring.length * (widest * 2 + 18)) / (2 * Math.PI);
        const ceiling = Math.max(
          140,
          Math.min(dimensions.width, dimensions.height) / 2 - widest - 24,
        );
        const radius = Math.max(140, Math.min(needed, ceiling));

        ring.forEach((node, i) => {
          // -PI/2 starts the ring at twelve o'clock rather than three.
          const angle = (i / ring.length) * 2 * Math.PI - Math.PI / 2;
          node.fx = Math.cos(angle) * radius;
          node.fy = Math.sin(angle) * radius;
        });
      }
    } else {"""

DEPS_OLD = "  }, [articles, crossRefs, searchQuery, typeFilters, minStrength, layout, connectionCounts]);"
DEPS_NEW = ("  // dimensions joins the deps because the radial radius is now derived from\n"
            "  // the canvas size; without it a resize would leave a stale ring.\n"
            "  }, [articles, crossRefs, searchQuery, typeFilters, minStrength, layout,\n"
            "      connectionCounts, dimensions]);")

PAINT_START = "\n              nodeCanvasObject={(node: any, ctx, globalScale) => {"
PAINT_END = "\n              }}"
PAINT_NEW = """\n              nodeCanvasObject={(node: any, ctx, globalScale) => {
                // RADIAL_TIDY_2026_09_09
                // ctx.fillStyle = 'hsl(var(--foreground))' is not something a
                // canvas can parse. An unparseable assignment is ignored and
                // the previous fill persists, so every label was painted in
                // the colour of the disc it sat on. resolveCssColor reads the
                // custom property off the document, where the cascade has
                // already resolved it into concrete HSL components.
                const label = node.name;
                const r = Math.max(3, Math.min(node.value, 22));

                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = resolveCssColor(node.color, '#94a3b8');
                ctx.fill();

                // Label only what a reader can actually read at this zoom.
                if (globalScale < 0.7 && node.value < 12) return;

                // Push the text outward along the node's own radius instead of
                // always downward, so the lower arc stops writing over itself.
                const fontSize = Math.max(9, 12 / globalScale);
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textBaseline = 'middle';
                const len = Math.hypot(node.x, node.y) || 1;
                const ux = node.x / len;
                const uy = node.y / len;
                ctx.textAlign = ux >= 0 ? 'left' : 'right';
                ctx.fillStyle = resolveCssColor('hsl(var(--foreground))', '#0f172a');
                ctx.fillText(label, node.x + ux * (r + 6), node.y + uy * (r + 6));
              }}"""


def splice(text: str, start: str, end: str, new: str, label: str):
    if text.count(start) != 1:
        return text, [f"{label}: start anchor matched {text.count(start)} times"]
    i = text.index(start)
    j = text.find(end, i + len(start))
    if j == -1:
        return text, [f"{label}: end anchor not found after start"]
    return text[:i] + new + text[j + len(end):], []


def replace_one(text: str, old: str, new: str, label: str):
    if text.count(old) != 1:
        return text, [f"{label}: matched {text.count(old)} times"]
    return text.replace(old, new), []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    if not HELPER.exists():
        print(f"FAIL: {HELPER} is missing. It must be in place before patching.")
        return 2
    if not PAGE.exists():
        print(f"FAIL: {PAGE} not found. Run from the repo root.")
        return 2

    src = PAGE.read_text(encoding="utf-8")
    if MARK in src:
        print(f"Already patched ({MARK}). Nothing to do.")
        return 0

    problems: list[str] = []
    src, p = replace_one(src, IMPORT_ANCHOR, IMPORT_NEW, "import"); problems += p
    src, p = replace_one(src, NODE_COLOR_OLD, NODE_COLOR_NEW, "getNodeColor"); problems += p
    src, p = replace_one(src, LINK_COLOR_OLD, LINK_COLOR_NEW, "link colour"); problems += p
    src, p = splice(src, RADIAL_START, RADIAL_END, RADIAL_NEW, "radial layout"); problems += p
    src, p = replace_one(src, DEPS_OLD, DEPS_NEW, "memo deps"); problems += p
    src, p = splice(src, PAINT_START, PAINT_END, PAINT_NEW, "node paint"); problems += p

    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for x in problems:
            print("  " + x)
        return 1

    if args.check:
        print("All 6 anchors matched exactly once. --check: nothing written.")
        return 0

    PAGE.write_text(src, encoding="utf-8", newline="\n")
    print(f"Patched: {PAGE}  (6 edits)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
