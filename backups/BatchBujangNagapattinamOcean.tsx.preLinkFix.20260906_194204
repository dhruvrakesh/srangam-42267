import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  OceanNetworksHero, 
  NetworkFilterChips, 
  NetworkVisualization, 
  NetworkFeatureCard 
} from '@/components/ocean-networks';
import { LazyMapboxBujangNetwork } from '@/components/interactive/LazyMapboxBujangNetwork';
import {
  BreadcrumbNav,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import tabsData from '@/data/ocean_networks/tabs.json';
import oceanNetworksI18n from '@/data/ocean_networks/i18n.json';

/**
 * Maritime Networks of the Indian Ocean
 * Bilingual, evidence-first view with three tabs: Bujang Valley, Nagapattinam Guilds, Ocean of Churn
 * Features schematic network visualizations, filter chips, and citation transparency
 */

const BatchBujangNagapattinamOcean: React.FC = () => {
  const { i18n } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showMapboxBujang, setShowMapboxBujang] = useState(false);
  const isHindi = i18n.language === 'hi';

  const handleTagToggle = (slug: string) => {
    setSelectedTags(prev => 
      prev.includes(slug) 
        ? prev.filter(tag => tag !== slug)
        : [...prev, slug]
    );
  };

  // Filter features based on selected tags
  const filterFeatures = (features: any[]) => {
    if (selectedTags.length === 0) return features;
    return features.filter((feature: any) => 
      feature.tags.some((tag: string) => selectedTags.includes(tag))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <BreadcrumbNav>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">मुख्य | Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>🪷</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/batch/bujang-nagapattinam-ocean">संग्रह | Collections</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>☸</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>सागर जाल | Ocean Networks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </BreadcrumbNav>
        </div>

        {/* Hero Section */}
        <OceanNetworksHero />

        {/* Filter Chips */}
        <NetworkFilterChips 
          selectedTags={selectedTags} 
          onTagToggle={handleTagToggle} 
        />

        {/* Enhanced Map CTA */}
        <div className="text-center mb-8">
          <Button variant="default" size="lg" asChild>
            <Link to="/maps">
              {isHindi ? oceanNetworksI18n.cta.enhanced_map_hi : oceanNetworksI18n.cta.enhanced_map_en}
            </Link>
          </Button>
        </div>

        {/* Tabbed Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="bujang" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {tabsData.tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="font-medium">
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabsData.tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-8">
                {/* Tab Header */}
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-serif font-bold text-foreground">
                    {tab.heading}
                  </h2>
                  <div className="max-w-4xl mx-auto space-y-2">
                    <p className="text-muted-foreground font-hindi">
                      {tab.intro_hi}
                    </p>
                    <p className="text-muted-foreground">
                      {tab.intro_en}
                    </p>
                  </div>
                </div>

                {/* Network Visualization */}
                <NetworkVisualization 
                  tabId={tab.id as 'bujang' | 'nagapattinam' | 'churn'} 
                  selectedTags={selectedTags}
                />

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filterFeatures(tab.features).map((feature: any, index: number) => (
                    <NetworkFeatureCard key={index} feature={feature} />
                  ))}
                </div>

                {/* Tab CTA */}
                <div className="text-center">
                  <Button variant="outline" size="lg" asChild>
                    <Link to={tab.cta.href}>
                      {isHindi ? tab.cta.label_hi : tab.cta.label_en}
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Enhanced Mapbox Components */}
        {showMapboxBujang && (
          <LazyMapboxBujangNetwork onClose={() => setShowMapboxBujang(false)} />
        )}
      </div>
    </div>
  );
};

export default BatchBujangNagapattinamOcean;