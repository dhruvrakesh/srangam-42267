import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconSarnathLion, IconDharmaChakra, IconConch } from "@/components/icons";

export default function EmpiresExchange() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Empires & Exchange");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dharmic Background Layers - Enhanced Visibility */}
      <div className="absolute inset-0 -z-10">
        {/* Royal Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy/35 via-gold-warm/20 to-saffron/15" />
        <div className="absolute inset-0 bg-gradient-to-tl from-terracotta/15 via-transparent to-burgundy/25" />
        
        {/* Mandala Patterns - Enhanced Visibility */}
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute top-1/4 left-1/4 w-96 h-96 text-gold animate-slow-spin" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
            <g stroke="currentColor" strokeWidth="0.3" opacity="0.6">
              {[...Array(8)].map((_, i) => (
                <line key={i} x1="100" y1="20" x2="100" y2="40" transform={`rotate(${i * 45} 100 100)`} />
              ))}
            </g>
          </svg>
          <svg className="absolute bottom-1/4 right-1/4 w-64 h-64 text-saffron animate-reverse-spin" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <g stroke="currentColor" strokeWidth="0.3" opacity="0.4">
              {[...Array(12)].map((_, i) => (
                <line key={i} x1="100" y1="30" x2="100" y2="50" transform={`rotate(${i * 30} 100 100)`} />
              ))}
            </g>
          </svg>
        </div>

        {/* Imperial Motifs - Enhanced Visibility */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 right-20 w-32 h-32 border-2 border-gold-warm/40 rounded-full shadow-lg shadow-gold-warm/20" />
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-saffron/40 rounded-full shadow-lg shadow-saffron/20" />
          <div className="absolute top-1/2 left-10 w-16 h-16 border-2 border-burgundy/40 rounded-full shadow-lg shadow-burgundy/20" />
          <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-terracotta/30 rounded-full" />
          <div className="absolute bottom-1/3 left-1/2 w-12 h-12 border border-lotus-pink/30 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          {/* Dharmic Icons Trinity */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="p-4 rounded-full bg-gold/10 backdrop-blur-sm border border-gold/20">
              <IconSarnathLion size={48} className="text-gold animate-pulse" />
            </div>
            <div className="p-6 rounded-full bg-saffron/10 backdrop-blur-sm border border-saffron/20">
              <IconDharmaChakra size={64} className="text-saffron chakra-spin" />
            </div>
            <div className="p-4 rounded-full bg-burgundy/10 backdrop-blur-sm border border-burgundy/20">
              <IconConch size={48} className="text-burgundy animate-pulse" />
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