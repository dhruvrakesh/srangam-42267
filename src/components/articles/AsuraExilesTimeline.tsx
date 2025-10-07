import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimelineEvent {
  date: string;
  bce: number;
  title: string;
  description: string;
  category: 'vedic' | 'zoroastrian' | 'mitanni' | 'proto';
  significance: string;
}

const timelineData: TimelineEvent[] = [
  {
    date: 'c. 3300 BCE',
    bce: 3300,
    title: 'Indus-Saraswati Civilization Peak',
    description: 'Proto-Indo-Aryan language and culture develop within flourishing urban civilization',
    category: 'proto',
    significance: 'Foundation of Indo-Iranian homeland in northwestern India'
  },
  {
    date: 'c. 2500 BCE',
    bce: 2500,
    title: 'Early Rigvedic Hymns',
    description: 'Composition of earliest Rigvedic hymns celebrating mighty Saraswati River',
    category: 'vedic',
    significance: 'Textual evidence places Vedic people in India during Harappan era'
  },
  {
    date: 'c. 2000 BCE',
    bce: 2000,
    title: 'Saraswati Desiccation Begins',
    description: 'Geological evidence shows Ghaggar-Hakra river system begins drying up',
    category: 'proto',
    significance: 'Environmental pressure creates conditions for population movements'
  },
  {
    date: 'c. 1900 BCE',
    bce: 1900,
    title: 'Harappan Decline',
    description: 'Major urban centers decline due to climate change and river loss',
    category: 'proto',
    significance: 'Shift from urban to rural settlements; cultural continuity maintained'
  },
  {
    date: 'c. 1800-1600 BCE',
    bce: 1700,
    title: 'Vedic-Zoroastrian Schism',
    description: 'Zarathustra initiates religious reformation; Deva-Asura inversion occurs',
    category: 'zoroastrian',
    significance: 'Theological civil war fractures Indo-Iranian world'
  },
  {
    date: 'c. 1600 BCE',
    bce: 1600,
    title: 'Mitanni Kingdom Emerges',
    description: 'Indo-Aryan warrior elite establishes rule over Hurrian population in northern Mesopotamia',
    category: 'mitanni',
    significance: 'Westernmost extent of Indo-Aryan migration from India'
  },
  {
    date: 'c. 1500 BCE',
    bce: 1500,
    title: 'Rigveda Compilation',
    description: 'Core of Rigveda compiled in Sapta Sindhu by victorious Deva-worshipping faction',
    category: 'vedic',
    significance: 'Rigveda reflects post-schism theology with Indra as supreme deity'
  },
  {
    date: 'c. 1400 BCE',
    bce: 1400,
    title: 'Suppiluliuma-Shattiwaza Treaty',
    description: 'Mitanni-Hittite treaty invokes Vedic gods: Mitra, Varuna, Indra, Nasatya',
    category: 'mitanni',
    significance: 'Direct epigraphic evidence of pre-schism Vedic religion in Mesopotamia'
  },
  {
    date: 'c. 1350 BCE',
    bce: 1350,
    title: 'Kikkuli Horse Manual',
    description: 'Horse training text uses Sanskrit numerals and technical terms with Prakritic features',
    category: 'mitanni',
    significance: 'Linguistic evidence shows Mitanni elite spoke archaic Indo-Aryan dialect'
  },
  {
    date: 'c. 1200 BCE',
    bce: 1200,
    title: 'Mitanni Kingdom Collapses',
    description: 'Mitanni falls to Hittite and Assyrian expansion; Indo-Aryan elite absorbed',
    category: 'mitanni',
    significance: 'End of westernmost Indo-Aryan political entity'
  },
  {
    date: 'c. 1000 BCE',
    bce: 1000,
    title: 'Zoroastrian Reforms Solidify',
    description: 'Gathas composed; Ahura Mazda worship becomes dominant among Iranian peoples',
    category: 'zoroastrian',
    significance: 'Final crystallization of Iranian religious identity'
  },
  {
    date: 'c. 800-500 BCE',
    bce: 650,
    title: 'Baudhayana Shrautasutra',
    description: 'Late Vedic text preserves memory of westward migration to Gandhara, Persia, and Aratta',
    category: 'vedic',
    significance: 'Direct textual evidence from Vedic tradition for Out of India migration'
  },
  {
    date: 'c. 600 BCE',
    bce: 600,
    title: 'Achaemenid Empire Rises',
    description: 'Cyrus the Great establishes Persian Empire with Zoroastrianism as court religion',
    category: 'zoroastrian',
    significance: 'Iranian branch establishes major imperial power'
  },
  {
    date: 'c. 500 BCE',
    bce: 500,
    title: 'Herodotus on Persians',
    description: 'Greek historian records Persians as former "Arya" people from Media',
    category: 'zoroastrian',
    significance: 'External Greek confirmation of Iranian self-identification as Arya'
  }
];

const categoryConfig = {
  proto: { label: 'Proto-Indo-Iranian', color: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-300' },
  vedic: { label: 'Vedic', color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-300' },
  zoroastrian: { label: 'Zoroastrian', color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-300' },
  mitanni: { label: 'Mitanni', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' }
};

export const AsuraExilesTimeline: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Calculate positions on timeline (3300 BCE to 500 BCE = 2800 years)
  const getPositionPercentage = (bce: number) => {
    const totalSpan = 3300 - 500; // 2800 years
    const position = 3300 - bce;
    return (position / totalSpan) * 100;
  };

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Timeline: The Asura Exiles and Indo-Iranian Divergence</CardTitle>
        <CardDescription>
          From the Indus-Saraswati Civilization to the Achaemenid Empire (3300-500 BCE)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-muted/50 rounded-lg">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm font-medium">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Desktop Timeline View */}
        <div className="hidden md:block relative">
          {/* Timeline Bar */}
          <div className="relative h-2 bg-border rounded-full mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 via-orange-500 via-red-500 to-blue-500 rounded-full opacity-30" />
          </div>

          {/* Events */}
          <div className="relative" style={{ minHeight: '400px' }}>
            {timelineData.map((event, index) => {
              const position = getPositionPercentage(event.bce);
              const config = categoryConfig[event.category];
              const isTop = index % 2 === 0;

              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute cursor-pointer group"
                        style={{
                          left: `${position}%`,
                          top: isTop ? '-40px' : '40px',
                          transform: 'translateX(-50%)'
                        }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {/* Connecting Line */}
                        <div
                          className={`absolute left-1/2 ${isTop ? 'top-full' : 'bottom-full'} w-0.5 ${config.color} opacity-50`}
                          style={{ height: '32px', transform: 'translateX(-50%)' }}
                        />
                        
                        {/* Event Marker */}
                        <div
                          className={`w-4 h-4 rounded-full ${config.color} border-4 border-background shadow-lg group-hover:scale-125 transition-transform`}
                        />
                        
                        {/* Date Label */}
                        <div className={`absolute ${isTop ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 whitespace-nowrap`}>
                          <Badge variant="outline" className="text-xs">
                            {event.date}
                          </Badge>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side={isTop ? 'top' : 'bottom'} className="max-w-sm">
                      <p className="font-semibold mb-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Date Markers */}
          <div className="flex justify-between mt-16 text-xs text-muted-foreground font-medium">
            <span>3300 BCE</span>
            <span>2500 BCE</span>
            <span>1500 BCE</span>
            <span>1000 BCE</span>
            <span>500 BCE</span>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="md:hidden space-y-4">
          {timelineData.map((event, index) => {
            const config = categoryConfig[event.category];
            return (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`} />
                <CardHeader className="pl-6">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{event.date}</Badge>
                    <Badge className={config.textColor}>{config.label}</Badge>
                  </div>
                  <CardTitle className="text-base">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="pl-6 space-y-2 text-sm">
                  <p className="text-muted-foreground">{event.description}</p>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs italic">
                      <strong>Significance:</strong> {event.significance}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Event Detail (Desktop) */}
        {selectedEvent && (
          <Card className="mt-8 border-2 border-primary hidden md:block">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{selectedEvent.date}</Badge>
                  <CardTitle>{selectedEvent.title}</CardTitle>
                </div>
                <Badge className={categoryConfig[selectedEvent.category].textColor}>
                  {categoryConfig[selectedEvent.category].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{selectedEvent.description}</p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Historical Significance:</strong> {selectedEvent.significance}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explanatory Note */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Reading the Timeline:</p>
          <p className="mb-3">
            This timeline traces the divergence of the Indo-Iranian peoples from their shared homeland in 
            ancient India through three parallel trajectories: the Vedic tradition that remained in the 
            Sapta Sindhu, the Zoroastrian reformers who migrated northwest to the Iranian Plateau, and 
            the Mitanni emigres who traveled west to Mesopotamia.
          </p>
          <p>
            The schism period (c. 1800-1600 BCE) marks the critical rupture that sent these populations 
            on their divergent historical paths, each preserving different aspects of the Proto-Indo-Iranian 
            cultural and religious heritage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
