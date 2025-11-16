import React from 'react';
import { Card } from '@/components/ui/card';

interface AcousticSite {
  name: string;
  location: string;
  coordinates: [number, number];
  resonanceFrequency: string;
  geology: string;
  petroglyphs: number;
  description: string;
  color: string;
}

const acousticSites: AcousticSite[] = [
  {
    name: 'Kupgal-Sanganakallu',
    location: 'Karnataka',
    coordinates: [15.35, 76.62],
    resonanceFrequency: '400-800 Hz',
    geology: 'Basaltic Dolerite',
    petroglyphs: 200,
    description: 'Over 200 boulders producing sustained musical notes. Neolithic acoustic site with extensive rock art.',
    color: 'hsl(var(--chart-1))'
  },
  {
    name: 'Hirebenakal',
    location: 'Karnataka',
    coordinates: [15.23, 76.91],
    resonanceFrequency: '200-500 Hz',
    geology: 'Granite Gneiss',
    petroglyphs: 85,
    description: 'Iron Age megalithic site featuring giant "kettledrum" stone audible for kilometers.',
    color: 'hsl(var(--chart-2))'
  },
  {
    name: 'Hanamsagar',
    location: 'Karnataka',
    coordinates: [15.58, 76.45],
    resonanceFrequency: '350-700 Hz',
    geology: 'Dolerite',
    petroglyphs: 42,
    description: 'Acoustic petroglyph site with ringing rocks and ceremonial arrangements.',
    color: 'hsl(var(--chart-3))'
  }
];

export const AcousticSiteMap: React.FC = () => {
  const [selectedSite, setSelectedSite] = React.useState<AcousticSite | null>(null);

  return (
    <Card className="p-6 my-8 border-border bg-card">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Deccan Acoustic Sites Survey</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Interactive map of ringing rock locations across the Deccan Plateau, showing resonance frequencies and geological characteristics.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Map visualization */}
        <div className="relative bg-muted/30 rounded-lg p-8 min-h-[400px] border border-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 300 200" className="w-full h-full">
              {/* Karnataka outline (simplified) */}
              <path
                d="M 50,50 L 250,50 L 250,180 L 50,180 Z"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                opacity="0.3"
              />
              
              {/* Acoustic sites */}
              {acousticSites.map((site, index) => {
                const x = 50 + (site.coordinates[1] - 76) * 200;
                const y = 180 - (site.coordinates[0] - 15) * 130;
                
                return (
                  <g key={site.name}>
                    {/* Site marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={selectedSite?.name === site.name ? 12 : 8}
                      fill={site.color}
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      onClick={() => setSelectedSite(selectedSite?.name === site.name ? null : site)}
                    />
                    
                    {/* Resonance frequency rings */}
                    <circle
                      cx={x}
                      cy={y}
                      r={20}
                      fill="none"
                      stroke={site.color}
                      strokeWidth="1"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={30}
                      fill="none"
                      stroke={site.color}
                      strokeWidth="0.5"
                      opacity="0.2"
                      className="animate-pulse"
                      style={{ animationDelay: '0.5s' }}
                    />
                    
                    {/* Site label */}
                    <text
                      x={x}
                      y={y - 20}
                      fontSize="10"
                      fill="hsl(var(--foreground))"
                      textAnchor="middle"
                      className="font-medium pointer-events-none"
                    >
                      {site.name.split('-')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Site details */}
        <div className="space-y-4">
          {selectedSite ? (
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">{selectedSite.name}</h4>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {selectedSite.location}
                </span>
              </div>
              
              <p className="text-sm text-foreground/80 mb-4">{selectedSite.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Resonance Range</p>
                  <p className="text-sm font-medium text-foreground">{selectedSite.resonanceFrequency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Geology</p>
                  <p className="text-sm font-medium text-foreground">{selectedSite.geology}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Petroglyphs</p>
                  <p className="text-sm font-medium text-foreground">{selectedSite.petroglyphs}+</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Period</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedSite.name.includes('Hirebenakal') ? 'Iron Age' : 'Neolithic'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Click on a site marker to view detailed information
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h5 className="text-sm font-semibold mb-3 text-foreground">Frequency Legend</h5>
            <div className="space-y-2">
              {acousticSites.map(site => (
                <div key={site.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: site.color }}
                  />
                  <span className="text-xs text-foreground/70">{site.resonanceFrequency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
