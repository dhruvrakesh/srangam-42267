import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ancient Trade Routes</CardTitle>
          <CardDescription>Loading map...</CardDescription>
        </CardHeader>
        <CardContent className="h-[600px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Ancient Trade Routes: Uttarāpatha & Dakṣiṇāpatha</CardTitle>
        <CardDescription>
          Exploring the northern and southern corridors that connected India's ancient cities
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
            
            <Polyline
              positions={UTTARAPATHA}
              pathOptions={{ color: '#FF6B35', weight: 4, opacity: 0.7 }}
            />
            
            <Polyline
              positions={DAKSHINAPATHA}
              pathOptions={{ color: '#004E89', weight: 4, opacity: 0.7 }}
            />
            
            {ANCIENT_CITIES.map((city, index) => (
              <Marker key={index} position={city.coords}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{city.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Modern:</span> {city.modernName}</p>
                      <p><span className="font-semibold">Age:</span> {city.age}</p>
                      <p><span className="font-semibold">Dynasty:</span> {city.dynasty}</p>
                      <p className="text-xs text-muted-foreground mt-2">{city.significance}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <div className="absolute bottom-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
            <div className="text-sm font-semibold mb-2 text-foreground">Ancient Trade Routes</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#FF6B35]"></div>
                <span className="text-muted-foreground">Uttarāpatha (Northern)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#004E89]"></div>
                <span className="text-muted-foreground">Dakṣiṇāpatha (Southern)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
