import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseArticle {
  id: string;
  slug: string;
  title: any;
  dek: any;
  theme: string;
  author: string;
  tags: string[];
  read_time_minutes: number;
  published_date: string;
  content: any;
}

export const usePublishedArticles = () => {
  return useQuery({
    queryKey: ['published-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, title, dek, theme, author, tags, read_time_minutes, published_date, content')
        .eq('status', 'published')
        .order('published_date', { ascending: false });

      if (error) throw error;
      return (data || []) as DatabaseArticle[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
