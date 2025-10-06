import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { sacredTreeHarvestRhythms } from '@/data/articles/sacred-tree-harvest-rhythms';
import { IconLotus } from '@/components/icons';
import { FestivalCalendar } from '@/components/articles/FestivalCalendar';
import { SacredTreeMap } from '@/components/articles/SacredTreeMap';
import { SacredTreeSpeciesGallery } from '@/components/articles/SacredTreeSpeciesGallery';
import { HarvestRhythmsTimeline } from '@/components/articles/HarvestRhythmsTimeline';
import { MegalithAndGroveViewer } from '@/components/articles/MegalithAndGroveViewer';
import { TreeRiteEcologyMatrix } from '@/components/articles/TreeRiteEcologyMatrix';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const SeriesBanner = () => (
  <div className="bg-primary/5 border-l-4 border-primary px-6 py-4 mb-8">
    <div className="flex items-center gap-2 mb-2">
      <Badge variant="outline">Part 1 of 2</Badge>
      <span className="text-sm font-medium">Sacred Ecology Series</span>
    </div>
    <p className="text-sm text-muted-foreground">
      Exploring ritual calendars through living trees, groves, and harvest festivals.
      <Link to="/stone-song-and-sea" className="text-primary hover:underline ml-2">
        Continue to Part 2: Stone, Song, and Sea →
      </Link>
    </p>
  </div>
);

export default function SacredTreeHarvestRhythms() {
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SeriesBanner />
      </div>
      <ArticlePage
        title={sacredTreeHarvestRhythms.title}
        dek={sacredTreeHarvestRhythms.dek}
        content={sacredTreeHarvestRhythms.content}
        tags={sacredTreeHarvestRhythms.tags}
        icon={IconLotus}
        readTime={26}
        author="Nartiang Foundation Research Team"
        date="2025-10-06"
        dataComponents={[
          <SacredTreeMap key="map" />,
          <HarvestRhythmsTimeline key="timeline" />,
          <TreeRiteEcologyMatrix key="matrix" />,
          <SacredTreeSpeciesGallery key="species" />,
          <MegalithAndGroveViewer key="megaliths" />,
          <FestivalCalendar key="festival" />
        ]}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Continue the Series</h3>
            <p className="text-sm text-muted-foreground mb-3">
              For methodological foundations and case studies exploring petroglyphs, megaliths, and acoustic sites, see:
            </p>
            <Link to="/stone-song-and-sea" className="text-primary hover:underline font-medium">
              Part 2: Stone, Song, and Sea — Janajāti Memory from Petroglyphs to Monoliths →
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              This companion article examines the material <em>venues</em> (stone sites, acoustic spaces, megalithic gardens) where the living <em>scores</em> of ritual practice unfold across millennia.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
