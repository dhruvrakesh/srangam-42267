import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { searchArticles } from "@/lib/searchEngine";
import { useLanguage } from "@/components/language/LanguageProvider";

interface SearchResultItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  theme: string;
  tags: string[];
  readTime?: number;
  author?: string;
  date?: string;
  score: number;
  matchedContent?: any[];
  matchType: string;
  source: 'json' | 'database';
}

interface UseSearchArticlesOptions {
  theme?: string;
  limit?: number;
  minScore?: number;
  useBoolean?: boolean;
  searchField?: 'all' | 'title' | 'content' | 'tags' | 'cultural-terms';
  enabled?: boolean;
}

export function useSearchArticles(query: string, options: UseSearchArticlesOptions = {}) {
  const { currentLanguage } = useLanguage();
  const { theme = 'all', limit = 20, minScore = 10, useBoolean = false, searchField = 'all', enabled = true } = options;

  const extractText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[currentLanguage] || content['en'] || Object.values(content)[0] as string || '';
    }
    return '';
  };

  // Server-side DB search via RPC
  const dbQuery = useQuery({
    queryKey: ['search-fulltext', query, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('srangam_search_articles_fulltext', {
        search_query: query,
        result_limit: limit,
      });
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        slug: string;
        title: any;
        dek: any;
        theme: string;
        tags: string[];
        author: string;
        published_date: string;
        read_time_minutes: number;
        og_image_url: string;
        rank: number;
      }>;
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 60_000,
  });

  // Merge JSON + DB results
  const results: SearchResultItem[] = (() => {
    if (!query.trim()) return [];

    // 1. JSON-based search (existing logic, untouched)
    const jsonResults = searchArticles(query, {
      language: currentLanguage,
      theme,
      searchInContent: true,
      searchCulturalTerms: true,
      minScore,
      useBoolean,
      searchField,
    });

    const formattedJson: SearchResultItem[] = jsonResults.map(result => ({
      id: result.article.id,
      title: extractText(result.article.title),
      excerpt: extractText(result.article.dek),
      slug: `/${result.article.id}`,
      theme: result.metadata.theme,
      tags: result.article.tags.map(tag => extractText(tag)).filter(Boolean),
      readTime: result.metadata.readTime,
      author: result.metadata.author,
      date: result.metadata.date,
      score: result.score,
      matchedContent: result.matchedContent,
      matchType: result.matchType,
      source: 'json' as const,
    }));

    // 2. DB results from RPC
    const jsonIds = new Set(formattedJson.map(r => r.id));
    const jsonSlugs = new Set(formattedJson.map(r => r.slug.replace(/^\//, '')));

    const dbResults: SearchResultItem[] = (dbQuery.data || [])
      .filter(a => !jsonIds.has(a.id) && !jsonSlugs.has(a.slug))
      .filter(a => theme === 'all' || a.theme === theme)
      .map(a => ({
        id: a.id,
        title: extractText(a.title),
        excerpt: extractText(a.dek),
        slug: `/articles/${a.slug}`,
        theme: a.theme,
        tags: a.tags || [],
        readTime: a.read_time_minutes,
        author: a.author,
        date: a.published_date,
        score: Math.round(a.rank * 100),
        matchedContent: [],
        matchType: 'title',
        source: 'database' as const,
      }));

    return [...formattedJson, ...dbResults].sort((a, b) => b.score - a.score);
  })();

  return {
    results,
    isLoading: dbQuery.isLoading && query.trim().length >= 2,
    error: dbQuery.error,
  };
}
