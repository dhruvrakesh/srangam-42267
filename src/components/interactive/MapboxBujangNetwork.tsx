import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Info, Ship, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MapboxBujangNetworkProps {
  onClose: () => void;
}

// Enhanced Bujang Valley data with more archaeological context
const BUJANG_SITES = [
  { 
    id: "Sungai Batu", 
    lat: 5.6631, 
    lon: 100.4916,
    type: "industrial",
    period: "2nd-12th c. CE",
    features: ["iron smelting", "bead production", "ritual structures", "jetty remains"],
    description: "Major industrial and ritual complex with evidence of continuous occupation"
  },
  { 
    id: "Merbok Estuary", 
    lat: 5.6900, 
    lon: 100.5000,
    type: "port",
    period: "5th-12th c. CE", 
    features: ["harbor facilities", "Buddhist monuments", "Hindu temples"],
    description: "Primary port connecting inland sites to maritime routes"
  },
  { 
    id: "Kuala Kedah", 
    lat: 6.1084, 
    lon: 100.2993,
    type: "coastal",
    period: "8th-14th c. CE",
    features: ["fortified settlement", "customs facilities", "warehouse remains"],
    description: "Strategic coastal gateway controlling entry to the Kedah plain"
  },
  {
    id: "Candi Bukit Batu Pahat",
    lat: 5.6167,
    lon: 100.4833,
    type: "religious",
    period: "8th-9th c. CE",
    features: ["Hindu temple", "Sanskrit inscriptions", "ritual artifacts"],
    description: "Major Hindu temple complex with royal patronage inscriptions"
  },
  {
    id: "Pengkalan Bujang",
    lat: 5.6500,
    lon: 100.4700,
    type: "archaeological",
    period: "4th-12th c. CE",
    features: ["settlement remains", "pottery kilns", "trade goods"],
    description: "Archaeological site revealing extensive trade connections"
  }
];

// Trade routes connecting Bujang Valley to the wider world
const TRADE_ROUTES = [
  {
    from: "Merbok Estuary",
    to: "Bay of Bengal",
    coordinates: [[100.5, 5.69], [92.5, 12.0], [85.0, 15.0]],
    description: "Monsoon route to eastern India via Andaman Sea"
  },
  {
    from: "Kuala Kedah", 
    to: "Straits of Malacca",
    coordinates: [[100.3, 6.11], [99.5, 4.0], [98.5, 2.0]],
    description: "Southern route through Malacca Straits to Sumatra"
  },
  {
    from: "Sungai Batu",
    to: "Mekong Delta", 
    coordinates: [[100.49, 5.66], [103.0, 8.0], [106.0, 10.5]],
    description: "Coastal route to Funan and Angkor territories"
  }
];

// Historical timeline for the valley
const TIMELINE_PERIODS = [
  { period: "2nd-4th c. CE", label: "Early Settlement", sites: ["Sungai Batu"] },
  { period: "5th-7th c. CE", label: "Hindu-Buddhist Expansion", sites: ["Sungai Batu", "Merbok Estuary", "Pengkalan Bujang"] },
  { period: "8th-10th c. CE", label: "Golden Age", sites: ["Sungai Batu", "Merbok Estuary", "Kuala Kedah", "Candi Bukit Batu Pahat", "Pengkalan Bujang"] },
  { period: "11th-12th c. CE", label: "Continued Prosperity", sites: ["Sungai Batu", "Merbok Estuary", "Kuala Kedah", "Pengkalan Bujang"] }
];

export function MapboxBujangNetwork({ onClose }: MapboxBujangNetworkProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSite, setSelectedSite] = useState<typeof BUJANG_SITES[0] | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const filteredSites = selectedPeriod === 'all' 
    ? BUJANG_SITES 
    : BUJANG_SITES.filter(site => {
        const timelinePeriod = TIMELINE_PERIODS.find(p => p.period === selectedPeriod);
        return timelinePeriod?.sites.includes(site.id);
      });

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      zoom: 9,
      center: [100.45, 5.75], // Center on Bujang Valley
      pitch: 45,
      bearing: 0
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

    map.current.on('style.load', () => {
      // Add water styling
      map.current?.setPaintProperty('water', 'fill-color', 'hsl(var(--ocean) / 0.7)');
      
      addTradeRoutes();
      addSiteMarkers();
    });
  };

  const addTradeRoutes = () => {
    if (!map.current || !showRoutes) return;

    TRADE_ROUTES.forEach((route, index) => {
      // Add route line
      map.current?.addSource(`route-${index}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { description: route.description },
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates
          }
        }
      });

      map.current?.addLayer({
        id: `route-${index}`,
        type: 'line',
        source: `route-${index}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': 'hsl(var(--gold))',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });
    });
  };

  const addSiteMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    filteredSites.forEach((site) => {
      // Create custom marker based on site type
      const el = document.createElement('div');
      const getMarkerStyle = (type: string) => {
        switch (type) {
          case 'industrial':
            return { bg: 'hsl(var(--laterite))', icon: '🏭', size: '24px' };
          case 'port':
            return { bg: 'hsl(var(--ocean))', icon: '⚓', size: '24px' };
          case 'religious':
            return { bg: 'hsl(var(--gold))', icon: '🛕', size: '24px' };
          case 'coastal':
            return { bg: 'hsl(var(--accent))', icon: '🏰', size: '24px' };
          default:
            return { bg: 'hsl(var(--muted))', icon: '📍', size: '20px' };
        }
      };

      const style = getMarkerStyle(site.type);
      el.style.cssText = `
        width: ${style.size};
        height: ${style.size};
        background: ${style.bg};
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 12px;
      `;
      el.innerHTML = style.icon;

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Click handler
      el.addEventListener('click', () => {
        setSelectedSite(site);
        map.current?.flyTo({
          center: [site.lon, site.lat],
          zoom: 12,
          duration: 1500
        });
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([site.lon, site.lat])
        .addTo(map.current!);

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 15
      }).setHTML(`
        <div class="p-2 max-w-xs">
          <h4 class="font-semibold text-sm">${site.id}</h4>
          <p class="text-xs text-muted-foreground mb-1">${site.period}</p>
          <p class="text-xs">${site.description}</p>
        </div>
      `);

      el.addEventListener('mouseenter', () => {
        popup.setLngLat([site.lon, site.lat]).addTo(map.current!);
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
      addSiteMarkers();
    }
  }, [filteredSites]);

  useEffect(() => {
    if (map.current) {
      // Remove existing route layers
      TRADE_ROUTES.forEach((_, index) => {
        if (map.current?.getLayer(`route-${index}`)) {
          map.current.removeLayer(`route-${index}`);
          map.current.removeSource(`route-${index}`);
        }
      });
      
      if (showRoutes) {
        addTradeRoutes();
      }
    }
  }, [showRoutes]);

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
              To display the interactive Bujang Valley network with satellite imagery and geographic context, please enter your Mapbox public token.
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
            <Ship className="text-ocean" size={24} />
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Bujang Valley Network</h2>
              <p className="text-sm text-muted-foreground">Archaeological sites in Malaysia's ancient port complex</p>
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
                  <Calendar size={16} />
                  Historical Period
                </h3>
                <div className="space-y-1">
                  <Button
                    variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('all')}
                    className="text-xs w-full justify-start"
                  >
                    All Periods
                  </Button>
                  {TIMELINE_PERIODS.map(period => (
                    <Button
                      key={period.period}
                      variant={selectedPeriod === period.period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.period)}
                      className="text-xs w-full justify-start"
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 shadow-lg">
                <h3 className="font-medium text-sm mb-2">Display Options</h3>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={showRoutes}
                    onChange={(e) => setShowRoutes(e.target.checked)}
                    className="rounded"
                  />
                  Show Trade Routes
                </label>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 shadow-lg z-10">
              <h4 className="font-medium text-sm mb-2">Site Types</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-laterite border flex items-center justify-center text-xs">🏭</div>
                  <span>Industrial Complex</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-ocean border flex items-center justify-center text-xs">⚓</div>
                  <span>Port Facility</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gold border flex items-center justify-center text-xs">🛕</div>
                  <span>Religious Site</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent border flex items-center justify-center text-xs">🏰</div>
                  <span>Coastal Settlement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border bg-background/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-4 space-y-4">
              {selectedSite ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold border-2 border-laterite flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🏛️</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground">{selectedSite.id}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{selectedSite.type} Site</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">Period of Activity</h4>
                      <p className="text-sm text-muted-foreground">{selectedSite.period}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedSite.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Archaeological Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedSite.features.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Archaeological excavations have revealed the sophisticated nature of the Bujang Valley network, 
                        connecting local communities to maritime trade routes across the Bay of Bengal and South China Sea.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean/10 flex items-center justify-center">
                    <Info className="text-ocean" size={24} />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Explore Archaeological Sites</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on any site marker to discover its role in this ancient maritime network. 
                    Use the timeline to see how the valley evolved over centuries.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>• Satellite imagery shows actual terrain</p>
                    <p>• Toggle trade routes on/off</p>
                    <p>• Filter by historical periods</p>
                  </div>
                </div>
              )}
              
              {/* Sites List */}
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Sites ({filteredSites.length})
                </h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredSites.map(site => (
                    <button
                      key={site.id}
                      onClick={() => {
                        setSelectedSite(site);
                        map.current?.flyTo({
                          center: [site.lon, site.lat],
                          zoom: 12,
                          duration: 1500
                        });
                      }}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedSite?.id === site.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="font-medium">{site.id}</div>
                      <div className="text-xs opacity-75 capitalize">{site.type} • {site.period}</div>
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