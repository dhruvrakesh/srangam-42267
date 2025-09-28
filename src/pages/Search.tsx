import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Search as SearchIcon, Filter, Download, BookOpen, Highlighter, Settings, Brain, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { searchArticles, getAvailableThemes, getSearchSuggestions, exportSearchResults } from "@/lib/searchEngine";
import { isSanskritTerm, getSanskritContext } from "@/lib/sanskritUtils";
import { getDisplayArticles } from "@/lib/multilingualArticleUtils";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("articles");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchField, setSearchField] = useState<'all' | 'title' | 'content' | 'tags' | 'cultural-terms'>('all');
  const [useBoolean, setUseBoolean] = useState(false);
  const [minScore, setMinScore] = useState(10);

  // Update query from URL on mount and when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get("query");
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [location, searchParams]);

  // Update URL when query changes
  const updateSearchParams = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      setSearchParams({ query: newQuery });
    } else {
      setSearchParams({});
    }
  };

  // Enhanced search results using full content search
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const results = searchArticles(query, {
      language: currentLanguage,
      theme: selectedTheme,
      searchInContent: true,
      searchCulturalTerms: true,
      minScore,
      useBoolean,
      searchField
    });

    // Convert search results to display format
    return results.map(result => {
      const displayArticles = getDisplayArticles(currentLanguage);
      const displayArticle = displayArticles.find(da => da.id === result.article.id);
      
      // Helper function to safely extract text from multilingual content
      const extractText = (content: any): string => {
        if (typeof content === 'string') return content;
        if (typeof content === 'object' && content !== null) {
          return content[currentLanguage] as string || 
                 content['en'] as string || 
                 Object.values(content)[0] as string || '';
        }
        return '';
      };
      
      return {
        ...displayArticle,
        id: result.article.id,
        title: extractText(result.article.title),
        excerpt: extractText(result.article.dek),
        slug: `/${result.article.id}`,
        theme: result.metadata.theme,
        tags: result.article.tags.map(tag => extractText(tag)).filter(Boolean),
        readTime: result.metadata.readTime,
        author: result.metadata.author,
        date: result.metadata.date,
        score: result.score,
        matchedContent: result.matchedContent,
        matchType: result.matchType
      };
    });
  }, [query, selectedTheme, currentLanguage]);

  // Available themes for filtering
  const themes = useMemo(() => {
    return getAvailableThemes();
  }, []);

  // Search suggestions
  const suggestions = useMemo(() => {
    return getSearchSuggestions(currentLanguage);
  }, [currentLanguage]);

  // Handle export
  const handleExport = (format: 'json' | 'csv') => {
    const exportData = exportSearchResults(searchResults.map(r => ({
      article: { 
        id: r.id, 
        title: { en: r.title }, 
        dek: { en: r.excerpt }, 
        content: { en: '' }, 
        tags: r.tags.map(tag => ({ en: tag })),
        metadata: {}
      },
      metadata: { theme: r.theme, readTime: r.readTime, author: r.author, date: r.date },
      matchedContent: r.matchedContent || [],
      matchedLanguage: currentLanguage,
      score: r.score || 0,
      matchType: r.matchType || 'content'
    })), format);
    
    const blob = new Blob([exportData], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if query contains Sanskrit terms
  const hasSanskritTerms = query.split(' ').some(term => isSanskritTerm(term));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Search Archives
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore articles, cultural terms, and research across the Indian Ocean world
            </p>
            
            {/* Search Input */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="search"
                  placeholder={useBoolean ? "Try: Muziris AND monsoon, Sanskrit OR dharma" : "Search articles, pins, sources..."}
                  value={query}
                  onChange={(e) => updateSearchParams(e.target.value)}
                  className="pl-10 pr-12 py-3 text-lg"
                  autoFocus
                />
                {hasSanskritTerms && (
                  <Brain className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                )}
              </div>
              
              {/* Advanced Search Toggle */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Search
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-field">Search in:</Label>
                      <Select value={searchField} onValueChange={(value: any) => setSearchField(value)}>
                        <SelectTrigger id="search-field">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fields</SelectItem>
                          <SelectItem value="title">Titles Only</SelectItem>
                          <SelectItem value="content">Content Only</SelectItem>
                          <SelectItem value="tags">Tags Only</SelectItem>
                          <SelectItem value="cultural-terms">Cultural Terms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="min-score">Min. Relevance:</Label>
                      <Select value={minScore.toString()} onValueChange={(value) => setMinScore(parseInt(value))}>
                        <SelectTrigger id="min-score">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Low (5)</SelectItem>
                          <SelectItem value="10">Medium (10)</SelectItem>
                          <SelectItem value="20">High (20)</SelectItem>
                          <SelectItem value="50">Very High (50)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="boolean-search" checked={useBoolean} onCheckedChange={setUseBoolean} />
                        <Label htmlFor="boolean-search">Boolean Search (AND, OR, NOT)</Label>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Filters & Results Count */}
          {query.trim() && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} results for "{query}"
                </p>
                {searchResults.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {selectedTheme === "all" ? "All Themes" : selectedTheme}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme} value={theme}>
                        {theme === "all" ? "All Themes" : theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {searchResults.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.trim() ? (
            searchResults.length > 0 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="articles" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Articles ({searchResults.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="articles" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((article) => (
                      <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            <a href={article.slug} className="hover:text-primary">
                              {article.title}
                            </a>
                          </CardTitle>
                          {article.score && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {article.matchType === 'cultural-term' && '🕉️ Cultural Term'}
                                {article.matchType === 'content' && '📄 Content Match'}
                                {article.matchType === 'title' && '🎯 Title Match'}
                                {article.matchType === 'tag' && '🏷️ Tag Match'}
                              </Badge>
                              <span>Score: {article.score}</span>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                          
                          {/* Show matched content context */}
                          {article.matchedContent && article.matchedContent.length > 0 && (
                            <div className="mb-4 p-2 bg-muted/50 rounded-md">
                              <div className="flex items-center gap-1 mb-1">
                                <Highlighter className="h-3 w-3" />
                                <span className="text-xs font-medium">Match found:</span>
                                {article.matchedContent[0].language !== 'en' && (
                                  <Badge variant="outline" className="text-xs ml-auto">
                                    {article.matchedContent[0].language.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {article.matchedContent[0].context}
                              </p>
                              {/* Sanskrit context */}
                              {isSanskritTerm(article.matchedContent[0].text) && (
                                <div className="mt-1 text-xs text-primary/70">
                                  🕉️ {getSanskritContext(article.matchedContent[0].text, currentLanguage) || "Sanskrit/IAST term"}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{article.theme}</Badge>
                              <span>{article.readTime} min read</span>
                            </div>
                            <span>{new Date(article.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={`${article.id}-tag-${index}`} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setQuery("");
                      setSelectedTheme("all");
                      setSearchParams({});
                    }}
                  >
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            )
          ) : (
            /* Welcome State */
            <div className="text-center py-12">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <SearchIcon className="h-6 w-6" />
                    Start Your Research
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Search across our extensive collection of articles, cultural terms, and research materials.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.slice(0, 8).map(term => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        onClick={() => updateSearchParams(term)}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}