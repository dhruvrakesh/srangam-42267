import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArticleLayout } from '@/components/articles/ArticleLayout';
import { somnathaPrabhasaItihasa } from '@/data/articles/somnatha-prabhasa-itihasa';
import { ARTICLE_METADATA } from '@/data/articles';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { JyotirlingaMap } from '@/components/articles/maps/JyotirlingaMap';

export const SomnathaPrabhasaItihasa: React.FC = () => {
  const { currentLanguage } = useLanguage();
  
  const metadata = ARTICLE_METADATA['somnatha-prabhasa-itihasa'];
  
  const contentForNarration = typeof somnathaPrabhasaItihasa.content === 'object'
    ? ((somnathaPrabhasaItihasa.content as any)[currentLanguage] as string || '')
    : somnathaPrabhasaItihasa.content as string;

  const dataComponents = [
    {
      component: (
        <ErrorBoundary 
          key="jyotirlinga-map"
          fallback={
            <div className="my-12 p-8 border border-border rounded-lg text-center bg-muted/30">
              <p className="text-muted-foreground">Map temporarily unavailable</p>
              <p className="text-xs text-muted-foreground mt-2">Please refresh to try again</p>
            </div>
          }
        >
          <JyotirlingaMap />
        </ErrorBoundary>
      ),
      position: 'after-section-1' as const
    }
  ];

  return (
    <ArticleLayout
      article={somnathaPrabhasaItihasa}
      metadata={metadata}
      dataComponents={dataComponents}
    >
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="somnatha-prabhasa-itihasa"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </ArticleLayout>
  );
};

export default SomnathaPrabhasaItihasa;
