import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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
  date: number; // BCE as negative
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

const RIVER_LAYERS: RiverLayer[] = [
  {
    period: '3500-3000 BCE',
    date: -3250,
    coordinates: [
      [30.6, 77.4], // Siwalik foothills
      [29.9, 76.8],
      [29.4, 75.5],
      [29.0, 74.2], // Kalibangan
      [28.5, 73.1],
      [27.8, 72.0],
      [26.5, 70.8], // Rann of Kutch
    ],
    color: '#0ea5e9',
    weight: 8,
    description: 'Mighty flowing Sarasvatī - "from mountain to sea"'
  },
  {
    period: '2500 BCE',
    date: -2500,
    coordinates: [
      [30.6, 77.4],
      [29.9, 76.8],
      [29.4, 75.5],
      [29.0, 74.2],
      [28.5, 73.1],
      [27.8, 72.0],
    ],
    color: '#3b82f6',
    weight: 6,
    description: 'Tributary Drishadvati drying begins'
  },
  {
    period: '1900 BCE',
    date: -1900,
    coordinates: [
      [30.6, 77.4],
      [29.9, 76.8],
      [29.4, 75.5],
      [29.0, 74.2],
    ],
    color: '#93c5fd',
    weight: 3,
    description: 'Main channel dried - "Vinaśana" (the vanishing)'
  },
  {
    period: 'Modern',
    date: 0,
    coordinates: [
      [30.6, 77.4],
      [29.9, 76.8],
      [29.4, 75.5],
    ],
    color: '#cbd5e1',
    weight: 2,
    description: 'Ghaggar-Hakra dry riverbed (satellite imagery)'
  }
];

const HARAPPAN_SITES: HarappanSite[] = [
  { name: 'Kalibangan', coordinates: [29.0, 74.2], period: 'c. 3300-1900 BCE' },
  { name: 'Rakhigarhi', coordinates: [29.3, 76.1], period: 'c. 3300-1900 BCE' },
  { name: 'Banawali', coordinates: [29.5, 75.0], period: 'c. 3000-1900 BCE' },
  { name: 'Lothal', coordinates: [22.5, 72.2], period: 'c. 2400-1900 BCE' },
];

const RIGVEDA_REFERENCES = [
  {
    text: '"Sarasvatī, you flow mighty from mountain to sea..."',
    source: 'Ṛgveda Nadī-Stuti (10.75.5)',
    period: 'Pre-1900 BCE'
  },
  {
    text: '"Sarasvatī disappeared in the desert..."',
    source: 'Śatapatha Brāhmaṇa',
    period: 'Post-1900 BCE'
  }
];

export function SarasvatiRiverEvolution() {
  const [timelineValue, setTimelineValue] = useState([0]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCurrentLayer = () => {
    const targetDate = -3500 + (timelineValue[0] / 100) * 3500; // Map 0-100 to -3500 to 0
    
    // Find closest layer
    return RIVER_LAYERS.reduce((prev, curr) => 
      Math.abs(curr.date - targetDate) < Math.abs(prev.date - targetDate) ? curr : prev
    );
  };

  const currentLayer = getCurrentLayer();

  if (!isClient) {
    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Sarasvatī River Geological Evolution</CardTitle>
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
        <CardTitle>Sarasvatī River: Geological Evolution Through Time</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Geospatial visualization of the Ghaggar-Hakra palaeochannel (Vedic Sarasvatī) from 3500 BCE to present
        </p>
      </CardHeader>
      <CardContent>
        {/* Timeline Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>3500 BCE (Mighty River)</span>
            <span className="text-primary">{currentLayer.period}</span>
            <span>Modern (Dried)</span>
          </div>
          <Slider
            value={timelineValue}
            onValueChange={setTimelineValue}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="mt-2 p-3 bg-muted/50 rounded text-sm">
            <p className="font-semibold text-primary">{currentLayer.description}</p>
          </div>
        </div>

        {/* Map */}
        <div className="h-96 rounded overflow-hidden border border-border">
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
            {HARAPPAN_SITES.map((site, idx) => (
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
        </div>

        {/* Ṛgveda References */}
        <div className="mt-6 p-4 bg-muted/30 rounded">
          <h4 className="text-sm font-semibold mb-3">Textual Correlation</h4>
          <div className="space-y-3">
            {RIGVEDA_REFERENCES.map((ref, idx) => (
              <div key={idx} className="text-sm">
                <blockquote className="italic text-foreground border-l-2 border-primary pl-3">
                  {ref.text}
                </blockquote>
                <div className="text-xs text-muted-foreground mt-1">
                  {ref.source} • {ref.period}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            → Geological correlation: River dried between texts<br />
            → Chronological implication: Ṛgveda composed pre-1900 BCE
          </div>
        </div>

        {/* Scholarly Consensus */}
        <div className="mt-4 p-4 bg-muted/30 rounded">
          <h4 className="text-sm font-semibold mb-2">Scholarly Consensus</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>B.B. Lal:</strong> "Rigveda earlier than 2000 BCE... at least 3rd millennium"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Michel Danino:</strong> "Sarasvatī evidence decisive for chronology"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">⚠</span>
              <span><strong>Skeptics:</strong> "River identity debated" (minority position)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
