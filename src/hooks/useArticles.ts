import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedLanguage } from '@/types/multilingual';

export interface DatabaseArticle {
  id: string;
  slug: string;
  title: { [key: string]: string };
  dek: { [key: string]: string } | null;
  content: { [key: string]: string };
  theme: string;
  tags: string[] | null;
  status: string;
  read_time_minutes: number | null;
  author: string;
  published_date: string;
  created_at: string;
}

export interface DisplayArticle {
  id: string;
  title: { [key: string]: string } | string;
  excerpt: { [key: string]: string } | string;
  slug: string;
  theme: string;
  tags: Array<{ [key: string]: string } | string>;
  readTime: number;
  author: string;
  date: string;
  source: 'json' | 'database';
}

export const useAllArticles = (language: SupportedLanguage = 'en') => {
  return useQuery({
    queryKey: ['all-articles', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching database articles:', error);
        throw error;
      }
      
      // Transform to DisplayArticle format
      return data.map((article): DisplayArticle => {
        const title = typeof article.title === 'object' && article.title !== null
          ? article.title as { [key: string]: string }
          : { en: String(article.title || '') };
        
        const excerpt = article.dek && typeof article.dek === 'object'
          ? article.dek as { [key: string]: string }
          : { en: '' };
        
        return {
          id: article.id,
          slug: `/articles/${article.slug}`,
          title,
          excerpt,
          theme: article.theme,
          tags: (article.tags || []).map(tag => ({ en: String(tag) })),
          readTime: article.read_time_minutes || 10,
          author: article.author,
          date: article.published_date,
          source: 'database' as const
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
