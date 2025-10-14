import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface IndiaMapProps {
  markers: Array<{
    name: string;
    coords: [number, number];
    description: string;
  }>;
}

export function IndiaMap({ markers }: IndiaMapProps) {
  return (
    <MapContainer center={[30.5, 75.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.coords}>
          <Popup>
            <div className="text-xs">
              <div className="font-semibold">{marker.name}</div>
              <div className="text-muted-foreground">{marker.description}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
