-- Create srangam_article_evidence table for structured evidence from 6-column scholarly tables
CREATE TABLE public.srangam_article_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
  date_approx TEXT,
  place TEXT,
  actors TEXT[],
  event_description TEXT,
  significance TEXT,
  source_quality TEXT CHECK (source_quality IN ('primary', 'secondary', 'tradition')),
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.srangam_article_evidence ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (articles are public)
CREATE POLICY "Evidence is publicly readable" 
ON public.srangam_article_evidence 
FOR SELECT 
USING (true);

-- Service role can insert/update/delete (for edge functions)
CREATE POLICY "Service role can manage evidence" 
ON public.srangam_article_evidence 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_article_evidence_article_id ON public.srangam_article_evidence(article_id);
CREATE INDEX idx_article_evidence_place ON public.srangam_article_evidence(place);
CREATE INDEX idx_article_evidence_source_quality ON public.srangam_article_evidence(source_quality);

-- Add comment for documentation
COMMENT ON TABLE public.srangam_article_evidence IS 'Structured evidence data extracted from 6-column scholarly tables in article markdown';