import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { resolveOceanicArticle, type ResolvedArticle } from '@/lib/articleResolver';
import { useArticleBibliographyBySlug } from '@/hooks/useArticleBibliography';
import { resolveArticleId } from '@/lib/slugResolver';

/**
 * Phase 1.4: Unified article data hook
 * Fetches article, bibliography, and cross-references in parallel
 */

export interface CrossReference {
  id: string;
  reference_type: string;
  strength: number | null;
  context_description: Record<string, unknown> | null;
  target: {
    slug: string;
    slug_alias: string | null;
    title: Record<string, string> | null;
    read_time_minutes: number | null;
  } | null;
}

export interface UseArticleResult {
  article: ResolvedArticle | null | undefined;
  bibliography: Awaited<ReturnType<typeof useArticleBibliographyBySlug>>['data'];
  crossReferences: CrossReference[] | undefined;
  isLoading: boolean;
  isArticleLoading: boolean;
  isBibliographyLoading: boolean;
  isCrossRefsLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useArticle(slug: string | undefined): UseArticleResult {
  // Main article query
  const articleQuery = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      if (!slug) return null;
      return resolveOceanicArticle(slug);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  // Bibliography query (uses existing hook)
  const bibliographyQuery = useArticleBibliographyBySlug(slug);
  
  // Cross-references query
  const crossReferencesQuery = useQuery({
    queryKey: ['article-cross-refs', slug],
    queryFn: async (): Promise<CrossReference[]> => {
      if (!slug) return [];
      
      const resolved = await resolveArticleId(slug);
      if (!resolved) return [];
      
      const { data, error } = await supabase
        .from('srangam_cross_references')
        .select(`
          id,
          reference_type,
          strength,
          context_description,
          target:srangam_articles!target_article_id(slug, slug_alias, title, read_time_minutes)
        `)
        .eq('source_article_id', resolved.id)
        .order('strength', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('[useArticle] Cross-refs error:', error);
        return [];
      }
      
      return (data || []) as CrossReference[];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return {
    article: articleQuery.data,
    bibliography: bibliographyQuery.data,
    crossReferences: crossReferencesQuery.data,
    isLoading: articleQuery.isLoading,
    isArticleLoading: articleQuery.isLoading,
    isBibliographyLoading: bibliographyQuery.isLoading,
    isCrossRefsLoading: crossReferencesQuery.isLoading,
    error: articleQuery.error?.message || null,
    refetch: () => {
      articleQuery.refetch();
      bibliographyQuery.refetch();
      crossReferencesQuery.refetch();
    },
  };
}
