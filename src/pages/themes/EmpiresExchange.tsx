import { ArticleCard } from "@/components/ui/ArticleCard";
import { ARTICLES } from "@/data/siteData";
import { IconPort } from "@/components/icons";

export default function EmpiresExchange() {
  const themeArticles = ARTICLES.filter(article => article.theme === "Empires & Exchange");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <IconPort size={64} className="text-gold" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Empires & Exchange
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Political networks and economic flows from local to imperial scales. How goods, ideas, 
            and power moved across the Indian Ocean world through imperial structures and beyond them.
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