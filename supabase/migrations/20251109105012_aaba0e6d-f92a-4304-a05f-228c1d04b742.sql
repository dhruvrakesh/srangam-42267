-- Migration: Add unique constraint for markdown sources to enable proper upsert
ALTER TABLE srangam_markdown_sources
ADD CONSTRAINT srangam_markdown_sources_article_id_unique 
UNIQUE (article_id);

COMMENT ON CONSTRAINT srangam_markdown_sources_article_id_unique 
ON srangam_markdown_sources 
IS 'Ensures each article has only one markdown source (enables upsert and prevents 42P10 error)';