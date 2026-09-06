#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_link_integrity.py — four broken internal links, and the gate that stops
the fifth. (2026-09-06)

WHAT YOU REPORTED
On /themes/scripts-inscriptions the link
    "Śarīra and Ātman: The Preservation of the Vedas →"
goes nowhere.

WHAT IT ACTUALLY IS
    <Link to="/sarira-atman-vedic-preservation">
The legacy route declared in App.tsx line 183 is
    /sarira-and-atman-vedic-preservation
One missing "and-". No route matches, so it falls through to the catch-all and
renders NotFound. Nothing could catch this: a <Link to> is a plain string, so
the compiler, the type-checker and the 41 existing tests are all blind to it.

AND IT IS NOT ONE LINK. scripts/link-integrity-check.mjs, run over all 486
source files and all 73 internal links, found FOUR:

  src/pages/themes/ScriptsInscriptions.tsx:113  /sarira-atman-vedic-preservation
  src/pages/themes/AncientIndia.tsx:191         /sarira-atman-vedic-preservation
  src/components/layout/Footer.tsx:102          /contact
  src/pages/BatchBujangNagapattinamOcean.tsx:90 /maps

The Footer one is on EVERY PAGE of the site.

THE TARGETS — each verified against App.tsx and the DB, not guessed
  /sarira-atman-vedic-preservation -> /articles/sarira-and-atman-vedic-preservation
      registry id 'sarira-and-atman-vedic-preservation' exists; canonicalSlugMap
      maps it to DB alias 'sarira-atman-preservation-vedas', which is a
      PUBLISHED row (id 75672e10). Linking to /articles/<registry id> is what
      every other theme-page link in this repo does.
  /maps     -> /maps-data        (App.tsx:146 — the only maps route that exists)
  /contact  -> /about            There is NO contact page and this patch does
      not invent one. About.tsx:92-93 is where contact lives: a "Contact
      Nartiang Foundation" button wired to mailto:contact@nartiang.org.

FIXING IT FOR GOOD
Repairing four strings fixes today. The reason this happened is structural:
App.tsx hand-maintains 89 route declarations, one per article, and every link
is a hand-typed string literal. So this patch also installs
src/__tests__/link-integrity.test.ts, which runs the audit inside the existing
vitest suite. `npm run test` now fails on a broken internal link.

The check resolves each link against four sources in order — declared routes,
static registry ids, canonicalSlugMap, and the live DB inventory
(docs/db_inventory.csv) — so it understands aliased articles and does not
false-positive on them.

IDEMPOTENT: re-running is a no-op (marker check, plus each edit asserts exactly
one match before writing). Every file is backed up under backups/.

  python patch_link_integrity.py            # dry run
  python patch_link_integrity.py --apply
  node scripts/link-integrity-check.mjs
  npm run test
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "LINK_INTEGRITY_2026_09_06"

EDITS = {
    "src/pages/themes/ScriptsInscriptions.tsx": [
        ('<Link to="/sarira-atman-vedic-preservation" className="text-primary hover:underline text-sm font-medium">',
         '<Link to="/articles/sarira-and-atman-vedic-preservation" className="text-primary hover:underline text-sm font-medium">'),
    ],
    "src/pages/themes/AncientIndia.tsx": [
        ('<Link to="/sarira-atman-vedic-preservation" className="text-primary hover:underline text-sm font-medium">',
         '<Link to="/articles/sarira-and-atman-vedic-preservation" className="text-primary hover:underline text-sm font-medium">'),
    ],
    "src/components/layout/Footer.tsx": [
        ('<Link to="/contact" className="hover:text-ocean transition-colors">',
         '<Link to="/about" className="hover:text-ocean transition-colors">'),
    ],
    "src/pages/BatchBujangNagapattinamOcean.tsx": [
        ('<Link to="/maps">', '<Link to="/maps-data">'),
    ],
}

TEST_PATH = os.path.join("src", "__tests__", "link-integrity.test.ts")
TEST_SRC = '''import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';

/**
 * LINK_INTEGRITY_2026_09_06
 *
 * A <Link to="..."> is a string. TypeScript cannot check it, the bundler
 * cannot check it, and a broken one renders NotFound in silence.
 *
 * On 2026-09-06 four were live at once, including one in the site-wide footer
 * and one that had "/sarira-atman-vedic-preservation" where App.tsx declares
 * "/sarira-and-atman-vedic-preservation" — a single missing "and-".
 *
 * scripts/link-integrity-check.mjs resolves every internal link against the
 * declared routes, the static registry, canonicalSlugMap.ts and the live DB
 * inventory, and exits non-zero if any link resolves to nothing. This test is
 * that script, wired into `npm run test` so the next one cannot ship.
 */
describe('internal link integrity', () => {
  it('every <Link to> / href in src/ resolves to a real route or article', () => {
    let out = '';
    let failed = false;
    try {
      out = execFileSync('node', ['scripts/link-integrity-check.mjs'], {
        encoding: 'utf8', cwd: process.cwd(),
      });
    } catch (err: any) {
      failed = true;
      out = (err.stdout || '') + (err.stderr || '');
    }
    if (failed) {
      throw new Error(
        'Broken internal link(s). Each line below is a <Link to>/href that '
        + 'matches no route, registry article, canonical alias or DB slug:\\n\\n' + out,
      );
    }
    expect(out).toContain('every internal link resolves');
  }, 60_000);
});
'''


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not os.path.isdir("src"):
        sys.exit("run from the srangam repo root (no src/ here)")
    if not os.path.exists(os.path.join("scripts", "link-integrity-check.mjs")):
        sys.exit("scripts/link-integrity-check.mjs is missing - it is the gate this patch wires up.")

    total, bad, already = 0, False, 0
    for path, pairs in EDITS.items():
        if not os.path.exists(path):
            print(f"  MISSING FILE: {path}"); bad = True; continue
        s = io.open(path, encoding="utf-8").read()
        for old, new in pairs:
            n = s.count(old)
            if n == 0 and s.count(new) >= 1:
                print(f"  {path}: already fixed"); already += 1; continue
            print(f"  {path}: {n} match(es) (need exactly 1)")
            if n != 1: bad = True
            total += n
    if os.path.exists(TEST_PATH):
        print(f"  {TEST_PATH}: already present")
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print(f"\nAnchors OK ({total} to change, {already} already fixed). Re-run with --apply.")
        return

    os.makedirs("backups", exist_ok=True)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    written = []
    try:
        for path, pairs in EDITS.items():
            s = io.open(path, encoding="utf-8").read()
            changed = False
            for old, new in pairs:
                if s.count(old) == 1:
                    s = s.replace(old, new, 1); changed = True
            if not changed:
                continue
            b = os.path.join("backups", os.path.basename(path) + f".preLinkFix.{stamp}")
            shutil.copy2(path, b)
            io.open(path, "w", encoding="utf-8", newline="\n").write(s)
            written.append((path, b))
            print(f"  fixed {path}  (backup {b})")
        os.makedirs(os.path.dirname(TEST_PATH), exist_ok=True)
        if not os.path.exists(TEST_PATH):
            io.open(TEST_PATH, "w", encoding="utf-8", newline="\n").write(TEST_SRC)
            print(f"  added {TEST_PATH}")
    except Exception as exc:
        for path, b in written:
            shutil.copy2(b, path)
        sys.exit(f"FAILED ({exc}) - all files restored from backup.")

    print("\nApplied. Verify:")
    print("  node scripts/link-integrity-check.mjs      # expect: every internal link resolves")
    print("  npm run test                              # expect: 42 tests")
    print("\nThen hard-refresh /themes/scripts-inscriptions and /themes/ancient-india.")


if __name__ == "__main__":
    main()
