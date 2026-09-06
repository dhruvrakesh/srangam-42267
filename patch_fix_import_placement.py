#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_fix_import_placement.py — my import landed inside a string. (2026-09-06)

WHAT HAPPENED
    node scripts/generate-registry-meta.mjs
    ReferenceError: substantiveLangs is not defined
        at generate-registry-meta.mjs:50

patch_badge_truth.py used a helper that inserted the new import "after the last
line beginning with `import `". In this file that line is NOT code — it is line
66, inside the `header` template literal that becomes the TEXT of the generated
src/data/articles/meta.ts:

    const header = `/**
     * GENERATED FILE ...
     */
    import type { LocalizedArticle, SupportedLanguage } from '@/types/multilingual';
    import { substantiveLangs, placeholderLangs } from './lib/substance.mjs';   <-- landed HERE
    `

So the generator never imported the function it calls at line 50, and had it
run, it would have written a broken import into meta.ts (the path is relative
to scripts/, not to src/data/articles/). A line-scanning heuristic cannot tell
code from string; an exact anchor can. My error.

CONSEQUENCE FOR THE RECORD — two commit messages overstate their work
    189a270  "badges: count real translations, not placeholders"
    3545bd8  "meta.ts: regenerate with the substance rule - 13 badges now truthful"
Neither regenerated meta.ts. `git show --stat 3545bd8` does not list
src/data/articles/meta.ts, and `preview-badge-truth.py --check` still reports 13
stale articles. The generator fix and the substance rule ARE in place and are
correct; only the regeneration never happened. Nothing on the live site has
changed yet. The commit below states this plainly rather than rewriting pushed
history.

The guard worked: --check caught it both times. What was missing was making the
guard block the commit, so this patch also installs
src/__tests__/meta-freshness.test.ts.

  python patch_fix_import_placement.py            # dry run
  python patch_fix_import_placement.py --apply
  node scripts/generate-registry-meta.mjs
  python scripts/preview-badge-truth.py --check
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

GEN = os.path.join("scripts", "generate-registry-meta.mjs")
TEST = os.path.join("src", "__tests__", "meta-freshness.test.ts")
MISPLACED = "import type { LocalizedArticle, SupportedLanguage } from '@/types/multilingual';\nimport { substantiveLangs, placeholderLangs } from './lib/substance.mjs';"
CORRECTED = "import type { LocalizedArticle, SupportedLanguage } from '@/types/multilingual';"
ANCHOR = "import { pathToFileURL } from 'url';"
REAL_IMPORT = ("import { pathToFileURL } from 'url';\n"
               "// SUBSTANCE_SHARED_2026_09_06 - the placeholder rule, shared with\n"
               "// scripts/registry-parity-check.mjs so the two cannot drift.\n"
               "import { substantiveLangs, placeholderLangs } from './lib/substance.mjs';")

TEST_SRC = '''import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';

/**
 * META_FRESHNESS_2026_09_06
 *
 * src/data/articles/meta.ts is GENERATED. It drives the n/9 language badge on
 * every article card, and for months it drifted from its source modules
 * because generate-registry-meta.mjs wrote its intermediates to '/tmp/...'
 * and therefore could not run on Windows — the only machine this repo is
 * maintained from.
 *
 * On 2026-09-06 two commits (189a270, 3545bd8) claimed the badges had been
 * corrected while meta.ts was untouched: the generator failed, the failure
 * scrolled past, and the message was written from intent rather than result.
 *
 * This test compares meta.ts against its sources on every `npm run test`, so
 * a stale generated file cannot be committed with a message saying otherwise.
 */
function runCheck(): { ok: boolean; out: string; ran: boolean } {
  for (const exe of ['python', 'python3']) {
    try {
      const out = execFileSync(exe, ['scripts/preview-badge-truth.py', '--check'], {
        encoding: 'utf8', cwd: process.cwd(),
      });
      return { ok: true, out, ran: true };
    } catch (err: any) {
      // ENOENT = this interpreter is absent; try the next name.
      if (err?.code === 'ENOENT') continue;
      return { ok: false, out: (err.stdout || '') + (err.stderr || ''), ran: true };
    }
  }
  return { ok: false, out: '', ran: false };
}

describe('generated meta.ts freshness', () => {
  it('meta.ts matches the article modules it is generated from', () => {
    const r = runCheck();
    if (!r.ran) {
      throw new Error(
        'Could not run the meta.ts freshness guard: no `python` or `python3` on PATH.\\n'
        + 'This check is not optional — meta.ts drives the language badge on every card '
        + 'and has silently drifted before. Install Python, or run it manually:\\n'
        + '  python scripts/preview-badge-truth.py --check',
      );
    }
    if (!r.ok) {
      throw new Error(
        'src/data/articles/meta.ts is STALE.\\n\\n' + r.out
        + '\\nRegenerate it and commit the result:\\n'
        + '  node scripts/generate-registry-meta.mjs',
      );
    }
    expect(r.out).toContain('in sync');
  }, 60_000);
});
'''


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(GEN):
        sys.exit(f"not found: {GEN}")
    g = io.open(GEN, encoding="utf-8").read()

    n_bad = g.count(MISPLACED)
    n_ok = 1 if REAL_IMPORT.split("\n")[-1] in g.split("const ROOT")[0] else 0
    print(f"  misplaced import inside the header template : {n_bad} (need 1)")
    print(f"  correct import already in the code section  : {n_ok}")
    print(f"  anchor '{ANCHOR}'                            : {g.count(ANCHOR)} (need 1)")
    if n_bad != 1 or g.count(ANCHOR) != 1:
        if n_bad == 0 and n_ok == 1:
            print("\nAlready fixed. Nothing to do."); return
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print(f"\nAnchors OK. Test to install: {TEST} "
              f"({'exists already' if os.path.exists(TEST) else 'new'})")
        print("Re-run with --apply.")
        return

    os.makedirs("backups", exist_ok=True)
    b = os.path.join("backups", "generate-registry-meta.mjs.preImportFix." + time.strftime("%Y%m%d_%H%M%S"))
    shutil.copy2(GEN, b)
    print(f"  backup: {b}")
    try:
        g = g.replace(MISPLACED, CORRECTED, 1)      # out of the string
        g = g.replace(ANCHOR, REAL_IMPORT, 1)       # into the code
        assert "substantiveLangs" in g.split("const ROOT")[0], "import did not land in the code section"
        io.open(GEN, "w", encoding="utf-8", newline="\n").write(g)
        os.makedirs(os.path.dirname(TEST), exist_ok=True)
        if not os.path.exists(TEST):
            io.open(TEST, "w", encoding="utf-8", newline="\n").write(TEST_SRC)
            print(f"  added {TEST}")
    except Exception as exc:
        shutil.copy2(b, GEN)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. Regenerate, then PROVE it:")
    print("  node scripts/generate-registry-meta.mjs")
    print("  python scripts/preview-badge-truth.py --check   # must print 'in sync', exit 0")
    print("  npm run test                                    # expect 43")


if __name__ == "__main__":
    main()
