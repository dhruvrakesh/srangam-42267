import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode } from '@/lib/languageUtils';
import { isLanguageAvailable } from '@/lib/i18n/coverage';
import { CoverageMap } from '@/lib/i18n/coverage';
import { MultilingualContent } from '@/types/multilingual';
import { BreadcrumbSchema, getArticleBreadcrumbs } from '@/components/seo/BreadcrumbSchema';
import { getProxiedImageUrl } from '@/lib/gdriveProxy';

const BASE_URL = 'https://srangam.nartiang.org';

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
  /** Optional word count for ScholarlyArticle schema */
  wordCount?: number;
  /** Optional bibliography citations for ScholarlyArticle schema */
  citations?: string[];
  /** Optional AI-generated OG image URL */
  ogImageUrl?: string | null;
}

/**
 * SEO-optimized head component with multilingual support
 * Implements ScholarlyArticle schema for Google rich snippets
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
  tags,
  wordCount,
  citations,
  ogImageUrl
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
  const canonicalUrl = `${BASE_URL}/${articleSlug}`;
  
  // Dynamic OG image with proxy for GDrive URLs and fallback to default branded image
  const rawOgImageUrl = ogImageUrl || `${BASE_URL}/brand/og-image.png`;
  const effectiveOgImageUrl = getProxiedImageUrl(rawOgImageUrl);
  
  // Generate breadcrumbs for this article
  const breadcrumbs = getArticleBreadcrumbs(currentTitle, articleSlug, section);
  
  // ScholarlyArticle structured data (enhanced from basic Article)
  const scholarlyArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${canonicalUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    headline: currentTitle,
    description: currentDescription,
    image: {
      '@type': 'ImageObject',
      url: effectiveOgImageUrl,
      width: 1200,
      height: 630
    },
    author: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Nartiang Foundation'
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Srangam',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/brand/srangam_logo_horizontal.svg`
      }
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    articleSection: section,
    keywords: keywords,
    url: canonicalUrl,
    inLanguage: currentLang,
    isAccessibleForFree: true,
    ...(wordCount && { wordCount }),
    ...(citations && citations.length > 0 && { citation: citations }),
    about: tags.map(tag => ({
      '@type': 'Thing',
      name: tag
    })),
    availableLanguage: availableLanguages.map(lang => ({
      '@type': 'Language',
      name: supportedLanguages[lang].name,
      alternateName: lang
    }))
  };
  
  return (
    <>
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
            href={`${BASE_URL}/${lang}/${articleSlug}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={currentTitle} />
        <meta property="og:description" content={currentDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={effectiveOgImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
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
        <meta name="twitter:image" content={effectiveOgImageUrl} />
        
        {/* Structured Data (JSON-LD) - ScholarlyArticle */}
        <script type="application/ld+json">
          {JSON.stringify(scholarlyArticleSchema)}
        </script>
      </Helmet>
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={breadcrumbs} />
    </>
  );
};
