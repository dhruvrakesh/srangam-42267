import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconOm } from '@/components/icons/IconOm';
import { reassessingRigvedaAntiquity } from '@/data/articles/reassessing-rigveda-antiquity';
import { VedicChronologyTimeline } from '@/components/articles/VedicChronologyTimeline';
import { SarasvatiRiverEvolution } from '@/components/articles/SarasvatiRiverEvolution';
import { MitanniVedicConnectionsMap } from '@/components/articles/MitanniVedicConnectionsMap';
import { ArchaeoAstronomyCalculator } from '@/components/articles/ArchaeoAstronomyCalculator';
import { RigvedaChronologyBibliography } from '@/components/articles/RigvedaChronologyBibliography';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { Helmet } from 'react-helmet-async';

export default function ReasessingRigvedaAntiquity() {
  // Extract English content for narration
  const contentForNarration = typeof reassessingRigvedaAntiquity.content === 'object' 
    ? (reassessingRigvedaAntiquity.content.en as string || '')
    : reassessingRigvedaAntiquity.content;

  return (
    <>
      <Helmet>
        <title>Reassessing the Antiquity of the Rigveda: Archaeological and Astronomical Evidence | Srangam</title>
        <meta 
          name="description" 
          content="Archaeological, astronomical, and indigenous evidence challenges colonial dating and places the Rigveda's composition in the 3rd-4th millennium BCE or earlier. Explore the Sarasvatī River, Mitanni connections, and Puranic chronology." 
        />
        <meta property="og:title" content="Reassessing the Antiquity of the Rigveda" />
        <meta property="og:description" content="Multi-disciplinary evidence for 3rd millennium BCE dating of the Rigveda" />
        <meta property="og:type" content="article" />
        <meta property="article:author" content="Nartiang Foundation Research Team" />
        <meta property="article:published_time" content="2025-10-14" />
        <link rel="canonical" href="https://srangam-db.lovable.app/reassessing-rigveda-antiquity" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ScholarlyArticle",
            "headline": "Reassessing the Antiquity of the Rigveda",
            "author": {
              "@type": "Organization",
              "name": "Nartiang Foundation Research Team"
            },
            "datePublished": "2025-10-14",
            "about": ["Rigveda", "Vedic Chronology", "Ancient Indian History", "Sarasvatī River", "Mitanni"]
          })}
        </script>
      </Helmet>
      <ArticlePage
        title={reassessingRigvedaAntiquity.title}
        dek={reassessingRigvedaAntiquity.dek}
        content={reassessingRigvedaAntiquity.content}
        tags={reassessingRigvedaAntiquity.tags}
        icon={IconOm}
        readTime={28}
        author="Nartiang Foundation Research Team"
        date="2025-10-14"
        articleSlug="reassessing-rigveda-antiquity"
        dataComponents={[
          <VedicChronologyTimeline key="chronology" />,
          <SarasvatiRiverEvolution key="sarasvati" />,
          <MitanniVedicConnectionsMap key="mitanni" />,
          <ArchaeoAstronomyCalculator key="astronomy" />,
          <RigvedaChronologyBibliography key="bibliography" />
        ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="reassessing-rigveda-antiquity"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}
