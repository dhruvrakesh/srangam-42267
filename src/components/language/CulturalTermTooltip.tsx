import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info, BookOpen, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getCulturalContext } from '@/data/articles/cultural-terms';
import { cn } from '@/lib/utils';

interface CulturalTermTooltipProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export const CulturalTermTooltip: React.FC<CulturalTermTooltipProps> = ({
  term,
  children,
  className
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Type safety: ensure term is always a string
  if (typeof term !== 'string') {
    console.error('CulturalTermTooltip: term prop must be a string, received:', typeof term, term);
    return <span className={className}>{children}</span>;
  }
  
  // Normalize term: lowercase, trim, and handle hyphens
  const normalizedTerm = term.toLowerCase().trim().replace(/\s+/g, '-');
  
  if (!normalizedTerm) {
    console.error('CulturalTermTooltip: empty term provided');
    return <span className={className}>{children}</span>;
  }
  
  // Try exact match first, then without hyphens as fallback
  let context = getCulturalContext(normalizedTerm, currentLang);
  if (!context) {
    const termWithoutHyphens = normalizedTerm.replace(/-/g, '');
    context = getCulturalContext(termWithoutHyphens, currentLang);
  }
  
  // If term not found in database, render children without tooltip (not [object Object])
  if (!context) {
    return <span className={className}>{children}</span>;
  }
  
  // Type safety: ensure context has required properties
  if (typeof context !== 'object' || !context.translation) {
    console.error('CulturalTermTooltip: invalid context returned for term:', term, context);
    return <span className={className}>{children}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span 
          className={cn(
            "relative inline-block cursor-help group/term",
            "border-b-2 border-dotted border-saffron/50 hover:border-saffron",
            "transition-all duration-300 ease-out",
            "hover:bg-gradient-to-r hover:from-saffron/10 hover:to-transparent",
            "rounded-sm px-1 -mx-0.5",
            "hover:shadow-sm hover:shadow-saffron/20",
            className
          )}
        >
          {children}
          <Info 
            size={11} 
            className="inline ml-1 mb-0.5 text-saffron/60 opacity-0 group-hover/term:opacity-100 transition-opacity duration-200" 
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm p-4 bg-sandalwood/98 backdrop-blur-md border border-burgundy/20 shadow-xl">
        <div className="space-y-3">
          {/* Term Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-burgundy/20">
            <BookOpen size={16} className="text-burgundy" />
            <div>
              <h4 className="font-semibold text-burgundy text-sm">
                {context.translation}
              </h4>
              {context.transliteration && (
                <p className="text-xs text-charcoal/70 italic">
                  {context.transliteration}
                </p>
              )}
            </div>
          </div>

          {/* Etymology */}
          {context.etymology && (
            <div className="text-xs">
              <div className="flex items-center gap-1 mb-1">
                <Globe size={12} className="text-saffron" />
                <span className="font-medium text-saffron">Etymology:</span>
              </div>
              <p className="text-charcoal/80 leading-relaxed">
                {context.etymology}
              </p>
            </div>
          )}

          {/* Cultural Context */}
          {context.culturalContext && (
            <div className="text-xs">
              <div className="flex items-center gap-1 mb-1">
                <Info size={12} className="text-ocean" />
                <span className="font-medium text-ocean">Cultural Context:</span>
              </div>
              <p className="text-charcoal/80 leading-relaxed">
                {context.culturalContext}
              </p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};