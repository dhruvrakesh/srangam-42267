import { ArticlePage } from '@/components/articles/ArticlePage';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { stonePurana } from '@/data/articles/stone-purana';
import { IconBasalt } from '@/components/icons/IconBasalt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Placeholder for Figure 1: Geographic Distribution (Phase 3)
const SitesLocatorFigure = () => (
  <Card className="my-8 border-amber-500/20 bg-gradient-to-br from-amber-950/10 to-stone-950/10">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <IconBasalt className="h-5 w-5 text-amber-600" />
        Figure 1: India's Geo-Heritage Localities
      </CardTitle>
      <CardDescription>Geographic distribution of key fossil sites</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">SVG Figure to be integrated in Phase 3</p>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
    </CardContent>
  </Card>
);

// Placeholder for Figure 2: Deep Time Timeline (Phase 3)
const DeepTimeTimelineFigure = () => (
  <Card className="my-8 border-amber-500/20 bg-gradient-to-br from-amber-950/10 to-stone-950/10">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <IconBasalt className="h-5 w-5 text-amber-600" />
        Figure 2: Geological Timeline
      </CardTitle>
      <CardDescription>From Permian Gondwana to Quaternary hominins (252 Ma → Present)</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-center h-96 bg-muted/50 rounded-lg">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">Deep Time Timeline SVG to be integrated in Phase 3</p>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
    </CardContent>
  </Card>
);

// Quick glossary sample (5 key terms)
const GlossaryQuickMap = () => (
  <Card className="my-8 border-primary/20">
    <CardHeader>
      <CardTitle className="text-lg">Sanskrit ↔ Geology: Quick Reference</CardTitle>
      <CardDescription>Key terms that bridge sacred texts and earth science</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-[1fr_2fr] gap-4 pb-2 border-b">
          <div className="font-semibold">Sanskrit/Hindi</div>
          <div className="font-semibold">Geological Context</div>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <div className="text-primary">प्रलय (pralaya)</div>
          <div>Mass extinction events (Permian-Triassic, K-Pg boundary)</div>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <div className="text-primary">शालिग्राम (śāligrāma)</div>
          <div>Ammonite fossils (Jurassic-Cretaceous cephalopods)</div>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <div className="text-primary">डेक्कन-लामेटा</div>
          <div>Deccan Traps basalt flows + Lameta Formation (68-66 Ma)</div>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <div className="text-primary">गोंडवाना</div>
          <div>Gondwana Supergroup (Permian-Triassic coal measures)</div>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <div className="text-primary">सिवालिक</div>
          <div>Siwalik Group molasse (Miocene-Pleistocene "fossil library")</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Related geology articles
const RelatedGeologyArticles = () => (
  <Card className="my-8 border-primary/20">
    <CardHeader>
      <CardTitle className="text-lg">Related: Geology & Deep Time</CardTitle>
      <CardDescription>Explore the trilogy of geo-heritage narratives</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Link to="/gondwana-to-himalaya" className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="font-semibold text-sm">Gondwana to Himalaya</div>
        <p className="text-xs text-muted-foreground">India's tectonic journey from supercontinent to collision zone</p>
      </Link>
      <Link to="/earth-sea-sangam" className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="font-semibold text-sm">Earth-Sea Saṅgam</div>
        <p className="text-xs text-muted-foreground">How geological forces shaped maritime history and port migrations</p>
      </Link>
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="font-semibold text-sm flex items-center gap-2">
          Stone Purāṇa
          <Badge variant="secondary" className="text-xs">Current Article</Badge>
        </div>
        <p className="text-xs text-muted-foreground">India's geo-heritage as living sacred geography</p>
      </div>
    </CardContent>
  </Card>
);

export default function StonePurana() {
  return (
    <ArticlePage
      title={stonePurana.title}
      dek={stonePurana.dek}
      content={stonePurana.content}
      tags={stonePurana.tags}
      icon={IconBasalt}
      readTime={38}
      author="Nartiang Foundation Geo-Heritage Team"
      date="2025-10-03"
      dataComponents={[
        <ResponsiveImage
          key="cover"
          src="/images/geology/western-ghats-cross-section.jpg"
          alt="Western Ghats geological cross-section showing Deccan Traps basalt layers"
          caption="The Deccan Traps: 68-66 million years of volcanic history frozen in stone"
          className="rounded-lg shadow-2xl mb-8"
        />,
        <SitesLocatorFigure key="fig1" />,
        <DeepTimeTimelineFigure key="fig2" />,
        <GlossaryQuickMap key="glossary" />,
        <ResponsiveImage
          key="fossil"
          src="/images/archaeology/poompuhar-underwater.jpg"
          alt="Underwater archaeological remains showing stone structures"
          caption="Submerged sites along India's coasts: where geology meets mythology"
          className="rounded-lg shadow-2xl my-8"
        />,
        <RelatedGeologyArticles key="related" />
      ]}
    />
  );
}
