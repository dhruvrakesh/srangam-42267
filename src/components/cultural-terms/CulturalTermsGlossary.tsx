import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Languages } from "lucide-react";

interface CulturalTermsGlossaryProps {
  articleContent: string;
}

export function CulturalTermsGlossary({ articleContent }: CulturalTermsGlossaryProps) {
  // Extract italicized terms from article content
  const extractTermsFromContent = (content: string): Set<string> => {
    const terms = new Set<string>();
    const italicPattern = /<em>(.*?)<\/em>|<i>(.*?)<\/i>/g;
    let match;
    
    while ((match = italicPattern.exec(content)) !== null) {
      const term = (match[1] || match[2]).trim();
      if (term.length > 2) {
        terms.add(term.toLowerCase());
      }
    }
    
    return terms;
  };

  const extractedTerms = extractTermsFromContent(articleContent);

  // Fetch cultural terms definitions
  const { data: culturalTerms, isLoading } = useQuery({
    queryKey: ['cultural-terms-glossary', Array.from(extractedTerms)],
    queryFn: async () => {
      if (extractedTerms.size === 0) return [];
      
      const { data, error } = await supabase
        .from('srangam_cultural_terms')
        .select('*')
        .in('term', Array.from(extractedTerms))
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: extractedTerms.size > 0,
  });

  if (extractedTerms.size === 0 || !culturalTerms || culturalTerms.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Cultural Terms Glossary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {culturalTerms.length} term{culturalTerms.length > 1 ? 's' : ''} found in this article
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {culturalTerms.map((term) => (
              <div key={term.id} className="space-y-2 pb-4 border-b last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-primary">
                      {term.display_term}
                    </h4>
                    {term.transliteration && (
                      <p className="text-xs text-muted-foreground italic">
                        {term.transliteration}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {term.module}
                  </Badge>
                </div>

                {/* Translations */}
                {term.translations && (
                  <div className="space-y-1">
                    {Object.entries(term.translations as Record<string, string>).map(([lang, translation]) => (
                      <TooltipProvider key={lang}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm">
                              <Languages className="h-3 w-3 inline mr-1 text-muted-foreground" />
                              {translation}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Translation ({lang.toUpperCase()})</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                )}

                {/* Context */}
                {term.context && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {Object.entries(term.context as Record<string, string>).map(([lang, context]) => (
                      <p key={lang} className="italic">
                        {context}
                      </p>
                    ))}
                  </div>
                )}

                {/* Etymology */}
                {term.etymology && (
                  <div className="text-xs bg-muted/50 rounded p-2">
                    <span className="font-medium">Etymology: </span>
                    {Object.entries(term.etymology as Record<string, string>).map(([lang, etym]) => (
                      <span key={lang}>{etym}</span>
                    ))}
                  </div>
                )}

                {/* Related Terms */}
                {term.related_terms && term.related_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {term.related_terms.map((relatedTerm) => (
                      <Badge key={relatedTerm} variant="outline" className="text-xs">
                        {relatedTerm}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Usage Count */}
                <p className="text-xs text-muted-foreground">
                  Used in {term.usage_count} article{(term.usage_count || 0) > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
