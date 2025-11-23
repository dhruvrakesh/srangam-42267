import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to resolve article slug to database ID
 * Handles both 'slug' and 'slug_alias' fields for flexibility
 */
export function useArticleId(slug: string | undefined) {
  return useQuery({
    queryKey: ['article-id', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Try matching by slug first
      const { data: bySlug } = await supabase
        .from('srangam_articles')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (bySlug) return bySlug.id;
      
      // Fallback to slug_alias
      const { data: byAlias } = await supabase
        .from('srangam_articles')
        .select('id')
        .eq('slug_alias', slug)
        .maybeSingle();
      
      return byAlias?.id || null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
