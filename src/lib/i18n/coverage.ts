import { SupportedLanguage } from '@/lib/i18n';

export interface ArticleCoverage {
  slug: string;
  lang: SupportedLanguage;
  percent: number;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
}

export interface CoverageMap {
  [articleSlug: string]: {
    [lang: string]: ArticleCoverage;
  };
}

/**
 * Calculate translation coverage for an article
 */
export function calculateCoverage(
  strings: Record<string, string>,
  slug: string,
  lang: SupportedLanguage
): ArticleCoverage {
  const allKeys = Object.keys(strings);
  const totalKeys = allKeys.length;
  const translatedKeys = allKeys.filter(key => {
    const value = strings[key];
    return value && value.trim().length > 0;
  }).length;
  
  const missingKeys = allKeys.filter(key => {
    const value = strings[key];
    return !value || value.trim().length === 0;
  });

  const percent = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

  return {
    slug,
    lang,
    percent,
    totalKeys,
    translatedKeys,
    missingKeys
  };
}

/**
 * Check if a language is available (≥99% coverage)
 */
export function isLanguageAvailable(coverage: ArticleCoverage): boolean {
  return coverage.percent >= 99;
}

/**
 * Get coverage status text
 */
export function getCoverageStatus(coverage: ArticleCoverage): string {
  if (isLanguageAvailable(coverage)) {
    return 'Available';
  }
  return `In progress (${coverage.percent}%)`;
}

/**
 * Get coverage badge variant
 */
export function getCoverageBadgeVariant(coverage: ArticleCoverage): 'default' | 'secondary' | 'outline' {
  if (coverage.percent >= 99) return 'default';
  if (coverage.percent >= 70) return 'secondary';
  return 'outline';
}
