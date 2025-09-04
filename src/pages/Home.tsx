import React, { useCallback, useMemo } from "react";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Button } from "@/components/ui/button";
import { ARTICLES } from "@/data/siteData";
import { IconMonsoon, IconScript, IconBasalt, IconPort, IconEdict, IconDharmaChakra, IconSarnathLion, IconLotus, IconConch, IconOm } from "@/components/icons";
import { Link } from "react-router-dom";
import { ArrowRight, Waves, Mountain, BookOpen, Map, Users } from "lucide-react";

export default function Home() {
  // Memoize expensive calculations for performance
  const featuredArticles = useMemo(() => ARTICLES.slice(0, 3), []);
  
  const themes = useMemo(() => [
    {
      title: "Ancient India",
      description: "सनातन परम्परा - Archaeological and textual evidence for early Indian Ocean trade networks",
      path: "/themes/ancient-india",
      icon: IconSarnathLion,
      color: "text-saffron",
      bgPattern: "mandala-bg"
    },
    {
      title: "Indian Ocean World", 
      description: "सागर संस्कृति - Monsoon rhythms and maritime cultures across the vast oceanic space",
      path: "/themes/indian-ocean-world",
      icon: IconConch,
      color: "text-peacock-blue",
      bgPattern: "chakra-pattern"
    },
    {
      title: "Scripts & Inscriptions",
      description: "शिलालेख विद्या - Reading stone voices: epigraphy across languages and centuries",
      path: "/themes/scripts-inscriptions", 
      icon: IconOm,
      color: "text-indigo-dharma",
      bgPattern: "dharma-scroll"
    },
    {
      title: "Geology & Deep Time",
      description: "कालचक्र - Tectonic histories and the geological foundations of cultural exchange",
      path: "/themes/geology-deep-time",
      icon: IconBasalt,
      color: "text-terracotta",
      bgPattern: "mandala-bg"
    },
    {
      title: "Empires & Exchange",
      description: "राजधर्म - Political networks and economic flows from local to imperial scales",
      path: "/themes/empires-exchange",
      icon: IconDharmaChakra,
      color: "text-turmeric",
      bgPattern: "chakra-pattern"
    }
  ], []);

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Ocean-inspired Background Patterns */}
      <div className="fixed inset-0 ocean-waves opacity-60 pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 ancient-navigation rounded-full opacity-20 pointer-events-none" />
      
      {/* Hero Section with Dharmic Aesthetics */}
      <section className="relative min-h-screen">
        {/* Hero Image Background with Sacred Overlays */}
        <div className="absolute inset-0">
          <img
            src="/images/hero_indian-ocean_aerial_21x9_v1.png"
            alt="सागर - The sacred waters of the Indian Ocean connecting ancient civilizations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-dharma/20 via-saffron/10 to-charcoal-om/80" />
          <div className="absolute inset-0 lotus-gradient opacity-20" />
        </div>
        
        {/* Optimized Sacred Symbols - Reduced Animation Load */}
        <div className="absolute top-20 left-10 animate-pulse-gentle opacity-20">
          <IconLotus size={32} className="text-lotus-pink" />
        </div>
        <div className="absolute top-32 right-16 animate-pulse-gentle opacity-25" style={{ animationDelay: '1s' }}>
          <IconOm size={28} className="text-saffron" />
        </div>
        <div className="absolute bottom-32 left-20 animate-slow-spin opacity-15" style={{ animationDelay: '2s' }}>
          <IconDharmaChakra size={40} className="text-turmeric" />
        </div>
        
        {/* Hero Content with Sanskrit Touches */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in">
              {/* Sanskrit blessing above title */}
              <div className="text-saffron/80 text-lg mb-4 font-serif">
                ॐ सरस्वत्यै नमः
              </div>
              
              <h1 className="font-serif text-5xl lg:text-7xl font-bold text-sandalwood mb-6 drop-shadow-2xl tracking-wide">
                Srangam
              </h1>
              
              {/* Sanskrit subtitle */}
              <div className="text-turmeric/90 text-xl mb-4 font-serif">
                सागर इतिहास संग्रह
              </div>
              
              <h2 className="font-serif text-2xl lg:text-3xl text-sandalwood/95 mb-8 max-w-3xl mx-auto drop-shadow-lg font-medium">
                Histories of the Indian Ocean World
              </h2>
              <p className="text-lg lg:text-xl text-sandalwood/85 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light">
                धर्म, अर्थ, काम, मोक्ष — Exploring the interconnected histories through archaeology, 
                epigraphy, and deep time perspectives. From monsoon cycles to stone inscriptions, 
                from spice routes to tectonic drift across the sacred waters.
              </p>
            </div>
            
            {/* Optimized Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-saffron hover:bg-saffron-light text-charcoal-om border-0 shadow-lg hover:shadow-saffron/20 transition-all duration-200 hover:scale-[1.02]">
                <Link to="/themes/ancient-india">
                  <IconSarnathLion size={20} className="mr-2" />
                  यात्रा प्रारम्भ | Begin Journey
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-sandalwood text-sandalwood hover:bg-sandalwood hover:text-charcoal-om shadow-lg hover:shadow-sandalwood/20 transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm bg-indigo-dharma/20">
                <Link to="/about">
                  <IconLotus size={20} className="mr-2" />
                  About the Project
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Optimized Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse-gentle">
          <div className="w-6 h-10 border-2 border-turmeric/60 rounded-full flex justify-center backdrop-blur-sm bg-indigo-dharma/20 shadow-md">
            <div className="w-1 h-3 bg-saffron/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Articles - Sacred Manuscript Style */}
      <section className="py-16 bg-sandalwood/20 relative">
        <div className="absolute inset-0 dharma-scroll opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <IconConch size={48} className="text-peacock-blue om-pulse" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              नवीन अनुसंधान | Recent Research
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Latest findings from our ongoing research into Indian Ocean histories through dharmic lens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredArticles.map((article, index) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="border-2 border-saffron text-saffron hover:bg-saffron hover:text-charcoal-om transition-all duration-200 hover:scale-[1.02]">
              <Link to="/field-notes">
                <IconLotus size={20} className="mr-2" />
                सर्वे अध्ययनम् | View All Research
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Themes Grid - Dharmic Mandala Layout */}
      <section className="py-16 bg-background relative">
        <div className="absolute inset-0 ancient-navigation opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-4 mb-6">
              <IconDharmaChakra size={48} className="text-turmeric animate-slow-spin" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              अनुसंधान विषयाः | Research Themes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our interdisciplinary approach to Indian Ocean studies through dharmic wisdom
            </p>
          </div>

          {/* First row - 3 themes in sacred triangle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {themes.slice(0, 3).map((theme, index) => {
              const IconComponent = theme.icon;
              return (
                <Link
                  key={theme.path}
                  to={theme.path}
                  className={`group block p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 hover:border-primary/50 relative overflow-hidden animate-fade-in ${theme.bgPattern || ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className={theme.bgPattern} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`${theme.color} animate-pulse-gentle`}>
                        <IconComponent size={40} />
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-4 text-center">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed text-center">
                      {theme.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Second row - 2 themes in sacred balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {themes.slice(3).map((theme, index) => {
              const IconComponent = theme.icon;
              return (
                <Link
                  key={theme.path}
                   to={theme.path}
                   className={`group block p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 hover:border-primary/50 relative overflow-hidden animate-fade-in ${theme.bgPattern || ''}`}
                   style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className={theme.bgPattern} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`${theme.color} animate-pulse-gentle`}>
                        <IconComponent size={40} />
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-4 text-center">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed text-center">
                      {theme.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links - Sacred Trinity */}
      <section className="py-16 bg-lotus-pink/10 relative">
        <div className="absolute inset-0 chakra-pattern opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              त्रिमार्ग | Sacred Paths
            </h2>
            <p className="text-lg text-muted-foreground">
              Three pillars of knowledge in the dharmic tradition
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/field-notes" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 animate-fade-in relative overflow-hidden">
              <div className="absolute inset-0 manuscript-texture opacity-30" />
              <IconOm size={48} className="mx-auto text-saffron mb-6 group-hover:scale-105 transition-transform animate-pulse-gentle" />
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Field Notes</h3>
              <p className="text-muted-foreground mb-4">क्षेत्र अध्ययन</p>
              <p className="text-sm text-muted-foreground">Sacred fieldwork and revelations from the earth</p>
            </Link>

            <Link to="/maps-data" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 chakra-pattern opacity-3" />
              <IconDharmaChakra size={48} className="mx-auto text-turmeric mb-6 group-hover:scale-105 transition-transform animate-slow-spin" />
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Maps & Data</h3>
              <p className="text-muted-foreground mb-4">भूगोल ज्ञान</p>
              <p className="text-sm text-muted-foreground">Sacred geography and cosmic visualizations</p>
            </Link>

            <Link to="/about" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 dharma-scroll opacity-3" />
              <IconLotus size={48} className="mx-auto text-lotus-pink mb-6 group-hover:scale-105 transition-transform animate-pulse-gentle" />
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground mb-4">आश्रम परिचय</p>
              <p className="text-sm text-muted-foreground">Our dharmic scholarly community and mission</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}