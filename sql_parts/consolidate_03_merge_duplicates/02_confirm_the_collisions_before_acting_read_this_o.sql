-- 02_confirm_the_collisions_before_acting_read_this_o.sql  ·  split from consolidate_03_merge_duplicates.sql
-- One statement. Paste, Run, read the result.
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

-- ═══ 2 ── confirm the collisions before acting. READ THIS OUTPUT. ══════════
-- Every pair must show two rows with IDENTICAL en_chars. If any pair does not,
-- the corpus has changed since the 20:04 export — stop and re-export.
SELECT length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       id, slug, COALESCE(slug_alias,'') AS slug_alias, status,
       left(COALESCE(title::jsonb ->> 'en',''), 95) AS title, created_at
FROM srangam_articles
WHERE length(COALESCE(content::jsonb ->> 'en','')) IN (54798, 36359, 34178)
ORDER BY en_chars DESC, created_at;
