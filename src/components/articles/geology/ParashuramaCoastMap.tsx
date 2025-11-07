import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Waves } from 'lucide-react';
import { nagaShrines, coastlineLayers, seaLevelTimeline } from '@/data/geology/parashurama-coastal-data';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export function ParashuramaCoastMap() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('modern');
  const [animationProgress, setAnimationProgress] = useState<number>(100);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 100) {
          setIsAnimating(false);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getCurrentYear = () => {
    const maxYearBP = 5000;
    const yearBP = maxYearBP - (animationProgress / 100) * maxYearBP;
    return Math.round(yearBP);
  };

  const getVisibleCoastlines = () => {
    const currentYearBP = getCurrentYear();
    return coastlineLayers.filter(layer => layer.yearBP >= currentYearBP);
  };

  if (!isMounted) {
    return (
      <Card className="my-8">
        <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
          <Waves className="w-6 h-6 animate-pulse mr-2" />
          Loading Paraśurāma coastal emergence map...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 bg-sandalwood/40 border-burgundy/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-ocean" />
          Paraśurāma's Coastal Emergence: Archaeological Sites & Sea-Level Change
        </CardTitle>
        <CardDescription>
          Interactive map showing 21 Nāga shrines and coastline evolution from 3000 BCE to present
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={[10.5, 76.0]}
            zoom={6}
            style={{ height: '600px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Coastlines */}
            {getVisibleCoastlines().map((coastline) => (
              <Polyline
                key={coastline.period}
                positions={coastline.coordinates}
                color={coastline.color}
                weight={3}
                opacity={0.7}
              />
            ))}

            {/* Nāga Shrines */}
            {nagaShrines.map((shrine) => (
              <Marker key={shrine.id} position={shrine.coordinates}>
                <Popup className="max-w-xs">
                  <div className="text-sm">
                    <h4 className="font-semibold text-base mb-1">{shrine.name}</h4>
                    <p className="text-muted-foreground mb-2">{shrine.legend}</p>
                    <div className="space-y-1">
                      <p><strong>Deity:</strong> {shrine.deity}</p>
                      <p><strong>Location:</strong> {shrine.modernLocation}</p>
                      <p className="text-xs mt-2 text-muted-foreground">{shrine.significance}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Animation Controls */}
        <div className="space-y-4 p-4 bg-background/50 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              {isAnimating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Animate
                </>
              )}
            </Button>
            <div className="flex-1 flex items-center gap-3">
              <Slider
                value={[animationProgress]}
                onValueChange={(val) => setAnimationProgress(val[0])}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium min-w-[80px] text-right">
                {getCurrentYear()} BP
              </span>
            </div>
          </div>

          {/* Period Selector Buttons */}
          <div className="flex gap-2 flex-wrap">
            {coastlineLayers.map((layer) => (
              <Button
                key={layer.period}
                onClick={() => {
                  setSelectedPeriod(layer.period);
                  setAnimationProgress((layer.yearBP / 5000) * 100);
                }}
                variant={selectedPeriod === layer.period ? 'default' : 'outline'}
                size="sm"
                style={{
                  borderColor: layer.color,
                  backgroundColor: selectedPeriod === layer.period ? layer.color : 'transparent'
                }}
              >
                {layer.period}
              </Button>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-sm">Map Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <h5 className="font-medium mb-2">Coastline Layers</h5>
                {coastlineLayers.map((layer) => (
                  <div key={layer.period} className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-1"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-xs">{layer.period} ({layer.seaLevel}m)</span>
                  </div>
                ))}
              </div>
              <div>
                <h5 className="font-medium mb-2">Archaeological Sites</h5>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-primary rounded-full border-2 border-background" />
                  <span className="text-xs">Nāga shrine ({nagaShrines.length} total)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click markers for detailed site information
                </p>
              </div>
            </div>
          </div>

          {/* Current Timeline Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="text-sm">
              <strong>Timeline Point:</strong> {getCurrentYear()} years before present
              {seaLevelTimeline.find(t => Math.abs(t.yearBP - getCurrentYear()) < 500) && (
                <p className="text-muted-foreground mt-1">
                  {seaLevelTimeline.find(t => Math.abs(t.yearBP - getCurrentYear()) < 500)?.event}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
