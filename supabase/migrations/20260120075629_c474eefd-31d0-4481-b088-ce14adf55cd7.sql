-- Phase 1: Add word_count column for ScholarlyArticle schema support
ALTER TABLE srangam_articles 
ADD COLUMN IF NOT EXISTS word_count INTEGER;

COMMENT ON COLUMN srangam_articles.word_count IS 
  'Word count for ScholarlyArticle schema and reading analytics';