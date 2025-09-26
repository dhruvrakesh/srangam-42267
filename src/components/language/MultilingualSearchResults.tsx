import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, Clock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '@/data/articles';
import { EnhancedMultilingualText } from './EnhancedMultilingualText';
import { LanguageAvailabilityBadge } from './LanguageAvailabilityBadge';
import { SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode } from '@/lib/languageUtils';

interface MultilingualSearchResultsProps {
  query: string;
  onClose: () => void;
  maxResults?: number;
}

export const MultilingualSearchResults: React.FC<MultilingualSearchResultsProps> = ({
  query,
  onClose,
  maxResults = 8
}) => {
  const { i18n, t } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en') as SupportedLanguage;

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const results = [];

    for (const article of MULTILINGUAL_ARTICLES) {
      const metadata = ARTICLE_METADATA[article.id];
      if (!metadata) continue;

      let relevanceScore = 0;
      let matchedContent = '';
      let matchedLanguage: SupportedLanguage = currentLanguage;

      // Search in all language versions of the article
      for (const [langCode, content] of Object.entries(article.content)) {
        if (typeof content === 'string') {
          const contentLower = content.toLowerCase();
          
          // Title match (highest priority)
          const titleContent = article.title[langCode as SupportedLanguage];
          if (typeof titleContent === 'string' && titleContent.toLowerCase().includes(queryLower)) {
            relevanceScore += 10;
          }

          // Content match
          if (contentLower.includes(queryLower)) {
            relevanceScore += langCode === currentLanguage ? 5 : 3; // Prefer current language
            
            // Extract snippet around the match
            const matchIndex = contentLower.indexOf(queryLower);
            const start = Math.max(0, matchIndex - 100);
            const end = Math.min(content.length, matchIndex + 200);
            matchedContent = content.substring(start, end);
            matchedLanguage = langCode as SupportedLanguage;
          }
        }
      }

      // Search in tags
      for (const tag of article.tags) {
        for (const [langCode, tagContent] of Object.entries(tag)) {
          if (typeof tagContent === 'string' && tagContent.toLowerCase().includes(queryLower)) {
            relevanceScore += langCode === currentLanguage ? 2 : 1;
          }
        }
      }

      // Search in theme
      if (metadata.theme.toLowerCase().includes(queryLower)) {
        relevanceScore += 2;
      }

      if (relevanceScore > 0) {
        results.push({
          article,
          metadata,
          relevanceScore,
          matchedContent,
          matchedLanguage
        });
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }, [query, currentLanguage, maxResults]);

  if (!query.trim()) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search size={16} />
          <span className="text-sm">{t('navigation.searchPlaceholder')}</span>
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search size={16} />
          <span className="text-sm">No results found for "{query}"</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
          </span>
          <Badge variant="outline" className="text-xs">
            <Globe size={10} className="mr-1" />
            Multilingual
          </Badge>
        </div>
      </div>
      
      <div className="p-1">
        {searchResults.map(({ article, metadata, matchedContent, matchedLanguage }) => (
          <Link
            key={article.id}
            to={`/${article.id}`}
            onClick={onClose}
            className="block p-3 hover:bg-muted rounded-md transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={14} className="text-muted-foreground flex-shrink-0" />
                  <h4 className="font-medium text-sm truncate">
                    <EnhancedMultilingualText
                      content={article.title}
                      fallback={`Article ${article.id}`}
                      enableCulturalTerms={false}
                    />
                  </h4>
                </div>
                
                {matchedContent && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    ...{matchedContent}...
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={10} />
                  <span>{metadata.readTime} min read</span>
                  <Badge variant="outline" className="text-xs">
                    {metadata.theme}
                  </Badge>
                  {matchedLanguage !== currentLanguage && (
                    <Badge variant="secondary" className="text-xs">
                      Found in {matchedLanguage.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              
              <LanguageAvailabilityBadge
                content={article.content}
                currentLanguage={currentLanguage}
                className="flex-shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};