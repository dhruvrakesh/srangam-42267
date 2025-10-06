import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Site {
  name: string;
  type: 'buddhist' | 'jain' | 'capital';
  x: number;
  y: number;
  description: string;
}

const sites: Site[] = [
  { name: "Pataliputra (Patna)", type: 'capital', x: 50, y: 45, description: "Mauryan capital, center of power" },
  { name: "Rajgir", type: 'buddhist', x: 55, y: 50, description: "Early Buddhist center, First Council site" },
  { name: "Nalanda", type: 'buddhist', x: 60, y: 48, description: "Major Buddhist learning center" },
  { name: "Bodh Gaya", type: 'buddhist', x: 65, y: 55, description: "Site of Buddha's enlightenment" },
  { name: "Sarnath", type: 'buddhist', x: 25, y: 40, description: "Buddha's first sermon" },
  { name: "Vaishali", type: 'jain', x: 45, y: 35, description: "Jain pilgrimage site, Mahāvīra's birthplace" },
  { name: "Pawapuri", type: 'jain', x: 58, y: 43, description: "Site of Mahāvīra's nirvāṇa" },
];

const getSiteColor = (type: Site['type']) => {
  switch (type) {
    case 'buddhist':
      return { fill: '#3B82F6', stroke: '#1D4ED8' }; // blue
    case 'jain':
      return { fill: '#F97316', stroke: '#C2410C' }; // orange
    case 'capital':
      return { fill: '#8B5CF6', stroke: '#6D28D9' }; // purple
  }
};

export const MagadhaRegionMap: React.FC = () => {
  return (
    <Card className="my-8 border-burgundy/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-burgundy">
          <span className="text-2xl">🗺️</span>
          Magadha and Surrounding Religious Centers (6th–3rd Century BCE)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* SVG Map */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-burgundy/30 shadow-inner">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Magadha region highlight */}
            <ellipse
              cx="55"
              cy="47"
              rx="20"
              ry="15"
              fill="rgba(139, 92, 246, 0.1)"
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="0.5"
              strokeDasharray="2,1"
            />
            <text x="55" y="30" textAnchor="middle" className="text-[4px] fill-purple-700 dark:fill-purple-400 font-semibold">
              MAGADHA
            </text>

            {/* Sites */}
            {sites.map((site, index) => {
              const colors = getSiteColor(site.type);
              return (
                <g key={index}>
                  {/* Site marker */}
                  <circle
                    cx={site.x}
                    cy={site.y}
                    r="2.5"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="0.5"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <title>{site.name}: {site.description}</title>
                  </circle>
                  
                  {/* Site label */}
                  <text
                    x={site.x}
                    y={site.y - 4}
                    textAnchor="middle"
                    className="text-[2.5px] fill-slate-700 dark:fill-slate-300 font-medium pointer-events-none"
                  >
                    {site.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Ganges River representation */}
            <path
              d="M 10 40 Q 30 42, 50 43 T 90 38"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <text x="85" y="35" className="text-[2px] fill-blue-600 dark:fill-blue-400 italic">
              Ganges
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-700" />
            <span className="text-sm font-medium">Buddhist Centers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-700" />
            <span className="text-sm font-medium">Jain Centers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-700" />
            <span className="text-sm font-medium">Political Capital</span>
          </div>
        </div>

        {/* Site descriptions */}
        <div className="mt-6 pt-4 border-t border-burgundy/20">
          <h4 className="text-sm font-semibold text-foreground mb-3">Site Descriptions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            {sites.map((site, index) => (
              <div key={index} className="flex gap-2">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-0.5 ${
                  site.type === 'buddhist' ? 'bg-blue-500' : 
                  site.type === 'jain' ? 'bg-orange-500' : 
                  'bg-purple-500'
                }`} />
                <div>
                  <span className="font-semibold text-foreground">{site.name}:</span> {site.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-burgundy/20 text-sm text-muted-foreground italic">
          This simplified map shows the concentration of Śramaṇa religious centers in and around Magadha, illustrating the region's distinctive non-Vedic character during the 6th–3rd centuries BCE.
        </div>
      </CardContent>
    </Card>
  );
};
