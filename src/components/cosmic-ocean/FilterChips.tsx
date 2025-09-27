import React from 'react';
import { useTranslation } from 'react-i18next';
import { TagChip } from '@/components/ui/TagChip';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';

interface FilterChipsProps {
  selectedFilters: string[];
  onFilterToggle: (filter: string) => void;
}

export function FilterChips({ selectedFilters, onFilterToggle }: FilterChipsProps) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {cosmicOceanI18n.chips.map((chip) => {
        const isSelected = selectedFilters.includes(chip.slug);
        return (
          <button
            key={chip.slug}
            onClick={() => onFilterToggle(chip.slug)}
            className={`transition-all duration-300 ${
              isSelected ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <TagChip 
              variant={isSelected ? "theme" : "default"}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              } ${isHindi ? "font-hindi" : ""}`}
            >
              {isHindi ? chip.label_hi : chip.label_en}
            </TagChip>
          </button>
        );
      })}
    </div>
  );
}