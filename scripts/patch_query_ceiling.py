#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_query_ceiling.py  (2026-09-10)  QUERY_CEILING_2026_09_10

"seem to be hitting query limits, a bunch of analytics features seem
 irrational. are you sure this is the enterprise way?"

No. Here is the measurement behind that.

/research-network reports:  Total Articles 50 | Cross-References 1000 |
Average Strength 6.6/10 | Reference Types 2 - while the filter list directly
underneath it offers five reference types. 1000 is not a coincidence. It is
PostgREST's default row ceiling.

    .from('srangam_cross_references').select('*')      // no bound declared

PostgREST answers an unbounded select with at most `max-rows` (1000 on
Supabase by default) and the client cannot tell a truncated page from a
complete one. Every tile was then computed from that array:

    connections: crossRefs.length                       -> min(true, 1000)
    avgStrength: sum(strength)/crossRefs.length          -> mean of a slice
    types:       distinct reference_type in the slice    -> 2, not 5

So three of the four numbers were wrong, and the graph was drawing an
arbitrary thousand edges chosen by whatever order the database returned.

THE REPO ALREADY KNEW. src/hooks/useResearchStats.ts carries the marker
Q1_COUNTS_2026_09_06 and this comment:

    "Previously derived from the length of the grouped row array, which
     PostgREST caps at 1000 rows by default: correct at 49 articles,
     silently wrong at 1001. A head-count has no cap."

That fix was made on 6 September in one hook, and this page never used it.
useResearchStats already issues exact head-counts for published articles and
for cross-references. Two of the four tiles are corrected by calling code
that has been sitting in the repo for four days.

WHAT A HEAD-COUNT CANNOT DO is avg(strength) and count(distinct type). Those
are aggregates. Computing them in the browser means downloading every row to
do arithmetic Postgres does in one pass - which is the actual antipattern
here, not the missing .limit(). They now come from a database view. Until
that view exists the two tiles render an em dash, because a missing number
is honest and a number derived from a capped array is not. There is
deliberately no client-side fallback for them.

The graph fetch keeps a bound, but a NAMED one, ordered by strength so the
truncation keeps the strongest edges rather than an arbitrary thousand, and
the page says so on screen when it is showing a subset.

Run from the repo root:  python scripts/patch_query_ceiling.py
Add --check to verify anchors without writing.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

MARK = "QUERY_CEILING_2026_09_10"
PAGE = Path("src/pages/ResearchNetwork.tsx")
HOOK = Path("src/hooks/useResearchStats.ts")

IMPORT_OLD = "import { onThemeColorsChanged, resolveCssColor } from '@/lib/cssColor';"
IMPORT_NEW = """import { onThemeColorsChanged, resolveCssColor } from '@/lib/cssColor';
import { useResearchStats } from '@/hooks/useResearchStats';

// QUERY_CEILING_2026_09_10
// PostgREST answers an unbounded select with at most `max-rows` (1000 on
// Supabase by default) and gives the client no way to tell a truncated page
// from a complete one. This graph was relying on that accident. The ceiling
// is now ours, it is named, and the page admits when it has hit it.
const GRAPH_EDGE_BUDGET = 2000;"""

QUERY_OLD = """  // Fetch cross-references
  const { data: crossRefs, isLoading: crossRefsLoading } = useQuery({
    queryKey: ['cross-references-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_cross_references')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });"""

QUERY_NEW = """  // Fetch cross-references for the graph.
  // QUERY_CEILING_2026_09_10 - was .select('*') with no bound, so the server
  // returned its default 1000 and nothing downstream knew. Ordering by
  // strength means a truncated fetch keeps the strongest edges instead of an
  // arbitrary thousand, and only the five columns the graph draws are pulled
  // rather than every column of every row.
  const { data: crossRefs, isLoading: crossRefsLoading } = useQuery({
    queryKey: ['cross-references-network', GRAPH_EDGE_BUDGET],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_cross_references')
        .select('id, source_article_id, target_article_id, reference_type, strength')
        .order('strength', { ascending: false })
        .limit(GRAPH_EDGE_BUDGET);

      if (error) throw error;
      return data;
    },
  });

  // Exact totals. A head-count carries no rows, so the server has nothing to
  // cap. This hook has existed since 2026-09-06 and this page did not use it.
  const researchStats = useResearchStats();

  // avg(strength) and count(distinct reference_type) are aggregates, and no
  // head-count can produce them. Doing them in the browser means downloading
  // the table to do arithmetic the database does in one pass. The view does
  // it in one row. If it has not been created yet this resolves to null and
  // the tiles show an em dash - see the memo below for why there is no
  // client-side fallback.
  const { data: aggregates } = useQuery({
    queryKey: ['cross-reference-aggregates'],
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      // The generated Supabase types are derived from the schema and do not
      // list a view created after they were last generated. Rather than
      // hand-edit generated output, the relation is reached through an
      // untyped handle and the row is cast once, here, where the shape is
      // stated. When Lovable regenerates types after the migration lands,
      // this cast can go and the call becomes ordinary.
      const sb = supabase as unknown as {
        from: (relation: string) => {
          select: (columns: string) => {
            maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
          };
        };
      };
      const { data, error } = await sb
        .from('srangam_cross_reference_stats')
        .select('total, distinct_types, avg_strength')
        .maybeSingle();
      if (error || !data) return null;
      return data as {
        total: number;
        distinct_types: number;
        avg_strength: number;
      };
    },
  });"""

STATS_START = "  const stats = useMemo(() => {"
STATS_END = "\n  }, [articles, crossRefs]);"
STATS_NEW = """  // QUERY_CEILING_2026_09_10
  // These tiles used to be computed from the crossRefs array:
  //     connections: crossRefs.length
  //     avgStrength: sum(strength) / crossRefs.length
  //     types:       Object.keys(typeBreakdown).length
  // With the fetch capped at 1000 that is min(true, 1000), the mean of a
  // slice, and the distinct types present in that slice - which is why the
  // page showed 2 reference types above a filter list offering five.
  //
  // The two countable figures now come from exact head-counts. The two
  // aggregates come from the view or not at all: a missing number is honest,
  // a number computed over a truncated fetch is not, so there is no
  // client-side fallback here on purpose.
  const stats = useMemo(() => {
    if (researchStats.isLoading) return null;
    return {
      articles: researchStats.publishedArticles,
      connections: researchStats.crossReferences,
      avgStrength:
        aggregates?.avg_strength != null
          ? Number(aggregates.avg_strength).toFixed(1)
          : null,
      types: aggregates?.distinct_types ?? null,
    };
  }, [researchStats, aggregates]);"""

AVG_OLD = '<CardTitle className="text-3xl">{stats.avgStrength}/10</CardTitle>'
AVG_NEW = ("<CardTitle className=\"text-3xl\">\n"
           "                  {stats.avgStrength ? `${stats.avgStrength}/10` : '\\u2014'}\n"
           "                </CardTitle>")

TYPES_OLD = """                <CardDescription>Reference Types</CardDescription>
                <CardTitle className="text-3xl">{stats.types}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}"""
TYPES_NEW = """                <CardDescription>Reference Types</CardDescription>
                <CardTitle className="text-3xl">{stats.types ?? '\\u2014'}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* QUERY_CEILING_2026_09_10 - a view that silently shows a subset is
            worse than one that shows less and says so. */}
        {crossRefs && stats && stats.connections > crossRefs.length && (
          <p className="text-sm text-muted-foreground">
            Graph shows the {crossRefs.length.toLocaleString()} strongest of{' '}
            {stats.connections.toLocaleString()} connections.
          </p>
        )}"""

TABLE_OLD = "<CardTitle>All Cross-References ({graphData.links.length})</CardTitle>"
TABLE_NEW = ("<CardTitle>\n"
             "              Cross-References shown ({graphData.links.length.toLocaleString()})\n"
             "            </CardTitle>")


def splice(text: str, start: str, end: str, new: str, label: str):
    if text.count(start) != 1:
        return text, ["%s: start anchor matched %d times" % (label, text.count(start))]
    i = text.index(start)
    j = text.find(end, i + len(start))
    if j == -1:
        return text, ["%s: end anchor not found after start" % label]
    return text[:i] + new + text[j + len(end):], []


def replace_one(text: str, old: str, new: str, label: str):
    n = text.count(old)
    if n != 1:
        return text, ["%s: matched %d times, expected exactly 1" % (label, n)]
    return text.replace(old, new), []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    if not PAGE.exists():
        print("FAIL: %s not found. Run from the repo root." % PAGE)
        return 2
    if not HOOK.exists():
        print("FAIL: %s is missing - it supplies the exact counts." % HOOK)
        return 2
    hook = HOOK.read_text(encoding="utf-8")
    for needed in ("publishedArticles", "crossReferences", "head: true"):
        if needed not in hook:
            print("FAIL: useResearchStats does not provide %r." % needed)
            print("      Patching the page against it would compile and lie.")
            return 2

    src = PAGE.read_text(encoding="utf-8")
    if MARK in src:
        print("Already patched (%s). Nothing to do." % MARK)
        return 0
    if "THEME_REPAINT_2026_09_10" not in src:
        print("FAIL: THEME_REPAINT_2026_09_10 not present. This builds on it.")
        return 2

    problems: list[str] = []
    src, p = replace_one(src, IMPORT_OLD, IMPORT_NEW, "import + budget"); problems += p
    src, p = replace_one(src, QUERY_OLD, QUERY_NEW, "cross-ref query"); problems += p
    src, p = splice(src, STATS_START, STATS_END, STATS_NEW, "stats memo"); problems += p
    src, p = replace_one(src, AVG_OLD, AVG_NEW, "avg tile"); problems += p
    src, p = replace_one(src, TYPES_OLD, TYPES_NEW, "types tile + notice"); problems += p
    src, p = replace_one(src, TABLE_OLD, TABLE_NEW, "table heading"); problems += p

    if problems:
        print("REFUSING TO WRITE. Anchors did not match cleanly:")
        for x in problems:
            print("  " + x)
        return 1

    if args.check:
        print("All 6 anchors matched exactly once. --check: nothing written.")
        return 0

    PAGE.write_text(src, encoding="utf-8", newline="\n")
    print("Patched: %s  (6 edits)" % PAGE)
    return 0


if __name__ == "__main__":
    sys.exit(main())
