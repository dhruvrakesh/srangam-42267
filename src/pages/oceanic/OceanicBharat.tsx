import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { resolveOceanicArticle } from '@/lib/articleResolver';
import { ResolvedArticle } from '@/lib/articleResolver';
import { MultilingualContent } from '@/types/multilingual';
import { Map, BookOpen, Waves, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedMultilingualText } from '@/components/language/EnhancedMultilingualText';

export default function OceanicBharat() {
  const [articles, setArticles] = useState<ResolvedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadArticles() {
      try {
        const { data, error } = await supabase
          .from('srangam_articles')
          .select('slug, slug_alias')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const resolved = await Promise.all(
            data.map(a => resolveOceanicArticle(a.slug_alias || a.slug))
          );
          setArticles(resolved.filter((a): a is ResolvedArticle => a !== null));
        }
      } catch (error) {
        console.error('Error loading oceanic articles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-ocean/10 via-peacock-blue/5 to-background py-16">
        <div className="absolute inset-0 ocean-waves opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb 
            items={[
              { label: 'Oceanic Bhārat' }
            ]} 
          />
          
          <div className="text-center mt-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-ocean/20 to-peacock-blue/20 p-6 rounded-full backdrop-blur-sm border border-ocean/30">
                <Waves className="text-ocean" size={64} />
              </div>
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-ocean via-peacock-blue to-ocean bg-clip-text text-transparent">
              Oceanic Bhārat
            </h1>
            
            <h2 className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Maritime Knowledge Network of the Indian Ocean World
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {loading ? 'Loading articles...' : (
                <>
                  <span className="text-2xl font-semibold text-ocean">{articles.length}</span> published articles exploring 
                  the Indian Ocean world through dharmic scholarship, archaeological evidence, and maritime history.
                </>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-ocean hover:bg-ocean/90 text-white">
                <Link to="/maps-data">
                  <Map size={20} className="mr-2" />
                  Explore Interactive Map
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-ocean text-ocean hover:bg-ocean hover:text-white">
                <Link to="/articles">
                  <BookOpen size={20} className="mr-2" />
                  Browse All Articles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ocean"></div>
              <p className="mt-4 text-muted-foreground">Loading oceanic articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <Card 
                  key={article.slug} 
                  className="group h-full bg-card/95 backdrop-blur-sm border border-border/70 transition-all duration-300 hover:bg-card hover:border-ocean/50 hover:shadow-xl hover:shadow-ocean/30 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <CardTitle className="font-serif text-xl leading-tight text-foreground group-hover:text-ocean transition-colors">
                      <Link to={`/oceanic/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.abstract}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {article.read_time_min} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={16} />
                        {article.tags.length} tags
                      </span>
                    </div>
                    <Link 
                      to={`/oceanic/${article.slug}`}
                      className="text-ocean hover:text-ocean/80 font-medium text-sm"
                    >
                      Read article →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
