-- parity_reality_check.sql  ·  2026-09-06
--
-- WHY THIS EXISTS
-- scripts/registry-parity-check.mjs authenticates with VITE_SUPABASE_PUBLISHABLE_KEY
-- (the ANON key). RLS on srangam_articles restricts public SELECT to
-- status='published', so its fetch returns only the 49 published rows and ZERO
-- drafts — even though the script's own comment says it wants "published + draft"
-- and it carries a '📝 DRAFT (imported, unpublished) — PUBLISH it, do NOT
-- re-import' branch that can therefore never fire.
--
-- Live DB, verified 2026-09-06 in the SQL editor:
--     published 49, draft 9, TOTAL 58
-- Parity script reported:
--     "Database: 49 articles (49 published, 0 draft/other)"
--
-- Consequence: any registry article sitting in the DB as a DRAFT is reported as
-- "❌ MISSING IN DB", and the report's own remedy is "import via Admin → Markdown
-- Import". Doing that creates a SECOND row for an article that already exists —
-- which is exactly the duplication Master Plan Q3 is cleaning up.
--
-- Run this in the Supabase SQL editor, which uses the service role and therefore
-- SEES the drafts. It writes nothing.

WITH claimed_missing(slug) AS (VALUES
  ('ashoka-kandahar-edicts'),
  ('asura-exiles-indo-iranian'),
  ('chola-naval-raid'),
  ('continuous-habitation-uttarapatha'),
  ('cosmic-island-sacred-land'),
  ('dashanami-ascetics-sacred-geography'),
  ('earth-sea-sangam'),
  ('geomythology-land-reclamation'),
  ('gondwana-to-himalaya'),
  ('indian-ocean-power-networks'),
  ('janajati-oral-traditions'),
  ('kutai-yupa-borneo'),
  ('maritime-memories-south-india'),
  ('monsoon-trade-clock'),
  ('pepper-and-bullion'),
  ('reassessing-ashoka-legacy'),
  ('reassessing-rigveda-antiquity'),
  ('riders-on-monsoon'),
  ('rishi-genealogies-vedic-tradition'),
  ('sarira-and-atman-vedic-preservation'),
  ('scripts-that-sailed'),
  ('scripts-that-sailed-ii'),
  ('stone-purana'),
  ('stone-song-and-sea')
)
SELECT
  c.slug                                   AS parity_says_missing,
  COALESCE(a.status, '— absent —')         AS reality,
  a.slug                                   AS db_slug,
  a.slug_alias,
  a.theme,
  a.updated_at,
  CASE
    WHEN a.id IS NULL              THEN 'IMPORT — genuinely absent'
    WHEN a.status = 'published'    THEN 'INVESTIGATE — published but parity missed it (slug mismatch?)'
    ELSE                                'DO NOT IMPORT — already exists as a draft; PUBLISH it instead'
  END                                      AS action
FROM claimed_missing c
LEFT JOIN srangam_articles a
       ON a.slug = c.slug
       OR a.slug_alias = c.slug
ORDER BY
  CASE WHEN a.id IS NULL THEN 2 WHEN a.status = 'published' THEN 1 ELSE 0 END,
  c.slug;


-- ─────────────────────────────────────────────────────────────────────────────
-- The 9 drafts themselves, so you can see what the parity report cannot.
SELECT slug, slug_alias, theme, status, updated_at
FROM srangam_articles
WHERE status <> 'published'
ORDER BY theme, slug;


-- ─────────────────────────────────────────────────────────────────────────────
-- Master Plan Q3: confirm the 3 duplicate pairs before any merge SQL is written.
-- Groups any two rows whose slug or alias normalises to the same key.
SELECT lower(regexp_replace(COALESCE(slug_alias, slug), '[^a-z0-9]+', '-', 'g')) AS norm_key,
       COUNT(*)                                            AS rows,
       array_agg(slug ORDER BY updated_at)                 AS slugs,
       array_agg(status ORDER BY updated_at)               AS statuses,
       array_agg(id ORDER BY updated_at)                   AS ids
FROM srangam_articles
GROUP BY 1
HAVING COUNT(*) > 1
ORDER BY rows DESC, norm_key;


-- ─────────────────────────────────────────────────────────────────────────────
-- What the site's own RLS shows an anonymous visitor. If this returns 49, the
-- policy is doing its job and the parity script's blindness is a CLIENT bug,
-- not a policy bug — do not "fix" it by loosening RLS.
SELECT COUNT(*) AS visible_to_anon
FROM srangam_articles
WHERE status = 'published';
