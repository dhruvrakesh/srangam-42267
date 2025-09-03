import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconMonsoon, IconConch, IconLotus } from "@/components/icons";

export default function IndianOceanWorld() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Indian Ocean World");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Ocean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean/15 via-peacock-blue/10 to-lotus-pink/5" />
      <div className="absolute inset-0 opacity-[0.04]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%230066CC' stroke-width='1' opacity='0.3'%3E%3Cpath d='M20 20 Q50 10 80 20 Q90 50 80 80 Q50 90 20 80 Q10 50 20 20'/%3E%3Ccircle cx='50' cy='50' r='15' fill='none'/%3E%3Cpath d='M35 35 Q50 25 65 35 Q75 50 65 65 Q50 75 35 65 Q25 50 35 35' fill='%23FFB6C1' opacity='0.2'/%3E%3C/g%3E%3C/svg%3E")`,
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