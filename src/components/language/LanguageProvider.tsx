import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';
import { SupportedLanguage, supportedLanguages } from '@/lib/i18n';
import { LanguagePreferences } from '@/types/multilingual';
import { I18nLoadingBoundary } from './I18nLoadingBoundary';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  preferences: LanguagePreferences;
  updatePreferences: (updates: Partial<LanguagePreferences>) => void;
  changeLanguage: (language: SupportedLanguage) => void;
  getScriptFont: (language?: SupportedLanguage) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const { preferences, updatePreferences } = useLanguagePreferences();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const currentLanguage = (i18n.language || 'en') as SupportedLanguage;

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInit = () => setIsInitialized(true);
      i18n.on('initialized', handleInit);
      return () => i18n.off('initialized', handleInit);
    }
  }, [i18n]);

  const changeLanguage = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    updatePreferences({ primaryLanguage: language });
  };

  const getScriptFont = (language: SupportedLanguage = currentLanguage) => {
    const script = supportedLanguages[language]?.script;
    const fontMap = {
      tamil: 'font-tamil',
      telugu: 'font-telugu',
      kannada: 'font-kannada',
      bengali: 'font-bengali',
      assamese: 'font-assamese',
      latin: 'font-sans'
    };
    return fontMap[script as keyof typeof fontMap] || 'font-sans';
  };

  // Apply font size adjustments
  useEffect(() => {
    if (preferences.fontSizeAdjustment !== 0) {
      document.documentElement.style.fontSize = `${16 + preferences.fontSizeAdjustment}px`;
    } else {
      document.documentElement.style.fontSize = '';
    }
  }, [preferences.fontSizeAdjustment]);

  const value: LanguageContextType = {
    currentLanguage,
    preferences,
    updatePreferences,
    changeLanguage,
    getScriptFont
  };

  return (
    <I18nLoadingBoundary>
      <LanguageContext.Provider value={value}>
        <div className={getScriptFont()}>
          {children}
        </div>
      </LanguageContext.Provider>
    </I18nLoadingBoundary>
  );
};