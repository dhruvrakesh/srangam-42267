import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type EvidenceType = 'archaeological' | 'astronomical' | 'textual' | 'indigenous';

interface TimelineEvent {
  date: number; // BCE as negative number
  title: string;
  description: string;
  evidenceType: EvidenceType;
  confidence: 'A' | 'B' | 'C' | 'D';
  track: 'colonial' | 'revised';
  source: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  // Colonial Track
  {
    date: -1200,
    title: 'Max Müller Dating',
    description: 'Arbitrary estimate based on linguistic guesswork and allotted time periods',
    evidenceType: 'textual',
    confidence: 'D',
    track: 'colonial',
    source: 'Max Müller (1859)'
  },
  {
    date: -1500,
    title: 'Aryan Invasion Theory Timeline',
    description: 'Colonial framework placing Indo-Aryan arrival post-Harappan decline',
    evidenceType: 'textual',
    confidence: 'D',
    track: 'colonial',
    source: 'Wheeler (1953)'
  },
  
  // Revised Track - Archaeological
  {
    date: -1900,
    title: 'Sarasvatī River Drying',
    description: 'Geological evidence of Ghaggar-Hakra system desiccation, providing terminus ante quem',
    evidenceType: 'archaeological',
    confidence: 'A',
    track: 'revised',
    source: 'B.B. Lal, Valdiya, ISRO surveys'
  },
  {
    date: -1380,
    title: 'Mitanni Treaty',
    description: 'Vedic deities (Mitra, Varuna, Indra) and Sanskrit horse terms in Mesopotamia',
    evidenceType: 'archaeological',
    confidence: 'A',
    track: 'revised',
    source: 'Kikkuli text, Livius'
  },
  {
    date: -3000,
    title: 'B.B. Lal Synthesis',
    description: '3rd millennium BCE dating based on Harappan-Vedic continuity evidence',
    evidenceType: 'archaeological',
    confidence: 'B',
    track: 'revised',
    source: 'B.B. Lal (2002)'
  },
  
  // Revised Track - Astronomical
  {
    date: -4500,
    title: 'Tilak Astronomical Calculations',
    description: 'Arctic homeland theory based on Vedic astronomical references',
    evidenceType: 'astronomical',
    confidence: 'C',
    track: 'revised',
    source: 'B.G. Tilak (1903)'
  },
  {
    date: -2500,
    title: 'Jacobi Nakṣatra Alignments',
    description: 'Precession-based dating of Vedic star observations',
    evidenceType: 'astronomical',
    confidence: 'C',
    track: 'revised',
    source: 'Hermann Jacobi (1909)'
  },
  
  // Revised Track - Indigenous
  {
    date: -3102,
    title: 'Puranic Kali Yuga',
    description: 'Traditional Puranic chronology marking major Mahābhārata epoch',
    evidenceType: 'indigenous',
    confidence: 'B',
    track: 'revised',
    source: 'Multiple Purāṇas, Aryabhata'
  },
  {
    date: -3400,
    title: 'Talageri Chronology',
    description: 'Internal Ṛgvedic stratification analysis placing oldest maṇḍalas',
    evidenceType: 'textual',
    confidence: 'B',
    track: 'revised',
    source: 'Shrikant Talageri (2000)'
  },
  
  // Extreme dates (speculative)
  {
    date: -6500,
    title: 'Saroj Bala Dating',
    description: 'Astronomical calculations placing Ṛgveda composition',
    evidenceType: 'astronomical',
    confidence: 'D',
    track: 'revised',
    source: 'Saroj Bala (2000)'
  }
];

const EVIDENCE_COLORS: Record<EvidenceType, string> = {
  archaeological: 'bg-green-500',
  astronomical: 'bg-blue-500',
  textual: 'bg-orange-500',
  indigenous: 'bg-purple-500'
};

const CONFIDENCE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  B: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  C: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  D: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
};

export function VedicChronologyTimeline() {
  const [filters, setFilters] = useState<Set<EvidenceType>>(
    new Set(['archaeological', 'astronomical', 'textual', 'indigenous'])
  );

  const toggleFilter = (type: EvidenceType) => {
    const newFilters = new Set(filters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setFilters(newFilters);
  };

  const filteredEvents = TIMELINE_EVENTS.filter(event => 
    filters.has(event.evidenceType)
  );

  const minDate = -7000;
  const maxDate = -1000;
  
  const getPosition = (date: number) => {
    return ((date - minDate) / (maxDate - minDate)) * 100;
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Dual-Track Chronology: Colonial vs. Revised</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Compare traditional colonial dating (1500-1200 BCE) with multi-disciplinary evidence pointing to 3rd-4th millennium BCE or earlier
        </p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {(['archaeological', 'astronomical', 'textual', 'indigenous'] as EvidenceType[]).map(type => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox 
                id={type}
                checked={filters.has(type)}
                onCheckedChange={() => toggleFilter(type)}
              />
              <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                <div className={`w-3 h-3 rounded-full ${EVIDENCE_COLORS[type]}`} />
                <span className="capitalize">{type}</span>
              </Label>
            </div>
          ))}
        </div>

        {/* Timeline Visualization */}
        <div className="relative" style={{ minHeight: '400px' }}>
          {/* Time axis */}
          <div className="absolute top-0 left-0 right-0 h-px bg-border" />
          <div className="absolute bottom-1/2 left-0 right-0 h-px bg-border" />
          
          {/* Date markers */}
          <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mb-4">
            <span>7000 BCE</span>
            <span>5000 BCE</span>
            <span>3000 BCE</span>
            <span>1000 BCE</span>
          </div>

          {/* Sarasvatī Drying Marker (Central) */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-yellow-500 z-10"
            style={{ left: `${getPosition(-1900)}%` }}
          >
            <div className="absolute top-1/2 left-1 transform -translate-y-1/2 bg-background p-2 rounded shadow-lg border border-border whitespace-nowrap">
              <div className="text-xs font-bold">Sarasvatī Drying</div>
              <div className="text-xs text-muted-foreground">~1900 BCE</div>
            </div>
          </div>

          {/* Colonial Track (Top Half) */}
          <div className="relative h-1/2 pt-12">
            <div className="text-sm font-semibold mb-2 text-red-600">Colonial/Traditional Mainstream</div>
            {filteredEvents.filter(e => e.track === 'colonial').map((event, idx) => (
              <div
                key={idx}
                className="absolute top-16"
                style={{ left: `${getPosition(event.date)}%` }}
              >
                <div className={`w-3 h-3 rounded-full ${EVIDENCE_COLORS[event.evidenceType]} mb-1`} />
                <div className="bg-background p-2 rounded shadow border border-border w-48 text-xs">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-muted-foreground mb-1">{Math.abs(event.date)} BCE</div>
                  <Badge className={`text-xs mb-1 ${CONFIDENCE_COLORS[event.confidence]}`}>
                    {event.confidence}-Grade
                  </Badge>
                  <div className="text-muted-foreground">{event.description}</div>
                  <div className="text-xs italic mt-1">{event.source}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Revised Track (Bottom Half) */}
          <div className="relative h-1/2 pt-8">
            <div className="text-sm font-semibold mb-2 text-green-600">Revised/Indigenous Evidence</div>
            {filteredEvents.filter(e => e.track === 'revised').map((event, idx) => (
              <div
                key={idx}
                className="absolute top-8"
                style={{ left: `${getPosition(event.date)}%` }}
              >
                <div className={`w-3 h-3 rounded-full ${EVIDENCE_COLORS[event.evidenceType]} mb-1`} />
                <div className="bg-background p-2 rounded shadow border border-border w-48 text-xs">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-muted-foreground mb-1">{Math.abs(event.date)} BCE</div>
                  <Badge className={`text-xs mb-1 ${CONFIDENCE_COLORS[event.confidence]}`}>
                    {event.confidence}-Grade
                  </Badge>
                  <div className="text-muted-foreground">{event.description}</div>
                  <div className="text-xs italic mt-1">{event.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-muted/30 rounded">
          <h4 className="text-sm font-semibold mb-2">Confidence Grading System</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge className={CONFIDENCE_COLORS.A}>A</Badge>
              <span>Primary material evidence</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={CONFIDENCE_COLORS.B}>B</Badge>
              <span>Multiple convergent sources</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={CONFIDENCE_COLORS.C}>C</Badge>
              <span>Inference requiring interpretation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={CONFIDENCE_COLORS.D}>D</Badge>
              <span>Speculative/oral tradition</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
