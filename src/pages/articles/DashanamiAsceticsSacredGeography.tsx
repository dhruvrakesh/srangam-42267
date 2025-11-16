import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { dashanamiAsceticsSacredGeography } from '@/data/articles/dashanami-ascetics-sacred-geography';
import { Helmet } from 'react-helmet-async';

export default function DashanamiAsceticsSacredGeography() {
  const contentForNarration = typeof dashanamiAsceticsSacredGeography.content === 'object' 
    ? (dashanamiAsceticsSacredGeography.content.en as string || '')
    : dashanamiAsceticsSacredGeography.content;

  return (
    <>
      <Helmet>
        <title>Dashanami Ascetics, Nath Yogis, Ajivikas, and the Sacred Geography of Jyotirlingas | Srangam</title>
        <meta 
          name="description" 
          content="An exploration of how monastic lineages founded by Adi Shankaracharya, Nath yogis, and the Ajivikas contributed to India's spiritual tapestry through sacred geography and pilgrimage networks anchored in the twelve Jyotirlingas." 
        />
        <meta property="og:title" content="Dashanami Ascetics and Sacred Geography" />
        <meta property="og:description" content="Monastic traditions and the sacred geography of Jyotirlingas" />
        <meta property="og:type" content="article" />
        <meta property="article:author" content="NF Research Team" />
        <meta property="article:published_time" content="2025-01-15" />
      </Helmet>
      <ArticlePage
        title={dashanamiAsceticsSacredGeography.title}
        dek={dashanamiAsceticsSacredGeography.dek}
        content={dashanamiAsceticsSacredGeography.content}
        tags={dashanamiAsceticsSacredGeography.tags}
        author="NF Research Team"
        date="2025-01-15"
        readTime={45}
      />
    </>
  );
}
