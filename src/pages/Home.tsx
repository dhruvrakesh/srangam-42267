import { ArticleCard } from "@/components/ui/ArticleCard";
import { Button } from "@/components/ui/button";
import { ARTICLES } from "@/data/siteData";
import { IconMonsoon, IconScript, IconBasalt, IconPort, IconEdict } from "@/components/icons";
import { Link } from "react-router-dom";
import { ArrowRight, Waves, Mountain, BookOpen, Map, Users } from "lucide-react";

export default function Home() {
  const featuredArticles = ARTICLES.slice(0, 3);

  const themes = [
    {
      title: "Ancient India",
      description: "Explore the archaeological and textual evidence for early Indian Ocean trade networks",
      path: "/themes/ancient-india",
      icon: IconScript,
      color: "text-gold"
    },
    {
      title: "Indian Ocean World", 
      description: "Monsoon rhythms and maritime cultures across the vast oceanic space",
      path: "/themes/indian-ocean-world",
      icon: IconMonsoon,
      color: "text-ocean"
    },
    {
      title: "Scripts & Inscriptions",
      description: "Reading stone voices: epigraphy across languages and centuries",
      path: "/themes/scripts-inscriptions", 
      icon: IconEdict,
      color: "text-laterite"
    },
    {
      title: "Geology & Deep Time",
      description: "Tectonic histories and the geological foundations of cultural exchange",
      path: "/themes/geology-deep-time",
      icon: IconBasalt,
      color: "text-laterite"
    },
    {
      title: "Empires & Exchange",
      description: "Political networks and economic flows from local to imperial scales",
      path: "/themes/empires-exchange",
      icon: IconPort,
      color: "text-gold"
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section with Image Background */}
      <section className="relative min-h-screen">
        {/* Hero Image Background */}
        <div className="absolute inset-0">
          <img
            src="/images/hero_indian-ocean_aerial_21x9_v1.png"
            alt="Aerial view of the Indian Ocean with ancient trade routes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/50 to-charcoal/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-burgundy/10 to-transparent" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in">
              <h1 className="font-serif text-5xl lg:text-7xl font-bold text-cream mb-6 drop-shadow-2xl tracking-wide">
                Srangam
              </h1>
              <h2 className="font-serif text-2xl lg:text-3xl text-cream/95 mb-8 max-w-3xl mx-auto drop-shadow-lg font-medium">
                Histories of the Indian Ocean World
              </h2>
              <p className="text-lg lg:text-xl text-cream/85 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light">
                Exploring the interconnected histories of the Indian Ocean through archaeology, 
                epigraphy, and deep time perspectives — from monsoon rhythms to stone inscriptions, 
                from pepper routes to tectonic drift.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-burgundy hover:bg-burgundy-light text-cream border-0 shadow-2xl hover:shadow-burgundy/25 transition-all duration-300 hover:scale-105">
                <Link to="/themes/ancient-india">
                  Explore Themes <ArrowRight size={20} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-cream text-cream hover:bg-cream hover:text-charcoal shadow-2xl hover:shadow-cream/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-charcoal/20">
                <Link to="/about">
                  About the Project
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cream/60 rounded-full flex justify-center backdrop-blur-sm bg-charcoal/20 shadow-lg">
            <div className="w-1 h-3 bg-cream/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Recent Research
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Latest findings from our ongoing research into Indian Ocean histories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/field-notes">
                View All Research <ArrowRight size={20} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="py-16 bg-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Research Themes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our interdisciplinary approach to Indian Ocean studies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.slice(0, 3).map((theme) => {
              const IconComponent = theme.icon;
              return (
                <Link
                  key={theme.path}
                  to={theme.path}
                  className="group block p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 hover:border-primary/30"
                >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${theme.color}`}>
                <IconComponent size={32} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {theme.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {themes.slice(3).map((theme) => {
              const IconComponent = theme.icon;
              return (
                <Link
                  key={theme.path}
                  to={theme.path}
                  className="group block p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 hover:border-primary/30"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${theme.color}`}>
                      <IconComponent size={32} />
                    </div>
                    <div>
                <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {theme.title}
                </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/field-notes" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200">
              <BookOpen size={48} className="mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Field Notes</h3>
              <p className="text-muted-foreground">Updates from ongoing fieldwork and new discoveries</p>
            </Link>

            <Link to="/maps-data" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200">
              <Map size={48} className="mx-auto text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Maps & Data</h3>
              <p className="text-muted-foreground">Interactive visualizations and datasets</p>
            </Link>

            <Link to="/about" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200">
              <Users size={48} className="mx-auto text-muted-foreground mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">Learn about our team, methods, and mission</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}