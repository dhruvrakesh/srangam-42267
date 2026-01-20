import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";
import { Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EnhancedMultilingualText } from "@/components/language/EnhancedMultilingualText";
import { LanguageAvailabilityBadge } from "@/components/language/LanguageAvailabilityBadge";
import { MultilingualContent } from "@/types/multilingual";
import { normalizeLanguageCode } from "@/lib/languageUtils";
import { SupportedLanguage } from "@/lib/i18n";

interface MultilingualArticle {
  id: string;
  title: MultilingualContent | string;
  excerpt: MultilingualContent | string;
  slug: string;
  theme: string;
  tags: Array<MultilingualContent | string>;
  readTime: number;
  author: string;
  date: string;
  source?: 'json' | 'database';
}

interface ArticleCardProps {
  article: MultilingualArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en') as SupportedLanguage;

  // Normalize content to always be MultilingualContent
  const normalizeContent = (content: MultilingualContent | string): MultilingualContent => {
    if (typeof content === 'string') {
      return { en: content };
    }
    return content;
  };

  const normalizedTitle = normalizeContent(article.title);
  const normalizedExcerpt = normalizeContent(article.excerpt);

  return (
    <Card className="group h-full bg-card/95 backdrop-blur-sm border border-border/70 transition-all duration-300 hover:bg-card hover:border-saffron/50 hover:shadow-xl hover:shadow-saffron/30 hover:-translate-y-1 relative overflow-hidden">
      {/* Dharmic Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-saffron/25 via-transparent to-lotus-pink/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-warm/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-serif text-xl leading-tight text-foreground group-hover:text-saffron transition-all duration-300">
              <Link to={article.slug} className="relative">
                <EnhancedMultilingualText 
                  content={normalizedTitle}
                  enableCulturalTerms={true}
                  fallback={`Article ${article.id}`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-saffron to-gold-warm group-hover:w-full transition-all duration-300" />
              </Link>
            </CardTitle>
            
            {/* Language availability indicator */}
            <div className="mt-2 flex items-center gap-2">
              <LanguageAvailabilityBadge
                content={normalizedTitle}
                currentLanguage={currentLanguage}
                className="text-xs"
              />
              <Globe size={12} className="text-muted-foreground" />
            </div>
          </div>
          
          <TagChip variant="theme" className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            {t(`themes.${article.theme.toLowerCase().replace(/\s+/g, '').replace('&', '')}`)}
          </TagChip>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-muted-foreground text-sm mb-4 leading-relaxed group-hover:text-foreground/80 transition-colors duration-200">
          <EnhancedMultilingualText 
            content={normalizedExcerpt}
            enableCulturalTerms={true}
            fallback="Article excerpt not available"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground group-hover:text-saffron transition-colors duration-200" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-200">
              {t('article.readTime', { minutes: article.readTime })}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag, index) => (
              <TagChip 
                key={index} 
                className={`text-xs group-hover:scale-105 transition-transform duration-200 dark:bg-card dark:text-card-foreground dark:border-border ${
                  index === 1 ? 'delay-50' : index === 2 ? 'delay-100' : ''
                }`}
              >
                <EnhancedMultilingualText 
                  content={tag}
                  enableCulturalTerms={false}
                  fallback={typeof tag === 'string' ? tag : 'Tag'}
                />
              </TagChip>
            ))}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border group-hover:border-saffron/30 transition-colors duration-300">
          <p className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors duration-200">
            {article.author} • {new Date(article.date).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}