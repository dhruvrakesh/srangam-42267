import React, { useState } from 'react';
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getArticlesByTheme } from "@/lib/multilingualArticleUtils";
import { useLanguage } from "@/components/language/LanguageProvider";
import { IconMonsoon, IconConch, IconLotus } from "@/components/icons";
import { 
  Sourcebook, 
  RouteAtlas, 
  RitualCalendar, 
  MaritimeLexicon, 
  ObjectGallery,
  parseSourcebookCSV 
} from "@/components/modules";

// Import data
import sourcebookCSV from "@/data/oceanic_bhasha_sample_dataset.csv?raw";
import { oceanGisData } from "@/data/ocean_gis_pins";

export default function IndianOceanWorld() {
  const { currentLanguage } = useLanguage();
  const themeArticles = getArticlesByTheme("Indian Ocean World", currentLanguage);
  
  const sourcebookData = React.useMemo(() => {
    try {
      return parseSourcebookCSV(sourcebookCSV);
    } catch (error) {
      console.error('Error parsing sourcebook CSV:', error);
      return [];
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Simplified Ocean Background - Optimized for Text Visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean/8 via-peacock-blue/5 to-lotus-pink/6" />
      
      {/* Subtle Ocean Pattern */}
      <div className="absolute inset-0 ocean-waves opacity-40" />
      
      {/* Minimal Accent Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 border border-ocean/10 rounded-full animate-pulse-gentle" />
      <div className="absolute bottom-20 left-20 w-24 h-24 border border-peacock-blue/10 rounded-full animate-float" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Thematic Icons Trinity - Enhanced Interactivity */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="group p-6 rounded-full bg-ocean/20 backdrop-blur-sm border-2 border-ocean/30 hover:border-ocean/60 hover:bg-ocean/30 transition-all duration-300 hover:scale-110 cursor-pointer hover:animate-glow">
              <IconLotus size={52} className="text-ocean group-hover:text-ocean/90 animate-pulse-gentle group-hover:animate-float" />
            </div>
            <div className="group p-8 rounded-full bg-peacock-blue/20 backdrop-blur-sm border-2 border-peacock-blue/30 hover:border-peacock-blue/60 hover:bg-peacock-blue/30 transition-all duration-300 hover:scale-110 cursor-pointer hover:animate-glow">
              <IconMonsoon size={68} className="text-peacock-blue group-hover:text-peacock-blue/90 group-hover:animate-slow-spin" />
            </div>
            <div className="group p-6 rounded-full bg-lotus-pink/20 backdrop-blur-sm border-2 border-lotus-pink/30 hover:border-lotus-pink/60 hover:bg-lotus-pink/30 transition-all duration-300 hover:scale-110 cursor-pointer hover:animate-glow">
              <IconConch size={52} className="text-lotus-pink group-hover:text-lotus-pink/90 animate-pulse-gentle group-hover:animate-float" />
            </div>
          </div>
          <div className="relative">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-ocean via-peacock-blue to-lotus-pink bg-clip-text text-transparent">
                हिन्द महासागर
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-ocean mb-8">
              वरुण क्षेत्र — Varuṇa's Realm
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              Varuṇa's realm where monsoon rhythms meet maritime dharma. From seasonal trade cycles and celestial navigation to ritual memory, the Indian Ocean is a civilizational commons binding Sangam ports, Vedic sky-waters, and far-flung inscriptions.
            </p>
            <div className="mt-6 h-1 w-32 bg-gradient-to-r from-ocean via-peacock-blue to-lotus-pink mx-auto rounded-full"></div>
            
            {/* Ocean Mantra */}
            <div className="mt-8 p-6 bg-ocean/5 backdrop-blur-sm rounded-2xl border border-ocean/20 max-w-2xl mx-auto">
              <div className="text-ocean font-serif text-lg mb-2">अपां नपात् नभसे वेति मध्वा</div>
              <div className="text-charcoal/70 text-sm italic">
                "Child of waters flows with honey through the sky" — Rig Veda 2.35.13
              </div>
            </div>
          </div>
        </div>

        {/* Five Authoritative Modules */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="sourcebook">Sourcebook</TabsTrigger>
            <TabsTrigger value="atlas">Route Atlas</TabsTrigger>
            <TabsTrigger value="calendar">Ritual Calendar</TabsTrigger>
            <TabsTrigger value="lexicon">Maritime Lexicon</TabsTrigger>
            <TabsTrigger value="gallery">Object Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themeArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {themeArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">More articles coming soon...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sourcebook" className="mt-8">
            <Sourcebook sources={sourcebookData} />
          </TabsContent>

          <TabsContent value="atlas" className="mt-8">
            <RouteAtlas geoData={oceanGisData} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-8">
            <RitualCalendar />
          </TabsContent>

          <TabsContent value="lexicon" className="mt-8">
            <MaritimeLexicon />
          </TabsContent>

          <TabsContent value="gallery" className="mt-8">
            <ObjectGallery />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}