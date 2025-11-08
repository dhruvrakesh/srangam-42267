import React, { useState } from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort, IconMonsoon, IconDharmaChakra } from '@/components/icons';
import { indianOceanPowerNetworksComplete } from '@/data/articles/indian-ocean-power-networks-complete';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { 
  ExpandableSection, 
  InteractiveQuote, 
  ContextualSidebar, 
  createHistoricalContext, 
  createGeographicalContext,
  DynamicTimeline,
  createTimelineEvent,
  ParagraphWithHighlight,
  createHighlights,
  annotations
} from '@/components/articles/enhanced';
import { MapPin, Ship, Coins, Wind, Crown, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import assets
import romanAmphora from '@/assets/roman-amphora_archaeology_4x3_v1.jpg';
import romanCoins from '@/assets/roman-coins_numismatics_3x2_v1.jpg';
import monsoonRoutes from '@/assets/monsoon-routes_historical-map_16x9_v1.jpg';
import berenikeArtifacts from '@/assets/berenike-artifacts_archaeology_4x3_v1.jpg';

const MadhyadeshaTimeline = () => {
  const events = [
    createTimelineEvent("300-bce", "300 BCE", "Early Malabar Trade", "Tamil Sangam literature first describes Yavana (Western) merchants arriving at Muziris", "trade", { location: "Coastal India", significance: "Marks the beginning of documented Indo-Western maritime commerce", expandable: true, details: "Archaeological evidence from Arikamedu and other sites supports Tamil literary accounts of early foreign trade." }),
    createTimelineEvent("30-bce", "30 BCE", "Roman Egypt Annexation", "Rome gains control of Red Sea ports, opening direct sailing routes to India", "political", { location: "Egypt", significance: "Created the infrastructure for large-scale Indo-Roman trade", expandable: true, details: "This annexation allowed Romans to bypass Ptolemaic middlemen and trade directly with Indian ports." }),
    createTimelineEvent("50-ce", "50 CE", "Hippalus Navigation", "Greek navigator documents monsoon wind patterns for Arabian Sea crossing", "discovery", { location: "Arabian Sea", significance: "Made direct ocean crossings faster and more reliable", expandable: true, details: "Hippalus learned from existing Indian maritime knowledge, not discovering these routes independently." }),
    createTimelineEvent("77-ce", "77 CE", "Pliny's Trade Complaint", "Elder Pliny records Rome's massive trade deficit with India: 50 million sesterces annually", "trade", { location: "Rome", significance: "Documents the scale of Indo-Roman spice trade", expandable: true, details: "Pliny's complaint reveals how economically significant the pepper trade had become for both empires." }),
    createTimelineEvent("120-ce", "120 CE", "Muziris Papyrus", "Roman tax document records 3 tons of pepper cargo valued at 9 million sesterces", "trade", { location: "Egypt", significance: "Provides concrete evidence of spice trade volumes and values" }),
    createTimelineEvent("408-ce", "408 CE", "Alaric's Pepper Ransom", "Visigothic king demands 3,000 pounds of pepper as part of Rome's ransom", "political", { location: "Rome", significance: "Shows pepper's status as a strategic commodity even in warfare" }),
    createTimelineEvent("1014-ce", "1014 CE", "Rajendra's Accession", "Rajendra Chola I begins reign, marking the peak of Chola maritime power", "political", { location: "Tamil Nadu", significance: "Sets stage for unprecedented naval expansion", expandable: true, details: "Rajendra inherited a powerful navy from his father Rajaraja I and expanded it further." }),
    createTimelineEvent("1025-ce", "1025 CE", "Chola Naval Expedition", "Rajendra's fleet strikes Srivijaya across 3,000km, capturing 14 ports including Palembang and Kedah", "political", { location: "Southeast Asia", significance: "Demonstrates Indian blue-water naval capability and breaks Srivijayan hegemony", expandable: true, details: "This expedition required sophisticated logistics, navigation, and coordination across vast ocean distances." }),
    createTimelineEvent("1088-ce", "1088 CE", "Diplomatic Restoration", "Srivijayan embassy reaches Chola court under Kulottunga I", "political", { location: "Tamil Nadu", significance: "Shows restoration of peaceful relations after the naval conflict" })
  ];

  return <DynamicTimeline events={events} title="Indian Ocean Power Timeline" filterByType={true} />;
};

const TradeRouteMap = () => (
  <div className="space-y-6">
    <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
      <Wind className="h-5 w-5 text-ocean" />
      Maritime Networks of Ancient Asia
    </h3>
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <svg viewBox="0 0 800 500" className="w-full h-80">
          {/* Background ocean */}
          <rect width="800" height="500" fill="hsl(var(--ocean)/0.1)" />
          
          {/* Indian subcontinent outline */}
          <path d="M200 180 Q250 150 300 180 L320 220 Q300 280 250 300 L200 280 Z" fill="hsl(var(--sand))" stroke="hsl(var(--sand-dark))" strokeWidth="2" />
          <text x="260" y="200" className="text-sm font-medium text-foreground fill-current" textAnchor="middle">भारत</text>
          <text x="260" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">Bhārata</text>
          
          {/* Malabar Coast ports */}
          <circle cx="220" cy="250" r="5" fill="hsl(var(--gold))" stroke="hsl(var(--gold-dark))" strokeWidth="1" />
          <text x="180" y="255" className="text-xs font-medium text-foreground fill-current">Muziris</text>
          
          <circle cx="230" cy="270" r="4" fill="hsl(var(--gold))" stroke="hsl(var(--gold-dark))" strokeWidth="1" />
          <text x="190" y="275" className="text-xs text-foreground fill-current">Tyndis</text>
          
          {/* Coromandel Coast ports */}
          <circle cx="300" cy="240" r="4" fill="hsl(var(--burgundy))" stroke="hsl(var(--burgundy-dark))" strokeWidth="1" />
          <text x="310" y="245" className="text-xs font-medium text-foreground fill-current">Puhar</text>
          
          <circle cx="310" cy="260" r="5" fill="hsl(var(--burgundy))" stroke="hsl(var(--burgundy-dark))" strokeWidth="1" />
          <text x="320" y="265" className="text-xs font-medium text-foreground fill-current">Nagapattinam</text>
          
          {/* Red Sea ports */}
          <circle cx="120" cy="200" r="4" fill="hsl(var(--laterite))" stroke="hsl(var(--laterite-dark))" strokeWidth="1" />
          <text x="80" y="205" className="text-xs text-foreground fill-current">Berenike</text>
          
          <circle cx="130" cy="180" r="4" fill="hsl(var(--laterite))" stroke="hsl(var(--laterite-dark))" strokeWidth="1" />
          <text x="90" y="185" className="text-xs text-foreground fill-current">Myos Hormos</text>
          
          {/* Southeast Asian regions */}
          <ellipse cx="500" cy="320" rx="60" ry="30" fill="hsl(var(--emerald)/0.3)" stroke="hsl(var(--emerald))" strokeWidth="2" />
          <text x="500" y="315" className="text-sm font-medium text-foreground fill-current" textAnchor="middle">Suvarnabhumi</text>
          <text x="500" y="330" className="text-xs text-muted-foreground fill-current" textAnchor="middle">(Southeast Asia)</text>
          
          {/* Srivijaya ports */}
          <circle cx="480" cy="340" r="4" fill="hsl(var(--crimson))" stroke="hsl(var(--crimson-dark))" strokeWidth="1" />
          <text x="440" y="345" className="text-xs text-foreground fill-current">Palembang</text>
          
          <circle cx="520" cy="300" r="4" fill="hsl(var(--crimson))" stroke="hsl(var(--crimson-dark))" strokeWidth="1" />
          <text x="525" y="305" className="text-xs text-foreground fill-current">Kedah</text>
          
          {/* Trade routes */}
          {/* Malabar-Red Sea pepper route */}
          <path d="M140 190 Q180 210 220 250" fill="none" stroke="hsl(var(--gold))" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#pepper-arrow)" />
          <text x="180" y="180" className="text-xs text-gold fill-current">Pepper Route</text>
          
          {/* Chola naval routes to Southeast Asia */}
          <path d="M310 260 Q400 280 480 340" fill="none" stroke="hsl(var(--burgundy))" strokeWidth="3" markerEnd="url(#naval-arrow)" />
          <path d="M300 240 Q410 260 520 300" fill="none" stroke="hsl(var(--burgundy))" strokeWidth="3" markerEnd="url(#naval-arrow)" />
          <text x="400" y="250" className="text-xs text-burgundy fill-current">Chola Naval Routes</text>
          
          {/* Monsoon wind indicators */}
          <g>
            <path d="M350 150 Q400 140 450 160" fill="none" stroke="hsl(var(--ocean))" strokeWidth="2" markerEnd="url(#wind-arrow)" />
            <path d="M450 180 Q400 170 350 190" fill="none" stroke="hsl(var(--ocean))" strokeWidth="2" markerEnd="url(#wind-arrow)" />
            <text x="400" y="130" className="text-xs text-ocean fill-current" textAnchor="middle">SW Monsoon</text>
            <text x="400" y="210" className="text-xs text-ocean fill-current" textAnchor="middle">NE Monsoon</text>
          </g>
          
          {/* Legend */}
          <g transform="translate(50, 400)">
            <rect x="0" y="0" width="300" height="80" fill="hsl(var(--background))" stroke="hsl(var(--border))" rx="4" />
            <text x="10" y="20" className="text-xs font-semibold text-foreground fill-current">Maritime Trade Networks</text>
            
            <circle cx="20" cy="35" r="3" fill="hsl(var(--gold))" />
            <text x="30" y="40" className="text-xs text-foreground fill-current">Malabar Spice Ports</text>
            
            <circle cx="150" cy="35" r="3" fill="hsl(var(--burgundy))" />
            <text x="160" y="40" className="text-xs text-foreground fill-current">Chola Naval Bases</text>
            
            <circle cx="20" cy="55" r="3" fill="hsl(var(--laterite))" />
            <text x="30" y="60" className="text-xs text-foreground fill-current">Red Sea Ports</text>
            
            <circle cx="150" cy="55" r="3" fill="hsl(var(--crimson))" />
            <text x="160" y="60" className="text-xs text-foreground fill-current">Srivijayan Ports</text>
          </g>
          
          {/* Arrow markers */}
          <defs>
            <marker id="pepper-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0l10 5-10 5z" fill="hsl(var(--gold))" />
            </marker>
            <marker id="naval-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0l10 5-10 5z" fill="hsl(var(--burgundy))" />
            </marker>
            <marker id="wind-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M0 0l10 5-10 5z" fill="hsl(var(--ocean))" />
            </marker>
          </defs>
        </svg>
      </CardContent>
    </Card>
  </div>
);

const EconomicImpactChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-gold" />
        Economic Scale of the Pepper Trade
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gold/10 rounded-lg border border-gold/20">
            <div className="text-2xl font-bold text-gold">50M</div>
            <div className="text-sm text-muted-foreground">Sesterces annually</div>
            <div className="text-xs text-muted-foreground mt-1">Roman trade deficit with India</div>
          </div>
          <div className="text-center p-4 bg-burgundy/10 rounded-lg border border-burgundy/20">
            <div className="text-2xl font-bold text-burgundy">3 tons</div>
            <div className="text-sm text-muted-foreground">Pepper per ship</div>
            <div className="text-xs text-muted-foreground mt-1">Single cargo documented in Muziris Papyrus</div>
          </div>
          <div className="text-center p-4 bg-laterite/10 rounded-lg border border-laterite/20">
            <div className="text-2xl font-bold text-laterite">14</div>
            <div className="text-sm text-muted-foreground">Ports captured</div>
            <div className="text-xs text-muted-foreground mt-1">In Rajendra's 1025 CE naval campaign</div>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Pepper's Strategic Value</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Currency for ransoms (Alaric, 408 CE)</li>
              <li>• Medicine and preservative</li>
              <li>• Status symbol in Roman society</li>
              <li>• Essential for religious ceremonies</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Naval Campaign Impact</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Broke Srivijayan trade monopoly</li>
              <li>• Opened direct China-India routes</li>
              <li>• Established Tamil merchant presence</li>
              <li>• Demonstrated Indian naval reach</li>
            </ul>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Using multilingual content from data file - no hardcoded content needed

const sidebarItems = [
  ...createHistoricalContext(
    "1st-11th centuries CE",
    "Classical to Medieval period",
    "Peak era of Indian Ocean trade networks and naval power projection"
  ),
  ...createGeographicalContext(
    "Indian Ocean basin from Arabian Sea to South China Sea",
    "Modern Kerala, Tamil Nadu, Egypt, Sumatra, Malaysia",
    "Maritime trading networks connecting three continents through monsoon navigation"
  )
];

export default function IndianOceanPowerNetworks() {
  const [activeSection, setActiveSection] = useState("introduction");

  const contentForNarration = typeof indianOceanPowerNetworksComplete.content === 'object'
    ? ((indianOceanPowerNetworksComplete.content as any).en as string || '')
    : indianOceanPowerNetworksComplete.content as string;

  const highlights = createHighlights([
    { text: "black gold", type: "concept", tooltip: "Pepper was so valuable it was used as currency" },
    { text: "monsoon winds", type: "concept", tooltip: "Seasonal wind patterns that enabled direct ocean crossings" },
    { text: "Rajendra Chola I", type: "person", tooltip: "Chola emperor who launched the naval expedition to Southeast Asia" }
  ]);

  return (
    <>
      <div className="relative">
      <ContextualSidebar items={sidebarItems} position="right" />
      
      <ArticlePage
        title={indianOceanPowerNetworksComplete.title}
        dek={indianOceanPowerNetworksComplete.dek}
        content={indianOceanPowerNetworksComplete.content}
        tags={indianOceanPowerNetworksComplete.tags}
        icon={IconDharmaChakra}
        readTime={24}
        author="Nartiang Foundation"
        date="2024-03-28"
        dataComponents={[
          // Hero section with interactive map
          <div key="hero-section" className="space-y-8">
            <ResponsiveImage
              src="/images/hero_indian-ocean_aerial_21x9_v1.png"
              alt="Aerial view of the Indian Ocean showing ancient maritime trade routes"
              aspectRatio="wide"
              caption="The Indian Ocean: Maritime highway of the ancient world"
              credit="Srangam Digital Archives"
              className="mb-8"
            />
            <TradeRouteMap />
          </div>,

          // Interactive tabbed content for main sections
          <Tabs key="main-tabs" defaultValue="spice-circuit" className="w-full my-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spice-circuit" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Spice Networks
              </TabsTrigger>
              <TabsTrigger value="naval-power" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Naval Expeditions
              </TabsTrigger>
              <TabsTrigger value="cultural-exchange" className="flex items-center gap-2">
                <IconDharmaChakra className="h-4 w-4" />
                Cultural Exchange
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spice-circuit" className="space-y-8 mt-8">
              <ExpandableSection 
                title="The Malabar–Red Sea Spice Circuit" 
                type="info" 
                defaultExpanded={true}
                icon={<IconMonsoon className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <ParagraphWithHighlight
                    highlights={highlights}
                    annotation={annotations.historicalNote("The spice trade was India's first global industry")}
                  >
                    The Malabar Coast of South India was known to ancient traders as the land of <strong>black gold</strong>—pepper, 
                    the most sought-after spice in the ancient world. From the legendary port of Muziris, ships laden with 
                    peppercorns sailed across the Arabian Sea, following <strong>monsoon winds</strong> that Indian navigators 
                    had mastered for millennia.
                  </ParagraphWithHighlight>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveImage
                      src={romanAmphora}
                      alt="Roman amphora found at ancient Indian ports"
                      aspectRatio="portrait"
                      caption="Roman amphora from Muziris excavations"
                      credit="Archaeological collection"
                    />
                    <ResponsiveImage
                      src={romanCoins}
                      alt="Roman gold coins found in South India"
                      aspectRatio="portrait"
                      caption="Roman aureus coins—evidence of the 'gold drain' to India"
                      credit="Numismatic evidence"
                    />
                  </div>

                  <InteractiveQuote
                    author="Pliny the Elder"
                    source="Natural History"
                    date="77 CE"
                    type="historical"
                    expandable={true}
                    context="Pliny was documenting Rome's growing concern about its trade deficit with India and other Eastern regions."
                  >
                    "India, China and Arabia take 100 million sesterces from our Empire every year—that is the sum 
                    which our luxuries and our women cost us."
                  </InteractiveQuote>

                  <EconomicImpactChart />
                </div>
              </ExpandableSection>

              <ExpandableSection title="Archaeological Evidence" type="detail" icon={<MapPin className="h-5 w-5" />}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveImage
                    src={berenikeArtifacts}
                    alt="Preserved peppercorns from Berenike excavations"
                    aspectRatio="landscape"
                    caption="7.5kg of Indian peppercorns from 1st century CE Berenike"
                    credit="Archaeological excavation"
                  />
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg font-semibold">Time Capsule of Trade</h4>
                    <p className="text-muted-foreground">
                      In 1999, archaeologists at Berenike uncovered the largest cache of ancient pepper ever found—
                      7.5 kilograms of peppercorns still fragrant after two millennia. This discovery, along with 
                      Roman coins, Indian textiles, and Chinese silk, reveals the truly global nature of ancient 
                      Indian Ocean commerce.
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Key Archaeological Finds</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Over 200 Roman coin hoards in South India</li>
                        <li>• Indian inscriptions in Southeast Asia</li>
                        <li>• Chinese ceramics at Indian ports</li>
                        <li>• Tamil merchant guild records abroad</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ExpandableSection>
            </TabsContent>

            <TabsContent value="naval-power" className="space-y-8 mt-8">
              <ExpandableSection 
                title="Rajendra's Ocean: The 1025 CE Naval Campaign" 
                type="info" 
                defaultExpanded={true}
                icon={<Anchor className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <ParagraphWithHighlight
                    highlights={[
                      { text: "Rajendra Chola I", type: "person", tooltip: "Chola emperor (r. 1014-1044 CE)" },
                      { text: "blue-water navy", type: "concept", tooltip: "Navy capable of operating far from coastal waters" },
                      { text: "Srivijaya", type: "location", tooltip: "Maritime empire controlling Southeast Asian trade routes" }
                    ]}
                    annotation={annotations.keyPoint("First documented long-range naval expedition from India")}
                  >
                    Under <strong>Rajendra Chola I</strong>, South India developed the ancient world's most formidable 
                    <strong>blue-water navy</strong>. In 1025 CE, Rajendra launched an unprecedented naval expedition 
                    against <strong>Srivijaya</strong>, the maritime empire that controlled the vital Straits of Malacca.
                  </ParagraphWithHighlight>

                  <ResponsiveImage
                    src="/images/scene_chola-fleet_bronze_21x9_v2.png"
                    alt="Artistic depiction of Chola naval fleet"
                    aspectRatio="wide"
                    caption="The Chola fleet crossing the Bay of Bengal, 1025 CE"
                    credit="Maritime heritage reconstruction"
                  />

                  <div className="bg-burgundy/5 border border-burgundy/20 rounded-lg p-6">
                    <h4 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-burgundy" />
                      Strategic Objectives
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-semibold mb-2">Economic Motives</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Break Srivijayan trade monopoly</li>
                          <li>• Secure direct China-India routes</li>
                          <li>• Protect Tamil merchant guilds</li>
                          <li>• Access Southeast Asian resources</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">Geopolitical Goals</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Demonstrate naval supremacy</li>
                          <li>• Support Khmer allies against rivals</li>
                          <li>• Establish tributary relationships</li>
                          <li>• Project power across the ocean</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <InteractiveQuote
                    author="Chola Inscription"
                    source="Thanjavur Temple"
                    date="1025 CE"
                    type="historical"
                    expandable={true}
                    context="This inscription commemorates Rajendra's naval victory, listing the conquered territories."
                  >
                    "The king who conquered the ocean with ships and seized Sangrama Vijayottungavarman, 
                    the king of Kadaram, together with his war-elephants, war-treasures and the jeweled 
                    archway called Vidhyadhara Torana..."
                  </InteractiveQuote>
                </div>
              </ExpandableSection>

              <ExpandableSection title="Naval Technology & Logistics" type="detail" icon={<Ship className="h-5 w-5" />}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Ship className="h-8 w-8 text-ocean mx-auto mb-2" />
                        <h4 className="font-semibold text-sm">Ship Design</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Large war vessels with multiple masts, capable of carrying troops and supplies across 3,000km
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Wind className="h-8 w-8 text-ocean mx-auto mb-2" />
                        <h4 className="font-semibold text-sm">Navigation</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mastery of monsoon patterns, celestial navigation, and detailed knowledge of Southeast Asian waters
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Anchor className="h-8 w-8 text-ocean mx-auto mb-2" />
                        <h4 className="font-semibold text-sm">Strategy</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Surprise attack via open ocean, avoiding expected coastal routes and Srivijayan naval defenses
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ExpandableSection>
            </TabsContent>

            <TabsContent value="cultural-exchange" className="space-y-8 mt-8">
              <ExpandableSection 
                title="South India and Southeast Asia: Connected Histories" 
                type="info" 
                defaultExpanded={true}
                icon={<IconDharmaChakra className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <ParagraphWithHighlight
                    highlights={[
                      { text: "Indianization", type: "concept", tooltip: "Process of Indian cultural influence in Southeast Asia" },
                      { text: "Tamil merchant guilds", type: "concept", tooltip: "Organized trading communities operating internationally" },
                      { text: "Sanskrit inscriptions", type: "concept", tooltip: "Evidence of Indian cultural and religious influence" }
                    ]}
                    annotation={annotations.insight("Cultural exchange preceded and outlasted political conquests")}
                  >
                    The maritime networks carried more than goods—they transported ideas, religions, and artistic traditions. 
                    The process of <strong>Indianization</strong> in Southeast Asia involved <strong>Tamil merchant guilds</strong> 
                    establishing permanent settlements, while <strong>Sanskrit inscriptions</strong> appeared from Cambodia to Indonesia.
                  </ParagraphWithHighlight>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-serif text-lg font-semibold">Legends of Indian Origins</h4>
                      <p className="text-muted-foreground text-sm">
                        Southeast Asian chronicles speak of Indian princes founding local dynasties. The tale of Kaundinya 
                        and Soma in Cambodia, where an Indian Brahmin marries a Naga princess to establish the first kingdom, 
                        symbolizes this cultural fusion.
                      </p>
                      <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sm mb-2">Evidence of Exchange</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Tamil inscriptions in Thailand and Malaysia</li>
                          <li>• Indian temple architecture in Southeast Asia</li>
                          <li>• Hindu-Buddhist kingdoms across the region</li>
                          <li>• Shared artistic and literary traditions</li>
                        </ul>
                      </div>
                    </div>
                    <ResponsiveImage
                      src="/images/recon_bujang-valley_portscape_16x9_v1.png"
                      alt="Reconstruction of ancient Bujang Valley port"
                      aspectRatio="video"
                      caption="Bujang Valley: Ancient Indian trading settlement in Malaysia"
                      credit="Archaeological reconstruction"
                    />
                  </div>
                </div>
              </ExpandableSection>
            </TabsContent>
          </Tabs>,

          // Timeline component
          <div key="timeline-section" className="my-12">
            <MadhyadeshaTimeline />
          </div>,

          // Related articles section
          <div key="related-articles" className="my-12 p-6 bg-gradient-to-r from-burgundy/5 to-cream/10 rounded-lg border border-burgundy/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Explore Connected Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Maritime Heritage</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Discover more about ancient Indian navigation, port cities, and the monsoon-based trading systems 
                  that connected civilizations across the ocean.
                </p>
                <Link to="/riders-on-monsoon">
                  <Button variant="outline" size="sm">
                    Indigenous Navigation Systems
                  </Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Cultural Networks</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Explore how scripts, religions, and artistic traditions traveled the same routes as spices and 
                  gold, creating the cultural landscape of maritime Asia.
                </p>
                <Link to="/scripts-that-sailed">
                  <Button variant="outline" size="sm">
                    Scripts Across the Ocean
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ]}
      />
      </div>
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="indian-ocean-power-networks"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}