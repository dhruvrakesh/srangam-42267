import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Search as SearchIcon, Filter, Download, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ARTICLES } from "@/data/siteData";

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

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    let results = ARTICLES.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      article.theme.toLowerCase().includes(searchTerm)
    );

    if (selectedTheme !== "all") {
      results = results.filter(article => 
        article.theme.toLowerCase().includes(selectedTheme.toLowerCase())
      );
    }

    return results;
  }, [query, selectedTheme]);

  // Available themes for filtering
  const themes = useMemo(() => {
    const allThemes = Array.from(new Set(ARTICLES.map(article => article.theme)));
    return ["all", ...allThemes];
  }, []);

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
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{article.theme}</Badge>
                              <span>{article.readTime} min read</span>
                            </div>
                            <span>{new Date(article.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
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
                    {["Muziris", "Monsoon", "Chola", "Sanskrit", "Ports"].map(term => (
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