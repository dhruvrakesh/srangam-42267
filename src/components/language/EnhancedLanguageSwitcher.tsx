import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLanguages, SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode, getLanguageInfo, getScriptFont } from '@/lib/languageUtils';
import { MultilingualContent } from '@/types/multilingual';
import { cn } from '@/lib/utils';

interface EnhancedLanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
  articleContent?: MultilingualContent;
  showAvailability?: boolean;
}

export const EnhancedLanguageSwitcher: React.FC<EnhancedLanguageSwitcherProps> = ({ 
  className, 
  variant = 'default',
  articleContent,
  showAvailability = false
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en');
  const currentLangInfo = getLanguageInfo(currentLanguage);

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = 'ltr';
  };

  const getLanguageAvailability = (langCode: string) => {
    if (!articleContent) return true;
    return Object.keys(articleContent).includes(langCode);
  };

  const availableLanguages = articleContent ? Object.keys(articleContent) : Object.keys(supportedLanguages);
  const completionRate = Math.round((availableLanguages.length / Object.keys(supportedLanguages).length) * 100);

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('gap-1', className)}>
            <Globe size={16} />
            <span className="hidden sm:inline">
              {currentLangInfo.nativeName}
            </span>
            {showAvailability && articleContent && (
              <Badge variant="outline" className="ml-1 text-xs px-1">
                {completionRate}%
              </Badge>
            )}
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[240px]">
          {showAvailability && articleContent && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Translation Completion: {completionRate}%
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          {Object.entries(supportedLanguages).map(([code, lang]) => {
            const isAvailable = getLanguageAvailability(code);
            const isCurrent = currentLanguage === code;
            
            return (
              <DropdownMenuItem
                key={code}
                onClick={() => changeLanguage(code as SupportedLanguage)}
                disabled={!isAvailable}
                className={cn(
                  'cursor-pointer flex items-center justify-between',
                  getScriptFont(lang.script),
                  isCurrent && 'bg-muted',
                  !isAvailable && 'opacity-50'
                )}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isCurrent && <Check size={14} className="text-primary" />}
                  {!isAvailable && <AlertCircle size={14} className="text-muted-foreground" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe size={18} className="text-muted-foreground" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[160px]">
            <span className={getScriptFont(currentLanguage)}>
              {currentLangInfo.nativeName}
            </span>
            {showAvailability && articleContent && (
              <Badge variant="secondary" className="text-xs">
                {completionRate}%
              </Badge>
            )}
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[280px]">
          {showAvailability && articleContent && (
            <>
              <div className="px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Translation Status</span>
                  <Badge variant="outline" className={
                    completionRate === 100 ? 'bg-emerald-100 text-emerald-800' :
                    completionRate >= 70 ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }>
                    {availableLanguages.length}/{Object.keys(supportedLanguages).length} languages
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          {Object.entries(supportedLanguages).map(([code, lang]) => {
            const isAvailable = getLanguageAvailability(code);
            const isCurrent = currentLanguage === code;
            
            return (
              <DropdownMenuItem
                key={code}
                onClick={() => changeLanguage(code as SupportedLanguage)}
                disabled={!isAvailable}
                className={cn(
                  'cursor-pointer p-3 flex items-center justify-between',
                  getScriptFont(lang.script),
                  isCurrent && 'bg-muted',
                  !isAvailable && 'opacity-50'
                )}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium text-base">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrent && <Check size={16} className="text-primary" />}
                  {isAvailable ? (
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Missing
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};