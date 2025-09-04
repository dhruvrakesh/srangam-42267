import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { TagChip } from '@/components/ui/TagChip';
import { cn } from '@/lib/utils';
import { ArticleProvider, useReadingProgress } from '@/components/context/ArticleContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const ReadingProgressBar = React.memo(() => {
  const progress = useReadingProgress();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background/90 backdrop-blur-sm">
      <div 
        className="h-full bg-gradient-to-r from-burgundy via-saffron to-gold-warm transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

ReadingProgressBar.displayName = 'ReadingProgressBar';

interface ArticlePageProps {
  title: string;
  dek: string;
  content: string;
  tags: string[];
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
  dataComponents 
}: ArticlePageProps) => {
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
    <>
      <ReadingProgressBar />
      
      <article className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-sandalwood/30 to-cream/40 rounded-3xl -z-10" />
        <div className="absolute inset-0 mandala-bg opacity-20 rounded-3xl -z-10" />
        
        {/* Breadcrumb */}
        <nav className="mb-8 relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-burgundy transition-all duration-300 hover:translate-x-1"
          >
            ← Back to Home
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
              {title}
            </span>
          </h1>
          
          <p className="text-xl text-charcoal/80 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
            {dek}
          </p>

          {/* Enhanced Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {tags.map((tag, index) => (
              <TagChip 
                key={tag} 
                variant="theme"
                className={cn(
                  "hover:scale-105 transition-transform duration-200 animate-fade-in",
                  `[animation-delay:${index * 100}ms]`
                )}
              >
                {tag}
              </TagChip>
            ))}
          </div>

          {/* Enhanced Meta */}
          <div className="flex justify-center items-center gap-6 text-sm bg-sandalwood/40 rounded-full px-6 py-3 backdrop-blur-sm border border-burgundy/30">
            <span className="text-burgundy font-medium">{readTime} min read</span>
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

        {/* Enhanced Article Content */}
        <div className="prose prose-lg max-w-none relative z-10">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="font-serif text-2xl font-bold text-burgundy mt-12 mb-6 pb-3 border-b-2 border-burgundy/30">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-serif text-xl font-semibold text-saffron mt-8 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-saffron rounded-full"></span>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-foreground leading-relaxed mb-6 text-lg">
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-burgundy/60 pl-6 my-8 italic text-charcoal/80 bg-sandalwood/40 py-6 rounded-r-lg backdrop-blur-sm">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 text-burgundy/40 text-6xl font-serif">"</div>
                    {children}
                  </div>
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-none pl-0 mb-6 space-y-3">
                  {React.Children.map(children, (child, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-burgundy rounded-full mt-3 flex-shrink-0"></span>
                      <div className="flex-1">{child}</div>
                    </li>
                  ))}
                </ul>
              ),
              li: ({ children }) => (
                <div className="text-foreground leading-relaxed">
                  {children}
                </div>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-burgundy bg-saffron/20 px-1 rounded">
                  {children}
                </strong>
              ),
            }}
          >
            {content}
          </ReactMarkdown>

          {/* Enhanced Data Components */}
          {dataComponents.length > 0 && (
            <div className="mt-12 space-y-12">
              {dataComponents.map((component, index) => (
                <div 
                  key={index} 
                  className="bg-sandalwood/40 border border-burgundy/30 p-8 rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  {component}
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </>
  );
});

ArticleContent.displayName = 'ArticleContent';

export function ArticlePage(props: ArticlePageProps) {
  return (
    <ArticleProvider articleId={props.title}>
      <ArticleContent {...props} />
    </ArticleProvider>
  );
}