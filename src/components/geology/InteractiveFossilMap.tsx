import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Map, BookOpen, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface FossilSite {
  id: string;
  name: string;
  coordinates: [number, number];
  age: string;
  ageNumeric: number;
  period: string;
  fossils: string[];
  significance: string;
  culturalContext: string;
  confidence: 'A' | 'B' | 'C' | 'D';
  references: string[];
  articleSection: string;
  modernLocation: string;
  excavationStatus: string;
}

interface FossilMapData {
  sites: FossilSite[];
  legendCategories: Array<{
    period: string;
    color: string;
    ageRange: string;
  }>;
  confidenceLegend: Record<string, {
    label: string;
    description: string;
    color: string;
  }>;
}

export function InteractiveFossilMap() {
  const [data, setData] = useState<FossilMapData | null>(null);
  const [selectedSite, setSelectedSite] = useState<FossilSite | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'schematic' | 'satellite'>('schematic');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetch('/data/geology/fossil_sites_detailed.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <Card className="my-8">
        <CardContent className="p-12 text-center text-muted-foreground">
          Loading fossil site map...
        </CardContent>
      </Card>
    );
  }

  const filteredSites = filterPeriod === 'all' 
    ? data.sites 
    : data.sites.filter(site => site.period.includes(filterPeriod));

  const handleSiteClick = (site: FossilSite) => {
    setSelectedSite(site);
    setSheetOpen(true);
  };

  const getConfidenceColor = (confidence: string) => {
    const colors = {
      'A': 'hsl(var(--chart-1))',
      'B': 'hsl(var(--chart-3))',
      'C': 'hsl(var(--chart-4))',
      'D': 'hsl(var(--destructive))'
    };
    return colors[confidence as keyof typeof colors] || colors.B;
  };

  return (
    <>
      <Card className="my-8 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Map className="h-6 w-6 text-primary" />
                India's Geo-Heritage: Fossil Localities
              </CardTitle>
              <CardDescription className="mt-2">
                Interactive map of key paleontological sites across India. Click markers to explore each location.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tabs for view mode */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'schematic' | 'satellite')}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="schematic">
                <Layers className="h-4 w-4 mr-2" />
                Schematic
              </TabsTrigger>
              <TabsTrigger value="satellite">
                <Map className="h-4 w-4 mr-2" />
                Context View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schematic" className="mt-6">
              <div className="relative bg-muted/30 rounded-lg p-4 min-h-[500px]">
                <img 
                  src="/images/geology/stone_purana_fig1_locator.svg" 
                  alt="Fossil locality map of India"
                  className="w-full h-auto"
                />
                
                {/* Interactive markers overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => handleSiteClick(site)}
                      className="absolute pointer-events-auto group"
                      style={{
                        left: `${((site.coordinates[1] - 68) / (95 - 68)) * 100}%`,
                        top: `${100 - ((site.coordinates[0] - 8) / (36 - 8)) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      aria-label={`View details for ${site.name}`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-background shadow-lg transition-transform group-hover:scale-150"
                        style={{ backgroundColor: getConfidenceColor(site.confidence) }}
                      />
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border z-10">
                        {site.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="satellite" className="mt-6 space-y-4">
              <ScrollArea className="h-[500px] rounded-lg border p-4">
                <div className="space-y-4">
                  {filteredSites.map((site) => (
                    <Card 
                      key={site.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSiteClick(site)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{site.name}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: getConfidenceColor(site.confidence), color: 'white' }}
                          >
                            {site.confidence}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {site.age} • {site.period}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground">{site.modernLocation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Period filter chips */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={filterPeriod === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterPeriod('all')}
            >
              All Periods
            </Badge>
            {data.legendCategories.map((cat) => (
              <Badge
                key={cat.period}
                variant={filterPeriod === cat.period ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterPeriod(cat.period)}
              >
                {cat.period} ({cat.ageRange})
              </Badge>
            ))}
          </div>

          {/* Legend */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Geological Periods
              </h4>
              <div className="space-y-1">
                {data.legendCategories.map((cat) => (
                  <div key={cat.period} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full border" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium">{cat.period}:</span>
                    <span className="text-muted-foreground">{cat.ageRange}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Confidence Levels
              </h4>
              <div className="space-y-1">
                {Object.entries(data.confidenceLegend).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full border" 
                      style={{ backgroundColor: value.color }}
                    />
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedSite && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-4">
                  <SheetTitle className="text-xl">{selectedSite.name}</SheetTitle>
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: getConfidenceColor(selectedSite.confidence), color: 'white' }}
                  >
                    Confidence: {selectedSite.confidence}
                  </Badge>
                </div>
                <SheetDescription>
                  {selectedSite.age} • {selectedSite.period}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedSite.modernLocation}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {selectedSite.coordinates[0]}°N, {selectedSite.coordinates[1]}°E
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Fossils</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedSite.fossils.map((fossil, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground italic">{fossil}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Scientific Significance</h4>
                  <p className="text-sm text-muted-foreground">{selectedSite.significance}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Cultural Context</h4>
                  <p className="text-sm text-muted-foreground">{selectedSite.culturalContext}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Excavation Status</h4>
                  <p className="text-sm text-muted-foreground">{selectedSite.excavationStatus}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">References</h4>
                  <ul className="space-y-1">
                    {selectedSite.references.map((ref, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">{ref}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
