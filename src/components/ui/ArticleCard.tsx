import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  theme: string;
  tags: string[];
  readTime: number;
  author: string;
  date: string;
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-serif text-xl leading-tight text-foreground hover:text-ocean transition-colors">
            <Link to={article.slug}>
              {article.title}
            </Link>
          </CardTitle>
          <TagChip variant="theme" className="flex-shrink-0">
            {article.theme}
          </TagChip>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Read in {article.readTime} min
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} className="text-xs">
                {tag}
              </TagChip>
            ))}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {article.author} • {new Date(article.date).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}