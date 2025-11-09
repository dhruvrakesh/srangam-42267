-- Migration: Update cross-reference constraints to match edge function logic

-- 1. Drop existing check constraints
ALTER TABLE srangam_cross_references 
DROP CONSTRAINT IF EXISTS srangam_cross_references_reference_type_check;

ALTER TABLE srangam_cross_references 
DROP CONSTRAINT IF EXISTS srangam_cross_references_strength_check;

-- 2. Add new constraints with expanded values
ALTER TABLE srangam_cross_references
ADD CONSTRAINT srangam_cross_references_reference_type_check
CHECK (reference_type = ANY (ARRAY[
  'thematic',           -- Tag/topic similarity
  'same_theme',         -- Same theme category (NEW)
  'explicit_citation',  -- Direct text reference (NEW)
  'methodological',     -- Same research method
  'geographical',       -- Same location
  'temporal',           -- Same time period
  'contradictory',      -- Opposing viewpoints
  'supporting',         -- Supporting evidence
  'prerequisite'        -- Background reading
]));

-- 3. Expand strength range to 1-10 (was 1-5)
ALTER TABLE srangam_cross_references
ADD CONSTRAINT srangam_cross_references_strength_check
CHECK (strength >= 1 AND strength <= 10);

COMMENT ON CONSTRAINT srangam_cross_references_reference_type_check 
ON srangam_cross_references 
IS 'Supports automated cross-reference detection including theme-based and citation-based links';

COMMENT ON CONSTRAINT srangam_cross_references_strength_check 
ON srangam_cross_references 
IS 'Expanded to 1-10 scale for granular relationship strength scoring';