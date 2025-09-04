import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconSarnathLion, IconDharmaChakra, IconConch } from "@/components/icons";

export default function EmpiresExchange() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Empires & Exchange");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Simplified Imperial Background - Optimized for Text Visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-burgundy/8 via-gold-warm/6 to-saffron/5" />
      
      {/* Subtle Sacred Geometry Pattern */}
      <div className="absolute inset-0 dharma-scroll opacity-10" />
      
      {/* Minimal Dharmic Accents */}
      <div className="absolute top-20 right-20 w-32 h-32 border border-gold-warm/15 rounded-full animate-pulse-gentle" />
      <div className="absolute bottom-20 left-20 w-24 h-24 border border-saffron/15 rounded-full animate-float" />
      <div className="absolute top-1/2 left-10 w-20 h-20 border border-burgundy/10 rounded-full animate-pulse-gentle" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          {/* Dharmic Icons Trinity - Enhanced Interactivity */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="group p-6 rounded-full bg-gold-warm/25 backdrop-blur-sm border-2 border-gold-warm/40 hover:border-gold-warm/70 hover:bg-gold-warm/35 transition-all duration-300 hover:scale-110 cursor-pointer hover:animate-glow">
              <IconSarnathLion size={52} className="text-gold-warm group-hover:text-gold animate-pulse-gentle group-hover:animate-float" />
            </div>
            <div className="group p-8 rounded-full bg-saffron/25 backdrop-blur-sm border-2 border-saffron/40 hover:border-saffron/70 hover:bg-saffron/35 transition-all duration-300 hover:scale-110 cursor-pointer hover:animate-glow">
              <IconDharmaChakra size={68} className="text-saffron group-hover:text-saffron/90 chakra-spin group-hover:animate-slow-spin" />
            </div>
            <div className="group p-6 rounded-full bg-burgundy/25 backdrop-blur-sm border-2 border-burgundy/40 hover:border-burgundy/70 hover:bg-burgundy/35 transition-all duration-300 hover:scale-110 cursor-pointer hover:animate-glow">
              <IconConch size={52} className="text-burgundy group-hover:text-burgundy-light animate-pulse-gentle group-hover:animate-float" />
            </div>
          </div>

          {/* Sanskrit Title */}
          <div className="mb-6">
            <h2 className="font-sanskrit text-2xl lg:text-3xl text-gold/80 mb-2">
              चक्रवर्ति राज्य
            </h2>
            <p className="text-sm text-gold/60 italic">Chakravartin Rajya - Universal Empire</p>
          </div>

          <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-8 bg-gradient-to-r from-gold via-saffron to-burgundy bg-clip-text text-transparent">
            Empires & Exchange
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
            Political networks and economic flows from local to imperial scales. How goods, ideas, 
            and power moved across the Indian Ocean world through imperial structures and the dharmic 
            principles of righteous governance.
          </p>

          {/* Sanskrit Wisdom */}
          <div className="max-w-2xl mx-auto p-6 rounded-lg bg-background/50 backdrop-blur-sm border border-gold/20">
            <p className="font-sanskrit text-lg text-gold mb-2">
              राजा कालस्य कारणम्
            </p>
            <p className="text-sm text-muted-foreground italic">
              "The king is the cause of time" - Dharmic principle of sovereign responsibility
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themeArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Placeholder for more content */}
        {themeArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="p-8 rounded-lg bg-background/30 backdrop-blur-sm border border-gold/20">
              <IconDharmaChakra size={48} className="mx-auto mb-4 text-gold/50" />
              <p className="text-muted-foreground">More articles on dharmic governance coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}