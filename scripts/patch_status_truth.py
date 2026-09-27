#!/usr/bin/env python3
"""patch_status_truth.py  (MARK STATUS_TRUTH_2026_09_27) - for scripts/emit_project_status.py

The public "Where this actually stands" panel is generated, and on 2026-09-27
three of its statements were no longer true:

  1. It names the one complete work "MBh01" - a doc code. Before the generator
     it read "Mahabharata, Book I" (Lovable's own issue report, 2026-09-27).
  2. Caveat "Not one translation was refused ... has not yet been established."
     It has now been established: data/translate_outcomes.jsonl in the automaton
     records the raw answer of every paid call that came back unusable
     (62 records on 2026-09-27, 59 of them "[ILLEGIBLE]" on damaged scans), and
     none of them is stored as a translation.
  3. NOT_YET: "The Sanskrit corpus is not yet published to this site. Tables
     exist; nothing is loaded." Since 2026-09-27 one text (439 passages) is
     loaded and published, measured with 99_verify.sql in the SQL editor.
  4. It opened context.db with immutable=1, which never reads the -wal file,
     so translations not yet checkpointed were missing from every count.

Changes, all inside the generator (the page component is untouched):
  * titles come from a HUMAN-CURATED registry, automaton configs/doc_titles.json
    (--titles). A code with no entry is shown as before (underscores softened);
    nothing is invented.
  * the refusal caveat is MEASURED from the ledger (--ledger), with its date.
  * the site-corpus line comes from SITE_CORPUS, a figure measured in the SQL
    editor and carried with its own date, exactly like CONTAMINATION;
    --site-texts / --site-passages / --site-published / --site-measured-on
    update it.

  python scripts/patch_status_truth.py            # check
  python scripts/patch_status_truth.py --apply    # write (backup .bak_st_20260927)
"""
import argparse, os, shutil, sys
from pathlib import Path

MARK = "STATUS_TRUTH_2026_09_27"
TARGET = Path("scripts/emit_project_status.py")
BAK = ".bak_st_20260927"

HELPERS = r'''

# -- STATUS_TRUTH_2026_09_27 ---------------------------------------------------
# Measured in the Lovable Cloud SQL editor with 99_verify.sql, not by this
# script (it has no database key, by house rule). Carried with its own date.
SITE_CORPUS = {
    "measuredOn": "2026-09-27",
    "texts": 1,
    "passages": 439,
    "published": 1,
    "readerPage": False,
}
DEFAULT_TITLES = r"D:\Sanksrit Automatons\sanskrit-automatonv2\configs\doc_titles.json"
DEFAULT_LEDGER = r"D:\Sanksrit Automatons\sanskrit-automatonv2\data\translate_outcomes.jsonl"
_LACUNA = re.compile(r"\[\s*(?:illegible|\u0905\u0938\u094d\u092a\u0937\u094d\u091f)\s*\]", re.I)
_PUNCT = re.compile(r"[\s\d\u0966-\u096f/|\u0964\u0965.,;:!?'\"()\[\]*_~`\-\u2013\u2014\u2026]+")


def load_titles(path) -> dict:
    """Human-confirmed display titles, keyed by doc code. Missing file -> {}."""
    try:
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    t = raw.get("titles", raw) if isinstance(raw, dict) else {}
    return {k: v for k, v in t.items() if not k.startswith("_") and isinstance(v, str) and v.strip()}


def measure_ledger(path) -> dict:
    """Counts from the automaton's outcome ledger. Missing file -> {'total': 0}."""
    d = {"total": 0, "bare": 0, "refusal": 0, "echo": 0, "empty": 0, "other": 0,
         "salvaged": 0, "since": None, "path": str(path)}
    try:
        fh = open(str(path), encoding="utf-8")
    except OSError:
        return d
    with fh:
        for line in fh:
            try:
                r = json.loads(line)
            except ValueError:
                continue
            cause = r.get("cause")
            ts_ = str(r.get("ts") or "")[:10]
            if ts_ and (d["since"] is None or ts_ < d["since"]):
                d["since"] = ts_
            if cause == "salvaged":
                d["salvaged"] += 1
                continue
            d["total"] += 1
            raw = r.get("raw") or ""
            if cause == "refusal-filter":
                if _LACUNA.search(raw) and _PUNCT.sub("", _LACUNA.sub(" ", raw)) == "":
                    d["bare"] += 1
                else:
                    d["refusal"] += 1
            elif cause == "echo-filter":
                d["echo"] += 1
            elif cause == "model-empty":
                d["empty"] += 1
            else:
                d["other"] += 1
    return d


def _ledger_heading(c: dict) -> str:
    if not (c.get("ledger") or {}).get("total"):
        return "Empty and declined answers are recorded, not shown"
    return "The model does decline, and a decline is never stored as a translation"


def _ledger_body(c: dict) -> str:
    L = c.get("ledger") or {}
    if not L.get("total"):
        return ("Every paid translation call that comes back unusable is recorded in the "
                "pipeline's outcome ledger together with the model's raw answer. This "
                "status run could not read that ledger, so no count is given here.")
    parts = []
    for n, what in ((L["bare"], "answered only with the 'illegible' marker on a damaged scan"),
                    (L["echo"], "repeated the Sanskrit"),
                    (L["refusal"], "declined in words"),
                    (L["empty"], "came back with no text (this includes calls lost to a network failure)"),
                    (L["other"], "failed another check")):
        if n:
            parts.append("%s %s" % (f"{n:,}", what))
    body = ("Since %s the pipeline has kept the raw answer of every paid translation call "
            "that came back unusable: %s so far. Of those, %s. None of them is stored or "
            "shown as a translation. The verse stays empty and is asked again under the next "
            "prompt, and a verse the model can only call illegible is set aside for re-OCR "
            "instead of being paid for twice."
            % (L["since"], f"{L['total']:,}", "; ".join(parts)))
    if L.get("salvaged"):
        body += (" A further %s answers were kept after an OCR caveat was trimmed from the end."
                 % f"{L['salvaged']:,}")
    return body


def _site_line(c: dict) -> str:
    s = c.get("site") or SITE_CORPUS
    if not s.get("texts"):
        return "The Sanskrit corpus is not yet published to this site. Tables exist; nothing is loaded."
    one = s["texts"] == 1
    line = ("%d Sanskrit text%s (%s passages) %s loaded into this site's corpus tables, and %d "
            "%s marked published (measured %s)."
            % (s["texts"], "" if one else "s", f"{s['passages']:,}", "is" if one else "are",
               s["published"], "is" if s["published"] == 1 else "are", s["measuredOn"]))
    if not s.get("readerPage"):
        line += " There is no reading page for %s yet." % ("it" if one else "them")
    return line
'''

EDITS = [
  ('read the WAL too (immutable=1 skipped pages not yet checkpointed)',
   '    con = sqlite3.connect("file:%s?immutable=1" % db.as_posix(), uri=True)\n',
   '    # STATUS_TRUTH_2026_09_27: immutable=1 tells SQLite the file cannot change,\n'
   '    # so it never reads the -wal file: every translation not yet checkpointed\n'
   '    # into context.db was missing from the count (tested: 1 of 501 rows seen).\n'
   '    # mode=ro + query_only reads the WAL and writes nothing; in WAL mode a\n'
   '    # reader never blocks the pipeline writer.\n'
   '    con = sqlite3.connect("file:%s?mode=ro" % db.as_posix(), uri=True, timeout=30)\n'
   '    con.execute("PRAGMA query_only=ON")\n'),
  ('helpers after CONTAMINATION',
   '    "damagedShare": "69%",\n}\n',
   '    "damagedShare": "69%",\n}\n' + HELPERS),
  ('measured refusal caveat',
   '    heading: {ts("Not one translation was refused")},\n'
   '    body:\n'
   '      {ts(\n'
   '        "Across all %s translated passages, zero came back empty or as a refusal - "\n'
   '        "including those drawn from badly damaged scans. An automated check for "\n'
   '        "empty output therefore cannot tell us anything about them. Whether the "\n'
   '        "model never declines, or declines are discarded before storage, has not "\n'
   '        "yet been established." % f"{c[\'translated\']:,}")},\n',
   '    heading: {ts(_ledger_heading(c))},\n'
   '    body:\n'
   '      {ts(_ledger_body(c))},\n'),
  ('measured site-corpus line',
   "  'The Sanskrit corpus is not yet published to this site. Tables exist; nothing is loaded.',\n",
   "  {ts(_site_line(c))},\n"),
  ('arguments',
   '    ap.add_argument("--print", dest="do_print", action="store_true")\n',
   '    ap.add_argument("--print", dest="do_print", action="store_true")\n'
   '    # STATUS_TRUTH_2026_09_27\n'
   '    ap.add_argument("--titles", default=os.getenv("DOC_TITLES", DEFAULT_TITLES),\n'
   '                    help="human-curated doc_code -> title registry (automaton configs/doc_titles.json)")\n'
   '    ap.add_argument("--ledger", default=os.getenv("OUTCOME_LEDGER", DEFAULT_LEDGER),\n'
   '                    help="automaton data/translate_outcomes.jsonl")\n'
   '    ap.add_argument("--site-texts", type=int, default=None)\n'
   '    ap.add_argument("--site-passages", type=int, default=None)\n'
   '    ap.add_argument("--site-published", type=int, default=None)\n'
   '    ap.add_argument("--site-measured-on", default=None)\n'
   '    ap.add_argument("--site-reader", action="store_true",\n'
   '                    help="a public reading page for the corpus exists")\n'),
  ('apply titles, ledger and site figures',
   '    c = measure_corpus(Path(args.db))\n',
   '    c = measure_corpus(Path(args.db))\n'
   '    titles = load_titles(args.titles)          # STATUS_TRUTH_2026_09_27\n'
   '    for w in c["completeWorks"]:\n'
   '        w["name"] = titles.get(w["name"], _readable(w["name"]))\n'
   '    if c["largestUntouched"]:\n'
   '        lu0 = c["largestUntouched"]["name"]\n'
   '        c["largestUntouched"]["name"] = titles.get(lu0, lu0)\n'
   '    c["ledger"] = measure_ledger(args.ledger)\n'
   '    site = dict(SITE_CORPUS)\n'
   '    for k, v in (("texts", args.site_texts), ("passages", args.site_passages),\n'
   '                 ("published", args.site_published), ("measuredOn", args.site_measured_on)):\n'
   '        if v is not None:\n'
   '            site[k] = v\n'
   '    if args.site_reader:\n'
   '        site["readerPage"] = True\n'
   '    c["site"] = site\n'),
  ('report what was used',
   '    if args.do_print:\n',
   '    L = c["ledger"]\n'
   '    print("titles   : %d curated (%s); complete work shown as %s"\n'
   '          % (len(titles), args.titles, ", ".join(w["name"] for w in c["completeWorks"]) or "-"))\n'
   '    print("ledger   : %d unusable since %s (bare %d, echo %d, refusal %d, empty %d, other %d), salvaged %d"\n'
   '          % (L["total"], L["since"], L["bare"], L["echo"], L["refusal"], L["empty"], L["other"], L["salvaged"]))\n'
   '    print("site     : %d text(s), %d passage(s), %d published, measured %s, reader page %s"\n'
   '          % (site["texts"], site["passages"], site["published"], site["measuredOn"], site["readerPage"]))\n'
   '    if args.do_print:\n'),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    if not TARGET.exists():
        print("run from the srangam repo root (%s missing)" % TARGET); return 2
    raw = TARGET.read_bytes()
    crlf = b"\r\n" in raw
    text = raw.decode("utf-8").replace("\r\n", "\n")
    if MARK in text:
        print("  already  %s (%s present) - nothing to do" % (TARGET, MARK)); return 0
    new, bad = text, 0
    for name, old, rep in EDITS:
        n = new.count(old)
        if n != 1:
            print("  ANCHOR   %s matched %d time(s), need exactly 1" % (name, n)); bad += 1; continue
        new = new.replace(old, rep, 1)
        print("  ok       %s" % name)
    if bad:
        print("REFUSED: %d problem(s); nothing written." % bad); return 2
    try:
        compile(new, str(TARGET), "exec")
    except SyntaxError as e:
        print("REFUSED: would not compile: %s" % e); return 2
    if not a.apply:
        print("CHECK PASSED. Re-run with --apply to write."); return 0
    bak = TARGET.with_name(TARGET.name + BAK)
    if not bak.exists():
        shutil.copy2(TARGET, bak)
    tmp = TARGET.with_name(TARGET.name + ".tmp_patch")
    tmp.write_bytes((new.replace("\n", "\r\n") if crlf else new).encode("utf-8"))
    os.replace(str(tmp), str(TARGET))
    print("  WROTE    %s  (backup %s)" % (TARGET, bak.name))
    return 0


if __name__ == "__main__":
    sys.exit(main())
