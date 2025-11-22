import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull, MapPin, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

type ConfidenceRating = 'A' | 'B' | 'C' | 'D';

interface FossilSite {
  name: string;
  location: string;
  coordinates: string;
  confidence: ConfidenceRating;
  geologicalContext: string;
  culturalContext: string;
  sources: string[];
}

const fossilSites: FossilSite[] = [
  {
    name: "Śālagrāma (Kālī Gandakī Valley)",
    location: "Mustang, Nepal",
    coordinates: "28.8°N, 83.7°E",
    confidence: "A",
    geologicalContext: "Marine fossils (ammonites) from Jurassic Tethys Sea, embedded in black shaligram stones",
    culturalContext: "Viṣṇu's sacred embodiment; collected for home worship and temple installation",
    sources: ["Joshi & Joshi 2004", "Wright 1877"]
  },
  {
    name: "Narmadā Liṅgas (Omkareshwar)",
    location: "Madhya Pradesh",
    coordinates: "22.2°N, 76.1°E", 
    confidence: "A",
    geologicalContext: "Crypto-crystalline quartz pebbles naturally shaped by river erosion",
    culturalContext: "Śiva liṅgas formed by geological processes, considered self-manifested (svayambhū)",
    sources: ["Eck 2012", "Geological Survey of India 1982"]
  },
  {
    name: "Durgā Kund Fossil Grove",
    location: "Varanasi",
    coordinates: "25.3°N, 83.0°E",
    confidence: "B",
    geologicalContext: "Vindhyan sandstone with plant fossil impressions, ~1000-500 Ma",
    culturalContext: "Associated with Devī worship; fossil patterns interpreted as divine markings",
    sources: ["Agrawal 1992", "Field observations"]
  },
  {
    name: "Bāṇāsura Hill Ammonites",
    location: "Wayanad, Kerala",
    coordinates: "11.6°N, 76.1°E",
    confidence: "C",
    geologicalContext: "Cretaceous marine fossils in laterite formations",
    culturalContext: "Local traditions link spiral fossils to the demon king Bāṇāsura's defeat",
    sources: ["Oral traditions", "Geological Survey 2001"]
  },
  {
    name: "Rāmeśvara Coral Formations",
    location: "Rameshwaram, Tamil Nadu",
    coordinates: "9.3°N, 79.3°E",
    confidence: "B",
    geologicalContext: "Raised Pleistocene coral reefs, dated ~125,000 BP",
    culturalContext: "Bridge stones (setubandha) in Rāmāyaṇa narrative; fossilized corals as sacred remnants",
    sources: ["Rao et al. 2003", "Vaidyanadhan & Ramakrishnan 2008"]
  },
  {
    name: "Kīṭham Fossil Park",
    location: "Jhansi, Uttar Pradesh",
    coordinates: "25.4°N, 78.6°E",
    confidence: "A",
    geologicalContext: "Vindhyan fossil wood park with silicified tree trunks, ~500 Ma",
    culturalContext: "Local reverence for petrified trees; some adorned with sindoor and offerings",
    sources: ["Geological Survey of India Protected Site", "Field documentation 2015"]
  },
  {
    name: "Lādnūn Dinosaur Eggs",
    location: "Rajasthan",
    coordinates: "27.6°N, 74.4°E",
    confidence: "C",
    geologicalContext: "Late Cretaceous titanosaur egg nests, ~65 Ma",
    culturalContext: "Folk traditions of 'giant stones' with protective powers; minimal active worship",
    sources: ["Geological Survey of India", "Ethnographic notes"]
  }
];

const confidenceLevels = {
  A: { label: "Well-documented", color: "bg-green-500", description: "Peer-reviewed geological + ethnographic evidence" },
  B: { label: "Established practice", color: "bg-blue-500", description: "Documented worship with geological context" },
  C: { label: "Local tradition", color: "bg-amber-500", description: "Oral traditions with geological features present" },
  D: { label: "Speculative", color: "bg-red-500", description: "Requires further verification" }
};

export function FossilWorshipSitesGrid() {
  const [selectedSite, setSelectedSite] = useState<FossilSite | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<Set<ConfidenceRating>>(
    new Set(['A', 'B', 'C', 'D'])
  );

  const filteredSites = fossilSites.filter(site => confidenceFilter.has(site.confidence));

  const toggleConfidenceFilter = (level: ConfidenceRating) => {
    const newFilter = new Set(confidenceFilter);
    if (newFilter.has(level)) {
      newFilter.delete(level);
    } else {
      newFilter.add(level);
    }
    setConfidenceFilter(newFilter);
  };

  return (
    <Card className="my-8 bg-sandalwood/40 border-burgundy/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-laterite" />
          Fossil Worship Sites Across India
        </CardTitle>
        <CardDescription>
          Geological formations integrated into Hindu sacred geography
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Filter */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Filter by Confidence Level:</h4>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(confidenceLevels) as [ConfidenceRating, typeof confidenceLevels.A][]).map(([level, info]) => (
              <button
                key={level}
                onClick={() => toggleConfidenceFilter(level)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  confidenceFilter.has(level)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 opacity-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${info.color}`} />
                <span className="text-sm font-medium">Level {level}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sites Grid */}
        <ScrollArea className="h-[400px] rounded-lg border border-border bg-muted/10 p-4">
          <div className="grid gap-4">
            {filteredSites.map((site, idx) => (
              <Card
                key={idx}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSite === site ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedSite(site)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-base mb-1">{site.name}</h5>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{site.location}</span>
                        <span className="text-xs text-muted-foreground/70">({site.coordinates})</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${confidenceLevels[site.confidence].color}`} />
                      {site.confidence}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {site.culturalContext}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Selected Site Detail */}
        {selectedSite && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-lg">{selectedSite.name}</h4>
              <Badge className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {confidenceLevels[selectedSite.confidence].label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1">Geological Context</h5>
                <p className="text-sm">{selectedSite.geologicalContext}</p>
              </div>

              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1">Cultural Context</h5>
                <p className="text-sm">{selectedSite.culturalContext}</p>
              </div>

              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1">Sources</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedSite.sources.map((source, idx) => (
                    <li key={idx} className="text-muted-foreground">{source}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <h5 className="font-semibold text-sm">Confidence Rating System</h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {(Object.entries(confidenceLevels) as [ConfidenceRating, typeof confidenceLevels.A][]).map(([level, info]) => (
              <div key={level} className="flex items-start gap-2">
                <div className={`w-3 h-3 rounded-full mt-0.5 ${info.color} flex-shrink-0`} />
                <div>
                  <span className="font-medium">Level {level}:</span> {info.description}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Showing {filteredSites.length} of {fossilSites.length} documented sites
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
