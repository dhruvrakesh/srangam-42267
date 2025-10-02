/**
 * Dynamic Article Loading System
 * Provides efficient JSON-based article loading with caching and error handling
 */

interface ArticleMetadata {
  author: string;
  readTime: number;
  date: string;
  theme: string;
  academicLevel?: string;
  keywords?: string[];
}

interface ArticleStructure {
  sections: Array<{
    id: string;
    title: string;
    type: string;
    subsections?: string[];
    wordCount?: number;
  }>;
}

interface BibliographyEntry {
  id: string;
  title: string;
  author?: string;
  translator?: string;
  publisher: string;
  year: number | string;
  type: 'primary' | 'secondary';
}

interface CrossReference {
  articleId: string;
  relevance: string;
  section: string;
}

interface ArticleJSON {
  id: string;
  metadata: ArticleMetadata;
  structure: ArticleStructure;
  bibliography?: {
    primarySources?: BibliographyEntry[];
    secondarySources?: BibliographyEntry[];
  };
  culturalTerms?: string[];
  crossReferences?: CrossReference[];
  visualizations?: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

// Simple in-memory cache
const articleCache = new Map<string, ArticleJSON>();

/**
 * Load article metadata and structure from JSON
 * @param articleId - The unique identifier for the article
 * @returns Promise resolving to article JSON data
 */
export async function loadArticleJSON(articleId: string): Promise<ArticleJSON> {
  // Check cache first
  if (articleCache.has(articleId)) {
    return articleCache.get(articleId)!;
  }

  try {
    const response = await fetch(`/articles/${articleId}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load article: ${response.statusText}`);
    }

    const data: ArticleJSON = await response.json();
    
    // Validate basic structure
    if (!data.id || !data.metadata || !data.structure) {
      throw new Error('Invalid article JSON structure');
    }

    // Cache the result
    articleCache.set(articleId, data);
    
    return data;
  } catch (error) {
    console.error(`Error loading article ${articleId}:`, error);
    throw error;
  }
}

/**
 * Get article metadata without loading full content
 */
export async function getArticleMetadata(articleId: string): Promise<ArticleMetadata> {
  const article = await loadArticleJSON(articleId);
  return article.metadata;
}

/**
 * Get article bibliography
 */
export async function getArticleBibliography(articleId: string): Promise<BibliographyEntry[]> {
  const article = await loadArticleJSON(articleId);
  
  if (!article.bibliography) {
    return [];
  }

  return [
    ...(article.bibliography.primarySources || []),
    ...(article.bibliography.secondarySources || [])
  ];
}

/**
 * Get cross-referenced articles
 */
export async function getCrossReferences(articleId: string): Promise<CrossReference[]> {
  const article = await loadArticleJSON(articleId);
  return article.crossReferences || [];
}

/**
 * Get all cultural terms used in an article
 */
export async function getArticleCulturalTerms(articleId: string): Promise<string[]> {
  const article = await loadArticleJSON(articleId);
  return article.culturalTerms || [];
}

/**
 * Clear the article cache (useful for development/testing)
 */
export function clearArticleCache(): void {
  articleCache.clear();
}

/**
 * Preload multiple articles for performance
 */
export async function preloadArticles(articleIds: string[]): Promise<void> {
  await Promise.all(
    articleIds.map(id => loadArticleJSON(id).catch(err => {
      console.warn(`Failed to preload article ${id}:`, err);
    }))
  );
}

/**
 * Get article reading time estimate
 */
export async function getArticleReadTime(articleId: string): Promise<number> {
  const metadata = await getArticleMetadata(articleId);
  return metadata.readTime;
}

/**
 * Get article structure for table of contents
 */
export async function getArticleStructure(articleId: string): Promise<ArticleStructure> {
  const article = await loadArticleJSON(articleId);
  return article.structure;
}
