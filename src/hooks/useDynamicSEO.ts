import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SEOData {
  metaDescription: string;
  structuredData: any;
  articleCount: number;
}

export const useDynamicSEO = (filters: {
  themes?: string[];
  searchQuery?: string;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: ['article-seo', filters],
    queryFn: async (): Promise<SEOData> => {
      const { data, error } = await supabase.functions.invoke('generate-article-seo', {
        body: { currentFilters: filters }
      });

      if (error) {
        console.error('SEO generation failed:', error);
        // Fallback to static SEO
        return {
          metaDescription: 'Browse 56 scholarly articles on Ancient India, Maritime Trade, Sanskrit Literature, and Cultural Continuity. Peer-reviewed research with cross-references.',
          structuredData: null,
          articleCount: 56,
        };
      }

      return data as SEOData;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    enabled: true,
  });
};
