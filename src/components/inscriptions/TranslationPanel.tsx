import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Languages, MessageSquare, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranslationSet } from '@/data/inscriptions/interfaces';

interface TranslationPanelProps {
  translations: TranslationSet;
  title?: string;
  showAllTypes?: boolean;
  defaultType?: 'primary' | 'literal' | 'contextual' | 'scholarly';
  className?: string;
}

export const TranslationPanel = React.memo(({ 
  translations, 
  title = "Translation Strategy",
  showAllTypes = false,
  defaultType = 'primary',
  className 
}: TranslationPanelProps) => {
  const [activeType, setActiveType] = useState<keyof TranslationSet>(defaultType);

  const translationTypes = [
    { key: 'primary', label: 'Primary', icon: BookOpen, description: 'Main scholarly translation' },
    { key: 'literal', label: 'Literal', icon: Languages, description: 'Word-for-word rendering' },
    { key: 'contextual', label: 'Contextual', icon: MessageSquare, description: 'Cultural context included' },
    { key: 'scholarly', label: 'Scholarly', icon: ScrollText, description: 'Academic interpretation' }
  ] as const;

  const availableTypes = translationTypes.filter(type => translations[type.key]);
  const currentTranslation = translations[activeType];

  if (showAllTypes) {
    return (
      <div className={cn('space-y-4', className)}>
        {title && <h4 className="font-semibold text-foreground mb-2">{title}</h4>}
        
        <div className="space-y-4">
          {availableTypes.map(({ key, label, icon: Icon, description }) => {
            const translation = translations[key];
            if (!translation) return null;

            return (
              <div key={key} className="bg-background border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-saffron" />
                  <h5 className="font-medium text-foreground">{label}</h5>
                  <span className="text-xs text-muted-foreground">({description})</span>
                </div>
                <p className="text-foreground leading-relaxed">{translation}</p>
              </div>
            );
          })}
        </div>

        {translations.notes && translations.notes.length > 0 && (
          <div className="bg-sand/20 border border-burgundy/30 rounded-lg p-4">
            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <ScrollText size={16} className="text-burgundy" />
              Translation Notes
            </h5>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {translations.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-burgundy">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Tabbed interface for single type display
  return (
    <div className={cn('space-y-4', className)}>
      {title && <h4 className="font-semibold text-foreground mb-2">{title}</h4>}
      
      {availableTypes.length > 1 && (
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {availableTypes.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeType === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveType(key)}
              className="flex-1 h-8"
            >
              <Icon size={14} className="mr-1" />
              {label}
            </Button>
          ))}
        </div>
      )}

      <div className="bg-background border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          {(() => {
            const type = availableTypes.find(t => t.key === activeType);
            const Icon = type?.icon || BookOpen;
            return (
              <>
                <Icon size={16} className="text-saffron" />
                <h5 className="font-medium text-foreground">{type?.label} Translation</h5>
                <span className="text-xs text-muted-foreground">({type?.description})</span>
              </>
            );
          })()}
        </div>
        
        <p className="text-foreground leading-relaxed">{currentTranslation}</p>
      </div>

      {translations.notes && translations.notes.length > 0 && (
        <div className="bg-sand/20 border border-burgundy/30 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <ScrollText size={16} className="text-burgundy" />
            Notes
          </h5>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {translations.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-burgundy">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

TranslationPanel.displayName = 'TranslationPanel';