#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
reconcile-inventory.py — resolve every "MISSING IN DB" claim in
docs/PARITY_REPORT.md against the privileged SQL-editor inventory.

WHY THIS EXISTS
The parity gate's remedy for MISSING IN DB is "import via Admin -> Markdown
Import". Acting on that list without reconciling it first is how duplicate rows
get created. On 2026-09-06 the report named 24 registry articles as missing;
19 of them were already in the database.

    9  exist as DRAFTS      -> the anon key cannot see them (RLS)
   10  exist PUBLISHED      -> under a different slug (canonicalSlugMap.ts)
    5  genuinely absent     -> these, and only these, should be imported

This script recomputes that split from the two files, so the number is checked
rather than remembered.

USAGE
  1. Supabase SQL editor (via Lovable Cloud): run parity_inventory.sql, Export CSV,
     save as docs/db_inventory.csv
  2. node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
  3. python scripts/reconcile-inventory.py

Reads only. Writes nothing. Exit 0 always — this is a report, not a gate.
"""
from __future__ import annotations
import csv, io, os, re, sys

INV    = os.path.join("docs", "db_inventory.csv")
REPORT = os.path.join("docs", "PARITY_REPORT.md")
CMAP   = os.path.join("src", "data", "articles", "canonicalSlugMap.ts")


def load_inventory(path):
    raw = io.open(path, encoding="utf-8-sig").read()
    head = raw.splitlines()[0] if raw.splitlines() else ""
    delim = ";" if head.count(";") >= head.count(",") else ","
    rows = list(csv.DictReader(io.StringIO(raw), delimiter=delim))
    for r in rows:
        for k in list(r):
            if r[k] is not None:
                r[k] = r[k].strip()
    return rows


def load_claimed(path):
    """Every registry row the report calls MISSING or UNVERIFIABLE."""
    out = []
    for line in io.open(path, encoding="utf-8"):
        if not line.startswith("|"):
            continue
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(c) >= 3 and c[1] == "registry" and ("MISSING IN DB" in c[2] or "UNVERIFIABLE" in c[2]):
            out.append(c[0])
    return out


def load_canonical(path):
    try:
        s = io.open(path, encoding="utf-8").read()
    except OSError:
        return {}
    body = s.split("CANONICAL_SLUG_MAP", 1)[-1]
    return dict(re.findall(r"'([a-z0-9-]+)'\s*:\s*'([a-z0-9-]+)'", body))


def main():
    for p in (INV, REPORT):
        if not os.path.exists(p):
            sys.exit(f"not found: {p}\n(run parity_inventory.sql, export the CSV to {INV}, "
                     f"then the parity script with --inventory)")

    rows = load_inventory(INV)
    claimed = load_claimed(REPORT)
    canon = load_canonical(CMAP)

    by_key = {}
    for r in rows:
        by_key.setdefault(r["slug"], r)
        if r.get("slug_alias"):
            by_key.setdefault(r["slug_alias"], r)

    pub = sum(1 for r in rows if r["status"] == "published")
    print(f"inventory  : {len(rows)} rows ({pub} published, {len(rows) - pub} draft/other)  <- {INV}")
    print(f"parity     : {len(claimed)} registry article(s) reported missing/unverifiable  <- {REPORT}")
    print(f"slug map   : {len(canon)} entries  <- {CMAP}\n")

    draft, aliased, absent, published_direct = [], [], [], []
    for s in claimed:
        hit = by_key.get(s)
        if hit:
            (published_direct if hit["status"] == "published" else draft).append((s, hit))
            continue
        tgt = canon.get(s)
        hit2 = by_key.get(tgt) if tgt else None
        if hit2:
            aliased.append((s, hit2, tgt))
        else:
            absent.append(s)

    def show(title, items, fmt):
        print(f"{title}  ({len(items)})")
        for it in sorted(items, key=lambda x: x[0] if isinstance(x, tuple) else x):
            print("    " + fmt(it))
        if not items:
            print("    (none)")
        print()

    show("PUBLISH — exists as a draft under its exact slug; do NOT import", draft,
         lambda t: f"{t[0]:<40} -> {t[1]['slug'][:44]} [{t[1]['status']}]")
    show("ALREADY LIVE — published under another slug; do NOT import", aliased,
         lambda t: f"{t[0]:<40} -> {t[1]['slug'][:44]} (via '{t[2]}')")
    show("PARITY BUG — published under this exact slug yet reported missing", published_direct,
         lambda t: f"{t[0]:<40} -> {t[1]['slug'][:44]}")
    show("IMPORT — genuinely absent", [(a, None) for a in absent],
         lambda t: t[0])

    print("-" * 74)
    print(f"  of {len(claimed)} 'missing' articles: "
          f"{len(draft)} publish, {len(aliased)} already live, "
          f"{len(published_direct)} parity bug, {len(absent)} genuinely import")
    if len(absent) < len(claimed):
        print(f"  importing all {len(claimed)} would create {len(claimed) - len(absent)} duplicate row(s).")


if __name__ == "__main__":
    main()
