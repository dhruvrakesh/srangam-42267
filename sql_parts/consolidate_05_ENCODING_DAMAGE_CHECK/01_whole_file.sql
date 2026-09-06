-- 01_whole_file.sql  ·  split from consolidate_05_ENCODING_DAMAGE_CHECK.sql
-- One statement. Paste, Run, read the result.
--
-- consolidate_05_ENCODING_DAMAGE_CHECK.sql  ·  2026-09-06  ·  READS ONLY
--
-- ONE STATEMENT. Paste the whole file, press Run, read the table.
--
-- The Supabase editor displays only the LAST statement's result. Every
-- multi-section file I have written today has therefore shown you its final
-- SELECT and hidden the answer you needed. This file has exactly one query.
--
-- ═══ WHAT IT IS CHECKING ═══════════════════════════════════════════════════
--     node scripts\emit-draft-fill-sql.mjs > consolidate_02b_fill_shells.sql
-- Windows PowerShell 5.1 decodes a program's stdout with the OEM console code
-- page and then writes UTF-16LE. The file that reached disk on 2026-09-06 held
--     "Purāṇa"  as  "Pur─üß╣ça"        "Śāstra" as "┼Ü─üstra"
--     Devanagari "यस्य आज्ञया" as "αñ»αñ╕αÑìαñ» αñåαñ£αÑìαñ₧αñ»αñ╛"
-- and it contained 8 UPDATE statements that write article bodies. It was run.
--
-- The regenerated file is clean (verified: no BOM, UTF-8, 92,563 chars vs the
-- corrupted 139,198 — the difference is precisely the mojibake expansion).
-- What remains unknown is whether the corrupt version's UPDATEs committed.
--
-- The mojibake byte patterns cannot occur in correctly-encoded text:
--   ΓÇ  = UTF-8 punctuation (– — ‑ ' ") read as cp437
--   αñ  = Devanagari read as cp437
--   ─ü  = ā        ┼Ü = Ś        ß╣ç = ṇ

-- consolidate_05_ENCODING_DAMAGE_CHECK.sql  ·  2026-09-06  ·  READS ONLY
--
-- ONE STATEMENT. Paste the whole file, press Run, read the table.
--
-- The Supabase editor displays only the LAST statement's result. Every
-- multi-section file I have written today has therefore shown you its final
-- SELECT and hidden the answer you needed. This file has exactly one query.
--
-- ═══ WHAT IT IS CHECKING ═══════════════════════════════════════════════════
--     node scripts\emit-draft-fill-sql.mjs > consolidate_02b_fill_shells.sql
-- Windows PowerShell 5.1 decodes a program's stdout with the OEM console code
-- page and then writes UTF-16LE. The file that reached disk on 2026-09-06 held
--     "Purāṇa"  as  "Pur─üß╣ça"        "Śāstra" as "┼Ü─üstra"
--     Devanagari "यस्य आज्ञया" as "αñ»αñ╕αÑìαñ» αñåαñ£αÑìαñ₧αñ»αñ╛"
-- and it contained 8 UPDATE statements that write article bodies. It was run.
--
-- The regenerated file is clean (verified: no BOM, UTF-8, 92,563 chars vs the
-- corrupted 139,198 — the difference is precisely the mojibake expansion).
-- What remains unknown is whether the corrupt version's UPDATEs committed.
--
-- The mojibake byte patterns cannot occur in correctly-encoded text:
--   ΓÇ  = UTF-8 punctuation (– — ‑ ' ") read as cp437
--   αñ  = Devanagari read as cp437
--   ─ü  = ā        ┼Ü = Ś        ß╣ç = ṇ

WITH probe AS (
  SELECT
    a.slug,
    a.status,
    length(COALESCE(a.content::jsonb ->> 'en','')) AS en_chars,
    a.updated_at,
    ((a.content::jsonb ->> 'en') LIKE '%ΓÇ%'
      OR (a.content::jsonb ->> 'en') LIKE '%αñ%'
      OR (a.content::jsonb ->> 'en') LIKE '%─ü%'
      OR (a.content::jsonb ->> 'en') LIKE '%┼Ü%'
      OR (a.content::jsonb ->> 'en') LIKE '%ß╣%')            AS corrupted,
    (a.slug IN ('stone-purana','riders-on-monsoon','scripts-that-sailed',
                'earth-sea-sangam','monsoon-trade-clock','chola-naval-raid',
                'indian-ocean-power-networks','kutai-yupa-borneo'))  AS was_a_target
  FROM srangam_articles a
)
SELECT
  CASE WHEN was_a_target THEN 'TARGET' ELSE 'other' END           AS scope,
  slug,
  status,
  en_chars,
  CASE
    WHEN corrupted                       THEN '### CORRUPTED - repair needed ###'
    WHEN was_a_target AND en_chars < 200 THEN 'still a 60-109 char shell - NOTHING LANDED, no damage'
    WHEN was_a_target                    THEN 'filled and clean - the good run landed'
    ELSE                                      'clean'
  END                                                             AS verdict,
  updated_at
FROM probe
WHERE was_a_target OR corrupted          -- the 8 targets, plus ANY corrupted row anywhere
ORDER BY corrupted DESC, was_a_target DESC, en_chars DESC;

-- ═══ HOW TO READ IT ════════════════════════════════════════════════════════
-- 8 rows, all "still a 60-109 char shell"   -> nothing committed. No damage.
--                                              Re-run the regenerated 02b.
-- 8 rows, all "filled and clean"            -> a good run already landed. Done.
-- ANY row "### CORRUPTED ###"               -> send me this table. The repair
--                                              targets those byte patterns
--                                              specifically and leaves every
--                                              other row untouched.
-- Rows with scope='other' appear only if corruption exists OUTSIDE the eight,
-- which would mean this redirect pattern predates today.
