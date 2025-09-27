import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';

export function CosmicOceanHero() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <TooltipProvider>
      <div className="text-center mb-12" role="region" aria-label={cosmicOceanI18n.hero.aria_label}>
        <div className="mb-6">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10">
            <span className="font-sanskrit text-primary">
              {isHindi ? 'समुद्री डेटा विज़ुअलाइज़ेशन' : 'Maritime Data Visualization'}
            </span>
          </Badge>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4 cursor-help">
              <div className="font-hindi mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {cosmicOceanI18n.hero.title_hi}
              </div>
              <div className="text-2xl md:text-3xl text-muted-foreground font-normal">
                {cosmicOceanI18n.hero.title_en}
              </div>
            </h1>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-sanskrit">{cosmicOceanI18n.hero.title_tr}</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-muted-foreground mb-2 font-hindi leading-relaxed">
            {cosmicOceanI18n.hero.subtitle_hi}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {cosmicOceanI18n.hero.subtitle_en}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}