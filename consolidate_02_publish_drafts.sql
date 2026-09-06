-- consolidate_02_publish_drafts.sql  ·  2026-09-06
--
-- IDEMPOTENT. Re-running changes nothing after the first successful run.
-- Run consolidate_01_evidence.sql FIRST and read §2 of its output.
--
-- WHAT THIS REPLACES
-- Master Plan Q2 says "Import the 13 genuinely-missing articles" and names them.
-- Reconciled against the privileged 58-row inventory on 2026-09-06, 8 of those
-- 13 are ALREADY IN THE DATABASE as drafts, under their exact registry slug:
--     chola-naval-raid, earth-sea-sangam, indian-ocean-power-networks,
--     kutai-yupa-borneo, monsoon-trade-clock, riders-on-monsoon,
--     scripts-that-sailed, stone-purana
-- They were reported "MISSING" only because the parity script authenticates
-- with the anon key and RLS hides drafts from it. Importing them would create
-- eight duplicate rows — the exact defect Q3 exists to clean up.
--
-- The 9th draft, geomythology-land-reclamation, is DELIBERATELY EXCLUDED here:
-- it duplicates the published row 'xfrom-legends-of-land-reclamation-to-living-
-- traditions-...' (alias geomythology-cultural-continuity). It is handled in
-- consolidate_03, not by publishing.
--
-- The remaining 5 of Q2's 13 are genuinely absent and DO need importing:
--     ashoka-kandahar-edicts, cosmic-island-sacred-land, gondwana-to-himalaya,
--     maritime-memories-south-india, pepper-and-bullion


-- ═══ STEP 1 — DRY RUN. Read this before running anything below. ═══════════
-- Publishing puts these bodies on the public site. A row whose English body is
-- a few hundred characters is a card blurb, not an article; publishing it would
-- degrade the site rather than enrich it. MIN_EN_CHARS below is the gate.
-- Decide the threshold from these numbers, do not accept 2000 on my say-so.
SELECT slug,
       length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       CASE WHEN length(COALESCE(content::jsonb ->> 'en','')) >= 2000
            THEN 'would PUBLISH' ELSE 'would BE HELD BACK (too short)' END AS effect,
       left(COALESCE(title,''),70) AS title
FROM srangam_articles
WHERE status <> 'published'
  AND slug IN ('chola-naval-raid','earth-sea-sangam','indian-ocean-power-networks',
               'kutai-yupa-borneo','monsoon-trade-clock','riders-on-monsoon',
               'scripts-that-sailed','stone-purana')
ORDER BY en_chars DESC;


-- ═══ STEP 2 — the change. Idempotent by construction. ═════════════════════
-- `WHERE status <> 'published'` makes a second run a no-op: after the first
-- run those rows no longer match. No row is created, none is deleted.
--
-- BEFORE RUNNING, note the rollback (it is exact, not approximate):
--   UPDATE srangam_articles SET status = 'draft'
--    WHERE slug IN (<the slugs the RETURNING clause below actually prints>);
--
-- Adjust 2000 to whatever STEP 1 justified.
BEGIN;

UPDATE srangam_articles
   SET status       = 'published',
       published_date = COALESCE(published_date, CURRENT_DATE),
       updated_at   = now()
 WHERE status <> 'published'
   AND slug IN ('chola-naval-raid','earth-sea-sangam','indian-ocean-power-networks',
                'kutai-yupa-borneo','monsoon-trade-clock','riders-on-monsoon',
                'scripts-that-sailed','stone-purana')
   AND length(COALESCE(content::jsonb ->> 'en','')) >= 2000     -- <= the gate
RETURNING id, slug, status, published_date,
          length(COALESCE(content::jsonb ->> 'en','')) AS en_chars;

-- Read the RETURNING output. If it is what you intended:
--   COMMIT;
-- If not:
--   ROLLBACK;
-- Leaving the transaction open blocks writers — decide now, not later.


-- ═══ STEP 3 — verification, AFTER commit ══════════════════════════════════
-- (a) counts moved by exactly the number of rows RETURNING printed
SELECT count(*) FILTER (WHERE status = 'published')  AS published,
       count(*) FILTER (WHERE status <> 'published') AS drafts,
       count(*)                                      AS total
FROM srangam_articles;
-- baseline measured 2026-09-06: published 49, drafts 9, total 58

-- (b) nothing was created or destroyed: total must still be 58
-- (c) the anon-visible count must now equal the published count
SELECT count(*) AS visible_to_anon FROM srangam_articles WHERE status = 'published';
