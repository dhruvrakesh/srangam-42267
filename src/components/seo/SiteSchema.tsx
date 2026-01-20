import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://srangam-db.lovable.app';

/**
 * Site-wide Schema.org structured data for Organization and WebSite
 * Improves Google Knowledge Panel and Sitelinks Search Box
 */
export const SiteSchema: React.FC = () => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Srangam',
    alternateName: 'Srangam Project',
    description: 'Dharmic Scholarship for the Digital Age — Exploring histories of the Indian Ocean World through rigorous academic research and primary source analysis.',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/brand/srangam_logo_horizontal.svg`,
      width: 600,
      height: 60
    },
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/brand/og-image.svg`,
      width: 1200,
      height: 630
    },
    foundingDate: '2024',
    founder: {
      '@type': 'Organization',
      name: 'Nartiang Foundation'
    },
    knowsAbout: [
      'Ancient Indian History',
      'Indian Ocean Trade Networks',
      'Sanskrit Epigraphy',
      'Vedic Studies',
      'Maritime Archaeology',
      'Historical Geology'
    ],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 20.5937,
        longitude: 78.9629
      },
      geoRadius: '5000 km'
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'Srangam',
    alternateName: 'Histories of the Indian Ocean World',
    description: 'Dharmic Scholarship for the Digital Age',
    url: BASE_URL,
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: ['en', 'hi', 'pa', 'ta'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default SiteSchema;
