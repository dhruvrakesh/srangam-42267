import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconScript, IconOm, IconDharmaChakra } from '@/components/icons';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { Search, BookOpen, Volume2, ExternalLink } from 'lucide-react';

interface LexiconEntry {
  id: string;
  term: string;
  iast: string;
  devanagari?: string;
  pronunciation?: string;
  meaning: string;
  etymology: string;
  category: string;
  sources: string[];
  usage: string;
  relatedTerms: string[];
  culturalContext: string;
  examples: {
    source: string;
    text: string;
    translation: string;
  }[];
}

const MARITIME_LEXICON: LexiconEntry[] = [
  {
    id: 'samudra',
    term: 'samudra',
    iast: 'samudra',
    devanagari: 'समुद्र',
    pronunciation: 'sa-mud-ra',
    meaning: 'Ocean, sea; gathering together of waters',
    etymology: 'sam (together) + udra (water) - the confluence of all waters',
    category: 'Geography',
    sources: ['Rig Veda', 'Mahabharata', 'Puranas'],
    usage: 'Primary Sanskrit term for ocean, often with cosmological significance',
    relatedTerms: ['jalani dhi', 'arṇava', 'sāgara'],
    culturalContext: 'In Vedic cosmology, samudra represents the primordial waters surrounding the earth-disk',
    examples: [
      {
        source: 'Rig Veda 10.136',
        text: 'samudraṃ sindhavaḥ kṣaranti',
        translation: 'The rivers flow into the ocean'
      },
      {
        source: 'Arthaśāstra',
        text: 'samudra-kūla deśa',
        translation: 'Coastal region/maritime territory'
      }
    ]
  },
  {
    id: 'vanijya',
    term: 'vāṇijya',
    iast: 'vāṇijya',
    devanagari: 'वाणिज्य',
    pronunciation: 'vaa-nij-ya',
    meaning: 'Trade, commerce, mercantile activity',
    etymology: 'From vaṇij (merchant) + ya (abstract suffix)',
    category: 'Commerce',
    sources: ['Arthaśāstra', 'Dharmaśāstras', 'Inscriptions'],
    usage: 'Technical term for organized trade in classical Sanskrit texts',
    relatedTerms: ['vaṇij', 'kraya-vikraya', 'vyāpāra'],
    culturalContext: 'Represents the dharmic framework for ethical commerce and trade regulation',
    examples: [
      {
        source: 'Arthaśāstra 2.16',
        text: 'vāṇijya-mārgāṇām rakṣā',
        translation: 'Protection of trade routes'
      }
    ]
  },
  {
    id: 'nau',
    term: 'nau',
    iast: 'nau',
    devanagari: 'नौ',
    pronunciation: 'nau',
    meaning: 'Ship, boat, vessel',
    etymology: 'From PIE *nau- (boat), cognate with Greek naus, Latin navis',
    category: 'Vessels',
    sources: ['Rig Veda', 'Classical Sanskrit literature'],
    usage: 'Generic term for watercraft from small boats to large ships',
    relatedTerms: ['nāvā', 'potaka', 'drona'],
    culturalContext: 'Often metaphorically used for spiritual journey or crossing samsara',
    examples: [
      {
        source: 'Rig Veda 1.97.7',
        text: 'nāvā bhavanti navatir navatiś ca',
        translation: 'Let the ships be ninety-nine in number'
      }
    ]
  },
  {
    id: 'nava-adhyaksa',
    term: 'navādhyakṣa',
    iast: 'navādhyakṣa',
    devanagari: 'नवाध्यक्ष',
    pronunciation: 'na-vaa-dhyak-sha',
    meaning: 'Superintendent of shipping/navigation',
    etymology: 'nava (ship) + adhyakṣa (superintendent)',
    category: 'Administration',
    sources: ['Arthaśāstra'],
    usage: 'Official title for maritime administrator in Mauryan administration',
    relatedTerms: ['adhyakṣa', 'śulkādhyakṣa'],
    culturalContext: 'Represents sophisticated maritime governance in ancient Indian polity',
    examples: [
      {
        source: 'Arthaśāstra 2.28',
        text: 'navādhyakṣaḥ... potānāṃ śulkam gṛhṇīyāt',
        translation: 'The shipping superintendent... should collect customs on boats'
      }
    ]
  },
  {
    id: 'yavana',
    term: 'yavana',
    iast: 'yavana',
    devanagari: 'यवन',
    pronunciation: 'ya-va-na',
    meaning: 'Foreign trader/sailor, especially from the west (Greek/Roman)',
    etymology: 'From Yauna (Ionian Greeks) via Persian',
    category: 'Peoples',
    sources: ['Periplus', 'Sangam literature', 'Inscriptions'],
    usage: 'Term for western foreigners involved in Indian Ocean trade',
    relatedTerms: ['mleccha', 'paradesi'],
    culturalContext: 'Evolution from ethnic term to occupational category for maritime traders',
    examples: [
      {
        source: 'Pattinappālai',
        text: 'yavana kāppiṉ',
        translation: 'In the Yavana quarter (of Puhar port)'
      }
    ]
  },
  {
    id: 'angadi',
    term: 'angadi',
    iast: 'aṅgaḍi',
    devanagari: 'अंगडि',
    pronunciation: 'an-ga-di',
    meaning: 'Market, bazaar, trading post',
    etymology: 'From Dravidian root, borrowed into Sanskrit',
    category: 'Commerce',
    sources: ['South Indian inscriptions', 'Medieval texts'],
    usage: 'Regional term for organized marketplace in South India',
    relatedTerms: ['āpaṇa', 'haṭṭa', 'vīthī'],
    culturalContext: 'Reflects Dravidian-Sanskrit synthesis in commercial terminology',
    examples: [
      {
        source: 'Chola inscriptions',
        text: 'nagaraṅgaḍi',
        translation: 'Town market/merchant quarter'
      }
    ]
  },
  {
    id: 'pattinam',
    term: 'pattinam',
    iast: 'paṭṭinam',
    devanagari: 'पट्टिनम्',
    pronunciation: 'pat-ti-nam',
    meaning: 'Port city, trading settlement',
    etymology: 'From paṭṭa (trading settlement) + nam (place suffix)',
    category: 'Geography',
    sources: ['Sangam literature', 'South Indian inscriptions'],
    usage: 'South Indian term specifically for port towns with trade facilities',
    relatedTerms: ['pura', 'nagara', 'paṭṭaṇa'],
    culturalContext: 'Designates specialized maritime urban centers in Tamil tradition',
    examples: [
      {
        source: 'Sangam poetry',
        text: 'kāviripaṭṭinam',
        translation: 'Kāveri port-town (Puhar)'
      }
    ]
  },
  {
    id: 'arnava',
    term: 'arṇava',
    iast: 'arṇava',
    devanagari: 'अर्णव',
    pronunciation: 'ar-na-va',
    meaning: 'Ocean, especially in motion; surging sea',
    etymology: 'From ṛ (to move) + nava (water in motion)',
    category: 'Geography',
    sources: ['Vedic literature', 'Epic poetry'],
    usage: 'Poetic term emphasizing the dynamic, moving aspect of ocean waters',
    relatedTerms: ['samudra', 'sāgara', 'jalani dhi'],
    culturalContext: 'Often used in religious contexts to describe cosmic waters',
    examples: [
      {
        source: 'Ramayana',
        text: 'arṇavaṃ plavaṅgamo laṅghayiṣyati',
        translation: 'The monkey will leap across the ocean'
      }
    ]
  }
];

interface MaritimeLexiconProps {
  onTermClick?: (term: string) => void;
}

export function MaritimeLexicon({ onTermClick }: MaritimeLexiconProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<LexiconEntry | null>(null);

  const categories = [...new Set(MARITIME_LEXICON.map(entry => entry.category))];

  const filteredEntries = MARITIME_LEXICON.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.iast.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const playPronunciation = (term: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(term);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <IconScript size={32} className="text-ocean" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            <CulturalTermTooltip term="bhasha">
              Maritime Lexicon
            </CulturalTermTooltip>
          </h2>
          <IconOm size={32} className="text-saffron" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Indic terms for maritime concepts from <CulturalTermTooltip term="samudra">ocean cosmology</CulturalTermTooltip> to 
          port administration, traced through Vedic hymns, classical treatises, and merchant inscriptions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search terms, meanings, or IAST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terms List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className={`cursor-pointer transition-all duration-300 hover:border-primary/30 ${
                selectedEntry?.id === entry.id ? 'border-primary bg-primary/5' : 'bg-card/50 backdrop-blur-sm'
              }`}
              onClick={() => setSelectedEntry(entry)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-serif flex items-center gap-3">
                      <span className="text-ocean">{entry.term}</span>
                      {entry.devanagari && (
                        <span className="text-saffron text-xl">{entry.devanagari}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation(entry.pronunciation || entry.term);
                        }}
                        className="p-1 h-6"
                      >
                        <Volume2 size={14} />
                      </Button>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>IAST: <span className="font-mono">{entry.iast}</span></div>
                      {entry.pronunciation && (
                        <div>Pronunciation: <span className="italic">{entry.pronunciation}</span></div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {entry.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-foreground/90 mb-3">
                  <strong>{entry.meaning}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Etymology: {entry.etymology}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedEntry ? (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconDharmaChakra size={20} className="text-saffron" />
                  Term Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <h3 className="text-xl font-serif text-ocean mb-1">{selectedEntry.term}</h3>
                  {selectedEntry.devanagari && (
                    <div className="text-2xl text-saffron mb-2">{selectedEntry.devanagari}</div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    /{selectedEntry.pronunciation || selectedEntry.iast}/
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Meaning</h4>
                  <p className="text-sm text-muted-foreground">{selectedEntry.meaning}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Etymology</h4>
                  <p className="text-sm text-muted-foreground">{selectedEntry.etymology}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Usage</h4>
                  <p className="text-sm text-muted-foreground">{selectedEntry.usage}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Cultural Context</h4>
                  <p className="text-sm text-muted-foreground">{selectedEntry.culturalContext}</p>
                </div>

                {selectedEntry.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Related Terms</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedEntry.relatedTerms.map((term, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-foreground mb-2">Primary Sources</h4>
                  <div className="space-y-1">
                    {selectedEntry.sources.map((source, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <BookOpen size={12} />
                        {source}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEntry.examples.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Examples</h4>
                    <div className="space-y-3">
                      {selectedEntry.examples.map((example, idx) => (
                        <div key={idx} className="text-xs bg-muted/50 p-3 rounded-lg">
                          <div className="font-medium text-foreground mb-1">{example.source}</div>
                          <div className="font-mono text-ocean mb-1">{example.text}</div>
                          <div className="text-muted-foreground italic">"{example.translation}"</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50">
              <CardContent className="pt-6 text-center">
                <IconScript size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a term to view detailed etymology, usage, and examples
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No terms match your search criteria.</p>
        </div>
      )}
    </div>
  );
}