import React from 'react';
import { useTranslation } from 'react-i18next';
import { MultilingualContent } from '@/types/multilingual';
import { SupportedLanguage, supportedLanguages } from '@/lib/i18n';
import { CulturalTermTooltip } from './CulturalTermTooltip';
import { cn } from '@/lib/utils';

interface EnhancedMultilingualTextProps {
  content: MultilingualContent | string;
  fallback?: string;
  className?: string;
  enableCulturalTerms?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const EnhancedMultilingualText: React.FC<EnhancedMultilingualTextProps> = ({
  content,
  fallback = 'Content not available',
  className,
  enableCulturalTerms = true,
  as: Component = 'span'
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  
  // Get text content for current language
  const getText = (): string => {
    if (typeof content === 'string') return content;
    
    // Try current language first
    if (content[currentLang]) {
      return typeof content[currentLang] === 'string' 
        ? content[currentLang] as string 
        : fallback;
    }
    
    // Fallback to English
    if (content.en) {
      return typeof content.en === 'string' 
        ? content.en as string 
        : fallback;
    }
    
    // Fallback to first available language
    const firstAvailable = Object.values(content).find(val => typeof val === 'string');
    return firstAvailable as string || fallback;
  };

  const getScriptFont = (lang: SupportedLanguage) => {
    const script = supportedLanguages[lang]?.script;
    const fontMap = {
      tamil: 'font-tamil',
      telugu: 'font-telugu', 
      kannada: 'font-kannada',
      bengali: 'font-bengali',
      assamese: 'font-assamese',
      latin: 'font-sans'
    };
    return fontMap[script as keyof typeof fontMap] || 'font-sans';
  };

  // Enhanced text processing for cultural terms
  const enhanceTextWithCulturalTerms = (text: string): React.ReactNode => {
    if (!enableCulturalTerms) return text;

    // Look for cultural term markers: {{cultural:term}}
    const culturalTermRegex = /\{\{cultural:([^}]+)\}\}/g;
    const parts = text.split(culturalTermRegex);
    
    return parts.map((part, index) => {
      // If index is odd, it's a cultural term
      if (index % 2 === 1) {
        const term = part;
        // Find the original text (next part should be the display text)
        // For now, we'll use the term itself as display text
        return (
          <CulturalTermTooltip key={`cultural-${index}`} term={term}>
            {term}
          </CulturalTermTooltip>
        );
      }
      return part;
    });
  };

  const text = getText();
  const enhancedContent = enhanceTextWithCulturalTerms(text);

  return (
    <Component 
      className={cn(
        getScriptFont(currentLang),
        'leading-relaxed transition-all duration-300',
        // Add subtle animation when language changes
        'animate-fade-in',
        className
      )}
    >
      {enhancedContent}
    </Component>
  );
};