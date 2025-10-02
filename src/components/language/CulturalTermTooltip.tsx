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
  
  // Normalize term to lowercase for lookup (matching getCulturalContext behavior)
  const normalizedTerm = term.toLowerCase().trim();
  const context = getCulturalContext(normalizedTerm, currentLang);
  
  // Debug log if term not found (remove in production)
  if (!context) {
    console.warn(`Cultural term not found: "${term}" (normalized: "${normalizedTerm}")`);
    return <span className={className}>{children}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span 
          className={cn(
            "relative inline-block cursor-help",
            "border-b border-dotted border-saffron/60 hover:border-saffron",
            "transition-all duration-200 hover:bg-saffron/10 rounded-sm px-1",
            className
          )}
        >
          {children}
          <Info 
            size={12} 
            className="inline ml-1 text-saffron/70 opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm p-4 bg-sandalwood/95 backdrop-blur-sm border border-burgundy/20">
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