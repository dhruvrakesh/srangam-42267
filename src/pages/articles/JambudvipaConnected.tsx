import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { jambudvipaConnected } from '@/data/articles/jambudvipa-connected';
import { IconScript } from '@/components/icons';
import { SeasonalWindPattern } from '@/components/articles/SeasonalWindPattern';
import { TradeTimeline } from '@/components/articles/TradeTimeline';
import { CulturalDiffusionMap } from '@/components/articles/CulturalDiffusionMap';
import { EnhancedTimeline, jambudvipaTimelineData, ArchaeologicalChart, InteractiveTextualSources, StickyTableOfContents, ImprovedInteractiveChart, archaeologicalSitesData } from '@/components/articles/enhanced';

const JambudvipaConnected: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Jambudvipa Connected: Weaving the Threads of Civilization from the Vaigai to the Ganga | Srangam</title>
        <meta name="description" content="New archaeological discoveries at Keezhadi challenge fragmented views of ancient India. This synthesis correlates Tamil findings with Sanskrit literature, revealing Jambudvipa as a deeply interconnected civilizational space." />
        <meta name="keywords" content="Keezhadi, Tamil archaeology, ancient India, Jambudvipa, Vaigai civilization, Mahabharata, Tamil-Brahmi, trade networks, cultural synthesis" />
        <meta property="og:title" content="Jambudvipa Connected: Weaving the Threads of Civilization" />
        <meta property="og:description" content="Archaeological evidence from Keezhadi reveals ancient India as a unified, interconnected civilization spanning from the Vaigai to the Ganga." />
        <meta property="og:type" content="article" />
        <meta property="article:author" content="Nartiang Foundation" />
        <meta property="article:published_time" content="2025-09-28" />
        <meta property="article:section" content="Ancient India" />
        <meta property="article:tag" content="Keezhadi Archaeology" />
        <meta property="article:tag" content="Tamil-Brahmi Script" />
        <meta property="article:tag" content="Ancient Trade Networks" />
        <meta property="article:tag" content="Jambudvipa Civilization" />
        <link rel="canonical" href={`${window.location.origin}/jambudvipa-connected`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Jambudvipa Connected: Weaving the Threads of Civilization from the Vaigai to the Ganga",
            "description": "New archaeological discoveries at Keezhadi challenge fragmented views of ancient India. This synthesis correlates Tamil findings with Sanskrit literature, revealing Jambudvipa as a deeply interconnected civilizational space.",
            "author": {
              "@type": "Organization",
              "name": "Nartiang Foundation"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Srangam",
              "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/brand/srangam_logo_horizontal.svg`
              }
            },
            "datePublished": "2025-09-28",
            "dateModified": "2025-09-28",
            "articleSection": "Ancient India",
            "keywords": "Keezhadi, Tamil archaeology, ancient India, Jambudvipa, Vaigai civilization, Mahabharata, Tamil-Brahmi, trade networks, cultural synthesis",
            "inLanguage": "en",
            "url": `${window.location.origin}/jambudvipa-connected`
          })}
        </script>
      </Helmet>
      
      <ArticlePage
        title={jambudvipaConnected.title}
        dek={jambudvipaConnected.dek}
        content={jambudvipaConnected.content}
        tags={jambudvipaConnected.tags}
        icon={IconScript}
        readTime={35}
        author="Nartiang Foundation"
        date="September 28, 2025"
        dataComponents={[
          <StickyTableOfContents key="table-of-contents" items={[]} className="hidden lg:block" />,
          <EnhancedTimeline key="enhanced-timeline" events={jambudvipaTimelineData} />,
          <ArchaeologicalChart key="archaeological-chart" />,
          <ImprovedInteractiveChart 
            key="sites-chart" 
            title="Archaeological Sites Timeline" 
            description="Major archaeological discoveries revealing the depth of ancient Indian civilization"
            data={archaeologicalSitesData}
            chartType="bar"
            showLegend={true}
          />,
          <InteractiveTextualSources key="textual-sources" />,
          <SeasonalWindPattern key="wind-pattern" />,
          <TradeTimeline key="trade-timeline" />,
          <CulturalDiffusionMap key="cultural-map" />
        ]}
      />
    </>
  );
};

export default JambudvipaConnected;