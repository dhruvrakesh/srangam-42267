import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Filter } from 'lucide-react';

interface MandalaEntry {
  mandala: number;
  primaryLineage: 'Bhṛgu' | 'Āṅgiras' | 'Kāśyapa' | 'Mixed';
  keySeers: string[];
  hymnCount: number;
  dominantDeities: string[];
  notes: string;
}

const mandalaData: MandalaEntry[] = [
  {
    mandala: 2,
    primaryLineage: 'Bhṛgu',
    keySeers: ['Gṛtsamada Śaunaka'],
    hymnCount: 43,
    dominantDeities: ['Agni', 'Indra'],
    notes: '"Family book" of Bhṛgus (though Gṛtsamada had Āṅgiras birth, adopted by Bhṛgu)'
  },
  {
    mandala: 4,
    primaryLineage: 'Āṅgiras',
    keySeers: ['Vāmadeva Gautama'],
    hymnCount: 58,
    dominantDeities: ['Indra', 'Agni'],
    notes: 'Pure Gautama branch of Āṅgirasas, cosmological hymns'
  },
  {
    mandala: 6,
    primaryLineage: 'Āṅgiras',
    keySeers: ['Bharadvāja Bārhaspatya'],
    hymnCount: 75,
    dominantDeities: ['Indra', 'Agni'],
    notes: 'Pure Bharadvāja branch of Āṅgirasas via Bṛhaspati'
  },
  {
    mandala: 8,
    primaryLineage: 'Āṅgiras',
    keySeers: ['Kaṇva', 'Medhātithi Kāṇva'],
    hymnCount: 25,
    dominantDeities: ['Indra', 'Soma'],
    notes: 'Partial attribution, Kaṇva branch, mixed with other composers'
  },
  {
    mandala: 9,
    primaryLineage: 'Kāśyapa',
    keySeers: ['Kaśyapa Mārīca'],
    hymnCount: 6,
    dominantDeities: ['Soma Pavamāna'],
    notes: 'Specialized Soma liturgy, 5-6 hymns attributed to Kaśyapa'
  },
  {
    mandala: 10,
    primaryLineage: 'Mixed',
    keySeers: ['Various ṛṣis'],
    hymnCount: 0,
    dominantDeities: ['Diverse'],
    notes: 'Later collection with multiple lineages (Bhṛgu, Āṅgiras, Kāśyapa)'
  }
];

const getLineageBadgeColor = (lineage: string) => {
  switch (lineage) {
    case 'Bhṛgu': return 'bg-red-900/20 text-red-100 border-red-700/40';
    case 'Āṅgiras': return 'bg-orange-900/20 text-orange-100 border-orange-700/40';
    case 'Kāśyapa': return 'bg-amber-900/20 text-amber-100 border-amber-700/40';
    default: return 'bg-muted';
  }
};

export function MandalaAttributionTable() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredData = filter === 'all' 
    ? mandalaData 
    : mandalaData.filter(entry => entry.primaryLineage === filter);

  const exportToCSV = () => {
    const headers = ['Maṇḍala', 'Lineage', 'Key Seers', 'Hymn Count', 'Deities', 'Notes'];
    const rows = filteredData.map(entry => [
      entry.mandala,
      entry.primaryLineage,
      entry.keySeers.join('; '),
      entry.hymnCount,
      entry.dominantDeities.join(', '),
      entry.notes
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mandala-attributions.csv';
    a.click();
  };

  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Maṇḍala Attribution by Ṛṣi Lineage</CardTitle>
            <CardDescription>
              Which books of the Ṛgveda are attributed to which ṛṣi families
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'Bhṛgu' : filter === 'Bhṛgu' ? 'Āṅgiras' : filter === 'Āṅgiras' ? 'Kāśyapa' : 'all')}
            >
              <Filter className="w-4 h-4 mr-2" />
              {filter === 'all' ? 'All' : filter}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Maṇḍala</TableHead>
                <TableHead>Primary Lineage</TableHead>
                <TableHead>Key Seers</TableHead>
                <TableHead className="text-right w-32">Hymn Count</TableHead>
                <TableHead>Dominant Deities</TableHead>
                <TableHead className="max-w-xs">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry) => (
                <TableRow key={entry.mandala}>
                  <TableCell className="font-medium">
                    Book {entry.mandala}
                  </TableCell>
                  <TableCell>
                    <Badge className={getLineageBadgeColor(entry.primaryLineage)}>
                      {entry.primaryLineage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {entry.keySeers.map((seer, i) => (
                        <div key={i} className="text-sm">{seer}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.hymnCount > 0 ? entry.hymnCount : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.dominantDeities.map((deity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {deity}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {entry.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm space-y-2">
          <div className="font-semibold">Key Observations:</div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Āṅgiras dominance:</strong> Maṇḍalas IV, VI, VIII (portions) = ~158 hymns</li>
            <li><strong>Bhṛgu specialty:</strong> Maṇḍala II entirely attributed to Gṛtsamada Śaunaka</li>
            <li><strong>Kāśyapa focus:</strong> Small but critical Soma Pavamāna hymns in Maṇḍala IX</li>
            <li><strong>Overlap:</strong> Gṛtsamada (Maṇḍala II) born Āṅgiras, adopted by Bhṛgu—demonstrates inter-lineage fluidity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
