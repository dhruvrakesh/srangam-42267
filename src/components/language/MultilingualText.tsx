import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MultilingualContent } from '@/types/multilingual';
import { SupportedLanguage, supportedLanguages } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface MultilingualTextProps {
  content: MultilingualContent | string;
  fallback?: string;
  className?: string;
  showContext?: boolean;
  culturalTerms?: string[];
  transliteration?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const MultilingualText: React.FC<MultilingualTextProps> = ({
  content,
  fallback = 'Content not available',
  className,
  showContext = true,
  culturalTerms = [],
  transliteration,
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

  const text = getText();
  const hasContext = showContext && (culturalTerms.length > 0 || transliteration);

  return (
    <Component 
      className={cn(
        getScriptFont(currentLang),
        'leading-relaxed',
        className
      )}
    >
      {text}
      {hasContext && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info 
                size={14} 
                className="inline ml-1 text-muted-foreground cursor-help hover:text-foreground transition-colors" 
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-2">
                {transliteration && (
                  <div>
                    <strong>Transliteration:</strong> {transliteration}
                  </div>
                )}
                {culturalTerms.length > 0 && (
                  <div>
                    <strong>Cultural Context:</strong>
                    <ul className="mt-1 text-xs space-y-1">
                      {culturalTerms.map((term, index) => (
                        <li key={index} className="text-muted-foreground">• {term}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Component>
  );
};