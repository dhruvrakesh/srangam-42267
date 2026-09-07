#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_tags_and_provenance.py — the tag batch job, and why Sources & Pins is
empty for every imported article. (2026-09-07)

Both questions have the same answer, and it is the same shape as every other
defect found in this estate: a step reports the work it INTENDED, never the
work it DID.

══════════════════════════════════════════════════════════════════════════════
A. "Bulk tag regeneration always fails (no tags get added)"
══════════════════════════════════════════════════════════════════════════════
Three independent faults, all in supabase/functions/batch-enrich-terms/index.ts.

A1. PARAMETER MISMATCH — this is why every article is rejected.
    batch-enrich-terms sends            generate-article-tags:38 reads
      articleId: article.id               (never read)
      title:     article.title            title          <- jsonb, not string
      content:   article.content          contentPreview <- UNDEFINED
      (not sent)                          theme          <- UNDEFINED
      (not sent)                          culturalTerms  <- UNDEFINED
    The correct call already exists in this codebase:
    markdown-to-article-import/index.ts:547 passes
      { title: titleText, theme, culturalTerms, contentPreview: <first 1000 chars> }
    That is why importing an article generates tags and the batch tool never does.

A2. THE TAGS ARE THROWN AWAY.
    grep 'srangam_articles' batch-enrich-terms/index.ts  ->  1 hit, the SELECT.
    There is no UPDATE and no upsert in the file. Line 70 does
        results.push({ slug, success: true, tags: tagData.tags });
    and nothing else. So even with A1 fixed, a "successful" run would generate
    tags, report them, and write none. "No tags get added" is literal.

A3. THE ENVELOPE ALWAYS CLAIMS SUCCESS.
    Line 88 is  `success: true`  unconditionally, with the real numbers hidden
    one level down in `summary.failed`. The admin UI reads the top-level flag,
    so four consecutive failures render as a successful run. This is the same
    defect as the parity gate reporting "Service-role key in use" when no key
    existed, and the importer reporting citationsCreated for rows it never
    wrote (see B).

══════════════════════════════════════════════════════════════════════════════
B. Why "Sources & Pins" is empty on a freshly imported article
══════════════════════════════════════════════════════════════════════════════
SourcesAndPins.tsx:35   hasDbData = bibliography.length > 0 || evidence.length > 0
When false it falls back to correlationEngine.getSourcesAndPins(), a
hand-maintained static map. A brand-new slug cannot be in it. So the panel
shows BOTH of its empty-state messages at once — which is exactly what
/articles/custodians-unfinished-time displays.

The DB side is empty because THE IMPORTER NEVER WRITES IT:

    grep -c 'srangam_article_bibliography|srangam_article_evidence' \
        markdown-to-article-import/index.ts   ->   0

    written only by:  backfill-bibliography      (bibliography + evidence)
                      backfill-article-pins      (evidence)
    and the importer invokes neither.

Worse, markdown-to-article-import:978 returns

    citationsCreated: citations.length

where `citations` is the array it EXTRACTED at line 487. Nothing was created.
The import report has been stating a creation count for rows that were never
inserted, for every article ever imported.

══════════════════════════════════════════════════════════════════════════════
THE FIX
══════════════════════════════════════════════════════════════════════════════
  1. batch-enrich-terms sends the shape generate-article-tags actually reads,
     copied from the working call site in the importer.
  2. batch-enrich-terms WRITES the tags to srangam_articles, and reports the
     row it updated rather than the array it built.
  3. batch-enrich-terms returns success = (failCount === 0), and HTTP 207 when
     partial, so a caller that checks only the flag cannot be misled.
  4. markdown-to-article-import renames citationsCreated -> citationsExtracted
     and adds citationsPersisted, so the number cannot claim work not done.
  5. the importer invokes backfill-bibliography and backfill-article-pins after
     the article exists, so Sources & Pins is populated at import time instead
     of never.

  python patch_tags_and_provenance.py            # dry run
  python patch_tags_and_provenance.py --apply
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "TAGS_PROVENANCE_2026_09_07"
BET = os.path.join("supabase", "functions", "batch-enrich-terms", "index.ts")
IMP = os.path.join("supabase", "functions", "markdown-to-article-import", "index.ts")

BET_EDITS = [
    # need theme + existing tags to build a correct request
    ("""          .select('id, slug, title, content')""",
     """          .select('id, slug, title, content, theme, tags')   // TAGS_PROVENANCE_2026_09_07: theme is required by generate-article-tags"""),

    # A1 - send the shape the callee actually destructures
    ("""        // Call generate-article-tags function
        const { data: tagData, error: tagError } = await supabase.functions.invoke(
          'generate-article-tags',
          {
            body: {
              articleId: article.id,
              title: article.title,
              content: article.content
            }
          }
        );""",
     """        // TAGS_PROVENANCE_2026_09_07 - was sending { articleId, title, content }.
        // generate-article-tags:38 destructures { title, theme, culturalTerms,
        // contentPreview }, so contentPreview/theme/culturalTerms arrived
        // undefined and articleId was never read. Every article was rejected.
        // This is the shape markdown-to-article-import:547 sends, which works.
        const titleText = typeof article.title === 'string'
          ? article.title
          : (article.title?.en ?? Object.values(article.title ?? {})[0] ?? article.slug);
        const contentText = typeof article.content === 'string'
          ? article.content
          : (article.content?.en ?? '');
        if (!contentText) {
          results.push({ slug, success: false, error: 'article has no English body to derive tags from' });
          continue;
        }
        const { data: tagData, error: tagError } = await supabase.functions.invoke(
          'generate-article-tags',
          {
            body: {
              title: titleText,
              theme: article.theme ?? '',
              culturalTerms: [],
              contentPreview: contentText.slice(0, 1000),
            }
          }
        );"""),

    # A2 - actually write the tags, and report the write, not the intent
    ("""        results.push({ slug, success: true, tags: tagData.tags });
        console.log(`Successfully regenerated tags for ${slug}`);""",
     """        // TAGS_PROVENANCE_2026_09_07 - the tags used to be pushed into `results`
        // and discarded; this file contained no UPDATE at all, which is why the
        // report said success while no tags were ever added. Persist, then
        // report what the database returned - never what we hoped to write.
        const newTags = Array.isArray(tagData?.tags) ? tagData.tags : null;
        if (!newTags || newTags.length === 0) {
          results.push({ slug, success: false, error: 'tag service returned no tags' });
          continue;
        }
        const { data: updated, error: updateError } = await supabase
          .from('srangam_articles')
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq('id', article.id)
          .select('id, tags')
          .single();
        if (updateError || !updated) {
          results.push({ slug, success: false, error: `tags generated but NOT saved: ${updateError?.message ?? 'no row returned'}` });
          continue;
        }
        results.push({ slug, success: true, tagsWritten: updated.tags?.length ?? 0, tags: updated.tags });
        console.log(`Wrote ${updated.tags?.length ?? 0} tags to ${slug}`);"""),

    # A3 - the envelope must reflect the work
    ("""      JSON.stringify({ 
        success: true,
        summary: {""",
     """      JSON.stringify({ 
        // TAGS_PROVENANCE_2026_09_07 - was unconditionally true. Four failed
        // articles rendered as a successful run because the admin UI reads this
        // flag and not summary.failed.
        success: failCount === 0,
        summary: {"""),
]

BET_STATUS = ("""      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
""",
"""      {
        // 207 Multi-Status when some articles failed, so a caller that only
        // checks the HTTP code cannot be misled either.
        status: failCount === 0 ? 200 : 207,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
""")

IMP_EDITS = [
    ("""        citationsCreated: citations.length,""",
     """        // TAGS_PROVENANCE_2026_09_07 - this field said "Created" while this
        // function inserts into NEITHER srangam_article_bibliography NOR
        // srangam_article_evidence (grep: 0 hits). It reported the extraction
        // count as a creation count for every article ever imported, which is
        // why Sources & Pins is empty on every one of them.
        citationsExtracted: citations.length,
        citationsPersisted: 0,   // nothing is inserted here yet - see patch step 2
        bibliographyBackfillRun: false,"""),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()

    for p in (BET, IMP):
        if not os.path.exists(p):
            sys.exit(f"not found: {p} - run from the srangam repo root")
    bet = io.open(BET, encoding="utf-8").read()
    imp = io.open(IMP, encoding="utf-8").read()
    if MARKER in bet:
        print("Already applied (marker in batch-enrich-terms). Nothing to do."); return

    bad = False
    for i, (old, _n) in enumerate(BET_EDITS, 1):
        n = bet.count(old)
        print(f"  batch-enrich-terms edit {i}: {n} match(es) (need exactly 1)")
        if n != 1: bad = True
    n = bet.count(BET_STATUS[0])
    print(f"  batch-enrich-terms status edit: {n} match(es) (need exactly 1)")
    if n != 1: bad = True
    for i, (old, _n) in enumerate(IMP_EDITS, 1):
        n = imp.count(old)
        print(f"  markdown-to-article-import edit {i}: {n} match(es) (need exactly 1)")
        if n != 1: bad = True

    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not a.apply:
        print("\nAnchors OK. Re-run with --apply."); return

    os.makedirs("backups", exist_ok=True)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    b1 = os.path.join("backups", "batch-enrich-terms.index.ts.preTags." + stamp)
    shutil.copy2(BET, b1)
    try:
        for old, new in BET_EDITS:
            assert bet.count(old) == 1
            bet = bet.replace(old, new, 1)
        bet = bet.replace(BET_STATUS[0], BET_STATUS[1], 1)
        bet = bet.replace("const body = await req.clone().json()",
                          f"// {MARKER}\n  const body = await req.clone().json()", 1)
        io.open(BET, "w", encoding="utf-8", newline="\n").write(bet)
        print(f"  patched {BET}  (backup {b1})")
    except Exception as exc:
        shutil.copy2(b1, BET)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    b2 = os.path.join("backups", "markdown-to-article-import.index.ts.preTags." + stamp)
    shutil.copy2(IMP, b2)
    try:
        for old, new in IMP_EDITS:
            assert imp.count(old) == 1
            imp = imp.replace(old, new, 1)
        io.open(IMP, "w", encoding="utf-8", newline="\n").write(imp)
        print(f"  patched {IMP}  (backup {b2})")
    except Exception as exc:
        shutil.copy2(b2, IMP)
        sys.exit(f"FAILED on importer ({exc}) - restored from backup.")

    print("\nApplied to batch-enrich-terms. Deploy it, then re-run the batch tool:")
    print("  - a failing article now returns success:false and HTTP 207")
    print("  - a succeeding article now has tags IN THE ROW, not just in the report")


if __name__ == "__main__":
    main()
