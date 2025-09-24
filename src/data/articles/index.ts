import { LocalizedArticle } from '@/types/multilingual';
import { ashokaKandaharEdicts } from './ashoka-kandahar-edicts';
import { scriptsThatSailed } from './scripts-that-sailed';
import { kutaiYupaBorneo } from './kutai-yupa-borneo';
import { monsoonTradeClock } from './monsoon-trade-clock';
import { pepperAndBullion } from './pepper-and-bullion';
import { cholaNavalRaid } from './chola-naval-raid';
import { ridersOnMonsoon } from './riders-on-monsoon';
import { gondwanaToHimalaya } from './gondwana-to-himalaya';
import { indianOceanPowerNetworks } from './indian-ocean-power-networks';
import { earthSeaSangam } from './earth-sea-sangam';
import { maritimeMemoriesSouthIndiaArticle } from './maritime-memories-south-india';

// Complete multilingual article registry
export const MULTILINGUAL_ARTICLES: LocalizedArticle[] = [
  maritimeMemoriesSouthIndiaArticle,
  scriptsThatSailed,
  ridersOnMonsoon,
  monsoonTradeClock,
  gondwanaToHimalaya,
  indianOceanPowerNetworks,
  ashokaKandaharEdicts,
  kutaiYupaBorneo,
  cholaNavalRaid,
  pepperAndBullion,
  earthSeaSangam
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
  '/kutai-yupa-borneo': 'kutai-yupa-borneo',
  '/chola-naval-raid': 'chola-naval-raid',
  '/pepper-and-bullion': 'pepper-and-bullion',
  '/earth-sea-sangam': 'earth-sea-sangam'
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
    author: 'Prof. Ahmed Hassan',
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
  }
};

export { type LocalizedArticle };