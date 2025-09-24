import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLanguages, SupportedLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className, 
  variant = 'default' 
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    // All our supported languages are LTR
    document.documentElement.dir = 'ltr';
  };

  const getScriptFont = (script: string) => {
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

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('gap-1', className)}>
            <Globe size={16} />
            <span className="hidden sm:inline">
              {supportedLanguages[currentLanguage].nativeName}
            </span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          {Object.entries(supportedLanguages).map(([code, lang]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLanguage(code as SupportedLanguage)}
              className={cn(
                'cursor-pointer',
                getScriptFont(lang.script),
                currentLanguage === code && 'bg-muted'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe size={18} className="text-muted-foreground" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[140px]">
            <span className={getScriptFont(supportedLanguages[currentLanguage].script)}>
              {supportedLanguages[currentLanguage].nativeName}
            </span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[240px]">
          {Object.entries(supportedLanguages).map(([code, lang]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLanguage(code as SupportedLanguage)}
              className={cn(
                'cursor-pointer p-3',
                getScriptFont(lang.script),
                currentLanguage === code && 'bg-muted'
              )}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium text-base">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};