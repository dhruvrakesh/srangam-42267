import React from 'react';
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
                <Popup maxWidth={300}>
                  <div className="space-y-2 p-2">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Modern:</strong> {city.modernName}</p>
                      <p><strong>Age:</strong> {city.age}</p>
                      <p><strong>Dynasty:</strong> {city.dynasty}</p>
                      <p className="text-muted-foreground">{city.significance}</p>
                      <p className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          city.route === 'uttarapatha' ? 'bg-blue-100 text-blue-700' :
                          city.route === 'dakshinapatha' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {city.route === 'uttarapatha' ? 'Uttarāpatha' :
                           city.route === 'dakshinapatha' ? 'Dakṣiṇāpatha' :
                           'Both Routes'}
                        </span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500" />
            <span>Uttarāpatha (Northern Route)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500" />
            <span>Dakṣiṇāpatha (Southern Route)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span>Ancient Cities</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
