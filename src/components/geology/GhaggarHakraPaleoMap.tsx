import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconBasalt } from '@/components/icons/IconBasalt';
import { Droplets, Calendar, Info } from 'lucide-react';

interface TimelineEvent {
  year: number;
  label: string;
  description: string;
  riverFlow: string;
  climate: string;
  culturalContext: string;
}

interface PaleochannelData {
  timeline: TimelineEvent[];
  rivers: Array<{
    id: string;
    name: string;
    modernFlow: string;
    historicalPath: string;
  }>;
}

export const GhaggarHakraPaleoMap: React.FC = () => {
  const [data, setData] = useState<PaleochannelData | null>(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'schematic' | 'context'>('schematic');

  useEffect(() => {
    fetch('/data/geology/paleochannel_timeline.json')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Error loading paleochannel data:', err));
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

  const currentEvent = data.timeline[timelineIndex];

  const getFlowColor = (flow: string) => {
    switch (flow.toLowerCase()) {
      case 'high': return 'text-blue-600';
      case 'moderate-high': return 'text-blue-500';
      case 'low': return 'text-amber-600';
      case 'ephemeral': return 'text-orange-600';
      case 'seasonal': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="my-8 border-blue-500/20 bg-gradient-to-br from-blue-950/10 to-cyan-950/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBasalt className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Figure 4: Ghaggar-Hakra Paleochannel Evolution</CardTitle>
        </div>
        <CardDescription>
          Reconstruction of the Vedic Sarasvati river system from monsoon optimum to present
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Mode Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="schematic">Schematic Map</TabsTrigger>
            <TabsTrigger value="context">Geological Context</TabsTrigger>
          </TabsList>

          <TabsContent value="schematic" className="space-y-4 mt-4">
            {/* SVG Map */}
            <div className="bg-muted/50 rounded-lg p-4 overflow-auto">
              <img 
                src="/images/geology/stone_purana_fig4_ghaggar.svg" 
                alt="Ghaggar-Hakra paleochannel schematic showing river system evolution"
                className="w-full h-auto max-h-[500px] object-contain"
                style={{ 
                  opacity: currentEvent.riverFlow === 'None (monsoon-fed streams only)' ? 0.4 : 1,
                  transition: 'opacity 0.5s ease'
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="context" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              {data.rivers.map(river => (
                <Card key={river.id} className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{river.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold">Modern flow: </span>
                      <Badge variant="outline" className="text-xs">{river.modernFlow}</Badge>
                    </div>
                    <p className="text-muted-foreground">{river.historicalPath}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Interactive Timeline Slider */}
        <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Timeline</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentEvent.label}
            </Badge>
          </div>

          <Slider
            value={[timelineIndex]}
            onValueChange={(value) => setTimelineIndex(value[0])}
            max={data.timeline.length - 1}
            step={1}
            className="w-full"
          />

          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground">
            {data.timeline.map((event, idx) => (
              <button
                key={idx}
                onClick={() => setTimelineIndex(idx)}
                className={`text-center transition-colors ${
                  idx === timelineIndex ? 'text-primary font-semibold' : 'hover:text-foreground'
                }`}
              >
                {event.label.replace(' BP', '').replace('Present', 'Now')}
              </button>
            ))}
          </div>
        </div>

        {/* Current Event Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <Droplets className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getFlowColor(currentEvent.riverFlow)}`} />
              <div className="space-y-1">
                <p className="text-sm font-semibold">River Flow</p>
                <p className="text-xs text-muted-foreground">{currentEvent.riverFlow}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-semibold mb-1">Climate</p>
              <p className="text-xs text-muted-foreground">{currentEvent.climate}</p>
            </div>

            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              {currentEvent.description}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-stone-500/10 border border-amber-500/20 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Cultural Context</p>
                <p className="text-xs text-muted-foreground">{currentEvent.culturalContext}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              {timelineIndex < 3 ? (
                <p>During this period, the Ghaggar-Hakra system sustained the urban centers of the Harappan civilization through reliable monsoon-fed flows.</p>
              ) : timelineIndex < 5 ? (
                <p>River capture by the Yamuna and Sutlej, combined with monsoon weakening, transformed the system into an ephemeral channel—remembered in Vedic texts as the divine Sarasvati.</p>
              ) : (
                <p>Modern geological surveys using satellite imagery and ground-penetrating radar have traced the ancient paleochannel beneath the Thar Desert, vindicating textual references.</p>
              )}
            </div>
          </div>
        </div>

        {/* Scientific Notes */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Geological Evidence:</strong> Satellite imagery (LANDSAT, IRS), ground-penetrating radar surveys, 
            and sediment cores confirm a major perennial river system existed 7000-4000 BP, subsequently captured 
            by the Yamuna (eastward) and Sutlej (westward) through tectonic uplift and stream piracy events.
          </p>
          <p>
            <strong>Cultural Memory:</strong> The Rigveda's laudatory hymns to Sarasvati as "best of rivers" and 
            Mahabharata's references to its "invisible" flow at Prayag preserve hydrological memory of this 
            paleochannel system—a rare instance where textual tradition aligns with geological reconstruction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
