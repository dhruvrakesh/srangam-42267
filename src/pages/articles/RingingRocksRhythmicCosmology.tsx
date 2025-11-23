import React from 'react';
import { useLanguage } from '@/components/language/LanguageProvider';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconOm } from '@/components/icons/IconOm';
import { ringingRocksRhythmicCosmology } from '@/data/articles/ringing-rocks-rhythmic-cosmology';
import { ARTICLE_METADATA } from '@/data/articles';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { AcousticSiteMap } from '@/components/articles/maps/AcousticSiteMap';
import { VedicMeterDiagram } from '@/components/articles/diagrams/VedicMeterDiagram';
import { DataComponentErrorBoundary } from '@/components/articles/DataComponentErrorBoundary';

export const RingingRocksRhythmicCosmology: React.FC = () => {
  const { currentLanguage } = useLanguage();
  
  const metadata = ARTICLE_METADATA['ringing-rocks-rhythmic-cosmology'];
  
  const contentForNarration = typeof ringingRocksRhythmicCosmology.content === 'object'
    ? ((ringingRocksRhythmicCosmology.content as any)[currentLanguage] as string || '')
    : ringingRocksRhythmicCosmology.content as string;

  // Data visualization components for acoustic archaeology
  const dataComponents = [
    <DataComponentErrorBoundary key="acoustic-map" componentName="Acoustic Site Map">
      <AcousticSiteMap />
    </DataComponentErrorBoundary>,
    <DataComponentErrorBoundary key="vedic-meter" componentName="Vedic Meter Diagram">
      <VedicMeterDiagram />
    </DataComponentErrorBoundary>
  ];

  return (
    <>
      <ArticlePage
        title={ringingRocksRhythmicCosmology.title}
        dek={ringingRocksRhythmicCosmology.dek}
        content={ringingRocksRhythmicCosmology.content}
        tags={ringingRocksRhythmicCosmology.tags}
        icon={IconOm}
        readTime={metadata.readTime}
        author={metadata.author}
        date={metadata.date}
        articleSlug="ringing-rocks-rhythmic-cosmology"
        dataComponents={dataComponents}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="ringing-rocks-rhythmic-cosmology"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
};

export default RingingRocksRhythmicCosmology;
