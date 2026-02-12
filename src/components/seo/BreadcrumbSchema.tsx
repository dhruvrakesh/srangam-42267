import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://srangam.nartiang.org';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * Schema.org BreadcrumbList for article pages
 * Improves search result display with navigation trail
 */
export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

/**
 * Generate standard breadcrumb items for article pages
 */
export const getArticleBreadcrumbs = (
  articleTitle: string,
  articleSlug: string,
  section?: string
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/articles' }
  ];

  if (section) {
    const sectionSlug = section.toLowerCase().replace(/\s+/g, '-');
    items.push({ name: section, url: `/themes/${sectionSlug}` });
  }

  items.push({ name: articleTitle, url: `/${articleSlug}` });

  return items;
};

export default BreadcrumbSchema;
