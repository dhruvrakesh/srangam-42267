import React from 'react';

interface TimelineEvent {
  period: string;
  date: string;
  event: string;
  significance: string;
  type: 'archaeological' | 'textual' | 'cultural' | 'political';
}

const timelineEvents: TimelineEvent[] = [
  {
    period: "Indus Valley",
    date: "2600-1900 BCE",
    event: "Harappan Civilization at its peak",
    significance: "First urban centers in South Asia with undeciphered script system",
    type: "archaeological"
  },
  {
    period: "Late Harappan",
    date: "1900-1300 BCE", 
    event: "Indus Valley transformation and regional cultures",
    significance: "Continuity and adaptation rather than sudden collapse",
    type: "archaeological"
  },
  {
    period: "Early Vedic",
    date: "1500-1000 BCE",
    event: "Rigveda composition and Indo-Aryan presence",
    significance: "Earliest Sanskrit literature and religious traditions",
    type: "textual"
  },
  {
    period: "Mitanni",
    date: "1400 BCE",
    event: "Indo-Aryan gods in Hittite-Mitanni treaty",
    significance: "Evidence of Vedic culture in ancient Near East",
    type: "cultural"
  },
  {
    period: "Late Vedic",
    date: "1000-600 BCE",
    event: "Kuru-Panchala kingdoms and Painted Grey Ware",
    significance: "First organized states in post-Harappan India",
    type: "political"
  },
  {
    period: "Upanishadic",
    date: "800-400 BCE",
    event: "Philosophical developments and urbanization",
    significance: "Classical Hindu philosophy and second urbanization",
    type: "textual"
  },
  {
    period: "Mauryan",
    date: "321-185 BCE",
    event: "Ashoka's empire and multilingual edicts",
    significance: "Culmination of ancient Indian administrative sophistication",
    type: "political"
  }
];

const typeColors = {
  archaeological: 'bg-laterite/20 text-laterite border-laterite/30',
  textual: 'bg-gold/20 text-gold border-gold/30',
  cultural: 'bg-sand/20 text-sand-dark border-sand/30', 
  political: 'bg-primary/20 text-primary border-primary/30'
};

export function AncientIndiaTimeline() {
  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg font-semibold text-foreground">
        Timeline: From Indus Valley to Ashoka
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{event.date}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${typeColors[event.type]}`}>
                    {event.type}
                  </span>
                </div>
                <h4 className="font-medium text-foreground">{event.event}</h4>
                <p className="text-sm text-muted-foreground">{event.significance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground border-t pt-4">
        This timeline shows the deep continuity of Indian civilization, with Ashoka's multilingual 
        edicts representing the culmination of millennia of cultural and administrative sophistication.
      </div>
    </div>
  );
}