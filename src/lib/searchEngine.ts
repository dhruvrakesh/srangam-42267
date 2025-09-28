import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '@/data/articles';
import { LocalizedArticle, SupportedLanguage, MultilingualContent } from '@/types/multilingual';
import { culturalTermsDatabase } from '@/data/articles/cultural-terms';
import { generateSanskritVariants, matchesSanskritTerm, isSanskritTerm, getSanskritContext } from './sanskritUtils';

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
  useBoolean?: boolean;
  searchField?: 'all' | 'title' | 'content' | 'tags' | 'cultural-terms';
  confidenceLevel?: 'high' | 'medium' | 'low' | 'all';
  dateRange?: { start?: string; end?: string };
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
 * Search for cultural terms in text with Sanskrit enhancement
 */
function findCulturalTerms(text: string, language: SupportedLanguage): MatchedContent[] {
  const matches: MatchedContent[] = [];
  const lowerText = text.toLowerCase();
  
  Object.keys(culturalTermsDatabase).forEach(term => {
    const termLower = term.toLowerCase();
    
    // Standard term matching
    let index = lowerText.indexOf(termLower);
    
    // Enhanced Sanskrit matching
    if (index === -1 && isSanskritTerm(term)) {
      const variants = generateSanskritVariants(term);
      for (const variant of variants) {
        index = lowerText.indexOf(variant);
        if (index !== -1) break;
      }
    }
    
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
 * Parse boolean search query (AND, OR, NOT operators)
 */
function parseBooleanQuery(query: string): { terms: string[]; operators: string[] } {
  const tokens = query.split(/\s+(AND|OR|NOT)\s+/i);
  const terms: string[] = [];
  const operators: string[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      // Terms
      terms.push(tokens[i].trim().replace(/['"]/g, ''));
    } else {
      // Operators
      operators.push(tokens[i].toUpperCase());
    }
  }
  
  return { terms, operators };
}

/**
 * Enhanced search matching with Sanskrit support
 */
function enhancedTextMatch(searchTerm: string, targetText: string): boolean {
  const lowerTarget = targetText.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  
  // Standard matching
  if (lowerTarget.includes(lowerSearch)) return true;
  
  // Sanskrit-aware matching
  if (isSanskritTerm(searchTerm)) {
    return matchesSanskritTerm(searchTerm, targetText);
  }
  
  return false;
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
    minScore = 10,
    useBoolean = false,
    searchField = 'all',
    confidenceLevel = 'all',
    dateRange
  } = options;
  
  // Parse boolean query if enabled
  const { terms, operators } = useBoolean ? parseBooleanQuery(query) : { terms: [query], operators: [] };
  const results: SearchResult[] = [];
  
  MULTILINGUAL_ARTICLES.forEach(article => {
    const metadata = ARTICLE_METADATA[article.id];
    if (!metadata) return;
    
    // Theme filtering
    if (theme && theme !== 'all' && !metadata.theme.toLowerCase().includes(theme.toLowerCase())) {
      return;
    }
    
    // Date range filtering
    if (dateRange && metadata.date) {
      const articleDate = new Date(metadata.date);
      if (dateRange.start && articleDate < new Date(dateRange.start)) return;
      if (dateRange.end && articleDate > new Date(dateRange.end)) return;
    }
    
    const matches: MatchedContent[] = [];
    let primaryLanguage: SupportedLanguage = language;
    let hasMatches = false;
    
    // Enhanced search logic for each term
    for (let termIndex = 0; termIndex < terms.length; termIndex++) {
      const searchTerm = terms[termIndex];
      const operator = operators[termIndex - 1]; // Previous operator
      let termMatches: MatchedContent[] = [];
      
      // Search in title (if field allows)
      if (searchField === 'all' || searchField === 'title') {
        const titleTexts = getAllTextContent(article.title);
        titleTexts.forEach((titleText, index) => {
          if (enhancedTextMatch(searchTerm, titleText)) {
            const langs = Object.keys(article.title) as SupportedLanguage[];
            const matchLang = langs[index] || language;
            termMatches.push({
              type: 'title',
              text: titleText,
              context: titleText,
              language: matchLang
            });
            primaryLanguage = matchLang;
          }
        });
      }
    
      // Search in content (if field allows)
      if ((searchField === 'all' || searchField === 'content') && searchInContent) {
        const contentTexts = getAllTextContent(article.content);
        contentTexts.forEach((contentText, index) => {
          if (enhancedTextMatch(searchTerm, contentText)) {
            const langs = Object.keys(article.content) as SupportedLanguage[];
            const matchLang = langs[index] || language;
            
            // Extract context around the match
            const lowerContent = contentText.toLowerCase();
            const searchVariants = isSanskritTerm(searchTerm) ? generateSanskritVariants(searchTerm) : [searchTerm.toLowerCase()];
            let matchIndex = -1;
            let matchedVariant = searchTerm;
            
            for (const variant of searchVariants) {
              matchIndex = lowerContent.indexOf(variant);
              if (matchIndex !== -1) {
                matchedVariant = variant;
                break;
              }
            }
            
            if (matchIndex !== -1) {
              const start = Math.max(0, matchIndex - 100);
              const end = Math.min(contentText.length, matchIndex + matchedVariant.length + 100);
              const context = contentText.substring(start, end);
              
              termMatches.push({
                type: 'content',
                text: searchTerm,
                context: `...${context}...`,
                language: matchLang
              });
              primaryLanguage = matchLang;
            }
          }
        });
      }
    
      // Search in tags (if field allows)
      if (searchField === 'all' || searchField === 'tags') {
        article.tags.forEach(tagObj => {
          const tagTexts = getAllTextContent(tagObj);
          tagTexts.forEach((tagText, index) => {
            if (enhancedTextMatch(searchTerm, tagText)) {
              const langs = Object.keys(tagObj) as SupportedLanguage[];
              const matchLang = langs[index] || language;
              termMatches.push({
                type: 'tag',
                text: tagText,
                context: tagText,
                language: matchLang
              });
            }
          });
        });
      }
    
      // Search for cultural terms (if field allows)
      if ((searchField === 'all' || searchField === 'cultural-terms') && searchCulturalTerms) {
        const allTexts = [
          ...getAllTextContent(article.title),
          ...getAllTextContent(article.content),
          ...article.tags.flatMap(tag => getAllTextContent(tag))
        ];
        
        allTexts.forEach(text => {
          if (enhancedTextMatch(searchTerm, text)) {
            const culturalMatches = findCulturalTerms(text, language);
            termMatches.push(...culturalMatches);
          }
        });
      }
      
      // Apply boolean logic
      if (termIndex === 0) {
        // First term - add all matches
        matches.push(...termMatches);
        hasMatches = termMatches.length > 0;
      } else {
        // Apply operator logic
        if (operator === 'AND') {
          hasMatches = hasMatches && termMatches.length > 0;
          if (hasMatches) matches.push(...termMatches);
        } else if (operator === 'OR') {
          hasMatches = hasMatches || termMatches.length > 0;
          if (termMatches.length > 0) matches.push(...termMatches);
        } else if (operator === 'NOT') {
          hasMatches = hasMatches && termMatches.length === 0;
          // Don't add NOT matches to results
        }
      }
      
      // Break early if AND condition fails
      if (useBoolean && operator === 'AND' && !hasMatches) {
        break;
      }
    }
    
    // Calculate score and add to results if relevant
    if (matches.length > 0 && (!useBoolean || hasMatches)) {
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
 * Search suggestions with Sanskrit enhancement
 */
export function getSearchSuggestions(language: SupportedLanguage = 'en'): string[] {
  const culturalTerms = Object.keys(culturalTermsDatabase).slice(0, 8);
  const popularTerms = ['Muziris', 'Monsoon', 'Chola', 'Sanskrit', 'Ports', 'Ashoka', 'Borneo'];
  const sanskritTerms = ['amavasu', 'dharma', 'sangam', 'yuga', 'shastra', 'purana'];
  
  return [...popularTerms, ...sanskritTerms, ...culturalTerms];
}

/**
 * Export search results for academic use
 */
export function exportSearchResults(results: SearchResult[], format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = ['Title', 'Theme', 'Score', 'Match Type', 'Language', 'Date', 'Author'];
    const rows = results.map(result => [
      getTextContent(result.article.title, 'en'),
      result.metadata.theme,
      result.score.toString(),
      result.matchType,
      result.matchedLanguage,
      result.metadata.date,
      result.metadata.author
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
  
  return JSON.stringify(results.map(result => ({
    id: result.article.id,
    title: getTextContent(result.article.title, 'en'),
    theme: result.metadata.theme,
    score: result.score,
    matchType: result.matchType,
    matchedLanguage: result.matchedLanguage,
    metadata: result.metadata,
    matchedContent: result.matchedContent
  })), null, 2);
}