import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AncientCity {
  name: string;
  modernName: string;
  coords: [number, number];
  age: string;
  dynasty: string;
  significance: string;
  route: 'uttarapatha' | 'dakshinapatha' | 'both';
}

const ANCIENT_CITIES: AncientCity[] = [
  {
    name: 'Vārāṇasī (Kāśī)',
    modernName: 'Varanasi',
    coords: [25.3176, 82.9739],
    age: '3000+ years',
    dynasty: 'Vedic Period - Present',
    significance: 'World\'s oldest living city, sacred to Shiva, center of learning',
    route: 'uttarapatha'
  },
  {
    name: 'Pāṭaliputra',
    modernName: 'Patna',
    coords: [25.5941, 85.1376],
    age: '2500+ years',
    dynasty: 'Mauryan - Gupta capital',
    significance: 'Capital of mighty empires, strategic Ganges location',
    route: 'uttarapatha'
  },
  {
    name: 'Ujjain (Avantī)',
    modernName: 'Ujjain',
    coords: [23.1765, 75.7885],
    age: '2800+ years',
    dynasty: 'Mauryan - Paramara',
    significance: 'Prime meridian of ancient astronomy, Kumbh Mela site',
    route: 'both'
  },
  {
    name: 'Madurai',
    modernName: 'Madurai',
    coords: [9.9252, 78.1198],
    age: '2500+ years',
    dynasty: 'Pandya - Present',
    significance: 'Temple city, Meenakshi Temple complex, Tamil cultural center',
    route: 'dakshinapatha'
  },
  {
    name: 'Kanchipuram',
    modernName: 'Kanchipuram',
    coords: [12.8342, 79.7036],
    age: '2000+ years',
    dynasty: 'Pallava - Chola',
    significance: 'City of thousand temples, silk weaving tradition',
    route: 'dakshinapatha'
  }
];

const UTTARAPATHA: [number, number][] = [
  [25.3176, 82.9739],
  [25.5941, 85.1376],
  [23.1765, 75.7885]
];

const DAKSHINAPATHA: [number, number][] = [
  [23.1765, 75.7885],
  [12.8342, 79.7036],
  [9.9252, 78.1198]
];

export const AncientTradeRoutesMap = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <Card className="w-full my-8">
        <CardHeader>
          <CardTitle>Ancient Trade Routes: Uttarāpatha & Dakṣiṇāpatha</CardTitle>
          <CardDescription>
            Loading interactive trade routes map...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg bg-muted/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initializing ancient trade routes visualization...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Ancient Trade Routes: Uttarāpatha & Dakṣiṇāpatha</CardTitle>
        <CardDescription>
          Major trade arteries connecting northern and southern India in antiquity
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative h-[600px] rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={[19.0, 79.0]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Uttarāpatha Route (Northern) */}
            <Polyline
              positions={UTTARAPATHA}
              pathOptions={{
                color: '#3b82f6',
                weight: 3,
                opacity: 0.7
              }}
            />
            
            {/* Dakṣiṇāpatha Route (Southern) */}
            <Polyline
              positions={DAKSHINAPATHA}
              pathOptions={{
                color: '#f97316',
                weight: 3,
                opacity: 0.7
              }}
            />

            {/* City Markers */}
            {ANCIENT_CITIES.map((city) => (
              <Marker
                key={city.name}
                position={city.coords}
              >
                <Popup>
                  <div className="p-2 space-y-1">
                    <h3 className="font-bold text-base">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">Modern: {city.modernName}</p>
                    <p className="text-sm"><strong>Age:</strong> {city.age}</p>
                    <p className="text-sm"><strong>Dynasty:</strong> {city.dynasty}</p>
                    <p className="text-sm mt-1">{city.significance}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Route: {city.route === 'uttarapatha' ? 'Uttarāpatha' : 
                               city.route === 'dakshinapatha' ? 'Dakṣiṇāpatha' : 
                               'Both routes'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500" />
            <span>Uttarāpatha (Northern Route)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500" />
            <span>Dakṣiṇāpatha (Southern Route)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
