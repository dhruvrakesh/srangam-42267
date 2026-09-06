#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_parity_rls.py - the Phase-2 parity gate is blind to drafts. (2026-09-06)

THE DEFECT
scripts/registry-parity-check.mjs states its own intent at line 78:

    // Fetch ALL articles (published + draft), not just published. The public
    // resolver only serves published rows, but an imported DRAFT still EXISTS —

and it carries the branch that acts on it:

    '📝 DRAFT (imported, unpublished)' … "PUBLISH it, do NOT re-import"

But it authenticates with VITE_SUPABASE_PUBLISHABLE_KEY — the ANON key (the
variable is literally named ANON_KEY). RLS on srangam_articles restricts public
SELECT to status='published'. So the fetch can only ever return published rows,
the draft branch is unreachable dead code, and every draft is misreported as
"❌ MISSING IN DB".

MEASURED, 2026-09-06:
    SQL editor (service role) : published 49, draft 9, TOTAL 58
    parity script (anon key)  : "49 articles (49 published, 0 draft/other)"

CONSEQUENCE, AND WHY THIS IS NOT COSMETIC
The report's own remediation for MISSING IN DB is "import via Admin → Markdown
Import". Master Plan Q2 lists 13 articles to import on exactly that basis. Any
of them that already exists as a draft would be imported a SECOND time —
creating precisely the duplicate rows Q3 is cleaning up. A gate that
manufactures the defect it is meant to prevent is worse than no gate.

THE FIX
  1. Prefer a service-role key when one is available (SUPABASE_SERVICE_ROLE_KEY
     or SUPABASE_SERVICE_KEY, from the environment or .env). With it, drafts are
     visible and the existing DRAFT branch finally works.
  2. When only the anon key is available, DO NOT pretend. Print a banner, stamp
     the report header, and downgrade every "MISSING IN DB" to
     "UNVERIFIABLE (anon key — could be a draft)" so nobody imports on it.

  RLS itself is NOT touched. The anon key returning 49 rows is the policy doing
  its job; this is a client bug, and loosening the policy to "fix" it would be
  the wrong repair.

  python patch_parity_rls.py            # dry run
  python patch_parity_rls.py --apply
  node scripts/registry-parity-check.mjs
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "PARITY_RLS_2026_09_06"
JS = os.path.join("scripts", "registry-parity-check.mjs")

EDITS = [
    # 1. read a service-role key too
    ("""  return {
    url: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}""",
     """  // PARITY_RLS_2026_09_06 — a service-role key sees drafts; the anon key
  // cannot, because RLS restricts public SELECT to status='published'. Without
  // this, the "published + draft" fetch below silently returns published only.
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || env.SUPABASE_SERVICE_ROLE_KEY
    || env.SUPABASE_SERVICE_KEY;
  return {
    url: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
    key: service
      || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
      || env.VITE_SUPABASE_PUBLISHABLE_KEY,
    isService: Boolean(service),
  };
}"""),

    ("""const { url: SUPABASE_URL, key: ANON_KEY } = loadEnv();""",
     """const { url: SUPABASE_URL, key: ANON_KEY, isService: IS_SERVICE } = loadEnv();"""),

    # 2. say plainly what this run can and cannot see
    ("""const publishedCount = dbArticles.filter((a) => a.status === 'published').length;
console.log(`Database: ${dbArticles.length} articles (${publishedCount} published, ${dbArticles.length - publishedCount} draft/other)`);""",
     """const publishedCount = dbArticles.filter((a) => a.status === 'published').length;
const draftCount = dbArticles.length - publishedCount;
console.log(`Database: ${dbArticles.length} articles (${publishedCount} published, ${draftCount} draft/other)`);

// PARITY_RLS_2026_09_06 — do not let an anon-key run masquerade as a full one.
const BLIND = !IS_SERVICE;
if (BLIND) {
  console.warn('');
  console.warn('  ******************************************************************');
  console.warn('  *  ANON KEY IN USE — DRAFT ARTICLES ARE INVISIBLE TO THIS RUN.   *');
  console.warn('  *  RLS restricts public SELECT on srangam_articles to            *');
  console.warn('  *  status = published, so every DRAFT will be reported as        *');
  console.warn('  *  "MISSING IN DB". DO NOT IMPORT ON THE STRENGTH OF THIS REPORT *');
  console.warn('  *  — importing an article that already exists as a draft creates *');
  console.warn('  *  a duplicate row.                                              *');
  console.warn('  *                                                                *');
  console.warn('  *  Set SUPABASE_SERVICE_ROLE_KEY and re-run for a true picture.  *');
  console.warn('  ******************************************************************');
  console.warn('');
} else if (draftCount === 0) {
  console.log('Service-role key in use; the database genuinely holds no drafts.');
} else {
  console.log(`Service-role key in use; ${draftCount} draft(s) are visible and will be reported as DRAFT, not MISSING.`);
}"""),

    # 3. never advise importing something this run could not see
    ("""    rows.push({ slug: art.id, kind: 'registry', status: '❌ MISSING IN DB', detail: `static languages: ${staticLangs.join(',')}` });""",
     """    rows.push({
      slug: art.id, kind: 'registry',
      status: BLIND ? '❓ UNVERIFIABLE (anon key)' : '❌ MISSING IN DB',
      detail: BLIND
        ? `not visible to the anon key — may already exist as a DRAFT. Re-run with SUPABASE_SERVICE_ROLE_KEY before importing. static languages: ${staticLangs.join(',')}`
        : `static languages: ${staticLangs.join(',')}`,
    });"""),

    # 4. stamp the written report as well as the console
    ("""**Database**: ${SUPABASE_URL} — ${dbArticles.length} articles (${publishedCount} published, ${dbArticles.length - publishedCount} draft)""",
     """**Database**: ${SUPABASE_URL} — ${dbArticles.length} articles (${publishedCount} published, ${draftCount} draft)
**Key**: ${IS_SERVICE ? 'service role — drafts visible, counts complete' : '⚠️ ANON — RLS hides drafts. Rows marked UNVERIFIABLE may already exist as drafts; DO NOT import from this run.'}"""),
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

    bad = False
    for i, (old, _new) in enumerate(EDITS, 1):
        n = s.count(old)
        print(f"  edit {i}: {n} match(es) (need exactly 1)")
        if n != 1:
            bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAnchors OK. Re-run with --apply, then: node scripts/registry-parity-check.mjs")
        return

    os.makedirs("backups", exist_ok=True)
    b = os.path.join("backups", f"registry-parity-check.mjs.preRLS.{time.strftime('%Y%m%d_%H%M%S')}")
    shutil.copy2(JS, b)
    print(f"  backup: {b}")
    try:
        for old, new in EDITS:
            assert s.count(old) == 1
            s = s.replace(old, new, 1)
        s = s.replace("// ---------- load static sources ----------",
                      f"// {MARKER}\n// ---------- load static sources ----------", 1)
        io.open(JS, "w", encoding="utf-8", newline="\n").write(s)
    except Exception as exc:
        shutil.copy2(b, JS)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. Re-run the gate:")
    print("  node scripts/registry-parity-check.mjs          # anon: now warns loudly")
    print('  $env:SUPABASE_SERVICE_ROLE_KEY="<key>" ; node scripts/registry-parity-check.mjs')
    print("\nWith the service key the DRAFT branch finally fires and the gap list")
    print("shrinks to articles that are genuinely absent.")


if __name__ == "__main__":
    main()
