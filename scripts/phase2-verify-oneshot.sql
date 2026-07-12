-- ============================================================================
-- Phase 2.2 — READ-ONLY parity verification, ONE-SHOT (2026-07-12)
-- ============================================================================
-- Supabase's SQL editor exports only the LAST statement's result set, so the
-- multi-block script returns only its final block. This single query returns
-- EVERY diagnostic as one labelled, exportable result set. 100% read-only.
--
-- Read the `check_name` column to know which diagnostic each row belongs to:
--   1-exists-check : a "genuinely missing" theme that ALREADY exists in the DB
--                    (→ alias it, don't import). If a theme is absent here, it
--                    is truly missing and safe to import.
--   2-scripts      : disambiguate Scripts that Sailed I vs II by title.
--   3-alias-hi     : the 7 high-confidence alias targets (confirm titles).
--   4-alias-lo     : the 3 low-confidence alias candidates (confirm titles).
--   5-content-gap  : language coverage of the two known content-gap articles.
--   6-duplicates   : article clusters that appear more than once in the DB.
--   9-corpus-count : total published rows (sanity vs the 71 the site shows).
-- ============================================================================
WITH pub AS (
  SELECT id, slug, slug_alias, title, content,
    (SELECT string_agg(k, ',' ORDER BY k) FROM jsonb_object_keys(content) k) AS langs
  FROM srangam_articles
  WHERE status = 'published'
)
SELECT check_name, slug, slug_alias, title_en, detail FROM (
  -- 1. "genuinely missing" themes that actually exist in the DB
  SELECT '1-exists-check' AS check_name, slug, slug_alias, (title->>'en') AS title_en,
         ('langs: ' || COALESCE(langs, '')) AS detail
  FROM pub
  WHERE title->>'en' ILIKE '%maritime memor%'  OR slug ILIKE '%maritime-memor%'
     OR title->>'en' ILIKE '%riders on%monsoon%' OR slug ILIKE '%riders-on-monsoon%'
     OR title->>'en' ILIKE '%monsoon%clock%'    OR slug ILIKE '%monsoon-trade-clock%'
     OR title->>'en' ILIKE '%gondwana%'         OR slug ILIKE '%gondwana%'
     OR title->>'en' ILIKE '%indian ocean%power%' OR slug ILIKE '%indian-ocean-power%'
     OR title->>'en' ILIKE '%ashoka%kandahar%'  OR slug ILIKE '%kandahar%'
     OR title->>'en' ILIKE '%kutai%'            OR slug ILIKE '%kutai%'
     OR title->>'en' ILIKE '%chola%naval%'      OR slug ILIKE '%chola-naval%'
     OR title->>'en' ILIKE '%pepper%bullion%'   OR slug ILIKE '%pepper%'
     OR title->>'en' ILIKE '%earth%sea%sangam%' OR slug ILIKE '%earth-sea-sangam%'
     OR title->>'en' ILIKE '%cosmic island%'    OR slug ILIKE '%cosmic-island%'
     OR title->>'en' ILIKE '%stone%purana%'     OR slug ILIKE '%stone-purana%'

  UNION ALL
  -- 2. Scripts that Sailed I vs II
  SELECT '2-scripts', slug, slug_alias, title->>'en', 'langs: ' || COALESCE(langs, '')
  FROM pub
  WHERE title->>'en' ILIKE '%scripts that sailed%'
     OR slug ILIKE '%scripts%sailed%' OR slug_alias ILIKE '%scripts%sailed%'
     OR slug_alias ILIKE '%epigraphic-atlas%'

  UNION ALL
  -- 3. high-confidence alias targets (7)
  SELECT '3-alias-hi', slug, slug_alias, title->>'en', 'langs: ' || COALESCE(langs, '')
  FROM pub
  WHERE slug_alias IN (
    'ashoka-legacy-buddhism','rishi-genealogies-vedic','reassessing-antiquity-rigvedadocx',
    'dashanami-jyotirlinga-geography','stone-song-sea-janajati','vedic-preservation-sarira',
    'geomythology-cultural-continuity')

  UNION ALL
  -- 4. low-confidence alias candidates (3)
  SELECT '4-alias-lo', slug, slug_alias, title->>'en', 'langs: ' || COALESCE(langs, '')
  FROM pub
  WHERE slug_alias IN ('asura-exiles-mitanni','janajatiya-oral-traditions','continuous-habitation-india')
     OR title->>'en' ILIKE '%asura exile%'
     OR title->>'en' ILIKE '%janaj%oral%'
     OR title->>'en' ILIKE '%continuous habitation%'

  UNION ALL
  -- 5. content-gap language coverage
  SELECT '5-content-gap', slug, slug_alias, title->>'en', 'langs: ' || COALESCE(langs, '')
  FROM pub
  WHERE slug_alias IN ('jambudvipa-connected','sacred-tree-harvest-rhythms')

  UNION ALL
  -- 6. duplicate clusters (same article theme appearing more than once)
  SELECT '6-duplicates', string_agg(slug, ' | '), NULL::text, theme_key, 'count=' || count(*)::text
  FROM (
    SELECT slug,
      CASE
        WHEN title->>'en' ILIKE '%sarira%' OR title->>'en' ILIKE '%śarīra%' THEN 'sarira-atman'
        WHEN title->>'en' ILIKE '%janaj%'                                    THEN 'janajatiya'
        WHEN title->>'en' ILIKE '%geomyth%'                                  THEN 'geomythology'
        WHEN title->>'en' ILIKE '%rishi%genealog%' OR title->>'en' ILIKE '%ṛṣi%genealog%' THEN 'rishi-genealogies'
        WHEN title->>'en' ILIKE '%vishnu%shiva%' OR title->>'en' ILIKE '%hari%hara%'      THEN 'vishnu-shiva'
        ELSE NULL
      END AS theme_key
    FROM pub
  ) d
  WHERE theme_key IS NOT NULL
  GROUP BY theme_key
  HAVING count(*) > 1

  UNION ALL
  -- 9. corpus sanity count
  SELECT '9-corpus-count', NULL::text, NULL::text, NULL::text, 'published rows = ' || count(*)::text
  FROM pub
) x
ORDER BY check_name, title_en NULLS LAST;
