import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AnukramaniEntry {
  veda: string;
  anukramani: string;
  author: string;
  features: string;
  sources: string;
  details?: string;
}

const data: AnukramaniEntry[] = [
  {
    veda: 'Ṛgveda',
    anukramani: 'Sarvānukramaṇī (compendium of all indices)',
    author: 'Kātyāyana (c. 2nd cent. BCE)',
    features: 'The most important and comprehensive, indexing ṛṣi, devatā, chandas, first word, and verse count for all 1,028 hymns.',
    sources: '2',
    details: 'The Sarvānukramaṇī represents the pinnacle of Vedic indexing technology. Composed by the grammarian Kātyāyana, it synthesizes earlier specialized indices into a unified reference work.'
  },
  {
    veda: 'Ṛgveda',
    anukramani: 'Six Anukramaṇīs (e.g., Ārṣānukramaṇī, Chandānukramaṇī)',
    author: 'Śaunaka',
    features: 'Specialized indices for seers, meters, deities, etc. Mostly survive in quotations.',
    sources: '7',
    details: 'Śaunaka\'s specialized indices demonstrate the systematic approach to metadata preservation, with separate works dedicated to each aspect of mantra identity.'
  },
  {
    veda: 'Sāmaveda',
    anukramani: 'Ārṣeya Brāhmaṇa',
    author: 'Unknown',
    features: 'The earliest Anukramaṇī for the Sāmaveda (Kauthuma śākhā).',
    sources: '7',
    details: 'This early text demonstrates that the indexing tradition extended beyond the Ṛgveda to the melodic Sāmaveda, preserving musical and liturgical metadata.'
  },
  {
    veda: 'Sāmaveda',
    anukramani: 'Daivata Brāhmaṇa, Jaiminīya Ārṣeya Brāhmaṇa',
    author: 'Unknown',
    features: 'Later indices for deities and for the Jaiminīya śākhā.',
    sources: '7'
  },
  {
    veda: 'Yajurveda',
    anukramani: 'Anukramaṇīs for Taittirīya Saṃhitā (Kṛṣṇa Yajurveda)',
    author: 'Atri, Cārāyaṇa',
    features: 'Indices for the Atreyi and Cārāyaṇīya śākhās.',
    sources: '7',
    details: 'The Yajurveda indices adapted the system for a text combining mantras with ritual prose, demonstrating the flexibility of the indexing methodology.'
  },
  {
    veda: 'Yajurveda',
    anukramani: 'Anukramaṇī for Vājasaneyi Saṃhitā (Śukla Yajurveda)',
    author: 'Kātyāyana',
    features: 'Index for the Mādhyandina śākhā, covering poets, deities, and meters.',
    sources: '7'
  },
  {
    veda: 'Atharvaveda',
    anukramani: 'Bṛhatsarvānukramaṇī',
    author: 'Unknown',
    features: 'A complete index of the Atharvaveda Saṃhitā in 10 sections (paṭalas).',
    sources: '2',
    details: 'This comprehensive work indexed the complex and diverse Atharvaveda corpus, including its unique collection of spells, charms, and speculative hymns.'
  },
  {
    veda: 'Atharvaveda',
    anukramani: 'Atharvavedīyapancapaṭalikā, Pariśiṣṭas (e.g., Caraṇavyūha)',
    author: 'Unknown',
    features: 'Other appendices and indices, with the Caraṇavyūha being highly celebrated.',
    sources: '7'
  }
];

export function AnukramaniTable() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterVeda, setFilterVeda] = useState<string>('all');

  const vedas = ['all', ...Array.from(new Set(data.map(d => d.veda)))];
  const filteredData = filterVeda === 'all' ? data : data.filter(d => d.veda === filterVeda);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Major Anukramaṇīs of the Four Vedas</CardTitle>
        <CardDescription>
          A pan-Vedic system of textual preservation through systematic indexing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {vedas.map((veda) => (
            <Button
              key={veda}
              variant={filterVeda === veda ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVeda(veda)}
              className="text-xs"
            >
              {veda === 'all' ? 'All Vedas' : veda}
            </Button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Veda</TableHead>
                <TableHead>Major Anukramaṇī(s)</TableHead>
                <TableHead className="w-[200px]">Traditional Author(s)</TableHead>
                <TableHead className="hidden md:table-cell">Key Features</TableHead>
                <TableHead className="w-[80px]">Sources</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry, idx) => (
                <>
                  <TableRow key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">{entry.veda}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{entry.anukramani}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.author}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{entry.features}</TableCell>
                    <TableCell className="text-xs text-center">{entry.sources}</TableCell>
                    <TableCell>
                      {entry.details && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedRow === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedRow === idx && entry.details && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="p-4 text-sm space-y-2">
                          <div className="md:hidden">
                            <div className="font-semibold text-xs text-muted-foreground mb-1">Key Features:</div>
                            <p className="text-xs mb-3">{entry.features}</p>
                          </div>
                          <div className="font-semibold text-xs text-muted-foreground mb-1">Additional Details:</div>
                          <p className="text-xs">{entry.details}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Explanatory Note */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Note:</strong> This systematic development of indices across all four Vedas demonstrates a concerted intellectual effort to standardize and preserve the entire Śruti canon. Each index adapted the Ṛṣi-Devatā-Chandas framework to its specific corpus, ensuring pan-Vedic textual integrity.
        </div>
      </CardContent>
    </Card>
  );
}
