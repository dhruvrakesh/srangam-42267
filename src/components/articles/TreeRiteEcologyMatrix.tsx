import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface RiteTreeConnection {
  rite: string;
  treesImplicated: string[];
  regionFocus: string;
  continuityNote: string;
  confidence: 'H' | 'M' | 'H/M';
}

const riteTreeData: RiteTreeConnection[] = [
  {
    rite: 'Sarhul (sal blossom rite)',
    treesImplicated: ['śāl'],
    regionFocus: 'Jharkhand–Odisha',
    continuityNote: 'Sal blossom as calendar cue; deity/ancestor priority',
    confidence: 'H'
  },
  {
    rite: 'Karam (branch ceremony)',
    treesImplicated: ['karam'],
    regionFocus: 'Munda belts',
    continuityNote: 'Overnight song-night; branch returned to soil',
    confidence: 'H/M'
  },
  {
    rite: 'Pongal / Makar Saṅkrānti',
    treesImplicated: ['vaṭa', 'pippala', 'nīm (household)', 'arjuna (river)'],
    regionFocus: 'Pan-India; Tamil country',
    continuityNote: 'Sun/harvest–cattle ethic; lamping at trees',
    confidence: 'H'
  },
  {
    rite: 'Daśahrā Śamī-pūjā',
    treesImplicated: ['śamī/khejri'],
    regionFocus: 'Rajasthan–Gujarat',
    continuityNote: 'Desert victory/renewal, Bishnoi ethics',
    confidence: 'H'
  },
  {
    rite: 'Household vrata',
    treesImplicated: ['tulasī', 'nīm', 'pippala'],
    regionFocus: 'All-India',
    continuityNote: 'Daily lamping and vow cycles',
    confidence: 'H'
  },
  {
    rite: 'River vows',
    treesImplicated: ['arjuna', 'pippala'],
    regionFocus: 'Ganga, Godavari, Kaveri',
    continuityNote: 'Thread-tying; healing vows',
    confidence: 'H'
  },
  {
    rite: 'Coastal rites',
    treesImplicated: ['punnai', 'mangroves'],
    regionFocus: 'Malabar, Sundarbans, Kachchh',
    continuityNote: 'Tide etiquette; cyclone memory',
    confidence: 'M'
  },
  {
    rite: 'Śaiva pūjā',
    treesImplicated: ['bilva'],
    regionFocus: 'Pan-India Śaiva sites',
    continuityNote: 'Tri-foliate leaf theology; essential offering',
    confidence: 'H'
  },
  {
    rite: 'Vedic fire ceremony',
    treesImplicated: ['palāśa'],
    regionFocus: 'Central/East India',
    continuityNote: 'Araṇi fire-drill sticks from Butea wood',
    confidence: 'H'
  },
  {
    rite: 'Highland Buddhist rites',
    treesImplicated: ['juniper', 'deodāra'],
    regionFocus: 'Himalaya, Trans-Himalaya',
    continuityNote: 'Fumigation smoke; sacred architecture',
    confidence: 'M'
  }
];

const confidenceColors = {
  H: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  M: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  'H/M': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
};

export function TreeRiteEcologyMatrix() {
  const [selectedRite, setSelectedRite] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('all');

  const regions = ['all', 'Pan-India', 'Jharkhand', 'Tamil country', 'Rajasthan', 'Himalaya', 'Coastal'];

  const filteredData = riteTreeData.filter(item => {
    const regionMatch = filterRegion === 'all' || item.regionFocus.toLowerCase().includes(filterRegion.toLowerCase());
    return regionMatch;
  });

  const handleExportCSV = () => {
    const headers = ['Rite/Festival', 'Trees Implicated', 'Region Focus', 'Continuity Note', 'Confidence'];
    const rows = filteredData.map(item => [
      item.rite,
      item.treesImplicated.join('; '),
      item.regionFocus,
      item.continuityNote,
      item.confidence
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tree-rite-ecology-matrix.csv';
    a.click();
  };

  return (
    <Card className="w-full border-border/40">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Tree → Rite → Ecology Matrix</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Cross-reference of ceremonial cycles, tree species, and regional patterns. 
              Click a rite to highlight associated trees; filter by region to focus analysis.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
          <Filter className="h-4 w-4 text-muted-foreground mt-1" />
          <span className="text-sm text-muted-foreground">Region:</span>
          {regions.map(region => (
            <Button
              key={region}
              variant={filterRegion === region ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRegion(region)}
              className="h-7 text-xs"
            >
              {region === 'all' ? 'All Regions' : region}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Rite / Festival</TableHead>
                <TableHead className="font-semibold">Trees Implicated</TableHead>
                <TableHead className="font-semibold">Region Focus</TableHead>
                <TableHead className="font-semibold">Continuity Note</TableHead>
                <TableHead className="font-semibold text-center w-20">Conf.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={`cursor-pointer transition-colors ${
                    selectedRite === item.rite ? 'bg-primary/5' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedRite(selectedRite === item.rite ? null : item.rite)}
                >
                  <TableCell className="font-medium">
                    {item.rite}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.treesImplicated.map((tree, tIdx) => (
                        <Badge
                          key={tIdx}
                          variant="secondary"
                          className="text-xs font-sanskrit"
                        >
                          {tree}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.regionFocus}
                  </TableCell>
                  <TableCell className="text-sm leading-relaxed">
                    {item.continuityNote}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={confidenceColors[item.confidence]}
                    >
                      {item.confidence}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Commentary */}
        <Card className="border-border/40 bg-muted/30 mt-6">
          <CardHeader>
            <CardTitle className="text-base">Matrix Reading Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p>
              <strong>Calendrical Fusion:</strong> India's ritual calendar layers solar (Makar Saṅkrānti), 
              lunar (many vratas), phenological (Sarhul keyed to sal bloom), and sidereal cycles. 
              Trees mediate between cosmic and terrestrial time—blossom, fruit, and leaf-fall anchor 
              ceremonial schedules to observable ecological events.
            </p>
            <p>
              <strong>Regional Specificity:</strong> While some trees (pippala, tulasī) appear pan-Indian, 
              others mark bioregional boundaries: śāl defines the Chota Nagpur plateau's Sarna belt, 
              śamī anchors Thar desert ethics, mangroves structure deltaic tide-memory.
            </p>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
              <strong>Evidence convergence:</strong> High-confidence entries (H) triangulate ethnographic fieldwork, 
              ecological surveys, and textual/archaeological cross-dating. Medium entries (M) have strong support 
              in one domain with partial validation in others.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
