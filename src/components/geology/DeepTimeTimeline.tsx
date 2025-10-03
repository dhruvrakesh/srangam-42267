import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Zap, Play, Pause } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface TimelineEvent {
  id: string;
  year: number;
  ageMa: number;
  label: string;
  period: string;
  type: 'tectonic' | 'volcanic' | 'extinction' | 'biological' | 'climatic' | 'geological';
  description: string;
  indianRecord: string;
  culturalCorrelation: string;
  confidence: 'A' | 'B' | 'C' | 'D';
  references: string[];
}

interface TimelineData {
  events: TimelineEvent[];
  scalePresets: Array<{
    id: string;
    label: string;
    startMa: number;
    endMa: number;
  }>;
}

export function DeepTimeTimeline() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [scale, setScale] = useState<'linear' | 'logarithmic'>('linear');
  const [preset, setPreset] = useState<string>('full');
  const [showCultural, setShowCultural] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/geology/deep_time_events_extended.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <Card className="my-8">
        <CardContent className="p-12 text-center text-muted-foreground">
          Loading deep time timeline...
        </CardContent>
      </Card>
    );
  }

  const currentPreset = data.scalePresets.find(p => p.id === preset) || data.scalePresets[0];
  const filteredEvents = data.events.filter(
    e => e.ageMa >= currentPreset.endMa && e.ageMa <= currentPreset.startMa
  );

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'tectonic': 'hsl(var(--chart-1))',
      'volcanic': 'hsl(var(--chart-2))',
      'extinction': 'hsl(var(--destructive))',
      'biological': 'hsl(var(--chart-3))',
      'climatic': 'hsl(var(--chart-4))',
      'geological': 'hsl(var(--chart-5))'
    };
    return colors[type as keyof typeof colors] || 'hsl(var(--muted))';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'tectonic': '🌍',
      'volcanic': '🌋',
      'extinction': '☄️',
      'biological': '🦴',
      'climatic': '🌤️',
      'geological': '🪨'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  const calculatePosition = (ageMa: number) => {
    if (scale === 'linear') {
      const range = currentPreset.startMa - currentPreset.endMa;
      return ((currentPreset.startMa - ageMa) / range) * 100;
    } else {
      // Logarithmic scale for better Quaternary detail
      const logStart = Math.log10(currentPreset.startMa + 1);
      const logEnd = Math.log10(currentPreset.endMa + 1);
      const logAge = Math.log10(ageMa + 1);
      return ((logStart - logAge) / (logStart - logEnd)) * 100;
    }
  };

  const startAnimation = () => {
    setIsAnimating(true);
    // Scroll through timeline automatically
    if (scrollRef.current) {
      const duration = 10000; // 10 seconds
      const start = scrollRef.current.scrollLeft;
      const end = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = start + (end - start) * progress;
        }

        if (progress < 1 && isAnimating) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  };

  return (
    <>
      <Card className="my-8 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Deep Time: India's Geological Journey
              </CardTitle>
              <CardDescription className="mt-2">
                540 million years of Earth history. Click events to explore geological and cultural connections.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={isAnimating ? () => setIsAnimating(false) : startAnimation}
            >
              {isAnimating ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Tour
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Time Travel
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Tabs value={preset} onValueChange={setPreset}>
                <TabsList>
                  {data.scalePresets.map((p) => (
                    <TabsTrigger key={p.id} value={p.id} className="text-xs">
                      {p.label.split('(')[0].trim()}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={scale === 'linear' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScale('linear')}
              >
                Linear
              </Button>
              <Button
                variant={scale === 'logarithmic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScale('logarithmic')}
              >
                Log Scale
              </Button>
              <Button
                variant={showCultural ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCultural(!showCultural)}
              >
                + Cultural
              </Button>
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="relative bg-muted/30 rounded-lg p-6 overflow-hidden">
            <ScrollArea className="w-full" ref={scrollRef}>
              <div className="relative min-w-[1200px] h-[400px]">
                {/* Time axis */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-border" />
                
                {/* Age markers */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                  <span>{currentPreset.startMa} Ma</span>
                  <span>{Math.round((currentPreset.startMa + currentPreset.endMa) / 2)} Ma</span>
                  <span>{currentPreset.endMa === 0 ? 'Present' : `${currentPreset.endMa} Ma`}</span>
                </div>

                {/* Events */}
                {filteredEvents.map((event) => {
                  const position = calculatePosition(event.ageMa);
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="absolute group cursor-pointer"
                      style={{
                        left: `${position}%`,
                        bottom: '40px',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {/* Event marker */}
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-background shadow-lg transition-all group-hover:scale-150 group-hover:z-10"
                        style={{ backgroundColor: getTypeColor(event.type) }}
                      />
                      
                      {/* Vertical line */}
                      <div 
                        className="absolute top-3 left-1/2 w-px h-8 -translate-x-1/2"
                        style={{ backgroundColor: getTypeColor(event.type), opacity: 0.3 }}
                      />
                      
                      {/* Label */}
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-popover text-popover-foreground px-2 py-1 rounded text-xs text-center shadow-lg border">
                          <div className="font-semibold">{getTypeIcon(event.type)} {event.label}</div>
                          <div className="text-muted-foreground text-[10px]">{event.ageMa} Ma</div>
                        </div>
                      </div>

                      {/* Cultural overlay */}
                      {showCultural && event.culturalCorrelation && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 text-[10px] text-center text-primary/70 italic">
                          {event.culturalCorrelation.split(';')[0]}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Background SVG */}
                <img 
                  src="/images/geology/stone_purana_fig2_timeline.svg"
                  alt="Deep time geological timeline"
                  className="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none"
                />
              </div>
            </ScrollArea>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4 border-t">
            {(['tectonic', 'volcanic', 'extinction', 'biological', 'climatic', 'geological'] as const).map((type) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: getTypeColor(type) }}
                />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedEvent && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-4">
                  <SheetTitle className="text-xl">
                    {getTypeIcon(selectedEvent.type)} {selectedEvent.label}
                  </SheetTitle>
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: getTypeColor(selectedEvent.type), color: 'white' }}
                  >
                    {selectedEvent.type}
                  </Badge>
                </div>
                <SheetDescription>
                  {selectedEvent.ageMa} Ma ({selectedEvent.ageMa * 1000000} years ago) • {selectedEvent.period}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Event Description
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Indian Geological Record</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.indianRecord}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Cultural Correlation</h4>
                  <p className="text-sm text-muted-foreground italic">{selectedEvent.culturalCorrelation}</p>
                  <Badge variant="outline" className="mt-2">
                    Confidence: {selectedEvent.confidence}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">References</h4>
                  <ul className="space-y-1">
                    {selectedEvent.references.map((ref, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">{ref}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
