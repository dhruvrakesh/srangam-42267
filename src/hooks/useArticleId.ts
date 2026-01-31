import { useQuery } from '@tanstack/react-query';
import { resolveArticleId } from '@/lib/slugResolver';

/**
 * Hook to resolve article slug to database ID
 * 
 * Phase 19c: Uses centralized slug resolver with single OR query
 * instead of sequential queries for better performance.
 * 
 * @param slug - The slug or slug_alias to resolve
 * @returns Query result with article ID
 */
export function useArticleId(slug: string | undefined) {
  return useQuery({
    queryKey: ['article-id', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Phase 19c: Single OR query via centralized resolver
      const resolved = await resolveArticleId(slug);
      return resolved?.id || null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to get full slug resolution data
 * Returns id, slug, and slug_alias
 */
export function useResolvedSlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['resolved-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      return resolveArticleId(slug);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
