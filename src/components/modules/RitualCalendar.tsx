import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconConch, IconLotus, IconMonsoon } from '@/components/icons';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { Calendar, MapPin, Waves, Star } from 'lucide-react';

interface RitualEvent {
  id: string;
  name: string;
  nameDevanagari?: string;
  location: string;
  coordinates?: [number, number];
  season: string;
  month: string;
  description: string;
  significance: string;
  practices: string[];
  connections: string[];
  type: 'river-ocean' | 'boat-festival' | 'maritime-memory' | 'seasonal-rite';
}

const RITUAL_EVENTS: RitualEvent[] = [
  {
    id: 'boita-bandana',
    name: 'Boita Bandana / Bali Jatra',
    nameDevanagari: 'बोइता बन्दना / बाली यात्रा',
    location: 'Cuttack, Odisha',
    coordinates: [85.882, 20.462],
    season: 'Post-monsoon',
    month: 'Kartik (October-November)',
    description: 'Festival commemorating Odisha\'s ancient maritime trade with Southeast Asia. Devotees float miniature boats (boita) on rivers, recalling when Kalinga sailors sailed to Bali, Java, and Sumatra.',
    significance: 'Living memory of pre-colonial Indian Ocean networks and merchant courage.',
    practices: ['Floating paper boats with oil lamps', 'Folk songs about overseas journeys', 'Offerings to Kartik deity'],
    connections: ['Ancient Kalinga-Java trade routes', 'Buddhist monastery networks', 'Seasonal wind patterns'],
    type: 'maritime-memory'
  },
  {
    id: 'ganga-aarti',
    name: 'Ganga Aarti at Gangasagar',
    nameDevanagari: 'गंगा आरती गंगासागर',
    location: 'Gangasagar, West Bengal',
    coordinates: [88.09, 21.64],
    season: 'Winter',
    month: 'Magh (January-February)',
    description: 'Confluence ritual where River Ganga meets the Bay of Bengal. Pilgrims perform aarti at the sacred meeting point of fresh and salt waters.',
    significance: 'Celebrates the cosmic union of terrestrial and marine waters.',
    practices: ['Dawn river bathing', 'Oil lamp offerings', 'Vedic chanting'],
    connections: ['Varuna-Ganga mythology', 'Monsoon water cycle', 'Maritime pilgrimage routes'],
    type: 'river-ocean'
  },
  {
    id: 'snake-boat-race',
    name: 'Vallam Kali (Snake Boat Race)',
    nameDevanagari: 'वल्लम् काली',
    location: 'Kerala Backwaters',
    coordinates: [76.3, 9.5],
    season: 'Post-monsoon',
    month: 'Chingam-Kanni (August-September)',
    description: 'Traditional boat races in Kerala\'s backwaters during Onam season. Teams row long snake boats (chundan vallam) in rhythmic unison.',
    significance: 'Celebrates monsoon water abundance and community maritime skills.',
    practices: ['Synchronized rowing', 'Traditional boat songs', 'River deity invocations'],
    connections: ['Monsoon flood cycles', 'Ancient naval traditions', 'Coastal social organization'],
    type: 'boat-festival'
  },
  {
    id: 'navratri-coastal',
    name: 'Coastal Navratri (Varuna Jayanti)',
    nameDevanagari: 'वरुण जयन्ती',
    location: 'Gujarat Coastal Regions',
    coordinates: [72.0, 21.0],
    season: 'Post-monsoon',
    month: 'Ashwin (September-October)',
    description: 'Coastal communities honor Varuna during Navratri, acknowledging the ocean deity\'s role in monsoon rains and maritime protection.',
    significance: 'Links Vedic water cosmology with lived coastal experience.',
    practices: ['Ocean-facing prayers', 'Boat decorations', 'Trader community gatherings'],
    connections: ['Varuna hymns (Rig Veda)', 'Merchant guild festivals', 'Seasonal trade departures'],
    type: 'seasonal-rite'
  },
  {
    id: 'kumbh-sangam',
    name: 'Triveni Sangam Rituals',
    nameDevanagari: 'त्रिवेणी संगम',
    location: 'Prayagraj (Allahabad)',
    coordinates: [81.85, 25.43],
    season: 'Winter',
    month: 'Magh (January-February)',
    description: 'Sacred confluence of Ganga, Yamuna, and mystical Saraswati. The concept of sangam (meeting waters) extends to maritime contexts.',
    significance: 'Prototype for all water confluence rituals, including river-ocean meetings.',
    practices: ['Confluence bathing', 'Charity (daan)', 'Spiritual discourse'],
    connections: ['Ocean-river confluences', 'Maritime sangam points', 'Cosmic water unity'],
    type: 'river-ocean'
  }
];

interface RitualCalendarProps {
  onLocationClick?: (lat: number, lon: number, event: RitualEvent) => void;
}

export function RitualCalendar({ onLocationClick }: RitualCalendarProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const seasons = ['all', 'Post-monsoon', 'Winter', 'Pre-monsoon', 'Monsoon'];
  const types = ['all', 'maritime-memory', 'river-ocean', 'boat-festival', 'seasonal-rite'];

  const filteredEvents = RITUAL_EVENTS.filter(event => {
    const seasonMatch = selectedSeason === 'all' || event.season === selectedSeason;
    const typeMatch = selectedType === 'all' || event.type === selectedType;
    return seasonMatch && typeMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maritime-memory': return <IconConch className="text-lotus-pink" size={20} />;
      case 'river-ocean': return <Waves className="text-ocean" size={20} />;
      case 'boat-festival': return <IconMonsoon className="text-peacock-blue" size={20} />;
      case 'seasonal-rite': return <Star className="text-saffron" size={20} />;
      default: return <IconLotus className="text-lotus-pink" size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'maritime-memory': 'Maritime Memory',
      'river-ocean': 'River-Ocean Rite',
      'boat-festival': 'Boat Festival',
      'seasonal-rite': 'Seasonal Rite'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <IconLotus size={32} className="text-lotus-pink" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            <CulturalTermTooltip term="vrata">
              Ritual Calendar
            </CulturalTermTooltip>
          </h2>
          <IconConch size={32} className="text-ocean" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Living maritime memory through seasonal festivals, river-ocean confluences, and 
          community rituals that connect <CulturalTermTooltip term="dharma">sacred waters</CulturalTermTooltip> 
          with ancestral voyages.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex gap-2 items-center">
          <Calendar size={16} />
          <span className="text-sm font-medium">Season:</span>
          {seasons.map(season => (
            <Button
              key={season}
              variant={selectedSeason === season ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeason(season)}
              className="text-xs"
            >
              {season === 'all' ? 'All Seasons' : season}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <Star size={16} />
          <span className="text-sm font-medium">Type:</span>
          {types.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="text-xs"
            >
              {type === 'all' ? 'All Types' : getTypeLabel(type)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(event.type)}
                  <div>
                    <CardTitle className="text-lg font-serif text-foreground">
                      {event.name}
                    </CardTitle>
                    {event.nameDevanagari && (
                      <CardDescription className="text-sm text-saffron font-medium mt-1">
                        {event.nameDevanagari}
                      </CardDescription>
                    )}
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {event.season} • {event.month}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(event.type)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {event.description}
              </p>
              
              <div className="bg-primary/5 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Cultural Significance</h4>
                <p className="text-sm text-muted-foreground italic">
                  {event.significance}
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Key Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {event.practices.map((practice, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Maritime Connections</h4>
                  <div className="flex flex-wrap gap-1">
                    {event.connections.map((connection, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {event.coordinates && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLocationClick?.(event.coordinates![1], event.coordinates![0], event)}
                  className="w-full justify-start text-xs text-muted-foreground hover:text-primary"
                >
                  <MapPin size={14} className="mr-1" />
                  {event.location}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ritual events match the selected filters.</p>
        </div>
      )}
    </div>
  );
}