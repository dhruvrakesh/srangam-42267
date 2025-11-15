import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA, SLUG_TO_ID_MAP } from '@/data/articles';
import { LocalizedArticle, SupportedLanguage } from '@/types/multilingual';
import type { DatabaseArticle } from '@/hooks/usePublishedArticles';

export interface DisplayArticle {
  id: string;
  title: LocalizedArticle['title'];
  excerpt: LocalizedArticle['dek'];
  slug: string;
  theme: string;
  tags: LocalizedArticle['tags'];
  readTime: number;
  author: string;
  date: string;
}

/**
 * Converts LocalizedArticle data to display format for ArticleCard
 */
export const getDisplayArticles = (language: SupportedLanguage = 'en'): DisplayArticle[] => {
  return MULTILINGUAL_ARTICLES.map(article => {
    const metadata = ARTICLE_METADATA[article.id];
    
    if (!metadata) {
      console.warn(`No metadata found for article: ${article.id}`);
      return {
        id: article.id,
        title: article.title,
        excerpt: article.dek,
        slug: `/${article.id}`,
        theme: 'Unknown',
        tags: article.tags,
        readTime: 10,
        author: 'Unknown Author',
        date: '2024-01-01'
      };
    }

    return {
      id: article.id,
      title: article.title,
      excerpt: article.dek, // Using dek (description) as excerpt
      slug: `/${article.id}`,
      theme: metadata.theme,
      tags: article.tags,
      readTime: metadata.readTime,
      author: metadata.author,
      date: metadata.date
    };
  });
};

/**
 * Get unique themes from all articles
 */
export const getAllThemes = (): string[] => {
  const themes = new Set(
    Object.values(ARTICLE_METADATA).map(meta => meta.theme)
  );
  return Array.from(themes).sort();
};

/**
 * Get article count by theme
 */
export const getArticleCountByTheme = (theme: string): number => {
  return Object.values(ARTICLE_METADATA).filter(
    meta => meta.theme === theme
  ).length;
};

/**
 * Get articles with filtering and sorting
 */
export const getFilteredArticles = (
  language: SupportedLanguage = 'en',
  options: {
    themes?: string[];
    sortBy?: 'recent' | 'oldest' | 'longest' | 'shortest' | 'title';
    limit?: number;
  } = {}
): DisplayArticle[] => {
  let articles = getDisplayArticles(language);

  // Filter by themes
  if (options.themes && options.themes.length > 0) {
    articles = articles.filter(article =>
      options.themes!.includes(article.theme)
    );
  }

  // Sort
  switch (options.sortBy) {
    case 'recent':
      articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
    case 'oldest':
      articles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;
    case 'longest':
      articles.sort((a, b) => b.readTime - a.readTime);
      break;
    case 'shortest':
      articles.sort((a, b) => a.readTime - b.readTime);
      break;
    case 'title':
      articles.sort((a, b) => {
        const titleA = typeof a.title === 'string' ? a.title : (a.title as any).en || '';
        const titleB = typeof b.title === 'string' ? b.title : (b.title as any).en || '';
        return titleA.localeCompare(titleB);
      });
      break;
    default:
      // Default to recent
      articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Apply limit
  if (options.limit && options.limit > 0) {
    articles = articles.slice(0, options.limit);
  }

  return articles;
};

/**
 * Get featured articles (most recent, with optional limit)
 */
export const getFeaturedArticles = (language: SupportedLanguage = 'en', limit: number = 3): DisplayArticle[] => {
  return getFilteredArticles(language, { sortBy: 'recent', limit });
};

/**
 * Convert database article to display format
 */
export const convertDatabaseArticleToDisplay = (
  dbArticle: DatabaseArticle,
  language: SupportedLanguage = 'en'
): DisplayArticle => {
  return {
    id: dbArticle.id,
    title: dbArticle.title?.[language] || dbArticle.title?.en || 'Untitled',
    excerpt: dbArticle.dek?.[language] || dbArticle.dek?.en || '',
    slug: `/${dbArticle.slug}`,
    theme: dbArticle.theme,
    tags: (dbArticle.tags || []).map(tag => ({ en: tag })),
    readTime: dbArticle.read_time_minutes || 10,
    author: dbArticle.author,
    date: dbArticle.published_date || new Date().toISOString().split('T')[0]
  };
};

/**
 * Merge static and database articles
 */
export const getMergedDisplayArticles = (
  staticArticles: DisplayArticle[],
  databaseArticles: DatabaseArticle[],
  language: SupportedLanguage = 'en'
): DisplayArticle[] => {
  const dbDisplayArticles = databaseArticles.map(dbArticle => 
    convertDatabaseArticleToDisplay(dbArticle, language)
  );

  const allArticles = [...staticArticles, ...dbDisplayArticles];
  const uniqueArticles = allArticles.filter((article, index, self) =>
    index === self.findIndex(a => a.slug === article.slug)
  );

  return uniqueArticles;
};

/**
 * Get article by ID
 */
export const getArticleById = (id: string, language: SupportedLanguage = 'en'): DisplayArticle | undefined => {
  const article = MULTILINGUAL_ARTICLES.find(a => a.id === id);
  if (!article) return undefined;
  
  const metadata = ARTICLE_METADATA[id];
  if (!metadata) return undefined;

  return {
    id: article.id,
    title: article.title,
    excerpt: article.dek,
    slug: `/${article.id}`,
    theme: metadata.theme,
    tags: article.tags,
    readTime: metadata.readTime,
    author: metadata.author,
    date: metadata.date
  };
};

/**
 * Get articles by theme
 */
export const getArticlesByTheme = (theme: string, language: SupportedLanguage = 'en'): DisplayArticle[] => {
  return getDisplayArticles(language).filter(article => 
    article.theme.toLowerCase().includes(theme.toLowerCase())
  );
};