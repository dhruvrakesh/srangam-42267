# Corpus bridge — measured state, 2026-09-08

Measured against `data/context.db` (read-only) and this tree at `e4bd4e0`.

## Offline corpus (D:\Sanksrit Automatons\sanskrit-automatonv2)
docs 59 | passages 32,949 | translated 15,174 (46.1%) | translations_l10n 8,470
entities 6,096 | entity_mentions 25,749 | entity_variants 16,923 | passage_embeddings 15,012

Publishable now (>=75% coverage): MBh01 6957/6957 100%, nirukta 1988/2095 94.9%,
nilamata_seg 1330/1393 95.5%, markandeya_purana 998/1294 77.1%,
yajur_veda_shukla 951/1228 77.4%, AphorismsOfSandilya 453/598 75.8%.
37 of 59 docs have at least one translated passage.

## The bridge: built at both ends, never run
- scripts/publish_srangam.py is COMPLETE - upserts srangam_texts (on_conflict doc_code)
  and srangam_text_passages (on_conflict text_id,page_no,idx), batched, and deliberately
  never re-flips `published`. It hard-requires SUPABASE_SERVICE_ROLE_KEY and sys.exits
  without one. We do not have that key - Supabase is reached through Lovable Cloud.
  THIS IS THE ONE BLOCKER. Phase 0 replaces it with a corpus-ingest edge function.
- supabase/migrations/20260718120000_srangam_texts_corpus.sql exists in the repo.
  srangam_texts and srangam_text_passages appear ZERO times in types.ts, which is
  consistent with the migration never having been applied. Verify, do not assume.
- No UI reads either table. Zero references in src/, no route.

## Name collision, resolved
srangam_corpus_article_{term,tag,biblio}_pairs and the correlate-corpus function are
article-to-article similarity views over srangam_articles. They have NOTHING to do with
the Sanskrit corpus despite the name. Do not conflate them again.

## ResearchNetwork.tsx radial layout - 8 defects (lines 188-203)
1. One ring at fixed radius 300. Not a hierarchy: no depth, no parent, no child.
2. Ring position is `i / nodes.length` where i is the fetch-order index. Neighbours are
   neighbours by database return order, so every edge is a random chord. This is the mess.
3. `group: article.theme` is computed for every node and never used by the layout.
4. `tags` is selected in the query and never reaches the graph.
5. Every node is pinned via fx/fy, disabling the force simulation entirely.
6. Radius constant regardless of count: 1885px circumference / 59 nodes = 32px per label.
7. The centre node consumes an index but occupies no ring slot - uneven spacing.
8. Centre chosen by reduce with arbitrary tie-break, recomputed on every search keystroke.

Fix: lay out on the hierarchy that exists (theme -> article now; category -> work ->
passage after Phase 3) with a d3 cluster, arcs per parent, radius scaled to count, no pinning.