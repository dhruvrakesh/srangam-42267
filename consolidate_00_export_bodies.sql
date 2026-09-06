-- consolidate_00_export_bodies.sql  ·  2026-09-06  ·  READS ONLY
--
-- Feeds scripts/coherence/pipeline.py. Export the RESULT as docs/db_bodies.csv.
--
-- WARNING ON SIZE: this exports full article bodies. The corpus is ~2.9 MB of
-- English text and one row alone (kshatriya-rigveda-medieval) is 568,471
-- characters. Export in slices rather than all 58 at once — change the WHERE
-- clause and export each slice to its own file, then concatenate, or work one
-- article at a time, which is what the pipeline expects anyway.
--
-- The pipeline needs exactly three columns: slug, slug_alias, content_en.

-- ── slice 1: the coherence backlog. Start here. ────────────────────────────
-- These are the rows most likely to need structural editing: long bodies with
-- filename-derived titles or numeric suffixes, i.e. the imports that were never
-- cleaned up.
SELECT slug,
       COALESCE(slug_alias,'')       AS slug_alias,
       content::jsonb ->> 'en'       AS content_en
FROM srangam_articles
WHERE status = 'published'
  AND length(COALESCE(content::jsonb ->> 'en','')) BETWEEN 20000 AND 120000
ORDER BY length(content::jsonb ->> 'en');

-- ── slice 2: one article by name (what you will actually use most) ─────────
-- SELECT slug, COALESCE(slug_alias,'') AS slug_alias, content::jsonb ->> 'en' AS content_en
-- FROM srangam_articles WHERE slug_alias = 'anukramani-vedic-tradition';

-- ── slice 3: the four giants, one at a time. Do NOT export these together. ─
--   568,471  kshatriya-rigveda-medieval
--   538,809  vishnu-shiva-interplay
--   312,390  hinglaj-kamakhya
--   234,555  mahavidyas-mountains-mysteries-vindhyava
-- SELECT slug, COALESCE(slug_alias,'') AS slug_alias, content::jsonb ->> 'en' AS content_en
-- FROM srangam_articles WHERE slug_alias = 'kshatriya-rigveda-medieval';
