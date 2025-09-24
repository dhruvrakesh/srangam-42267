import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en/common.json';
import taTranslations from '../locales/ta/common.json';
import teTranslations from '../locales/te/common.json';
import knTranslations from '../locales/kn/common.json';
import bnTranslations from '../locales/bn/common.json';
import asTranslations from '../locales/as/common.json';
import pnTranslations from '../locales/pn/common.json';
import hiTranslations from '../locales/hi/common.json';
import paTranslations from '../locales/pa/common.json';

export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', script: 'latin' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', script: 'tamil' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', script: 'telugu' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'kannada' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', script: 'bengali' },
  as: { name: 'Assamese', nativeName: 'অসমীয়া', script: 'assamese' },
  pn: { name: 'Pnar', nativeName: 'Pnar', script: 'latin' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'gurmukhi' }
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

const resources = {
  en: { translation: enTranslations },
  ta: { translation: taTranslations },
  te: { translation: teTranslations },
  kn: { translation: knTranslations },
  bn: { translation: bnTranslations },
  as: { translation: asTranslations },
  pn: { translation: pnTranslations },
  hi: { translation: hiTranslations },
  pa: { translation: paTranslations }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'srangam-language'
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });

export default i18n;