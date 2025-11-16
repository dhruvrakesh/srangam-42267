import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Fix for default marker icons
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

// Uttarāpatha (Northern Highway) - Orange
const UTTARAPATHA: [number, number][] = [
  [25.3176, 82.9739], // Varanasi
  [25.5941, 85.1376], // Pataliputra
  [23.1765, 75.7885]  // Ujjain
];

// Dakṣiṇāpatha (Southern Highway) - Blue
const DAKSHINAPATHA: [number, number][] = [
  [23.1765, 75.7885], // Ujjain
  [12.8342, 79.7036], // Kanchipuram
  [9.9252, 78.1198]   // Madurai
];

const MapLegend = () => {
  const map = useMap();
  
  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg');
      div.innerHTML = `
        <div class="text-sm font-semibold mb-2">Ancient Trade Routes</div>
        <div class="space-y-1 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-8 h-0.5 bg-[#FF6B35]"></div>
            <span>Uttarāpatha (Northern)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-0.5 bg-[#004E89]"></div>
            <span>Dakṣiṇāpatha (Southern)</span>
          </div>
        </div>
      `;
      return div;
    };
    
    legend.addTo(map);
    
    return () => {
      legend.remove();
    };
  }, [map]);
  
  return null;
};

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
          <CardDescription>
            Loading map of Uttarāpatha and Dakṣiṇāpatha corridors...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg" />
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
      <CardContent>
        <MapContainer
          center={[19.0, 79.0]}
          zoom={5}
          className="w-full h-[600px] rounded-lg z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Uttarāpatha Route */}
          <Polyline
            positions={UTTARAPATHA}
            pathOptions={{
              color: '#FF6B35',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
          
          {/* Dakṣiṇāpatha Route */}
          <Polyline
            positions={DAKSHINAPATHA}
            pathOptions={{
              color: '#004E89',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
          
          {/* City Markers */}
          {ANCIENT_CITIES.map((city, index) => (
            <Marker key={index} position={city.coords}>
              <Popup className="min-w-[250px]">
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
          
          <MapLegend />
        </MapContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="mb-2">
            The <span className="font-semibold text-[#FF6B35]">Uttarāpatha</span> (Northern Highway) 
            connected the eastern Gangetic plains to western India, facilitating trade and cultural exchange.
          </p>
          <p>
            The <span className="font-semibold text-[#004E89]">Dakṣiṇāpatha</span> (Southern Highway) 
            linked central India to the southern peninsula, carrying goods and ideas across diverse landscapes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
