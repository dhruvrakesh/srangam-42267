import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, ArrowRight, Tag, BookOpen, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleCrossReferencesProps {
  articleId: string;
  className?: string;
}

export const ArticleCrossReferences = ({ articleId, className }: ArticleCrossReferencesProps) => {
  const { data: crossRefs, isLoading } = useQuery({
    queryKey: ['cross-references', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_cross_references')
        .select(`
          *,
          target:srangam_articles!target_article_id(
            id,
            slug,
            title,
            theme,
            tags,
            read_time_minutes
          )
        `)
        .eq('source_article_id', articleId)
        .order('strength', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading cross-references...</div>;
  if (!crossRefs || crossRefs.length === 0) return null;

  // Group by reference_type
  const grouped = crossRefs.reduce((acc, ref) => {
    const type = ref.reference_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(ref);
    return acc;
  }, {} as Record<string, typeof crossRefs>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'thematic': return <Tag className="w-4 h-4" />;
      case 'same_theme': return <BookOpen className="w-4 h-4" />;
      case 'explicit_citation': return <Quote className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'thematic': return 'Shared Topics';
      case 'same_theme': return 'Same Theme';
      case 'explicit_citation': return 'Direct Citations';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          Related Articles
          <Badge variant="secondary">{crossRefs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([type, refs]) => (
          <div key={type}>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              {getTypeIcon(type)}
              {getTypeLabel(type)}
              <Badge variant="outline">{refs.length}</Badge>
            </h4>
            <div className="space-y-2">
              {refs.map(ref => (
                <Link
                  key={ref.id}
                  to={`/articles/${ref.target.slug}`}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm line-clamp-1">
                      {ref.target.title?.en || ref.target.slug}
                    </h5>
                    {ref.context_description?.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {ref.context_description.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {ref.target.theme}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ref.target.read_time_minutes} min read
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant={ref.strength >= 8 ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {ref.strength}/10
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
