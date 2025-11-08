import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';
import { SupportedLanguage, supportedLanguages } from '@/lib/i18n';
import { normalizeLanguageCode, getScriptFont as getScriptFontUtil } from '@/lib/languageUtils';
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
  
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en');

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
    return getScriptFontUtil(language);
  };

  // Apply font size adjustments
  useEffect(() => {
    if (preferences.fontSizeAdjustment !== 0) {
      document.documentElement.style.fontSize = `${16 + preferences.fontSizeAdjustment}px`;
    } else {
      document.documentElement.style.fontSize = '';
    }
  }, [preferences.fontSizeAdjustment]);

  // Apply script font class without overwriting other classes
  useEffect(() => {
    const fontClass = getScriptFont();
    const root = document.documentElement;
    
    // Remove any existing font-* classes
    root.classList.forEach(className => {
      if (className.startsWith('font-')) {
        root.classList.remove(className);
      }
    });
    
    // Add new font class
    if (fontClass) {
      root.classList.add(fontClass);
    }
  }, [currentLanguage]);

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
        {children}
      </LanguageContext.Provider>
    </I18nLoadingBoundary>
  );
};