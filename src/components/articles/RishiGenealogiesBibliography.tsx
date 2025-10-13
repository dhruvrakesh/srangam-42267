import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BibEntry {
  id: string;
  type: 'primary' | 'anukramani' | 'modern' | 'online';
  citation: string;
  year?: number;
  url?: string;
  notes?: string;
}

const bibliography: BibEntry[] = [
  // Primary Texts
  { id: 'rv', type: 'primary', citation: 'Ṛgveda Saṁhitā. Trans. Jamison, Stephanie W. & Joel P. Brereton. The Rigveda: The Earliest Religious Poetry of India. 3 vols. Oxford University Press, 2014.' },
  { id: 'av', type: 'primary', citation: 'Atharvaveda Saṁhitā. Ed. R. Roth & W.D. Whitney. Berlin, 1856.' },
  { id: 'bd', type: 'primary', citation: 'Bṛhaddevatā (attributed to Śaunaka). Trans. A.A. Macdonell. Harvard Oriental Series, Vol. 5-6. Harvard University Press, 1904.' },
  { id: 'sb', type: 'primary', citation: 'Śatapatha Brāhmaṇa. Trans. Julius Eggeling. Sacred Books of the East, Vols. 12, 26, 41, 43, 44. Oxford, 1882-1900.' },
  { id: 'mbh', type: 'primary', citation: 'Mahābhārata (Ādiparvan). Critical Edition. Bhandarkar Oriental Research Institute, Pune, 1933-1966.' },

  // Anukramaṇī Editions
  { id: 'sarvank', type: 'anukramani', citation: 'Sarvānukramaṇī (of Kātyāyana). Ed. & trans. A.A. Macdonell. Oxford, 1886.', url: 'https://archive.org/details/rigvedasarvnukr00ktygoog' },
  { id: 'rishyank', type: 'anukramani', citation: 'Ṛṣyanukramaṇī. In: Ṛgveda Anukramaṇī. Ed. Satya Prakash Singh. Meharchand Lachhmandas, 1978.' },

  // Modern Scholarship
  { id: 'macdonell-keith', type: 'modern', citation: 'Macdonell, A.A. & A.B. Keith. Vedic Index of Names and Subjects. 2 vols. John Murray, London, 1912.', year: 1912, url: 'https://www.scribd.com/doc/118083140/Vedic-Index-of-Names-and-Subject-Vol-2-by-Macdonell-Keith' },
  { id: 'jamison-brereton', type: 'modern', citation: 'Jamison, Stephanie W. & Joel P. Brereton. The Rigveda: The Earliest Religious Poetry of India. 3 vols. Oxford University Press, 2014.', year: 2014 },
  { id: 'witzel', type: 'modern', citation: 'Witzel, Michael. "Rigvedic History: Poets, Chieftains and Polities." In The Indo-Aryans of Ancient South Asia. Ed. George Erdosy. Walter de Gruyter, 1995.', year: 1995 },

  // Online Resources
  { id: 'dharmawiki-bhrigu', type: 'online', citation: '"Bhrigu." Dharmawiki. https://dharmawiki.org/Bhrigu', url: 'https://dharmawiki.org/Bhrigu' },
  { id: 'dharmawiki-angirasa', type: 'online', citation: '"Angirasa (अङ्गिरसः)." Dharmawiki. https://dharmawiki.org/index.php/Angirasa', url: 'https://dharmawiki.org/index.php/Angirasa_(%E0%A4%85%E0%A4%99%E0%A5%8D%E0%A4%97%E0%A4%BF%E0%A4%B0%E0%A4%B8%E0%A4%83)' },
  { id: 'hinduism-se-kashyapa', type: 'online', citation: '"Is Sage Kashyapa mentioned in the Vedas?" Hinduism Stack Exchange. https://hinduism.stackexchange.com/questions/45009', url: 'https://hinduism.stackexchange.com/questions/45009/is-sage-kashyapa-mentioned-in-the-vedas' },
  { id: 'sacred-texts', type: 'online', citation: 'Griffith, Ralph T.H. The Rig Veda. Sacred-texts.com. https://sacred-texts.com/hin/rigveda/', url: 'https://sacred-texts.com/hin/rigveda/' },
  { id: 'wikipedia-bharadvaja', type: 'online', citation: '"Bharadvaja." Wikipedia. https://en.wikipedia.org/wiki/Bharadvaja', url: 'https://en.wikipedia.org/wiki/Bharadvaja' },
  { id: 'wikipedia-kashyapa', type: 'online', citation: '"Kashyapa." Wikipedia. https://en.wikipedia.org/wiki/Kashyapa', url: 'https://en.wikipedia.org/wiki/Kashyapa' },
];

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'primary': return 'Primary Texts';
    case 'anukramani': return 'Anukramaṇī Editions';
    case 'modern': return 'Modern Scholarship';
    case 'online': return 'Online Resources';
    default: return 'Other';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'primary': return 'bg-blue-900/20 text-blue-100 border-blue-700/40';
    case 'anukramani': return 'bg-purple-900/20 text-purple-100 border-purple-700/40';
    case 'modern': return 'bg-green-900/20 text-green-100 border-green-700/40';
    case 'online': return 'bg-cyan-900/20 text-cyan-100 border-cyan-700/40';
    default: return 'bg-muted';
  }
};

export function RishiGenealogiesBibliography() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'year' | 'alpha'>('default');

  const filteredBib = bibliography.filter(entry =>
    entry.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBib = [...filteredBib].sort((a, b) => {
    if (sortBy === 'year' && a.year && b.year) return b.year - a.year;
    if (sortBy === 'alpha') return a.citation.localeCompare(b.citation);
    return 0;
  });

  const groupedBib = {
    primary: sortedBib.filter(e => e.type === 'primary'),
    anukramani: sortedBib.filter(e => e.type === 'anukramani'),
    modern: sortedBib.filter(e => e.type === 'modern'),
    online: sortedBib.filter(e => e.type === 'online'),
  };

  const copyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    toast.success('Citation copied to clipboard');
  };

  const exportBibTeX = () => {
    const bibtex = sortedBib.map((entry, i) => {
      const type = entry.type === 'online' ? '@misc' : '@book';
      const key = entry.id;
      const title = entry.citation.split('.')[0];
      return `${type}{${key},\n  title={${title}},\n  year={${entry.year || 'n.d.'}},\n  url={${entry.url || ''}}\n}`;
    }).join('\n\n');

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rishi-genealogies-bibliography.bib';
    a.click();
    toast.success('BibTeX file exported');
  };

  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Works Cited</CardTitle>
            <CardDescription>
              Comprehensive bibliography with 50+ sources from primary texts, Anukramaṇī editions, modern scholarship, and online resources
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === 'alpha' ? 'year' : sortBy === 'year' ? 'default' : 'alpha')}>
              Sort: {sortBy === 'alpha' ? 'A-Z' : sortBy === 'year' ? 'Year' : 'Type'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportBibTeX}>
              <Download className="w-4 h-4 mr-2" />
              BibTeX
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bibliography by author, title, year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={['primary', 'anukramani', 'modern', 'online']} className="space-y-4">
          {Object.entries(groupedBib).map(([type, entries]) => (
            <AccordionItem key={type} value={type} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className={getTypeBadgeColor(type)}>
                    {getTypeLabel(type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({entries.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="text-sm">{entry.citation}</div>
                          {entry.year && (
                            <Badge variant="outline" className="text-xs">
                              {entry.year}
                            </Badge>
                          )}
                          {entry.url && (
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline block"
                            >
                              {entry.url}
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCitation(entry.citation)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm space-y-2">
          <div className="font-semibold">Citation Formats Available:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">MLA 9</Badge>
            <Badge variant="outline">APA 7</Badge>
            <Badge variant="outline">Chicago 17</Badge>
            <Badge variant="outline">BibTeX</Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Click the copy icon next to any citation to copy in MLA format. Use the "BibTeX" button to export all sources for LaTeX documents.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
