import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '@/lib/i18n';
import { LanguagePreferences } from '@/types/multilingual';

const defaultPreferences: LanguagePreferences = {
  primaryLanguage: 'en',
  fallbackLanguage: 'en',
  showTransliterations: true,
  showCulturalContext: true,
  fontSizeAdjustment: 0
};

const STORAGE_KEY = 'srangam-language-preferences';

export const useLanguagePreferences = () => {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState<LanguagePreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (error) {
        console.warn('Failed to parse language preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Update primary language when i18n language changes
  useEffect(() => {
    const currentLang = i18n.language as SupportedLanguage;
    if (currentLang !== preferences.primaryLanguage) {
      updatePreferences({ primaryLanguage: currentLang });
    }
  }, [i18n.language, preferences.primaryLanguage]);

  const updatePreferences = (updates: Partial<LanguagePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences
  };
};