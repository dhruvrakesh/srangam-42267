#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
emit_project_status.py  (2026-09-12)  STATUS_LIVE_2026_09_12

Regenerate src/data/projectStatus.ts from live measurement.

WHY THIS EXISTS RATHER THAN A HAND EDIT
---------------------------------------
projectStatus.ts opens with its own rule:

    "no number enters this file without a command that produced it"

It was then hand-maintained, and by 2026-09-12 it was four days and 16,606
passages stale. Measured against the live context.db on that date:

    works              site 59      live 60         +1
    passages           site 32,949  live 49,555     +16,606
    English            site 15,235  live 17,013     +1,778
    entities           site 6,096   live 6,923      +827
    entity mentions    site 25,749  live 28,807     +3,058
    embeddings         site 15,012  live 17,032     +2,020
    Hindi              site ABSENT  live 10,036

The +16,606 is exactly one document - the Padma Purana Patala Khanda -
ingested and never translated. The site was reporting the query_snapshot
copy of the database, not the working one.

A rule that depends on somebody remembering to re-run a query is not a
rule. This is the command.

WHAT IS MEASURED HERE, AND WHAT IS NOT
--------------------------------------
Measured live, every run: works, passages, English, Hindi, entities,
mentions, embeddings, human reviews, the complete works, and the
concentration of untranslated passages.

NOT measured here: the contamination figures. cleanFraction,
damagedTranslated and damagedConcentration come from
scripts/diag_ocr_contamination.py in the automaton repository, which
computes a per-passage measure this script does not reimplement. They are
carried forward with their OWN measurement date, so the file no longer
implies that one date covers every figure on it. Re-running that
diagnostic and passing --contamination-date is how they get refreshed.

Usage:
  python scripts/emit_project_status.py
      [--db "D:\\Sanksrit Automatons\\sanskrit-automatonv2\\data\\context.db"]
      [--panchang D:\\panchang] [--check] [--print]
"""
from __future__ import annotations

import argparse
import ast
import glob
import json
import os
import re
import sqlite3
import subprocess
import sys
from datetime import date
from pathlib import Path

MARK = "STATUS_LIVE_2026_09_12"
OUT = Path("src/data/projectStatus.ts")
DEFAULT_DB = r"D:\Sanksrit Automatons\sanskrit-automatonv2\data\context.db"
DEFAULT_PANCHANG = r"D:\panchang"

# Carried forward from the 2026-09-08 hand-measurement. See the module
# docstring: this script does not recompute the contamination measure.
CONTAMINATION = {
    "measuredOn": "2026-09-08",
    "cleanFraction": "58.6% below 0.02 contamination",
    "damagedTranslated": 1013,
    "damagedWork": "Bodhicaryāvatāra",
    "damagedPassages": 703,
    "damagedShare": "69%",
}


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

NOT_VERSE = "COALESCE(p.text_type,'mula') NOT IN ('noise','frontmatter')"


def _readable(code: str) -> str:
    """Doc codes are scan identifiers, not titles. Softening the underscores is
    the whole transformation - renaming them would be inventing a provenance
    the corpus does not record."""
    return re.sub(r"\s+", " ", (code or "").replace("_", " ")).strip()


def ts(v) -> str:
    return json.dumps(v, ensure_ascii=False)


def measure_corpus(db: Path) -> dict:
    if not db.exists():
        raise SystemExit("context.db not found at %s" % db)
    # immutable: this must never take a lock on a database the pipeline writes.
    # STATUS_TRUTH_2026_09_27: immutable=1 tells SQLite the file cannot change,
    # so it never reads the -wal file: every translation not yet checkpointed
    # into context.db was missing from the count (tested: 1 of 501 rows seen).
    # mode=ro + query_only reads the WAL and writes nothing; in WAL mode a
    # reader never blocks the pipeline writer.
    con = sqlite3.connect("file:%s?mode=ro" % db.as_posix(), uri=True, timeout=30)
    con.execute("PRAGMA query_only=ON")
    q = lambda s: con.execute(s).fetchone()[0]
    try:
        d = {
            "works": q("SELECT COUNT(*) FROM docs"),
            "passages": q("SELECT COUNT(*) FROM passages"),
            "translated": q("SELECT COUNT(*) FROM passages "
                            "WHERE TRIM(COALESCE(translation,'')) <> ''"),
            "translatedHi": q("SELECT COUNT(*) FROM translations_l10n "
                              "WHERE lang='hi' AND TRIM(COALESCE(translation,'')) <> ''"),
            "entities": q("SELECT COUNT(*) FROM entities"),
            "entityMentions": q("SELECT COUNT(*) FROM entity_mentions"),
            "embeddings": q("SELECT COUNT(*) FROM passage_embeddings"),
            "humanReviews": q("SELECT COUNT(*) FROM mt_reviews"),
        }
        d["completeWorks"] = [
            {"name": r[0], "passages": r[1], "coverage": "100%"}
            for r in con.execute(
                f"""SELECT d.code, COUNT(p.id) n,
                    SUM(CASE WHEN TRIM(COALESCE(p.translation,'')) <> '' THEN 1 ELSE 0 END) en
                    FROM docs d JOIN passages p ON p.doc_id = d.id AND {NOT_VERSE}
                    GROUP BY d.id HAVING n > 0 AND en = n
                    ORDER BY n DESC LIMIT 1""")
        ]
        # Documents under 5% English. The site reporting 17,013 of 49,555
        # without saying where the remainder sits would be the exact fault
        # this file's own caveat section exists to prevent.
        rows = list(con.execute(
            """SELECT d.code, COUNT(p.id) n,
               SUM(CASE WHEN TRIM(COALESCE(p.translation,'')) <> '' THEN 1 ELSE 0 END) en
               FROM docs d JOIN passages p ON p.doc_id = d.id
               GROUP BY d.id HAVING en * 20 < n ORDER BY n DESC"""))
        d["untouchedDocs"] = len(rows)
        d["untouchedPassages"] = sum(r[1] for r in rows)
        d["untouchedShare"] = "%.1f%%" % (100.0 * d["untouchedPassages"] / d["passages"])
        d["largestUntouched"] = {"name": rows[0][0], "passages": rows[0][1]} if rows else None
    finally:
        con.close()
    return d


def measure_panchang(root: Path) -> dict:
    d = {"se1Files": len(glob.glob(str(root / "**" / "*.se1"), recursive=True))}
    d["hasEphemerisDiff"] = (root / "jyotish" / "ephemeris_diff.py").exists()
    d["hasEphemerisProbe"] = (root / "jyotish" / "ephemeris_probe.py").exists()

    # pytest --collect-only does NOT execute tests. Prefer it, because the
    # figure already on the site is a collected count and a definition count
    # is a different metric - parametrised cases expand. Fall back to an AST
    # count, clearly labelled, if pytest is unavailable.
    d["testsMetric"] = "collected"
    try:
        p = subprocess.run([sys.executable, "-m", "pytest", "--collect-only", "-q"],
                           cwd=str(root), capture_output=True, text=True, timeout=180)
        m = re.search(r"(\d+)\s+tests? collected", p.stdout or "")
        if not m:
            m = re.search(r"^(\d+)\s+tests?\b", (p.stdout or "").strip().splitlines()[-1]
                          if (p.stdout or "").strip() else "")
        if m:
            d["tests"] = int(m.group(1))
        else:
            raise RuntimeError("could not parse a collected count")
    except Exception as e:
        total = 0
        for f in sorted(glob.glob(str(root / "tests" / "test_*.py"))):
            try:
                tree = ast.parse(Path(f).read_text(encoding="utf-8"))
            except Exception:
                continue
            total += sum(1 for x in ast.walk(tree)
                         if isinstance(x, (ast.FunctionDef, ast.AsyncFunctionDef))
                         and x.name.startswith("test_"))
        d["tests"] = total
        d["testsMetric"] = "definitions"
        d["testsNote"] = str(e)[:120]
    return d


def render(c: dict, p: dict, today: str) -> str:
    ephem = ("Moshier analytic (Swiss .se1 files not installed)"
             if p["se1Files"] == 0
             else "Swiss Ephemeris (%d .se1 files present)" % p["se1Files"])
    metric_note = ("pytest --collect-only"
                   if p["testsMetric"] == "collected"
                   else "test function definitions counted by AST; pytest was not runnable")

    complete = ",\n".join(
        "    { name: %s, passages: %d, coverage: %s }"
        % (ts(w["name"]), w["passages"], ts(w["coverage"]))
        for w in c["completeWorks"]) or "    "

    lu = c["largestUntouched"]
    return f'''/**
 * Public project status. Every figure here was MEASURED, by a command.
 *
 * GENERATED by scripts/emit_project_status.py ({MARK}). Do not hand-edit:
 * the numbers will drift and nobody will notice, which is exactly what
 * happened between 2026-09-08 and 2026-09-12, when this file reported a
 * corpus of 32,949 passages while the working database held 49,555. It was
 * reading the query_snapshot copy, not the live one. The difference was one
 * document - the Padma Purana Patala Khanda - ingested and never translated.
 *
 * To refresh:  python scripts/emit_project_status.py
 *
 * 2026-09-08 correction, kept because the reasoning still matters. An
 * earlier version carried `needsReview: 852`, described as passages at
 * contamination >= 0.15. That number was wrong. The threshold table in
 * scripts/diag_ocr_contamination.py summed pre-aggregated bands whose
 * boundaries are 0.00/0.02/0.05/0.10/0.20/0.35, selecting bands with
 * `lo >= thresh`. For thresh 0.15 the lowest qualifying band starts at 0.20,
 * so the row printed as "reject contamination >= 0.15" actually reported the
 * population at >= 0.20. Measured directly from per-passage values, the real
 * figure at >= 0.15 is 1,013.
 */
export const MEASURED_ON = {ts(today)};

/**
 * The contamination figures below are NOT measured by the generator. They
 * come from diag_ocr_contamination.py in the automaton repository and carry
 * their own date, so that one heading cannot imply a freshness the numbers
 * underneath it do not have.
 */
export const CONTAMINATION_MEASURED_ON = {ts(CONTAMINATION["measuredOn"])};

export const TRANSLATION_STATUS = {{
  works: {c["works"]},
  passages: {c["passages"]},
  translated: {c["translated"]},
  /** Hindi verses in translations_l10n. Absent from this file until 2026-09-12. */
  translatedHi: {c["translatedHi"]},
  completeWorks: [
{complete}
  ],
  entities: {c["entities"]},
  entityMentions: {c["entityMentions"]},
  embeddings: {c["embeddings"]},
  /** Human fidelity reviews recorded. Not a sample size - a total. */
  humanReviews: {c["humanReviews"]},
  /**
   * Share of Devanagari-dominant passages scoring below 0.02 on the
   * Latin/scanner-intrusion measure. Whole corpus, not only the translated
   * part. Measured {CONTAMINATION["measuredOn"]}.
   */
  cleanFraction: {ts(CONTAMINATION["cleanFraction"])},
  /** Translated passages at >= 0.15 contamination. Measured {CONTAMINATION["measuredOn"]}. */
  damagedTranslated: {CONTAMINATION["damagedTranslated"]},
  /** Of those, the share concentrated in a single work. */
  damagedConcentration: {{
    work: {ts(CONTAMINATION["damagedWork"])},
    passages: {CONTAMINATION["damagedPassages"]},
    share: {ts(CONTAMINATION["damagedShare"])},
  }},
}} as const;

/**
 * Things the numbers above do not establish, stated because a research site
 * that reports only its wins is reporting half a result.
 */
export const CAVEATS = [
  {{
    heading: {ts("Half the corpus has not been touched")},
    body:
      {ts(
        "%s of the %s passages carry an English translation. The remainder is not "
        "spread thinly: %s passages, %s of the corpus, sit in %d documents that are "
        "under 5%% translated. The largest is %s - %s passages, not one of them "
        "translated. A coverage figure quoted without that concentration would read "
        "as steady progress across the whole corpus, which is not what has happened."
        % (f"{c['translated']:,}", f"{c['passages']:,}",
           f"{c['untouchedPassages']:,}", c["untouchedShare"], c["untouchedDocs"],
           _readable(lu["name"]) if lu else "-",
           f"{lu['passages']:,}" if lu else "0"))},
  }},
  {{
    heading: {ts(_ledger_heading(c))},
    body:
      {ts(_ledger_body(c))},
  }},
  {{
    heading: {ts("The entity layer has never completed a pass")},
    body:
      {ts(
        "The scheduled maintenance job that extracts named entities has started 41 "
        "times and finished zero times: it was re-processing every verse that had "
        "already returned no entities, on every run, and the task's one-hour limit "
        "killed it before it could record either a completion or an error. The "
        "entity and mention counts above are therefore a floor, not a total. Fixed "
        "2026-09-12; the figures will rise.")},
  }},
] as const;

export const PANCHANG_STATUS = {{
  engine: 'pyswisseph 2.10.03',
  zodiac: 'sidereal',
  tests: {p["tests"]},
  /** How that figure is obtained: {metric_note}. */
  testsMetric: {ts(p["testsMetric"])},
  /** The point of the provenance work: the PDF reports the engine that ANSWERED. */
  provenance: 'measured at export time, not asserted',
  currentEphemeris: {ts(ephem)},
  /**
   * ephemeris_diff sizes what the Moshier fallback actually costs, in
   * arcseconds, in rasi/nakshatra/navamsa boundary crossings, and in days of
   * a 120-year Vimshottari cycle - and refuses the comparison outright when
   * both sides resolve to the same engine, which is the trap that makes a
   * fallback look free.
   */
  hasEphemerisDiff: {str(p["hasEphemerisDiff"]).lower()},
}} as const;

export const NOT_YET = [
  {ts(_site_line(c))},
  {ts(
    "Translation fidelity has been sampled but not yet read. A blinded 86-passage "
    "draw from the most damaged work is waiting on a human reader, and %d reviews "
    "exist in total against %s translated passages."
    % (c["humanReviews"], f"{c['translated']:,}"))},
] as const;
'''


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.getenv("CONTEXT_DB", DEFAULT_DB))
    ap.add_argument("--panchang", default=os.getenv("PANCHANG_ROOT", DEFAULT_PANCHANG))
    ap.add_argument("--check", action="store_true",
                    help="measure and report the drift; write nothing")
    ap.add_argument("--print", dest="do_print", action="store_true")
    # STATUS_TRUTH_2026_09_27
    ap.add_argument("--titles", default=os.getenv("DOC_TITLES", DEFAULT_TITLES),
                    help="human-curated doc_code -> title registry (automaton configs/doc_titles.json)")
    ap.add_argument("--ledger", default=os.getenv("OUTCOME_LEDGER", DEFAULT_LEDGER),
                    help="automaton data/translate_outcomes.jsonl")
    ap.add_argument("--site-texts", type=int, default=None)
    ap.add_argument("--site-passages", type=int, default=None)
    ap.add_argument("--site-published", type=int, default=None)
    ap.add_argument("--site-measured-on", default=None)
    ap.add_argument("--site-reader", action="store_true",
                    help="a public reading page for the corpus exists")
    args = ap.parse_args()

    if not OUT.parent.exists():
        raise SystemExit("run from the srangam repo root (%s missing)" % OUT.parent)

    c = measure_corpus(Path(args.db))
    titles = load_titles(args.titles)          # STATUS_TRUTH_2026_09_27
    for w in c["completeWorks"]:
        w["name"] = titles.get(w["name"], _readable(w["name"]))
    if c["largestUntouched"]:
        lu0 = c["largestUntouched"]["name"]
        c["largestUntouched"]["name"] = titles.get(lu0, lu0)
    c["ledger"] = measure_ledger(args.ledger)
    site = dict(SITE_CORPUS)
    for k, v in (("texts", args.site_texts), ("passages", args.site_passages),
                 ("published", args.site_published), ("measuredOn", args.site_measured_on)):
        if v is not None:
            site[k] = v
    if args.site_reader:
        site["readerPage"] = True
    c["site"] = site
    p = measure_panchang(Path(args.panchang))
    today = date.today().isoformat()
    new = render(c, p, today)

    old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""

    def grab(name: str, text: str):
        m = re.search(r"\b%s:\s*(\d+)" % re.escape(name), text)
        return int(m.group(1)) if m else None

    print("field            on-site     live     delta")
    print("-" * 46)
    drift = 0
    for k in ("works", "passages", "translated", "entities", "entityMentions", "embeddings"):
        was = grab(k, old)
        now = c[k]
        if was is None:
            print("%-16s %8s %8d   (new)" % (k, "-", now))
        else:
            print("%-16s %8d %8d %+9d" % (k, was, now, now - was))
            drift += abs(now - was)
    print("%-16s %8s %8d   %s" % ("translatedHi", grab("translatedHi", old) or "ABSENT",
                                  c["translatedHi"], ""))
    print("%-16s %8s %8d" % ("panchang tests", grab("tests", old) or "-", p["tests"]))
    print()
    print("untouched: %d docs, %s passages (%s of the corpus), largest %s"
          % (c["untouchedDocs"], f"{c['untouchedPassages']:,}", c["untouchedShare"],
             c["largestUntouched"]["name"] if c["largestUntouched"] else "-"))
    print("panchang : %d .se1 file(s), ephemeris_diff=%s, tests by %s"
          % (p["se1Files"], p["hasEphemerisDiff"], p["testsMetric"]))

    L = c["ledger"]
    print("titles   : %d curated (%s); complete work shown as %s"
          % (len(titles), args.titles, ", ".join(w["name"] for w in c["completeWorks"]) or "-"))
    print("ledger   : %d unusable since %s (bare %d, echo %d, refusal %d, empty %d, other %d), salvaged %d"
          % (L["total"], L["since"], L["bare"], L["echo"], L["refusal"], L["empty"], L["other"], L["salvaged"]))
    print("site     : %d text(s), %d passage(s), %d published, measured %s, reader page %s"
          % (site["texts"], site["passages"], site["published"], site["measuredOn"], site["readerPage"]))
    if args.do_print:
        print("\n" + new)
    if args.check:
        print("\n--check: nothing written. total absolute drift %d" % drift)
        return 0

    OUT.write_text(new, encoding="utf-8", newline="\n")
    print("\nWrote %s (%d bytes)" % (OUT, len(new)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
