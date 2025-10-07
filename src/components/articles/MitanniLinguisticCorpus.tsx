import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';

interface LinguisticEntry {
  category: 'Royal Name' | 'Divine Name' | 'Equestrian' | 'Numeral';
  cuneiform: string;
  indoAryan: string;
  vedicSanskrit: string;
  meaning: string;
  implication: string;
}

const linguisticData: LinguisticEntry[] = [
  {
    category: 'Royal Name',
    cuneiform: 'tu-iš-e-rat-ta',
    indoAryan: '*Tvaišaratha',
    vedicSanskrit: 'Tveṣaratha',
    meaning: '"Whose chariot is vehement"',
    implication: 'Name clearly of Indo-Aryan derivation'
  },
  {
    category: 'Royal Name',
    cuneiform: 'bi-ir-ya-ma-aš-da',
    indoAryan: '*Priyamazdha',
    vedicSanskrit: 'Priyamedha',
    meaning: '"Whose wisdom is dear"',
    implication: 'Preserves archaic /zdh/ cluster suggesting early dialect'
  },
  {
    category: 'Royal Name',
    cuneiform: 'ar-ta-šu-ma-ra',
    indoAryan: '*Ṛta-smara',
    vedicSanskrit: 'Ṛta-smara',
    meaning: '"Who remembers Cosmic Order"',
    implication: 'Contains Vedic concept of Ṛta (cosmic truth)'
  },
  {
    category: 'Royal Name',
    cuneiform: 'ar-ta-ta-ma',
    indoAryan: '*Ṛta-dhāman',
    vedicSanskrit: 'Ṛta-dhāman',
    meaning: '"Abode of Ṛta"',
    implication: 'Royal name incorporating fundamental Vedic concept'
  },
  {
    category: 'Divine Name',
    cuneiform: 'mi-it-ra',
    indoAryan: '*Mitra',
    vedicSanskrit: 'Mitra',
    meaning: 'God of covenants and contracts',
    implication: 'Part of archaic Vedic pantheon, pre-schism'
  },
  {
    category: 'Divine Name',
    cuneiform: 'a-ru-ṇa / ú-ru-wa-na',
    indoAryan: '*Varuṇa',
    vedicSanskrit: 'Varuṇa',
    meaning: 'God of Cosmic Order (Asura)',
    implication: 'Pre-schism Vedic deity, later demonized'
  },
  {
    category: 'Divine Name',
    cuneiform: 'in-da-ra',
    indoAryan: '*Indara',
    vedicSanskrit: 'Indra',
    meaning: 'God of Storms (Deva)',
    implication: 'Chief god of Rigveda, later demonized in Avesta'
  },
  {
    category: 'Divine Name',
    cuneiform: 'na-ša-at-ti-ya-an-na',
    indoAryan: '*Nāsatya',
    vedicSanskrit: 'Nāsatya (Ashvins)',
    meaning: 'Divine twin horsemen',
    implication: 'Vedic divine twins, physicians of gods'
  },
  {
    category: 'Equestrian',
    cuneiform: 'a-i-ka-wartanna',
    indoAryan: '*aika-vartana',
    vedicSanskrit: 'eka-vartana',
    meaning: '"One turn" (lap)',
    implication: 'Form *aika specifically Indo-Aryan, not general Indo-Iranian'
  },
  {
    category: 'Equestrian',
    cuneiform: 'ti-e-ra-wartanna',
    indoAryan: '*tera-vartana',
    vedicSanskrit: 'tri-vartana',
    meaning: '"Three turns"',
    implication: 'Shows Prakritic evolution before migration'
  },
  {
    category: 'Equestrian',
    cuneiform: 'pa-an-za-wartanna',
    indoAryan: '*panza-vartana',
    vedicSanskrit: 'pañca-vartana',
    meaning: '"Five turns"',
    implication: 'Affricate /z/ suggests Prakritic or Middle-Indo-Aryan influence'
  },
  {
    category: 'Equestrian',
    cuneiform: 'ša-at-ta-wartanna',
    indoAryan: '*šatta-vartana',
    vedicSanskrit: 'sapta-vartana',
    meaning: '"Seven turns"',
    implication: 'Assimilation /pt/ to /tt/ is Prakritic feature, indicating Indian origin'
  },
  {
    category: 'Equestrian',
    cuneiform: 'na-wa-wartanna',
    indoAryan: '*nava-vartana',
    vedicSanskrit: 'nava-vartana',
    meaning: '"Nine turns"',
    implication: 'Clear Sanskrit cognate in horse-training terminology'
  },
  {
    category: 'Numeral',
    cuneiform: 'a-i-ka',
    indoAryan: '*aika',
    vedicSanskrit: 'eka',
    meaning: 'One',
    implication: 'Indo-Aryan specific form (cf. Iranian *aiva)'
  },
  {
    category: 'Numeral',
    cuneiform: 'ti-e-ra',
    indoAryan: '*tera',
    vedicSanskrit: 'tri',
    meaning: 'Three',
    implication: 'Prakritic evolution of Sanskrit tri'
  },
  {
    category: 'Numeral',
    cuneiform: 'pa-an-za',
    indoAryan: '*panza',
    vedicSanskrit: 'pañca',
    meaning: 'Five',
    implication: 'Shows characteristic Indo-Aryan sound changes'
  },
  {
    category: 'Numeral',
    cuneiform: 'ša-at-ta',
    indoAryan: '*šatta',
    vedicSanskrit: 'sapta',
    meaning: 'Seven',
    implication: 'Classic Prakritic assimilation pattern'
  },
  {
    category: 'Numeral',
    cuneiform: 'na-wa',
    indoAryan: '*nava',
    vedicSanskrit: 'nava',
    meaning: 'Nine',
    implication: 'Direct Sanskrit cognate'
  }
];

const categories: LinguisticEntry['category'][] = ['Royal Name', 'Divine Name', 'Equestrian', 'Numeral'];

const categoryColors: Record<LinguisticEntry['category'], string> = {
  'Royal Name': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Divine Name': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Equestrian': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'Numeral': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
};

export const MitanniLinguisticCorpus: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<LinguisticEntry['category']>>(new Set(categories));

  const filteredData = useMemo(() => {
    return linguisticData.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        Object.values(entry).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesCategory = activeCategories.has(entry.category);
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategories]);

  const toggleCategory = (category: LinguisticEntry['category']) => {
    const newCategories = new Set(activeCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setActiveCategories(newCategories);
  };

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle className="text-2xl">The Mitanni Indo-Aryan Linguistic Corpus</CardTitle>
        <CardDescription>
          Searchable database of Indo-Aryan linguistic evidence from Mitanni sources (c. 1500-1300 BCE)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by cuneiform, Sanskrit, meaning, or implication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Categories:</span>
            {categories.map(category => (
              <Badge
                key={category}
                variant={activeCategories.has(category) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  activeCategories.has(category) ? categoryColors[category] : ''
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredData.length} of {linguisticData.length} entries
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Cuneiform</th>
                <th className="text-left p-3 font-semibold">Reconstructed Indo-Aryan</th>
                <th className="text-left p-3 font-semibold">Vedic Sanskrit</th>
                <th className="text-left p-3 font-semibold">Meaning</th>
                <th className="text-left p-3 font-semibold">Implication</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <Badge variant="outline" className={categoryColors[entry.category]}>
                      {entry.category}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{entry.cuneiform}</code>
                  </td>
                  <td className="p-3">
                    <code className="text-sm font-semibold text-primary">{entry.indoAryan}</code>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-primary">{entry.vedicSanskrit}</span>
                  </td>
                  <td className="p-3 text-sm">{entry.meaning}</td>
                  <td className="p-3 text-sm text-muted-foreground italic">{entry.implication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {filteredData.map((entry, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className={categoryColors[entry.category]}>
                    {entry.category}
                  </Badge>
                </div>
                <CardTitle className="text-base">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{entry.cuneiform}</code>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Reconstructed:</span>
                    <div className="font-mono font-semibold text-primary">{entry.indoAryan}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Vedic Sanskrit:</span>
                    <div className="font-semibold text-primary">{entry.vedicSanskrit}</div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Meaning:</span>
                  <div>{entry.meaning}</div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Implication:</span>
                  <div className="italic text-muted-foreground">{entry.implication}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No entries match your search criteria.</p>
            <p className="text-sm mt-2">Try adjusting your search or category filters.</p>
          </div>
        )}

        {/* Source Note */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Primary Sources:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Suppiluliuma-Shattiwaza Treaty (c. 1380 BCE) - Divine names</li>
            <li>Kikkuli Horse Training Manual (c. 1350 BCE) - Equestrian terminology and numerals</li>
            <li>Mitanni Royal Seals and Correspondence - Royal names</li>
          </ul>
          <p className="mt-3">
            <strong>Note:</strong> The presence of Prakritic sound changes (e.g., sapta → šatta) in the Mitanni corpus 
            suggests these emigrants left India after initial Middle Indo-Aryan developments had begun, 
            supporting a post-Harappan but pre-Iron Age migration date.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
