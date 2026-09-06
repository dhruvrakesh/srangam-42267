-- 04_record_and_retire_idempotent.sql  ·  split from consolidate_03_merge_duplicates.sql
-- This part contains 9 statements. The editor shows only the LAST
-- result, so run them one at a time if you need to see each.
--
-- consolidate_03_merge_duplicates.sql  ·  REWRITTEN 2026-09-06 20:10
--
-- Supersedes the version written before docs/db_evidence.csv existed. That
-- version named three "candidate" pairs found by token overlap on slug_alias.
-- The evidence export shows that instrument was wrong: TWO of those three are
-- not duplicates, and it missed all three that are.
--
-- ═══ HOW DUPLICATES ARE ACTUALLY IDENTIFIED HERE ═════════════════════════════
-- Two rows holding the SAME NUMBER OF CHARACTERS in their English body, to the
-- byte, are the same document imported twice. Nothing else in a 58-row corpus
-- of independently written monographs produces an exact collision at 34,000+
-- characters. Slug similarity does not survive this importer (diacritics are
-- dropped to nothing: 'sarira' in one row, 'ar-ra' in its twin), so length is
-- the reliable instrument and slug text is not.
--
--     54,798 x2   the-celestial-bridge-…                    44356116
--                 shiva-bunjil-altair-connections           5829a1c0
--     36,359 x2   har-har-hari-hari-…                       0dc8cfe0
--                 vishnu-shiva-hari-hara-revised-…          81c2bd10
--     34,178 x2   the-asura-exiles-…                        bff8c589
--                 deep-dive-indo-iranian-origins-…-2        51fbb08c
--
-- ═══ WHAT THE PREVIOUS VERSION GOT WRONG — corrected on the record ═══════════
--   janajatiya-oral-traditions (107,177) vs janajatiya-traditions-oral-
--     continuities (63,183).  DIFFERENT lengths, different titles
--     ("…Animistic Roots of Sanātana Dharma: Evidence, Correlations…" vs
--     "…Oral Continuities and Archaeological Parallels (1)").
--     NOT DUPLICATES. Do not merge.
--   vishnu-shiva-hari-hara (36,359) vs vishnu-shiva-interplay (538,809).
--     A 15x difference. NOT DUPLICATES — I paired these by slug and was wrong.
--     hari-hara's real twin is har-har-hari-hari, found by length.
--   vedic-preservation-sarira (47,288) vs sarira-atman-preservation-vedas
--     (28,736).  Titles are "Chapter 6: Śarīra and Ātman – Preserving the Body
--     and Soul of the Vedas" and "Śarīra and Ātman, The Preservation of the
--     Vedas through the Anukramaṇīs and the Bhāṣya of Sāyaṇāchārya".
--     UNRESOLVED — plausibly a chapter and the full paper, plausibly two drafts
--     of one work. A 1.6x length gap is not proof either way. This file does
--     NOT merge them; section 5 gives you the query to decide.
--
-- Master Plan Q3 said "3 true duplicate rows". The COUNT is right. Two of the
-- three PAIRS it named are not the ones.
--
-- NOTHING IS DELETED IN THIS FILE. The loser is unpublished and the merge is
-- recorded, so every step reverses with one UPDATE.
-- ═══ 1 ── audit trail, created before anything changes ═════════════════════

-- ═══ 4 ── record and retire. Idempotent. ═══════════════════════════════════
-- SELF-SUFFICIENT: the CREATE TABLE from section 1 is repeated here, because
-- the SQL editor shows only the LAST statement's result and these sections are
-- therefore run one at a time. Running section 4 alone previously failed with
--     ERROR: 42P01: relation "srangam_article_merges" does not exist
-- CREATE TABLE IF NOT EXISTS is idempotent, so repeating it costs nothing.
CREATE TABLE IF NOT EXISTS srangam_article_merges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id    uuid NOT NULL REFERENCES srangam_articles(id) ON DELETE RESTRICT,
  loser_id     uuid NOT NULL REFERENCES srangam_articles(id) ON DELETE RESTRICT,
  winner_slug  text NOT NULL,
  loser_slug   text NOT NULL,
  loser_alias  text,
  reason       text NOT NULL,
  merged_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT srangam_article_merges_loser_unique UNIQUE (loser_id),
  CONSTRAINT srangam_article_merges_not_self     CHECK (winner_id <> loser_id)
);
ALTER TABLE srangam_article_merges ENABLE ROW LEVEL SECURITY;

BEGIN;

INSERT INTO srangam_article_merges (winner_id, loser_id, winner_slug, loser_slug, loser_alias, reason)
SELECT w.id, l.id, w.slug, l.slug, l.slug_alias, r.reason
FROM (VALUES
  ('celestial-bridge-shaivism-bunjil', 'shiva-bunjil-altair-connections',
   'Q3/2026-09-06: identical English body length (54,798 chars). Same document; loser title is a filename.'),
  ('har-har-hari-hari', 'vishnu-shiva-hari-hara',
   'Q3/2026-09-06: identical English body length (36,359 chars). Loser title "vishnu, shiva, hari, hara, revised, expanded, manuscript" is a leaked filename.'),
  ('asura-exiles-mitanni', 'deep-dive-indoiranian-origins',
   'Q3/2026-09-06: identical English body length (34,178 chars). canonicalSlugMap.ts already treats asura-exiles-mitanni as canonical.')
) AS r(win_alias, lose_alias, reason)
JOIN srangam_articles w ON w.slug_alias = r.win_alias
JOIN srangam_articles l ON l.slug_alias = r.lose_alias
WHERE w.id <> l.id
  -- refuse to act unless the lengths really do match, right now
  AND length(COALESCE(w.content::jsonb ->> 'en','')) = length(COALESCE(l.content::jsonb ->> 'en',''))
ON CONFLICT (loser_id) DO NOTHING;

-- Expect 3 rows. Fewer means a length no longer matches — investigate, do not force.
SELECT winner_slug, loser_slug, left(reason, 60) AS reason FROM srangam_article_merges ORDER BY merged_at;

UPDATE srangam_articles
   SET status = 'draft', updated_at = now()
 WHERE id IN (SELECT loser_id FROM srangam_article_merges)
   AND status = 'published'
RETURNING id, slug, status;

-- Review both outputs, then:  COMMIT;   (or ROLLBACK;)
--
-- Reversal of a committed run:
--   UPDATE srangam_articles SET status='published'
--    WHERE id IN (SELECT loser_id FROM srangam_article_merges);
--   DELETE FROM srangam_article_merges;
