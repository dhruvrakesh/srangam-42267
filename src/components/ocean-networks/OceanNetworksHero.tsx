import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import oceanNetworksI18n from '@/data/ocean_networks/i18n.json';

export function OceanNetworksHero() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="text-center mb-12" role="region" aria-label={oceanNetworksI18n.hero.aria_label}>
      <div className="mb-6">
        <Badge variant="outline" className="mb-4 px-4 py-2">
          <span className="font-sanskrit">
            {isHindi ? 'समुद्री यात्रा अध्ययन' : 'Maritime Studies'}
          </span>
        </Badge>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
        <div className="font-hindi mb-2">
          {oceanNetworksI18n.hero.title_hi}
        </div>
        <div 
          className="text-2xl md:text-3xl text-muted-foreground font-normal"
          title={oceanNetworksI18n.hero.title_tr}
        >
          {oceanNetworksI18n.hero.title_en}
        </div>
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <p className="text-lg text-muted-foreground mb-2 font-hindi">
          {oceanNetworksI18n.hero.subtitle_hi}
        </p>
        <p className="text-lg text-muted-foreground">
          {oceanNetworksI18n.hero.subtitle_en}
        </p>
      </div>
    </div>
  );
}