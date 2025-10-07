import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface MethodologyStep {
  id: number;
  title: string;
  description: string;
  sources: string[];
  color: string;
}

const steps: MethodologyStep[] = [
  {
    id: 1,
    title: 'Mantra Analysis',
    description: 'Parse the Saṃhitā text, identifying grammatical structure, word meanings, and phonetic features.',
    sources: ['Pāṇini\'s Aṣṭādhyāyī (Grammar)', 'Yāska\'s Nirukta (Etymology)'],
    color: 'hsl(var(--chart-1))'
  },
  {
    id: 2,
    title: 'Brāhmaṇa Context',
    description: 'Consult the Brāhmaṇa texts to determine the ritual context and ceremonial application (viniyoga).',
    sources: ['Aitareya Brāhmaṇa', 'Śatapatha Brāhmaṇa', 'Taittirīya Brāhmaṇa'],
    color: 'hsl(var(--chart-2))'
  },
  {
    id: 3,
    title: 'Vedāṅga Integration',
    description: 'Apply the six auxiliary sciences (Vedāṅgas) to establish phonetics, meter, ritual timing, and etymology.',
    sources: ['Śikṣā (Phonetics)', 'Chandas (Prosody)', 'Kalpa (Ritual)', 'Jyotiṣa (Astronomy)'],
    color: 'hsl(var(--chart-3))'
  },
  {
    id: 4,
    title: 'Mīmāṃsā Framework',
    description: 'Interpret through Pūrva Mīmāṃsā principles, emphasizing ritual injunctions (vidhi) and the primacy of yajña.',
    sources: ['Jaimini\'s Mīmāṃsā Sūtras', 'Śabara Bhāṣya', 'Advaita Vedānta (for speculative hymns)'],
    color: 'hsl(var(--chart-4))'
  }
];

export function SayanaMethodologyDiagram() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sāyaṇa's Exegetical Methodology</CardTitle>
        <CardDescription>
          The four-step interpretive process for preserving Vedic meaning through traditional sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Process Flow */}
        <div className="relative space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative">
              {/* Step Card */}
              <div className="flex gap-4 items-start">
                {/* Step Number */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: step.color }}
                >
                  {step.id}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <h4 className="font-semibold text-sm mb-2">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">Traditional Sources:</div>
                    <div className="flex flex-wrap gap-1">
                      {step.sources.map((source, sidx) => (
                        <Badge key={sidx} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center my-2">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result Box */}
        <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <h4 className="font-bold text-sm">Result: Vedārtha Prakāśa</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            A comprehensive commentary synthesizing 2,000+ years of traditional interpretation, preserving the <em>ātman</em> (soul/meaning) of the Vedas for future generations. Sāyaṇa's methodology ensured semantic continuity during the medieval crisis, reuniting the perfectly preserved <em>śarīra</em> (body/form) with its living context.
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="font-semibold text-xs mb-1">🕉️ Primacy of Yajña</div>
            <p className="text-xs text-muted-foreground">
              Sāyaṇa consistently interprets mantras through their ritual application in Śrauta and Gṛhya ceremonies.
            </p>
          </div>
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="font-semibold text-xs mb-1">📚 Conservative Synthesis</div>
            <p className="text-xs text-muted-foreground">
              Rather than innovation, Sāyaṇa masterfully synthesized the entire apparatus of traditional Vedic exegesis.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
