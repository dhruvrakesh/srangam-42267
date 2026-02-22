import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";
import { useSearchArticles } from "@/hooks/useSearchArticles";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export function SearchResults({ query, onClose }: SearchResultsProps) {
  const { results, isLoading } = useSearchArticles(query, { limit: 5 });

  const displayResults = results.slice(0, 5);

  if (isLoading && displayResults.length === 0) {
    return (
      <div className="absolute top-full left-0 mt-1 z-50 w-[400px]">
        <Card className="bg-popover backdrop-blur-none border-border shadow-xl">
          <CardContent className="p-4 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Searching...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!query.trim() || query.trim().length < 2) return null;

  if (displayResults.length === 0) {
    return (
      <div className="absolute top-full left-0 mt-1 z-50 w-[400px]">
        <Card className="bg-popover backdrop-blur-none border-border shadow-xl">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 mt-1 z-50 w-[400px]">
      <Card className="bg-popover backdrop-blur-none border-border shadow-xl">
        <CardContent className="p-2 max-h-[420px] overflow-y-auto">
          {displayResults.map((article) => (
            <Link
              key={article.id}
              to={article.slug}
              onClick={onClose}
              className="block p-3 hover:bg-muted rounded-md transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground line-clamp-1">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5 overflow-hidden max-h-7">
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
            </Link>
          ))}
        </CardContent>
        <div className="border-t border-border px-3 py-2">
          <Link 
            to={`/search?query=${encodeURIComponent(query)}`} 
            onClick={onClose}
            className="text-xs text-primary hover:underline"
          >
            View all results →
          </Link>
        </div>
      </Card>
    </div>
  );
}
