export interface FossilWorshipSite {
  id: string;
  name: string;
  coordinates: [number, number];
  state: string;
  fossilType: string;
  geologicalAge: string;
  deityAssociation: string;
  culturalPractice: string;
  confidenceRating: 'A' | 'B' | 'C' | 'D';
  confidenceExplanation: string;
  sources: string[];
  stillWorshipped: boolean;
}

export interface ConfidenceLevel {
  rating: 'A' | 'B' | 'C' | 'D';
  label: string;
  color: string;
  criteria: string;
}

export const confidenceLevels: ConfidenceLevel[] = [
  {
    rating: 'A',
    label: 'Definitive',
    color: '#10b981',
    criteria: 'Direct worship of identified fossils with documented tradition'
  },
  {
    rating: 'B',
    label: 'Probable',
    color: '#eab308',
    criteria: 'Strong correlation between geological finds and cultural practices'
  },
  {
    rating: 'C',
    label: 'Possible',
    color: '#f97316',
    criteria: 'Suggestive but circumstantial evidence requiring further research'
  },
  {
    rating: 'D',
    label: 'Speculative',
    color: '#ef4444',
    criteria: 'Hypothetical links based on topographic or toponymic associations'
  }
];

export const fossilWorshipSites: FossilWorshipSite[] = [
  {
    id: 'gandaki',
    name: 'Gandaki River',
    coordinates: [27.7, 83.4],
    state: 'Nepal',
    fossilType: 'Ammonite fossils (Śāligrāma stones)',
    geologicalAge: 'Jurassic-Cretaceous (200-65 Ma)',
    deityAssociation: 'Viṣṇu',
    culturalPractice: 'Ritual worship in household shrines, bathing in Gandaki considered purifying',
    confidenceRating: 'A',
    confidenceExplanation: 'Definitive: Ammonites are directly worshipped as Viṣṇu manifestations, with extensive textual documentation',
    sources: [
      'Mayor, A. (2005). Fossil Legends of the First Americans',
      'Bhattacharya, S. (1977). Śāligrāma in Hindu Ritual'
    ],
    stillWorshipped: true
  },
  {
    id: 'dhar-jhabua',
    name: 'Dhar-Jhabua Region',
    coordinates: [22.6, 74.9],
    state: 'Madhya Pradesh',
    fossilType: 'Titanosaur dinosaur eggs',
    geologicalAge: 'Late Cretaceous (70-65 Ma)',
    deityAssociation: 'Kākad Bhairav / Bhilat Baba',
    culturalPractice: 'Spherical stones in village shrines receive offerings; called "divine eggs"',
    confidenceRating: 'B',
    confidenceExplanation: 'Probable: Egg-shaped stones match titanosaur eggs from Lameta Formation; worship documented in local tradition',
    sources: [
      'Mohabey, D. (1996). Dinosaur eggs from Lameta Formation',
      'Local ethnographic surveys (2010-2015)'
    ],
    stillWorshipped: true
  },
  {
    id: 'hathnora',
    name: 'Hathnora (Narmada Valley)',
    coordinates: [22.8, 77.6],
    state: 'Madhya Pradesh',
    fossilType: 'Archaic Homo skull fragments, megafauna bones',
    geologicalAge: 'Middle Pleistocene (300,000 BP)',
    deityAssociation: 'Daitya (demon) legends',
    culturalPractice: 'Oral traditions of giant bones as demon remains; no active worship',
    confidenceRating: 'C',
    confidenceExplanation: 'Possible: Large fossilized bones interpreted as giants/demons, but active worship tradition unclear',
    sources: [
      'Sonakia, A. (1984). Narmada Homo erectus',
      'Local folklore compilations'
    ],
    stillWorshipped: false
  },
  {
    id: 'siwalik',
    name: 'Siwalik Hills',
    coordinates: [30.5, 77.8],
    state: 'Himachal Pradesh',
    fossilType: 'Stegodon, mammoth, giraffe bones',
    geologicalAge: 'Miocene-Pliocene (23-2.5 Ma)',
    deityAssociation: 'Gajendra (elephant avatāra of Viṣṇu)',
    culturalPractice: 'Shrines placed near fossil beds; bones considered sacred',
    confidenceRating: 'B',
    confidenceExplanation: 'Probable: Fossilized elephant ancestors venerated; geographical overlap of shrines and fossil sites',
    sources: [
      'Mayor, A. (2000). The First Fossil Hunters',
      'Sahni, A. (1968). Siwalik vertebrates'
    ],
    stillWorshipped: true
  },
  {
    id: 'aakal',
    name: 'Aakal Wood Fossil Park',
    coordinates: [26.9, 70.9],
    state: 'Rajasthan',
    fossilType: 'Petrified wood',
    geologicalAge: 'Jurassic (180 Ma)',
    deityAssociation: 'Banbura Devi (forest goddess)',
    culturalPractice: 'Sacred grove overlapping fossil site; tree deity worship during annual festival',
    confidenceRating: 'C',
    confidenceExplanation: 'Possible: Petrified wood may inspire tree goddess cult, but direct worship connection uncertain',
    sources: [
      'GSI reports on Aakal fossil park',
      'Local festival documentation'
    ],
    stillWorshipped: true
  },
  {
    id: 'barmer',
    name: 'Barmer',
    coordinates: [25.8, 71.4],
    state: 'Rajasthan',
    fossilType: 'Dinosaur footprints',
    geologicalAge: 'Late Cretaceous (70 Ma)',
    deityAssociation: 'Rāmapada (Rāma\'s footprints)',
    culturalPractice: 'Large footprints attributed to Rāma; pilgrimage site but not formal worship',
    confidenceRating: 'D',
    confidenceExplanation: 'Speculative: Reinterpretation of dinosaur tracks as mythological footprints; no dedicated ritual',
    sources: [
      'GSI dinosaur trackway surveys',
      'Local oral traditions'
    ],
    stillWorshipped: false
  },
  {
    id: 'kutch',
    name: 'Kutch',
    coordinates: [23.4, 69.8],
    state: 'Gujarat',
    fossilType: 'Marine fossils (ammonites, bivalves)',
    geologicalAge: 'Jurassic (180-150 Ma)',
    deityAssociation: 'Jalodbhava (water-born deities)',
    culturalPractice: 'Coastal shrines in former seabed area; oral lore of sea-birth',
    confidenceRating: 'C',
    confidenceExplanation: 'Possible: Marine fossils in arid region may inspire water-deity myths, but connection indirect',
    sources: [
      'Krishna, J. (1987). Kutch fossils',
      'Ethnographic field notes'
    ],
    stillWorshipped: true
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya Coal Fields',
    coordinates: [25.5, 91.4],
    state: 'Meghalaya',
    fossilType: 'Plant fossils in coal seams',
    geologicalAge: 'Eocene (50 Ma)',
    deityAssociation: 'Ka Sngi (sacred stones)',
    culturalPractice: 'Monolith worship by Khasi tribe; some monoliths may contain plant impressions',
    confidenceRating: 'D',
    confidenceExplanation: 'Speculative: Sacred stones possibly include fossiliferous rocks, but unverified',
    sources: [
      'Sahni, B. (1936). Eocene flora of India',
      'Khasi cultural studies'
    ],
    stillWorshipped: true
  }
];
