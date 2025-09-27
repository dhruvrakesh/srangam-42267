import React from 'react';
import { useTranslation } from 'react-i18next';
import { TagChip } from '@/components/ui/TagChip';
import oceanNetworksI18n from '@/data/ocean_networks/i18n.json';

interface NetworkFilterChipsProps {
  selectedTags: string[];
  onTagToggle: (slug: string) => void;
}

export function NetworkFilterChips({ selectedTags, onTagToggle }: NetworkFilterChipsProps) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {oceanNetworksI18n.chips.map((chip) => {
        const isSelected = selectedTags.includes(chip.slug);
        return (
          <button
            key={chip.slug}
            onClick={() => onTagToggle(chip.slug)}
            className={`transition-all duration-300 ${
              isSelected ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <TagChip 
              variant={isSelected ? "theme" : "default"}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? "bg-ocean text-cream shadow-lg" 
                  : "hover:bg-ocean/10 hover:text-ocean hover:border-ocean/30"
              } ${isHindi ? "font-hindi" : ""}`}
            >
              {isHindi ? chip.hi : chip.en}
            </TagChip>
          </button>
        );
      })}
    </div>
  );
}