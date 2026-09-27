#!/usr/bin/env python3
"""patch_texts_reader.py  (MARK TEXTS_READER_2026_09_27)

Wire the published Sanskrit corpus into the site. Measured 2026-09-27:
srangam_texts holds AphorismsOfSandilya (439 passages, published=true, title
"Sandilya Bhakti Sutra"), and src/lib/corpusTexts.ts can read it - but no page
imports corpusTexts.ts (only its test does), so nothing on the site shows it.

New files (delivered beside this script; the patch refuses if any is missing):
  src/lib/corpusDisplay.ts              pure presentation rules (tested)
  src/pages/texts/TextsIndex.tsx        /texts            published texts
  src/pages/texts/TextReader.tsx        /texts/:docCode   verse by verse, ?p=N
  src/__tests__/texts-reader.test.tsx   render + helper tests

Edits (anchored, all-or-nothing, marker-idempotent, CRLF kept, atomic):
  src/App.tsx                    two lazy imports, two routes
  src/components/layout/Footer.tsx   "Sanskrit Texts" link after Reading Room
  src/pages/Sitemap.tsx          "Sanskrit Texts" entry after Reading Room

No query is added outside corpusTexts.ts, so the QUERY_CEILING ratchet is
unchanged; no schema, RLS or data change.

  python scripts/patch_texts_reader.py            # check
  python scripts/patch_texts_reader.py --apply    # write (backups *.bak_tr_20260927)
"""
import argparse, os, shutil, sys
from pathlib import Path

MARK = "TEXTS_READER_2026_09_27"
BAK = ".bak_tr_20260927"
NEW = ["src/lib/corpusDisplay.ts", "src/pages/texts/TextsIndex.tsx",
       "src/pages/texts/TextReader.tsx", "src/__tests__/texts-reader.test.tsx"]

EDITS = [
  ("src/App.tsx", [
    ("lazy imports",
     'const SanskritTranslator = lazy(() => import("./pages/SanskritTranslator"));\n',
     'const SanskritTranslator = lazy(() => import("./pages/SanskritTranslator"));\n'
     '// TEXTS_READER_2026_09_27 - the published Sanskrit corpus (srangam_texts)\n'
     'const TextsIndex = lazy(() => import("./pages/texts/TextsIndex"));\n'
     'const TextReader = lazy(() => import("./pages/texts/TextReader"));\n'),
    ("routes",
     '              <Route path="/reading-room" element={<ReadingRoom />} />\n',
     '              <Route path="/reading-room" element={<ReadingRoom />} />\n'
     '              {/* TEXTS_READER_2026_09_27 */}\n'
     '              <Route path="/texts" element={<TextsIndex />} />\n'
     '              <Route path="/texts/:docCode" element={<TextReader />} />\n'),
  ]),
  ("src/components/layout/Footer.tsx", [
    ("footer link",
     '              <Link to="/reading-room" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">\n'
     '                Reading Room\n'
     '              </Link>\n',
     '              <Link to="/reading-room" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">\n'
     '                Reading Room\n'
     '              </Link>\n'
     '              {/* TEXTS_READER_2026_09_27 */}\n'
     '              <Link to="/texts" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">\n'
     '                Sanskrit Texts\n'
     '              </Link>\n'),
  ]),
  ("src/pages/Sitemap.tsx", [
    ("site map entry",
     '        { title: "Reading Room", path: "/reading-room", description: "Academic library and resources" },\n',
     '        { title: "Reading Room", path: "/reading-room", description: "Academic library and resources" },\n'
     '        { title: "Sanskrit Texts", path: "/texts", description: "Published Sanskrit texts, verse by verse (TEXTS_READER_2026_09_27)" },\n'),
  ]),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    if not Path("src/App.tsx").exists():
        print("run from the srangam repo root"); return 2
    bad = 0
    for f in NEW:
        if not Path(f).exists():
            print("  MISSING  %s (deliver it first)" % f); bad += 1
    plan = []
    for rel, eds in EDITS:
        p = Path(rel)
        raw = p.read_bytes()
        crlf = b"\r\n" in raw
        text = raw.decode("utf-8").replace("\r\n", "\n")
        if MARK in text:
            print("  already  %s - skipped" % rel); continue
        new = text
        for name, old, rep in eds:
            n = new.count(old)
            if n != 1:
                print("  ANCHOR   %s :: %s matched %d time(s), need exactly 1" % (rel, name, n)); bad += 1; continue
            new = new.replace(old, rep, 1)
            print("  ok       %s :: %s" % (rel, name))
        plan.append((p, crlf, new))
    if bad:
        print("REFUSED: %d problem(s); nothing written." % bad); return 2
    if not plan:
        print("nothing to do - already wired."); return 0
    if not a.apply:
        print("CHECK PASSED for %d file(s). Re-run with --apply to write." % len(plan)); return 0
    for p, crlf, new in plan:
        bak = p.with_name(p.name + BAK)
        if not bak.exists():
            shutil.copy2(p, bak)
        tmp = p.with_name(p.name + ".tmp_patch")
        tmp.write_bytes((new.replace("\n", "\r\n") if crlf else new).encode("utf-8"))
        os.replace(str(tmp), str(p))
        print("  WROTE    %s  (backup %s)" % (p, bak.name))
    print("APPLIED. Undo: copy each %s back and delete the four new files." % BAK)
    return 0


if __name__ == "__main__":
    sys.exit(main())
