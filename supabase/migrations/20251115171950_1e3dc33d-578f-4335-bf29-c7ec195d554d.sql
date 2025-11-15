-- Create analytics function for Puranic references
CREATE OR REPLACE FUNCTION get_purana_statistics()
RETURNS TABLE(
  purana_name TEXT,
  purana_category TEXT,
  citation_count BIGINT,
  avg_confidence NUMERIC,
  article_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.purana_name,
    pr.purana_category,
    COUNT(*)::BIGINT as citation_count,
    ROUND(AVG(pr.confidence_score), 2) as avg_confidence,
    COUNT(DISTINCT pr.article_id)::BIGINT as article_count
  FROM srangam_purana_references pr
  GROUP BY pr.purana_name, pr.purana_category
  ORDER BY citation_count DESC;
END;
$$;