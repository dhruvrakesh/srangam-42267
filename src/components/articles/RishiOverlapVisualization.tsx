import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OverlapCase {
  name: string;
  lineages: string[];
  description: string;
  evidence: string;
}

const overlapCases: OverlapCase[] = [
  {
    name: 'Gṛtsamada Śaunaka',
    lineages: ['Bhṛgu', 'Āṅgiras'],
    description: 'Born Āṅgiras (son of Śunahotra), adopted by Bhṛgu (Śunaka)',
    evidence: 'Maṇḍala II attributed to him as Bhārgava, yet birth lineage Āṅgirasa — demonstrates adoption/spiritual lineage transfer'
  },
  {
    name: 'Cyavana',
    lineages: ['Bhṛgu', 'Āṅgiras'],
    description: 'Called both Bhārgava AND Āṅgirasa in different texts',
    evidence: 'Śatapatha Brāhmaṇa 4.1.5.1 notes dual attribution — possible second marriage or ritual adoption'
  },
  {
    name: 'Atharvaveda Synthesis',
    lineages: ['Bhṛgu', 'Āṅgiras', 'Kāśyapa'],
    description: '"Atharvāṅgirasāḥ" = compound of all three traditions',
    evidence: 'AV tradition jointly attributed to Atharvan (Bhṛgu-allied) + Aṅgiras + Kāśyapa elements. RV 10.14 attributes to both Bhṛgu and Kāśyapa'
  },
  {
    name: 'Agni as Āṅgirasa',
    lineages: ['Āṅgiras'],
    description: 'Fire deity identified with Āṅgiras lineage',
    evidence: 'RV 1.1.6 calls Agni "Angiraḥ" — deity-sage blurring, reflecting priestly clan\'s intimate fire connection'
  },
  {
    name: 'Indra as Angirastama',
    lineages: ['Āṅgiras'],
    description: 'Indra called "most Aṅgiras among Aṅgirases"',
    evidence: 'RV 1.100.4 — war-god fully identified with priestly clan, demonstrating mythic merging'
  }
];

const getLineageColor = (lineage: string) => {
  switch (lineage) {
    case 'Bhṛgu': return 'bg-red-900/30 border-red-700/50';
    case 'Āṅgiras': return 'bg-orange-900/30 border-orange-700/50';
    case 'Kāśyapa': return 'bg-amber-900/30 border-amber-700/50';
    default: return 'bg-muted border-border';
  }
};

export function RishiOverlapVisualization() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Inter-Lineage Connections: The Interwoven Tapestry</CardTitle>
        <CardDescription>
          Cases where ṛṣis, deities, or traditions span multiple lineages — evidence of spiritual adoption, dual attribution, and collaborative tradition
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual Venn Diagram */}
        <div className="mb-8 p-6 bg-muted/30 rounded-lg">
          <div className="text-sm font-semibold mb-4 text-center">Lineage Overlap Patterns</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full mx-auto ${getLineageColor('Bhṛgu')} border-2 flex items-center justify-center`}>
                <div className="text-sm font-semibold">Bhṛgu</div>
              </div>
              <div className="text-xs mt-2 text-muted-foreground">Fire Cult</div>
            </div>
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full mx-auto ${getLineageColor('Āṅgiras')} border-2 flex items-center justify-center`}>
                <div className="text-sm font-semibold">Āṅgiras</div>
              </div>
              <div className="text-xs mt-2 text-muted-foreground">Indra Worship</div>
            </div>
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full mx-auto ${getLineageColor('Kāśyapa')} border-2 flex items-center justify-center`}>
                <div className="text-sm font-semibold">Kāśyapa</div>
              </div>
              <div className="text-xs mt-2 text-muted-foreground">Soma Liturgy</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded border border-red-700/30">
              <div className="font-semibold mb-1">Bhṛgu ∩ Āṅgiras</div>
              <div className="text-muted-foreground">Gṛtsamada, Cyavana</div>
            </div>
            <div className="p-3 bg-gradient-to-r from-red-900/20 to-amber-900/20 rounded border border-amber-700/30">
              <div className="font-semibold mb-1">Bhṛgu ∩ Kāśyapa</div>
              <div className="text-muted-foreground">AV hymns (RV 10.14)</div>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded border border-orange-700/30">
              <div className="font-semibold mb-1">Āṅgiras ∩ Kāśyapa</div>
              <div className="text-muted-foreground">Rare (AV tradition)</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-red-900/10 via-orange-900/10 to-amber-900/10 rounded border border-primary/30">
            <div className="font-semibold mb-1 text-center text-sm">Bhṛgu ∩ Āṅgiras ∩ Kāśyapa</div>
            <div className="text-center text-xs text-muted-foreground">Atharvaveda Corpus ("Atharvāṅgirasāḥ")</div>
          </div>
        </div>

        {/* Detailed Cases */}
        <div className="space-y-4">
          <div className="font-semibold mb-2">Documented Overlap Cases:</div>
          {overlapCases.map((caseItem, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-help">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-2">{caseItem.name}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {caseItem.description}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {caseItem.lineages.map((lineage, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {lineage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <div className="space-y-2">
                    <div className="font-semibold">{caseItem.name}</div>
                    <div className="text-sm">
                      <strong>Evidence:</strong> {caseItem.evidence}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-amber-500">⚠</span> Methodological Note
          </div>
          <div className="text-muted-foreground space-y-2">
            <p>These overlaps are <strong>not contradictions</strong> but evidence of a living tradition where:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Spiritual lineage</strong> (guru-śiṣya) could override biological descent</li>
              <li><strong>Adoption</strong> transferred ṛṣis between gotras (e.g., Gṛtsamada)</li>
              <li><strong>Mythic merging</strong> identified deities with priestly clans (Agni as Āṅgirasa, Indra as Angirastama)</li>
              <li><strong>Collaborative synthesis</strong> united traditions in later Vedas (Atharvaveda)</li>
            </ul>
            <p className="mt-2">The Anukramaṇī system recorded <em>functional attribution</em> (who transmitted the hymn) rather than strict biological genealogy. This flexibility allowed knowledge to flow across family boundaries while maintaining lineage prestige.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
