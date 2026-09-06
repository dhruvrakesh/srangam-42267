-- 07_stop_the_source_run_the_check_first.sql  ·  split from consolidate_03_merge_duplicates.sql
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
