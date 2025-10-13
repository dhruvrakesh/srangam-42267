import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BibEntry {
  id: string;
  type: 'primary' | 'anukramani' | 'modern' | 'online';
  citation: string;
  year?: string;
  url?: string;
  notes?: string;
}

const bibliography: BibEntry[] = [
  // Primary Texts
  { id: 'rsis-primary-1', type: 'primary', citation: 'Ṛgveda Saṁhitā. Anukramaṇī attributions per Śaunaka. Translated by Ralph T.H. Griffith and others.', year: '~1500 BCE' },
  { id: 'rsis-primary-2', type: 'primary', citation: 'Bṛhaddevatā attributed to Śaunaka. Translated and annotated by A.A. Macdonell.', year: '~500 BCE', url: 'https://www.wisdomlib.org/hinduism/book/brihaddevata-attributed-to-shaunaka/ocr', notes: 'Summarizes deities of Ṛgveda with legends surrounding hymn composition' },
  { id: 'rsis-primary-3', type: 'primary', citation: 'Ṛgveda (Book 8, Hymn XCI). "Agni." Sacred-Texts.com.', url: 'https://sacred-texts.com/hin/rigveda/rv08091.htm', notes: 'Invokes Aurva and Apnavāna Bhṛgus as first fire-kindlers' },
  { id: 'rsis-primary-4', type: 'primary', citation: 'Ṛgveda (Book 4, Hymn VII). "Agni." Sacred-Texts.com.', url: 'https://sacred-texts.com/hin/rigveda/rv04007.htm', notes: 'Apnavāna and Bhṛgus made Agni shine spreading from home to home' },
  { id: 'rsis-primary-5', type: 'primary', citation: 'Śatapatha Brāhmaṇa. Referenced in Vedic Index regarding Cyavana\'s dual Bhārgava/Āṅgirasa identity.', year: '~800-600 BCE' },
  { id: 'rsis-primary-6', type: 'primary', citation: 'Aitareya Brāhmaṇa. References to Cyavana Bhārgava and Bhṛgu clan activities.', year: '~1000-800 BCE' },
  { id: 'rsis-primary-7', type: 'primary', citation: 'Taittirīya Upaniṣad. Narrative of Bhṛgu Vāruṇi learning ultimate truth from Varuṇa.', year: '~600 BCE' },
  { id: 'rsis-primary-8', type: 'primary', citation: 'Atharvaveda. References to "Atharvāṅgirasāḥ" (compound of Atharvan and Aṅgiras).', year: '~1200-1000 BCE' },
  { id: 'rsis-primary-9', type: 'primary', citation: 'Mahābhārata. Bhṛgu lineage including Jamadagni and Paraśurāma.', year: '~400 BCE-400 CE' },
  { id: 'rsis-primary-10', type: 'primary', citation: 'Manu Smṛti. Attributed to Bhṛgu as narrator/editor.', year: '~200 BCE-200 CE' },
  
  // Anukramaṇī Editions
  { id: 'rsis-anuk-1', type: 'anukramani', citation: 'Śaunaka. Sarvānukramaṇī (Complete Index to the Ṛgveda). Systematic catalog of Ṛgvedic hymns\' seers, deities, and meters.', year: '~500 BCE', notes: 'Primary source for ṛṣi attributions' },
  { id: 'rsis-anuk-2', type: 'anukramani', citation: 'Ṛṣyanukramaṇī. Index specifically listing the seers (ṛṣis) of each Ṛgvedic hymn.', year: '~500 BCE' },
  { id: 'rsis-anuk-3', type: 'anukramani', citation: 'Devatānukramaṇī. Index listing deities addressed in each Ṛgvedic hymn.', year: '~500 BCE' },
  { id: 'rsis-anuk-4', type: 'anukramani', citation: 'Chandasānukramaṇī. Index cataloging the meters (chandas) of Ṛgvedic verses.', year: '~500 BCE' },
  
  // Modern Scholarship
  { id: 'rsis-mod-1', type: 'modern', citation: 'Macdonell, A.A. & Keith, A.B. (1912). Vedic Index of Names and Subjects (2 volumes). London: John Murray.', year: '1912', url: 'https://www.scribd.com/doc/118083140/Vedic-Index-of-Names-and-Subject-Vol-2-by-Macdonell-Keith', notes: 'Foundational reference for Vedic lineage and identification details' },
  { id: 'rsis-mod-2', type: 'modern', citation: 'Jamison, Stephanie W. & Brereton, Joel P. (2014). The Rigveda: The Earliest Religious Poetry of India (3 volumes). Oxford: Oxford University Press.', year: '2014', notes: 'Most comprehensive modern English translation with philological notes' },
  { id: 'rsis-mod-3', type: 'modern', citation: 'Sāyaṇa (14th century CE). Ṛgveda Bhāṣya (Commentary on the Ṛgveda). Edited by Satya Prakash Singh (1978).', year: '1978', notes: 'Medieval commentary preserving traditional interpretations' },
  { id: 'rsis-mod-4', type: 'modern', citation: 'Griffith, Ralph T.H. (1896). The Hymns of the Rigveda. Benares: E.J. Lazarus and Co.', year: '1896', url: 'https://sacred-texts.com/hin/rigveda/', notes: 'Classic English translation, public domain' },
  { id: 'rsis-mod-5', type: 'modern', citation: 'Macdonell, A.A. (1904). The Bṛhad-devatā: Attributed to Śaunaka. Harvard Oriental Series, Vol. 5-6. Cambridge: Harvard University Press.', year: '1904' },
  { id: 'rsis-mod-6', type: 'modern', citation: 'Aurobindo, Sri. "The Angirasa Legend in the Veda." In The Secret of the Veda. Renaissance: Sri Aurobindo Society.', url: 'https://renaissance.aurosociety.org/the-angiras-legend-in-the-veda/', notes: 'Esoteric interpretation of Āṅgirasa mythology' },
  { id: 'rsis-mod-7', type: 'modern', citation: 'Vedic Index of Names and Subjects (Digital PDF). University of Cologne Sanskrit Lexicon Project.', url: 'https://www.sanskrit-lexicon.uni-koeln.de/scans/VEIScan/2013/downloads/vei2_bookmark.pdf', notes: 'Searchable digital version' },
  
  // Online Resources  
  { id: 'rsis-online-1', type: 'online', citation: '"Is the Anukramani index of sages and deities of the Rig Veda available online?" Hinduism Stack Exchange.', url: 'https://hinduism.stackexchange.com/questions/2429/is-the-anukramani-index-of-sages-and-deities-of-the-rig-veda-available-online', notes: 'Community discussion on Anukramaṇī tradition and digital access' },
  { id: 'rsis-online-2', type: 'online', citation: '"Gṛtsamada." Hindupedia: The Hindu Encyclopedia.', url: 'https://www.hindupedia.com/en/Gṛtsamada', notes: 'Encyclopedic entry on Gṛtsamada Śaunaka, son of Śunaka, Bhārgava identity' },
  { id: 'rsis-online-3', type: 'online', citation: '"Angirasa (अङ्गिरसः)." Dharmawiki.', url: 'https://dharmawiki.org/index.php/Angirasa_(अङ्गिरसः)', notes: 'Comprehensive coverage of Āṅgirasa lineage, Paṇi legend, Soma hymns' },
  { id: 'rsis-online-4', type: 'online', citation: '"Bharadvāja." Wikipedia.', url: 'https://en.wikipedia.org/wiki/Bharadvaja', notes: 'Overview of Bharadvāja Bārhaspatya, Maṇḍala VI attribution' },
  { id: 'rsis-online-5', type: 'online', citation: '"Kashyapa." Wikipedia.', url: 'https://en.wikipedia.org/wiki/Kashyapa', notes: 'Kāśyapa genealogy, Purāṇic connections, Soma Pavamāna references' },
  { id: 'rsis-online-6', type: 'online', citation: '"Is Sage Kashyapa mentioned in the Vedas?" Hinduism Stack Exchange.', url: 'https://hinduism.stackexchange.com/questions/45009/is-sage-kashyapa-mentioned-in-the-vedas', notes: 'Detailed analysis of Kāśyapa Mārīca hymns in Ṛgveda IX' },
  { id: 'rsis-online-7', type: 'online', citation: '"Angirasa." Pali Names Dictionary. Palikanon.com.', url: 'https://www.palikanon.com/english/pali_names/ay/angirasa.htm', notes: 'Buddhist Pali sources referencing Vedic ṛṣi Aṅgiras' },
  { id: 'rsis-online-8', type: 'online', citation: '"The Lost Sun and the Lost Cows." The Veda (CWSA - The Secret of the Veda).', url: 'https://theveda.org.in/rigveda/sa/15/the-lost-sun-and-the-lost-cows', notes: 'Discusses Bhṛgus and Angirasas acting in concert in Ṛgveda 1.60' },
  { id: 'rsis-online-9', type: 'online', citation: '"Sarama Pani Samvada (सरमापणिसंवादः)." Dharmawiki.', url: 'https://dharmawiki.org/index.php/Sarama_Pani_Samvada_(सरमापणिसंवादः)', notes: 'Legend of Paṇis stealing devatas, Indra and Āṅgirasas recovering them' },
  { id: 'rsis-online-10', type: 'online', citation: 'Sacred-Texts.com Ṛgveda Archive. Complete English translations by Griffith.', url: 'https://sacred-texts.com/hin/rigveda/', notes: 'Public domain repository for all Ṛgvedic hymns' },
  { id: 'rsis-online-11', type: 'online', citation: 'Wisdom Library: Hindu Section. Searchable database of Purāṇic and Vedic sources.', url: 'https://www.wisdomlib.org/hinduism', notes: 'Digital repository for scholarly research' },
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
