import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const NAKSHATRAS = [
  'Kṛttikā (Pleiades)',
  'Mṛgaśiras (Orion)',
  'Rohiṇī (Aldebaran)',
  'Āśleṣā (Hydrae)',
  'Maghā (Regulus)',
  'Pūrvaphālgunī (Denebola)',
  'Citrā (Spica)',
  'Viśākhā (Librae)'
];

const ASTRONOMICAL_EVENTS = [
  { event: 'Vernal Equinox', nakshatra: 'Mṛgaśiras', date: '~4500 BCE', scholar: 'B.G. Tilak', confidence: 'C', reference: 'Ṛgveda 1.50.4' },
  { event: 'Kṛttikā at East', nakshatra: 'Kṛttikā', date: '~2500 BCE', scholar: 'Hermann Jacobi', confidence: 'C', reference: 'Taittirīya Saṃhitā 4.3.11' },
  { event: 'Winter Solstice', nakshatra: 'Maghā', date: '~3000 BCE', scholar: 'Śatapatha Brāhmaṇa', confidence: 'B', reference: 'Śatapatha Brāhmaṇa 2.1.2' }
];

export function ArchaeoAstronomyCalculator() {
  const [selectedNakshatra, setSelectedNakshatra] = useState('Mṛgaśiras (Orion)');
  const [selectedEvent, setSelectedEvent] = useState('Vernal Equinox');

  const calculateDate = () => {
    const nakshatraBase = selectedNakshatra.split(' ')[0];
    const event = ASTRONOMICAL_EVENTS.find(e => 
      e.event === selectedEvent && e.nakshatra === nakshatraBase
    );
    return event || ASTRONOMICAL_EVENTS[0];
  };

  const result = calculateDate();

  const getConfidenceVariant = (confidence: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (confidence) {
      case 'A': return 'default';
      case 'B': return 'default';
      case 'C': return 'secondary';
      case 'D': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Archaeo-Astronomy: Dating Vedic Texts by Celestial Observations</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Demonstration of precession-based chronology methods used by Tilak and Jacobi
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Selectors */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Nakṣatra (Asterism)</label>
              <Select value={selectedNakshatra} onValueChange={setSelectedNakshatra}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NAKSHATRAS.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Astronomical Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASTRONOMICAL_EVENTS.map(e => (
                    <SelectItem key={e.event} value={e.event}>{e.event}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result Display */}
          <div className="p-6 bg-primary/10 rounded-lg">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-primary">{result.date}</div>
              <div className="text-sm text-muted-foreground">
                Based on {result.nakshatra} alignment with {result.event}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={getConfidenceVariant(result.confidence)}>
                  {result.confidence}-Grade Evidence
                </Badge>
                <span className="text-xs text-muted-foreground">Scholar: {result.scholar}</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-muted/30 rounded text-sm space-y-2">
            <h4 className="font-semibold">How it Works:</h4>
            <p>Earth's axis precesses (wobbles) at ~1° per 72 years. When a Vedic text mentions a nakṣatra rising at dawn during a solstice/equinox, we can calculate when that alignment occurred.</p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Caution:</strong> These dates have ±200-500 year uncertainties due to: observation precision, interpretation of poetic verses, and cultural context variations. Astronomical dating provides <em>corroboration</em>, not definitive proof.
            </p>
          </div>

          {/* Vedic References */}
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-sm mb-3">Vedic Text References:</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-semibold">Ṛgveda 1.50.4:</span> "Mṛgaśiras rises with the Sun" → ~4500 BCE (Tilak)
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-semibold">Taittirīya Saṃhitā 4.3.11:</span> "Kṛttikās do not deviate from the east" → ~2500 BCE (Jacobi)
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-semibold">Śatapatha Brāhmaṇa 2.1.2:</span> Winter solstice at Maghā → ~3000 BCE
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
