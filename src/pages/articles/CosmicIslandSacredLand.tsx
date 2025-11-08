import React from 'react';
import { Link } from 'react-router-dom';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { cosmicIslandSacredLand } from '@/data/articles/cosmic-island-sacred-land';
import { IconLotus } from '@/components/icons';
import { ArticleHead } from '@/components/i18n/ArticleHead';
import { TranslationStatusHUD } from '@/components/i18n/TranslationStatusHUD';
import { GatedLanguageSwitcher } from '@/components/i18n/GatedLanguageSwitcher';
import { useArticleCoverage } from '@/hooks/useArticleCoverage';
import { cosmicIslandSacredLandCoverage } from '@/lib/i18n/coverageData';
import { Card } from '@/components/ui/card';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

const ExploreSacredEcology = () => (
  <Card className="my-12 p-6 bg-muted/30 border-border">
    <h3 className="text-lg font-semibold mb-4 text-foreground">Explore Sacred Ecology</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Deep-dive into ritual calendars and material culture:
    </p>
    <div className="grid md:grid-cols-2 gap-3">
      <Link to="/sacred-tree-harvest-rhythms" className="block p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors border border-border">
        <div className="font-medium text-sm mb-1 text-foreground">Sacred Tree Series Part 1</div>
        <p className="text-xs text-muted-foreground">Harvest Rhythms and Living Groves</p>
      </Link>
      <Link to="/stone-song-and-sea" className="block p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors border border-border">
        <div className="font-medium text-sm mb-1 text-foreground">Sacred Tree Series Part 2</div>
        <p className="text-xs text-muted-foreground">Stone, Song, and Sea — Megalith-grove pairings, acoustic sites, and the longue durée</p>
      </Link>
    </div>
  </Card>
);

const CosmicIslandSacredLand: React.FC = () => {
  const { currentCoverage, currentLanguage } = useArticleCoverage('cosmic-island-sacred-land');
  
  // Extract content based on current language with fallback chain
  const contentForNarration = (typeof cosmicIslandSacredLand.content === 'object'
    ? (cosmicIslandSacredLand.content[currentLanguage] || cosmicIslandSacredLand.content.en || '')
    : cosmicIslandSacredLand.content) as string;
  
  return (
    <>
      <ArticleHead
        articleSlug="cosmic-island-sacred-land"
        title={cosmicIslandSacredLand.title}
        description={cosmicIslandSacredLand.dek}
        keywords="Bharatvarsha, Jambudvipa, Puranic cosmography, Vedic geography, Sapta Sindhu, ancient India, Sanskrit literature"
        coverageMap={cosmicIslandSacredLandCoverage}
        publishedTime="2025-10-02"
        modifiedTime="2025-10-02"
        section="Ancient India"
        tags={['Puranic Literature', 'Vedic Geography', 'Ancient Cosmography', 'Bharatvarsha']}
      />
      
      {currentCoverage && (
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <TranslationStatusHUD 
            coverage={currentCoverage}
            showMissingKeys={currentCoverage.percent < 99}
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-2 max-w-4xl flex justify-end">
        <GatedLanguageSwitcher
          articleSlug="cosmic-island-sacred-land"
          coverageMap={cosmicIslandSacredLandCoverage}
          variant="default"
        />
      </div>
      
      <ArticlePage
        title={cosmicIslandSacredLand.title}
        dek={cosmicIslandSacredLand.dek}
        content={cosmicIslandSacredLand.content}
        tags={cosmicIslandSacredLand.tags}
        icon={IconLotus}
        readTime={42}
        author="Research Team"
        date="October 2, 2025"
        dataComponents={[<ExploreSacredEcology key="explore-sacred-ecology" />]}
      />
      
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="cosmic-island-sacred-land"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
};

export default CosmicIslandSacredLand;
