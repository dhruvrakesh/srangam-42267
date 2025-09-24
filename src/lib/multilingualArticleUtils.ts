import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA, SLUG_TO_ID_MAP } from '@/data/articles';
import { LocalizedArticle, SupportedLanguage } from '@/types/multilingual';

interface DisplayArticle {
  id: string;
  title: LocalizedArticle['title'];
  excerpt: LocalizedArticle['dek']; // Using dek as excerpt
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
 * Get featured articles (first 3)
 */
export const getFeaturedArticles = (language: SupportedLanguage = 'en'): DisplayArticle[] => {
  return getDisplayArticles(language).slice(0, 3);
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