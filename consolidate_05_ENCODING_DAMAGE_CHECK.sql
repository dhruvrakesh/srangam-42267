-- consolidate_05_ENCODING_DAMAGE_CHECK.sql  ·  2026-09-06  ·  RUN THIS FIRST
--
-- ═══ WHAT HAPPENED ═════════════════════════════════════════════════════════
--     node scripts\emit-draft-fill-sql.mjs > consolidate_02b_fill_shells.sql
--
-- That redirect corrupts the file twice on Windows PowerShell 5.1:
--   1. node writes UTF-8 bytes to stdout; PowerShell decodes them with the OEM
--      console code page (437/850), turning every multi-byte character into
--      box-drawing junk;
--   2. `>` then writes the result as UTF-16LE.
--
-- Verified on disk, 2026-09-06:
--     consolidate_02b_fill_shells.sql   BOM ff fe   (UTF-16LE)
--     "Purāṇa"      became  "Pur─üß╣ça"
--     "Śāstra"      became  "┼Ü─üstra"
--     "Geo‑Heritage" became "GeoΓÇæHeritage"
--     Devanagari "यस्य आज्ञया" became "αñ»αñ╕αÑìαñ» αñåαñ£αÑìαñ₧αñ»αñ╛"
--
-- The file contains 8 UPDATE statements that write article bodies. If they
-- committed, eight articles now hold mojibake instead of Sanskrit.
--
-- This file only LOOKS. It changes nothing.


-- ═══ 1 ── did anything land at all? ════════════════════════════════════════
-- BEFORE the 02b run these eight rows were 60-109 characters (title-only shells).
--   still 60-109      -> nothing committed. No damage. Regenerate and re-run.
--   now much larger   -> the UPDATEs committed. Go to section 2.
SELECT slug, status,
       length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       left(COALESCE(content::jsonb ->> 'en',''), 140) AS opening
FROM srangam_articles
WHERE slug IN ('stone-purana','riders-on-monsoon','scripts-that-sailed',
               'earth-sea-sangam','monsoon-trade-clock','chola-naval-raid',
               'indian-ocean-power-networks','kutai-yupa-borneo')
ORDER BY en_chars DESC;


-- ═══ 2 ── is the text corrupted, and how far did it spread? ════════════════
-- These byte patterns cannot occur in correctly-encoded text. 'ΓÇ' is a UTF-8
-- punctuation sequence read as cp437; 'αñ' is Devanagari read the same way;
-- '─ü' is ā; '┼Ü' is Ś.
SELECT slug, status,
       length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       (content::jsonb ->> 'en') LIKE '%ΓÇ%'  AS has_punct_mojibake,
       (content::jsonb ->> 'en') LIKE '%αñ%'  AS has_devanagari_mojibake,
       (content::jsonb ->> 'en') LIKE '%─ü%'  AS has_iast_mojibake,
       updated_at
FROM srangam_articles
WHERE (content::jsonb ->> 'en') LIKE '%ΓÇ%'
   OR (content::jsonb ->> 'en') LIKE '%αñ%'
   OR (content::jsonb ->> 'en') LIKE '%─ü%'
   OR (content::jsonb ->> 'en') LIKE '%┼Ü%'
ORDER BY updated_at DESC;
-- EXPECT ZERO ROWS. Any row here is corrupted and must be repaired.
-- Check updated_at: anything at 2026-09-06 ~15:1x UTC is from the 02b run.


-- ═══ 3 ── whole-corpus sweep, in case this predates today ══════════════════
-- The same redirect pattern may have been used before this session.
SELECT count(*) FILTER (WHERE (content::jsonb ->> 'en') LIKE '%ΓÇ%') AS punct,
       count(*) FILTER (WHERE (content::jsonb ->> 'en') LIKE '%αñ%') AS devanagari,
       count(*) FILTER (WHERE (content::jsonb ->> 'en') LIKE '%─ü%') AS iast_a,
       count(*) FILTER (WHERE (content::jsonb ->> 'en') LIKE '%┼Ü%') AS iast_s,
       count(*)                                                      AS total_rows
FROM srangam_articles;


-- ═══ 4 ── total row count, unchanged as always ═════════════════════════════
SELECT count(*) AS total FROM srangam_articles;   -- must be 58
