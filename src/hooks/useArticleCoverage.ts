import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLanguageCode } from '@/lib/languageUtils';
import { SupportedLanguage } from '@/lib/i18n';
import { getArticleCoverageMap, getArticleCoverage } from '@/lib/i18n/coverageData';
import { ArticleCoverage } from '@/lib/i18n/coverage';

/**
 * Hook to get translation coverage for an article
 */
export function useArticleCoverage(articleSlug: string) {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language) as SupportedLanguage;
  
  const coverageMap = useMemo(() => {
    return getArticleCoverageMap(articleSlug);
  }, [articleSlug]);
  
  const currentCoverage = useMemo(() => {
    return getArticleCoverage(articleSlug, currentLanguage);
  }, [articleSlug, currentLanguage]);
  
  return {
    coverageMap,
    currentCoverage,
    currentLanguage
  };
}
