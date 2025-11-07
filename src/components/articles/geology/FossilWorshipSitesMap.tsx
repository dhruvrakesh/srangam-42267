import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skull, CheckCircle2, XCircle } from 'lucide-react';
import { fossilWorshipSites, confidenceLevels } from '@/data/geology/fossil-worship-sites-data';
import type { FossilWorshipSite } from '@/data/geology/fossil-worship-sites-data';

export function FossilWorshipSitesMap() {
  const [selectedSite, setSelectedSite] = useState<FossilWorshipSite | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<Set<string>>(
    new Set(['A', 'B', 'C', 'D'])
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleConfidenceFilter = (rating: string) => {
    const newFilter = new Set(confidenceFilter);
    if (newFilter.has(rating)) {
      newFilter.delete(rating);
    } else {
      newFilter.add(rating);
    }
    setConfidenceFilter(newFilter);
  };

  const getMarkerColor = (rating: string) => {
    const level = confidenceLevels.find(l => l.rating === rating);
    return level?.color || '#6b7280';
  };

  const filteredSites = fossilWorshipSites.filter(site =>
    confidenceFilter.has(site.confidenceRating)
  );

  if (!isMounted) {
    return (
      <Card className="my-8">
        <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
          <Skull className="w-6 h-6 animate-pulse mr-2" />
          Loading fossil worship sites map...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 bg-sandalwood/40 border-burgundy/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-laterite" />
          Fossil Worship Sites Across India: Confidence-Rated Geomythology
        </CardTitle>
        <CardDescription>
          Pan-India distribution of sites where geological specimens intersect with devotional practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Filter */}
        <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg">
          <span className="font-medium text-sm">Filter by confidence:</span>
          {confidenceLevels.map(level => (
            <label key={level.rating} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={confidenceFilter.has(level.rating)}
                onCheckedChange={() => toggleConfidenceFilter(level.rating)}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: level.color }}
              />
              <span className="text-sm">
                {level.rating} - {level.label}
              </span>
            </label>
          ))}
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={[23.5, 80.0]}
            zoom={5}
            style={{ height: '600px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredSites.map(site => (
              <Marker
                key={site.id}
                position={site.coordinates}
                icon={L.divIcon({
                  className: 'custom-marker',
                  html: `<div style="background-color: ${getMarkerColor(site.confidenceRating)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
                eventHandlers={{
                  click: () => setSelectedSite(site)
                }}
              >
                <Popup className="max-w-sm">
                  <div className="text-sm">
                    <h4 className="font-semibold text-base mb-2">{site.name}</h4>
                    <div className="space-y-2">
                      <div>
                        <strong>Fossil Type:</strong>
                        <p className="text-muted-foreground">{site.fossilType}</p>
                      </div>
                      <div>
                        <strong>Geological Age:</strong>
                        <p className="text-muted-foreground">{site.geologicalAge}</p>
                      </div>
                      <div>
                        <strong>Deity Association:</strong>
                        <p className="text-muted-foreground">{site.deityAssociation}</p>
                      </div>
                      <div>
                        <strong>Cultural Practice:</strong>
                        <p className="text-muted-foreground">{site.culturalPractice}</p>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getMarkerColor(site.confidenceRating),
                            color: getMarkerColor(site.confidenceRating)
                          }}
                        >
                          Confidence: {site.confidenceRating}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {site.confidenceExplanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-sm">Confidence Rating System</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {confidenceLevels.map(level => (
              <div key={level.rating} className="flex items-start gap-2">
                <div
                  className="w-5 h-5 rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: level.color }}
                />
                <div>
                  <div className="font-medium">
                    {level.rating}: {level.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {level.criteria}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Site Detail */}
        {selectedSite && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2 flex items-center justify-between">
              <span>{selectedSite.name}, {selectedSite.state}</span>
              <Badge
                variant={selectedSite.stillWorshipped ? 'default' : 'secondary'}
                className="ml-2"
              >
                {selectedSite.stillWorshipped ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active Worship
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Historical Only
                  </>
                )}
              </Badge>
            </h4>

            <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <h5 className="font-medium mb-2">Geological Context</h5>
                <p className="mb-1"><strong>Fossil:</strong> {selectedSite.fossilType}</p>
                <p className="mb-1"><strong>Age:</strong> {selectedSite.geologicalAge}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedSite.confidenceExplanation}
                </p>
              </div>

              <div>
                <h5 className="font-medium mb-2">Cultural Context</h5>
                <p className="mb-1"><strong>Deity:</strong> {selectedSite.deityAssociation}</p>
                <p className="text-muted-foreground">{selectedSite.culturalPractice}</p>
              </div>
            </div>

            {selectedSite.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <h5 className="font-medium text-xs mb-2">Academic Sources</h5>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {selectedSite.sources.map((source, idx) => (
                    <li key={idx}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Site Count */}
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredSites.length} of {fossilWorshipSites.length} sites
          {filteredSites.length !== fossilWorshipSites.length && ' (use filters above to show more)'}
        </div>
      </CardContent>
    </Card>
  );
}
