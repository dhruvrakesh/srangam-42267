import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ArticleEvidence {
  id: string;
  article_id: string;
  date_approx: string | null;
  place: string | null;
  actors: string[] | null;
  event_description: string | null;
  significance: string | null;
  source_quality: 'primary' | 'secondary' | 'tradition' | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export function useArticleEvidence(articleId: string | undefined) {
  return useQuery({
    queryKey: ['article-evidence', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      
      const { data, error } = await supabase
        .from('srangam_article_evidence')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching article evidence:', error);
        return [];
      }
      
      return (data || []) as ArticleEvidence[];
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useArticleEvidenceBySlug(slug: string | undefined) {
  // First resolve slug to article ID
  const { data: article } = useQuery({
    queryKey: ['article-id-from-slug-evidence', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Try slug_alias first, then slug
      let { data } = await supabase
        .from('srangam_articles')
        .select('id')
        .eq('slug_alias', slug)
        .maybeSingle();
      
      if (!data) {
        const result = await supabase
          .from('srangam_articles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        data = result.data;
      }
      
      return data;
    },
    enabled: !!slug,
  });
  
  return useArticleEvidence(article?.id);
}
