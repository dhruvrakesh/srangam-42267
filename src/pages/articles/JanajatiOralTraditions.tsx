import React from 'react';
import { Link } from 'react-router-dom';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { janajatiOralTraditions } from '@/data/articles/janajati-oral-traditions';
import { IconLotus } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { useArticleCoverage } from '@/hooks/useArticleCoverage';

const RelatedReading = () => (
  <Card className="my-12 p-6 bg-muted/30 border-border">
    <h3 className="text-lg font-semibold mb-4 text-foreground">Related Reading</h3>
    <div className="space-y-3">
      <div className="font-medium text-sm mb-2 text-foreground">Sacred Ecology Series:</div>
      <ul className="space-y-2 ml-4">
        <li>
          <Link to="/sacred-tree-harvest-rhythms" className="text-primary hover:underline font-medium">
            Part 1: Under the Sacred Tree — Harvest Rhythms and Groves
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            Living ritual practices (trees, groves, harvest festivals)
          </p>
        </li>
        <li>
          <Link to="/stone-song-and-sea" className="text-primary hover:underline font-medium">
            Part 2: Stone, Song, and Sea — Petroglyphs to Monoliths
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            Material culture (stone, sound, megaliths) preserves ritual calendars across deep time
          </p>
        </li>
      </ul>
    </div>
  </Card>
);

export default function JanajatiOralTraditions() {
  const { currentLanguage } = useArticleCoverage('janajati-oral-traditions');
  
  // Extract content based on current language with fallback chain
  const contentForNarration = (typeof janajatiOralTraditions.content === 'object'
    ? (janajatiOralTraditions.content[currentLanguage] || janajatiOralTraditions.content.en || '')
    : janajatiOralTraditions.content) as string;
  
  return (
    <>
      <ArticlePage
        title={janajatiOralTraditions.title}
        dek={janajatiOralTraditions.dek}
        content={janajatiOralTraditions.content}
        tags={janajatiOralTraditions.tags}
        icon={IconLotus}
        readTime={55}
        author="Nartiang Foundation Research Team"
        date="2025-10-05"
        articleSlug="janajati-oral-traditions"
        dataComponents={[<RelatedReading key="related-reading" />]}
      />
      
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="janajati-oral-traditions"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}
