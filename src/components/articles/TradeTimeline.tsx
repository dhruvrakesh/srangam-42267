import React from 'react';

interface TimelineEvent {
  year: string;
  event: string;
  significance: string;
  type: 'political' | 'trade' | 'discovery' | 'economic';
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "c. 1300 BCE",
    event: "Ramesses II mummified with peppercorns",
    significance: "Earliest evidence of Indian pepper reaching Egypt",
    type: "discovery"
  },
  {
    year: "c. 100 BCE",
    event: "Hippalus discovers monsoon patterns", 
    significance: "Direct sailing across Arabian Sea revolutionizes trade",
    type: "discovery"
  },
  {
    year: "27 BCE - 14 CE",
    event: "Reign of Augustus",
    significance: "Peak period begins - Roman coins flood into India",
    type: "political"
  },
  {
    year: "c. 20 BCE",
    event: "Indian embassy to Augustus",
    significance: "Diplomatic contact between India and Rome",
    type: "political"
  },
  {
    year: "1st Century CE",
    event: "Periplus Maris Erythraei written",
    significance: "Detailed account of Indo-Roman trade routes",
    type: "trade"
  },
  {
    year: "54-68 CE",
    event: "Reign of Nero",
    significance: "Trade reaches zenith - most Roman coins found in India from this period",
    type: "economic"
  },
  {
    year: "408 CE",
    event: "Alaric demands pepper in ransom",
    significance: "3,000 pounds of pepper demanded for sparing Rome",
    type: "economic"
  },
  {
    year: "5th Century CE",
    event: "Western Roman Empire falls",
    significance: "Trade declines but continues with Byzantine Empire",
    type: "political"
  }
];

const typeColors = {
  political: 'bg-burgundy/20 text-burgundy border-burgundy/30',
  trade: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  discovery: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  economic: 'bg-amber-500/20 text-amber-600 border-amber-500/30'
};

export function TradeTimeline() {
  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg font-semibold text-foreground">
        Timeline: Indo-Roman Pepper Trade
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-foreground">{event.year}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${typeColors[event.type]}`}>
                    {event.type}
                  </span>
                </div>
                <h4 className="font-medium text-foreground mb-1">{event.event}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.significance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}