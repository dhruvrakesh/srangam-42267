import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BIBLIOGRAPHY = [
  {
    id: 1,
    category: 'Colonial Scholarship',
    author: 'Max Müller, Friedrich',
    title: 'History of Ancient Sanskrit Literature',
    year: 1859,
    publisher: 'Williams and Norgate, London',
    confidence: 'D',
    link: 'https://archive.org/details/historyofancien00mlgoog',
    annotation: 'Original colonial-era dating framework (1200 BCE) - now largely abandoned by scholars.'
  },
  {
    id: 2,
    category: 'Archaeological Evidence',
    author: 'Lal, B.B.',
    title: 'The Rigvedic People: "Invaders"? "Immigrants"? or Indigenous?',
    year: 2015,
    publisher: 'Aryan Books International',
    confidence: 'A',
    link: '',
    annotation: 'Comprehensive archaeological synthesis placing Rigveda in 3rd millennium BCE based on Sarasvatī and Harappan continuity.'
  },
  {
    id: 3,
    category: 'Geological Studies',
    author: 'Valdiya, K.S.',
    title: 'The River Saraswati was a Himalayan-born river',
    year: 2013,
    journal: 'Current Science',
    volume: '104(1)',
    pages: '42-54',
    confidence: 'A',
    link: 'https://www.currentscience.ac.in/Volumes/104/01/0042.pdf',
    annotation: 'Geological evidence for mighty Sarasvatī flowing from Himalayas before 1900 BCE drying.'
  },
  {
    id: 4,
    category: 'Astronomical Dating',
    author: 'Tilak, B.G.',
    title: 'The Orion or Researches into the Antiquity of the Vedas',
    year: 1893,
    publisher: 'Tilak Bros., Poona',
    confidence: 'C',
    link: 'https://archive.org/details/orionorresearche00tila',
    annotation: 'Precession-based dating using nakṣatra references → ~4500 BCE. Requires astronomical interpretation.'
  },
  {
    id: 5,
    category: 'Linguistic Evidence',
    author: 'Kazanas, Nicholas',
    title: 'Indo-Aryan Origins and the Rigveda',
    year: 2009,
    publisher: 'Aditya Prakashan',
    confidence: 'B',
    link: '',
    annotation: 'Linguistic analysis supporting indigenous Ārya theory and pre-1500 BCE Rigveda.'
  },
  {
    id: 6,
    category: 'Indigenous Sources',
    author: 'Pargiter, F.E.',
    title: 'The Purāṇa Text of the Dynasties of the Kali Age',
    year: 1913,
    publisher: 'Oxford University Press',
    confidence: 'B',
    link: 'https://archive.org/details/purnatextdynast00parggoog',
    annotation: 'Compilation of Puranic chronologies converging on 3102 BCE Kali Yuga start.'
  },
  {
    id: 7,
    category: 'Revised Chronologies',
    author: 'Talageri, Shrikant',
    title: 'The Rigveda: A Historical Analysis',
    year: 2000,
    publisher: 'Aditya Prakashan',
    confidence: 'B',
    link: '',
    annotation: 'Internal Rigvedic stratification placing early maṇḍalas at 3400-3200 BCE based on river names and tribal migrations.'
  },
  {
    id: 8,
    category: 'Geological Studies',
    author: 'Danino, Michel',
    title: 'The Lost River: On the Trail of the Sarasvati',
    year: 2010,
    publisher: 'Penguin Books India',
    confidence: 'A',
    link: '',
    annotation: 'Comprehensive synthesis of geological, archaeological, and textual evidence for Sarasvatī identification with Ghaggar-Hakra.'
  },
  {
    id: 9,
    category: 'Archaeological Evidence',
    author: 'Rao, S.R.',
    title: 'The Harappan Civilization and the Rigveda',
    year: 1991,
    journal: 'Journal of Marine Archaeology',
    confidence: 'B',
    link: '',
    annotation: 'Argues for cultural continuity between Harappan and Vedic civilizations based on archaeological parallels.'
  },
  {
    id: 10,
    category: 'Astronomical Dating',
    author: 'Jacobi, Hermann',
    title: 'On the Date of the Ṛigveda',
    year: 1909,
    journal: 'Indian Antiquary',
    confidence: 'C',
    link: '',
    annotation: 'Pioneering astronomical dating placing early Vedic texts around 2500 BCE based on Kṛttikā references.'
  }
];

const CATEGORIES = [
  'All',
  'Colonial Scholarship',
  'Archaeological Evidence',
  'Geological Studies',
  'Astronomical Dating',
  'Linguistic Evidence',
  'Indigenous Sources',
  'Revised Chronologies'
];

export function RigvedaChronologyBibliography() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredBibliography = BIBLIOGRAPHY.filter(entry => {
    const matchesSearch = entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const exportBibTeX = () => {
    const bibtex = filteredBibliography.map(entry => {
      const type = entry.journal ? 'article' : 'book';
      const key = `${entry.author.split(',')[0].toLowerCase().replace(/[^a-z]/g, '')}${entry.year}`;
      return `@${type}{${key},
  author = {${entry.author}},
  title = {${entry.title}},
  year = {${entry.year}},
  ${entry.publisher ? `publisher = {${entry.publisher}},` : ''}
  ${entry.journal ? `journal = {${entry.journal}},` : ''}
  ${entry.volume ? `volume = {${entry.volume}},` : ''}
  ${entry.pages ? `pages = {${entry.pages}},` : ''}
}`;
    }).join('\n\n');

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rigveda-chronology-bibliography.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <CardTitle>Comprehensive Bibliography: Rigveda Chronology</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Categorized sources with confidence grading and direct links
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search by author or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Button variant="outline" onClick={exportBibTeX} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Export BibTeX
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex-wrap h-auto">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat} ({cat === 'All' ? BIBLIOGRAPHY.length : BIBLIOGRAPHY.filter(e => e.category === cat).length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="space-y-4">
                {filteredBibliography.map(entry => (
                  <div key={entry.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={getConfidenceVariant(entry.confidence)}>
                            {entry.confidence}-Grade
                          </Badge>
                          <span className="text-xs text-muted-foreground">{entry.category}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">{entry.author}.</span> ({entry.year}). <em>{entry.title}</em>.
                          {entry.journal && <> <em>{entry.journal}</em>, {entry.volume}</>}
                          {entry.publisher && <> {entry.publisher}.</>}
                        </div>
                        {expandedId === entry.id && (
                          <div className="mt-2 text-xs text-muted-foreground p-3 bg-muted/20 rounded">
                            {entry.annotation}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {entry.link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={entry.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                        >
                          {expandedId === entry.id ? 'Hide' : 'Info'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredBibliography.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No sources found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
