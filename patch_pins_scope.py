#!/usr/bin/env python3
"""
PINS_SCOPE_FIX_2026_09_07

Repairs two defects introduced by patch_pins_in_panel.py (commit da87f24).

DEFECT 1 - dbPins out of scope (ReferenceError at runtime).
  The pins render block was inserted into SourcesAndPinsContent, which is a
  module-scope component. `dbPins` is declared inside SourcesAndPins and was
  never passed down. Four references (lines 432/435/439/454) are unresolved
  identifiers. `tsc -p tsconfig.app.json --noEmit` reports:
      error TS2304: Cannot find name 'dbPins'.   x4
  Vite/esbuild does not typecheck, so this built and deployed. At runtime the
  legacy-fallback branch throws ReferenceError: dbPins is not defined -
  optional chaining does not protect an undeclared identifier. Every article
  with no database rows would render a blank panel plus a console error.
  The repo's `tsc --noEmit` is a no-op: tsconfig.json has "files": [] with
  project references, so it typechecks zero files and exits 0.

DEFECT 2 - the pins block is in the branch pins make unreachable.
  hasDbData now includes dbPins, so an article WITH pins takes the database
  branch. The pins block was placed only in the legacy branch, which runs
  when hasDbData is false - that is, when there are no pins. The two
  conditions are mutually exclusive: pins could never render.
  custodians-unfinished-time (3 pins, 0 bibliography, 0 evidence) would have
  shown "No structured bibliography rows for this article yet" and no pins.

Fix: thread dbPins through as a prop, hoist the render into one
DatabasePinsBlock component, and render it in BOTH branches.

Idempotent: re-running finds the marker and exits 0 without touching the file.
"""
import sys, pathlib

MARK = "PINS_SCOPE_FIX_2026_09_07"
TARGET = pathlib.Path("src/components/oceanic/SourcesAndPins.tsx")

EDITS = [
    # 1. import the ArticlePin type (the hook does not re-export it)
    (
        "import { useArticlePinsBySlug } from '@/hooks/useArticlePins';   // PINS_IN_PANEL_2026_09_07",
        "import { useArticlePinsBySlug } from '@/hooks/useArticlePins';   // PINS_IN_PANEL_2026_09_07\n"
        "import type { ArticlePin } from '@/lib/articlePins';             // " + MARK,
    ),
    # 2. call site A - compact / Sheet (8-space indent)
    (
        "          <SourcesAndPinsContent \n"
        "            bibliography={bibliography}\n"
        "            evidence={evidence}\n"
        "            legacyData={legacyData}\n"
        "            hasDbData={hasDbData}\n",
        "          <SourcesAndPinsContent \n"
        "            bibliography={bibliography}\n"
        "            evidence={evidence}\n"
        "            dbPins={dbPins}\n"
        "            legacyData={legacyData}\n"
        "            hasDbData={hasDbData}\n",
    ),
    # 3. call site B - full card (6-space indent)
    (
        "        <SourcesAndPinsContent \n"
        "          bibliography={bibliography}\n"
        "          evidence={evidence}\n"
        "          legacyData={legacyData}\n"
        "          hasDbData={hasDbData}\n",
        "        <SourcesAndPinsContent \n"
        "          bibliography={bibliography}\n"
        "          evidence={evidence}\n"
        "          dbPins={dbPins}\n"
        "          legacyData={legacyData}\n"
        "          hasDbData={hasDbData}\n",
    ),
    # 4. download payload: the badge counts pins, so the export must contain them
    (
        "      ? { bibliography, evidence, source: 'database' }",
        "      ? { bibliography, evidence, pins: dbPins ?? [], source: 'database' }  // " + MARK,
    ),
    # 5. one shared pins renderer at module scope
    (
        "const SourcesAndPinsContent: React.FC<{\n"
        "  bibliography: ArticleBibliographyLink[] | undefined;\n"
        "  evidence: ArticleEvidence[] | undefined;\n"
        "  legacyData: LegacySourcesAndPinsData;\n"
        "  hasDbData: boolean;\n"
        "  isLoading: boolean;\n"
        "  onDownload: () => void;\n"
        "}> = ({ bibliography, evidence, legacyData, hasDbData, isLoading }) => {",

        "/** " + MARK + " - srangam_article_pins, rendered from a single place.\n"
        " *  Previously inlined in the legacy branch only, where hasDbData is false -\n"
        " *  i.e. exactly when there are no pins. It could never appear. */\n"
        "const DatabasePinsBlock: React.FC<{ pins: ArticlePin[] }> = ({ pins }) => (\n"
        "  <div className=\"space-y-2\">\n"
        "    <h4 className=\"font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2\">\n"
        "      <MapPin className=\"h-4 w-4\" />\n"
        "      Geographical Pins ({pins.length})\n"
        "      <span className=\"text-xs font-normal normal-case opacity-75\">from database</span>\n"
        "    </h4>\n"
        "    <div className=\"grid gap-2\">\n"
        "      {pins.map((pin, index) => (\n"
        "        <div key={pin.gazetteer_id ?? `${pin.name}-${index}`}\n"
        "             className=\"p-2 rounded bg-background border border-l-2 border-l-primary/40\">\n"
        "          <div className=\"text-sm font-medium\">{pin.name}</div>\n"
        "          <div className=\"text-xs text-muted-foreground font-mono\">\n"
        "            {pin.lat.toFixed(4)}, {pin.lon.toFixed(4)}\n"
        "            {pin.confidence ? ` \\u00b7 confidence ${pin.confidence}` : ''}\n"
        "            {pin.approximate ? ' \\u00b7 approximate' : ''}\n"
        "          </div>\n"
        "        </div>\n"
        "      ))}\n"
        "    </div>\n"
        "  </div>\n"
        ");\n"
        "\n"
        "const SourcesAndPinsContent: React.FC<{\n"
        "  bibliography: ArticleBibliographyLink[] | undefined;\n"
        "  evidence: ArticleEvidence[] | undefined;\n"
        "  dbPins: ArticlePin[] | undefined;   // " + MARK + "\n"
        "  legacyData: LegacySourcesAndPinsData;\n"
        "  hasDbData: boolean;\n"
        "  isLoading: boolean;\n"
        "  onDownload: () => void;\n"
        "}> = ({ bibliography, evidence, dbPins, legacyData, hasDbData, isLoading }) => {",
    ),
    # 6. render pins INSIDE the database branch - the branch pins themselves select
    (
        "        {/* Evidence Detail Dialog */}\n"
        "        <Dialog open={!!selectedEvidence}",

        "        {/* " + MARK + " - pins are neither bibliography nor evidence, so they\n"
        "            render under whichever view is active rather than behind the toggle. */}\n"
        "        {(dbPins?.length ?? 0) > 0 && <DatabasePinsBlock pins={dbPins!} />}\n"
        "\n"
        "        {/* Evidence Detail Dialog */}\n"
        "        <Dialog open={!!selectedEvidence}",
    ),
]

# 7b. replace the inlined legacy pins JSX with the shared component
LEGACY_INLINE_START = "      {/* Pins */}"
LEGACY_INLINE_END = "      {(dbPins?.length ?? 0) === 0 && legacyData.pins.length > 0 && ("


def main() -> int:
    apply = "--apply" in sys.argv
    if not TARGET.exists():
        print(f"FAIL: {TARGET} not found (run from repo root)")
        return 1
    src = TARGET.read_text(encoding="utf-8")

    if MARK in src:
        print(f"Already applied (marker {MARK} found). No change.")
        return 0

    out = src
    for i, (old, new) in enumerate(EDITS, 1):
        n = out.count(old)
        if n != 1:
            print(f"FAIL: anchor {i} matched {n} times, expected 1")
            print(f"      anchor head: {old.splitlines()[0][:80]!r}")
            return 1
        out = out.replace(old, new, 1)
        print(f"  anchor {i}/{len(EDITS)} ok")

    a = out.find(LEGACY_INLINE_START)
    b = out.find(LEGACY_INLINE_END)
    if a == -1 or b == -1 or b <= a:
        print(f"FAIL: legacy inline block not located (a={a}, b={b})")
        return 1
    out = out[:a] + "      {/* Pins */}\n      {/* PINS_IN_PANEL_2026_09_07 / " + MARK + " */}\n" "      {(dbPins?.length ?? 0) > 0 && <DatabasePinsBlock pins={dbPins!} />}\n\n" + out[b:]
    print("  legacy inline block collapsed -> DatabasePinsBlock")

    if not apply:
        print(f"\nDRY RUN. {len(src)} -> {len(out)} chars. Re-run with --apply.")
        return 0
    TARGET.write_text(out, encoding="utf-8")
    print(f"\nAPPLIED to {TARGET} ({len(src)} -> {len(out)} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
