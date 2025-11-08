import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { jambudvipaConnected } from '@/data/articles/jambudvipa-connected';
import { IconScript } from '@/components/icons';
import { SeasonalWindPattern } from '@/components/articles/SeasonalWindPattern';
import { TradeTimeline } from '@/components/articles/TradeTimeline';
import { CulturalDiffusionMap } from '@/components/articles/CulturalDiffusionMap';
import { EnhancedTimeline, jambudvipaTimelineData, ArchaeologicalChart, InteractiveTextualSources, StickyTableOfContents, ImprovedInteractiveChart, archaeologicalSitesData } from '@/components/articles/enhanced';
import { ArticleHead } from '@/components/i18n/ArticleHead';
import { TranslationStatusHUD } from '@/components/i18n/TranslationStatusHUD';
import { GatedLanguageSwitcher } from '@/components/i18n/GatedLanguageSwitcher';
import { useArticleCoverage } from '@/hooks/useArticleCoverage';
import { jambudvipaConnectedCoverage } from '@/lib/i18n/coverageData';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

const JambudvipaConnected: React.FC = () => {
  const { coverageMap, currentCoverage, currentLanguage } = useArticleCoverage('jambudvipa-connected');
  
  // Extract content based on current language with fallback chain
  const contentForNarration = (typeof jambudvipaConnected.content === 'object'
    ? (jambudvipaConnected.content[currentLanguage] || jambudvipaConnected.content.en || '')
    : jambudvipaConnected.content) as string;
  
  return (
    <>
      <ArticleHead
        articleSlug="jambudvipa-connected"
        title={jambudvipaConnected.title}
        description={jambudvipaConnected.dek}
        keywords="Keezhadi, Tamil archaeology, ancient India, Jambudvipa, Vaigai civilization, Mahabharata, Tamil-Brahmi, trade networks, cultural synthesis"
        coverageMap={jambudvipaConnectedCoverage}
        publishedTime="2025-09-28"
        modifiedTime="2025-09-28"
        section="Ancient India"
        tags={['Keezhadi Archaeology', 'Tamil-Brahmi Script', 'Ancient Trade Networks', 'Jambudvipa Civilization']}
      />
      
      {/* Translation Status HUD */}
      {currentCoverage && (
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <TranslationStatusHUD 
            coverage={currentCoverage}
            showMissingKeys={currentCoverage.percent < 99}
          />
        </div>
      )}
      
      {/* Gated Language Switcher */}
      <div className="container mx-auto px-4 py-2 max-w-4xl flex justify-end">
        <GatedLanguageSwitcher
          articleSlug="jambudvipa-connected"
          coverageMap={jambudvipaConnectedCoverage}
          variant="default"
        />
      </div>
      
      <ArticlePage
        title={jambudvipaConnected.title}
        dek={jambudvipaConnected.dek}
        content={jambudvipaConnected.content}
        tags={jambudvipaConnected.tags}
        icon={IconScript}
        readTime={35}
        author="Nartiang Foundation"
        date="September 28, 2025"
        dataComponents={[
          <StickyTableOfContents key="table-of-contents" items={[]} className="hidden lg:block" />,
          <EnhancedTimeline key="enhanced-timeline" events={jambudvipaTimelineData} />,
          <ArchaeologicalChart key="archaeological-chart" />,
          <ImprovedInteractiveChart 
            key="sites-chart" 
            title="Archaeological Sites Timeline" 
            description="Major archaeological discoveries revealing the depth of ancient Indian civilization"
            data={archaeologicalSitesData}
            chartType="bar"
            showLegend={true}
          />,
          <InteractiveTextualSources key="textual-sources" />,
          <SeasonalWindPattern key="wind-pattern" />,
          <TradeTimeline key="trade-timeline" />,
          <CulturalDiffusionMap key="cultural-map" />
        ]}
      />
      
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="jambudvipa-connected"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
};

export default JambudvipaConnected;