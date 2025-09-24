import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconBasalt } from '@/components/icons';
import { earthSeaSangam } from '@/data/articles/earth-sea-sangam';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { PlateSpeedChart } from '@/components/articles/PlateSpeedChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpandableSection } from '@/components/articles/enhanced/ExpandableSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const content = `In January 2024, a joint team of geologists and archaeologists conducted a survey along Kerala's coastline and the foothills of the Western Ghats. Their mission: to map ancient shorelines and sediment deposits that might pinpoint the locations of long-lost ports. Using ground-penetrating radar and sediment core analysis, the team discovered evidence of a paleo-shoreline several kilometers inland from the present coast, as well as sand deposits high up the Periyar River valley. These findings suggest that massive floods and tectonic movements over centuries have dramatically reshaped South India's coastal geography. Indeed, one of the enduring mysteries of Indian history is how a port as prominent as Muziris "disappeared so completely" from the map. Geology holds part of the answer.

This paper explores the dynamic interplay between geological forces – from plate tectonics and earthquakes to sedimentation and sea-level changes – and the maritime history of South India. We examine how coastlines shifted, rivers changed course, and some bustling ancient harbors were left high and dry (or drowned under the sea), drawing on geological surveys and historical accounts. In weaving together geology and history, we gain a deeper appreciation of how Southern India's landscape itself has been an actor in the rise and fall of its maritime hubs.

## Peninsular India: A Geological Prologue

The Indian subcontinent's geological story is one of grand tectonic movements. Over 100 million years ago, the landmass that is now India broke away from the supercontinent Gondwana and drifted northward, eventually colliding with the Eurasian plate about 50 million years ago – a titanic impact that lifted up the Himalayas in the north. Peninsular (South) India, however, lies on the Indian Shield – an ancient, relatively stable crustal block. Unlike the geologically volatile Himalayan belt, South India's bedrock is old and hard, comprised of Dharwar cratons and granite-gneiss foundations.

Yet, "stable" is not static: the very rifting that sent India careening north also created the Western Ghats and the coastal outline we know. The Western Ghats mountain range is essentially a monumental rift escarpment – it marks where India's western margin was once connected to Madagascar and Africa, and was raised when the western edge of India split off during the late Cretaceous. The coastline of Kerala, Karnataka and Tamil Nadu's west – running parallel to the Ghats – is thus a classic rifted continental margin, characterized by straight coastlines and an offshore shelf that dips steeply.

<ResponsiveImage 
  src="/images/geology/western-ghats-cross-section.jpg"
  alt="Geological cross-section of the Western Ghats showing the ancient rift escarpment structure with granite-gneiss foundation and how the mountains formed when India separated from Madagascar"
  aspectRatio="landscape"
  caption="The Western Ghats rift escarpment - geological evidence of India's separation from Gondwana"
  credit="Geological Survey visualization"
/>

Geological evidence shows that in deep prehistory, large tracts of what are now coastal plains were under the sea (when global sea levels were higher), and conversely at times the sea retreated far out. By the Quaternary period (last 2.5 million years), the broad shape of South India's coasts had formed and remained relatively stable in terms of tectonics. Unlike the Pacific "Ring of Fire," the Indian Ocean's midsection has fewer active plate boundaries near India (the closest major one is the Sunda Trench near Indonesia). However, the Indian plate's collision stress does manifest in peninsular India through occasional intraplate earthquakes and slight warping of the crust.

## Shifting Sands: Rivers and Sedimentation

Perhaps the most relentless sculptors of the South Indian coast have been its rivers and monsoons. The Western Ghats, as the first barrier to the southwest monsoon, force intense rainfall on the western slope. This not only nourishes lush biodiversity, but also causes tremendous erosion – mountains weathered, soil washed down – and all that sediment eventually travels to the sea via rivers. Over millennia, this process has built out deltas and altered river mouths, affecting harbors situated on them.

A prime example is the Cauvery River in Tamil Nadu. In antiquity, the Cauvery delta hosted the famous Chola port of Kaveripattinam (Puhār) at its mouth. Sangam literature celebrated Puhār's richness until, as recounted in the epic Manimekalai, a cataclysmic sea surge destroyed it. Geologically, what likely happened was a combination of factors: a gradually subsiding coast due to deltaic sediment load, plus either a tsunami or an exceptional storm in the 3rd century CE that inundated the city.

The National Institute of Oceanography (NIO) conducted underwater excavations off present-day Poompuhar and indeed found man-made structures (wharf remains, brick walls, ring wells) in 6–8 meters depth. Radiocarbon dating of these showed they were last above water around the 2nd century CE. This aligns with the literary date of Puhār's fall, strongly suggesting that coastal erosion and sudden marine transgression swallowed parts of the city. Today, Poompuhar is an open beach with only scant archaeological remains on land – the rest lies under the waves.

<ResponsiveImage 
  src="/images/archaeology/poompuhar-underwater.jpg"
  alt="Underwater archaeological excavation at Poompuhar showing submerged brick walls, ring wells and stone structures from the ancient Chola port of Kaveripattinam"
  aspectRatio="landscape"
  caption="Submerged ruins of Kaveripattinam (Puhār) discovered by NIO at 6-8m depth in the Bay of Bengal"
  credit="National Institute of Oceanography archives"
/>

The Periyar River in Kerala offers another case. Muziris was situated on its banks about 20 km from the Arabian Sea. For centuries it thrived, but then essentially vanished. Local folklore and some records pointed to a devastating flood in 1341 CE as the culprit. Geological studies confirm that in 1341, a massive flood (possibly linked to an earthquake triggering a landslide upriver, or just an extreme monsoon event) dumped colossal amounts of silt, choking the Periyar's old channel.

The river violently changed course, carving a new outlet to the sea farther north at Kodungallur, while the old Muziris harbor silted up completely. The New Indian Express notes that this "Puthuvype" flood created new land like the Vypin Island in Kerala and essentially formed the modern Kochi harbor as a byproduct. Satellite imagery of the Periyar's delta shows a patchwork of lagoons and silt flats – nature's testimony to that event.

For the people of medieval Kerala, it must have been shocking: their premier port rendered unusable almost overnight by nature's fury. Yet, in an adaptive twist, the new port of Kochi soon rose in the aftermath, illustrating how geological change closed one chapter (Muziris) and opened another (Cochin).

<ResponsiveImage 
  src="/images/reconstructions/muziris-flood-1341.jpg"
  alt="Historical reconstruction of the catastrophic 1341 CE Periyar flood showing the destruction of Muziris port and the birth of modern Kochi harbor"
  aspectRatio="wide"
  caption="The Great Flood of 1341 CE: How geological forces transformed Kerala's maritime landscape overnight"
  credit="Historical reconstruction based on geological evidence"
/>

## The Great Flood of 1341: A Geological Turning Point

<ResponsiveImage 
  src="/images/coastal/kochi-formation-aerial.jpg"
  alt="Aerial satellite view of Kochi harbor and Periyar delta showing the complex backwater system, Vypin Island, and geographic features created by the 1341 flood"
  aspectRatio="wide"
  caption="Modern Kochi harbor system: Islands and backwaters formed by the massive sedimentation of 1341 CE"
  credit="Satellite imagery analysis"
/>

The flood of 1341 CE stands as one of the most dramatic examples of how geological events reshape maritime history. According to contemporary accounts and geological evidence, the Periyar River experienced an unprecedented flood that fundamentally altered Kerala's coastline and port geography.`;

// Enhanced Flood Consequences Component
const FloodConsequences = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
      Consequences of the 1341 Flood
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-card border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full"></div>
            Muziris Abandoned
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            The ancient port was completely silted over, ending nearly 2,000 years of continuous maritime trade
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-ocean/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-ocean flex items-center gap-2">
            <div className="w-2 h-2 bg-ocean rounded-full"></div>
            Kochi's Birth
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            The new river mouth created the protected harbor that would become modern Kochi
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-sage/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-sage flex items-center gap-2">
            <div className="w-2 h-2 bg-sage rounded-full"></div>
            New Landforms Created
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Islands like Vypin were formed from deposited sediments, reshaping the coastline
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-amber/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-amber flex items-center gap-2">
            <div className="w-2 h-2 bg-amber rounded-full"></div>
            Commercial Shift
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Merchant families relocated from Kodungallur to the new port facilities
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Geological Triggers Component
const GeologicalTriggers = () => (
  <ExpandableSection 
    title="Geological Causes of the 1341 Flood"
    type="detail"
    defaultExpanded={false}
  >
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Badge variant="destructive" className="mt-1">Tectonic</Badge>
        <div>
          <h4 className="font-medium text-foreground mb-1">Seismic Trigger</h4>
          <p className="text-sm text-muted-foreground">
            Seismic activity in the Western Ghats may have triggered massive landslides upstream, 
            creating natural dams that eventually burst.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <Badge variant="secondary" className="mt-1">Climate</Badge>
        <div>
          <h4 className="font-medium text-foreground mb-1">Extreme Monsoon</h4>
          <p className="text-sm text-muted-foreground">
            The flood coincided with an exceptionally intense southwest monsoon, 
            saturating the Western Ghats and causing widespread erosion.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="mt-1">Hydraulic</Badge>
        <div>
          <h4 className="font-medium text-foreground mb-1">River Dynamics</h4>
          <p className="text-sm text-muted-foreground">
            The massive sediment load overwhelmed the Periyar's existing channel, 
            forcing it to carve an entirely new course to the sea.
          </p>
        </div>
      </div>
    </div>
  </ExpandableSection>
);

// Coastal Evolution Timeline Component
const CoastalEvolutionTimeline = () => (
  <div className="space-y-6">
    <h3 className="font-serif text-lg font-semibold text-foreground">
      Major Geological Events Affecting South Indian Ports
    </h3>
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-ocean/30"></div>
      
      {/* Events */}
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">c. 300 CE</Badge>
            <h4 className="font-semibold text-foreground">Puhār Tsunami/Storm Surge</h4>
            <p className="text-sm text-muted-foreground">
              Major Chola port of Kaveripattinam submerged by catastrophic marine event. 
              Archaeological evidence found 6-8m underwater off modern Poompuhar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">1341 CE</Badge>
            <h4 className="font-semibold text-foreground">Great Periyar Flood</h4>
            <p className="text-sm text-muted-foreground">
              Massive flood silts up Muziris harbor, creates Vypin Island, and births 
              modern Kochi port. Transforms Kerala's entire coastal geography.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">c. 1400 BCE</Badge>
            <h4 className="font-semibold text-foreground">Dwarka Submergence (Proposed)</h4>
            <p className="text-sm text-muted-foreground">
              Possible seismic event submerges original Dwarka in Gulf of Cambay, 
              preserved in cultural memory as Krishna's city beneath the waves.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">7000-11000 years ago</Badge>
            <h4 className="font-semibold text-foreground">Post-Glacial Sea Level Rise</h4>
            <p className="text-sm text-muted-foreground">
              60m sea level rise in Gulf of Mannar drowns coastal areas, preserved 
              in Tamil cultural memory as the lost lands of Kumari Kandam.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Port Migration Visualization
const PortMigrationMap = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">
      How Ports Moved: Geological Change and Commercial Adaptation
    </h3>
    <div className="bg-card p-6 rounded-lg border">
      <svg viewBox="0 0 600 400" className="w-full h-64">
        {/* Western Ghats */}
        <path d="M50 50 L50 350" stroke="hsl(var(--laterite))" strokeWidth="8" />
        <text x="25" y="200" className="text-xs text-muted-foreground fill-current" transform="rotate(-90 25 200)">
          Western Ghats
        </text>
        
        {/* Coastline (simplified) */}
        <path d="M120 80 Q200 100 280 120 Q400 140 550 160" stroke="hsl(var(--ocean))" strokeWidth="3" fill="none" />
        
        {/* Ancient ports (lost) */}
        <circle cx="180" cy="95" r="6" fill="hsl(var(--destructive))" opacity="0.7" />
        <text x="190" y="100" className="text-xs text-destructive fill-current">Muziris (lost 1341)</text>
        
        <circle cx="420" cy="145" r="6" fill="hsl(var(--destructive))" opacity="0.7" />
        <text x="430" y="150" className="text-xs text-destructive fill-current">Puhār (lost c.300)</text>
        
        {/* New ports */}
        <circle cx="200" cy="110" r="6" fill="hsl(var(--ocean))" />
        <text x="210" y="115" className="text-xs text-ocean fill-current">Kochi (born 1341)</text>
        
        <circle cx="380" cy="135" r="6" fill="hsl(var(--ocean))" />
        <text x="390" y="140" className="text-xs text-ocean fill-current">Nagapattinam</text>
        
        {/* Migration arrows */}
        <path d="M185 100 Q195 105 205 105" stroke="hsl(var(--ocean))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <path d="M415 148 Q405 142 385 140" stroke="hsl(var(--ocean))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        
        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--ocean))" />
          </marker>
        </defs>
        
        {/* Legend */}
        <g transform="translate(400, 250)">
          <rect x="0" y="0" width="180" height="80" fill="hsl(var(--background))" stroke="hsl(var(--border))" rx="4" />
          <text x="10" y="20" className="text-sm font-medium text-foreground fill-current">Port Evolution</text>
          <circle cx="20" cy="35" r="4" fill="hsl(var(--destructive))" opacity="0.7" />
          <text x="30" y="39" className="text-xs text-muted-foreground fill-current">Geological destruction</text>
          <circle cx="20" cy="55" r="4" fill="hsl(var(--ocean))" />
          <text x="30" y="59" className="text-xs text-muted-foreground fill-current">New port emergence</text>
        </g>
      </svg>
    </div>
    <p className="text-sm text-muted-foreground">
      When geological forces destroyed established ports, maritime communities didn't disappear—they 
      relocated to take advantage of new harbors or safer locations created by the same natural processes.
    </p>
  </div>
);

// Sea Level Change Visualization
const SeaLevelChart = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">
      Post-Glacial Sea Level Rise in South India
    </h3>
    <div className="bg-card p-6 rounded-lg border">
      <svg viewBox="0 0 500 250" className="w-full h-48">
        {/* Axes */}
        <line x1="50" y1="200" x2="450" y2="200" stroke="hsl(var(--border))" strokeWidth="1" />
        <line x1="50" y1="50" x2="50" y2="200" stroke="hsl(var(--border))" strokeWidth="1" />
        
        {/* Sea level curve */}
        <path d="M50 50 Q150 60 250 120 Q350 160 450 180" 
              stroke="hsl(var(--ocean))" strokeWidth="3" fill="none" />
        
        {/* Fill area under curve */}
        <path d="M50 200 L50 50 Q150 60 250 120 Q350 160 450 180 L450 200 Z" 
              fill="hsl(var(--ocean)/0.2)" />
        
        {/* Time markers */}
        <text x="50" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">15ka</text>
        <text x="150" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">12ka</text>
        <text x="250" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">9ka</text>
        <text x="350" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">6ka</text>
        <text x="450" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">3ka</text>
        
        {/* Sea level markers */}
        <text x="40" y="55" className="text-xs text-muted-foreground fill-current" textAnchor="end">-60m</text>
        <text x="40" y="110" className="text-xs text-muted-foreground fill-current" textAnchor="end">-30m</text>
        <text x="40" y="155" className="text-xs text-muted-foreground fill-current" textAnchor="end">-15m</text>
        <text x="40" y="185" className="text-xs text-muted-foreground fill-current" textAnchor="end">0m</text>
        
        {/* Labels */}
        <text x="250" y="40" className="text-sm font-medium text-foreground fill-current" textAnchor="middle">Sea Level Rise (Gulf of Mannar)</text>
        <text x="250" y="240" className="text-xs text-muted-foreground fill-current" textAnchor="middle">Years Before Present (ka = thousand years)</text>
        
        {/* Cultural memory annotation */}
        <circle cx="200" cy="90" r="3" fill="hsl(var(--destructive))" />
        <text x="210" y="85" className="text-xs text-destructive fill-current">Kumari Kandam</text>
        <text x="210" y="95" className="text-xs text-destructive fill-current">submergence</text>
      </svg>
    </div>
    <p className="text-sm text-muted-foreground">
      The dramatic 60-meter sea level rise between 15,000-7,000 years ago drowned vast coastal areas, 
      creating the cultural memory preserved as "Kumari Kandam" in Tamil literature.
    </p>
  </div>
);

export default function EarthSeaSangam() {
  return (
    <ArticlePage
      title={earthSeaSangam.title}
      dek={earthSeaSangam.dek}
      content={earthSeaSangam.content}
      tags={earthSeaSangam.tags}
      icon={IconBasalt}
      readTime={16}
      author="Nartiang Foundation"
      date="2024-03-28"
      dataComponents={[
        <ResponsiveImage
          key="manuscript"
          src="/lovable-uploads/22a4564d-b68b-4de5-891a-57f148d12703.png"
          alt="Ancient coastal survey manuscript showing geological observations"
          caption="Ancient palm-leaf manuscript containing geological observations of coastal changes, from the Kerala State Archives"
        />,
        <ResponsiveImage 
          src="/images/geology/sea-level-rise-gulf-mannar.jpg"
          alt="Scientific visualization of post-glacial sea level rise in the Gulf of Mannar showing submerged landbridge between India and Sri Lanka"
          aspectRatio="landscape"
          caption="Submerged landscapes of the Gulf of Mannar: Evidence for the 'Kumari Kandam' tradition"
          credit="Oceanographic survey data"
        />,
        <GeologicalTriggers key="triggers" />,
        <FloodConsequences key="consequences" />,
        <PortMigrationMap key="migration" />,
        <SeaLevelChart key="sea-level" />,
        <PlateSpeedChart key="plate-speed" />,
        <Card key="trilogy-nav" className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-foreground">
              Maritime Memories of South India: Complete Trilogy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Badge variant="secondary">Part 1</Badge>
                <h4 className="font-medium text-foreground">Emporia of the Ocean</h4>
                <p className="text-sm text-muted-foreground">Archaeological evidence of Indo-Roman trade networks</p>
                <a href="/maritime-memories-south-india" className="text-ocean hover:text-ocean/80 text-sm font-medium">
                  → Read Part 1
                </a>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Part 2</Badge>
                <h4 className="font-medium text-foreground">Riders on the Monsoon</h4>
                <p className="text-sm text-muted-foreground">Indigenous navigation and maritime knowledge systems</p>
                <a href="/riders-on-monsoon" className="text-ocean hover:text-ocean/80 text-sm font-medium">
                  → Read Part 2
                </a>
              </div>
              <div className="space-y-2">
                <Badge variant="default">Part 3 - Current</Badge>
                <h4 className="font-medium text-foreground">Earth, Sea and Sangam</h4>
                <p className="text-sm text-muted-foreground">Geological forces shaping maritime history</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ]}
    />
  );
}