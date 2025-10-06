import { LocalizedArticle } from '@/types/multilingual';
import { ashokaKandaharEdictsComplete } from './ashoka-kandahar-edicts-complete';
import { reassessingAshokaLegacy } from './reassessing-ashoka-legacy';
import { scriptsThatSailed } from './scripts-that-sailed';
import { kutaiYupaBorneo } from './kutai-yupa-borneo';
import { monsoonTradeClock } from './monsoon-trade-clock';
import { pepperAndBullion } from './pepper-and-bullion';
import { cholaNavalRaid } from './chola-naval-raid';
import { ridersOnMonsoonComplete } from './riders-on-monsoon-complete';
import { gondwanaToHimalaya } from './gondwana-to-himalaya';
import { indianOceanPowerNetworksComplete } from './indian-ocean-power-networks-complete';
import { earthSeaSangam } from './earth-sea-sangam';
import { maritimeMemoriesSouthIndiaComplete } from './maritime-memories-south-india-complete';
import { jambudvipaConnected } from './jambudvipa-connected';
import { cosmicIslandSacredLand } from './cosmic-island-sacred-land';
import { stonePurana } from './stone-purana';
import { scriptsThatSailedII } from './scripts-that-sailed-ii';
import { janajatiOralTraditions } from './janajati-oral-traditions';
import { stoneSongAndSea } from './stone-song-and-sea';
import { sacredTreeHarvestRhythms } from './sacred-tree-harvest-rhythms';

// Complete multilingual article registry
export const MULTILINGUAL_ARTICLES: LocalizedArticle[] = [
  maritimeMemoriesSouthIndiaComplete,
  scriptsThatSailed,
  ridersOnMonsoonComplete,
  monsoonTradeClock,
  gondwanaToHimalaya,
  indianOceanPowerNetworksComplete,
  ashokaKandaharEdictsComplete,
  reassessingAshokaLegacy,
  kutaiYupaBorneo,
  cholaNavalRaid,
  pepperAndBullion,
  earthSeaSangam,
  jambudvipaConnected,
  cosmicIslandSacredLand,
  stonePurana,
  scriptsThatSailedII,
  janajatiOralTraditions,
  sacredTreeHarvestRhythms,
  stoneSongAndSea
];

// Mapping from legacy slugs to multilingual article IDs
export const SLUG_TO_ID_MAP: Record<string, string> = {
  '/maritime-memories-south-india': 'maritime-memories-south-india',
  '/scripts-that-sailed': 'scripts-that-sailed',
  '/riders-on-monsoon': 'riders-on-monsoon',
  '/monsoon-trade-clock': 'monsoon-trade-clock',
  '/gondwana-to-himalaya': 'gondwana-to-himalaya',
  '/indian-ocean-power-networks': 'indian-ocean-power-networks',
  '/ashoka-kandahar-edicts': 'ashoka-kandahar-edicts',
  '/reassessing-ashoka-legacy': 'reassessing-ashoka-legacy',
  '/kutai-yupa-borneo': 'kutai-yupa-borneo',
  '/chola-naval-raid': 'chola-naval-raid',
  '/pepper-and-bullion': 'pepper-and-bullion',
  '/earth-sea-sangam': 'earth-sea-sangam',
  '/jambudvipa-connected': 'jambudvipa-connected',
  '/cosmic-island-sacred-land': 'cosmic-island-sacred-land',
  '/stone-purana': 'stone-purana',
  '/scripts-that-sailed-ii': 'scripts-that-sailed-ii',
  '/janajati-oral-traditions': 'janajati-oral-traditions',
  '/sacred-tree-harvest-rhythms': 'sacred-tree-harvest-rhythms',
  '/stone-song-and-sea': 'stone-song-and-sea'
};

// Article metadata for display (readTime, author, date)
export const ARTICLE_METADATA: Record<string, {
  readTime: number;
  author: string;
  date: string;
  theme: string;
}> = {
  'maritime-memories-south-india': {
    readTime: 18,
    author: 'Nartiang Foundation',
    date: '2024-03-15',
    theme: 'Ancient India'
  },
  'scripts-that-sailed': {
    readTime: 28,
    author: 'Kanika Rakesh',
    date: '2024-03-08',
    theme: 'Indian Ocean World'
  },
  'riders-on-monsoon': {
    readTime: 16,
    author: 'Nartiang Foundation',
    date: '2024-03-25',
    theme: 'Indian Ocean World'
  },
  'monsoon-trade-clock': {
    readTime: 8,
    author: 'Mrs. Rekha Bansal, MA History',
    date: '2024-03-12',
    theme: 'Indian Ocean World'
  },
  'gondwana-to-himalaya': {
    readTime: 10,
    author: 'Dr. Geological Survey',
    date: '2024-03-05',
    theme: 'Geology & Deep Time'
  },
  'indian-ocean-power-networks': {
    readTime: 24,
    author: 'Nartiang Foundation',
    date: '2024-03-28',
    theme: 'Empires & Exchange'
  },
  'ashoka-kandahar-edicts': {
    readTime: 5,
    author: 'Dr. Epigraphy Specialist',
    date: '2024-03-18',
    theme: 'Ancient India'
  },
  'reassessing-ashoka-legacy': {
    readTime: 12,
    author: 'Nartiang Foundation Research Team',
    date: '2025-10-06',
    theme: 'Ancient India'
  },
  'kutai-yupa-borneo': {
    readTime: 8,
    author: 'Dr. Epigraphic Studies',
    date: '2024-03-22',
    theme: 'Scripts & Inscriptions'
  },
  'chola-naval-raid': {
    readTime: 12,
    author: 'Nartiang Foundation',
    date: '2024-03-20',
    theme: 'Empires & Exchange'
  },
  'pepper-and-bullion': {
    readTime: 14,
    author: 'Nartiang Foundation',
    date: '2024-03-10',
    theme: 'Ancient India'
  },
  'earth-sea-sangam': {
    readTime: 16,
    author: 'Nartiang Foundation',
    date: '2024-03-28',
    theme: 'Geology & Deep Time'
  },
  'jambudvipa-connected': {
    readTime: 35,
    author: 'Nartiang Foundation',
    date: '2025-09-28',
    theme: 'Ancient India'
  },
  'cosmic-island-sacred-land': {
    readTime: 42,
    author: 'Research Team',
    date: '2025-10-02',
    theme: 'Ancient India'
  },
  'stone-purana': {
    readTime: 38,
    author: 'Nartiang Foundation Geo-Heritage Team',
    date: '2025-10-03',
    theme: 'Geology & Deep Time'
  },
  'scripts-that-sailed-ii': {
    readTime: 45,
    author: 'Kanika Rakesh',
    date: '2025-10-04',
    theme: 'Scripts & Inscriptions'
  },
  'janajati-oral-traditions': {
    readTime: 42,
    author: 'Nartiang Foundation Research Team',
    date: '2025-10-05',
    theme: 'Ancient India'
  },
  'sacred-tree-harvest-rhythms': {
    readTime: 26,
    author: 'Nartiang Foundation Research Team',
    date: '2025-10-06',
    theme: 'Ancient India'
  },
  'stone-song-and-sea': {
    readTime: 32,
    author: 'Nartiang Foundation Research Team',
    date: '2025-10-06',
    theme: 'Ancient India'
  }
};

export { type LocalizedArticle };