-- consolidate_03b_merges_repair.sql
-- Written 2026-09-07 after part 05 failed with:
--     ERROR: 42P01: relation "srangam_article_merges" does not exist
--
-- WHY IT FAILED, and the more interesting thing it revealed
-- ---------------------------------------------------------------------------
-- Part 04 carries its own CREATE TABLE IF NOT EXISTS and is self-sufficient.
-- Part 05 does not - it only INSERTs. That inconsistency is mine. Running the
-- parts out of order is not user error; a part that cannot stand alone should
-- not have been split out as if it could.
--
-- The failure exposed a second fact worth more than the first. The three
-- duplicate LOSERS are already status='draft' - the retirement was executed -
-- but the audit table does not exist, so NOTHING RECORDS WHY. Anyone opening
-- this database today finds three unexplained drafts holding 34k-54k characters
-- each and no reason not to "fix" them by republishing. The visible effect
-- landed and the explanation did not.
--
-- This file is idempotent and safe to run repeatedly. It creates the table,
-- back-records the three merges that already happened, and records + retires
-- the geomythology shell. Nothing is deleted; every step reverses with one
-- UPDATE. No transaction wrapper - each statement stands alone by design.
--
-- The SQL editor shows only the LAST result, so the verification SELECT is last.

-- === 1. the audit table (idempotent) ========================================
CREATE TABLE IF NOT EXISTS srangam_article_merges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id    uuid NOT NULL REFERENCES srangam_articles(id) ON DELETE RESTRICT,
  loser_id     uuid NOT NULL REFERENCES srangam_articles(id) ON DELETE RESTRICT,
  winner_slug  text NOT NULL,
  loser_slug   text NOT NULL,
  loser_alias  text,
  reason       text NOT NULL,
  merged_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT srangam_article_merges_loser_unique UNIQUE (loser_id),
  CONSTRAINT srangam_article_merges_not_self     CHECK (winner_id <> loser_id)
);

COMMENT ON TABLE srangam_article_merges IS
  'Duplicate reconciliation (Master Plan Q3). The loser is NOT deleted - it is '
  'set status=draft so it stops rendering, and this table records why. A resolver '
  'fallback can later use it to 301 the loser slug to the winner.';

ALTER TABLE srangam_article_merges ENABLE ROW LEVEL SECURITY;

-- === 2. back-record the three merges that already happened ==================
-- Matched on byte-identical English length, the same instrument that identified
-- them. Slug text is useless here: this importer strips diacritics to nothing,
-- so 'sarira' and 'ar-ra' are the same word. Hardcoding uuids would be brittle;
-- the join states the evidence instead.
--   54,798  the-celestial-bridge-...        <- shiva-bunjil-altair-connections
--   36,359  har-har-hari-hari-...           <- vishnu-shiva-hari-hara-revised-...
--   34,178  the-asura-exiles-...            <- deep-dive-indo-iranian-origins-...-2
INSERT INTO srangam_article_merges
       (winner_id, loser_id, winner_slug, loser_slug, loser_alias, reason)
SELECT w.id, l.id, w.slug, l.slug, l.slug_alias,
       'Q3/2026-09-06: byte-identical English body ('
         || length(w.content::jsonb ->> 'en')
         || ' chars). Loser created ' || to_char(l.created_at, 'YYYY-MM-DD HH24:MI:SS')
         || ' - all three losers landed within 100 seconds of each other in one bad '
         || 'bulk re-ingest. Retired to draft on 2026-09-06; back-recorded 2026-09-07 '
         || 'after the audit table was found missing.'
FROM srangam_articles w
JOIN srangam_articles l
  ON length(l.content::jsonb ->> 'en') = length(w.content::jsonb ->> 'en')
 AND l.id <> w.id
WHERE w.status = 'published'
  AND l.status = 'draft'
  AND length(w.content::jsonb ->> 'en') IN (54798, 36359, 34178)
ON CONFLICT (loser_id) DO NOTHING;

-- === 3. the geomythology shell (what part 05 was trying to do) ==============
-- The loser is a 60-char title shell; the winner holds 113,821 chars of the same
-- article per canonicalSlugMap.ts. Guarded so it can only ever match a shell.
INSERT INTO srangam_article_merges
       (winner_id, loser_id, winner_slug, loser_slug, loser_alias, reason)
SELECT w.id, l.id, w.slug, l.slug, l.slug_alias,
       'Q3/2026-09-06: loser is a ' || length(COALESCE(l.content::jsonb ->> 'en',''))
         || '-char shell; winner holds ' || length(w.content::jsonb ->> 'en')
         || ' chars of the same article per canonicalSlugMap.ts. Excluded from '
         || 'consolidate_02b deliberately: filling a shell that duplicates a live '
         || 'article creates a second copy instead of removing one.'
FROM srangam_articles w, srangam_articles l
WHERE w.slug_alias = 'geomythology-cultural-continuity'
  AND l.slug       = 'geomythology-land-reclamation'
  AND l.status <> 'published'
  AND length(COALESCE(l.content::jsonb ->> 'en','')) < 200
ON CONFLICT (loser_id) DO NOTHING;

-- === 4. make sure every recorded loser is actually retired ==================
-- Idempotent; a no-op if they are already draft (they are).
UPDATE srangam_articles a
   SET status = 'draft', updated_at = now()
  FROM srangam_article_merges m
 WHERE a.id = m.loser_id
   AND a.status <> 'draft';

-- === 5. VERIFY - the only result the editor will show =======================
SELECT m.merged_at::date                                   AS recorded,
       m.winner_slug,
       length(w.content::jsonb ->> 'en')                   AS winner_chars,
       w.status                                            AS winner_status,
       m.loser_slug,
       length(COALESCE(l.content::jsonb ->> 'en',''))      AS loser_chars,
       l.status                                            AS loser_status,
       CASE WHEN w.status = 'published' AND l.status = 'draft'
            THEN 'OK - winner live, loser retired and recorded'
            ELSE '### CHECK ME ###'
       END                                                 AS verdict
FROM srangam_article_merges m
JOIN srangam_articles w ON w.id = m.winner_id
JOIN srangam_articles l ON l.id = m.loser_id
ORDER BY winner_chars DESC;
-- EXPECT 4 rows, every verdict 'OK'.
--   celestial-bridge 54798 | har-har-hari-hari 36359 | asura-exiles 34178
--   | geomythology-cultural-continuity 113821 (loser 60 chars)
-- FEWER THAN 4 means a join found no match - send me the output, do not retry.
