import React from 'react';
import { Link } from 'react-router-dom';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconBasalt } from '@/components/icons';
import { PlateSpeedChart } from '@/components/articles/PlateSpeedChart';
import { gondwanaToHimalaya } from '@/data/articles/gondwana-to-himalaya';
import { Card } from '@/components/ui/card';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

// Multilingual content is properly loaded from data file - no hardcoded content needed

const DeepTimeCulturalMemory = () => (
  <Card className="my-12 p-6 bg-primary/5 border-primary/20">
    <h3 className="text-lg font-semibold mb-3 text-foreground">Deep Time in Cultural Memory</h3>
    <p className="text-sm text-muted-foreground mb-3">
      Just as geological processes operate across vast timescales, cultural practices can persist through millennia. 
      The concept of <em>longue durée</em> bridges geological and cultural deep time.
    </p>
    <Link to="/stone-song-and-sea" className="inline-flex items-center text-primary hover:underline font-medium text-sm">
      Stone, Song, and Sea →
    </Link>
    <p className="text-xs text-muted-foreground mt-2">
      Applies archaeological deep time methodology to petroglyphs, megaliths, and oral traditions—bridging geological and cultural longue durée
    </p>
  </Card>
);

const DeccanStepsComponent = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">Deccan Traps Formation</h3>
    <div className="bg-white p-6 rounded-lg border">
      <svg viewBox="0 0 500 200" className="w-full h-48">
        {/* Basalt steps */}
        <rect x="50" y="140" width="400" height="20" fill="hsl(var(--laterite))" />
        <text x="250" y="155" textAnchor="middle" className="text-xs fill-white">Oldest Basalt Flows</text>
        
        <rect x="75" y="120" width="350" height="20" fill="hsl(var(--laterite)/0.8)" />
        <rect x="100" y="100" width="300" height="20" fill="hsl(var(--laterite)/0.6)" />
        <rect x="125" y="80" width="250" height="20" fill="hsl(var(--laterite)/0.4)" />
        <rect x="150" y="60" width="200" height="20" fill="hsl(var(--laterite)/0.2)" />
        
        <text x="250" y="45" textAnchor="middle" className="text-xs text-muted-foreground fill-current">Youngest Flows</text>
        
        {/* Timeline */}
        <line x1="50" y1="180" x2="450" y2="180" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x="50" y="195" className="text-xs text-muted-foreground fill-current">66 Ma</text>
        <text x="250" y="195" className="text-xs text-muted-foreground fill-current">K-Pg Boundary</text>
        <text x="420" y="195" className="text-xs text-muted-foreground fill-current">65 Ma</text>
      </svg>
    </div>
    <p className="text-sm text-muted-foreground">
      The Deccan Traps represent one of Earth's largest volcanic provinces, covering over 500,000 km² 
      of western India with layered basalt flows.
    </p>
  </div>
);

export default function GondwanaToHimalaya() {
  const contentForNarration = typeof gondwanaToHimalaya.content === 'object' 
    ? (gondwanaToHimalaya.content.en as string || '')
    : gondwanaToHimalaya.content;

  return (
    <>
      <ArticlePage
      title={gondwanaToHimalaya.title}
      dek={gondwanaToHimalaya.dek}
      content={gondwanaToHimalaya.content}
      tags={gondwanaToHimalaya.tags}
      icon={IconBasalt}
      readTime={10}
      author="Dr. Geological Survey"
      date="2024-03-05"
      dataComponents={[
        <PlateSpeedChart key="plate-speed" />,
        <DeccanStepsComponent key="deccan-steps" />,
        <DeepTimeCulturalMemory key="deep-time-cultural" />
      ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="gondwana-to-himalaya"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}