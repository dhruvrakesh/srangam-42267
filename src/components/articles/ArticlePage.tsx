import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TagChip } from '@/components/ui/TagChip';
import { EnhancedMultilingualText } from '@/components/language/EnhancedMultilingualText';
import { ProfessionalTextFormatter } from '@/components/articles/enhanced/ProfessionalTextFormatter';
import { MultilingualContent } from '@/types/multilingual';
import { cn } from '@/lib/utils';
import { ArticleProvider, useReadingProgress } from '@/components/context/ArticleContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const ReadingProgressBar = () => {
  const progress = useReadingProgress();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background/90 backdrop-blur-sm">
      <div 
        className="h-full bg-gradient-to-r from-burgundy via-saffron to-gold-warm transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

interface ArticlePageProps {
  title: MultilingualContent | string;
  dek: MultilingualContent | string;
  content: MultilingualContent | string;
  tags: (MultilingualContent | string)[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
  readTime?: number;
  author?: string;
  date?: string;
  dataComponents?: React.ReactNode[];
}

const ArticleContent = React.memo(({ 
  title, 
  dek, 
  content, 
  tags, 
  icon: Icon, 
  readTime, 
  author, 
  date, 
  dataComponents = []
}: ArticlePageProps) => {
  const { t } = useTranslation();
  const { mark, measure } = usePerformanceMonitor({ 
    componentName: 'ArticlePage',
    trackMemory: true 
  });

  React.useEffect(() => {
    mark('content-start');
    return () => {
      measure('content-duration', 'content-start');
    };
  }, [mark, measure]);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Contextual Sacred Geometry Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-sandalwood/30 to-cream/40 rounded-3xl -z-10" />
        <div className={cn(
          "absolute inset-0 opacity-40 rounded-3xl -z-10",
          'ocean-waves'
        )} />
        
        {/* Breadcrumb */}
        <nav className="mb-8 relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-burgundy transition-all duration-300 hover:translate-x-1"
          >
            ← {t('navigation.backToHome', 'Back to Home')}
          </Link>
        </nav>

        {/* Enhanced Article Header */}
        <header className="mb-12 text-center relative z-10">
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-burgundy/40 rounded-full blur-2xl transform scale-150 animate-pulse-gentle" />
            <div className="relative bg-gradient-to-br from-burgundy/30 to-saffron/30 p-8 rounded-full backdrop-blur-sm border border-burgundy/40 shadow-2xl">
              <Icon className="text-burgundy" size={64} />
            </div>
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-burgundy via-saffron to-gold-warm bg-clip-text text-transparent">
              <EnhancedMultilingualText content={title} />
            </span>
          </h1>
          
          <p className="text-xl text-charcoal/80 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
            <EnhancedMultilingualText content={dek} />
          </p>

          {/* Enhanced Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {tags.map((tag, index) => (
              <TagChip 
                key={typeof tag === 'string' ? tag : JSON.stringify(tag)} 
                variant="theme"
                className={cn(
                  "hover:scale-105 transition-transform duration-200 animate-fade-in",
                  `[animation-delay:${index * 100}ms]`
                )}
              >
                <EnhancedMultilingualText content={tag} />
              </TagChip>
            ))}
          </div>

          {/* Enhanced Meta */}
          <div className="flex justify-center items-center gap-6 text-sm bg-sandalwood/40 rounded-full px-6 py-3 backdrop-blur-sm border border-burgundy/30">
            <span className="text-burgundy font-medium">
              {readTime} {t('article.minRead', 'min read')}
            </span>
            {author && (
              <>
                <span className="text-burgundy/60">•</span>
                <span className="text-charcoal/80">{author}</span>
              </>
            )}
            {date && (
              <>
                <span className="text-burgundy/60">•</span>
                <span className="text-charcoal/80">{date}</span>
              </>
            )}
          </div>
        </header>

        {/* Professional Article Content */}
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-6">
            <ProfessionalTextFormatter 
              content={typeof content === 'string' ? { en: content } : content} 
              enableCulturalTerms={true}
              enableDropCap={true}
              className="mb-12"
            />

            {/* Enhanced Data Components */}
            {dataComponents.length > 0 && (
              <div className="mt-12 space-y-12">
                {dataComponents
                  .filter((component): component is React.ReactElement => 
                    component !== null && 
                    component !== undefined && 
                    React.isValidElement(component)
                  )
                  .map((component, index) => (
                    <div 
                      key={index} 
                      className="bg-sandalwood/40 border border-burgundy/30 p-8 rounded-2xl backdrop-blur-sm shadow-lg"
                    >
                      {component}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </article>
  );
});

ArticleContent.displayName = 'ArticleContent';

export function ArticlePage(props: ArticlePageProps) {
  const titleString = typeof props.title === 'string' ? props.title : 
    (typeof props.title === 'object' && props.title.en ? props.title.en as string : 'Article');
  
  return (
    <ArticleProvider articleId={titleString}>
      <ReadingProgressBar />
      <ArticleContent {...props} />
    </ArticleProvider>
  );
}