import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RiverLayer {
  period: string;
  date: number;
  coordinates: [number, number][];
  color: string;
  weight: number;
  description: string;
}

interface HarappanSite {
  name: string;
  coordinates: [number, number];
  period: string;
}

interface SarasvatiRiverMapProps {
  currentLayer: RiverLayer;
  harappanSites: HarappanSite[];
}

export function SarasvatiRiverMap({ currentLayer, harappanSites }: SarasvatiRiverMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Initializing Sarasvatī river map...
      </div>
    );
  }

  return (
    <MapContainer
      center={[28.5, 74.0]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* River Evolution */}
      <Polyline
        positions={currentLayer.coordinates}
        color={currentLayer.color}
        weight={currentLayer.weight}
        dashArray={currentLayer.date === 0 ? '5, 10' : undefined}
      />

      {/* Harappan Sites */}
      {harappanSites.map((site, idx) => (
        <Marker key={idx} position={site.coordinates}>
          <Popup>
            <div className="text-xs">
              <div className="font-semibold">{site.name}</div>
              <div className="text-muted-foreground">{site.period}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
