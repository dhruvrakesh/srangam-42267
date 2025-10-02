import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { cosmicIslandSacredLand } from '@/data/articles/cosmic-island-sacred-land';
import { IconLotus } from '@/components/icons';
import { ArticleHead } from '@/components/i18n/ArticleHead';
import { TranslationStatusHUD } from '@/components/i18n/TranslationStatusHUD';
import { GatedLanguageSwitcher } from '@/components/i18n/GatedLanguageSwitcher';
import { useArticleCoverage } from '@/hooks/useArticleCoverage';
import { cosmicIslandSacredLandCoverage } from '@/lib/i18n/coverageData';

const CosmicIslandSacredLand: React.FC = () => {
  const { currentCoverage } = useArticleCoverage('cosmic-island-sacred-land');
  
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
        dataComponents={[]}
      />
    </>
  );
};

export default CosmicIslandSacredLand;
