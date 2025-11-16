import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { JYOTIRLINGAS, PILGRIMAGE_ROUTES, JyotirlingaSite } from '@/data/jyotirlingas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
  const [activeSite, setActiveSite] = useState<JyotirlingaSite | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedSite) {
      const site = JYOTIRLINGAS.find(j => j.name === selectedSite);
      if (site) setActiveSite(site);
    }
  }, [selectedSite]);

  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            The Twelve Jyotirliṅgas: Sacred Geography of Śiva Worship
          </CardTitle>
          <CardDescription>
            Loading interactive sacred geography map...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg bg-muted/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initializing sacred geography visualization...</p>
            </div>
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
          Interactive map showing the distribution of Jyotirlinga sites across the Indian subcontinent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[600px] rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={[22.5, 78.5]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Pilgrimage Routes */}
            {PILGRIMAGE_ROUTES.map((route, idx) => (
              <Polyline
                key={`route-${idx}`}
                positions={route.coordinates}
                pathOptions={{
                  color: route.color,
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '10, 10'
                }}
              >
                <Tooltip permanent={false} direction="top">
                  <div className="text-xs">
                    <strong>{route.name}</strong>
                  </div>
                </Tooltip>
              </Polyline>
            ))}
            
            {/* Jyotirlinga Markers */}
            {JYOTIRLINGAS.map((site) => (
              <Marker
                key={site.name}
                position={site.coords}
                icon={createCustomIcon(site.kumbhMela)}
                eventHandlers={{
                  click: () => setActiveSite(site)
                }}
              >
                <Popup maxWidth={300}>
                  <div className="space-y-2 p-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span>🕉️</span>
                      {site.name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Location:</strong> {site.location}</p>
                      <p><strong>State:</strong> {site.state}</p>
                      <p className="text-muted-foreground">{site.legend}</p>
                      {site.kumbhMela && (
                        <Badge variant="secondary" className="mt-2">
                          Kumbh Melā Site
                        </Badge>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Active Site Details */}
        {activeSite && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🕉️</span>
                {activeSite.name}
              </CardTitle>
              <CardDescription>{activeSite.location}, {activeSite.state}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{activeSite.legend}</p>
              <p><strong>Puranic Source:</strong> {activeSite.puranicSource}</p>
              {activeSite.kumbhMela && (
                <Badge variant="secondary">Kumbh Melā Site</Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Regular Jyotirlinga</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span>Kumbh Melā Site</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-indigo-500 border-dashed" />
            <span>Pilgrimage Routes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
