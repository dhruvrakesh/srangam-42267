import React, { useState } from 'react';
import { PORTS } from '@/data/siteData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface InteractivePortMapProps {
  onClose: () => void;
}

export function InteractivePortMap({ onClose }: InteractivePortMapProps) {
  const [selectedPort, setSelectedPort] = useState<typeof PORTS[0] | null>(null);
  const [filterEra, setFilterEra] = useState<string>('all');

  const filteredPorts = filterEra === 'all' 
    ? PORTS 
    : PORTS.filter(port => port.era.toLowerCase().includes(filterEra.toLowerCase()));

  const eras = [...new Set(PORTS.map(port => port.era))];

  // Convert lat/lon to SVG coordinates (simplified projection)
  const getPortPosition = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Interactive Port Map</h2>
            <p className="text-muted-foreground">Click on ports to explore the maritime network</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterEra === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterEra('all')}
            >
              All Eras
            </Button>
            {eras.map(era => (
              <Button
                key={era}
                variant={filterEra === era ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterEra(era)}
              >
                {era}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <svg 
                viewBox="0 0 800 400" 
                className="w-full h-auto border border-border rounded-lg bg-ocean/10"
              >
                {/* Ocean background */}
                <rect width="800" height="400" fill="hsl(var(--ocean) / 0.1)" />
                
                {/* Simplified coastlines */}
                <path
                  d="M 50 200 Q 200 180 350 200 Q 500 220 700 200"
                  fill="none"
                  stroke="hsl(var(--sand))"
                  strokeWidth="3"
                />
                <path
                  d="M 100 100 Q 300 80 500 100 Q 650 120 750 100"
                  fill="none"
                  stroke="hsl(var(--sand))"
                  strokeWidth="2"
                />
                <path
                  d="M 150 300 Q 350 280 550 300 Q 700 320 750 300"
                  fill="none"
                  stroke="hsl(var(--sand))"
                  strokeWidth="2"
                />

                {/* Port markers */}
                {filteredPorts.map((port) => {
                  const pos = getPortPosition(port.lat, port.lon);
                  const isSelected = selectedPort?.id === port.id;
                  
                  return (
                    <g key={port.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 8 : 6}
                        fill="hsl(var(--gold))"
                        stroke="hsl(var(--laterite))"
                        strokeWidth={isSelected ? 3 : 2}
                        className="cursor-pointer transition-all duration-200 hover:r-8"
                        onClick={() => setSelectedPort(port)}
                      />
                      {isSelected && (
                        <text
                          x={pos.x}
                          y={pos.y - 15}
                          textAnchor="middle"
                          className="fill-foreground text-sm font-medium"
                        >
                          {port.id}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Trade route lines */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="hsl(var(--ocean))"
                    />
                  </marker>
                </defs>
                
                {/* Sample trade routes */}
                <path
                  d="M 150 200 Q 300 180 450 200 Q 600 220 750 200"
                  fill="none"
                  stroke="hsl(var(--ocean))"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* Port Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {selectedPort ? 'Port Details' : 'Select a Port'}
              </h3>
              
              {selectedPort ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground text-lg">{selectedPort.id}</h4>
                    <p className="text-sm text-muted-foreground">{selectedPort.region}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground">Era</p>
                    <p className="text-sm text-muted-foreground">{selectedPort.era}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground">Coordinates</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPort.lat.toFixed(2)}°N, {selectedPort.lon.toFixed(2)}°E
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPort.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gold"></div>
                  </div>
                  <p className="text-muted-foreground">
                    Click on any port marker to explore its details and connections
                  </p>
                </div>
              )}
              
              {/* Port List */}
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-2">All Ports ({filteredPorts.length})</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {filteredPorts.map(port => (
                    <button
                      key={port.id}
                      onClick={() => setSelectedPort(port)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedPort?.id === port.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {port.id} • {port.region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}