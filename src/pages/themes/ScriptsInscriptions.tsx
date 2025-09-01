import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconEdict } from "@/components/icons";

export default function ScriptsInscriptions() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Scripts & Inscriptions");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <IconEdict size={64} className="text-laterite" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Scripts & Inscriptions
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Reading stone voices: epigraphy across languages and centuries. From Prakrit to early Tamil, 
            rock inscriptions tell stories of local governance, trade guilds, and religious patronage.
          </p>
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