import { getDisplayArticles } from './multilingualArticleUtils';
import type { DisplayArticle } from '@/hooks/useArticles';
import type { SupportedLanguage } from '@/types/multilingual';

export const mergeArticleSources = (
  jsonArticles: ReturnType<typeof getDisplayArticles>,
  dbArticles?: DisplayArticle[]
): DisplayArticle[] => {
  const unified: DisplayArticle[] = [];
  
  // Add JSON articles with source flag
  jsonArticles.forEach(article => {
    unified.push({
      ...article,
      source: 'json' as const
    } as DisplayArticle);
  });
  
  // Add database articles (already have source flag)
  if (dbArticles) {
    dbArticles.forEach(article => {
      unified.push(article);
    });
  }
  
  return unified;
};

export const filterUnifiedArticles = (
  articles: DisplayArticle[],
  options: {
    themes?: string[];
    searchQuery?: string;
    sortBy?: 'recent' | 'oldest' | 'longest' | 'shortest' | 'title';
    limit?: number;
  }
): DisplayArticle[] => {
  let filtered = [...articles];
  
  // Theme filter
  if (options.themes && options.themes.length > 0) {
    filtered = filtered.filter(a => options.themes!.includes(a.theme));
  }
  
  // Search filter
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(a => {
      const title = typeof a.title === 'string' ? a.title : (a.title as any).en || '';
      const excerpt = typeof a.excerpt === 'string' ? a.excerpt : (a.excerpt as any).en || '';
      return title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
    });
  }
  
  // Sort
  switch (options.sortBy) {
    case 'recent':
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;
    case 'longest':
      filtered.sort((a, b) => b.readTime - a.readTime);
      break;
    case 'shortest':
      filtered.sort((a, b) => a.readTime - b.readTime);
      break;
    case 'title':
      filtered.sort((a, b) => {
        const titleA = typeof a.title === 'string' ? a.title : (a.title as any).en || '';
        const titleB = typeof b.title === 'string' ? b.title : (b.title as any).en || '';
        return titleA.localeCompare(titleB);
      });
      break;
    default:
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Limit
  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
};
