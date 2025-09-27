import { useState } from 'react';
import { TagChip } from "@/components/ui/TagChip";
import { useTranslation } from 'react-i18next';
import taxonomyData from '@/data/field_notes/taxonomy.json';

interface TaxonomyChipsProps {
  selectedTags: string[];
  onTagToggle: (slug: string) => void;
}

export function TaxonomyChips({ selectedTags, onTagToggle }: TaxonomyChipsProps) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {taxonomyData.chips.map((chip) => {
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
                  ? "bg-burgundy text-cream shadow-lg" 
                  : "hover:bg-burgundy/10 hover:text-burgundy hover:border-burgundy/30"
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