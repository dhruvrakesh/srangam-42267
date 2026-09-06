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
COMMENT ON TABLE srangam_article_merges IS
  'Duplicate reconciliation (Master Plan Q3). The loser is NOT deleted - it is '
  'set status=draft so it stops rendering, and this table records why. A resolver '
  'fallback can later use it to 301 the loser slug to the winner.';
ALTER TABLE srangam_article_merges ENABLE ROW LEVEL SECURITY;


-- ═══ 2 ── confirm the collisions before acting. READ THIS OUTPUT. ══════════
-- Every pair must show two rows with IDENTICAL en_chars. If any pair does not,
-- the corpus has changed since the 20:04 export — stop and re-export.
SELECT length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       id, slug, COALESCE(slug_alias,'') AS slug_alias, status,
       left(COALESCE(title::jsonb ->> 'en',''), 95) AS title, created_at
FROM srangam_articles
WHERE length(COALESCE(content::jsonb ->> 'en','')) IN (54798, 36359, 34178)
ORDER BY en_chars DESC, created_at;


-- ═══ 3 ── which row wins ═══════════════════════════════════════════════════
-- Rule, applied consistently: the row whose TITLE was written by a human wins;
-- the row whose title is a leaked filename is the accidental re-import.
--
--   WINNER  the-celestial-bridge-…      "The Celestial Bridge: An Investigation into…"
--   loser   shiva-bunjil-altair-…       "Shiva, Bunjil, Altair Connections"
--
--   WINNER  har-har-hari-hari-…         "Har Har Hari Hari: Vishnu–Śiva Reciprocity from Veda to Janajāti"
--   loser   vishnu-shiva-hari-hara-…    "vishnu, shiva, hari, hara, revised, expanded, manuscript"
--
--   WINNER  the-asura-exiles-…          "The Asura Exiles: A Multi-Disciplinary Inquiry into the Mitanni…"
--   loser   deep-dive-indo-iranian-…-2  "Deep Dive- Indo-Iranian Origins and Zoroastrianism (2)"
--
-- Corroboration for the third: canonicalSlugMap.ts already maps the registry id
-- 'asura-exiles-indo-iranian' to 'asura-exiles-mitanni'. The repo had already
-- decided which of that pair is canonical.


-- ═══ 4 ── record and retire. Idempotent. ═══════════════════════════════════
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


-- ═══ 5 ── retire the geomythology SHELL (different from the three above) ════
-- geomythology-land-reclamation is a 60-character draft shell. The published
-- row geomythology-cultural-continuity holds 113,821 characters and IS this
-- article — canonicalSlugMap.ts maps the registry id to it. So this is not a
-- content merge; it is disposing of an empty row that only creates confusion.
-- It is excluded from scripts/emit-draft-fill-sql.mjs for the same reason.
INSERT INTO srangam_article_merges (winner_id, loser_id, winner_slug, loser_slug, loser_alias, reason)
SELECT w.id, l.id, w.slug, l.slug, l.slug_alias,
       'Q3/2026-09-06: loser is a 60-char shell; winner holds 113,821 chars of the same article per canonicalSlugMap.ts.'
FROM srangam_articles w, srangam_articles l
WHERE w.slug_alias = 'geomythology-cultural-continuity'
  AND l.slug       = 'geomythology-land-reclamation'
  AND l.status <> 'published'
  AND length(COALESCE(l.content::jsonb ->> 'en','')) < 200
ON CONFLICT (loser_id) DO NOTHING;


-- ═══ 6 ── the UNRESOLVED Śarīra pair. Decide with your eyes, not a heuristic ═
-- Read the first 1,200 characters of each. If one is a chapter OF the other,
-- they are separate publications and must NOT be merged.
SELECT slug, COALESCE(slug_alias,'') AS slug_alias,
       length(content::jsonb ->> 'en') AS en_chars,
       COALESCE(title::jsonb ->> 'en','') AS title,
       left(content::jsonb ->> 'en', 1200) AS opening
FROM srangam_articles
WHERE slug_alias IN ('vedic-preservation-sarira','sarira-atman-preservation-vedas')
ORDER BY en_chars DESC;


-- ═══ 7 ── stop the source. Run the check FIRST. ════════════════════════════
-- A merge cleans up; it does not prevent. Every duplicate in this corpus is a
-- re-import of the same source file — docs/ still holds the numbered copies:
--   'Janajātiya Traditions… (1).md' and '(2).md'
--   'Stone, Song, and Sea… (1).md'  and '(2).md'
--   'Under the Sacred Tree… (2).md' and '(3).md'
-- A uniqueness constraint turns the next silent duplicate into a loud error.
--
-- Length-based check first — it is what actually catches them:
SELECT length(COALESCE(content::jsonb ->> 'en','')) AS en_chars, count(*),
       array_agg(slug ORDER BY created_at) AS slugs
FROM srangam_articles
WHERE length(COALESCE(content::jsonb ->> 'en','')) > 1000
GROUP BY 1 HAVING count(*) > 1
ORDER BY 1 DESC;
-- Expect: the same 3 pairs, and nothing else. After the merge above they will
-- still appear (the loser is retired, not deleted) — that is correct.

-- Title check, then the constraint. Only when the query returns zero rows:
SELECT lower(btrim(COALESCE(title::jsonb ->> 'en', ''))) AS title_en, count(*)
FROM srangam_articles
WHERE btrim(COALESCE(title::jsonb ->> 'en','')) <> ''
GROUP BY 1 HAVING count(*) > 1 ORDER BY 2 DESC;

-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS srangam_articles_title_en_unique
--     ON srangam_articles ((lower(btrim(title::jsonb ->> 'en'))))
--  WHERE btrim(COALESCE(title::jsonb ->> 'en','')) <> '';
-- CONCURRENTLY cannot run inside a transaction block — run it on its own.
