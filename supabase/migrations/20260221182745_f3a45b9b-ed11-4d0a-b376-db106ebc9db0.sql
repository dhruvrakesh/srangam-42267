
-- Phase E1: Server-Side Full-Text Search (trigger-based approach)

-- 1. Add tsvector column (plain, not generated)
ALTER TABLE srangam_articles 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create function to update search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION srangam_update_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title->>'en', '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.dek->>'en', '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.theme, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.author, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.slug, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'A');
  RETURN NEW;
END;
$$;

-- 3. Create trigger
CREATE TRIGGER trg_srangam_articles_search_vector
  BEFORE INSERT OR UPDATE ON srangam_articles
  FOR EACH ROW
  EXECUTE FUNCTION srangam_update_search_vector();

-- 4. Backfill existing rows
UPDATE srangam_articles SET updated_at = updated_at;

-- 5. GIN index for fast full-text lookup
CREATE INDEX IF NOT EXISTS idx_srangam_articles_search_vector 
ON srangam_articles USING gin(search_vector);

-- 6. RPC function for frontend full-text search
CREATE OR REPLACE FUNCTION srangam_search_articles_fulltext(
  search_query text,
  result_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  slug text,
  title jsonb,
  dek jsonb,
  theme text,
  tags text[],
  author text,
  published_date date,
  read_time_minutes integer,
  og_image_url text,
  rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.title,
    a.dek,
    a.theme,
    a.tags,
    a.author,
    a.published_date,
    a.read_time_minutes,
    a.og_image_url,
    ts_rank(a.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM srangam_articles a
  WHERE
    a.status = 'published'
    AND (
      a.search_vector @@ websearch_to_tsquery('english', search_query)
      OR a.title->>'en' ILIKE '%' || search_query || '%'
      OR a.slug ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$;
