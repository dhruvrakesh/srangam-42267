import { ArticleCard } from "@/components/ui/ArticleCard";
import { getArticlesByTheme } from "@/lib/multilingualArticleUtils";
import { useLanguage } from "@/components/language/LanguageProvider";
import { IconEdict, IconOm, IconScript } from "@/components/icons";

export default function ScriptsInscriptions() {
  const { currentLanguage } = useLanguage();
  const themeArticles = getArticlesByTheme("Scripts & Inscriptions", currentLanguage);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Manuscript Background Layers */}
      <div className="fixed inset-0 -z-10">
        {/* Palm Leaf Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-sand via-cream to-turmeric/30" />
        
        {/* Stone Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-t from-laterite/20 to-transparent" />
        
        {/* Manuscript Lines Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="manuscript-lines" x="0" y="0" width="100%" height="40" patternUnits="userSpaceOnUse">
                <line x1="0" y1="20" x2="100%" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-laterite" />
                <line x1="0" y1="35" x2="100%" y2="35" stroke="currentColor" strokeWidth="0.3" className="text-laterite/50" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#manuscript-lines)" />
          </svg>
        </div>

        {/* Sacred Syllable Background */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-1/4 left-1/6 transform -rotate-12">
            <IconOm size={120} className="text-saffron/30" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 transform rotate-45">
            <IconScript size={80} className="text-laterite/20" />
          </div>
          <div className="absolute top-2/3 left-2/3 transform -rotate-6">
            <IconEdict size={60} className="text-turmeric/25" />
          </div>
        </div>

        {/* Brahmi Script Borders */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-laterite to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-laterite to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-sand to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-sand to-transparent" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          {/* Sacred Script Icons */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="p-4 rounded-lg bg-sand/20 backdrop-blur-sm border border-laterite/30">
              <IconOm size={48} className="text-saffron om-pulse" />
            </div>
            <div className="p-6 rounded-lg bg-cream/20 backdrop-blur-sm border border-turmeric/30">
              <IconScript size={64} className="text-laterite animate-pulse" />
            </div>
            <div className="p-4 rounded-lg bg-turmeric/10 backdrop-blur-sm border border-sand/30">
              <IconEdict size={48} className="text-turmeric animate-pulse" />
            </div>
          </div>

          {/* Sanskrit Title */}
          <div className="mb-6">
            <h2 className="font-sanskrit text-2xl lg:text-3xl text-laterite/80 mb-2">
              धर्मिक शिलालेख
            </h2>
            <p className="text-sm text-laterite/60 italic">Dharmic Shilalekha - Sacred Stone Scripts</p>
          </div>

          <h1 className="font-serif text-4xl lg:text-6xl font-bold text-foreground mb-8 bg-gradient-to-r from-laterite via-saffron to-turmeric bg-clip-text text-transparent">
            Scripts & Inscriptions
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
            Reading stone voices: epigraphy across languages and centuries. From Prakrit to early Tamil, 
            rock inscriptions tell stories of local governance, trade guilds, religious patronage, and the 
            sacred transmission of dharmic knowledge through stone and palm leaf.
          </p>

          {/* Sanskrit Knowledge Quote */}
          <div className="max-w-2xl mx-auto p-6 rounded-lg bg-sand/30 backdrop-blur-sm border border-laterite/20 relative">
            <div className="absolute -top-2 -left-2">
              <IconOm size={24} className="text-saffron/50" />
            </div>
            <p className="font-sanskrit text-lg text-laterite mb-2">
              श्रुति स्मृति विद्यानां आलयं अक्षरमालयम्
            </p>
            <p className="text-sm text-muted-foreground italic">
              "The temple of letters is the abode of sacred knowledge, tradition, and wisdom"
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
            <div className="p-8 rounded-lg bg-sand/20 backdrop-blur-sm border border-laterite/20">
              <IconScript size={48} className="mx-auto mb-4 text-laterite/50" />
              <p className="text-muted-foreground">More epigraphic studies coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}