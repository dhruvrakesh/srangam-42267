import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconMonsoon, IconPort, IconConch } from '@/components/icons';
import { MapPin, Wind, Ship, Calendar, Filter } from 'lucide-react';

interface GeoFeature {
  type: string;
  properties: {
    name: string;
    type: string;
    country: string;
    era_tags: string;
    notes: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface RouteAtlasProps {
  geoData: {
    type: string;
    features: GeoFeature[];
  };
}

export function RouteAtlas({ geoData }: RouteAtlasProps) {
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedPort, setSelectedPort] = useState<GeoFeature | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const eras = React.useMemo(() => {
    const eraSet = new Set<string>();
    geoData.features.forEach(feature => {
      feature.properties.era_tags.split(';').forEach(era => {
        eraSet.add(era.trim());
      });
    });
    return ['all', ...Array.from(eraSet)];
  }, [geoData]);

  const filteredPorts = React.useMemo(() => {
    return geoData.features.filter(feature => {
      const layerMatch = selectedLayer === 'all' || feature.properties.type.includes(selectedLayer);
      const eraMatch = selectedEra === 'all' || feature.properties.era_tags.includes(selectedEra);
      return layerMatch && eraMatch;
    });
  }, [geoData, selectedLayer, selectedEra]);

  const getPortIcon = (type: string) => {
    if (type.includes('Ancient')) return <IconPort className="text-ocean" size={20} />;
    if (type.includes('Harappan')) return <IconConch className="text-lotus-pink" size={20} />;
    return <Ship className="text-peacock-blue" size={20} />;
  };

  const getMonsoonArrows = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* SW Monsoon (June-September) */}
        <div className="absolute top-1/3 left-1/4 flex items-center text-peacock-blue">
          <Wind size={16} className="rotate-45" />
          <span className="text-xs ml-1 bg-background/80 px-1 rounded">SW</span>
        </div>
        
        {/* NE Monsoon (October-January) */}
        <div className="absolute top-2/3 right-1/4 flex items-center text-ocean">
          <Wind size={16} className="rotate-225" />
          <span className="text-xs ml-1 bg-background/80 px-1 rounded">NE</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <IconMonsoon size={32} className="text-peacock-blue" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Route Atlas</h2>
          <IconPort size={32} className="text-ocean" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Navigate the monsoon-governed maritime networks from Harappan dockyards to 
          medieval emporia, following wind patterns and cultural currents.
        </p>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="routes">Trade Routes</TabsTrigger>
          <TabsTrigger value="monsoons">Wind Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex gap-2 items-center">
              <Filter size={16} />
              <span className="text-sm font-medium">Layer:</span>
              {['all', 'Ancient port', 'Port', 'Harappan'].map(layer => (
                <Button
                  key={layer}
                  variant={selectedLayer === layer ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLayer(layer)}
                  className="text-xs"
                >
                  {layer === 'all' ? 'All Ports' : layer}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Calendar size={16} />
              <span className="text-sm font-medium">Era:</span>
              {eras.slice(0, 5).map(era => (
                <Button
                  key={era}
                  variant={selectedEra === era ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEra(era)}
                  className="text-xs"
                >
                  {era === 'all' ? 'All' : era}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simplified Map Area */}
            <div className="lg:col-span-2">
              <Card className="h-96 bg-gradient-to-br from-ocean/5 via-peacock-blue/5 to-lotus-pink/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin size={20} />
                    Indian Ocean Maritime Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative h-64">
                  {getMonsoonArrows()}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Interactive Map Visualization
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {filteredPorts.length} ports • {selectedEra === 'all' ? 'All eras' : selectedEra} period
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Port Details Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Port Directory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredPorts.map((port, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/30 ${
                        selectedPort?.properties.name === port.properties.name 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => setSelectedPort(port)}
                    >
                      <div className="flex items-start gap-2">
                        {getPortIcon(port.properties.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {port.properties.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {port.properties.country}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {port.properties.notes}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {port.properties.era_tags.split(';').map((era, eraIdx) => (
                              <Badge key={eraIdx} variant="outline" className="text-xs">
                                {era.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship size={20} className="text-ocean" />
                  Arabian Sea Circuit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Barygaza (Bharuch) → Red Sea ports</li>
                  <li>• Muziris → Socotra → Aden</li>
                  <li>• Monsoon-timed departures (June/October)</li>
                  <li>• Pepper, pearls, textiles outbound</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship size={20} className="text-peacock-blue" />
                  Bay of Bengal Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Tamralipta → Malacca Straits</li>
                  <li>• Puhar → Sri Lankan ports → Southeast Asia</li>
                  <li>• Kalinga sailors to Java/Sumatra</li>
                  <li>• Spices, textiles, cultural transmission</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monsoons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-peacock-blue/10 to-peacock-blue/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind size={20} className="text-peacock-blue" />
                  Southwest Monsoon (June-September)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Enables westward voyages to Arabia/Africa</li>
                  <li>• Ships depart Indian ports in June</li>
                  <li>• Return journey uses NE monsoon</li>
                  <li>• Critical for Red Sea trade</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-ocean/10 to-ocean/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind size={20} className="text-ocean" />
                  Northeast Monsoon (October-January)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Facilitates eastward voyages to Southeast Asia</li>
                  <li>• Return from Arabian Sea in winter</li>
                  <li>• Bay of Bengal crossings optimal</li>
                  <li>• Cultural festival season coincides</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}