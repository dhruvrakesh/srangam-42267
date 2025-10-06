import { ArticlePage } from '@/components/articles/ArticlePage';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { stoneSongAndSea } from '@/data/articles/stone-song-and-sea';
import { IconLotus } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  AcousticArchaeologyViewer,
  CupuleChronologyTimeline,
  PassPalimpsestViewer,
  FloodStratigraphyDiagram,
  OralArchivePlayer,
  RitualSoundscapeMap,
  LawscapeVisualization,
  LittoralCalendarViewer,
  VenueVsScoreExplainer,
  CounterPositionsPanel,
  MegalithAndGroveViewer
} from '@/components/articles';

// Series context banner
const SeriesBanner = () => (
  <div className="mb-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="outline">Part 2 of 2</Badge>
      <span className="text-sm font-medium">Sacred Ecology Series</span>
    </div>
    <p className="text-sm leading-relaxed text-muted-foreground">
      <Link to="/sacred-tree-harvest-rhythms" className="text-primary hover:underline font-medium">
        ← Start with Part 1: Under the Sacred Tree
      </Link>
      {' '}for living ritual practices (trees, groves, harvest festivals). Part 2 examines the material <em>venues</em> (stone sites, acoustic spaces, megalithic gardens) where these <em>scores</em> persist across millennia.
    </p>
  </div>
);

// Related articles
const RelatedArticles = () => (
  <div className="my-12 p-6 rounded-lg bg-muted/30 border border-border">
    <h3 className="text-lg font-semibold mb-4">Related Deep Dives</h3>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Link to="/janajati-oral-traditions" className="block p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <div className="font-medium text-sm mb-1">Janajāti Oral Traditions</div>
        <p className="text-xs text-muted-foreground">Fire altars, flood memories, and indigenous epistemology</p>
      </Link>
      <Link to="/cosmic-island-sacred-land" className="block p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <div className="font-medium text-sm mb-1">Cosmic Island, Sacred Land</div>
        <p className="text-xs text-muted-foreground">Sacred geography and place-keeping across Bhāratavarṣa</p>
      </Link>
      <Link to="/gondwana-to-himalaya" className="block p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <div className="font-medium text-sm mb-1">Gondwana to Himalaya</div>
        <p className="text-xs text-muted-foreground">India's tectonic journey and deep time chronology</p>
      </Link>
    </div>
  </div>
);

export default function StoneSongAndSea() {
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SeriesBanner />
      </div>
      <ArticlePage
        title={stoneSongAndSea.title}
        dek={stoneSongAndSea.dek}
        content={stoneSongAndSea.content}
        tags={stoneSongAndSea.tags}
        icon={IconLotus}
        readTime={32}
        author="Nartiang Foundation Research Team"
        date="2025-10-06"
        dataComponents={[
          <VenueVsScoreExplainer key="methodology-explainer" />,
          <AcousticArchaeologyViewer key="kupgal-acoustic" />,
          <CupuleChronologyTimeline key="daraki-cupules" />,
          <PassPalimpsestViewer key="edakkal-pass" />,
          <MegalithAndGroveViewer key="nartiang-megaliths" />,
          <FloodStratigraphyDiagram key="hastinapura-flood" />,
          <OralArchivePlayer key="andaman-oral" />,
          <RitualSoundscapeMap key="drum-soundscape" />,
          <LawscapeVisualization key="lawscape-pairing" />,
          <LittoralCalendarViewer key="littoral-calendar" />,
          <CounterPositionsPanel key="counter-positions" />,
          <RelatedArticles key="related-articles" />
        ]}
      />
    </>
  );
}
