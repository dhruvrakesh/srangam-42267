import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { IconBasalt } from '@/components/icons/IconBasalt';
import { Clock, Zap, Mountain, Skull } from 'lucide-react';

interface GeologicalEvent {
  id: string;
  ageMa: number;
  label: string;
  type: 'tectonic' | 'volcanic' | 'extinction' | 'sedimentary' | 'biostratigraphic' | 'climatic' | 'paleontological';
  description: string;
  culturalContext: string | null;
}

interface EventsData {
  events: GeologicalEvent[];
}

export const GeologicalTimelineInteractive: React.FC = () => {
  const [data, setData] = useState<EventsData | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [timeScale, setTimeScale] = useState<'full' | 'cenozoic' | 'recent'>('full');

  useEffect(() => {
    fetch('/data/geology/deep_time_events.json')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Error loading timeline data:', err));
  }, []);

  if (!data) {
    return (
      <Card className="my-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tectonic': return <Mountain className="h-4 w-4" />;
      case 'volcanic': return <Zap className="h-4 w-4" />;
      case 'extinction': return <Skull className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tectonic': return 'hsl(var(--laterite))';
      case 'volcanic': return 'hsl(var(--destructive))';
      case 'extinction': return 'hsl(var(--chart-5))';
      case 'sedimentary': return 'hsl(var(--chart-2))';
      case 'biostratigraphic': return 'hsl(var(--chart-3))';
      case 'climatic': return 'hsl(var(--ocean))';
      case 'paleontological': return 'hsl(var(--chart-4))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const filterByTimeScale = (events: GeologicalEvent[]) => {
    switch (timeScale) {
      case 'cenozoic': return events.filter(e => e.ageMa <= 66);
      case 'recent': return events.filter(e => e.ageMa <= 20);
      default: return events;
    }
  };

  const filterByType = (events: GeologicalEvent[]) => {
    if (selectedType === 'all') return events;
    return events.filter(e => e.type === selectedType);
  };

  const filteredEvents = filterByType(filterByTimeScale(data.events));

  // Prepare chart data
  const chartData = filteredEvents
    .sort((a, b) => b.ageMa - a.ageMa)
    .map(event => ({
      name: event.label.length > 20 ? event.label.substring(0, 17) + '...' : event.label,
      fullName: event.label,
      age: event.ageMa,
      type: event.type,
      ...event
    }));

  const eventTypes = Array.from(new Set(data.events.map(e => e.type)));

  return (
    <Card className="my-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBasalt className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Figure 2: Deep Time Timeline</CardTitle>
        </div>
        <CardDescription>
          Interactive geological timeline from Gondwana breakup to Holocene (180 Ma → Present)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Scale Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Tabs value={timeScale} onValueChange={(v) => setTimeScale(v as typeof timeScale)}>
            <TabsList>
              <TabsTrigger value="full">Full (180 Ma)</TabsTrigger>
              <TabsTrigger value="cenozoic">Cenozoic (66 Ma)</TabsTrigger>
              <TabsTrigger value="recent">Recent (20 Ma)</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedType === 'all' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedType('all')}
            >
              All Events
            </Badge>
            {eventTypes.map(type => (
              <Badge
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 80, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                dataKey="age"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                label={{ 
                  value: 'Age (Million years ago)', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
                reversed
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                width={75}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 space-y-2 max-w-xs">
                        <p className="font-semibold text-sm">{data.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{data.age} Ma</strong> • {data.type}
                        </p>
                        <p className="text-xs">{data.description}</p>
                        {data.culturalContext && (
                          <p className="text-xs text-amber-600 italic pt-2 border-t border-border">
                            Cultural echo: {data.culturalContext}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="age" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTypeColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.slice(0, 6).map(event => (
            <Card key={event.id} className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(event.type)}
                    <CardTitle className="text-sm leading-tight">{event.label}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {event.ageMa} Ma
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-muted-foreground">{event.description}</p>
                {event.culturalContext && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-amber-600 italic">{event.culturalContext}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Reading Deep Time:</strong> This timeline compresses 180 million years of geological 
            history into visual form. Major events marked include tectonic processes (India's journey from 
            Gondwana to Himalayan collision), volcanic episodes (Deccan Traps), mass extinctions (K-Pg boundary), 
            and climatic shifts (Pleistocene glaciation, Holocene monsoon optimum).
          </p>
          <p>
            <strong>Cultural Resonances:</strong> Where geological events intersect with human memory—such as 
            postglacial sea level rise and "submerged land" myths, or the Ghaggar-Hakra desiccation and Vedic 
            Sarasvati traditions—we note potential cultural echoes of deep environmental change.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
