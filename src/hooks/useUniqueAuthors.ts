import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuthorInfo {
  name: string;
  count: number;
}

export function useUniqueAuthors() {
  return useQuery({
    queryKey: ['unique-authors'],
    queryFn: async (): Promise<AuthorInfo[]> => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('author');
      
      if (error) throw error;
      
      // Count occurrences and get unique authors
      const authorCounts = (data || []).reduce((acc, { author }) => {
        if (author) {
          acc[author] = (acc[author] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to array sorted by count (descending)
      return Object.entries(authorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
