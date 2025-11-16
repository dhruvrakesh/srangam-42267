import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface StrataLayer {
  layer: string;
  period: string;
  depth: string;
  artifacts: string;
  color: string;
}

interface CityStrata {
  city: string;
  layers: StrataLayer[];
}

const STRATA_DATA: CityStrata[] = [
  {
    city: 'Vārāṇasī',
    layers: [
      { layer: 'Surface', period: 'Contemporary (2000-present)', depth: '0-2m', artifacts: 'Modern structures, cement buildings', color: '#E8E8E8' },
      { layer: 'Upper', period: 'Medieval-Mughal (1100-1800 CE)', depth: '2-5m', artifacts: 'Mughal pottery, glazed ceramics', color: '#C9A969' },
      { layer: 'Middle', period: 'Gupta-Post-Gupta (320-1000 CE)', depth: '5-8m', artifacts: 'Terracotta figurines, coins', color: '#B87333' },
      { layer: 'Lower-Middle', period: 'Mauryan (320-185 BCE)', depth: '8-10m', artifacts: 'NBP ware, punch-marked coins', color: '#8B4513' },
      { layer: 'Lower', period: 'Early Iron Age (1000-500 BCE)', depth: '10-14m', artifacts: 'Painted Grey Ware, iron tools', color: '#654321' }
    ]
  },
  {
    city: 'Pāṭaliputra (Patna)',
    layers: [
      { layer: 'Surface', period: 'Contemporary (1900-present)', depth: '0-3m', artifacts: 'British-era buildings, modern city', color: '#E8E8E8' },
      { layer: 'Upper', period: 'Medieval (1000-1700 CE)', depth: '3-6m', artifacts: 'Sultanate pottery, Islamic architecture', color: '#A9A9A9' },
      { layer: 'Middle', period: 'Gupta (320-550 CE)', depth: '6-9m', artifacts: 'Gupta coins, inscriptions', color: '#708090' },
      { layer: 'Lower', period: 'Mauryan (320-185 BCE)', depth: '9-13m', artifacts: 'Wooden palisades, NBP ware, pillars', color: '#2F4F4F' },
      { layer: 'Foundation', period: 'Pre-Mauryan (500-320 BCE)', depth: '13-16m', artifacts: 'Early settlement remains', color: '#1C1C1C' }
    ]
  },
  {
    city: 'Ujjain',
    layers: [
      { layer: 'Surface', period: 'Modern (1800-present)', depth: '0-2m', artifacts: 'Colonial structures, contemporary temples', color: '#E8E8E8' },
      { layer: 'Upper', period: 'Paramara-Mughal (800-1800 CE)', depth: '2-5m', artifacts: 'Temple remains, Paramara sculptures', color: '#DAA520' },
      { layer: 'Middle', period: 'Gupta (320-550 CE)', depth: '5-8m', artifacts: 'Astronomical instruments, Gupta seals', color: '#B8860B' },
      { layer: 'Lower', period: 'Mauryan-Sunga (300 BCE-200 CE)', depth: '8-11m', artifacts: 'Punch-marked coins, NBP ware', color: '#8B7355' },
      { layer: 'Foundation', period: 'Early Historic (800-300 BCE)', depth: '11-15m', artifacts: 'Black and Red Ware, early iron', color: '#654321' }
    ]
  },
  {
    city: 'Madurai',
    layers: [
      { layer: 'Surface', period: 'Contemporary (1900-present)', depth: '0-2m', artifacts: 'Modern city, Meenakshi Temple renovations', color: '#E8E8E8' },
      { layer: 'Upper', period: 'Nayak (1559-1736 CE)', depth: '2-5m', artifacts: 'Nayak architecture, gopuram foundations', color: '#CD5C5C' },
      { layer: 'Middle', period: 'Pandya (300-1300 CE)', depth: '5-9m', artifacts: 'Tamil-Brahmi inscriptions, temple sculptures', color: '#A52A2A' },
      { layer: 'Lower', period: 'Sangam (300 BCE-300 CE)', depth: '9-13m', artifacts: 'Sangam-era pottery, ancient Tamil texts', color: '#800000' },
      { layer: 'Foundation', period: 'Megalithic (1000-300 BCE)', depth: '13-16m', artifacts: 'Black and Red Ware, iron implements', color: '#4B0000' }
    ]
  }
];

const StrataVisualization = ({ layers }: { layers: StrataLayer[] }) => {
  const [hoveredLayer, setHoveredLayer] = useState<StrataLayer | null>(null);
  
  return (
    <div className="relative">
      <svg width="100%" height="400" className="border border-border rounded-lg bg-background">
        {layers.map((layer, idx) => {
          const yStart = (idx / layers.length) * 400;
          const height = 400 / layers.length;
          
          return (
            <g key={idx}>
              <rect
                x="0"
                y={yStart}
                width="100%"
                height={height}
                fill={layer.color}
                stroke="#333"
                strokeWidth="1"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredLayer(layer)}
                onMouseLeave={() => setHoveredLayer(null)}
              />
              <text
                x="10"
                y={yStart + height / 2 + 5}
                fill={idx < 2 ? '#000' : '#FFF'}
                fontSize="14"
                fontWeight="bold"
              >
                {layer.layer}
              </text>
              <text
                x="150"
                y={yStart + height / 2 + 5}
                fill={idx < 2 ? '#333' : '#EEE'}
                fontSize="12"
              >
                {layer.depth}
              </text>
            </g>
          );
        })}
      </svg>
      
      {hoveredLayer && (
        <div className="mt-4 p-4 bg-muted border border-border rounded-lg">
          <div className="font-bold text-lg mb-2">{hoveredLayer.layer} Layer</div>
          <div className="space-y-1 text-sm">
            <div><span className="font-semibold">Period:</span> {hoveredLayer.period}</div>
            <div><span className="font-semibold">Depth:</span> {hoveredLayer.depth}</div>
            <div><span className="font-semibold">Artifacts:</span> {hoveredLayer.artifacts}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ArchaeologicalStrataViewer = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Vārāṇasī');
  
  const currentStrata = STRATA_DATA.find(s => s.city === selectedCity);
  
  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Archaeological Stratigraphy</CardTitle>
        <CardDescription>
          Exploring the layers of continuous occupation beneath India's ancient cities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Select City:</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STRATA_DATA.map((city) => (
                <SelectItem key={city.city} value={city.city}>
                  {city.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentStrata && (
          <>
            <StrataVisualization layers={currentStrata.layers} />
            
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold text-sm">Occupation Layers:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentStrata.layers.map((layer, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-xs">
                      {layer.layer}: {layer.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Archaeological excavations reveal distinct occupation layers, each representing 
              different historical periods. Hover over layers to see artifacts and dating information.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
