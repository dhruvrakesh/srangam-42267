#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_pins_in_panel.py — the "Sources & Pins" panel never queries pins.
(2026-09-07)

THE DEFECT, MEASURED
src/components/oceanic/SourcesAndPins.tsx line 35:

    const hasDbData = (bibliography && bibliography.length > 0)
                   || (evidence && evidence.length > 0);

Pins are not in that expression. Line 62 counts only bibliography + evidence.
Line 423 renders only `legacyData.pins` — the hand-maintained static snapshot —
so database pins are never displayed at all.

consolidate_06_ENRICHMENT_STATE.sql, run 2026-09-07 against all 59 articles:

    have pins          46
    have evidence       9
    have bibliography   5

So the majority of the corpus has exactly the thing this panel is named after,
and the panel cannot see it. custodians-unfinished-time holds 3 pins and shows
"No structured evidence or bibliography rows are stored for this article in the
database yet — showing the curated legacy correlation snapshot instead", then
"No key claims have been indexed for this page in the legacy correlation
snapshot" underneath, because the legacy map has no entry for a slug created
yesterday. Both messages are true as written and together they are misleading:
the database does hold data for that article.

WHAT THIS DOES NOT DO
It does not write a new pins loader. src/lib/articlePins.ts already has
loadArticlePins() with its gazetteer join and 4-second timeout, and
articleResolver.ts:152 already calls it for the map. Duplicating that was the
tempting mistake; src/hooks/useArticlePins.ts is a thin React-Query wrapper
over the existing function and nothing else.

  python patch_pins_in_panel.py            # dry run
  python patch_pins_in_panel.py --apply
  npm run test
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "PINS_IN_PANEL_2026_09_07"
F = os.path.join("src", "components", "oceanic", "SourcesAndPins.tsx")

EDITS = [
    ("""import { correlationEngine, type SourcesAndPins as LegacySourcesAndPinsData } from '@/lib/correlationEngine';""",
     """import { correlationEngine, type SourcesAndPins as LegacySourcesAndPinsData } from '@/lib/correlationEngine';
import { useArticlePinsBySlug } from '@/hooks/useArticlePins';   // PINS_IN_PANEL_2026_09_07"""),

    ("""  const { data: evidence, isLoading: evidenceLoading } = useArticleEvidenceBySlug(articleSlug);
  
  // Legacy fallback
  const legacyData = correlationEngine.getSourcesAndPins(pageOrCard);
  
  // Determine if we have database data
  const hasDbData = (bibliography && bibliography.length > 0) || (evidence && evidence.length > 0);
  const isLoading = bibLoading || evidenceLoading;""",
     """  const { data: evidence, isLoading: evidenceLoading } = useArticleEvidenceBySlug(articleSlug);
  // PINS_IN_PANEL_2026_09_07 — a panel called "Sources & Pins" was not querying
  // pins. 46 of 59 articles have them; only 5 have bibliography and 9 evidence.
  const { data: dbPins, isLoading: pinsLoading } = useArticlePinsBySlug(articleSlug);
  
  // Legacy fallback
  const legacyData = correlationEngine.getSourcesAndPins(pageOrCard);
  
  // Determine if we have database data
  const hasDbData = (bibliography && bibliography.length > 0)
    || (evidence && evidence.length > 0)
    || (dbPins && dbPins.length > 0);
  const isLoading = bibLoading || evidenceLoading || pinsLoading;"""),

    ("""              {hasDbData ? (bibliography?.length || 0) + (evidence?.length || 0) : legacyData.pins.length}""",
     """              {hasDbData
                ? (bibliography?.length || 0) + (evidence?.length || 0) + (dbPins?.length || 0)
                : legacyData.pins.length}"""),

    ("""      {legacyData.pins.length > 0 && (""",
     """      {/* PINS_IN_PANEL_2026_09_07 — database pins, which were never rendered. */}
      {(dbPins?.length ?? 0) > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            Geographical Pins ({dbPins!.length})
            <span className="text-xs text-muted-foreground">from database</span>
          </h4>
          <div className="space-y-2">
            {dbPins!.map((pin, index) => (
              <div key={pin.gazetteer_id ?? `${pin.name}-${index}`}
                   className="text-sm border-l-2 border-primary/40 pl-3">
                <div className="font-medium">{pin.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pin.lat.toFixed(4)}, {pin.lon.toFixed(4)}
                  {pin.confidence ? ` · confidence ${pin.confidence}` : ''}
                  {pin.approximate ? ' · approximate' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(dbPins?.length ?? 0) === 0 && legacyData.pins.length > 0 && ("""),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()

    hook = os.path.join("src", "hooks", "useArticlePins.ts")
    if not os.path.exists(hook):
        sys.exit(f"missing {hook} - the hook must exist before wiring it in")
    if not os.path.exists(F):
        sys.exit(f"not found: {F}")
    s = io.open(F, encoding="utf-8").read()
    if MARKER in s:
        print("Already applied (marker found). Nothing to do."); return

    bad = False
    for i, (old, _n) in enumerate(EDITS, 1):
        n = s.count(old)
        print(f"  edit {i}: {n} match(es) (need exactly 1)")
        if n != 1: bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not a.apply:
        print("\nAnchors OK (4/4). Re-run with --apply, then: npm run test"); return

    os.makedirs("backups", exist_ok=True)
    b = os.path.join("backups", "SourcesAndPins.tsx.prePins." + time.strftime("%Y%m%d_%H%M%S"))
    shutil.copy2(F, b); print(f"  backup: {b}")
    try:
        for old, new in EDITS:
            assert s.count(old) == 1
            s = s.replace(old, new, 1)
        io.open(F, "w", encoding="utf-8", newline="\n").write(s)
    except Exception as exc:
        shutil.copy2(b, F)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. Verify:")
    print("  npm run test")
    print("  then load /articles/custodians-unfinished-time and open Sources & Pins")
    print("  EXPECT: the badge reads 3, a 'Geographical Pins (3) from database'")
    print("  block appears, and the two empty-state messages are gone.")


if __name__ == "__main__":
    main()
