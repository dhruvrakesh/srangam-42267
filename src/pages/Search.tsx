import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Search as SearchIcon, Filter, Download, BookOpen, Highlighter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchArticles, getAvailableThemes, getSearchSuggestions } from "@/lib/searchEngine";
import { getDisplayArticles } from "@/lib/multilingualArticleUtils";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("articles");

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
      minScore: 10
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
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="Search articles, pins, sources..."
                value={query}
                onChange={(e) => updateSearchParams(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
                autoFocus
              />
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
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {article.matchedContent[0].context}
                              </p>
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