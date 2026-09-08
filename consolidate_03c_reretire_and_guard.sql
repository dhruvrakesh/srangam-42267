-- consolidate_03c_reretire_and_guard.sql   ·  2026-09-07
--
-- 03b section 2 inserted zero rows. Not because of the three lengths it joined
-- on - those are exactly right - but because it required l.status = 'draft'.
-- All three losers are PUBLISHED. They were draft at 11:15 today and published
-- by 12:56, so the retirement was reverted by something in between and the site
-- is serving three articles twice.
--
-- Winner is now chosen by AGE, not by status. The older row keeps its id and
-- every foreign key pointing at it; the newer row is the re-import. That rule
-- reproduces the same three winners the created_at evidence gave on 2026-09-06
-- (originals 2025-11-09/10; all three duplicates landed 2026-02-01 within 100
-- seconds of each other, one bad bulk run).
--
-- Section 4 is the part that makes this stick. Recording a merge that nothing
-- enforces is what let this revert silently.
--
-- Idempotent. Nothing is deleted. No transaction wrapper. Verify SELECT last.

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
ALTER TABLE srangam_article_merges ENABLE ROW LEVEL SECURITY;

-- === 2. record the three pairs, winner = older row =========================
-- w.created_at < l.created_at both picks the winner and stops each pair from
-- being emitted twice. The >= 20000 floor cannot catch a blurb: the collision
-- census run at 12:56 shows exactly three colliding lengths in the corpus,
-- all above 34,000.
INSERT INTO srangam_article_merges
       (winner_id, loser_id, winner_slug, loser_slug, loser_alias, reason)
SELECT w.id, l.id, w.slug, l.slug, l.slug_alias,
       'Byte-identical English body (' || length(COALESCE(w.content::jsonb ->> 'en',''))
         || ' chars). Winner created ' || to_char(w.created_at,'YYYY-MM-DD HH24:MI:SS')
         || '; loser created ' || to_char(l.created_at,'YYYY-MM-DD HH24:MI:SS')
         || '. Older row wins so its id and foreign keys survive. Recorded '
         || '2026-09-07 after BOTH copies were found published - an earlier '
         || 'retirement had been reverted.'
FROM srangam_articles w
JOIN srangam_articles l
  ON length(COALESCE(l.content::jsonb ->> 'en',''))
   = length(COALESCE(w.content::jsonb ->> 'en',''))
 AND w.created_at < l.created_at
WHERE length(COALESCE(w.content::jsonb ->> 'en','')) >= 20000
ON CONFLICT (loser_id) DO NOTHING;

-- === 3. retire every recorded loser ========================================
UPDATE srangam_articles a
   SET status = 'draft', updated_at = now()
  FROM srangam_article_merges m
 WHERE a.id = m.loser_id
   AND a.status <> 'draft';

-- === 4. the guard - make the decision outlive whoever reverts it ===========
CREATE OR REPLACE FUNCTION srangam_block_publishing_merged_losers()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  IF NEW.status = 'published'
     AND EXISTS (SELECT 1 FROM srangam_article_merges m WHERE m.loser_id = NEW.id)
  THEN
    RAISE EXCEPTION
      'Article % is recorded in srangam_article_merges as a duplicate of another '
      'article and cannot be published. If that is wrong, DELETE its row from '
      'srangam_article_merges first - deliberately, not by accident.', NEW.slug;
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_srangam_block_publishing_merged_losers ON srangam_articles;
CREATE TRIGGER trg_srangam_block_publishing_merged_losers
  BEFORE INSERT OR UPDATE OF status ON srangam_articles
  FOR EACH ROW EXECUTE FUNCTION srangam_block_publishing_merged_losers();

-- === 5. VERIFY - the only result the editor shows ==========================
SELECT length(COALESCE(w.content::jsonb ->> 'en','')) AS chars,
       m.winner_slug, w.status AS winner_status, w.created_at::date AS winner_born,
       m.loser_slug,  l.status AS loser_status,  l.created_at::date AS loser_born,
       CASE WHEN w.status = 'published' AND l.status = 'draft'
            THEN 'OK' ELSE '### CHECK ME ###' END AS verdict
FROM srangam_article_merges m
JOIN srangam_articles w ON w.id = m.winner_id
JOIN srangam_articles l ON l.id = m.loser_id
ORDER BY chars DESC;
-- EXPECT 4 rows, all OK: 113821 (geomythology), 54798, 36359, 34178.
-- Check winner_born is 2025-11 and loser_born 2026-02-01 on the last three.