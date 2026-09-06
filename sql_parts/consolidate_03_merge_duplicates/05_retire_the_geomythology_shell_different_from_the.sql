-- 05_retire_the_geomythology_shell_different_from_the.sql  ·  split from consolidate_03_merge_duplicates.sql
-- This part contains 2 statements. The editor shows only the LAST
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
