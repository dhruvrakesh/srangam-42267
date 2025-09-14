import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, ArrowRight, Calendar } from 'lucide-react';

type Season = 'summer' | 'winter';

const windPatterns = {
  summer: {
    title: 'Southwest Monsoon (Summer)',
    period: 'April - August',
    direction: 'From Africa/Arabia → India/SE Asia',
    description: 'Ships sail eastward with the Hippalus winds',
    color: 'laterite',
    arrows: [
      { x1: 80, y1: 120, x2: 300, y2: 80 },
      { x1: 100, y1: 140, x2: 320, y2: 100 },
      { x1: 120, y1: 160, x2: 340, y2: 120 }
    ]
  },
  winter: {
    title: 'Northeast Monsoon (Winter)',
    period: 'November - February', 
    direction: 'From India/SE Asia → Africa/Arabia',
    description: 'Return voyages with winter easterlies',
    color: 'oceanTeal',
    arrows: [
      { x1: 320, y1: 80, x2: 100, y2: 120 },
      { x1: 340, y1: 100, x2: 120, y2: 140 },
      { x1: 360, y1: 120, x2: 140, y2: 160 }
    ]
  }
};

export function SeasonalWindPattern() {
  const [activeSeason, setActiveSeason] = useState<Season>('summer');
  const currentPattern = windPatterns[activeSeason];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="ocean-waves">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wind className="text-oceanTeal animate-pulse" size={24} />
          Ancient Monsoon Navigation Calendar
        </CardTitle>
        <CardDescription>
          Seasonal wind reversals that powered Indian Ocean trade • Click to explore each season
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-6">
          {(['summer', 'winter'] as Season[]).map((season) => (
            <Button
              key={season}
              variant={activeSeason === season ? 'default' : 'outline'}
              onClick={() => setActiveSeason(season)}
              className="flex-1"
            >
              <Calendar className="mr-2" size={16} />
              {season === 'summer' ? 'Summer Winds' : 'Winter Winds'}
            </Button>
          ))}
        </div>

        <div className={`bg-${currentPattern.color}/5 p-4 rounded-lg border border-${currentPattern.color}/20 mb-4`}>
          <h3 className={`font-semibold text-${currentPattern.color} mb-2`}>
            {currentPattern.title}
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div><strong>Period:</strong> {currentPattern.period}</div>
            <div><strong>Direction:</strong> {currentPattern.direction}</div>
            <div><strong>Trade Use:</strong> {currentPattern.description}</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <svg viewBox="0 0 400 200" className="w-full h-40">
            <defs>
              <marker 
                id={`arrow-${activeSeason}`} 
                viewBox="0 0 10 10" 
                refX="9" 
                refY="5" 
                markerWidth="6" 
                markerHeight="6" 
                orient="auto"
              >
                <path d="M0,0 L0,10 L10,5 z" fill={`hsl(var(--${currentPattern.color}))`} />
              </marker>
            </defs>
            
            {/* Geographical regions */}
            <rect x="50" y="50" width="80" height="60" rx="8" 
                  fill="hsl(var(--sand))" stroke="hsl(var(--sand))" strokeWidth="2" />
            <text x="90" y="85" textAnchor="middle" className="text-xs font-medium fill-foreground">
              Red Sea/
            </text>
            <text x="90" y="98" textAnchor="middle" className="text-xs font-medium fill-foreground">
              Arabia
            </text>

            <rect x="270" y="50" width="80" height="60" rx="8" 
                  fill="hsl(var(--turmeric))" stroke="hsl(var(--turmeric))" strokeWidth="2" />
            <text x="310" y="85" textAnchor="middle" className="text-xs font-medium fill-foreground">
              India/
            </text>
            <text x="310" y="98" textAnchor="middle" className="text-xs font-medium fill-foreground">
              SE Asia
            </text>

            {/* Wind arrows */}
            {currentPattern.arrows.map((arrow, index) => (
              <line
                key={index}
                x1={arrow.x1}
                y1={arrow.y1}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke={`hsl(var(--${currentPattern.color}))`}
                strokeWidth="3"
                markerEnd={`url(#arrow-${activeSeason})`}
                className="animate-pulse"
              />
            ))}

            {/* Season label */}
            <text x="200" y="180" textAnchor="middle" className={`text-sm font-bold fill-${currentPattern.color}`}>
              {activeSeason === 'summer' ? 'SW Monsoon' : 'NE Monsoon'}
            </text>
          </svg>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Based on M.F. Maury's 19th-century hydrographic charts and ancient navigation texts like the Periplus of the Erythraean Sea
        </div>
      </CardContent>
    </Card>
  );
}