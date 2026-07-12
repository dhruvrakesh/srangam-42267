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
import { asuraExilesIndoIranian } from './asura-exiles-indo-iranian';
import { sariraAndAtmanVedicPreservation } from './sarira-and-atman-vedic-preservation';
import { rishiGenealogiesVedicTradition } from './rishi-genealogies-vedic-tradition';
import { reassessingRigvedaAntiquity } from './reassessing-rigveda-antiquity';
import { geomythologyLandReclamation } from './geomythology-land-reclamation';
import { dashanamiAsceticsSacredGeography } from './dashanami-ascetics-sacred-geography';
import { continuousHabitationUttarapatha } from './continuous-habitation-uttarapatha';
import { somnathaPrabhasaItihasa } from './somnatha-prabhasa-itihasa';
import { ringingRocksRhythmicCosmology } from './ringing-rocks-rhythmic-cosmology';

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
  stoneSongAndSea,
  asuraExilesIndoIranian,
  sariraAndAtmanVedicPreservation,
  rishiGenealogiesVedicTradition,
  reassessingRigvedaAntiquity,
  geomythologyLandReclamation,
  dashanamiAsceticsSacredGeography,
  continuousHabitationUttarapatha,
  somnathaPrabhasaItihasa,
  ringingRocksRhythmicCosmology
];

// Phase 1.1 (2026-07-12, Enterprise Roadmap): SLUG_TO_ID_MAP and
// ARTICLE_METADATA moved to ./meta.ts (lightweight, entry-bundle-safe)
// and re-exported here for backwards compatibility.
//
// WARNING: importing THIS module pulls all 28 full article bodies
// (~1.4 MB pre-gzip) into the importing chunk. Eager/entry code must
// import from '@/data/articles/meta' instead. Remaining legitimate
// consumers of the full registry: searchEngine.ts (lazy Search chunk)
// and MultilingualSearchResults.tsx.
export { SLUG_TO_ID_MAP, ARTICLE_METADATA, ARTICLE_CARDS, ARTICLE_CONTENT_LOADERS } from './meta';
export type { ArticleCardMeta } from './meta';
