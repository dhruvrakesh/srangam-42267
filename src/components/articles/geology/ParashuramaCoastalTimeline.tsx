import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const coastalPhases = [
  {
    period: "~10,000 BP",
    yearBP: 10000,
    event: "Post-Glacial Sea Level Rise Begins",
    description: "Holocene warming causes rapid glacial melt and sea level rise along the western coast",
    coastline: "Ancient coastline ~100m below current level",
    color: "hsl(var(--chart-1))"
  },
  {
    period: "~8,000 BP",
    yearBP: 8000,
    event: "Konkan-Malabar Coastal Emergence",
    description: "Formation of modern coastal plain as sea levels stabilize",
    coastline: "Western Ghats foothills exposed as coastal plains emerge",
    color: "hsl(var(--chart-2))"
  },
  {
    period: "~6,000 BP",
    yearBP: 6000,
    event: "Paraśurāma Kṣetra Formation",
    description: "Traditional dating of Paraśurāma's land reclamation from Gokarṇa to Kanyākumārī",
    coastline: "Modern coastline established",
    color: "hsl(var(--chart-3))"
  },
  {
    period: "~4,000 BP",
    yearBP: 4000,
    event: "Nāga Settlement Period",
    description: "Archaeological evidence of coastal settlements and serpent worship sites",
    coastline: "Stabilized coastal ecosystem with estuaries and backwaters",
    color: "hsl(var(--chart-4))"
  }
];

const nagaShrines = [
  { name: "Anantaśayana Viṣṇu, Trivandrum", lat: "8.5°N", lon: "76.9°E", description: "Viṣṇu reclining on Ananta serpent" },
  { name: "Mannarasala Nāgarāja, Kerala", lat: "9.3°N", lon: "76.3°E", description: "Ancient serpent grove temple" },
  { name: "Subrahmaṇya, Kukke", lat: "12.9°N", lon: "75.4°E", description: "Nāga worship in Western Ghats foothills" },
  { name: "Kāśyapa Shrine, Gokarna", lat: "14.5°N", lon: "74.3°E", description: "Starting point of Paraśurāma Kṣetra" }
];

export function ParashuramaCoastalTimeline() {
  return (
    <Card className="my-8 bg-sandalwood/40 border-burgundy/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-laterite" />
          Paraśurāma Coast: Holocene Sea-Level Changes
        </CardTitle>
        <CardDescription>
          Geological timeline of coastal emergence and cultural memory of land reclamation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Coastal Evolution Timeline</h4>
          <div className="relative border-l-2 border-burgundy/30 pl-6 space-y-8">
            {coastalPhases.map((phase, idx) => (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div 
                  className="absolute -left-[28px] w-6 h-6 rounded-full border-4 border-background"
                  style={{ backgroundColor: phase.color }}
                />
                
                {/* Content */}
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-base">{phase.event}</h5>
                    <span className="text-xs font-mono bg-primary/10 px-2 py-1 rounded">
                      {phase.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                  <div className="text-xs text-primary/70 italic">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {phase.coastline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nāga Shrines */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Nāga Worship Sites (North to South)</h4>
          <ScrollArea className="h-[200px] rounded-lg border border-border bg-muted/10 p-4">
            <div className="space-y-3">
              {nagaShrines.map((shrine, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 bg-background/50 rounded-md border border-border hover:bg-accent/10 transition-colors"
                >
                  <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{shrine.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {shrine.lat}, {shrine.lon}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 italic">
                      {shrine.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Legend */}
        <div className="bg-muted/30 p-3 rounded-lg text-sm">
          <strong>Note:</strong> Timeline correlates geological sea-level changes with Purāṇic narratives 
          of Paraśurāma's land reclamation and the establishment of coastal Nāga shrines marking ancient 
          settlement patterns.
        </div>
      </CardContent>
    </Card>
  );
}
