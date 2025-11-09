-- Phase 1: Create srangam_tags table for intelligent tag management
-- This enables AI-powered auto-tagging with usage tracking and relationship discovery

CREATE TABLE IF NOT EXISTS public.srangam_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name TEXT NOT NULL UNIQUE,
  category TEXT, -- e.g., 'period', 'dynasty', 'concept', 'location', 'methodology'
  usage_count INTEGER DEFAULT 0,
  related_tags JSONB DEFAULT '[]'::jsonb, -- Array of related tag names with co-occurrence scores
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT -- AI-generated description of what this tag represents
);

-- Enable RLS
ALTER TABLE public.srangam_tags ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can see tags)
CREATE POLICY "Tags are viewable by everyone"
ON public.srangam_tags
FOR SELECT
USING (true);

-- Only authenticated users can manage tags (for admin features)
CREATE POLICY "Authenticated users can insert tags"
ON public.srangam_tags
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
ON public.srangam_tags
FOR UPDATE
TO authenticated
USING (true);

-- Indexes for performance
CREATE INDEX idx_srangam_tags_name ON public.srangam_tags(tag_name);
CREATE INDEX idx_srangam_tags_usage ON public.srangam_tags(usage_count DESC);
CREATE INDEX idx_srangam_tags_category ON public.srangam_tags(category);

-- Function to update tag statistics when articles are inserted/updated
CREATE OR REPLACE FUNCTION public.update_tag_stats()
RETURNS TRIGGER AS $$
DECLARE
  tag_item TEXT;
BEGIN
  -- Process each tag in the new tags array
  IF NEW.tags IS NOT NULL THEN
    FOREACH tag_item IN ARRAY NEW.tags
    LOOP
      -- Insert or update tag statistics
      INSERT INTO public.srangam_tags (tag_name, usage_count, last_used)
      VALUES (tag_item, 1, now())
      ON CONFLICT (tag_name) 
      DO UPDATE SET
        usage_count = srangam_tags.usage_count + 1,
        last_used = now();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update tag stats when articles are created/updated
CREATE TRIGGER trigger_update_tag_stats
AFTER INSERT OR UPDATE OF tags ON public.srangam_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_tag_stats();

-- Function to analyze tag co-occurrence for relationship discovery
CREATE OR REPLACE FUNCTION public.analyze_tag_cooccurrence()
RETURNS TABLE(tag1 TEXT, tag2 TEXT, cooccurrence_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH tag_pairs AS (
    SELECT 
      unnest(tags) as tag1,
      unnest(tags) as tag2
    FROM public.srangam_articles
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 1
  )
  SELECT 
    tp.tag1,
    tp.tag2,
    COUNT(*) as cooccurrence_count
  FROM tag_pairs tp
  WHERE tp.tag1 < tp.tag2  -- Avoid duplicates (A,B) vs (B,A)
  GROUP BY tp.tag1, tp.tag2
  HAVING COUNT(*) > 1  -- Only pairs that occur together more than once
  ORDER BY cooccurrence_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.srangam_tags IS 'Intelligent tag registry with usage tracking and AI-powered relationship discovery';
COMMENT ON FUNCTION public.update_tag_stats() IS 'Auto-increments tag usage and updates last_used timestamp when articles are tagged';
COMMENT ON FUNCTION public.analyze_tag_cooccurrence() IS 'Analyzes which tags frequently appear together for smart tag suggestions';