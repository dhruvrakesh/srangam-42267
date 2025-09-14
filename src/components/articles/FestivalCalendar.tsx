import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Ship, Star, Moon } from 'lucide-react';

const festivals = [
  {
    name: 'Bali Jātra (Odisha)',
    period: 'Kartika Purnima (Oct-Nov)',
    monsoon: 'Northeast Monsoon Onset',
    description: 'Voyage to Bali festival - celebrates ancient maritime expeditions',
    ritual: 'Boita Bandana (boat worship) with floating lamps',
    significance: 'Marks departure time for Southeast Asia voyages',
    icon: Ship,
    color: 'oceanTeal'
  },
  {
    name: 'Kālakrīyā (Kerala)',
    period: 'Makara Sankranti (Jan)',
    monsoon: 'Peak Northeast Season',
    description: 'Coastal festival aligned with favorable return winds',
    ritual: 'Ceremonial boat races and sea blessings',
    significance: 'Return voyage season from western ports',
    icon: Calendar,
    color: 'turmeric'
  },
  {
    name: 'Maasi Magam (Tamil Nadu)',
    period: 'Magh Purnima (Feb-Mar)',
    monsoon: 'Late Northeast/Pre-Southwest',
    description: 'Sacred bathing and maritime prayers',
    ritual: 'Ocean worship at Kumbakonam and coastal temples',
    significance: 'Preparation for summer monsoon departures',
    icon: Star,
    color: 'lotus-pink'
  },
  {
    name: 'Nyepi (Bali)',
    period: 'Caka New Year (Mar-Apr)',
    monsoon: 'Pre-Southwest Transition',
    description: 'Day of Silence with Indian lunar calendar links',
    ritual: 'Meditation and spiritual renewal',
    significance: 'Ancient calendar brought by Indian traders',
    icon: Moon,
    color: 'saffron'
  }
];

export function FestivalCalendar() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="ancient-navigation">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="text-primary animate-pulse-gentle" size={24} />
          Living Maritime Memory: Monsoon Festivals
        </CardTitle>
        <CardDescription>
          How coastal communities still celebrate the ancient sailing seasons through ritual and festival
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
          {festivals.map((festival, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 bg-${festival.color}/5 border-${festival.color}`}
            >
              <div className="flex items-start gap-3">
                <festival.icon className={`text-${festival.color} mt-1`} size={20} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{festival.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {festival.period}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">
                        <strong>Description:</strong> {festival.description}
                      </div>
                      <div className="text-muted-foreground">
                        <strong>Ritual:</strong> {festival.ritual}
                      </div>
                    </div>
                    <div>
                      <div className={`text-${festival.color} mb-1`}>
                        <strong>Monsoon Timing:</strong> {festival.monsoon}
                      </div>
                      <div className="text-accent text-xs">
                        <strong>Maritime Significance:</strong> {festival.significance}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Ship className="text-primary" size={18} />
            The Living Calendar
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            These festivals preserve two millennia of maritime knowledge. When the Periplus noted merchants 
            waiting months in Muziris for return winds, it described the same seasonal patterns that 
            coastal communities still celebrate today through ritual boat floating, ocean worship, and lunar observations.
          </p>
          <div className="text-xs text-accent">
            Modern Odias floating boats on Kartika Purnima directly echo ancient Kalinga sailors departing 
            for Bali and Java under the northeast monsoon - keeping alive the memory of India's great age of maritime exploration.
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Ethnographic studies of coastal festival traditions and their correlation with historical monsoon navigation patterns
        </div>
      </CardContent>
    </Card>
  );
}