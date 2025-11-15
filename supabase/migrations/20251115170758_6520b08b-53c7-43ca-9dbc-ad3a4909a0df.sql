-- Create srangam_purana_references table for systematic Puranic citation tracking
CREATE TABLE IF NOT EXISTS public.srangam_purana_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
  
  -- Puranic text identification
  purana_name TEXT NOT NULL,
  purana_category TEXT CHECK (purana_category IN ('Mahapurana', 'Upapurana', 'Itihasa', 'Veda', 'Agama', 'Other')),
  
  -- Citation specifics
  kanda TEXT, -- Book/Kanda
  adhyaya TEXT, -- Chapter
  shloka_start INTEGER, -- Verse start
  shloka_end INTEGER, -- Verse end (for ranges)
  reference_text TEXT, -- Original citation as written
  
  -- Context
  context_snippet TEXT, -- Surrounding text from article
  claim_made TEXT, -- What claim this citation supports
  
  -- Validation & confidence
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'verified', 'disputed', 'rejected')),
  is_primary_source BOOLEAN DEFAULT true,
  
  -- Metadata
  extraction_method TEXT DEFAULT 'ai' CHECK (extraction_method IN ('ai', 'manual')),
  extracted_by UUID, -- user_id if manual
  validation_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_purana_refs_article ON public.srangam_purana_references(article_id);
CREATE INDEX idx_purana_refs_name ON public.srangam_purana_references(purana_name);
CREATE INDEX idx_purana_refs_category ON public.srangam_purana_references(purana_category);
CREATE INDEX idx_purana_refs_confidence ON public.srangam_purana_references(confidence_score DESC);
CREATE INDEX idx_purana_refs_validation ON public.srangam_purana_references(validation_status);
CREATE INDEX idx_purana_refs_created ON public.srangam_purana_references(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_purana_refs_article_confidence ON public.srangam_purana_references(article_id, confidence_score DESC);

-- Enable RLS
ALTER TABLE public.srangam_purana_references ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read purana references"
  ON public.srangam_purana_references
  FOR SELECT
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated insert purana references"
  ON public.srangam_purana_references
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated update purana references"
  ON public.srangam_purana_references
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only admins can delete
CREATE POLICY "Admins delete purana references"
  ON public.srangam_purana_references
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_purana_references_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purana_references_updated_at
  BEFORE UPDATE ON public.srangam_purana_references
  FOR EACH ROW
  EXECUTE FUNCTION public.update_purana_references_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.srangam_purana_references IS 'Systematic tracking of Puranic citations in articles with AI-powered extraction and confidence scoring';