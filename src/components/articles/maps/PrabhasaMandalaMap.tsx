import React from 'react';
import { Card } from '@/components/ui/card';

interface MandalaShrine {
  name: string;
  direction: string;
  deity: string;
  significance: string;
  color: string;
  coordinates: [number, number]; // x, y position
}

const mandalaLayout: MandalaShrine[] = [
  {
    name: 'Sūrya Mandira',
    direction: 'East',
    deity: 'Sūrya (Sun)',
    significance: 'Dawn illumination, solar worship, temporal order',
    color: 'hsl(45, 93%, 47%)',
    coordinates: [200, 50]
  },
  {
    name: 'Mādhava Kṣetra',
    direction: 'West',
    deity: 'Viṣṇu/Kṛṣṇa',
    significance: 'Preservation, Kṛṣṇa\'s departure site',
    color: 'hsl(240, 100%, 70%)',
    coordinates: [10, 50]
  },
  {
    name: 'Devī Bhavānī',
    direction: 'North',
    deity: 'Devī/Śakti',
    significance: 'Divine feminine, protective mother',
    color: 'hsl(350, 100%, 60%)',
    coordinates: [105, 10]
  },
  {
    name: 'Somnātha (Center)',
    direction: 'Axis Mundi',
    deity: 'Śiva Jyotirliṅga',
    significance: 'Cosmic pillar, Moon restoration, eternal Śiva',
    color: 'hsl(280, 100%, 70%)',
    coordinates: [105, 50]
  },
  {
    name: 'Sāgara (Ocean)',
    direction: 'South',
    deity: 'Varuṇa/Ocean',
    significance: 'Dissolution, purification, cosmic waters',
    color: 'hsl(200, 100%, 50%)',
    coordinates: [105, 90]
  }
];

const triveNiSangam = {
  name: 'Triveṇī Saṅgam',
  description: 'Confluence of Sarasvatī, Hiraṇya, and Ocean',
  coordinates: [80, 70]
};

const pilgrimageRoutes = [
  { from: [105, 50], to: [200, 50], label: 'Dawn Procession' },
  { from: [105, 50], to: [10, 50], label: 'Kṛṣṇa Path' },
  { from: [105, 50], to: [105, 10], label: 'Devī Darśana' },
  { from: [105, 50], to: [80, 70], label: 'Sarasvatī Snāna' }
];

export const PrabhasaMandalaMap: React.FC = () => {
  const [selectedShrine, setSelectedShrine] = React.useState<MandalaShrine | null>(
    mandalaLayout.find(s => s.direction === 'Axis Mundi') || null
  );

  return (
    <Card className="p-6 my-8 border-border bg-card">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Prabhāsa Sacred Mandala</h3>
      <p className="text-sm text-muted-foreground mb-6">
        The Prabhāsa kṣetra as a sacred mandala: East-Sūrya, West-Mādhava, North-Devī, South-Ocean, with Somnātha at the cosmic axis.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Mandala visualization */}
        <div className="md:col-span-2">
          <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-8 border border-border aspect-[4/3]">
            <svg viewBox="0 0 220 120" className="w-full h-full">
              {/* Cosmic circle */}
              <circle
                cx="110"
                cy="60"
                r="50"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
                strokeDasharray="2,2"
              />
              <circle
                cx="110"
                cy="60"
                r="35"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
                strokeDasharray="2,2"
              />

              {/* Pilgrimage routes */}
              {pilgrimageRoutes.map((route, i) => (
                <line
                  key={i}
                  x1={route.from[0]}
                  y1={route.from[1]}
                  x2={route.to[0]}
                  y2={route.to[1]}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                  opacity="0.2"
                  strokeDasharray="3,3"
                />
              ))}

              {/* Triveṇī Saṅgam */}
              <g>
                <circle
                  cx={triveNiSangam.coordinates[0]}
                  cy={triveNiSangam.coordinates[1]}
                  r="4"
                  fill="hsl(200, 100%, 50%)"
                  opacity="0.6"
                />
                <circle
                  cx={triveNiSangam.coordinates[0]}
                  cy={triveNiSangam.coordinates[1]}
                  r="8"
                  fill="none"
                  stroke="hsl(200, 100%, 50%)"
                  strokeWidth="0.5"
                  opacity="0.4"
                  className="animate-pulse"
                />
                <text
                  x={triveNiSangam.coordinates[0] + 10}
                  y={triveNiSangam.coordinates[1] + 2}
                  fontSize="6"
                  fill="hsl(var(--foreground))"
                  className="text-xs"
                >
                  Saṅgam
                </text>
              </g>

              {/* Mandala shrines */}
              {mandalaLayout.map((shrine, index) => {
                const isSelected = selectedShrine?.name === shrine.name;
                const isCentral = shrine.direction === 'Axis Mundi';
                
                return (
                  <g key={shrine.name}>
                    {/* Shrine marker */}
                    <circle
                      cx={shrine.coordinates[0]}
                      cy={shrine.coordinates[1]}
                      r={isCentral ? 10 : (isSelected ? 7 : 5)}
                      fill={shrine.color}
                      opacity={isSelected ? 0.9 : 0.6}
                      className="cursor-pointer transition-all duration-300 hover:opacity-100"
                      onClick={() => setSelectedShrine(shrine)}
                    />
                    
                    {/* Glow effect for central shrine */}
                    {isCentral && (
                      <>
                        <circle
                          cx={shrine.coordinates[0]}
                          cy={shrine.coordinates[1]}
                          r="15"
                          fill="none"
                          stroke={shrine.color}
                          strokeWidth="1"
                          opacity="0.3"
                          className="animate-pulse"
                        />
                        <circle
                          cx={shrine.coordinates[0]}
                          cy={shrine.coordinates[1]}
                          r="20"
                          fill="none"
                          stroke={shrine.color}
                          strokeWidth="0.5"
                          opacity="0.2"
                          className="animate-pulse"
                          style={{ animationDelay: '0.5s' }}
                        />
                      </>
                    )}
                    
                    {/* Direction label */}
                    <text
                      x={shrine.coordinates[0]}
                      y={shrine.coordinates[1] + (isCentral ? 25 : 15)}
                      fontSize="7"
                      fill="hsl(var(--foreground))"
                      textAnchor="middle"
                      className="font-medium pointer-events-none"
                    >
                      {shrine.direction}
                    </text>
                  </g>
                );
              })}

              {/* Compass directions */}
              <text x="110" y="8" fontSize="6" fill="hsl(var(--muted-foreground))" textAnchor="middle">N</text>
              <text x="110" y="117" fontSize="6" fill="hsl(var(--muted-foreground))" textAnchor="middle">S</text>
              <text x="5" y="62" fontSize="6" fill="hsl(var(--muted-foreground))">W</text>
              <text x="210" y="62" fontSize="6" fill="hsl(var(--muted-foreground))" textAnchor="end">E</text>
            </svg>
          </div>
        </div>

        {/* Shrine details */}
        <div className="space-y-4">
          {selectedShrine && (
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <div
                className="w-full h-1 rounded-full mb-4"
                style={{ backgroundColor: selectedShrine.color }}
              />
              
              <h4 className="text-lg font-semibold mb-2 text-foreground">{selectedShrine.name}</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Direction</p>
                  <p className="text-sm font-medium text-foreground">{selectedShrine.direction}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Presiding Deity</p>
                  <p className="text-sm font-medium text-foreground">{selectedShrine.deity}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Significance</p>
                  <p className="text-sm text-foreground/80">{selectedShrine.significance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mandala legend */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h5 className="text-sm font-semibold mb-3 text-foreground">Directional Shrines</h5>
            <div className="space-y-2">
              {mandalaLayout.filter(s => s.direction !== 'Axis Mundi').map(shrine => (
                <button
                  key={shrine.name}
                  onClick={() => setSelectedShrine(shrine)}
                  className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-1 rounded transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: shrine.color }}
                  />
                  <span className="text-xs text-foreground/70">{shrine.direction}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sacred geography note */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-xs text-foreground/70">
              The Prabhāsa kṣetra embodies the Purāṇic concept of sacred geography as living theology—
              each direction represents a divine energy (śakti) anchored in the landscape.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
