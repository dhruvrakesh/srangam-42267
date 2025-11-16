import { TagChip } from "@/components/ui/TagChip";
import { useTranslation } from 'react-i18next';
import { getAllThemes, getArticleCountByTheme } from '@/lib/multilingualArticleUtils';
import { MULTILINGUAL_ARTICLES } from '@/data/articles';

interface ArticleThemeChipsProps {
  selectedThemes: string[];
  onThemeToggle: (theme: string) => void;
}

export function ArticleThemeChips({ selectedThemes, onThemeToggle }: ArticleThemeChipsProps) {
  const { t } = useTranslation();
  const themes = getAllThemes();
  const totalArticleCount = MULTILINGUAL_ARTICLES.length;

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {/* "All" chip */}
      <button
        onClick={() => onThemeToggle('all')}
        className={`transition-all duration-300 ${
          selectedThemes.length === 0 ? 'scale-105' : 'hover:scale-105'
        }`}
      >
        <TagChip 
          variant={selectedThemes.length === 0 ? "theme" : "default"}
          className={`cursor-pointer transition-colors ${
            selectedThemes.length === 0
              ? "bg-saffron text-charcoal-om shadow-lg" 
              : "hover:bg-saffron/10 hover:text-saffron hover:border-saffron/30"
          }`}
        >
          {t('filters.allArticles')} ({totalArticleCount})
        </TagChip>
      </button>

      {/* Theme chips */}
      {themes.map((theme) => {
        const isSelected = selectedThemes.includes(theme);
        const count = getArticleCountByTheme(theme);
        const themeKey = theme.toLowerCase().replace(/\s+/g, '').replace('&', '');
        
        return (
          <button
            key={theme}
            onClick={() => onThemeToggle(theme)}
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
              }`}
            >
              {t(`themes.${themeKey}`)} ({count})
            </TagChip>
          </button>
        );
      })}
    </div>
  );
}
