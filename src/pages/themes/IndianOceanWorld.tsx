import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconMonsoon, IconConch, IconLotus } from "@/components/icons";

export default function IndianOceanWorld() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Indian Ocean World");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Ocean Background - Enhanced Visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean/30 via-peacock-blue/25 to-lotus-pink/20" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-dharma/10 via-transparent to-ocean/15" />
      <div className="absolute inset-0 opacity-15" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23004D5C' stroke-width='1.5' opacity='0.6'%3E%3Cpath d='M20 20 Q60 10 100 20 Q110 60 100 100 Q60 110 20 100 Q10 60 20 20' fill='none'/%3E%3Ccircle cx='60' cy='60' r='25' fill='none' stroke='%230088B3'/%3E%3Cpath d='M30 30 Q60 15 90 30 Q105 60 90 90 Q60 105 30 90 Q15 60 30 30' fill='%23E79CC2' opacity='0.3'/%3E%3Cg stroke='%230E6F7C' stroke-width='0.8' opacity='0.4'%3E%3Cpath d='M45 45 L75 75 M75 45 L45 75' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '160px 160px, 80px 80px',
             backgroundPosition: '0 0, 40px 40px'
           }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Varuna's Cosmic Ocean Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-lotus-pink/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-lotus-pink/20 to-ocean/20 p-6 rounded-full backdrop-blur-sm border border-lotus-pink/30">
                <IconLotus size={52} className="text-lotus-pink" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-ocean/20 rounded-full blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-ocean to-peacock-blue p-8 rounded-full shadow-2xl border-2 border-lotus-pink/20">
                <IconMonsoon size={64} className="text-cream" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-peacock-blue/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-peacock-blue/20 to-ocean/20 p-6 rounded-full backdrop-blur-sm border border-peacock-blue/30">
                <IconConch size={52} className="text-peacock-blue" />
              </div>
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