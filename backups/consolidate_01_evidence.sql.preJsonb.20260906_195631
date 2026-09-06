-- consolidate_01_evidence.sql  ·  2026-09-06  ·  READS ONLY, WRITES NOTHING
--
-- Run this FIRST, in the Supabase SQL editor (via Lovable Cloud — the editor is
-- privileged and therefore sees drafts; the anon key never can).
--
-- WHY
-- The 58-row inventory export carries slug, alias, status and a language LIST.
-- It does not carry titles or body lengths, so it cannot answer the only two
-- questions consolidation actually turns on:
--     (a) are these two rows the same article?
--     (b) which of them holds the better body?
-- Every query below produces a NUMBER for those questions. Nothing is merged,
-- published or deleted anywhere in this file.
--
-- Reconciliation already computed from the inventory (2026-09-06), for context:
--     parity report says 24 registry articles are "MISSING IN DB"
--        9 exist as DRAFTS (exact slug match)
--       10 exist PUBLISHED under another slug (canonicalSlugMap.ts)
--        5 are genuinely absent
--   so Master Plan Q2's "import 13" is really "import 5, publish 8".


-- ─── 1 ─────────────────────────────────────────────────────────────────────
-- Every row, with title and per-language body length. This is the table the
-- rest of the plan is decided from. Export it as docs/db_evidence.csv.
SELECT
  a.id,
  a.slug,
  COALESCE(a.slug_alias, '')                                    AS slug_alias,
  a.status,
  left(COALESCE(a.title, ''), 90)                               AS title,
  COALESCE(
    (SELECT string_agg(e.key || '=' || length(e.val), ' ' ORDER BY e.key)
       FROM jsonb_each_text(COALESCE(a.content::jsonb, '{}'::jsonb)) AS e(key, val)
      WHERE length(btrim(COALESCE(e.val, ''))) > 0),
    '(no body)')                                                AS lang_lengths,
  length(COALESCE(a.content::jsonb ->> 'en', ''))               AS en_chars,
  a.updated_at
FROM srangam_articles a
ORDER BY length(COALESCE(a.content::jsonb ->> 'en', '')) DESC;


-- ─── 2 ─────────────────────────────────────────────────────────────────────
-- The 9 drafts, with body size. Decides Step B (publish) vs Step C (merge).
-- All 9 were inserted in one batch at 2026-02-21 18:27:44.512333+00.
SELECT slug, COALESCE(slug_alias,'') AS slug_alias,
       left(COALESCE(title,''), 80)  AS title,
       length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       (SELECT count(*) FROM jsonb_each_text(COALESCE(content::jsonb,'{}'::jsonb)) e(k,v)
         WHERE length(btrim(v)) > 0)                AS n_langs,
       created_at, updated_at
FROM srangam_articles
WHERE status <> 'published'
ORDER BY en_chars DESC;


-- ─── 3 ─────────────────────────────────────────────────────────────────────
-- The duplicate candidates. Four pairs were found by token-overlap on the
-- slug_alias column (aliases are undamaged; raw slugs are not — see §5).
-- 'scripts-that-sailed' vs 'scripts-sailed-epigraphic-atlas' is listed for
-- completeness and is EXPECTED to be a false positive: Part I and Part II are
-- different articles. Confirm each pair on TITLE and LENGTH before merging.
SELECT id, slug, COALESCE(slug_alias,'') AS slug_alias, status,
       left(COALESCE(title,''),100) AS title,
       length(COALESCE(content::jsonb ->> 'en','')) AS en_chars,
       created_at, updated_at
FROM srangam_articles
WHERE slug_alias IN (
        'janajatiya-oral-traditions', 'janajatiya-traditions-oral-continuities',  -- pair 1
        'vedic-preservation-sarira',  'sarira-atman-preservation-vedas',          -- pair 2
        'vishnu-shiva-hari-hara',     'vishnu-shiva-interplay',                   -- pair 3
        'scripts-that-sailed',        'scripts-sailed-epigraphic-atlas',          -- expected FALSE positive
        'geomythology-land-reclamation','geomythology-cultural-continuity'        -- pair 4 (CONFIRMED, draft vs published)
      )
   OR slug IN ('geomythology-land-reclamation','scripts-that-sailed')
ORDER BY COALESCE(slug_alias, slug), en_chars DESC;


-- ─── 4 ─────────────────────────────────────────────────────────────────────
-- What would BREAK if a row were deleted. Run before any merge.
-- If a table below does not exist in this project, delete that block and re-run
-- rather than guessing — an empty result and a missing table look identical in
-- a report but mean opposite things.
SELECT 'article_pins'    AS ref, article_id, count(*) FROM srangam_article_pins    GROUP BY 1,2
UNION ALL
SELECT 'article_versions', article_id, count(*) FROM srangam_article_versions GROUP BY 1,2
ORDER BY 3 DESC;


-- ─── 5 ─────────────────────────────────────────────────────────────────────
-- Slug health. Measured from the inventory: 39 of 58 slugs are damaged
-- (diacritics dropped to nothing by the importer's slugifier, .docx leaked
-- into the slug, a stray leading 'x', numeric suffixes, one 'untitled-article'),
-- and ALL 39 already carry a clean slug_alias.
--
-- That last fact is the important one: the alias layer is complete mitigation,
-- articleResolver.ts resolves alias-first, so NO USER EVER SEES A DAMAGED SLUG.
-- Renaming these slugs is therefore cosmetic, and it is the single most
-- dangerous thing in this plan (it breaks existing URLs and any external link).
-- DO NOT rename them. This query exists to prove the alias coverage holds.
SELECT count(*) FILTER (WHERE slug_alias IS NULL OR btrim(slug_alias) = '') AS rows_without_alias,
       count(*)                                                             AS total_rows,
       count(DISTINCT slug_alias)                                           AS distinct_aliases
FROM srangam_articles;


-- ─── 6 ─────────────────────────────────────────────────────────────────────
-- Multilingual reality. The inventory says 3 of 58 rows have more than one
-- language. Confirm, and see how much non-English text actually exists.
SELECT count(*)                                              AS rows_total,
       count(*) FILTER (WHERE n > 1)                         AS rows_multilingual,
       sum(non_en_chars)                                     AS non_english_chars_in_db
FROM (
  SELECT a.id,
         (SELECT count(*) FROM jsonb_each_text(COALESCE(a.content::jsonb,'{}'::jsonb)) e(k,v)
           WHERE length(btrim(v)) > 0)                       AS n,
         (SELECT COALESCE(sum(length(v)),0) FROM jsonb_each_text(COALESCE(a.content::jsonb,'{}'::jsonb)) e(k,v)
           WHERE k <> 'en' AND length(btrim(v)) > 0)         AS non_en_chars
  FROM srangam_articles a
) s;
