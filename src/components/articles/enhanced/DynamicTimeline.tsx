import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, MapPin, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'political' | 'trade' | 'cultural' | 'discovery';
  location?: string;
  significance?: string;
  expandable?: boolean;
  details?: React.ReactNode;
}

interface DynamicTimelineProps {
  events: TimelineEvent[];
  title?: string;
  compact?: boolean;
  filterByType?: boolean;
  className?: string;
}

export const DynamicTimeline = React.memo(({ 
  events, 
  title = "Historical Timeline",
  compact = false,
  filterByType = false,
  className 
}: DynamicTimelineProps) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['political', 'trade', 'cultural', 'discovery']));

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const toggleType = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const typeConfig = {
    political: { 
      color: 'border-burgundy/50 bg-burgundy/30', 
      textColor: 'text-burgundy',
      icon: <Star size={16} />,
      label: 'Political'
    },
    trade: { 
      color: 'border-gold-warm/50 bg-gold-warm/30', 
      textColor: 'text-gold-warm',
      icon: <MapPin size={16} />,
      label: 'Trade'
    },
    cultural: { 
      color: 'border-saffron/50 bg-saffron/30', 
      textColor: 'text-saffron',
      icon: <Users size={16} />,
      label: 'Cultural'
    },
    discovery: { 
      color: 'border-terracotta/50 bg-terracotta/30', 
      textColor: 'text-terracotta',
      icon: <Calendar size={16} />,
      label: 'Discovery'
    }
  };

  const filteredEvents = events.filter(event => selectedTypes.has(event.type));

  return (
    <div className={cn('my-8', className)}>
      <div className="mb-6">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-4">{title}</h3>
        
        {filterByType && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(typeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition-all',
                  selectedTypes.has(type) 
                    ? `${config.color} ${config.textColor} scale-105` 
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                )}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
        
        {filteredEvents.map((event, index) => {
          const config = typeConfig[event.type];
          const isExpanded = expandedEvents.has(event.id);
          
          return (
            <div key={event.id} className="relative flex items-start gap-6 pb-8">
              {/* Timeline dot */}
              <div className={cn(
                'flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300',
                config.color,
                'hover:scale-110 cursor-pointer'
              )}>
                <div className={config.textColor}>
                  {config.icon}
                </div>
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'p-4 rounded-lg border transition-all duration-300',
                  config.color.replace('/30', '/25'),
                  'hover:shadow-md'
                )}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className={cn('text-sm font-medium mb-1', config.textColor)}>
                        {event.date}
                      </div>
                      <h4 className="font-serif text-lg font-semibold text-foreground">
                        {event.title}
                      </h4>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin size={12} />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    {event.expandable && (
                      <button
                        onClick={() => toggleExpanded(event.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    )}
                  </div>
                  
                  <p className="text-foreground leading-relaxed mb-3">
                    {event.description}
                  </p>
                  
                  {event.significance && (
                    <div className="text-sm text-muted-foreground italic border-l-2 border-accent/40 pl-3">
                      {event.significance}
                    </div>
                  )}
                  
                  {event.expandable && isExpanded && event.details && (
                    <div className="mt-4 pt-4 border-t border-border/50 animate-accordion-down">
                      {event.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DynamicTimeline.displayName = 'DynamicTimeline';

// Utility function to create timeline events
export const createTimelineEvent = (
  id: string,
  date: string,
  title: string,
  description: string,
  type: TimelineEvent['type'],
  options?: Partial<Pick<TimelineEvent, 'location' | 'significance' | 'expandable' | 'details'>>
): TimelineEvent => ({
  id,
  date,
  title,
  description,
  type,
  ...options
});