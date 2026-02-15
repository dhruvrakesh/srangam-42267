import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InteractiveAtlas } from '@/components/atlas/InteractiveAtlas';
import { useTranslation } from 'react-i18next';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';

const AtlasPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preferences } = useLanguagePreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();

  useEffect(() => {
    // Handle URL parameters
    const id = searchParams.get('id');
    const lang = searchParams.get('lang');
    const search = searchParams.get('search');
    
    if (id) {
      setSelectedNodeId(id);
    }
    
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [searchParams, i18n]);

  const handleNodeSelect = (node: any) => {
    if (node) {
      setSelectedNodeId(node.id);
      // Update URL without triggering navigation
      const newParams = new URLSearchParams(searchParams);
      newParams.set('id', node.id);
      newParams.set('lang', i18n.language);
      setSearchParams(newParams, { replace: true });
    } else {
      setSelectedNodeId(undefined);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('id');
      setSearchParams(newParams, { replace: true });
    }
  };

  const getCurrentTitle = () => {
    if (preferences.primaryLanguage === 'hi') {
      return 'अंतरक्रियात्मक एटलस — स्रांगम';
    }
    return 'Interactive Atlas — Srangam';
  };

  const getCurrentDescription = () => {
    if (preferences.primaryLanguage === 'hi') {
      return 'भारतीय महासागर की इंटरैक्टिव मानचित्र खोज — बंदरगाहों, व्यापारिक मार्गों, और सांस्कृतिक आदान-प्रदान के ऐतिहासिक केंद्रों की खोज करें।';
    }
    return 'Interactive mapping exploration of the Indian Ocean world — discover historical ports, trade routes, and centers of cultural exchange with detailed academic sourcing.';
  };

  return (
    <>
      <Helmet>
        <title>{getCurrentTitle()}</title>
        <meta name="description" content={getCurrentDescription()} />
        <meta property="og:title" content={getCurrentTitle()} />
        <meta property="og:description" content={getCurrentDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://srangam.nartiang.org/atlas" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getCurrentTitle()} />
        <meta name="twitter:description" content={getCurrentDescription()} />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://srangam.nartiang.org/atlas" />
        
        {/* Language alternates */}
        <link rel="alternate" hrefLang="en" href="https://srangam.nartiang.org/atlas?lang=en" />
        <link rel="alternate" hrefLang="hi" href="https://srangam.nartiang.org/atlas?lang=hi" />
        <link rel="alternate" hrefLang="ta" href="https://srangam.nartiang.org/atlas?lang=ta" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": getCurrentTitle(),
            "description": getCurrentDescription(),
            "url": "https://srangam.nartiang.org/atlas",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "Srangam Research Foundation"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <InteractiveAtlas 
          selectedId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
        />
      </div>
    </>
  );
};

export default AtlasPage;