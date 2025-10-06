import { ArticlePage } from '@/components/articles/ArticlePage';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { stoneSongAndSea } from '@/data/articles/stone-song-and-sea';
import { IconBasalt } from '@/components/icons/IconBasalt';
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
  ConfidenceBadge,
  CounterPositionsPanel
} from '@/components/articles';
import { MegalithAndGroveViewer } from '@/components/articles/MegalithAndGroveViewer';

// Series context banner
const SeriesBanner = () => (
  <div className="my-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="secondary">Part 2 of 2</Badge>
      <span className="text-sm text-muted-foreground">Sacred Ecology Series</span>
    </div>
    <p className="text-sm leading-relaxed">
      <Link to="/sacred-tree-harvest-rhythms" className="text-primary hover:underline font-medium">
        Part 1: Under the Sacred Tree
      </Link>
      {' '}explored living ritual practices—the <em>scores</em> of harvest festivals, tree vows, and seasonal calendars. 
      Part 2 examines the material <em>venues</em>: petroglyphs, megaliths, acoustic sites, and the stone infrastructure 
      where these rituals unfold across millennia.
    </p>
  </div>
);

// Related articles
const RelatedArticles = () => (
  <div className="my-8 p-6 rounded-lg bg-muted/30 border border-border">
    <h3 className="text-lg font-semibold mb-4">Related Deep Dives</h3>
    <div className="space-y-3">
      <Link to="/janajati-oral-traditions" className="block p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <div className="font-medium text-sm">Janajāti Oral Traditions</div>
        <p className="text-xs text-muted-foreground">Fire altars, flood memories, and indigenous epistemology</p>
      </Link>
      <Link to="/cosmic-island-sacred-land" className="block p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <div className="font-medium text-sm">Cosmic Island, Sacred Land</div>
        <p className="text-xs text-muted-foreground">Sacred geography and place-keeping across Bhāratavarṣa</p>
      </Link>
      <Link to="/gondwana-to-himalaya" className="block p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <div className="font-medium text-sm">Gondwana to Himalaya</div>
        <p className="text-xs text-muted-foreground">India's tectonic journey and deep time chronology</p>
      </Link>
    </div>
  </div>
);

export default function StoneSongAndSea() {
  return (
    <ArticlePage
      title={stoneSongAndSea.title}
      dek={stoneSongAndSea.dek}
      content={stoneSongAndSea.content}
      tags={stoneSongAndSea.tags}
      icon={IconBasalt}
      readTime={32}
      author="Nartiang Foundation Research Team"
      date="2025-10-06"
      dataComponents={[
        <SeriesBanner key="series-banner" />,
        <ResponsiveImage
          key="cover"
          src="/images/geology/western-ghats-cross-section.jpg"
          alt="Megalithic stones in Nartiang with sacred grove backdrop"
          caption="Nartiang megalithic garden: where stone jurisdiction and grove ecology form integrated lawscape"
          className="rounded-lg shadow-2xl mb-8"
        />,
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
        <ResponsiveImage
          key="harvest-synthesis"
          src="/images/articles/janajati_fig2_oral_memory_timeline.png"
          alt="Harvest festival cross-walk diagram showing venue-score-ecology integration"
          caption="Complete systems: Each harvest tradition integrates venue (stone/grove), score (ritual), and ecology"
          className="rounded-lg shadow-xl my-8"
        />,
        <RelatedArticles key="related-articles" />
      ]}
    />
  );
}
