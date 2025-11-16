import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { JYOTIRLINGAS, PILGRIMAGE_ROUTES, JyotirlingaSite } from '@/data/jyotirlingas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// FIX LEAFLET DEFAULT ICON PATHS FOR VITE/REACT
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icon for Jyotirlinga markers
const createCustomIcon = (kumbhMela: boolean) => {
  const color = kumbhMela ? '#f97316' : '#3b82f6';
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" font-size="16" text-anchor="middle" fill="white" font-weight="bold">ॐ</text>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-jyotirlinga-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface JyotirlingaMapProps {
  selectedSite?: string | null;
}

export function JyotirlingaMap({ selectedSite }: JyotirlingaMapProps) {
  // SSR guard - ensure we're in browser environment
  if (typeof window === 'undefined') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            The Twelve Jyotirliṅgas: Sacred Geography of Śiva Worship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Map requires browser environment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [activeSite, setActiveSite] = useState<JyotirlingaSite | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setHasError(true);
      return;
    }
    
    const timer = setTimeout(() => {
      try {
        // Verify Leaflet is fully loaded before initializing map
        if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
          setLeafletReady(true);
          setIsMounted(true);
          console.log('JyotirlingaMap: Leaflet initialized successfully');
        } else {
          throw new Error('Leaflet not fully initialized');
        }
      } catch (e) {
        console.error('JyotirlingaMap initialization error:', e);
        setHasError(true);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedSite) {
      const site = JYOTIRLINGAS.find(j => j.name === selectedSite);
      if (site) setActiveSite(site);
    }
  }, [selectedSite]);

  if (hasError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            The Twelve Jyotirliṅgas: Sacred Geography of Śiva Worship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Map initialization failed. Please refresh the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isMounted || !leafletReady) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            The Twelve Jyotirliṅgas: Sacred Geography of Śiva Worship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-muted-foreground">Initializing sacred geography map...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🕉️</span>
          The Twelve Jyotirliṅgas: Sacred Geography of Śiva Worship
        </CardTitle>
        <CardDescription>
          Interactive map showing the twelve self-manifested liṅgas of light across the Indian subcontinent.
          Sites marked in orange host Kumbh Melā gatherings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[600px] rounded-lg overflow-hidden border border-border">
          <MapContainer
            key="jyotirlinga-map-container"
            center={[22.5, 78.5]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            whenReady={() => console.log('JyotirlingaMap: MapContainer ready')}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pilgrimage Routes */}
            {PILGRIMAGE_ROUTES.map((route, idx) => (
              <Polyline
                key={idx}
                positions={route.coordinates}
                color={route.color}
                weight={2}
                opacity={0.6}
                dashArray="5, 10"
              >
                <Tooltip permanent={false} direction="top">
                  <span className="text-xs font-medium">{route.name}</span>
                </Tooltip>
              </Polyline>
            ))}

            {/* Jyotirlinga Sites */}
            {JYOTIRLINGAS.map((site, idx) => (
              <Marker
                key={idx}
                position={site.coords}
                icon={createCustomIcon(site.kumbhMela)}
                eventHandlers={{
                  click: () => setActiveSite(site),
                }}
              >
                <Popup maxWidth={400} className="jyotirlinga-popup">
                  <div className="space-y-3 p-2">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {site.name}
                        {site.kumbhMela && (
                          <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 dark:text-orange-300">
                            Kumbh Melā
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{site.nameDevanagari}</p>
                      <p className="text-sm font-medium mt-1">
                        {site.location}, {site.state}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Sacred River:</span>{' '}
                        <span className="text-muted-foreground">{site.associatedRiver}</span>
                      </div>

                      <div>
                        <span className="font-semibold">Purāṇic Legend:</span>
                        <p className="text-muted-foreground mt-1 leading-relaxed">{site.legend}</p>
                      </div>

                      <div>
                        <span className="font-semibold">Source:</span>{' '}
                        <span className="text-muted-foreground italic">{site.puranicSource}</span>
                      </div>

                      <div>
                        <span className="font-semibold">Ascetic Orders:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {site.asceticOrders.map((order, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {order}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <span className="font-semibold">Pilgrimage Significance:</span>
                        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                          {site.pilgrimageSignificance}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Site Details */}
        {activeSite && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {activeSite.name} ({activeSite.nameDevanagari})
                {activeSite.kumbhMela && (
                  <Badge className="bg-orange-500 text-white">Kumbh Melā Site</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Location:</span>
                  <p className="text-muted-foreground">{activeSite.location}, {activeSite.state}</p>
                </div>
                <div>
                  <span className="font-semibold">Sacred River:</span>
                  <p className="text-muted-foreground">{activeSite.associatedRiver}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold">Associated Ascetic Orders:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeSite.asceticOrders.map((order, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {order}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Regular Jyotirliṅga</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Kumbh Melā Site</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-orange-500 opacity-60" style={{ borderTop: '2px dashed' }}></div>
            <span>Western Circuit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500 opacity-60" style={{ borderTop: '2px dashed' }}></div>
            <span>Northern Circuit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500 opacity-60" style={{ borderTop: '2px dashed' }}></div>
            <span>Southern Circuit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
