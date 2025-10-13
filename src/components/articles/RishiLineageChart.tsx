import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RishiNode {
  id: string;
  name: string;
  patronymic?: string;
  generation: number;
  hymnAttributions?: string[];
  role?: string;
}

interface RishiLineageChartProps {
  lineage: 'bhrigu' | 'angirasa' | 'kashyapa' | 'all';
}

const bhriguNodes: RishiNode[] = [
  { id: 'bhrigu', name: 'Bhṛgu', generation: 1, role: 'Patriarch, Fire Cult Founder' },
  { id: 'cyavana', name: 'Cyavana', patronymic: 'son of Bhṛgu', generation: 2, hymnAttributions: ['RV 10.119'], role: 'Soma Rejuvenation' },
  { id: 'aurva', name: 'Aurva', generation: 3, role: 'Fire Emergence Legend' },
  { id: 'jamadagni', name: 'Jamadagni', generation: 4, role: 'Father of Paraśurāma' },
  { id: 'sunaka', name: 'Śunaka', generation: 4, role: 'Adoptive Father' },
  { id: 'gritsamada', name: 'Gṛtsamada Śaunaka', patronymic: 'adopted by Śunaka', generation: 5, hymnAttributions: ['RV 2.1-2.43 (Maṇḍala II)'], role: 'Fire Priest, Maṇḍala II Composer' }
];

const angirasaNodes: RishiNode[] = [
  { id: 'angiras', name: 'Aṅgiras', generation: 1, role: 'Patriarch, Indra\'s Companion' },
  { id: 'brihaspati', name: 'Bṛhaspati', patronymic: 'son of Aṅgiras', generation: 2, role: 'Guru of the Gods' },
  { id: 'bharadvaja', name: 'Bharadvāja Bārhaspatya', patronymic: 'son of Bṛhaspati', generation: 3, hymnAttributions: ['RV 6.1-6.75 (Maṇḍala VI)'], role: 'Indra Worship, Maṇḍala VI Composer' },
  { id: 'gautama', name: 'Gautama', generation: 2, role: 'Branch Founder' },
  { id: 'vamadeva', name: 'Vāmadeva Gautama', generation: 3, hymnAttributions: ['RV 4.1-4.58 (Maṇḍala IV)'], role: 'Cosmological Hymns' },
  { id: 'kanva', name: 'Kaṇva', generation: 2, hymnAttributions: ['RV 8 (portions)'], role: 'Branch Founder' },
  { id: 'medhatithi', name: 'Medhātithi Kāṇva', generation: 3, hymnAttributions: ['RV 1.101, 8.1-8.48'], role: 'Indra Hymns' }
];

const kashyapaNodes: RishiNode[] = [
  { id: 'marici', name: 'Marīci', generation: 1, role: 'Son of Brahmā' },
  { id: 'kashyapa', name: 'Kaśyapa Mārīca', patronymic: 'son of Marīci', generation: 2, hymnAttributions: ['RV 9.67, 9.91-92, 9.113-114'], role: 'Soma Pavamāna Specialist, Prajāpati' },
  { id: 'aditi', name: 'Aditi (wife)', generation: 2, role: 'Mother of Ādityas' },
  { id: 'adityas', name: 'Ādityas (sons)', patronymic: 'sons of Kaśyapa & Aditi', generation: 3, role: 'Solar Deities (Indra, Varuṇa, etc.)' },
  { id: 'diti', name: 'Diti (wife)', generation: 2, role: 'Mother of Daityas' },
  { id: 'daityas', name: 'Daityas (sons)', patronymic: 'sons of Kaśyapa & Diti', generation: 3, role: 'Demon Race' }
];

const getLineageColor = (lineage: string) => {
  switch (lineage) {
    case 'bhrigu': return 'bg-red-900/20 border-red-700/40 text-red-100';
    case 'angirasa': return 'bg-orange-900/20 border-orange-700/40 text-orange-100';
    case 'kashyapa': return 'bg-amber-900/20 border-amber-700/40 text-amber-100';
    default: return 'bg-muted border-border';
  }
};

const getLineageTitle = (lineage: string) => {
  switch (lineage) {
    case 'bhrigu': return 'Bhṛgu Lineage: Fire Cult Tradition';
    case 'angirasa': return 'Āṅgiras Lineage: Indra\'s Priestly Cohort';
    case 'kashyapa': return 'Kāśyapa Lineage: Soma Masters & Progenitors';
    default: return 'Ṛṣi Genealogies';
  }
};

const getLineageDescription = (lineage: string) => {
  switch (lineage) {
    case 'bhrigu': return 'Pioneers of the fire cult, composers of Maṇḍala II, discoverers of Agni';
    case 'angirasa': return 'Dominant Ṛgvedic lineage, composers of Maṇḍalas IV, VI, VIII, allies of Indra';
    case 'kashyapa': return 'Soma Pavamāna specialists (Maṇḍala IX), cosmic progenitors in epic tradition';
    default: return 'Three venerable ṛṣi families of the Ṛgveda';
  }
};

export function RishiLineageChart({ lineage }: RishiLineageChartProps) {
  const nodes = lineage === 'bhrigu' ? bhriguNodes :
                lineage === 'angirasa' ? angirasaNodes :
                lineage === 'kashyapa' ? kashyapaNodes : [];

  if (nodes.length === 0 && lineage !== 'all') return null;

  // Group nodes by generation
  const maxGen = Math.max(...nodes.map(n => n.generation));
  const generations = Array.from({ length: maxGen }, (_, i) => i + 1);

  return (
    <Card className={`my-8 ${getLineageColor(lineage)}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getLineageTitle(lineage)}
        </CardTitle>
        <CardDescription className="text-sm opacity-90">
          {getLineageDescription(lineage)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {generations.map(gen => {
            const genNodes = nodes.filter(n => n.generation === gen);
            if (genNodes.length === 0) return null;

            return (
              <div key={gen} className="space-y-2">
                <div className="text-xs font-semibold opacity-60 uppercase tracking-wide">
                  Generation {gen}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {genNodes.map(node => (
                    <TooltipProvider key={node.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/70 transition-colors cursor-help">
                            <div className="font-semibold text-sm mb-1">{node.name}</div>
                            {node.patronymic && (
                              <div className="text-xs opacity-70 italic mb-2">{node.patronymic}</div>
                            )}
                            {node.role && (
                              <Badge variant="outline" className="text-xs">
                                {node.role}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            <div className="font-semibold">{node.name}</div>
                            {node.patronymic && <div className="text-xs italic">{node.patronymic}</div>}
                            {node.role && <div className="text-sm">Role: {node.role}</div>}
                            {node.hymnAttributions && (
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Hymn Attributions:</div>
                                {node.hymnAttributions.map((attr, i) => (
                                  <div key={i} className="text-xs opacity-90">• {attr}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
