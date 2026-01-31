import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BibliographyEntry {
  id: string;
  citation_key: string;
  entry_type: string;
  authors: { first: string; last: string }[] | null;
  title: Record<string, string> | null;
  year: number | null;
  publisher: string | null;
  full_citation_mla: string | null;
  full_citation_apa: string | null;
  tags: string[] | null;
}

export interface ArticleBibliographyLink {
  id: string;
  is_primary_source: boolean | null;
  citation_context: string | null;
  bibliography: BibliographyEntry;
}

export function useArticleBibliography(articleId: string | undefined) {
  return useQuery({
    queryKey: ['article-bibliography', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      
      const { data, error } = await supabase
        .from('srangam_article_bibliography')
        .select(`
          id,
          is_primary_source,
          citation_context,
          bibliography:srangam_bibliography_entries(
            id,
            citation_key,
            entry_type,
            authors,
            title,
            year,
            publisher,
            full_citation_mla,
            full_citation_apa,
            tags
          )
        `)
        .eq('article_id', articleId);
      
      if (error) {
        console.error('Error fetching article bibliography:', error);
        return [];
      }
      
      // Transform and filter valid entries
      return (data || [])
        .filter(item => item.bibliography)
        .map(item => ({
          id: item.id,
          is_primary_source: item.is_primary_source,
          citation_context: item.citation_context,
          bibliography: item.bibliography as unknown as BibliographyEntry,
        })) as ArticleBibliographyLink[];
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useArticleBibliographyBySlug(slug: string | undefined) {
  // Phase 19c: Use centralized slug resolver instead of sequential queries
  const { data: resolved } = useQuery({
    queryKey: ['article-slug-resolved', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Single OR query via centralized resolver
      const { resolveArticleId } = await import('@/lib/slugResolver');
      return resolveArticleId(slug);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  return useArticleBibliography(resolved?.id);
}
