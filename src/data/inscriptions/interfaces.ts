// Core interfaces for systematic inscription management
export interface GeographicLocation {
  ancient: string;
  modern: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  region: string;
  description?: string;
}

export interface HistoricalPeriod {
  dynasty: string;
  ruler?: string;
  century: string;
  dating: {
    approximate: string;
    precise?: string;
    method: 'paleographic' | 'archaeological' | 'historical' | 'astronomical';
  };
}

export interface ScriptVariant {
  scriptType: 'brahmic' | 'greek' | 'aramaic' | 'kharoshthi' | 'cuneiform';
  subType?: string; // e.g., 'pallava', 'grantha', 'southern-brahmic'
  text: string;
  transliteration?: string;
  translation: string;
  direction: 'ltr' | 'rtl' | 'vertical';
  rendering: 'transliteration' | 'native' | 'both';
}

export interface TranslationSet {
  primary: string;
  literal?: string;
  contextual?: string;
  scholarly?: string;
  notes?: string[];
}

export interface CulturalSignificance {
  ritualContext?: string;
  politicalContext?: string;
  linguisticFeatures?: string[];
  historicalImportance?: string;
  comparativeAnalysis?: string[];
}

export interface ComponentConfig {
  type: 'script-viewer' | 'pillar-visualization' | 'contextual-sidebar' | 'translation-panel';
  props: Record<string, any>;
}

export interface VedicPeriod {
  phase: 'early-vedic' | 'late-vedic' | 'post-vedic';
  characteristics: string[];
}

export interface BuddhistPeriod {
  phase: 'early-buddhist' | 'classical-buddhist' | 'later-buddhist';
  characteristics: string[];
}

export interface ClassicalPeriod {
  phase: 'mauryan' | 'gupta' | 'post-gupta';
  characteristics: string[];
}

export interface RegionalContext {
  culturalArea: string;
  tradingNetworks: string[];
  linguisticInfluences: string[];
}

export interface SanskritFeatures {
  meter?: string;
  genre: 'prashasti' | 'dharma-shastra' | 'kavya' | 'inscription' | 'administrative';
  linguisticFeatures: string[];
}

export interface PrakritFeatures {
  dialect: string;
  characteristics: string[];
}

export interface PaleographicAnalysis {
  scriptEvolution: string;
  comparativeScripts: string[];
  dating: {
    period: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

export interface CulturalContext {
  ritualSignificance?: string;
  historicalPeriod: VedicPeriod | BuddhistPeriod | ClassicalPeriod;
  geographicRelevance: RegionalContext;
  linguisticFeatures: SanskritFeatures | PrakritFeatures;
  scriptEvolution: PaleographicAnalysis;
}

// Main inscription interface
export interface InscriptionShastra {
  id: string;
  title: string;
  location: GeographicLocation;
  period: HistoricalPeriod;
  scripts: ScriptVariant[];
  translations: TranslationSet;
  significance: CulturalSignificance;
  culturalContext: CulturalContext;
  visualComponents: ComponentConfig[];
  tags: string[];
  bibliography?: string[];
  relatedInscriptions?: string[];
}

// Registry interface for managing collections
export interface InscriptionRegistry {
  inscriptions: InscriptionShastra[];
  getById: (id: string) => InscriptionShastra | undefined;
  getByTags: (tags: string[]) => InscriptionShastra[];
  getByRegion: (region: string) => InscriptionShastra[];
  getByPeriod: (period: string) => InscriptionShastra[];
  search: (query: string) => InscriptionShastra[];
}