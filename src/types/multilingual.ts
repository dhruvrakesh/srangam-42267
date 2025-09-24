import { SupportedLanguage } from '@/lib/i18n';

export type { SupportedLanguage };

export interface MultilingualContent {
  [key: string]: string | MultilingualContent;
}

export interface TranslationMetadata {
  translatedBy?: string;
  reviewedBy?: string;
  lastUpdated?: string;
  confidence?: number;
  culturalNotes?: string[];
}

export interface LocalizedArticle {
  id: string;
  title: MultilingualContent;
  dek: MultilingualContent;
  content: MultilingualContent;
  tags: MultilingualContent[];
  metadata: {
    [K in SupportedLanguage]?: TranslationMetadata;
  };
}

export interface CulturalTerm {
  term: string;
  translations: {
    [K in SupportedLanguage]?: {
      translation: string;
      transliteration?: string;
      etymology?: string;
      culturalContext?: string;
    };
  };
}

export interface LanguagePreferences {
  primaryLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  showTransliterations: boolean;
  showCulturalContext: boolean;
  fontSizeAdjustment: number;
}