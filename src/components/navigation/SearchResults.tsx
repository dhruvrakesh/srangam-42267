import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ARTICLES } from "@/data/siteData";
import { Card, CardContent } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export function SearchResults({ query, onClose }: SearchResultsProps) {
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return ARTICLES.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      article.theme.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  }, [query]);

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 z-50">
        <Card className="bg-background border-border shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50">
      <Card className="bg-background border-border shadow-lg">
        <CardContent className="p-2">
          {results.map((article) => (
            <Link
              key={article.id}
              to={article.slug}
              onClick={onClose}
              className="block p-3 hover:bg-muted rounded-md transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {article.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <TagChip variant="theme" className="text-xs">
                      {article.theme}
                    </TagChip>
                    {article.tags.slice(0, 2).map(tag => (
                      <TagChip key={tag} className="text-xs">
                        {tag}
                      </TagChip>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}