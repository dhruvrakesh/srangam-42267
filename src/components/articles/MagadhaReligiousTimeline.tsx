import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineEvent {
  period: string;
  dynasty: string;
  religion: string;
  rulers: string[];
  keyEvents: string[];
  color: string;
}

const timelineData: TimelineEvent[] = [
  {
    period: "544–413 BCE",
    dynasty: "Haryanka",
    religion: "Buddhist Patronage",
    rulers: ["Bimbisara", "Ajātashatru"],
    keyEvents: [
      "Bimbisara gifts Veluvana grove for Buddhist monastery",
      "Ajātashatru supports Buddhist Saṅgha and Jain monks"
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    period: "413–345 BCE",
    dynasty: "Shishunaga",
    religion: "Buddhist Councils",
    rulers: ["Kālaśoka"],
    keyEvents: [
      "Second Buddhist Council at Vaiśālī",
      "Continued patronage of Śramaṇa traditions"
    ],
    color: "from-blue-600 to-indigo-600"
  },
  {
    period: "345–322 BCE",
    dynasty: "Nanda",
    religion: "Jain Adherence",
    rulers: ["Mahāpadma Nanda", "Dhana Nanda"],
    keyEvents: [
      "Jaina idol moved from Kalinga to Pataliputra (Hathigumpha evidence)",
      "Jain ministers prominent at court (Mudrārākṣasa)"
    ],
    color: "from-orange-500 to-orange-600"
  },
  {
    period: "322–185 BCE",
    dynasty: "Maurya",
    religion: "Religious Pluralism",
    rulers: ["Chandragupta", "Bindusāra", "Ashoka"],
    keyEvents: [
      "Chandragupta's Jain connections (Shravanabelagola tradition)",
      "Bindusāra's Ājīvika affiliation",
      "Ashoka's dhamma promotes tolerance across sects"
    ],
    color: "from-purple-500 via-pink-500 to-orange-500"
  }
];

export const MagadhaReligiousTimeline: React.FC = () => {
  return (
    <Card className="my-8 border-burgundy/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-burgundy">
          <span className="text-2xl">⏳</span>
          Religious Succession in Magadha (544–185 BCE)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineData.map((event, index) => (
            <div key={index} className="relative">
              {/* Timeline connector */}
              {index < timelineData.length - 1 && (
                <div className="absolute left-6 top-24 h-full w-0.5 bg-gradient-to-b from-burgundy/30 to-transparent" />
              )}
              
              <div className="flex gap-4">
                {/* Timeline marker */}
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {index + 1}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="rounded-lg border border-burgundy/20 bg-background/80 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                      <h3 className="text-xl font-serif font-bold text-burgundy">
                        {event.dynasty} Dynasty
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({event.period})
                      </span>
                    </div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${event.color} text-white mb-3`}>
                      {event.religion}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">Key Rulers:</span>
                        <span className="text-muted-foreground ml-2">
                          {event.rulers.join(", ")}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-foreground block mb-1">Notable Events:</span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                          {event.keyEvents.map((evt, i) => (
                            <li key={i}>{evt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-burgundy/20 text-sm text-muted-foreground">
          <p className="italic">
            <strong>Key Pattern:</strong> Magadha's rulers consistently patronized non-Vedic Śramaṇa traditions (Buddhism, Jainism, Ājīvika) for over three centuries, establishing religious pluralism as the regional norm before the Mauryan unification of India.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
