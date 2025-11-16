import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArticleLayout } from '@/components/articles/ArticleLayout';
import { ringingRocksRhythmicCosmology } from '@/data/articles/ringing-rocks-rhythmic-cosmology';
import { ARTICLE_METADATA } from '@/data/articles';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

export const RingingRocksRhythmicCosmology: React.FC = () => {
  const { currentLanguage } = useLanguage();
  
  const metadata = ARTICLE_METADATA['ringing-rocks-rhythmic-cosmology'];
  
  const contentForNarration = typeof ringingRocksRhythmicCosmology.content === 'object'
    ? ((ringingRocksRhythmicCosmology.content as any)[currentLanguage] as string || '')
    : ringingRocksRhythmicCosmology.content as string;

  return (
    <ArticleLayout
      article={ringingRocksRhythmicCosmology}
      metadata={metadata}
    >
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="ringing-rocks-rhythmic-cosmology"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </ArticleLayout>
  );
};

export default RingingRocksRhythmicCosmology;
