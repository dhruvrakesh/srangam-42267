import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { inscriptionRegistry } from '@/data/inscriptions/registry';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

type ConfidenceLevel = 'A' | 'B' | 'C' | 'D';

interface EpigraphicAtlasMapProps {
  className?: string;
}

const confidenceBadgeStyles: Record<ConfidenceLevel, string> = {
  A: 'bg-green-600 text-white',
  B: 'bg-amber-600 text-white',
  C: 'bg-red-600 text-white',
  D: 'bg-gray-600 text-white'
};

const EpigraphicAtlasMapComponent: React.FC<EpigraphicAtlasMapProps> = ({ className }) => {
  const [selectedFilters, setSelectedFilters] = useState<ConfidenceLevel[]>(['A', 'B', 'C', 'D']);
  const [selectedInscription, setSelectedInscription] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapKey = useRef(`epigraphic-map-${Date.now()}`).current;
  const mapInstanceRef = useRef<boolean>(false);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Prevent re-initialization
    
    const timer = setTimeout(() => {
      mapInstanceRef.current = true;
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const inscriptions = inscriptionRegistry.inscriptions.filter(inscription => 
    inscription.location.coordinates
  );

  // Assign confidence levels to inscriptions based on their characteristics
  const getConfidenceLevel = (inscriptionId: string): ConfidenceLevel => {
    if (inscriptionId.includes('kandahar') || inscriptionId.includes('kedukan-bukit') || inscriptionId.includes('kutai')) {
      return 'A'; // Dated + archaeological context
    }
    if (inscriptionId.includes('vo-canh')) {
      return 'B'; // Palaeographic convergence
    }
    return 'C';
  };

  const toggleFilter = (level: ConfidenceLevel) => {
    setSelectedFilters(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const filteredInscriptions = inscriptions.filter(inscription => 
    selectedFilters.includes(getConfidenceLevel(inscription.id))
  );

  if (!mounted) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6 border-b border-border">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
          Epigraphic Atlas: From Vaigai to Borneo
        </h3>
        <p className="text-muted-foreground mb-4">
          Interactive map showing inscriptions across the Indian Ocean world with confidence levels
        </p>
        
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by confidence:</span>
          {(['A', 'B', 'C', 'D'] as ConfidenceLevel[]).map(level => (
            <Button
              key={level}
              variant={selectedFilters.includes(level) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter(level)}
              className={cn(
                'h-8 px-3',
                selectedFilters.includes(level) && confidenceBadgeStyles[level]
              )}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-[600px] w-full">
        <MapContainer
          key={mapKey}
          center={[10, 90]}
          zoom={4}
          scrollWheelZoom={false}
          className="h-full w-full"
          whenReady={() => setMapReady(true)}
        >
          {mapReady && (
            <>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredInscriptions.map(inscription => {
            const coords = inscription.location.coordinates;
            if (!coords) return null;

            const confidence = getConfidenceLevel(inscription.id);

            return (
              <Marker
                key={inscription.id}
                position={[coords.latitude, coords.longitude]}
                eventHandlers={{
                  click: () => setSelectedInscription(inscription.id)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-serif font-semibold text-sm">
                        {inscription.title}
                      </h4>
                      <Badge className={confidenceBadgeStyles[confidence]}>
                        {confidence}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {inscription.location.modern}
                    </p>
                    <p className="text-xs mb-2">
                      <strong>Period:</strong> {inscription.period.century}
                    </p>
                    <p className="text-xs mb-3">
                      <strong>Script:</strong> {inscription.scripts.map(s => s.scriptType).join(', ')}
                    </p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={() => {
                        // Navigate to inscription detail (would be implemented)
                        console.log('View details:', inscription.id);
                      }}
                    >
                      View Full Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
              })}
            </>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-border bg-muted/30">
        <h4 className="font-medium text-sm mb-3">Confidence Levels</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge className={confidenceBadgeStyles.A}>A</Badge>
            <span className="text-muted-foreground">Dated + Context</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={confidenceBadgeStyles.B}>B</Badge>
            <span className="text-muted-foreground">Palaeographic Match</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={confidenceBadgeStyles.C}>C</Badge>
            <span className="text-muted-foreground">Textual Echo</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={confidenceBadgeStyles.D}>D</Badge>
            <span className="text-muted-foreground">Cultural Memory</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const EpigraphicAtlasMap = React.memo(EpigraphicAtlasMapComponent);
EpigraphicAtlasMap.displayName = 'EpigraphicAtlasMap';
