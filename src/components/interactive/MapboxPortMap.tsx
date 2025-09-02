import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PORTS } from '@/data/siteData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Info, Anchor } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MapboxPortMapProps {
  onClose: () => void;
}

export function MapboxPortMap({ onClose }: MapboxPortMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedPort, setSelectedPort] = useState<typeof PORTS[0] | null>(null);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const filteredPorts = filterEra === 'all' 
    ? PORTS 
    : PORTS.filter(port => port.era.toLowerCase().includes(filterEra.toLowerCase()));

  const eras = [...new Set(PORTS.map(port => port.era))];

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      zoom: 3,
      center: [77, 15], // Center on Indian Ocean
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Style the map for historical theme
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'hsl(var(--background))',
        'high-color': 'hsl(var(--muted))',
        'horizon-blend': 0.1,
      });

      // Add custom water color
      map.current?.setPaintProperty('water', 'fill-color', 'hsl(var(--ocean) / 0.3)');
    });

    addPortMarkers();
  };

  const addPortMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    filteredPorts.forEach((port) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'port-marker';
      el.style.cssText = `
        width: 20px;
        height: 20px;
        background: hsl(var(--gold));
        border: 2px solid hsl(var(--laterite));
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;

      // Add anchor icon
      const anchor = document.createElement('div');
      anchor.innerHTML = '⚓';
      anchor.style.cssText = `
        font-size: 10px;
        color: hsl(var(--laterite));
        line-height: 1;
      `;
      el.appendChild(anchor);

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Click handler
      el.addEventListener('click', () => {
        setSelectedPort(port);
        // Fly to port
        map.current?.flyTo({
          center: [port.lon, port.lat],
          zoom: 8,
          duration: 1500
        });
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([port.lon, port.lat])
        .addTo(map.current!);

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
      }).setHTML(`
        <div class="p-2">
          <h4 class="font-semibold text-sm">${port.id}</h4>
          <p class="text-xs text-muted-foreground">${port.region} • ${port.era}</p>
        </div>
      `);

      el.addEventListener('mouseenter', () => {
        popup.setLngLat([port.lon, port.lat]).addTo(map.current!);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    if (isTokenSet && mapboxToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isTokenSet, mapboxToken]);

  useEffect(() => {
    if (map.current) {
      addPortMarkers();
    }
  }, [filteredPorts]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
    }
  };

  if (!isTokenSet) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-foreground">Mapbox Token Required</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To display the interactive port map with real geographic data, please enter your Mapbox public token.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mapbox Public Token</label>
              <Input
                type="text"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Get your free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></p>
              <p>• Create an account or sign in</p>
              <p>• Go to your account dashboard</p>
              <p>• Find your "Default public token" in the Tokens section</p>
            </div>
            
            <Button onClick={handleTokenSubmit} disabled={!mapboxToken.trim()} className="w-full">
              Initialize Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Anchor className="text-ocean" size={24} />
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Interactive Port Map</h2>
              <p className="text-sm text-muted-foreground">Ancient maritime network of the Indian Ocean</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex h-[calc(95vh-80px)]">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Map Controls Overlay */}
            <div className="absolute top-4 left-4 space-y-2 z-10">
              <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 shadow-lg">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Filter by Era
                </h3>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={filterEra === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEra('all')}
                    className="text-xs"
                  >
                    All ({PORTS.length})
                  </Button>
                  {eras.map(era => (
                    <Button
                      key={era}
                      variant={filterEra === era ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterEra(era)}
                      className="text-xs"
                    >
                      {era}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 shadow-lg z-10">
              <h4 className="font-medium text-sm mb-2">Legend</h4>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-gold border-2 border-laterite flex items-center justify-center">
                  <span className="text-xs">⚓</span>
                </div>
                <span className="text-muted-foreground">Ancient Port</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border bg-background/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-4 space-y-4">
              {selectedPort ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold border-2 border-laterite flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">⚓</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground">{selectedPort.id}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPort.region}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">Historical Period</h4>
                      <p className="text-sm text-muted-foreground">{selectedPort.era}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">Coordinates</h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedPort.lat.toFixed(2)}°N, {selectedPort.lon.toFixed(2)}°E
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Trade Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPort.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Archaeological and historical evidence reveals {selectedPort.id} as a crucial node in the ancient Indian Ocean trade network, facilitating exchange between civilizations across maritime Asia.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean/10 flex items-center justify-center">
                    <Info className="text-ocean" size={24} />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Explore Ancient Ports</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on any port marker to discover its role in the maritime networks that connected civilizations across the Indian Ocean.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>• Zoom and pan to explore different regions</p>
                    <p>• Filter by historical period</p>
                    <p>• Click markers for detailed information</p>
                  </div>
                </div>
              )}
              
              {/* All Ports List */}
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  All Ports ({filteredPorts.length})
                </h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredPorts.map(port => (
                    <button
                      key={port.id}
                      onClick={() => {
                        setSelectedPort(port);
                        map.current?.flyTo({
                          center: [port.lon, port.lat],
                          zoom: 8,
                          duration: 1500
                        });
                      }}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedPort?.id === port.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="font-medium">{port.id}</div>
                      <div className="text-xs opacity-75">{port.region} • {port.era}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}