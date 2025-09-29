import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineEvent {
  era: string;
  date: string;
  description: string;
  side: 'left' | 'right';
  category?: string;
  details?: string;
}

interface EnhancedTimelineProps {
  events: TimelineEvent[];
  title?: string;
  className?: string;
}

export const EnhancedTimeline: React.FC<EnhancedTimelineProps> = ({ 
  events, 
  title = "Civilizational Continuum",
  className = "" 
}) => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleExpand = (era: string) => {
    setExpandedEvent(expandedEvent === era ? null : era);
  };

  return (
    <div className={`py-16 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding the periods of overlap and succession across ancient India's major cultural epochs. 
            Click on an era to explore more details.
          </p>
        </div>

        <div className="relative w-full">
          {/* Central timeline line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-accent/30 rounded-full"></div>
          
          <div className="space-y-16">
            {events.map((event, index) => {
              const isExpanded = expandedEvent === event.era;
              const sideClass = event.side === 'left' 
                ? 'md:mr-auto md:pr-16 md:text-right' 
                : 'md:ml-auto md:pl-16 md:text-left';

              return (
                <div key={event.era} className={`relative w-full md:w-1/2 mx-auto ${sideClass}`}>
                  {/* Timeline dot */}
                  <div className="absolute top-6 left-1/2 md:left-auto md:right-auto -translate-x-1/2 md:translate-x-0 
                                  md:top-6 md:-right-2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10
                                  md:data-[side=left]:-left-2 md:data-[side=left]:right-auto"
                       data-side={event.side}>
                  </div>

                  <Card 
                    className="timeline-item cursor-pointer hover:shadow-xl transition-all duration-300 
                               hover:-translate-y-1 border-l-4 border-l-accent"
                    onClick={() => toggleExpand(event.era)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {event.date}
                        </Badge>
                        {event.category && (
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
                        {event.era}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {event.description}
                      </p>

                      {isExpanded && event.details && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-2 border-l-primary animate-fade-in">
                          <div className="text-sm text-muted-foreground">
                            <div dangerouslySetInnerHTML={{ __html: event.details }} />
                          </div>
                        </div>
                      )}

                      <div className="text-right mt-2">
                        <span className="text-xs text-accent font-medium">
                          {isExpanded ? 'Click to collapse' : 'Click to expand'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Default timeline data for the Jambudvipa article
export const jambudvipaTimelineData: TimelineEvent[] = [
  {
    era: "Sindhu-Saraswati Civilization",
    date: "c. 3300–1900 BCE",
    description: "Mature phase of one of the world's earliest urban civilizations, characterized by advanced city planning, metallurgy, and extensive trade networks.",
    side: 'left',
    category: "Urban Foundation",
    details: "The Harappan civilization established the blueprint for South Asian urbanism with standardized weights and measures, sophisticated drainage systems, and evidence of long-distance trade reaching Mesopotamia and Central Asia."
  },
  {
    era: "Ganga-Vindhya Civilization", 
    date: "c. 2000-600 BCE",
    description: "A post-Harappan cultural fusion in the Gangetic plains, marked by the emergence of iron technology, Painted Grey Ware pottery, and the Janapadas.",
    side: 'right',
    category: "Iron Age Transition",
    details: "This period saw the rise of the Sixteen Mahajanapadas, the composition of early Vedic texts, and the development of iron metallurgy that would revolutionize agriculture and warfare across the subcontinent."
  },
  {
    era: "Keezhadi / Vaigai Civilization",
    date: "c. 900 BCE – 250 CE", 
    description: "An urban settlement on the banks of the Vaigai river in Tamil Nadu, showcasing advanced industry, literacy (Tamil-Brahmi script), and trade links with Rome.",
    side: 'left',
    category: "Southern Renaissance",
    details: "Scientific dating confirms this as contemporary to northern urbanization, featuring sophisticated water management, industrial production, and widespread literacy evidenced by over 120 Tamil-Brahmi inscriptions."
  },
  {
    era: "Mahabharata Period",
    date: "Traditionally c. 3100 BCE, academically debated",
    description: "The epic's narrative core reflects a deep geographical and political knowledge of the entire subcontinent, suggesting long-standing cultural integration.",
    side: 'right', 
    category: "Cultural Synthesis",
    details: "The Mahabharata's detailed knowledge of southern kingdoms, trade routes, and geographical features indicates a unified cultural consciousness spanning the entire subcontinent."
  },
  {
    era: "Indian Ocean Trade Expansion",
    date: "c. 300 BCE – 500 CE",
    description: "A period of intense maritime trade connecting Bharatiya ports with Rome, Arabia, and Southeast Asia, fostering unprecedented cultural and economic exchange.",
    side: 'left',
    category: "Global Integration", 
    details: "Archaeological evidence from ports like Muziris, Arikamedu, and Korkai reveals extensive Roman coin hoards, Mediterranean amphorae, and Indian goods found throughout the ancient world."
  }
];