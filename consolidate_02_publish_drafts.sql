-- consolidate_02_publish_drafts.sql  ·  SUPERSEDED 2026-09-06 20:10 · DO NOT RUN
--
-- This file was written on the assumption that the nine DB drafts were finished
-- articles awaiting publication. docs/db_evidence.csv proved otherwise:
--
--     109  kutai-yupa-borneo             88  scripts-that-sailed
--      93  earth-sea-sangam              86  monsoon-trade-clock
--      92  chola-naval-raid              81  stone-purana
--      90  indian-ocean-power-networks   80  riders-on-monsoon
--                                        60  geomythology-land-reclamation
--
-- CHARACTERS. Not words. Every one is a title-only shell with no body.
--
-- The body-length gate in the original file (en_chars >= 2000) would have
-- published ZERO of the nine, which is the correct outcome and the reason the
-- gate was written. But "publish" was the wrong operation to begin with: there
-- is nothing in these rows to publish.
--
--   Master Plan Q2   "import the 13 missing"  -> 8 already exist; creates duplicates
--   my earlier plan  "publish the 8 drafts"   -> publishes eight ~90-character pages
--   the truth        UPDATE the shell with the registry body, THEN publish
--
-- The content exists in the static TS registry (stone-purana 38,844 chars,
-- riders-on-monsoon 9,210, scripts-that-sailed 7,181). The row exists in the
-- database. They have never been joined. UPDATE preserves the row id and every
-- foreign key in srangam_article_pins / _versions / _analytics that points at
-- it; an import would orphan all of them and create the very duplicate Q3 is
-- cleaning up.
--
--   USE INSTEAD:
--     node scripts/emit-draft-fill-sql.mjs > consolidate_02b_fill_shells.sql
--     -- review it, then run it in the SQL editor
--
-- The verification queries below are still valid and safe to run on their own.

SELECT status, count(*),
       min(length(COALESCE(content::jsonb ->> 'en',''))) AS min_en,
       max(length(COALESCE(content::jsonb ->> 'en',''))) AS max_en
FROM srangam_articles GROUP BY status ORDER BY status;
-- measured 2026-09-06 20:04:  draft 9 (min 60, max 109) | published 49 (min 7,462, max 568,471)
-- The gap between 109 and 7,462 is the whole finding.

SELECT count(*) AS total FROM srangam_articles;   -- 58, and must stay 58
