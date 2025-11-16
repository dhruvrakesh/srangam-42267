import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimePeriod {
  era: string;
  start: number;
  end: number;
  color: string;
  description: string;
}

interface CityTimeline {
  name: string;
  totalAge: string;
  periods: TimePeriod[];
}

const CITY_TIMELINES: CityTimeline[] = [
  {
    name: 'Vārāṇasī (Kāśī)',
    totalAge: '3000+ years',
    periods: [
      { era: 'Early Iron Age', start: -1000, end: -500, color: 'hsl(30, 65%, 45%)', description: 'Painted Grey Ware culture' },
      { era: 'Mauryan', start: -320, end: -185, color: 'hsl(45, 75%, 55%)', description: 'NBP ware, urban expansion' },
      { era: 'Gupta', start: 320, end: 550, color: 'hsl(50, 85%, 65%)', description: 'Golden age of Sanskrit' },
      { era: 'Medieval', start: 1100, end: 1700, color: 'hsl(35, 70%, 50%)', description: 'Sultanate & Mughal periods' },
      { era: 'Modern', start: 1700, end: 2024, color: 'hsl(40, 80%, 60%)', description: 'British Raj to present' }
    ]
  },
  {
    name: 'Pāṭaliputra (Patna)',
    totalAge: '2500+ years',
    periods: [
      { era: 'Nanda', start: -400, end: -320, color: 'hsl(200, 60%, 45%)', description: 'First empire builders' },
      { era: 'Mauryan', start: -320, end: -185, color: 'hsl(210, 70%, 55%)', description: 'Aśoka\'s capital' },
      { era: 'Gupta', start: 320, end: 550, color: 'hsl(220, 75%, 65%)', description: 'Imperial capital' },
      { era: 'Pala', start: 750, end: 1200, color: 'hsl(205, 65%, 50%)', description: 'Buddhist patronage' },
      { era: 'Modern', start: 1700, end: 2024, color: 'hsl(215, 80%, 60%)', description: 'Colonial to contemporary' }
    ]
  },
  {
    name: 'Ujjain (Avantī)',
    totalAge: '2800+ years',
    periods: [
      { era: 'Early Historic', start: -800, end: -300, color: 'hsl(270, 60%, 45%)', description: 'Astronomical center' },
      { era: 'Mauryan', start: -320, end: -185, color: 'hsl(280, 70%, 55%)', description: 'Provincial capital' },
      { era: 'Gupta', start: 320, end: 550, color: 'hsl(290, 75%, 65%)', description: 'Kālidāsa\'s era' },
      { era: 'Paramara', start: 800, end: 1300, color: 'hsl(275, 70%, 50%)', description: 'Cultural renaissance' },
      { era: 'Modern', start: 1700, end: 2024, color: 'hsl(285, 80%, 60%)', description: 'Kumbh Mela tradition' }
    ]
  },
  {
    name: 'Madurai',
    totalAge: '2500+ years',
    periods: [
      { era: 'Sangam', start: -300, end: 300, color: 'hsl(10, 65%, 50%)', description: 'Tamil literary academies' },
      { era: 'Pandya', start: 300, end: 1300, color: 'hsl(15, 75%, 60%)', description: 'Temple building era' },
      { era: 'Nayak', start: 1559, end: 1736, color: 'hsl(20, 80%, 65%)', description: 'Meenakshi Temple expansion' },
      { era: 'Modern', start: 1800, end: 2024, color: 'hsl(25, 85%, 70%)', description: 'Cultural capital of Tamil Nadu' }
    ]
  },
  {
    name: 'Kanchipuram',
    totalAge: '2000+ years',
    periods: [
      { era: 'Early Pallava', start: 300, end: 600, color: 'hsl(140, 60%, 45%)', description: 'Temple establishment' },
      { era: 'Late Pallava', start: 600, end: 900, color: 'hsl(150, 70%, 55%)', description: 'Rock-cut architecture' },
      { era: 'Chola', start: 900, end: 1300, color: 'hsl(160, 75%, 65%)', description: 'Silk weaving begins' },
      { era: 'Vijayanagara', start: 1336, end: 1646, color: 'hsl(145, 70%, 50%)', description: 'Temple patronage' },
      { era: 'Modern', start: 1800, end: 2024, color: 'hsl(155, 80%, 60%)', description: 'City of thousand temples' }
    ]
  }
];

const TimelineBar = ({ periods, cityName }: { periods: TimePeriod[]; cityName: string }) => {
  const [hoveredPeriod, setHoveredPeriod] = useState<TimePeriod | null>(null);
  
  const minYear = -1000;
  const maxYear = 2024;
  const totalRange = maxYear - minYear;
  
  const getPosition = (year: number) => {
    return ((year - minYear) / totalRange) * 100;
  };
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm w-40">{cityName}</span>
      </div>
      <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
        {periods.map((period, idx) => {
          const left = getPosition(period.start);
          const width = getPosition(period.end) - left;
          
          return (
            <div
              key={idx}
              className="absolute h-full transition-all duration-200 cursor-pointer hover:opacity-90"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: period.color
              }}
              onMouseEnter={() => setHoveredPeriod(period)}
              onMouseLeave={() => setHoveredPeriod(null)}
            />
          );
        })}
      </div>
      {hoveredPeriod && (
        <div className="mt-2 p-2 bg-background border border-border rounded-md text-xs">
          <div className="font-semibold">{hoveredPeriod.era}</div>
          <div className="text-muted-foreground">
            {hoveredPeriod.start < 0 ? `${Math.abs(hoveredPeriod.start)} BCE` : `${hoveredPeriod.start} CE`} - 
            {hoveredPeriod.end < 0 ? ` ${Math.abs(hoveredPeriod.end)} BCE` : ` ${hoveredPeriod.end} CE`}
          </div>
          <div className="mt-1">{hoveredPeriod.description}</div>
        </div>
      )}
    </div>
  );
};

export const ContinuousHabitationTimeline = () => {
  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Continuous Habitation Timeline</CardTitle>
        <CardDescription>
          Visualizing millennia of unbroken urban occupation across ancient Indian cities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {CITY_TIMELINES.map((city, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="text-xs">
                  {city.totalAge}
                </Badge>
              </div>
              <TimelineBar periods={city.periods} cityName={city.name} />
            </div>
          ))}
          
          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1000 BCE</span>
              <span>0 CE</span>
              <span>1000 CE</span>
              <span>2024 CE</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Hover over timeline segments to view dynasty names and historical details. 
            Colors represent different ruling periods and cultural eras.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
