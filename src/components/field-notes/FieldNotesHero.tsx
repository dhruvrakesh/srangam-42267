import { Search } from "lucide-react";
import { IconDharmaChakra, IconSarnathLion } from "@/components/icons";
import { useTranslation } from 'react-i18next';

export function FieldNotesHero() {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-16" role="region" aria-label={t('fieldNotes.hero.subtitle_long_en')}>
      <div className="flex justify-center items-center gap-8 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-terracotta/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
          <div className="relative bg-gradient-to-br from-terracotta/20 to-laterite/20 p-6 rounded-full backdrop-blur-sm border border-terracotta/30">
            <IconSarnathLion size={52} className="text-terracotta" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-2xl transform scale-110"></div>
          <div className="relative bg-gradient-to-br from-burgundy to-burgundy-light p-8 rounded-full shadow-2xl border-2 border-saffron/20">
            <Search size={56} className="text-cream" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-dharma/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
          <div className="relative bg-gradient-to-br from-indigo-dharma/20 to-peacock-blue/20 p-6 rounded-full backdrop-blur-sm border border-indigo-dharma/30">
            <IconDharmaChakra size={52} className="text-indigo-dharma" />
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-burgundy/10 to-gold-warm/10 border border-burgundy/20 rounded-full text-sm font-medium text-burgundy mb-6">
            {t('fieldNotes.section_badge.label_hi')} • {t('fieldNotes.section_badge.label_en')}
          </span>
        </div>
        
        <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-terracotta via-burgundy to-terracotta bg-clip-text text-transparent font-hindi">
            {t('fieldNotes.hero.title_hi')}
          </span>
        </h1>
        
        <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-burgundy mb-8">
          {t('fieldNotes.hero.title_en')}
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-charcoal/80 leading-relaxed mb-6 font-medium">
            <span className="font-hindi">{t('fieldNotes.hero.subtitle_short_hi')}</span>
            <br />
            <span className="mt-2 block">{t('fieldNotes.hero.subtitle_short_en')}</span>
          </p>
          <p className="text-lg text-charcoal/70 leading-relaxed mb-6">
            {t('fieldNotes.hero.subtitle_long_en')}
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-terracotta via-burgundy to-saffron mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
}