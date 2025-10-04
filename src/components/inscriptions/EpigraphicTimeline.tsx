import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  date: number; // Year (negative for BCE)
  dateLabel: string;
  location: string;
  scriptType: string;
  confidence: 'A' | 'B' | 'C' | 'D';
  description: string;
  color: string;
}

const events: TimelineEvent[] = [
  {
    id: 'kandahar',
    title: 'Kandahar Bilingual Edict',
    date: -250,
    dateLabel: '250 BCE',
    location: 'Kandahar, Afghanistan',
    scriptType: 'Greek & Aramaic',
    confidence: 'A',
    description: 'Aśokan edict in Greek and Aramaic, establishing administrative multilingualism',
    color: 'bg-purple-600'
  },
  {
    id: 'vo-canh',
    title: 'Võ Cảnh Stele',
    date: 250,
    dateLabel: '2nd-4th c. CE',
    location: 'Nha Trang, Champa',
    scriptType: 'Southern Brāhmī',
    confidence: 'B',
    description: 'Earliest Sanskrit in mainland Southeast Asia (contested date)',
    color: 'bg-blue-600'
  },
  {
    id: 'kutai-yupa',
    title: 'Kutai Yūpa Pillars',
    date: 375,
    dateLabel: 'Late 4th c. CE',
    location: 'East Kalimantan, Borneo',
    scriptType: 'Pallava',
    confidence: 'A',
    description: 'Seven yūpa pillars recording Mūlavarman's aśvamedha sacrifice',
    color: 'bg-green-600'
  },
  {
    id: 'kedukan-bukit',
    title: 'Kedukan Bukit Inscription',
    date: 683,
    dateLabel: '683 CE',
    location: 'Palembang, Sumatra',
    scriptType: 'Pallava (Old Malay)',
    confidence: 'A',
    description: 'Precisely dated Śrīvijaya siddhayātrā record',
    color: 'bg-amber-600'
  }
];

const confidenceBadgeStyles = {
  A: 'bg-green-600 text-white',
  B: 'bg-amber-600 text-white',
  C: 'bg-red-600 text-white',
  D: 'bg-gray-600 text-white'
};

interface EpigraphicTimelineProps {
  className?: string;
}

export const EpigraphicTimeline: React.FC<EpigraphicTimelineProps> = ({ className }) => {
  const [selectedEvent, setSelectedEvent] = useState<string>(events[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scale, setScale] = useState<'linear' | 'logarithmic'>('linear');
  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSelectedEvent(current => {
          const currentIndex = events.findIndex(e => e.id === current);
          const nextIndex = (currentIndex + 1) % events.length;
          return events[nextIndex].id;
        });
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const getEventPosition = (date: number): number => {
    const minDate = -250;
    const maxDate = 700;
    const range = maxDate - minDate;
    
    if (scale === 'linear') {
      return ((date - minDate) / range) * 100;
    } else {
      // Logarithmic scale for better visualization
      const normalizedDate = date - minDate + 1;
      const normalizedMax = maxDate - minDate + 1;
      return (Math.log(normalizedDate) / Math.log(normalizedMax)) * 100;
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);

  const navigateEvent = (direction: 'prev' | 'next') => {
    const currentIndex = events.findIndex(e => e.id === selectedEvent);
    if (direction === 'prev') {
      const prevIndex = currentIndex === 0 ? events.length - 1 : currentIndex - 1;
      setSelectedEvent(events[prevIndex].id);
    } else {
      const nextIndex = (currentIndex + 1) % events.length;
      setSelectedEvent(events[nextIndex].id);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6 border-b border-border">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
          Epigraphic Timeline: 250 BCE – 683 CE
        </h3>
        <p className="text-muted-foreground mb-4">
          Chronological visualization of key inscriptions across the Indian Ocean world
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(scale === 'linear' ? 'logarithmic' : 'linear')}
          >
            Scale: {scale === 'linear' ? 'Linear' : 'Logarithmic'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Auto-play'}
          </Button>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="p-6 bg-muted/10" ref={timelineRef}>
        <div className="relative h-32 mb-6">
          {/* Timeline axis */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-border" />
          
          {/* Century markers */}
          <div className="absolute inset-x-0 top-1/2 flex justify-between text-xs text-muted-foreground">
            <span className="transform -translate-y-8">250 BCE</span>
            <span className="transform -translate-y-8">1 CE</span>
            <span className="transform -translate-y-8">250 CE</span>
            <span className="transform -translate-y-8">500 CE</span>
            <span className="transform -translate-y-8">700 CE</span>
          </div>

          {/* Event markers */}
          {events.map((event) => {
            const position = getEventPosition(event.date);
            const isSelected = event.id === selectedEvent;
            
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={cn(
                  'absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2',
                  'transition-all duration-300',
                  isSelected ? 'scale-150 z-10' : 'scale-100 hover:scale-125'
                )}
                style={{ left: `${position}%` }}
              >
                <div 
                  className={cn(
                    'w-4 h-4 rounded-full border-2 border-background',
                    event.color,
                    isSelected && 'ring-4 ring-primary/30'
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Event details card */}
        {selectedEventData && (
          <Card className="p-6 animate-fade-in">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-serif text-xl font-bold">
                    {selectedEventData.title}
                  </h4>
                  <Badge className={confidenceBadgeStyles[selectedEventData.confidence]}>
                    {selectedEventData.confidence}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {selectedEventData.location} • {selectedEventData.dateLabel}
                </p>
                <p className="text-sm font-medium text-foreground mb-3">
                  Script: {selectedEventData.scriptType}
                </p>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateEvent('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateEvent('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {selectedEventData.description}
            </p>
          </Card>
        )}
      </div>

      <div className="p-6 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <strong>Reading the Timeline:</strong> This visualization shows the chronological spread of epigraphic 
          traditions from Aśokan multilingualism (250 BCE) to the mature Pallava-influenced inscriptions of Śrīvijaya 
          (683 CE). Toggle between linear and logarithmic scales to see temporal clustering patterns.
        </p>
      </div>
    </Card>
  );
};
