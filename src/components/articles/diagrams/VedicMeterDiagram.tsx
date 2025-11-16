import React from 'react';
import { Card } from '@/components/ui/card';

interface VedicMeter {
  name: string;
  syllables: number;
  padas: number;
  syllablesPerPada: number;
  cosmicSignificance: string;
  resonanceAlign: string;
  color: string;
}

const vedicMeters: VedicMeter[] = [
  {
    name: 'Gāyatrī',
    syllables: 24,
    padas: 3,
    syllablesPerPada: 8,
    cosmicSignificance: 'Three worlds (Earth, Atmosphere, Sky)',
    resonanceAlign: '3 × 8 pattern matches stone decay intervals',
    color: 'hsl(var(--chart-1))'
  },
  {
    name: 'Anuṣṭubh',
    syllables: 32,
    padas: 4,
    syllablesPerPada: 8,
    cosmicSignificance: 'Creation and dissolution of the universe',
    resonanceAlign: '4 × 8 rhythm aligns with kettledrum harmonics',
    color: 'hsl(var(--chart-2))'
  },
  {
    name: 'Triṣṭubh',
    syllables: 44,
    padas: 4,
    syllablesPerPada: 11,
    cosmicSignificance: 'Divine power and cosmic sacrifice',
    resonanceAlign: 'Complex 11-beat pattern mirrors multi-tonal resonance',
    color: 'hsl(var(--chart-3))'
  },
  {
    name: 'Jagatī',
    syllables: 48,
    padas: 4,
    syllablesPerPada: 12,
    cosmicSignificance: 'Totality of existence',
    resonanceAlign: '12-fold division matches harmonic overtones',
    color: 'hsl(var(--chart-4))'
  }
];

export const VedicMeterDiagram: React.FC = () => {
  const [selectedMeter, setSelectedMeter] = React.useState<VedicMeter | null>(vedicMeters[1]); // Default to Anuṣṭubh

  return (
    <Card className="p-6 my-8 border-border bg-card">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Vedic Meters & Syllabic Rhythm</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Visualization of Vedic metrical structures and their alignment with stone resonance decay patterns. The syllable rhythms conceptually mirror the tonal behaviors of ringing rocks.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Syllable pattern visualization */}
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-6 border border-border">
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              {selectedMeter?.name || 'Select a meter'}
            </h4>
            
            {selectedMeter && (
              <div className="space-y-4">
                {/* Syllable blocks */}
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: selectedMeter.syllables }).map((_, i) => {
                    const padaIndex = Math.floor(i / selectedMeter.syllablesPerPada);
                    return (
                      <div
                        key={i}
                        className="h-8 rounded transition-all duration-300 hover:scale-110"
                        style={{
                          backgroundColor: selectedMeter.color,
                          opacity: 0.3 + (padaIndex * 0.15)
                        }}
                        title={`Syllable ${i + 1}, Pāda ${padaIndex + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Pāda divisions */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  {Array.from({ length: selectedMeter.padas }).map((_, i) => (
                    <span key={i}>Pāda {i + 1}</span>
                  ))}
                </div>

                {/* Rhythm visualization */}
                <div className="relative h-24 bg-background/50 rounded border border-border">
                  <svg viewBox="0 0 400 100" className="w-full h-full">
                    {/* Waveform representing syllabic rhythm */}
                    {Array.from({ length: selectedMeter.syllables }).map((_, i) => {
                      const x = (i / selectedMeter.syllables) * 400;
                      const padaIndex = Math.floor(i / selectedMeter.syllablesPerPada);
                      const height = 40 + (padaIndex * 10);
                      
                      return (
                        <rect
                          key={i}
                          x={x}
                          y={50 - height / 2}
                          width={400 / selectedMeter.syllables - 2}
                          height={height}
                          fill={selectedMeter.color}
                          opacity={0.5 + (i % 2) * 0.2}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                    
                    {/* Decay curve overlay */}
                    <path
                      d={`M 0,50 Q ${400/4},20 ${400/2},40 T 400,50`}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      opacity="0.5"
                      strokeDasharray="5,5"
                    />
                  </svg>
                  <p className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                    Resonance decay pattern →
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Syllables</p>
                    <p className="text-2xl font-bold text-foreground">{selectedMeter.syllables}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pādas (Quarters)</p>
                    <p className="text-2xl font-bold text-foreground">{selectedMeter.padas}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meter selection and details */}
        <div className="space-y-4">
          {/* Meter buttons */}
          <div className="grid grid-cols-2 gap-2">
            {vedicMeters.map(meter => (
              <button
                key={meter.name}
                onClick={() => setSelectedMeter(meter)}
                className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                  selectedMeter?.name === meter.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: meter.color }}
                  />
                  <p className="font-semibold text-sm text-foreground">{meter.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {meter.syllables} syllables ({meter.padas} × {meter.syllablesPerPada})
                </p>
              </button>
            ))}
          </div>

          {/* Selected meter details */}
          {selectedMeter && (
            <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Cosmic Significance</p>
                <p className="text-sm text-foreground">{selectedMeter.cosmicSignificance}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2">Resonance Alignment</p>
                <p className="text-sm text-foreground">{selectedMeter.resonanceAlign}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Ṛgveda Usage</p>
                <p className="text-sm text-foreground">
                  {selectedMeter.name === 'Anuṣṭubh' && '~40% of Ṛgveda hymns (approx. 432,000 syllables total)'}
                  {selectedMeter.name === 'Gāyatrī' && '~25% of Ṛgveda hymns (sacred triad meter)'}
                  {selectedMeter.name === 'Triṣṭubh' && '~25% of Ṛgveda hymns (royal and divine)'}
                  {selectedMeter.name === 'Jagatī' && '~10% of Ṛgveda hymns (cosmic totality)'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explanatory note */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs text-foreground/70">
          <strong>Note:</strong> The syllable intervals in Vedic meters conceptually align with the natural decay time of ringing boulders. 
          For instance, the 8-beat pattern of Anuṣṭubh mirrors the harmonic resonance cycles observed in dolerite outcrops at Kupgal.
        </p>
      </div>
    </Card>
  );
};
