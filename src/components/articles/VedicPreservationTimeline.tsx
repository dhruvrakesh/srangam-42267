import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  category: 'ancient' | 'crisis' | 'renaissance' | 'modern';
  significance: 'high' | 'medium' | 'low';
}

const events: TimelineEvent[] = [
  {
    year: -500,
    title: 'Anukramaṇīs Composed',
    description: 'Śaunaka and Kātyāyana systematize Vedic indices, establishing the Ṛṣi-Devatā-Chandas framework for textual preservation.',
    category: 'ancient',
    significance: 'high'
  },
  {
    year: 712,
    title: 'Arab Conquest of Sindh',
    description: 'Islamic invasions begin, marking the start of a prolonged period of disruption to traditional centers of learning.',
    category: 'crisis',
    significance: 'high'
  },
  {
    year: 1000,
    title: 'Turko-Afghan Campaigns Intensify',
    description: 'Systematic destruction of temples and educational institutions. Sanskrit loses court patronage in northern regions.',
    category: 'crisis',
    significance: 'high'
  },
  {
    year: 1336,
    title: 'Vijayanagara Empire Founded',
    description: 'Harihara I and Bukka Raya I establish empire under guidance of Vidyāraṇya. Dharmic renaissance begins.',
    category: 'renaissance',
    significance: 'high'
  },
  {
    year: 1350,
    title: 'Sāyaṇa Begins Vedārtha Prakāśa',
    description: 'Commissioned by Bukka Raya I, Sāyaṇāchārya initiates the first complete commentary on all four Vedas.',
    category: 'renaissance',
    significance: 'high'
  },
  {
    year: 1387,
    title: 'Sāyaṇāchārya Passes Away',
    description: 'Completion of the monumental Vedic commentary project, ensuring semantic preservation of the tradition.',
    category: 'renaissance',
    significance: 'high'
  },
  {
    year: 1800,
    title: 'Western Indology Begins',
    description: 'H.H. Wilson, Max Müller, and others use Sāyaṇa\'s commentary as gateway to Vedic studies.',
    category: 'modern',
    significance: 'medium'
  }
];

const categoryColors = {
  ancient: 'hsl(var(--chart-1))',
  crisis: 'hsl(var(--destructive))',
  renaissance: 'hsl(var(--chart-3))',
  modern: 'hsl(var(--chart-4))'
};

const categoryLabels = {
  ancient: 'Ancient Period',
  crisis: 'Medieval Crisis',
  renaissance: 'Vijayanagara Renaissance',
  modern: 'Modern Scholarship'
};

export function VedicPreservationTimeline() {
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 2300]);
  const minYear = -500;
  const maxYear = 1800;

  const filteredEvents = events.filter(
    e => e.year >= minYear + zoomRange[0] && e.year <= minYear + zoomRange[1]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>The Timeline of Vedic Preservation</CardTitle>
        <CardDescription>
          From ancient Anukramaṇīs to Sāyaṇa's medieval renaissance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Visualization */}
        <div className="relative h-32 border-l-2 border-border pl-4">
          {filteredEvents.map((event, idx) => {
            const position = ((event.year - (minYear + zoomRange[0])) / (zoomRange[1] - zoomRange[0])) * 100;
            return (
              <div
                key={idx}
                className="absolute flex items-center gap-2 group cursor-pointer"
                style={{ left: `${position}%`, top: idx % 2 === 0 ? '10px' : '60px' }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-background group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: categoryColors[event.category] }}
                />
                <div className="hidden group-hover:block absolute top-6 left-0 z-10 w-64 p-3 bg-popover border rounded-lg shadow-lg">
                  <div className="font-semibold text-sm mb-1">{event.title}</div>
                  <div className="text-xs text-muted-foreground mb-2">{event.year > 0 ? `${event.year} CE` : `${Math.abs(event.year)} BCE`}</div>
                  <div className="text-xs">{event.description}</div>
                  <Badge variant="secondary" className="mt-2 text-xs">{categoryLabels[event.category]}</Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Timeline Range</div>
          <Slider
            min={0}
            max={2300}
            step={100}
            value={[zoomRange[0]]}
            onValueChange={([start]) => setZoomRange([start, Math.min(start + 800, 2300)])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minYear + zoomRange[0] > 0 ? `${minYear + zoomRange[0]} CE` : `${Math.abs(minYear + zoomRange[0])} BCE`}</span>
            <span>{minYear + zoomRange[1] > 0 ? `${minYear + zoomRange[1]} CE` : `${Math.abs(minYear + zoomRange[1])} BCE`}</span>
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div
                className="w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: categoryColors[event.category] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {event.year > 0 ? `${event.year} CE` : `${Math.abs(event.year)} BCE`}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColors[key as keyof typeof categoryColors] }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
