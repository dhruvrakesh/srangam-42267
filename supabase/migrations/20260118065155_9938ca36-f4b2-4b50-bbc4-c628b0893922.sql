-- Phase 1: Fix Baba Ala Singh article excerpt
UPDATE srangam_articles 
SET dek = jsonb_set(
  COALESCE(dek, '{}'::jsonb),
  '{en}',
  '"A scholarly reconstruction of Baba Ala Singh (1691–1765), founder of the Phulkian dynasty and Patiala state, examining his strategic alliances with Ahmad Shah Abdali through primary sources, chronicles, and oral traditions."'::jsonb
)
WHERE slug_alias = 'baba-ala-singh-patiala';

-- Phase 4: Mark stub articles as draft (content < 200 chars)
UPDATE srangam_articles 
SET status = 'draft',
    updated_at = NOW()
WHERE LENGTH(content::text) < 200
AND status = 'published';

-- Add a comment to track this change
COMMENT ON TABLE srangam_articles IS 'Articles table. Stub articles (< 200 chars) marked as draft via Phase 4 fix on 2026-01-18.';