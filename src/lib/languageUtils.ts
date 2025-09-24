import { SupportedLanguage, supportedLanguages } from './i18n';

/**
 * Normalizes locale codes to supported language codes
 * e.g., 'en-US' -> 'en', 'ta-IN' -> 'ta'
 */
export const normalizeLanguageCode = (languageCode: string): SupportedLanguage => {
  if (!languageCode) return 'en';
  
  // Extract the primary language code (before any '-')
  const primaryCode = languageCode.split('-')[0].toLowerCase();
  
  // Check if the primary code is supported
  if (primaryCode in supportedLanguages) {
    return primaryCode as SupportedLanguage;
  }
  
  // Fallback to English
  return 'en';
};

/**
 * Safely gets language info with fallback
 */
export const getLanguageInfo = (languageCode: string) => {
  const normalizedCode = normalizeLanguageCode(languageCode);
  return supportedLanguages[normalizedCode] || supportedLanguages.en;
};

/**
 * Gets script font class with fallback
 */
export const getScriptFont = (languageCode: string): string => {
  const langInfo = getLanguageInfo(languageCode);
  const fontMap = {
    tamil: 'font-tamil',
    telugu: 'font-telugu',
    kannada: 'font-kannada',
    bengali: 'font-bengali',
    assamese: 'font-assamese',
    devanagari: 'font-hindi',
    gurmukhi: 'font-punjabi',
    latin: 'font-sans'
  };
  return fontMap[langInfo.script as keyof typeof fontMap] || 'font-sans';
};