import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconMonsoon } from '@/components/icons';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { HermapollonCargo } from '@/components/articles/HermapollonCargo';
import { SeasonalWindPattern } from '@/components/articles/SeasonalWindPattern';
import { CulturalDiffusionMap } from '@/components/articles/CulturalDiffusionMap';
import { FestivalCalendar } from '@/components/articles/FestivalCalendar';
import { scriptsThatSailed } from '@/data/articles/scripts-that-sailed';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';


export default function ScriptsThatSailed() {
  const contentForNarration = typeof scriptsThatSailed.content === 'object' 
    ? (scriptsThatSailed.content.en as string || '')
    : scriptsThatSailed.content;

  return (
    <>
      <ArticlePage
      title={scriptsThatSailed.title}
      dek={scriptsThatSailed.dek}
      content={scriptsThatSailed.content}
      tags={scriptsThatSailed.tags}
      icon={IconMonsoon}
      readTime={28}
      author="Kanika Rakesh"
      date="2024-03-08"
      articleSlug="scripts-that-sailed"
      dataComponents={[
        <ResponsiveImage 
          key="monsoon-hero"
          src="/images/hero_indian-ocean_aerial_21x9_v1.png"
          alt="Aerial view of the Indian Ocean showing monsoon wind patterns and ancient trade routes"
          aspectRatio="ultrawide"
          caption="The vast Indian Ocean, where seasonal monsoon winds created humanity's first global trade superhighway"
          credit="Historical Maritime Archives"
          className="mb-8"
        />,
        <SeasonalWindPattern key="wind-patterns" />,
        <HermapollonCargo key="hermapollon-cargo" />,
        <CulturalDiffusionMap key="cultural-diffusion" />,
        <FestivalCalendar key="festival-calendar" />,
        <ResponsiveImage 
          key="monsoon-map"
          src="/images/map_monsoon-trade_parchment_v2.png"
          alt="Historical map showing monsoon trade routes connecting the Indian Ocean rim"
          aspectRatio="landscape"
          caption="Ancient monsoon trade routes: the seasonal superhighways that connected three continents"
          credit="Cartographic Heritage Collection"
          className="mt-8"
        />
      ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="scripts-that-sailed"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}