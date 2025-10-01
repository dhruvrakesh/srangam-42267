import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode } from '@/lib/languageUtils';
import { isLanguageAvailable } from '@/lib/i18n/coverage';
import { CoverageMap } from '@/lib/i18n/coverage';
import { MultilingualContent } from '@/types/multilingual';

interface ArticleHeadProps {
  articleSlug: string;
  title: MultilingualContent;
  description: MultilingualContent;
  keywords: string;
  coverageMap: CoverageMap;
  publishedTime: string;
  modifiedTime?: string;
  section: string;
  tags: string[];
}

/**
 * SEO-optimized head component with multilingual support
 */
export const ArticleHead: React.FC<ArticleHeadProps> = ({
  articleSlug,
  title,
  description,
  keywords,
  coverageMap,
  publishedTime,
  modifiedTime,
  section,
  tags
}) => {
  const { i18n } = useTranslation();
  const currentLang = normalizeLanguageCode(i18n.language) as SupportedLanguage;
  const articleCoverage = coverageMap[articleSlug] || {};
  
  // Get available languages (≥99% coverage)
  const availableLanguages = Object.entries(articleCoverage)
    .filter(([_, coverage]) => isLanguageAvailable(coverage))
    .map(([lang]) => lang as SupportedLanguage);
  
  const currentTitle = (title[currentLang] || title.en || '') as string;
  const currentDescription = (description[currentLang] || description.en || '') as string;
  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}/${articleSlug}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={currentLang} />
      <title>{currentTitle} | Srangam</title>
      <meta name="description" content={currentDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate Language Links (hreflang) */}
      {availableLanguages.map(lang => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}/${lang}/${articleSlug}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={currentLang === 'en' ? 'en_US' : currentLang} />
      
      {/* Alternate locales for OG */}
      {availableLanguages
        .filter(lang => lang !== currentLang)
        .map(lang => (
          <meta
            key={`og-${lang}`}
            property="og:locale:alternate"
            content={lang === 'en' ? 'en_US' : lang}
          />
        ))}
      
      {/* Article Meta Tags */}
      <meta property="article:published_time" content={publishedTime} />
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      <meta property="article:section" content={section} />
      <meta property="article:author" content="Nartiang Foundation" />
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDescription} />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: currentTitle,
          description: currentDescription,
          inLanguage: currentLang,
          author: {
            '@type': 'Organization',
            name: 'Nartiang Foundation'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Srangam',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/brand/srangam_logo_horizontal.svg`
            }
          },
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          articleSection: section,
          keywords: keywords,
          url: canonicalUrl,
          isAccessibleForFree: true,
          availableLanguage: availableLanguages.map(lang => ({
            '@type': 'Language',
            name: supportedLanguages[lang].name,
            alternateName: lang
          }))
        })}
      </script>
    </Helmet>
  );
};
