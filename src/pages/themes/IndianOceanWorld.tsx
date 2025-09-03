import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconMonsoon, IconConch, IconLotus } from "@/components/icons";

export default function IndianOceanWorld() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Indian Ocean World");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Ocean Background - Maximum Visibility Enhancement */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean/45 via-peacock-blue/35 to-lotus-pink/25" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-dharma/20 via-transparent to-ocean/30" />
      <div className="absolute inset-0 bg-gradient-to-bl from-saffron/15 via-transparent to-turmeric/20" />
      
      {/* Enhanced Sacred Ocean Patterns */}
      <div className="absolute inset-0 opacity-25" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23004D5C' stroke-width='2' opacity='0.8'%3E%3Cpath d='M20 20 Q70 5 120 20 Q135 70 120 120 Q70 135 20 120 Q5 70 20 20' fill='none'/%3E%3Ccircle cx='70' cy='70' r='35' fill='none' stroke='%230088B3' stroke-width='2.5'/%3E%3Cpath d='M25 25 Q70 10 115 25 Q130 70 115 115 Q70 130 25 115 Q10 70 25 25' fill='%23E79CC2' opacity='0.4'/%3E%3Cg stroke='%230E6F7C' stroke-width='1.5' opacity='0.6'%3E%3Cpath d='M50 50 L90 90 M90 50 L50 90' /%3E%3Ccircle cx='35' cy='35' r='8' fill='%23FF8C00' opacity='0.5'/%3E%3Ccircle cx='105' cy='105' r='6' fill='%23E6B547' opacity='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '200px 200px, 100px 100px',
             backgroundPosition: '0 0, 50px 50px'
           }} />

      {/* Varuna's Divine Waters - Animated Waves */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-full h-32 bg-gradient-to-r from-transparent via-ocean/30 to-transparent animate-float" style={{ top: '20%' }} />
        <div className="absolute w-full h-24 bg-gradient-to-r from-transparent via-peacock-blue/25 to-transparent animate-float" style={{ top: '60%', animationDelay: '1s' }} />
        <div className="absolute w-full h-20 bg-gradient-to-r from-transparent via-lotus-pink/20 to-transparent animate-float" style={{ bottom: '10%', animationDelay: '2s' }} />
      </div>
      
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
              Samudra Manthan — The Cosmic Ocean
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              वरुण का क्षेत्र — Varuna's sacred realm where monsoon rhythms dance with maritime dharma. 
              From seasonal trading cycles guided by celestial movements to cultural practices emerging 
              around waiting, weather, and the eternal dance of ocean and sky.
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themeArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Placeholder for more content */}
        {themeArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">More articles coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}