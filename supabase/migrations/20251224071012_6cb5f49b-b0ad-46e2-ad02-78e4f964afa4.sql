-- Correct article themes based on ARTICLE_METADATA mapping
-- Fix scripts-sailed-epigraphic-atlas: should be Scripts & Inscriptions
UPDATE public.srangam_articles 
SET theme = 'Scripts & Inscriptions', updated_at = now()
WHERE slug_alias = 'scripts-sailed-epigraphic-atlas';

-- Fix geomythology-cultural-continuity: should be Sacred Ecology (land reclamation themed)
UPDATE public.srangam_articles 
SET theme = 'Sacred Ecology', updated_at = now()
WHERE slug_alias = 'geomythology-cultural-continuity';

-- Fix ringing-rocks-rhythmic-cosmology: should be Geology & Deep Time (acoustic geology)
UPDATE public.srangam_articles 
SET theme = 'Geology & Deep Time', updated_at = now()
WHERE slug_alias = 'ringing-rocks-rhythmic-cosmology';