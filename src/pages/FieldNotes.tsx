import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { FieldNotesHero, TaxonomyChips, ResearchEntry } from "@/components/field-notes";
import entriesData from '@/data/field_notes/entries.json';

export default function FieldNotes() {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter entries based on selected tags
  const filteredEntries = selectedTags.length === 0 
    ? entriesData.entries 
    : entriesData.entries.filter(entry => 
        selectedTags.some(tag => entry.tags.includes(tag))
      );

  const handleTagToggle = (slug: string) => {
    setSelectedTags(prev => 
      prev.includes(slug) 
        ? prev.filter(t => t !== slug)
        : [...prev, slug]
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Maritime Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-sand to-cream/80" />
      <div className="absolute inset-0 opacity-[0.03] ancient-navigation" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <FieldNotesHero />

        {/* Taxonomy Filter Chips */}
        <TaxonomyChips 
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />

        {/* Research Entries */}
        <div className="space-y-12 mb-16">
          {filteredEntries.map((entry, index) => (
            <ResearchEntry 
              key={entry.slug}
              entry={entry}
              index={index}
            />
          ))}
        </div>
        
        {/* Research Timeline Connection */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center gap-4 bg-gradient-to-r from-cream to-sand px-8 py-4 rounded-2xl border border-burgundy/20 shadow-lg">
            <div className="w-3 h-3 bg-burgundy rounded-full"></div>
            <span className="text-charcoal/80 font-medium">Maritime Memories Trilogy Complete</span>
            <div className="w-3 h-3 bg-ocean rounded-full"></div>
            <span className="text-charcoal/80 font-medium">→</span>
            <div className="w-3 h-3 bg-laterite rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}