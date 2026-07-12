-- ============================================================================
-- Phase 2.2 — READ-ONLY parity verification (Enterprise Roadmap 2026-07-12)
-- ============================================================================
-- Purpose: resolve the ambiguities the slug-fuzzy parity report cannot decide.
-- Every statement here is a SELECT. Nothing is written or changed. Run each
-- block in the Supabase SQL editor and read the output; the comments say what
-- a given result means for the roadmap.
--
-- Legend for decisions:
--   * a "genuinely missing" slug that returns a row below  -> it EXISTS; add a
--     CANONICAL_SLUG_MAP entry instead of importing (importing would duplicate).
--   * a slug that returns nothing anywhere below           -> truly absent; safe
--     to import via Admin -> Markdown Import.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. Corpus overview: every published article, its aliases, languages, size.
--    Skim this once — it is the ground truth the report only approximated.
-- ----------------------------------------------------------------------------
SELECT
  slug,
  slug_alias,
  title->>'en'                              AS title_en,
  (SELECT array_agg(k ORDER BY k)
     FROM jsonb_object_keys(content) AS k)  AS content_langs,
  length(content->>'en')                    AS en_body_chars,
  published_date
FROM srangam_articles
WHERE status = 'published'
ORDER BY title->>'en';


-- ----------------------------------------------------------------------------
-- 1. The ~12 "genuinely missing" registry slugs — do they exist under another
--    slug/title? Search title (en) AND slug AND slug_alias by keyword.
--    ANY row returned for a theme = that article already exists in the DB.
-- ----------------------------------------------------------------------------
SELECT slug, slug_alias, title->>'en' AS title_en, status
FROM srangam_articles
WHERE
     title->>'en' ILIKE '%maritime memor%' OR slug ILIKE '%maritime-memor%' OR slug_alias ILIKE '%maritime%'
  OR title->>'en' ILIKE '%riders on%monsoon%' OR slug ILIKE '%riders-on-monsoon%'
  OR title->>'en' ILIKE '%monsoon%clock%'  OR slug ILIKE '%monsoon-trade-clock%'
  OR title->>'en' ILIKE '%gondwana%'       OR slug ILIKE '%gondwana%'
  OR title->>'en' ILIKE '%indian ocean%power%' OR slug ILIKE '%indian-ocean-power%'
  OR title->>'en' ILIKE '%ashoka%kandahar%' OR slug ILIKE '%kandahar%'
  OR title->>'en' ILIKE '%kutai%'          OR slug ILIKE '%kutai%'
  OR title->>'en' ILIKE '%chola%naval%'    OR slug ILIKE '%chola-naval%'
  OR title->>'en' ILIKE '%pepper%bullion%' OR slug ILIKE '%pepper%'
  OR title->>'en' ILIKE '%earth%sea%sangam%' OR slug ILIKE '%earth-sea-sangam%'
  OR title->>'en' ILIKE '%cosmic island%' OR slug ILIKE '%cosmic-island%'
  OR title->>'en' ILIKE '%stone%purana%'  OR slug ILIKE '%stone-purana%'
ORDER BY title->>'en';


-- ----------------------------------------------------------------------------
-- 2. Disambiguate "Scripts that Sailed" I vs II. The report maps BOTH the
--    registry ids scripts-that-sailed and scripts-that-sailed-ii near the DB
--    row aliased scripts-sailed-epigraphic-atlas (whose title says "II").
--    Read the titles to decide which registry id maps where (and whether the
--    non-II original exists at all).
-- ----------------------------------------------------------------------------
SELECT slug, slug_alias, title->>'en' AS title_en,
       (SELECT array_agg(k ORDER BY k) FROM jsonb_object_keys(content) k) AS content_langs
FROM srangam_articles
WHERE title->>'en' ILIKE '%scripts that sailed%'
   OR slug ILIKE '%scripts%sailed%' OR slug_alias ILIKE '%scripts%sailed%'
   OR slug_alias ILIKE '%epigraphic-atlas%'
ORDER BY title->>'en';


-- ----------------------------------------------------------------------------
-- 3. Confirm the 7 HIGH-confidence alias targets actually hold the article
--    (and see their language coverage before wiring CANONICAL_SLUG_MAP).
--    Each row should have a plausible title matching the registry article.
-- ----------------------------------------------------------------------------
SELECT slug, slug_alias, title->>'en' AS title_en,
       (SELECT array_agg(k ORDER BY k) FROM jsonb_object_keys(content) k) AS content_langs
FROM srangam_articles
WHERE slug_alias IN (
  'ashoka-legacy-buddhism',
  'rishi-genealogies-vedic',
  'reassessing-antiquity-rigvedadocx',
  'dashanami-jyotirlinga-geography',
  'stone-song-sea-janajati',
  'vedic-preservation-sarira',
  'geomythology-cultural-continuity'
)
ORDER BY slug_alias;


-- ----------------------------------------------------------------------------
-- 4. Confirm the 3 LOWER-confidence (67%) alias candidates before trusting.
--    Compare the returned title to the registry article's intended subject.
-- ----------------------------------------------------------------------------
SELECT slug, slug_alias, title->>'en' AS title_en,
       (SELECT array_agg(k ORDER BY k) FROM jsonb_object_keys(content) k) AS content_langs
FROM srangam_articles
WHERE slug_alias IN (
  'asura-exiles-mitanni',
  'janajatiya-oral-traditions',
  'continuous-habitation-india'
)
   OR title->>'en' ILIKE '%asura exile%'
   OR title->>'en' ILIKE '%janaj%oral%'
   OR title->>'en' ILIKE '%continuous habitation%'
ORDER BY title->>'en';


-- ----------------------------------------------------------------------------
-- 5. Duplicate-row detection. The unmatched-DB list suggests several articles
--    exist twice (Sarira/Atman, Janajatiya, Geomythology, Rishi genealogies).
--    Duplicates break the single-source-of-truth goal — reconcile in Phase 5.
--    Groups with count > 1 are candidates for dedup.
-- ----------------------------------------------------------------------------
SELECT theme_key, count(*) AS n, array_agg(slug) AS slugs, array_agg(title->>'en') AS titles
FROM (
  SELECT slug, title,
    CASE
      WHEN title->>'en' ILIKE '%sarira%' OR title->>'en' ILIKE '%śarīra%' THEN 'sarira-atman'
      WHEN title->>'en' ILIKE '%janaj%'                                    THEN 'janajatiya'
      WHEN title->>'en' ILIKE '%geomyth%'                                  THEN 'geomythology'
      WHEN title->>'en' ILIKE '%rishi%genealog%' OR title->>'en' ILIKE '%ṛṣi%genealog%' THEN 'rishi-genealogies'
      WHEN title->>'en' ILIKE '%vishnu%shiva%' OR title->>'en' ILIKE '%hari%hara%'      THEN 'vishnu-shiva'
      ELSE NULL
    END AS theme_key
  FROM srangam_articles
  WHERE status = 'published'
) t
WHERE theme_key IS NOT NULL
GROUP BY theme_key
ORDER BY n DESC;


-- ----------------------------------------------------------------------------
-- 6. Content-gap language coverage. jambudvipa-connected and
--    sacred-tree-harvest-rhythms are in the DB but the report flagged missing
--    languages. List exactly which languages have a non-empty body so you know
--    what to re-import.
-- ----------------------------------------------------------------------------
SELECT slug, slug_alias, title->>'en' AS title_en,
       k AS lang, length(content->>k) AS body_chars
FROM srangam_articles,
     LATERAL jsonb_object_keys(content) AS k
WHERE (slug ILIKE '%jambudvipa%' OR slug_alias ILIKE '%jambudvipa%'
       OR slug ILIKE '%sacred-tree%' OR slug_alias ILIKE '%sacred-tree%'
       OR title->>'en' ILIKE '%jambudvipa%' OR title->>'en' ILIKE '%sacred tree%')
  AND status = 'published'
ORDER BY title_en, lang;


-- ----------------------------------------------------------------------------
-- 7. Fallback-telemetry cross-check (optional). If you ship structured logs to
--    a table, this is where you would confirm which slugs still emit
--    static_fallback_serve. If not table-backed, read it from edge/console logs
--    instead. Left as a template; adjust the table name to your logging sink.
-- ----------------------------------------------------------------------------
-- SELECT slug, count(*) FROM your_event_log
-- WHERE evt = 'static_fallback_serve' AND ts > now() - interval '14 days'
-- GROUP BY slug ORDER BY count(*) DESC;
