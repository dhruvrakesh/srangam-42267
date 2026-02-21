import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ARTICLES } from "@/data/siteData";
import { Card, CardContent } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";
import { useAllArticles } from "@/hooks/useArticles";
import { useLanguage } from "@/components/language/LanguageProvider";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export function SearchResults({ query, onClose }: SearchResultsProps) {
  const { currentLanguage } = useLanguage();
  const { data: dbArticles } = useAllArticles(currentLanguage);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();

    // Extract text helper for multilingual JSONB fields
    const extractText = (content: any): string => {
      if (typeof content === 'string') return content;
      if (typeof content === 'object' && content !== null) {
        return content[currentLanguage] || content['en'] || Object.values(content)[0] as string || '';
      }
      return '';
    };

    // 1. JSON articles (existing)
    const jsonResults = ARTICLES.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      article.theme.toLowerCase().includes(searchTerm)
    ).map(a => ({ ...a, _source: 'json' as const }));

    const jsonSlugs = new Set(jsonResults.map(a => String(a.id)));

    // 2. DB articles (additive)
    const dbResults = (dbArticles || [])
      .filter(article => !jsonSlugs.has(String(article.id)))
      .filter(article => {
        const title = extractText(article.title).toLowerCase();
        const excerpt = extractText(article.excerpt).toLowerCase();
        const tags = (article.tags || []).map(t => extractText(t).toLowerCase());
        const theme = (article.theme || '').toLowerCase();
        const slug = (article.slug || '').toLowerCase();
        return title.includes(searchTerm) || excerpt.includes(searchTerm) ||
          tags.some(t => t.includes(searchTerm)) || theme.includes(searchTerm) || slug.includes(searchTerm);
      })
      .map(article => ({
        id: article.id,
        title: extractText(article.title),
        excerpt: extractText(article.excerpt),
        slug: article.slug, // already "/articles/..."
        theme: article.theme,
        tags: (article.tags || []).map(t => extractText(t)),
        _source: 'database' as const
      }));

    return [...jsonResults, ...dbResults].slice(0, 8);
  }, [query, dbArticles, currentLanguage]);

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