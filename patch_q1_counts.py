#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_q1_counts.py - Master Plan Q1: the "Published Articles" figure is wrong.
(2026-09-06)

WHAT THE MASTER PLAN SAID, AND WHAT IT ACTUALLY IS
--------------------------------------------------
ENTERPRISE_MASTER_PLAN_2026-07-12.md, Q1, hypothesised:

  "candidate causes: theme reduction double-counting multi-theme rows, or a
   static+DB blend upstream"

Neither. Read against the code, it is a label/field mismatch plus a discarded
query. Three separate defects:

D1 · THE WRONG FIELD IS RENDERED.
     src/pages/BeginJourney.tsx:58   { value: totalArticles, label: "Published Articles" }
     src/pages/About.tsx:26          { value: totalArticles, label: "Research Articles" }
     and in the hook:
     src/hooks/useResearchStats.ts   totalArticles = themeStatsResult.data?.length
     where themeStatsResult is  .select('theme, status')  with NO status filter.
     So the figure labelled "Published Articles" is published PLUS drafts.
     `publishedArticles` is computed correctly two lines below and never passed.

D2 · THE AUTHORITATIVE QUERY IS THROWN AWAY.
     `articlesResult` — .select('id', {count:'exact', head:true}).eq('status','published')
     — is issued on every homepage/About/BeginJourney load and its `.count` is
     never referenced in the return object. A network round-trip paid for on a
     page whose whole Phase-1 story was load time, and then discarded.

D3 · BOTH TOTALS ARE CAPPED AT 1000 ROWS, SILENTLY.
     totalArticles and publishedArticles both derive from the ROW ARRAY of
     .select('theme, status'). PostgREST applies a default limit of 1000. At 49
     articles this is invisible; at 1001 the site would quietly under-report and
     keep looking plausible. SCALABILITY_ROADMAP.md exists precisely for this
     class of bug. Exact head-counts do not have the cap.

THE FIX (surgical; no query removed, one added, two call sites corrected)
  * hook: publishedArticles  <- articlesResult.count      (the query already run)
          totalArticles      <- a new exact head-count, no status filter
          themes[]           <- unchanged; the grouped select still supplies the
                                per-theme breakdown, which is all it was ever
                                fit for.
  * BeginJourney/About: pass publishedArticles to the metric labelled published.

  The per-theme numbers, getThemeArticleCount, getThemeDraftCount and every
  other consumer are untouched.

  python patch_q1_counts.py            # dry run, checks every anchor
  python patch_q1_counts.py --apply
  npm run build ; npm run test         # the gate, on Windows
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "Q1_COUNTS_2026_09_06"
HOOK = os.path.join("src", "hooks", "useResearchStats.ts")
BEGIN = os.path.join("src", "pages", "BeginJourney.tsx")
ABOUT = os.path.join("src", "pages", "About.tsx")

HOOK_EDITS = [
    # 0. export it, so a unit test can call it without a React tree.
    #    No test covered this hook, which is why a wrong public number survived
    #    from at least 2026-07-12 to 2026-09-06.
    ("""async function fetchResearchStats(): Promise<Omit<ResearchStats, 'isLoading'>> {""",
     """export async function fetchResearchStats(): Promise<Omit<ResearchStats, 'isLoading'>> {"""),

    # 1. add an exact total count beside the exact published count
    ("""  const [articlesResult, crossRefsResult, termsResult, themeStatsResult] = await Promise.all([
    // Total published articles
    supabase
      .from('srangam_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    ""","""  const [articlesResult, totalResult, crossRefsResult, termsResult, themeStatsResult] = await Promise.all([
    // Published articles — EXACT count. (Q1_COUNTS_2026_09_06)
    // This query was already being issued and its .count discarded; it is now
    // the source of truth for publishedArticles.
    supabase
      .from('srangam_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),

    // ALL articles — EXACT count. Previously derived from the length of the
    // grouped row array, which PostgREST caps at 1000 rows by default: correct
    // at 49 articles, silently wrong at 1001. A head-count has no cap.
    supabase
      .from('srangam_articles')
      .select('id', { count: 'exact', head: true }),
    """),

    # 2. use them
    ("""  // Calculate totals
  const totalArticles = themeStatsResult.data?.length || 0;
  const publishedArticles = themes.reduce((sum, t) => sum + t.count, 0);
  const draftArticles = themes.reduce((sum, t) => sum + t.draftCount, 0);""",
     """  // Totals come from the EXACT head-counts, not from the length of the grouped
  // row array. The grouped select remains the source for the per-theme
  // breakdown, which is all it is fit for. (Q1_COUNTS_2026_09_06)
  const totalArticles = totalResult.count ?? (themeStatsResult.data?.length || 0);
  const publishedArticles = articlesResult.count
    ?? themes.reduce((sum, t) => sum + t.count, 0);
  const draftArticles = (totalResult.count != null && articlesResult.count != null)
    ? Math.max(0, totalResult.count - articlesResult.count)
    : themes.reduce((sum, t) => sum + t.draftCount, 0);"""),
]

BEGIN_EDITS = [
    ("""  const { totalArticles, crossReferences, culturalTerms, themes, isLoading } = useResearchStats();""",
     """  const { publishedArticles, crossReferences, culturalTerms, themes, isLoading } = useResearchStats();"""),
    ("""    { value: totalArticles, label: "Published Articles", sublabel: "Long-form research", suffix: "+", color: "saffron" },""",
     """    // Q1_COUNTS_2026_09_06: was totalArticles, which includes drafts — the
    // figure labelled "Published Articles" counted unpublished ones.
    { value: publishedArticles, label: "Published Articles", sublabel: "Long-form research", suffix: "+", color: "saffron" },"""),
    ("""        <meta name="description" content={`Explore ${totalArticles}+ research articles,""",
     """        <meta name="description" content={`Explore ${publishedArticles}+ research articles,"""),
]

ABOUT_EDITS = [
    ("""  const { totalArticles, crossReferences, culturalTerms, isLoading } = useResearchStats();""",
     """  const { publishedArticles, crossReferences, culturalTerms, isLoading } = useResearchStats();"""),
    ("""    { value: totalArticles, label: "Research Articles", sublabel: "Long-form scholarship", suffix: "+", color: "saffron" },""",
     """    // Q1_COUNTS_2026_09_06: published, not published+drafts.
    { value: publishedArticles, label: "Research Articles", sublabel: "Long-form scholarship", suffix: "+", color: "saffron" },"""),
]

ALL = [(HOOK, HOOK_EDITS), (BEGIN, BEGIN_EDITS), (ABOUT, ABOUT_EDITS)]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    for path, _ in ALL:
        if not os.path.exists(path):
            sys.exit(f"not found: {path} - run from the srangam repo root")
    if MARKER in io.open(HOOK, encoding="utf-8").read():
        print("Already applied (marker found). Nothing to do."); return

    print("Checking every anchor before touching anything...")
    bad = False
    for path, edits in ALL:
        s = io.open(path, encoding="utf-8").read()
        missing = [(i, s.count(o)) for i, (o, _n) in enumerate(edits, 1) if s.count(o) != 1]
        print(f"  {path}: {len(edits)-len(missing)}/{len(edits)} anchors matched")
        for i, n in missing:
            print(f"    edit {i}: found {n} times (need exactly 1)")
            bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAll anchors OK. Re-run with --apply, then:  npm run build ; npm run test")
        return

    stamp = time.strftime("%Y%m%d_%H%M%S")
    os.makedirs("backups", exist_ok=True)
    backups = {}
    for path, _ in ALL:
        b = os.path.join("backups", f"{os.path.basename(path)}.preQ1.{stamp}")
        shutil.copy2(path, b); backups[path] = b
        print(f"  backup: {b}")
    try:
        for path, edits in ALL:
            s = io.open(path, encoding="utf-8").read()
            for old, new in edits:
                assert s.count(old) == 1, f"{path}: anchor vanished"
                s = s.replace(old, new, 1)
            if path == HOOK:
                s = s.replace("import { useQuery }",
                              f"// {MARKER}\nimport {{ useQuery }}", 1)
            io.open(path, "w", encoding="utf-8", newline="\n").write(s)
    except Exception as exc:
        for path, b in backups.items():
            shutil.copy2(b, path)
        sys.exit(f"FAILED ({exc}) - all files restored from backup.")

    print("\nApplied. Gate on Windows:")
    print("  npm run build")
    print("  npm run test")
    print("\nThen load /begin-journey and /about: the figure must equal the DB's")
    print("published count, not published+drafts.")


if __name__ == "__main__":
    main()
