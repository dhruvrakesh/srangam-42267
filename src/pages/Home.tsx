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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sand via-background to-sand py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Srangam
            </h1>
            <h2 className="font-serif text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Histories of the Indian Ocean World
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Exploring the interconnected histories of the Indian Ocean through archaeology, 
              epigraphy, and deep time perspectives — from monsoon rhythms to stone inscriptions, 
              from pepper routes to tectonic drift.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-ocean hover:bg-ocean/90">
                <Link to="/themes/ancient-india">
                  Explore Themes <ArrowRight size={20} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">
                  About the Project
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <IconMonsoon className="absolute top-1/4 left-1/4 text-ocean/20" size={64} />
          <IconScript className="absolute top-1/3 right-1/4 text-gold/20" size={48} />
          <IconBasalt className="absolute bottom-1/4 left-1/3 text-laterite/20" size={56} />
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
                  className="group block p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 hover:border-ocean/30"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${theme.color}`}>
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-ocean transition-colors mb-2">
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
                  className="group block p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200 hover:border-ocean/30"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${theme.color}`}>
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-ocean transition-colors mb-2">
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
              <BookOpen size={48} className="mx-auto text-ocean mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Field Notes</h3>
              <p className="text-muted-foreground">Updates from ongoing fieldwork and new discoveries</p>
            </Link>

            <Link to="/maps-data" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200">
              <Map size={48} className="mx-auto text-gold mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Maps & Data</h3>
              <p className="text-muted-foreground">Interactive visualizations and datasets</p>
            </Link>

            <Link to="/about" className="group text-center p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200">
              <Users size={48} className="mx-auto text-laterite mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">Learn about our team, methods, and mission</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}