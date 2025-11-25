import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDisplayArticles } from "@/lib/multilingualArticleUtils";
import { mergeArticleSources, filterUnifiedArticles } from "@/lib/unifiedArticleUtils";
import { useAllArticles } from "@/hooks/useArticles";
import { useLanguage } from "@/components/language/LanguageProvider";
import { ArticleThemeChips } from "@/components/articles/ArticleThemeChips";
import { IconConch, IconLotus } from "@/components/icons";
import { Search, BookOpen, Filter, Loader2 } from "lucide-react";
import { useDynamicSEO } from "@/hooks/useDynamicSEO";

export default function Articles() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL params for shareability
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    searchParams.get('themes')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'longest' | 'shortest' | 'title'>(
    (searchParams.get('sort') as any) || 'recent'
  );

  // Fetch database articles
  const { data: dbArticles, isLoading } = useAllArticles(currentLanguage);

  // Merge JSON and database articles
  const allArticles = useMemo(() => {
    const jsonArticles = getDisplayArticles(currentLanguage);
    return mergeArticleSources(jsonArticles, dbArticles);
  }, [currentLanguage, dbArticles]);

  // Get filtered articles
  const filteredArticles = useMemo(() => 
    filterUnifiedArticles(allArticles || [], {
      themes: selectedThemes.length > 0 ? selectedThemes : undefined,
      sortBy,
      searchQuery
    }),
    [allArticles, selectedThemes, sortBy, searchQuery]
  );

  // Dynamic SEO generation
  const { data: seoData } = useDynamicSEO({
    themes: selectedThemes.length > 0 ? selectedThemes : undefined,
    searchQuery: searchQuery || undefined,
    sortBy,
  });

  // Update URL params when filters change
  const updateURLParams = (themes: string[], sort: string, query: string) => {
    const params = new URLSearchParams();
    if (themes.length > 0) params.set('themes', themes.join(','));
    if (sort !== 'recent') params.set('sort', sort);
    if (query.trim()) params.set('q', query);
    setSearchParams(params);
  };

  const handleThemeToggle = (theme: string) => {
    let newThemes: string[];
    if (theme === 'all') {
      newThemes = [];
    } else {
      newThemes = selectedThemes.includes(theme)
        ? selectedThemes.filter(t => t !== theme)
        : [...selectedThemes, theme];
    }
    setSelectedThemes(newThemes);
    updateURLParams(newThemes, sortBy, searchQuery);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
    updateURLParams(selectedThemes, value, searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURLParams(selectedThemes, sortBy, value);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic SEO Head */}
      <Helmet>
        <title>Research Archive | Srangam - {filteredArticles?.length ?? 0} Articles</title>
        <meta 
          name="description" 
          content={seoData?.metaDescription || `Browse ${filteredArticles?.length ?? 0} scholarly articles on Ancient India, Maritime Trade, Sanskrit Literature, Sacred Ecology, and Cultural Continuity. Peer-reviewed research with cross-references.`} 
        />
        <meta 
          name="keywords" 
          content="Ancient India, Sanskrit Literature, Maritime Trade, Cultural Continuity, Vedic Period, Epigraphy, Puranic Literature, Sacred Ecology, Geology, Deep Time" 
        />
        <link rel="canonical" href="https://srangam.lovable.app/articles" />
        
        {/* Schema.org Structured Data */}
        {seoData?.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(seoData.structuredData)}
          </script>
        )}
      </Helmet>

      {/* Background patterns */}
      <div className="fixed inset-0 dharma-scroll opacity-20 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <IconConch size={64} className="text-peacock-blue om-pulse" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('pages.articles.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
            {t('pages.articles.description')}
          </p>
          <p className="text-sm text-muted-foreground">
            <BookOpen size={16} className="inline mr-1" />
            {filteredArticles?.length ?? 0} {t('filters.articlesFound')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder={t('search.searchArticles')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg border-2 border-border focus:border-saffron transition-colors"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-saffron" />
            <h3 className="font-serif text-lg font-semibold">{t('filters.filterByTheme')}</h3>
          </div>
          
          <ArticleThemeChips 
            selectedThemes={selectedThemes}
            onThemeToggle={handleThemeToggle}
          />

          {/* Sort Dropdown */}
          <div className="flex justify-end mt-4">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('sort.mostRecent')}</SelectItem>
                <SelectItem value="oldest">{t('sort.oldest')}</SelectItem>
                <SelectItem value="longest">{t('sort.longestReads')}</SelectItem>
                <SelectItem value="shortest">{t('sort.shortestReads')}</SelectItem>
                <SelectItem value="title">{t('sort.alphabetical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-peacock-blue" size={32} />
            <span className="ml-3 text-muted-foreground">Loading articles...</span>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : !isLoading ? (
          <div className="text-center py-16">
            <IconLotus size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">{t('search.noResults')}</p>
            <Button 
              onClick={() => {
                setSelectedThemes([]);
                setSearchQuery('');
                updateURLParams([], 'recent', '');
              }}
              variant="outline"
              className="mt-4"
            >
              {t('actions.clearFilters')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
