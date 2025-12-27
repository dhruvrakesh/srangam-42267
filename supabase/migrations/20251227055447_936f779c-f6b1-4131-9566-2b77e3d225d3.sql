-- Fix SECURITY DEFINER functions with missing search_path
-- This prevents search path injection attacks

-- Fix analyze_tag_cooccurrence (no arguments)
ALTER FUNCTION public.analyze_tag_cooccurrence() 
SET search_path = 'public';

-- Fix get_purana_statistics (no arguments)
ALTER FUNCTION public.get_purana_statistics() 
SET search_path = 'public';

-- Fix srangam_increment_bibliography_usage (no arguments)
ALTER FUNCTION public.srangam_increment_bibliography_usage() 
SET search_path = 'public';

-- Fix update_tag_stats (no arguments)
ALTER FUNCTION public.update_tag_stats() 
SET search_path = 'public';

-- Also fix srangam_increment_term_usage (takes text argument)
ALTER FUNCTION public.srangam_increment_term_usage(text) 
SET search_path = 'public';