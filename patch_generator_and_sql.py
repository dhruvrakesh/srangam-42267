#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_generator_and_sql.py — two blockers from the 19:51 run. (2026-09-06)

──────────────────────────────────────────────────────────────────────────────
BLOCKER 1 — commit 189a270 does not do what its message says
──────────────────────────────────────────────────────────────────────────────
The message reads "badges: count real translations, not placeholders". It does
not. `node scripts/generate-registry-meta.mjs` FAILED:

    Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'D:\\tmp\\registry-bundle.mjs'

so src/data/articles/meta.ts was never regenerated. Verified after the push:

    meta.ts  scripts-that-sailed-ii  contentLanguages = ["en","hi","ta"]   <- unchanged
    meta.ts  placeholderLanguages                       absent             <- unchanged

NOT ONE BADGE CHANGED. The generator now applies the substance rule, but the
generated file the UI actually reads is the old one. The patch landed; the
effect did not — which is the same defect this whole session has been about,
and it is now in the git history as a commit message that overstates its work.

ROOT CAUSE — a pre-existing Windows bug, not one I introduced
    outfile: '/tmp/registry-bundle.mjs'
    await import(pathToFileURL('/tmp/registry-bundle.mjs'))
esbuild resolves the POSIX-absolute '/tmp/...' against the working directory
and writes D:\\srangam-42267\\tmp\\registry-bundle.mjs, while pathToFileURL()
builds file:///D:/tmp/registry-bundle.mjs — the DRIVE ROOT. Different paths;
the import misses.

This generator has therefore never run on Windows, which is the only machine
this repo is maintained from. meta.ts's own header says "Regenerate with:
node scripts/generate-registry-meta.mjs" — a command that could not succeed
here. That is why meta.ts drifted from its sources in the first place.

Side effect to clean up: the failed run left a 1.4 MB build artefact at
tmp/registry-bundle.mjs, which `git add -A` swept into commit 189a270 and
pushed (9,804 insertions). This patch gitignores tmp/; the runbook removes it
from the index.

FIX: write intermediates under node_modules/.cache/registry-meta/ using
path.join, exactly as registry-parity-check.mjs already does with
node_modules/.parity-registry.mjs. Cross-platform, and never committable.

──────────────────────────────────────────────────────────────────────────────
BLOCKER 2 — consolidate_01_evidence.sql: `title` is jsonb, not text
──────────────────────────────────────────────────────────────────────────────
    ERROR: 22P02: invalid input syntax for type json
    LINE 31: left(COALESCE(a.title, ''), 90) AS title

srangam_articles.title is a multilingual jsonb column — docs/DATABASE_SCHEMA.md
line 41 says `jsonb title "Multilingual"`. COALESCE(a.title, '') tries to cast
the empty string to json and fails before a single row is read.

I had that schema open earlier in this session and still wrote the text form in
three files, while writing the CORRECT form — title::jsonb ->> 'en' — in
consolidate_03 section 5. Inconsistency on my part, not a schema surprise.

Five occurrences fixed:
    consolidate_01_evidence.sql       lines 31, 47, 64
    consolidate_02_publish_drafts.sql line 36
    consolidate_03_merge_duplicates.sql line 54

  python patch_generator_and_sql.py            # dry run
  python patch_generator_and_sql.py --apply
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "WINPATH_JSONB_2026_09_06"
GEN = os.path.join("scripts", "generate-registry-meta.mjs")

GEN_EDITS = [
    ("""const ROOT = process.cwd();""",
     """const ROOT = process.cwd();

// WINPATH_JSONB_2026_09_06 — intermediates used to go to '/tmp/...', which on
// Windows esbuild writes relative to the cwd (D:\\repo\\tmp\\) while
// pathToFileURL() resolves to the drive root (file:///D:/tmp/) — so the import
// always missed and this generator could never run here. Same convention as
// registry-parity-check.mjs: keep build output inside node_modules.
const TMPDIR = join(ROOT, 'node_modules', '.cache', 'registry-meta');
mkdirSync(TMPDIR, { recursive: true });"""),

    ("""await build({ entryPoints: ['src/data/articles/index.ts'], bundle: true, format: 'esm', platform: 'node', outfile: '/tmp/registry-bundle.mjs', alias: { '@': ROOT + '/src' }, logLevel: 'error' });
const full = await import(pathToFileURL('/tmp/registry-bundle.mjs'));""",
     """const bundlePath = join(TMPDIR, 'registry-bundle.mjs');
await build({ entryPoints: ['src/data/articles/index.ts'], bundle: true, format: 'esm', platform: 'node', outfile: bundlePath, alias: { '@': ROOT + '/src' }, logLevel: 'error' });
const full = await import(pathToFileURL(bundlePath));"""),

    ("""  const out = `/tmp/mod-${m.exportName}.mjs`;""",
     """  const out = join(TMPDIR, `mod-${m.exportName}.mjs`);"""),
]

SQL_EDITS = {
    "consolidate_01_evidence.sql": [
        ("""  left(COALESCE(a.title, ''), 90)                               AS title,""",
         """  left(COALESCE(a.title::jsonb ->> 'en', ''), 90)                AS title,"""),
        ("""       left(COALESCE(title,''), 80)  AS title,""",
         """       left(COALESCE(title::jsonb ->> 'en',''), 80)  AS title,"""),
        ("""       left(COALESCE(title,''),100) AS title,""",
         """       left(COALESCE(title::jsonb ->> 'en',''),100) AS title,"""),
    ],
    "consolidate_02_publish_drafts.sql": [
        ("""       left(COALESCE(title,''),70) AS title""",
         """       left(COALESCE(title::jsonb ->> 'en',''),70) AS title"""),
    ],
    "consolidate_03_merge_duplicates.sql": [
        ("""       left(COALESCE(title,''),80) AS title,""",
         """       left(COALESCE(title::jsonb ->> 'en',''),80) AS title,"""),
    ],
}


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(GEN):
        sys.exit(f"not found: {GEN} - run from the srangam repo root")
    g = io.open(GEN, encoding="utf-8").read()
    done = MARKER in g

    bad = False
    if not done:
        for i, (old, _n) in enumerate(GEN_EDITS, 1):
            n = g.count(old)
            print(f"  generate-registry-meta.mjs edit {i}: {n} match(es) (need exactly 1)")
            if n != 1: bad = True
    else:
        print("  generate-registry-meta.mjs: already patched")

    sqlwork = {}
    for path, pairs in SQL_EDITS.items():
        if not os.path.exists(path):
            print(f"  MISSING: {path}"); bad = True; continue
        s = io.open(path, encoding="utf-8").read()
        todo = []
        for old, new in pairs:
            if s.count(old) == 1:
                todo.append((old, new))
            elif s.count(new) >= 1:
                pass  # already fixed
            else:
                print(f"  {path}: anchor not found -> {old.strip()[:50]}"); bad = True
        print(f"  {path}: {len(todo)} of {len(pairs)} still to fix")
        sqlwork[path] = todo

    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAnchors OK. Re-run with --apply.")
        return

    os.makedirs("backups", exist_ok=True)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    saved = []
    try:
        if not done:
            b = os.path.join("backups", "generate-registry-meta.mjs.preWinPath." + stamp)
            shutil.copy2(GEN, b); saved.append((GEN, b))
            for old, new in GEN_EDITS:
                assert g.count(old) == 1
                g = g.replace(old, new, 1)
            # imports: join + mkdirSync
            if "from 'path'" not in g:
                g = g.replace("import { pathToFileURL } from 'url';",
                              f"// {MARKER}\nimport {{ join }} from 'path';\nimport {{ pathToFileURL }} from 'url';", 1)
            if "mkdirSync" not in g.split("const ROOT")[0]:
                # the real line is "writeFileSync, readFileSync" - verified, not assumed
                fs_old = "import { writeFileSync, readFileSync } from 'fs';"
                assert g.count(fs_old) == 1, f"fs import not found verbatim: {fs_old}"
                g = g.replace(fs_old,
                              "import { writeFileSync, readFileSync, mkdirSync } from 'fs';", 1)
            io.open(GEN, "w", encoding="utf-8", newline="\n").write(g)
            print(f"  patched {GEN}  (backup {b})")

        for path, todo in sqlwork.items():
            if not todo: continue
            s = io.open(path, encoding="utf-8").read()
            b = os.path.join("backups", os.path.basename(path) + ".preJsonb." + stamp)
            shutil.copy2(path, b); saved.append((path, b))
            for old, new in todo:
                s = s.replace(old, new, 1)
            io.open(path, "w", encoding="utf-8", newline="\n").write(s)
            print(f"  patched {path}  ({len(todo)} cast(s), backup {b})")

        gi = ".gitignore"
        gis = io.open(gi, encoding="utf-8").read() if os.path.exists(gi) else ""
        if "\ntmp/" not in "\n" + gis:
            b = os.path.join("backups", "gitignore.preTmp." + stamp)
            if os.path.exists(gi): shutil.copy2(gi, b); saved.append((gi, b))
            io.open(gi, "a", encoding="utf-8", newline="\n").write(
                f"\n# {MARKER} - build intermediates; a failed generator run committed\n"
                "# a 1.4 MB tmp/registry-bundle.mjs into 189a270.\ntmp/\n")
            print(f"  gitignored tmp/")
    except Exception as exc:
        for p, b in saved:
            shutil.copy2(b, p)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. NOW REGENERATE - and check meta.ts actually changed:")
    print("  node scripts/generate-registry-meta.mjs")
    print('  python -c "import io,re;s=io.open(\'src/data/articles/meta.ts\',encoding=\'utf-8\').read();'
          "print(re.search(r'\\\"id\\\": \\\"scripts-that-sailed-ii\\\".*?\\\"contentLanguages\\\": (\\[[^]]*\\])',s,re.S).group(1))\"")
    print("     expect  [\"en\"]   (was [\"en\",\"hi\",\"ta\"])")
    print("\n  git rm -r --cached tmp     # drop the 1.4 MB artefact from the index")


if __name__ == "__main__":
    main()
