import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconMonsoon } from '@/components/icons';
import { MonsoonMap } from '@/components/articles/MonsoonMap';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { monsoonTradeClock } from '@/data/articles/monsoon-trade-clock';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

// Multilingual content is properly loaded from data file - no hardcoded content needed

export default function MonsoonTradeClock() {
  const contentForNarration = typeof monsoonTradeClock.content === 'object' 
    ? (monsoonTradeClock.content.en as string || '')
    : monsoonTradeClock.content;

  return (
    <>
      <ArticlePage
      title={monsoonTradeClock.title}
      dek={monsoonTradeClock.dek}
      content={monsoonTradeClock.content}
      tags={monsoonTradeClock.tags}
      icon={IconMonsoon}
      readTime={8}
      author="Mrs. Rekha Bansal, MA History"
      date="2024-03-12"
      dataComponents={[
        <ResponsiveImage 
          key="monsoon-hero"
          src="/images/map_monsoon-trade_parchment_v2.png"
          alt="Historical monsoon trade routes across the Indian Ocean on parchment map"
          aspectRatio="landscape"
          caption="Ancient monsoon trade routes showing the seasonal wind patterns that enabled regular commerce across the Indian Ocean"
          credit="Maritime History Archive"
          className="mb-8"
        />,
        <MonsoonMap key="monsoon-map" />,
        <PepperCargoTable key="pepper-cargo" />
      ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="monsoon-trade-clock"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}