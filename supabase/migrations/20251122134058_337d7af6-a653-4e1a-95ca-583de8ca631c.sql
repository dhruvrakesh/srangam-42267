-- Fix unique constraint to allow terms in multiple modules
-- This enables the same term (e.g. 'purana') to exist in different modules with different contexts

-- Drop the old constraint that only allows unique terms globally
ALTER TABLE srangam_cultural_terms 
DROP CONSTRAINT IF EXISTS srangam_cultural_terms_term_key;

-- Add new composite unique constraint on (term, module)
ALTER TABLE srangam_cultural_terms 
ADD CONSTRAINT srangam_cultural_terms_term_module_key 
UNIQUE (term, module);

-- Create index for performance on term lookups
CREATE INDEX IF NOT EXISTS idx_cultural_terms_term_module 
ON srangam_cultural_terms(term, module);