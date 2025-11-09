-- Fix cross-reference constraints to match edge function logic
-- This allows same_theme and explicit_citation reference types
-- and expands strength range from 1-5 to 1-10

-- Drop existing constraints
ALTER TABLE srangam_cross_references 
DROP CONSTRAINT IF EXISTS srangam_cross_references_reference_type_check;

ALTER TABLE srangam_cross_references 
DROP CONSTRAINT IF EXISTS srangam_cross_references_strength_check;

-- Add new constraints with expanded values
ALTER TABLE srangam_cross_references
ADD CONSTRAINT srangam_cross_references_reference_type_check
CHECK (reference_type = ANY (ARRAY[
  'thematic',           -- Tag/topic similarity
  'same_theme',         -- Same theme category (NEW - used by edge function)
  'explicit_citation',  -- Direct text reference (NEW - used by edge function)
  'methodological',     -- Same research method
  'geographical',       -- Same location
  'temporal',           -- Same time period
  'contradictory',      -- Opposing viewpoints
  'supporting',         -- Supporting evidence
  'prerequisite'        -- Background reading
]));

-- Expand strength range to 1-10 (was 1-5)
-- Edge function uses: tag similarity (4-10), same_theme (7), explicit_citation (10)
ALTER TABLE srangam_cross_references
ADD CONSTRAINT srangam_cross_references_strength_check
CHECK (strength >= 1 AND strength <= 10);

-- Add helpful comments
COMMENT ON CONSTRAINT srangam_cross_references_reference_type_check 
ON srangam_cross_references 
IS 'Allows edge function to use same_theme and explicit_citation types for automatic cross-reference detection';

COMMENT ON CONSTRAINT srangam_cross_references_strength_check 
ON srangam_cross_references 
IS 'Strength range 1-10 to support granular scoring (tag similarity uses up to 10 based on number of shared tags)';