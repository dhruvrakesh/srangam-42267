-- consolidate_06_ENRICHMENT_STATE.sql  ·  2026-09-07  ·  READS ONLY
--
-- ONE STATEMENT. Paste, Run, read the table.
--
-- ═══ WHY THIS EXISTS ═══════════════════════════════════════════════════════
-- I made two claims from reading source code that the database contradicted:
--
--   "biblio_rows will be 0 for all five"
--      WRONG. the-n-ga-compact has 17, ganderbal has 9. backfill-bibliography
--      has been run and it works. What is true is narrower: the IMPORTER never
--      calls it (grep -c on markdown-to-article-import = 0), so articles
--      imported after that one-off run have nothing. The May/June articles
--      have bibliography; the July ones have zero.
--
--   "srangam_article_evidence is written by backfill-article-pins"
--      WRONG. That function READS evidence as geographic seed data and WRITES
--      srangam_article_pins (its own header, lines 6 and 15). Evidence is
--      written by backfill-bibliography only.
--
-- Source greps say what code COULD do. This says what the corpus IS. Where the
-- two disagree, this wins.
--
-- Also resolves articles by slug OR slug_alias. The previous query used
-- `slug IN (...)` and returned 4 rows for 5 slugs: custodians-unfinished-time
-- did not match, yet /articles/custodians-unfinished-time renders. Either it
-- lives under a different slug with that alias, or it is not in this table at
-- all - and those two possibilities need different fixes.

WITH targets(want) AS (VALUES
  ('the-land-before-the-name'),
  ('the-lion-at-the-western-gate'),
  ('the-n-ga-compact'),
  ('ganderbal-m-s-spring-and-iva-s-watershed'),
  ('custodians-unfinished-time')
),
resolved AS (
  SELECT t.want,
         a.id, a.slug, COALESCE(a.slug_alias,'') AS slug_alias, a.status,
         COALESCE(array_length(a.tags,1), 0)                       AS n_tags,
         length(COALESCE(a.content::jsonb ->> 'en',''))            AS en_chars,
         a.created_at, a.updated_at
  FROM targets t
  LEFT JOIN srangam_articles a
         ON a.slug = t.want OR a.slug_alias = t.want
)
SELECT
  r.want                                          AS asked_for,
  CASE WHEN r.id IS NULL THEN '*** NOT IN srangam_articles UNDER slug OR alias ***'
       WHEN r.slug <> r.want THEN 'resolved via alias -> ' || r.slug
       ELSE 'resolved by slug' END                AS how_resolved,
  r.status,
  r.en_chars,
  r.n_tags,
  (SELECT count(*) FROM srangam_article_bibliography b WHERE b.article_id = r.id) AS biblio_rows,
  (SELECT count(*) FROM srangam_article_evidence      e WHERE e.article_id = r.id) AS evidence_rows,
  (SELECT count(*) FROM srangam_article_pins          p WHERE p.article_id = r.id) AS pin_rows,
  r.created_at,
  r.updated_at
FROM resolved r

UNION ALL

-- corpus-wide totals, so the four targets are seen in context
SELECT '== WHOLE CORPUS ==',
       'articles: ' || (SELECT count(*)::text FROM srangam_articles),
       NULL, NULL,
       (SELECT count(*) FROM srangam_articles WHERE COALESCE(array_length(tags,1),0) > 0),
       (SELECT count(DISTINCT article_id) FROM srangam_article_bibliography),
       (SELECT count(DISTINCT article_id) FROM srangam_article_evidence),
       (SELECT count(DISTINCT article_id) FROM srangam_article_pins),
       NULL, NULL

ORDER BY 1;

-- ═══ HOW TO READ THE LAST ROW ══════════════════════════════════════════════
-- n_tags       = how many of the 58 articles have ANY tags
-- biblio_rows  = how many DISTINCT articles have bibliography
-- evidence_rows= how many have evidence
-- pin_rows     = how many have gazetteer pins
--
-- If biblio is ~2-10 of 58, the backfill was run once and never wired in.
-- If evidence and pins are 0 of 58, those pipelines have never produced
-- anything for anyone, and Sources & Pins was always going to be empty.
