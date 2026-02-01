import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Phase 1.2: Server-side pagination for article lists
 * Reduces initial load from full table to paginated chunks
 */

export interface PaginationOptions {
  page: number;
  pageSize: number;
  theme?: string;
  status?: 'published' | 'draft' | 'archived';
  searchQuery?: string;
}

export interface PaginatedArticle {
  id: string;
  slug: string;
  slug_alias: string | null;
  title: Record<string, string> | null;
  theme: string;
  author: string;
  status: string;
  tags: string[] | null;
  published_date: string;
  created_at: string;
  updated_at: string;
  read_time_minutes: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useArticlesPaginated(options: PaginationOptions) {
  return useQuery({
    queryKey: ['articles-paginated', options],
    queryFn: async (): Promise<PaginatedResult<PaginatedArticle>> => {
      const from = options.page * options.pageSize;
      const to = from + options.pageSize - 1;
      
      let query = supabase
        .from('srangam_articles')
        .select(
          'id, slug, slug_alias, title, theme, author, status, tags, published_date, created_at, updated_at, read_time_minutes', 
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to);
      
      // Apply filters
      if (options.theme) {
        query = query.eq('theme', options.theme);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.searchQuery && options.searchQuery.trim()) {
        query = query.ilike('title->>en', `%${options.searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('[useArticlesPaginated] Query error:', error);
        throw error;
      }
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / options.pageSize);
      
      return {
        data: (data as PaginatedArticle[]) || [],
        totalCount,
        totalPages,
        currentPage: options.page,
        hasNextPage: to < totalCount - 1,
        hasPreviousPage: options.page > 0,
      };
    },
    staleTime: 30 * 1000,
  });
}
