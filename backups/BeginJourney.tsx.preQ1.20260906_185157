import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  IconSarnathLion, IconConch, IconOm, IconBasalt, IconDharmaChakra, 
  IconLotus, IconScript, IconMonsoon 
} from "@/components/icons";
import { 
  ArrowRight, Network, BookOpen, Database, Languages, 
  Map, Waves, Mountain, ScrollText, Compass, Users 
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useResearchStats, getThemeArticleCount } from "@/hooks/useResearchStats";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ResearchMetrics, MetricConfig } from "@/components/research/ResearchMetrics";
import { researchThemes } from "@/data/researchThemes";

// Featured entry points for different reader interests
const entryPoints = [
  {
    title: "Start Here",
    description: "Introductory articles for newcomers to Indian Ocean history",
    icon: Compass,
    path: "/articles",
    articles: ["Monsoon Trade Clock", "Scripts That Sailed"],
  },
  {
    title: "Deep Scholarship",
    description: "Long-form research for serious readers (45+ min reads)",
    icon: ScrollText,
    path: "/themes/ancient-india",
    articles: ["Reassessing Ṛgveda Antiquity", "Rishi Genealogies"],
  },
  {
    title: "Interactive Tools",
    description: "Sanskrit translator, Jyotish calculator, and research network",
    icon: Languages,
    path: "/sanskrit-translator",
    articles: ["Sanskrit Translator", "Jyotish Horoscope"],
  },
];

export default function BeginJourney() {
  const { t } = useTranslation();
  const { totalArticles, crossReferences, culturalTerms, themes, isLoading } = useResearchStats();
  
  // Intersection observers for scroll animations
  const heroSection = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const pillarsSection = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const databaseSection = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const ctaSection = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  // Build research metrics configuration for shared component
  const researchMetrics: MetricConfig[] = [
    { value: totalArticles, label: "Published Articles", sublabel: "Long-form research", suffix: "+", color: "saffron" },
    { value: crossReferences, label: "Cross-References", sublabel: "Interconnected scholarship", color: "peacock-blue" },
    { value: culturalTerms, label: "Cultural Terms", sublabel: "Sanskrit & regional vocabulary", color: "terracotta" },
    { value: 5, label: "Research Themes", sublabel: "Multidisciplinary pillars", color: "turmeric" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Begin Your Journey | Srangam — Histories of the Indian Ocean World</title>
        <meta name="description" content={`Explore ${totalArticles}+ research articles, 5 thematic pillars, and ${culturalTerms.toLocaleString()} cultural terms. Where sacred waters meet stone records — dharmic scholarship meets archaeological rigor.`} />
        <link rel="canonical" href="https://srangam.nartiang.org/begin-journey" />
      </Helmet>

      {/* Mission Statement Hero */}
      <section 
        ref={heroSection.ref}
        className={`relative py-20 lg:py-32 overflow-hidden transition-all duration-700 ease-out ${
          heroSection.isIntersecting 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Dharmic Background Pattern */}
        <div className="absolute inset-0 sri-yantra-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sanskrit Invocation */}
          <div className="text-center mb-8">
            <p className="text-saffron/80 text-lg font-serif mb-2">
              ॐ सरस्वत्यै नमः
            </p>
            <p className="text-sm text-muted-foreground italic">
              Salutations to Sarasvati, goddess of knowledge and wisdom
            </p>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              सागर इतिहास संग्रह
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl text-muted-foreground mb-6">
              Where Sacred Waters Meet Stone Records
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              <strong className="text-foreground">Dharmic scholarship meets archaeological rigor.</strong>{" "}
              We triangulate civilizational memory through primary sources — from Vedic hymns 
              to maritime inscriptions, from monsoon patterns to tectonic shifts.
            </p>
          </div>

          {/* Three Methodological Pillars */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-card/50 border border-border">
              <Mountain className="w-8 h-8 mx-auto mb-3 text-terracotta" />
              <h3 className="font-semibold text-foreground mb-2">Archaeological</h3>
              <p className="text-sm text-muted-foreground">
                Epigraphy, numismatics, and material culture
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 border border-border">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-burgundy" />
              <h3 className="font-semibold text-foreground mb-2">Textual</h3>
              <p className="text-sm text-muted-foreground">
                Purāṇas, itihāsa, and śāstric literature
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 border border-border">
              <Map className="w-8 h-8 mx-auto mb-3 text-peacock-blue" />
              <h3 className="font-semibold text-foreground mb-2">Geo-mythological</h3>
              <p className="text-sm text-muted-foreground">
                Sacred geography meets geological memory
              </p>
            </div>
          </div>

          {/* Research Metrics with Staggered Animation */}
          <ResearchMetrics
            metrics={researchMetrics}
            isLoading={isLoading}
            isVisible={heroSection.isIntersecting}
            variant="minimal"
            staggerDelay={200}
            animationDuration={2000}
          />
        </div>
      </section>

      {/* Five Pillars of Research */}
      <section 
        ref={pillarsSection.ref}
        className={`py-16 bg-muted/30 transition-all duration-700 ease-out ${
          pillarsSection.isIntersecting 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <IconDharmaChakra size={48} className="text-turmeric animate-pulse-gentle" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              पञ्च स्तम्भ — Five Pillars of Research
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our scholarship spans five interconnected domains, each illuminating different 
              facets of civilizational continuity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchThemes.map((theme, index) => {
              const IconComponent = theme.icon;
              const articleCount = getThemeArticleCount(themes, theme.id);
              
              return (
                <Link
                  key={theme.id}
                  to={theme.path}
                  className={`group block transition-all duration-500 ease-out ${
                    pillarsSection.isIntersecting 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Card className={`h-full transition-all duration-300 ${theme.borderColor} ${theme.hoverBorderColor} hover:shadow-lg`}>
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-full ${theme.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent size={24} className={theme.color} />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-foreground group-hover:text-saffron transition-colors">
                          {theme.name}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                          {isLoading ? (
                            <Skeleton className="h-4 w-12" />
                          ) : (
                            `${articleCount} articles`
                          )}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-saffron/70 font-serif">
                        {theme.nameSanskrit}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {theme.description}
                      </CardDescription>
                      <div className="flex items-center mt-4 text-sm font-medium text-muted-foreground group-hover:text-saffron transition-colors">
                        Explore theme
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {/* Research Network Card */}
            <Link 
              to="/research-network" 
              className={`group block md:col-span-2 lg:col-span-1 transition-all duration-500 ease-out ${
                pillarsSection.isIntersecting 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <Card className="h-full border-peacock-blue/30 hover:border-peacock-blue transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-peacock-blue/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-full bg-peacock-blue/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Network size={24} className="text-peacock-blue" />
                  </div>
                  <CardTitle className="text-foreground group-hover:text-peacock-blue transition-colors">
                    Research Network
                  </CardTitle>
                  <p className="text-sm text-peacock-blue/70 font-serif">
                    ज्ञान जाल — Knowledge Web
                  </p>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed mb-4">
                    {isLoading ? (
                      <>Visualize how our cross-references connect articles across themes, methods, and regions.</>
                    ) : (
                      <>Visualize how our {crossReferences.toLocaleString()} cross-references connect articles across themes, methods, and regions.</>
                    )}
                  </CardDescription>
                  <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-peacock-blue transition-colors">
                    Explore connections
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Cultural Database Teaser */}
      <section 
        ref={databaseSection.ref}
        className={`py-16 bg-background transition-all duration-700 ease-out ${
          databaseSection.isIntersecting 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center">
                  <Database className="w-6 h-6 text-saffron" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    शब्दकोश — Cultural Database
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading..." : `${culturalTerms.toLocaleString()}+ Sanskrit & regional terms`}
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every cultural term in our articles is enriched with AI-powered etymology, 
                transliteration, and contextual meaning. From <em>dharma</em> to <em>dhow</em>, 
                from <em>yātrā</em> to <em>yupa</em> — understand the vocabulary of 
                civilizational discourse.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {["dharma", "mokṣa", "yātrā", "śilā", "samudra", "prabhāsa"].map((term) => (
                  <span 
                    key={term}
                    className="px-3 py-1.5 bg-saffron/10 text-saffron border border-saffron/20 rounded-full text-sm font-medium hover:bg-saffron/20 transition-colors cursor-pointer"
                  >
                    {term}
                  </span>
                ))}
              </div>

              <Button asChild variant="outline" className="border-saffron text-saffron hover:bg-saffron hover:text-charcoal-om">
                <Link to="/sources/sanskrit-terminology">
                  <Languages className="w-4 h-4 mr-2" />
                  Explore Terminology
                </Link>
              </Button>
            </div>

            {/* Right: Entry Points */}
            <div className="space-y-4">
              <h4 className="font-serif text-xl font-semibold text-foreground mb-4">
                Choose Your Path
              </h4>
              {entryPoints.map((entry, index) => {
                const IconComponent = entry.icon;
                return (
                  <Link
                    key={entry.title}
                    to={entry.path}
                    className={`group block p-4 rounded-lg border border-border hover:border-saffron/50 hover:shadow-md transition-all bg-card ${
                      databaseSection.isIntersecting 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: `${index * 100 + 200}ms`, transitionDuration: '500ms' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-saffron/10 transition-colors">
                        <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-saffron transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-foreground group-hover:text-saffron transition-colors">
                          {entry.title}
                        </h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          {entry.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {entry.articles.map((article) => (
                            <span key={article} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {article}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-saffron group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section 
        ref={ctaSection.ref}
        className={`py-16 bg-indigo-dharma/5 border-t border-border transition-all duration-700 ease-out ${
          ctaSection.isIntersecting 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <IconLotus size={48} className="text-lotus-pink animate-pulse-gentle" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Ready to Begin?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose a theme that interests you, or explore our interconnected research network 
            to discover how ancient knowledge systems connect across time and space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-saffron hover:bg-saffron-light text-charcoal-om">
              <Link to="/themes/ancient-india">
                <IconSarnathLion size={20} className="mr-2" />
                Start with Ancient India
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream">
              <Link to="/research-network">
                <Network size={20} className="mr-2" />
                Explore Research Network
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/about">
                <Users size={20} className="mr-2" />
                About the Project
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
