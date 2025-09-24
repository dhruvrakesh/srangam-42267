import { ArticleCard } from "@/components/ui/ArticleCard";
import { getArticlesByTheme } from "@/lib/multilingualArticleUtils";
import { useLanguage } from "@/components/language/LanguageProvider";
import { IconScript, IconSarnathLion, IconOm } from "@/components/icons";

export default function AncientIndia() {
  const { currentLanguage } = useLanguage();
  const themeArticles = getArticlesByTheme("Ancient India", currentLanguage);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mauryan Heritage Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-saffron/10 via-sandalwood/20 to-terracotta/10" />
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FF6600' stroke-width='1.5' opacity='0.4'%3E%3Cpath d='M40 10 L50 30 L40 50 L30 30 Z'/%3E%3Ccircle cx='40' cy='40' r='25' fill='none'/%3E%3Cpath d='M40 15 L45 20 L40 25 L35 20 Z' fill='%23D4A574' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dharmic Heritage Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-saffron/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-saffron/20 to-turmeric/20 p-6 rounded-full backdrop-blur-sm border border-saffron/30">
                <IconOm size={52} className="text-saffron" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-terracotta/20 rounded-full blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-terracotta to-saffron p-8 rounded-full shadow-2xl border-2 border-turmeric/30">
                <IconSarnathLion size={64} className="text-cream" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-turmeric/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-turmeric/20 to-sandalwood/20 p-6 rounded-full backdrop-blur-sm border border-turmeric/30">
                <IconScript size={52} className="text-turmeric" />
              </div>
            </div>
          </div>
          <div className="relative">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-saffron via-turmeric to-terracotta bg-clip-text text-transparent">
                प्राचीन भारत
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-terracotta mb-8">
              Dharmic Heritage & Maritime Trade
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              धर्म और व्यापार — Archaeological and textual evidence for dharmic maritime networks: 
              from Mauryan inscriptions to Roman coin hoards, from guild seals to pepper warehouses. 
              Exploring how dharmic principles guided ancient Indian Ocean trade.
            </p>
            <div className="mt-6 h-1 w-32 bg-gradient-to-r from-saffron via-turmeric to-terracotta mx-auto rounded-full"></div>
            
            {/* Sanskrit Shloka */}
            <div className="mt-8 p-6 bg-sandalwood/10 backdrop-blur-sm rounded-2xl border border-saffron/20 max-w-2xl mx-auto">
              <div className="text-saffron font-serif text-lg mb-2">वसुधैव कुटुम्बकम्</div>
              <div className="text-charcoal/70 text-sm italic">
                "The world is one family" — Maha Upanishad 6.72
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