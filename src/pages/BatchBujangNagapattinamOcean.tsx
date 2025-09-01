import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";

/**
 * Srangam — Ready React pages (single-file batch)
 * Topics: Bujang Valley (Kedah), Nagapattinam Guilds, Ocean of Churn map-essay
 * - Tailwind for styling with Srangam design system
 * - Inline SVG maps & diagrams (no external images)
 * - JSON data bundled for quick chart/map hooks
 */

/* ===================== DATA LAYERS ===================== */

// 1) Bujang Valley & neighbors (very rough lat/lon)
const BUJANG_PORTS = [
  { id: "Sungai Batu", lat: 5.66, lon: 100.49, note: "Riverine jetty/industry cluster" },
  { id: "Merapoh / Merbok", lat: 5.69, lon: 100.50, note: "Candi & port archaeology" },
  { id: "Kuala Kedah", lat: 6.11, lon: 100.30, note: "Coastal egress to Bay of Bengal" },
  { id: "Andaman Waypoint", lat: 12.0, lon: 92.8, note: "Open-sea hop (schematic)" },
  { id: "Nagapattinam", lat: 10.77, lon: 79.84, note: "Coromandel temple-port" },
  { id: "Barus (Sumatra)", lat: 2.01, lon: 98.38, note: "Camphor & aromatics" },
];

const BUJANG_ROUTES = [
  ["Sungai Batu", "Kuala Kedah"],
  ["Kuala Kedah", "Andaman Waypoint"],
  ["Andaman Waypoint", "Nagapattinam"],
  ["Kuala Kedah", "Barus (Sumatra)"],
];

// 2) Nagapattinam guilds (nodes = institutions; edges = corridors)
const GUILD_NODES = [
  { id: "Nagapattinam", type: "port" },
  { id: "Ayyavole 500", type: "guild" },
  { id: "Manigramam", type: "guild" },
  { id: "Anjuvannam", type: "guild" },
  { id: "Quanzhou", type: "port" },
  { id: "Srivijaya", type: "polity" },
  { id: "Kedah (Bujang)", type: "port" },
  { id: "Thanjavur", type: "temple" },
];

const GUILD_EDGES = [
  ["Nagapattinam", "Ayyavole 500"],
  ["Nagapattinam", "Manigramam"],
  ["Nagapattinam", "Anjuvannam"],
  ["Ayyavole 500", "Kedah (Bujang)"],
  ["Manigramam", "Srivijaya"],
  ["Anjuvannam", "Quanzhou"],
  ["Nagapattinam", "Thanjavur"],
];

// 3) Ocean of Churn — map essay toggles
const OCEAN_LAYERS = {
  ports: [
    { id: "Muziris", lat: 10.21, lon: 76.26 },
    { id: "Berenike", lat: 23.91, lon: 35.5 },
    { id: "Myos Hormos", lat: 26.16, lon: 34.26 },
    { id: "Kedah (Bujang)", lat: 5.69, lon: 100.5 },
    { id: "Nagapattinam", lat: 10.77, lon: 79.84 },
    { id: "Barus", lat: 2.01, lon: 98.38 },
  ],
  windsSummer: [
    { from: [18, 52], to: [10, 75] },
    { from: [12, 70], to: [6, 88] },
  ],
  windsWinter: [
    { from: [10, 75], to: [18, 52] },
    { from: [6, 88], to: [12, 70] },
  ],
};

/* ===================== HELPERS ===================== */
function project([lat, lon]: [number, number], w = 900, h = 480) {
  const x = ((lon - 20) / (120 - 20)) * (w - 60) + 30;
  const y = ((30 - lat) / (30 - -10)) * (h - 60) + 30;
  return [x, y];
}

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="text-ocean">{icon}</div>}
      <h2 className="text-2xl font-serif font-semibold text-ink">{title}</h2>
    </div>
    {children}
  </section>
);

/* ===================== COMPONENTS ===================== */

const BujangMapComponent: React.FC = () => {
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);
  
  const routes = useMemo(() => {
    return BUJANG_ROUTES.map(([from, to]) => {
      const fromPort = BUJANG_PORTS.find(p => p.id === from);
      const toPort = BUJANG_PORTS.find(p => p.id === to);
      if (!fromPort || !toPort) return null;
      
      const [x1, y1] = project([fromPort.lat, fromPort.lon]);
      const [x2, y2] = project([toPort.lat, toPort.lon]);
      
      return { from: fromPort.id, to: toPort.id, x1, y1, x2, y2 };
    }).filter(Boolean);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bujang Valley Network</CardTitle>
      </CardHeader>
      <CardContent>
        <svg width="100%" height="400" viewBox="0 0 900 400" className="border border-border rounded-lg bg-background">
          {/* Sea background */}
          <rect width="900" height="400" fill="hsl(var(--ocean) / 0.1)" />
          
          {/* Routes */}
          {routes.map((route, i) => (
            <line
              key={i}
              x1={route.x1}
              y1={route.y1}
              x2={route.x2}
              y2={route.y2}
              stroke="hsl(var(--gold))"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}
          
          {/* Ports */}
          {BUJANG_PORTS.map((port) => {
            const [x, y] = project([port.lat, port.lon]);
            const isHovered = hoveredPort === port.id;
            
            return (
              <g key={port.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 6}
                  fill="hsl(var(--laterite))"
                  stroke="hsl(var(--ink))"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPort(port.id)}
                  onMouseLeave={() => setHoveredPort(null)}
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="text-xs font-medium fill-ink"
                >
                  {port.id}
                </text>
                {isHovered && (
                  <text
                    x={x}
                    y={y + 25}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    {port.note}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Archaeological sites in the Bujang Valley reveal a sophisticated port network connecting the Malacca Straits to the Bay of Bengal. Hover over ports for details.</p>
        </div>
      </CardContent>
    </Card>
  );
};

const GuildNetworkComponent: React.FC = () => {
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  
  const nodePositions = useMemo(() => {
    const positions: Record<string, [number, number]> = {};
    GUILD_NODES.forEach((node, i) => {
      const angle = (i / GUILD_NODES.length) * 2 * Math.PI;
      const radius = node.type === 'port' ? 120 : node.type === 'guild' ? 80 : 100;
      positions[node.id] = [
        200 + radius * Math.cos(angle),
        200 + radius * Math.sin(angle)
      ];
    });
    return positions;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nagapattinam Guild Networks</CardTitle>
      </CardHeader>
      <CardContent>
        <svg width="100%" height="400" viewBox="0 0 400 400" className="border border-border rounded-lg bg-background">
          {/* Edges */}
          {GUILD_EDGES.map(([from, to], i) => {
            const [x1, y1] = nodePositions[from] || [0, 0];
            const [x2, y2] = nodePositions[to] || [0, 0];
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--gold) / 0.6)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Nodes */}
          {GUILD_NODES.map((node) => {
            const [x, y] = nodePositions[node.id] || [0, 0];
            const isSelected = selectedGuild === node.id;
            
            const getNodeColor = (type: string) => {
              switch (type) {
                case 'port': return 'hsl(var(--ocean))';
                case 'guild': return 'hsl(var(--laterite))';
                case 'polity': return 'hsl(var(--gold))';
                case 'temple': return 'hsl(var(--accent))';
                default: return 'hsl(var(--muted))';
              }
            };
            
            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 12 : 8}
                  fill={getNodeColor(node.type)}
                  stroke="hsl(var(--ink))"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onClick={() => setSelectedGuild(isSelected ? null : node.id)}
                />
                <text
                  x={x}
                  y={y + 20}
                  textAnchor="middle"
                  className="text-xs font-medium fill-ink"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
        
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <TagChip variant="theme">Ports</TagChip>
            <TagChip variant="default">Guilds</TagChip>
            <TagChip variant="theme">Polities</TagChip>
            <TagChip variant="default">Temples</TagChip>
          </div>
          <p className="text-sm text-muted-foreground">
            Click on nodes to explore the interconnected network of merchant guilds, ports, and political entities that facilitated Indian Ocean trade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const OceanChurnComponent: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'ports' | 'summer' | 'winter'>('ports');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocean of Churn: Interactive Map Essay</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeLayer === 'ports' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLayer('ports')}
          >
            Ports
          </Button>
          <Button
            variant={activeLayer === 'summer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLayer('summer')}
          >
            Summer Monsoon
          </Button>
          <Button
            variant={activeLayer === 'winter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLayer('winter')}
          >
            Winter Monsoon
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <svg width="100%" height="400" viewBox="0 0 900 400" className="border border-border rounded-lg bg-background">
          {/* Ocean background */}
          <rect width="900" height="400" fill="hsl(var(--ocean) / 0.1)" />
          
          {/* Coastlines (simplified) */}
          <path
            d="M 50 100 Q 150 80 250 100 T 450 120 L 450 300 Q 350 280 250 300 T 50 320 Z"
            fill="hsl(var(--sand) / 0.5)"
            stroke="hsl(var(--laterite))"
            strokeWidth="1"
          />
          
          {activeLayer === 'ports' && OCEAN_LAYERS.ports.map((port) => {
            const [x, y] = project([port.lat, port.lon]);
            return (
              <g key={port.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="hsl(var(--laterite))"
                  stroke="hsl(var(--ink))"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-xs font-medium fill-ink"
                >
                  {port.id}
                </text>
              </g>
            );
          })}
          
          {activeLayer === 'summer' && OCEAN_LAYERS.windsSummer.map((wind, i) => {
            const [x1, y1] = wind.from;
            const [x2, y2] = wind.to;
            return (
              <g key={i}>
                <line
                  x1={x1 * 20}
                  y1={y1 * 8}
                  x2={x2 * 20}
                  y2={y2 * 8}
                  stroke="hsl(var(--gold))"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
          
          {activeLayer === 'winter' && OCEAN_LAYERS.windsWinter.map((wind, i) => {
            const [x1, y1] = wind.from;
            const [x2, y2] = wind.to;
            return (
              <g key={i}>
                <line
                  x1={x1 * 20}
                  y1={y1 * 8}
                  x2={x2 * 20}
                  y2={y2 * 8}
                  stroke="hsl(var(--ocean))"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
          
          {/* Arrow marker */}
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
                fill="currentColor"
              />
            </marker>
          </defs>
        </svg>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {activeLayer === 'ports' && (
            <p>Major ports and trading centers of the ancient Indian Ocean world. Each dot represents centuries of maritime commerce and cultural exchange.</p>
          )}
          {activeLayer === 'summer' && (
            <p>Summer monsoon winds (May-September) drove ships eastward from the Arabian Peninsula to India and beyond, following predictable patterns that merchants relied upon.</p>
          )}
          {activeLayer === 'winter' && (
            <p>Winter monsoon winds (November-March) reversed direction, carrying ships westward back to the Arabian Peninsula and Red Sea ports.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* ===================== MAIN COMPONENT ===================== */

const BatchBujangNagapattinamOcean: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bujang' | 'nagapattinam' | 'ocean'>('bujang');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-ink mb-4">
            Maritime Networks of the Indian Ocean
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore the interconnected world of ancient maritime trade through three lenses: 
            the Bujang Valley network, Nagapattinam merchant guilds, and the Ocean of Churn.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'bujang' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('bujang')}
              className="rounded-md"
            >
              Bujang Valley
            </Button>
            <Button
              variant={activeTab === 'nagapattinam' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('nagapattinam')}
              className="rounded-md"
            >
              Nagapattinam Guilds
            </Button>
            <Button
              variant={activeTab === 'ocean' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('ocean')}
              className="rounded-md"
            >
              Ocean of Churn
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'bujang' && (
            <Section title="Bujang Valley: Gateway to the Bay of Bengal">
              <div className="grid gap-8">
                <BujangMapComponent />
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    The Bujang Valley in Kedah represents one of Southeast Asia's most significant archaeological complexes, 
                    revealing sophisticated port infrastructure that connected the Malacca Straits to the broader Indian Ocean world. 
                    From the 2nd century CE onward, this network facilitated the flow of goods, ideas, and people across maritime Asia.
                  </p>
                  <blockquote className="border-l-4 border-ocean pl-4 italic text-muted-foreground">
                    "At Sungai Batu, the archaeological evidence reveals not just a port, but an industrial complex—
                    iron smelting, bead production, and ritual structures all integrated into a maritime economy."
                  </blockquote>
                  {/* IMAGE SLOT: Bujang Valley archaeological site with ancient structures and waterways */}
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'nagapattinam' && (
            <Section title="Nagapattinam: Hub of Merchant Guilds">
              <div className="grid gap-8">
                <GuildNetworkComponent />
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    Nagapattinam served as a crucial node in the medieval Indian Ocean trade network, where powerful merchant guilds 
                    like the Ayyavole 500, Manigramam, and Anjuvannam orchestrated commerce across vast distances. These institutions 
                    created the organizational framework that made long-distance trade viable and profitable.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-ink mb-2">Key Merchant Guilds:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><strong>Ayyavole 500:</strong> Controlled trade routes to Southeast Asia</li>
                      <li><strong>Manigramam:</strong> Specialized in pepper and spice trade</li>
                      <li><strong>Anjuvannam:</strong> Jewish merchant network connecting to China</li>
                    </ul>
                  </div>
                  {/* IMAGE SLOT: Nagapattinam temple complex showing merchant guild inscriptions */}
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'ocean' && (
            <Section title="Ocean of Churn: Monsoon Patterns and Trade">
              <div className="grid gap-8">
                <OceanChurnComponent />
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    The Indian Ocean's monsoon system created a predictable rhythm of trade that connected distant shores. 
                    Merchants learned to read the winds, timing their journeys to catch favorable currents and avoid dangerous storms. 
                    This natural clock governed the flow of goods, people, and ideas across the ocean.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-ink mb-2">Summer Monsoon (SW)</h4>
                      <p className="text-sm text-muted-foreground">
                        May to September: Winds blow from the southwest, carrying ships eastward 
                        from Arabia to India and beyond to Southeast Asia.
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-ink mb-2">Winter Monsoon (NE)</h4>
                      <p className="text-sm text-muted-foreground">
                        November to March: Winds reverse, blowing from the northeast, 
                        bringing ships back westward to Arabian and Red Sea ports.
                      </p>
                    </div>
                  </div>
                  {/* IMAGE SLOT: Satellite view of Indian Ocean showing monsoon wind patterns */}
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchBujangNagapattinamOcean;