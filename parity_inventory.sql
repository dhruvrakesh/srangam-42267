-- parity_inventory.sql  ·  2026-09-06
--
-- Produces the article inventory that scripts/registry-parity-check.mjs needs
-- in order to see DRAFTS, without any service-role key.
--
-- WHY THIS EXISTS
-- This is a Lovable Cloud project; SUPABASE_SERVICE_ROLE_KEY is not available
-- to the maintainer. The parity script authenticates with the anon key, and RLS
-- restricts public SELECT on srangam_articles to status='published', so it can
-- never see a draft. Measured 2026-09-06:
--     SQL editor : 49 published + 9 draft = 58 rows
--     the script : "49 articles (49 published, 0 draft/other)"
-- Every draft was therefore reported as "MISSING IN DB", whose stated remedy is
-- "import via Admin -> Markdown Import" — which would create a duplicate of a
-- row that already exists.
--
-- The SQL editor runs privileged, so it IS the available source of truth.
--
-- HOW TO USE
--   1. Paste this into the Supabase SQL editor (via Lovable Cloud) and Run.
--   2. Export CSV.  Save it as  docs\db_inventory.csv  in the srangam repo.
--   3. node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
--
-- Reads only. Writes nothing.
--
-- NOTE ON `content`: the multilingual body is deliberately NOT exported — a
-- JSON blob does not survive CSV cleanly. Instead the non-empty language keys
-- are pre-computed into a plain string ("en,hi,pa"), which the parity script
-- turns back into a content object. The CONTENT GAP check keeps working.
--
-- If the `a.content::jsonb` cast errors, the column is a different type than
-- expected — report the error rather than editing around it.

SELECT
  a.id,
  a.slug,
  COALESCE(a.slug_alias, '')                        AS slug_alias,
  a.status,
  COALESCE(
    (SELECT string_agg(e.key, ',' ORDER BY e.key)
       FROM jsonb_each_text(COALESCE(a.content::jsonb, '{}'::jsonb)) AS e(key, val)
      WHERE length(btrim(COALESCE(e.val, ''))) > 0),
    ''
  )                                                 AS content_langs,
  a.updated_at
FROM srangam_articles a
ORDER BY a.slug;


-- ─────────────────────────────────────────────────────────────────────────────
-- Sanity check to run alongside it. These three numbers must agree with what
-- the parity script prints after you pass --inventory. If they do not, the
-- export is truncated — re-export rather than trusting the report.
--
--   SELECT COUNT(*) FILTER (WHERE status = 'published') AS published,
--          COUNT(*) FILTER (WHERE status <> 'published') AS drafts,
--          COUNT(*)                                      AS total
--   FROM srangam_articles;
--
-- Verified 2026-09-06:  published 49, drafts 9, total 58.
