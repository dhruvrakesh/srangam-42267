import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconBasalt, IconDharmaChakra, IconLotus } from "@/components/icons";

export default function GeologyDeepTime() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Geology & Deep Time");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Deep Time Background */}
      <div className="fixed inset-0 -z-10">
        {/* Cosmic Gradient Base - Deep space to earth tones */}
        <div className="absolute inset-0 bg-gradient-radial from-indigo-dharma/20 via-background to-laterite/30" />
        
        {/* Kalpa Cycles Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="kalpa-cycles" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-dharma" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-laterite" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-turmeric" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-saffron" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kalpa-cycles)" />
          </svg>
        </div>

        {/* Sacred Mountain Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 opacity-15">
          <svg className="w-full h-64" preserveAspectRatio="none" viewBox="0 0 1200 300">
            <path d="M0 300 L200 100 L400 150 L600 80 L800 120 L1000 60 L1200 100 L1200 300 Z" 
                  fill="currentColor" className="text-laterite" />
            <path d="M0 300 L300 180 L500 200 L700 160 L900 180 L1200 150 L1200 300 Z" 
                  fill="currentColor" className="text-turmeric" opacity="0.7" />
          </svg>
        </div>

        {/* Geological Strata Lines */}
        <div className="absolute inset-0 opacity-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} 
                 className="absolute w-full h-px bg-gradient-to-r from-transparent via-laterite to-transparent"
                 style={{ top: `${15 + i * 6}%`, opacity: 0.1 + (i % 3) * 0.1 }} />
          ))}
        </div>

        {/* Cosmic Egg (Hiranyagarbha) */}
        <div className="absolute top-1/4 right-1/4 opacity-5">
          <div className="w-48 h-64 rounded-full border-2 border-saffron/30 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-gold/20" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          {/* Cosmic Icons Trinity */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="p-4 rounded-full bg-indigo-dharma/10 backdrop-blur-sm border border-indigo-dharma/20">
              <IconDharmaChakra size={48} className="text-indigo-dharma chakra-spin" />
            </div>
            <div className="p-6 rounded-full bg-laterite/10 backdrop-blur-sm border border-laterite/20">
              <IconBasalt size={64} className="text-laterite animate-pulse" />
            </div>
            <div className="p-4 rounded-full bg-saffron/10 backdrop-blur-sm border border-saffron/20">
              <IconLotus size={48} className="text-saffron lotus-bloom" />
            </div>
          </div>

          {/* Sanskrit Cosmic Title */}
          <div className="mb-6">
            <h2 className="font-sanskrit text-2xl lg:text-3xl text-indigo-dharma/80 mb-2">
              कल्प चक्र काल
            </h2>
            <p className="text-sm text-indigo-dharma/60 italic">Kalpa Chakra Kala - Cosmic Time Cycles</p>
          </div>

          <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-8 bg-gradient-to-r from-indigo-dharma via-laterite to-saffron bg-clip-text text-transparent">
            Geology & Deep Time
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
            Tectonic histories and the geological foundations of cultural exchange. How the slow drift 
            of continents shaped the spaces where human stories unfolded across cosmic cycles of deep time - 
            from Hiranyagarbha (the cosmic egg) to the sacred mountains that witnessed dharmic civilization.
          </p>

          {/* Sanskrit Cosmic Wisdom */}
          <div className="max-w-2xl mx-auto p-6 rounded-lg bg-indigo-dharma/5 backdrop-blur-sm border border-laterite/20">
            <p className="font-sanskrit text-lg text-laterite mb-2">
              हिरण्यगर्भः समवर्तताग्रे भूतस्य जातः पतिरेक आसीत्
            </p>
            <p className="text-sm text-muted-foreground italic">
              "Hiranyagarbha arose first - the golden cosmic egg from which all existence emerged"
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
            <div className="p-8 rounded-lg bg-indigo-dharma/5 backdrop-blur-sm border border-laterite/20">
              <IconBasalt size={48} className="mx-auto mb-4 text-laterite/50" />
              <p className="text-muted-foreground">More geological dharma studies coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}