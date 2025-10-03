import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconBasalt } from '@/components/icons/IconBasalt';
import { Map as MapIcon, Layers, MapPin, X } from 'lucide-react';

interface GeoSite {
  type: string;
  properties: {
    name: string;
    type: string;
    age: string;
    significance: string;
    confidence: 'A' | 'B' | 'C' | 'D';
    site: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface GeoSitesData {
  type: string;
  features: GeoSite[];
}

export const GeoHeritageMap: React.FC = () => {
  const [sites, setSites] = useState<GeoSitesData | null>(null);
  const [selectedSite, setSelectedSite] = useState<GeoSite | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetch('/data/geology/geological_sites.geojson')
      .then(res => res.json())
      .then(data => setSites(data))
      .catch(err => console.error('Error loading geological sites:', err));
  }, []);

  if (!sites) {
    return (
      <Card className="my-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-yellow-500';
      case 'C': return 'bg-orange-500';
      case 'D': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const filterSites = (sites: GeoSite[]) => {
    if (filter === 'all') return sites;
    return sites.filter(site => 
      site.properties.type.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const filteredSites = filterSites(sites.features);

  const siteTypes = Array.from(new Set(sites.features.map(s => s.properties.type)));

  return (
    <Card className="my-8 border-primary/20 bg-gradient-to-br from-emerald-950/10 to-stone-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBasalt className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Figure 1: India's Geo-Heritage Localities</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="gap-2"
          >
            <MapIcon className="h-4 w-4" />
            {showMap ? 'Hide' : 'Show'} Map
          </Button>
        </div>
        <CardDescription>
          Key fossil sites and sacred geological localities across the Indian subcontinent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map Placeholder - Would integrate MapLibre here */}
        {showMap && (
          <div className="relative bg-muted/50 rounded-lg p-8 h-96 flex items-center justify-center border border-border">
            <div className="text-center space-y-4">
              <MapIcon className="h-16 w-16 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Interactive Map</p>
                <p className="text-xs text-muted-foreground max-w-md">
                  Full interactive map with satellite imagery, geological overlays, and site markers 
                  would be integrated here using MapLibre GL JS for production deployment.
                </p>
                <Badge variant="secondary" className="text-xs">MapLibre Integration Point</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setFilter('all')}
          >
            <Layers className="h-3 w-3 mr-1" />
            All Sites ({sites.features.length})
          </Badge>
          {siteTypes.slice(0, 5).map(type => (
            <Badge
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setFilter(type)}
            >
              {type}
            </Badge>
          ))}
        </div>

        {/* Sites Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site, idx) => (
            <Card 
              key={idx} 
              className="border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedSite(site)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm leading-tight">{site.properties.name}</CardTitle>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getConfidenceColor(site.properties.confidence)} flex-shrink-0 mt-1`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">{site.properties.age}</Badge>
                  <Badge variant="outline" className="text-xs">{site.properties.type}</Badge>
                </div>
                <p className="text-muted-foreground">{site.properties.site}</p>
                <p className="text-xs line-clamp-2">{site.properties.significance}</p>
                <p className="text-xs text-muted-foreground">
                  {site.geometry.coordinates[1].toFixed(2)}°N, {site.geometry.coordinates[0].toFixed(2)}°E
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Site Detail */}
        {selectedSite && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{selectedSite.properties.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedSite.properties.site}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSite(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedSite.properties.age}</Badge>
                  <Badge variant="outline">{selectedSite.properties.type}</Badge>
                  <Badge 
                    className="gap-1"
                    style={{ backgroundColor: getConfidenceColor(selectedSite.properties.confidence).replace('bg-', '') }}
                  >
                    <div className={`w-2 h-2 rounded-full bg-white`} />
                    Confidence: {selectedSite.properties.confidence}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Significance</h4>
                    <p className="text-sm text-muted-foreground">{selectedSite.properties.significance}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Coordinates</h4>
                    <p className="text-sm font-mono text-muted-foreground">
                      {selectedSite.geometry.coordinates[1].toFixed(4)}°N, {' '}
                      {selectedSite.geometry.coordinates[0].toFixed(4)}°E
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                  <p>
                    <strong>Note:</strong> Sites marked with high confidence (A-B) have extensive peer-reviewed 
                    documentation and stratigraphic control. Lower confidence sites (C-D) represent preliminary 
                    identifications or require further geological verification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold">Confidence Levels:</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>A: High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>B: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>C: Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>D: Preliminary</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            These localities represent intersections of geological significance and cultural memory—where 
            fossils become śāligrāmas, where river channels preserve Vedic geography, and where basalt flows 
            mark cosmic dissolutions. Each site is georeferenced for integration with GIS and remote sensing data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
