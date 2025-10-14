import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mitanni connection data
const INDIA_MARKERS = [
  { name: 'Sapta Sindhu Region', coords: [30.5, 75.0], description: 'Vedic heartland - Indra, Varuna, Mitra, Nasatyas worship' },
  { name: 'Rigvedic Core', coords: [31.0, 76.0], description: 'Horse and chariot culture, Soma rituals' }
];

const MITANNI_MARKERS = [
  { name: 'Mitanni Kingdom', coords: [36.0, 40.0], description: '1380 BCE treaty with Hittites - Mi-it-ra, In-da-ra deities' },
  { name: 'Kikkuli Text Site', coords: [37.5, 38.5], description: 'Horse-training manual with Sanskrit numerical terms' }
];

const MIGRATION_PATH: [number, number][] = [
  [30.5, 75.0],  // India
  [32.0, 65.0],  // Central Asia
  [36.0, 55.0],  // Iran
  [36.0, 40.0]   // Mitanni
];

const LANGUAGE_COMPARISONS = [
  { sanskrit: 'eka-vartana', mitanni: 'aikawartanna', meaning: 'one turn (horse training)' },
  { sanskrit: 'aśva-sana', mitanni: 'assussanni', meaning: 'horse trainer' },
  { sanskrit: 'tri', mitanni: 'tera', meaning: 'three' },
  { sanskrit: 'pañca', mitanni: 'panza', meaning: 'five' },
  { sanskrit: 'sapta', mitanni: 'satta', meaning: 'seven' },
  { sanskrit: 'nava', mitanni: 'nava', meaning: 'nine' }
];

export function MitanniVedicConnectionsMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Mitanni-Vedic Connections: Geographic Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Loading map...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Mitanni-Vedic Connections: Geographic Evidence</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Archaeological evidence of Indo-Aryan presence in 14th century BCE Mesopotamia
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dual-map">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dual-map">Dual Map View</TabsTrigger>
            <TabsTrigger value="language">Language Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="dual-map">
            <div className="grid md:grid-cols-2 gap-4">
              {/* India Map */}
              <div className="h-80 rounded overflow-hidden border border-border">
                <MapContainer center={[30.5, 75.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {INDIA_MARKERS.map((marker, idx) => (
                    <Marker key={idx} position={marker.coords as [number, number]}>
                      <Popup>
                        <div className="text-xs">
                          <div className="font-semibold">{marker.name}</div>
                          <div className="text-muted-foreground">{marker.description}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Mitanni Map */}
              <div className="h-80 rounded overflow-hidden border border-border">
                <MapContainer center={[36.0, 40.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {MITANNI_MARKERS.map((marker, idx) => (
                    <Marker key={idx} position={marker.coords as [number, number]}>
                      <Popup>
                        <div className="text-xs">
                          <div className="font-semibold">{marker.name}</div>
                          <div className="text-muted-foreground">{marker.description}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Polyline 
                    positions={MIGRATION_PATH} 
                    color="hsl(var(--primary))" 
                    weight={2} 
                    dashArray="5, 10" 
                  />
                </MapContainer>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded text-sm">
              <p><strong>Chronological Implication:</strong> For Vedic culture to be established in Mesopotamia by 1380 BCE (Mitanni treaty date), it must have existed in India several centuries earlier, placing Ṛgvedic composition well before 1500 BCE.</p>
            </div>
          </TabsContent>

          <TabsContent value="language">
            <div className="space-y-4">
              <h4 className="font-semibold">Sanskrit-Mitanni Linguistic Parallels</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Sanskrit (Rigvedic)</th>
                      <th className="text-left p-2">Mitanni (1380 BCE)</th>
                      <th className="text-left p-2">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LANGUAGE_COMPARISONS.map((comp, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="p-2 font-mono">{comp.sanskrit}</td>
                        <td className="p-2 font-mono text-primary">{comp.mitanni}</td>
                        <td className="p-2 text-muted-foreground">{comp.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded text-xs">
                <p><strong>Source:</strong> Kikkuli horse-training manual (Hittite archives, Boğazkale) and Mitanni-Hittite Treaty (1380 BCE). For full analysis, see <a href="/asura-exiles-indo-iranian" className="underline text-primary">The Asura Exiles</a>.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
