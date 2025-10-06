import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sun, Droplets, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SeasonalRite {
  name: string;
  month: string;
  solarEvent?: string;
  ecologicalPivot: string;
  regions: string[];
  ritualElements: string[];
  confidence: 'H' | 'M' | 'L';
  phenologicalCue?: string;
}

const annualCycle: SeasonalRite[] = [
  {
    name: 'Makar Saṅkrānti / Pongal',
    month: 'Mid-January',
    solarEvent: 'Solar transit into Makara (winter solstice aftermath)',
    ecologicalPivot: 'Winter harvest thanksgiving',
    regions: ['Pan-India', 'Tamil Nadu (Pongal)', 'Gujarat (Uttarāyaṇa)', 'Punjab (Lohri)'],
    ritualElements: ['Bhogi (household renewal)', 'Sūrya Pongal (solar)', 'Maatu Pongal (cattle)', 'Kāṇum Pongal (kin visits)'],
    confidence: 'H',
    phenologicalCue: 'Post-harvest; cattle honored; new rice cooked'
  },
  {
    name: 'Sarhul (Sal Blossom)',
    month: 'March-April',
    ecologicalPivot: 'Spring arrival marked by sal tree blossom',
    regions: ['Jharkhand', 'Odisha', 'Bengal', 'Chhattisgarh (Munda, Ho, Santal, Oraon)'],
    ritualElements: ['Pāhān leads offerings in Sarna/Jaher', 'Sal blossom paraded', 'Forest restraint songs', 'Deity/ancestor portions first'],
    confidence: 'H',
    phenologicalCue: 'Sal (Shorea robusta) blossoms as calendar cue'
  },
  {
    name: 'Mesha Saṅkrānti Cluster',
    month: 'Mid-April',
    solarEvent: 'Solar transit into Mesha (spring equinox region)',
    ecologicalPivot: 'New Year / Plough rites / Spring transition',
    regions: ['Kerala (Vishu)', 'Assam (Bohag Bihu)', 'Tamil Nadu (Puthāṇḍu)', 'Bengal (Pohela Boishakh)'],
    ritualElements: ['Auspicious first-sight (kani)', 'Plough/fire rites', 'Seed/leaf symbolism', 'Market/community resets'],
    confidence: 'H',
    phenologicalCue: 'Spring greening; river bathing; cattle washing'
  },
  {
    name: 'Karam (Branch Ceremony)',
    month: 'August-September',
    ecologicalPivot: 'Mid-monsoon; karam tree branch ritual',
    regions: ['Jharkhand', 'Odisha', 'Bengal (Munda-speaking regions)'],
    ritualElements: ['Karam branch installed in village', 'Women\'s night-long singing', 'Morality fables', 'Branch returned to earth'],
    confidence: 'H',
    phenologicalCue: 'Karam (Adina cordifolia) branch as ritual medium'
  },
  {
    name: 'Nuākhāi (First-Fruits)',
    month: 'Late August / Early September',
    ecologicalPivot: 'First cooked rice of new harvest',
    regions: ['Western Odisha', 'Border tracts'],
    ritualElements: ['New rice (nua) offered to deity/ancestor', 'Ancestral plates fed first', 'Only then household feasting', 'Memory economy in eating'],
    confidence: 'H',
    phenologicalCue: 'First ripening of paddy; first-fruits discipline'
  },
  {
    name: 'Sohrai (Cattle-Threshing)',
    month: 'October-November',
    ecologicalPivot: 'Post-harvest threshing; cattle thanksgiving',
    regions: ['Jharkhand', 'Odisha', 'Bengal (Santal, Goda, Ho zones)'],
    ritualElements: ['Cattle washing and horn painting', 'Threshing floor rites', 'Wall paintings (rice-slurry pigments)', 'Vine, fish, peacock motifs'],
    confidence: 'H',
    phenologicalCue: 'Threshing complete; cattle as kin-economy'
  },
  {
    name: 'Wāngalā (Hundred Drums)',
    month: 'October-November',
    ecologicalPivot: 'Post-harvest thanksgiving to Sun',
    regions: ['Meghalaya (Garo Hills)'],
    ritualElements: ['Drumming ensembles (hundred drums)', 'Crescent formation dance', 'Thanksgiving to Misi-Saljong (Sun)', 'Field-to-village transitions'],
    confidence: 'H',
    phenologicalCue: 'Harvest complete; sonic calendar of land and sky'
  }
];

const confidenceColors = {
  H: 'bg-green-600',
  M: 'bg-yellow-600',
  L: 'bg-orange-600'
};

export function HarvestRhythmsTimeline() {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const filteredRites = selectedSeason
    ? annualCycle.filter(r => r.name === selectedSeason)
    : annualCycle;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="ancient-navigation">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="text-primary animate-pulse-gentle" size={24} />
          Annual Harvest Rhythms: Sky-Time and Agro-Phenology
        </CardTitle>
        <CardDescription>
          India's festival calendar as a walkable grammar of solar turnings, monsoon clocks, and first-fruits discipline
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Season Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedSeason === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeason(null)}
          >
            <Sparkles size={16} className="mr-1" />
            Full Year Cycle
          </Button>
          <Button
            variant={selectedSeason?.includes('Saṅkrānti') ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeason(selectedSeason?.includes('Saṅkrānti') ? null : 'Makar Saṅkrānti / Pongal')}
          >
            <Sun size={16} className="mr-1" />
            Solar Turnings
          </Button>
          <Button
            variant={selectedSeason?.includes('First-Fruits') || selectedSeason?.includes('Blossom') ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeason(selectedSeason?.includes('First-Fruits') ? null : 'Nuākhāi (First-Fruits)')}
          >
            <Droplets size={16} className="mr-1" />
            Ecological Pivots
          </Button>
        </div>

        {/* Timeline Display */}
        <div className="space-y-4 mb-6">
          {filteredRites.map((rite, index) => (
            <div
              key={index}
              className="relative pl-8 pb-6 border-l-2 border-primary/30 last:border-0 last:pb-0"
            >
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Calendar size={12} className="text-primary-foreground" />
              </div>

              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">{rite.name}</h4>
                    <div className="text-sm text-muted-foreground">{rite.month}</div>
                  </div>
                  <Badge className={`${confidenceColors[rite.confidence]} text-white border-0 text-xs`}>
                    {rite.confidence}
                  </Badge>
                </div>

                {rite.solarEvent && (
                  <div className="mb-2 p-2 bg-amber-500/10 rounded text-xs text-accent flex items-center gap-2">
                    <Sun size={14} className="text-amber-500" />
                    <span><strong>Solar:</strong> {rite.solarEvent}</span>
                  </div>
                )}

                {rite.phenologicalCue && (
                  <div className="mb-2 p-2 bg-green-500/10 rounded text-xs text-accent flex items-center gap-2">
                    <Droplets size={14} className="text-green-500" />
                    <span><strong>Phenology:</strong> {rite.phenologicalCue}</span>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-foreground">Ecological Pivot:</strong>
                    <p className="text-muted-foreground">{rite.ecologicalPivot}</p>
                  </div>

                  <div>
                    <strong className="text-foreground">Ritual Elements:</strong>
                    <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                      {rite.ritualElements.map((element, i) => (
                        <li key={i}>{element}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <strong className="text-foreground">Regions:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rite.regions.map((region, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Calendar className="text-primary" size={18} />
            Calendrical Fusion
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            India's festival map fuses <strong>solar turnings</strong> (Makar/Mesha Saṅkrānti as civilizational 
            hinges) with <strong>local phenology</strong> (sal blossom, rice ripening, monsoon lull). The two 
            rhythms meet in <strong>sacred places</strong> — tree, grove, stone, tank — where vows, offerings, 
            and songs recur predictably.
          </p>
          <div className="text-xs text-accent">
            This is not a single "Hindu calendar" but a <em>federation of calendars</em>: sidereal solar 
            (saṅkrānti), lunar (purnima/amavasya), agro-phenological (blossom/ripening), and seasonal (monsoon clocks). 
            Harvest festivals show how <strong>cosmos, cattle, kitchen, and kin</strong> braid into a single rite.
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Ethnographic correlation of living rites with astronomical, ecological, and archaeological evidence
        </div>
      </CardContent>
    </Card>
  );
}
