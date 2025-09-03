import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Source {
  author: string;
  title: string;
  publication?: string;
  year?: string;
  url?: string;
  note?: string;
}

interface NavigationBibliographyProps {
  sources: Source[];
}

export function NavigationBibliography({ sources }: NavigationBibliographyProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4 border-t border-border pt-8 mt-12">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Bibliography & Sources
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? (
            <>
              Hide Sources <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show Sources <ChevronDown size={16} />
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This article draws from a diverse range of sources including recently discovered 
            palm-leaf manuscripts, classical Indian texts, and modern archaeological research 
            to present indigenous maritime knowledge systems.
          </p>

          <div className="grid gap-3">
            {sources.map((source, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {source.author}
                    </p>
                    <p className="text-sm text-foreground italic">
                      {source.title}
                    </p>
                    {source.publication && (
                      <p className="text-sm text-muted-foreground">
                        {source.publication}
                        {source.year && `, ${source.year}`}
                      </p>
                    )}
                    {source.note && (
                      <p className="text-xs text-muted-foreground italic">
                        {source.note}
                      </p>
                    )}
                  </div>
                  {source.url && (
                    <a 
                      href={`https://${source.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <strong>Note on Sources:</strong> This research combines traditional scholarship with 
            newly available manuscript evidence and archaeological findings. Some sources like the 
            Kerala palm-leaf manuscript are still under study, representing ongoing discoveries 
            in the field of indigenous maritime knowledge.
          </div>
        </div>
      )}
    </div>
  );
}