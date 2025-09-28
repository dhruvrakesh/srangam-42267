import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '@/data/articles';
import { LocalizedArticle, SupportedLanguage, MultilingualContent } from '@/types/multilingual';
import { culturalTermsDatabase } from '@/data/articles/cultural-terms';

export interface SearchResult {
  article: LocalizedArticle;
  metadata: typeof ARTICLE_METADATA[string];
  matchedContent: MatchedContent[];
  matchedLanguage: SupportedLanguage;
  score: number;
  matchType: 'title' | 'content' | 'cultural-term' | 'tag' | 'theme';
}

export interface MatchedContent {
  type: 'title' | 'content' | 'tag' | 'cultural-term';
  text: string;
  context: string;
  language: SupportedLanguage;
}

export interface SearchOptions {
  language?: SupportedLanguage;
  theme?: string;
  searchInContent?: boolean;
  searchCulturalTerms?: boolean;
  minScore?: number;
}

/**
 * Extract text content from multilingual content object
 */
function getTextContent(content: MultilingualContent, language: SupportedLanguage): string {
  if (typeof content === 'string') return content;
  
  // Try user's language first, then fallback to English
  return (content[language] as string) || (content['en'] as string) || '';
}

/**
 * Extract all text values from multilingual content recursively
 */
function getAllTextContent(content: MultilingualContent): string[] {
  const texts: string[] = [];
  
  if (typeof content === 'string') {
    texts.push(content);
  } else {
    Object.values(content).forEach(value => {
      if (typeof value === 'string') {
        texts.push(value);
      } else if (typeof value === 'object' && value !== null) {
        texts.push(...getAllTextContent(value));
      }
    });
  }
  
  return texts;
}

/**
 * Search for cultural terms in text
 */
function findCulturalTerms(text: string, language: SupportedLanguage): MatchedContent[] {
  const matches: MatchedContent[] = [];
  const lowerText = text.toLowerCase();
  
  Object.keys(culturalTermsDatabase).forEach(term => {
    const termLower = term.toLowerCase();
    const index = lowerText.indexOf(termLower);
    
    if (index !== -1) {
      // Extract context around the match
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + termLower.length + 50);
      const context = text.substring(start, end);
      
      matches.push({
        type: 'cultural-term',
        text: term,
        context: `...${context}...`,
        language
      });
    }
  });
  
  return matches;
}

/**
 * Calculate search score based on match quality and relevance
 */
function calculateScore(
  query: string, 
  article: LocalizedArticle, 
  matches: MatchedContent[],
  language: SupportedLanguage
): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Title matches (highest weight)
  const title = getTextContent(article.title, language).toLowerCase();
  if (title.includes(queryLower)) {
    score += title === queryLower ? 100 : 80;
  }
  
  // Exact phrase matches in content
  matches.forEach(match => {
    switch (match.type) {
      case 'title':
        score += 50;
        break;
      case 'content':
        score += 20;
        break;
      case 'tag':
        score += 30;
        break;
      case 'cultural-term':
        score += 40;
        break;
    }
    
    // Bonus for exact matches
    if (match.text.toLowerCase() === queryLower) {
      score += 20;
    }
  });
  
  // Language preference bonus
  if (matches.some(m => m.language === language)) {
    score += 10;
  }
  
  return score;
}

/**
 * Enhanced search function that searches across all multilingual content
 */
export function searchArticles(
  query: string, 
  options: SearchOptions = {}
): SearchResult[] {
  if (!query.trim()) return [];
  
  const {
    language = 'en',
    theme,
    searchInContent = true,
    searchCulturalTerms = true,
    minScore = 10
  } = options;
  
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];
  
  MULTILINGUAL_ARTICLES.forEach(article => {
    const metadata = ARTICLE_METADATA[article.id];
    if (!metadata) return;
    
    // Theme filtering
    if (theme && theme !== 'all' && !metadata.theme.toLowerCase().includes(theme.toLowerCase())) {
      return;
    }
    
    const matches: MatchedContent[] = [];
    let primaryLanguage: SupportedLanguage = language;
    
    // Search in title
    const titleTexts = getAllTextContent(article.title);
    titleTexts.forEach((titleText, index) => {
      if (titleText.toLowerCase().includes(queryLower)) {
        const langs = Object.keys(article.title) as SupportedLanguage[];
        const matchLang = langs[index] || language;
        matches.push({
          type: 'title',
          text: titleText,
          context: titleText,
          language: matchLang
        });
        primaryLanguage = matchLang;
      }
    });
    
    // Search in content
    if (searchInContent) {
      const contentTexts = getAllTextContent(article.content);
      contentTexts.forEach((contentText, index) => {
        if (contentText.toLowerCase().includes(queryLower)) {
          const langs = Object.keys(article.content) as SupportedLanguage[];
          const matchLang = langs[index] || language;
          
          // Extract context around the match
          const lowerContent = contentText.toLowerCase();
          const matchIndex = lowerContent.indexOf(queryLower);
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(contentText.length, matchIndex + queryLower.length + 100);
          const context = contentText.substring(start, end);
          
          matches.push({
            type: 'content',
            text: query,
            context: `...${context}...`,
            language: matchLang
          });
          primaryLanguage = matchLang;
        }
      });
    }
    
    // Search in tags
    article.tags.forEach(tagObj => {
      const tagTexts = getAllTextContent(tagObj);
      tagTexts.forEach((tagText, index) => {
        if (tagText.toLowerCase().includes(queryLower)) {
          const langs = Object.keys(tagObj) as SupportedLanguage[];
          const matchLang = langs[index] || language;
          matches.push({
            type: 'tag',
            text: tagText,
            context: tagText,
            language: matchLang
          });
        }
      });
    });
    
    // Search for cultural terms
    if (searchCulturalTerms) {
      const allTexts = [
        ...getAllTextContent(article.title),
        ...getAllTextContent(article.content),
        ...article.tags.flatMap(tag => getAllTextContent(tag))
      ];
      
      allTexts.forEach(text => {
        const culturalMatches = findCulturalTerms(text, language);
        matches.push(...culturalMatches);
      });
    }
    
    // Calculate score and add to results if relevant
    if (matches.length > 0) {
      const score = calculateScore(query, article, matches, language);
      
      if (score >= minScore) {
        const matchType = matches[0]?.type || 'content';
        
        results.push({
          article,
          metadata,
          matchedContent: matches,
          matchedLanguage: primaryLanguage,
          score,
          matchType
        });
      }
    }
  });
  
  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get available themes for filtering
 */
export function getAvailableThemes(): string[] {
  const themes = Object.values(ARTICLE_METADATA).map(meta => meta.theme);
  const uniqueThemes = Array.from(new Set(themes));
  return ['all', ...uniqueThemes];
}

/**
 * Search suggestions based on cultural terms and popular content
 */
export function getSearchSuggestions(language: SupportedLanguage = 'en'): string[] {
  const culturalTerms = Object.keys(culturalTermsDatabase).slice(0, 10);
  const popularTerms = ['Muziris', 'Monsoon', 'Chola', 'Sanskrit', 'Ports', 'Ashoka', 'Borneo'];
  
  return [...popularTerms, ...culturalTerms];
}