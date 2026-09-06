#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_parity_offline.py - let the parity gate see drafts WITHOUT a service key.
(2026-09-06)

THE CONSTRAINT I GOT WRONG FIRST TIME
This is a Lovable Cloud project. The maintainer does not hold
SUPABASE_SERVICE_ROLE_KEY, so my previous advice — "set the service key and
re-run" — is not actionable. The anon-key warning added by patch_parity_rls.py
is correct and keeps the report honest, but it leaves the gate unable to do its
job at all.

WHAT IS ACTUALLY AVAILABLE
The Supabase SQL editor, reached through Lovable Cloud, runs privileged and CAN
see drafts — the maintainer has already been exporting CSVs from it this
session. So the gate does not need a key; it needs a way to accept the truth
from the one privileged surface that already exists.

  --inventory <file.csv|.json>

  When supplied, the article inventory is read from that file instead of over
  the anon REST endpoint. Drafts are visible, the '📝 DRAFT (imported,
  unpublished) — PUBLISH it, do NOT re-import' branch finally fires, and no
  key is involved anywhere.

  When omitted, behaviour is exactly as today: anon fetch plus the loud
  UNVERIFIABLE warning. Nothing regresses.

WHY THIS MATTERS MORE THAN IT LOOKS
scripts/registry-parity-check.mjs line 90 already carries the comment
"(2026-07-12 fix: drafts were being misreported as missing.)". The bug was
identified two months ago and the fetch comment was updated to say
"published + draft" — but the KEY was never changed, so RLS kept hiding drafts
and the fix never took effect. Measured 2026-09-06: the DB holds 58 rows
(49 published, 9 draft); the script reported "49 articles (49 published, 0
draft/other)". A fix that is never verified against data exhibiting the defect
is not a fix.

THE INVENTORY FORMAT
Deliberately avoids the `content` JSON blob, which does not survive CSV export
cleanly. Instead the SQL pre-computes the non-empty language keys as a plain
comma-joined string, and this patch reconstitutes a content object from it, so
nonEmptyLangs() and the CONTENT GAP check keep working unchanged.

  id, slug, slug_alias, status, content_langs, updated_at

Delimiter is auto-detected (Supabase exports semicolons; a comma export also
works). Quoted fields are handled. See parity_inventory.sql.

  python patch_parity_offline.py            # dry run
  python patch_parity_offline.py --apply
  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "PARITY_OFFLINE_2026_09_06"
JS = os.path.join("scripts", "registry-parity-check.mjs")

LOADER = '''
// ── Offline inventory (PARITY_OFFLINE_2026_09_06) ───────────────────────────
// This is a Lovable Cloud project: no SUPABASE_SERVICE_ROLE_KEY is available,
// so the anon key can never see drafts (RLS: public SELECT = published only).
// The Supabase SQL editor CAN, so accept its export instead of a key.
// Produce the file with parity_inventory.sql, then:
//   node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
function parseDelimited(text) {
  const lines = text.split(/\\r?\\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  // Supabase exports semicolon-separated; a comma export works too.
  const delim = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';
  const splitRow = (line) => {
    const out = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === delim) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const head = splitRow(lines[0]).map((h) => h.replace(/^\\ufeff/, ''));
  return lines.slice(1).map((line) => {
    const cells = splitRow(line);
    const row = {};
    head.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
}

function loadInventory(path) {
  const raw = readFileSync(path, 'utf8');
  const rows = raw.trim().startsWith('[') || raw.trim().startsWith('{')
    ? (() => { const j = JSON.parse(raw); return Array.isArray(j) ? j : (j.rows || j.data || []); })()
    : parseDelimited(raw);

  return rows.map((r) => {
    // Rebuild a content object from the pre-computed language list, so
    // nonEmptyLangs() and the CONTENT GAP check work unchanged. The blob
    // itself is deliberately not exported: it does not survive CSV cleanly.
    const langs = String(r.content_langs ?? r.langs ?? '')
      .split(/[,\\s]+/).filter(Boolean);
    const content = {};
    for (const l of langs) content[l] = 'x';   // non-empty marker only
    return {
      id: r.id,
      slug: r.slug,
      slug_alias: r.slug_alias || null,
      status: r.status,
      title: r.title || '',
      content,
      updated_at: r.updated_at || null,
    };
  });
}
'''


EDITS = [
    # 1. the loader + the --inventory flag
    ("""// ---------- load static sources ----------""",
     LOADER + """
const INVENTORY_ARG = (() => {
  const i = process.argv.indexOf('--inventory');
  return i > -1 ? process.argv[i + 1] : null;
})();

// ---------- load static sources ----------"""),

    # 2. use it instead of the anon fetch when supplied
    ("""const dbArticles = await rest(
  'srangam_articles?select=id,slug,slug_alias,status,title,content,updated_at&limit=1000',
);""",
     """const dbArticles = INVENTORY_ARG
  ? loadInventory(INVENTORY_ARG)          // PARITY_OFFLINE_2026_09_06
  : await rest(
      'srangam_articles?select=id,slug,slug_alias,status,title,content,updated_at&limit=1000',
    );
if (INVENTORY_ARG) {
  console.log(`Inventory: ${INVENTORY_ARG} (SQL-editor export — drafts visible, no key required)`);
}"""),

    # 3. an inventory run is NOT blind, so do not warn or downgrade
    ("""const BLIND = !IS_SERVICE;""",
     """const BLIND = !IS_SERVICE && !INVENTORY_ARG;"""),

    # 4. say which source the report was built from
    ("""**Key**: ${IS_SERVICE ? 'service role — drafts visible, counts complete' : '⚠️ ANON — RLS hides drafts. Rows marked UNVERIFIABLE may already exist as drafts; DO NOT import from this run.'}""",
     """**Source**: ${INVENTORY_ARG
        ? `SQL-editor inventory \\`${INVENTORY_ARG}\\` — drafts visible, no key required`
        : IS_SERVICE
          ? 'service role — drafts visible, counts complete'
          : '⚠️ ANON — RLS hides drafts. Rows marked UNVERIFIABLE may already exist as drafts; DO NOT import from this run.'}"""),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(JS):
        sys.exit(f"not found: {JS} - run from the srangam repo root")
    s = io.open(JS, encoding="utf-8").read()
    if MARKER in s:
        print("Already applied (marker found). Nothing to do."); return
    if "PARITY_RLS_2026_09_06" not in s:
        sys.exit("Run patch_parity_rls.py first - this builds on its BLIND flag.")

    bad = False
    for i, (old, _new) in enumerate(EDITS, 1):
        n = s.count(old)
        print(f"  edit {i}: {n} match(es) (need exactly 1)")
        if n != 1:
            bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAnchors OK. Re-run with --apply.")
        print("Then run parity_inventory.sql in the SQL editor, export the CSV, and:")
        print("  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv")
        return

    os.makedirs("backups", exist_ok=True)
    b = os.path.join("backups", f"registry-parity-check.mjs.preOffline.{time.strftime('%Y%m%d_%H%M%S')}")
    shutil.copy2(JS, b)
    print(f"  backup: {b}")
    try:
        for old, new in EDITS:
            assert s.count(old) == 1
            s = s.replace(old, new, 1)
        s = s.replace("import { readFileSync, writeFileSync } from 'fs';",
                      f"// {MARKER}\nimport {{ readFileSync, writeFileSync }} from 'fs';", 1)
        io.open(JS, "w", encoding="utf-8", newline="\n").write(s)
    except Exception as exc:
        shutil.copy2(b, JS)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. No key needed anywhere. Workflow:")
    print("  1. paste parity_inventory.sql into the Supabase SQL editor (via Lovable)")
    print("  2. Export CSV -> save as docs\\db_inventory.csv")
    print("  3. node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv")
    print("\nThe DRAFT branch will fire and the gap list will shrink to what is")
    print("genuinely absent. Anything it still calls MISSING is safe to import.")


if __name__ == "__main__":
    main()
