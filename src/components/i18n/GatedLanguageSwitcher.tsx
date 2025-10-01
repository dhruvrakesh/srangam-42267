import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Clock, Lock } from 'lucide-react';
import { supportedLanguages, SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode, getScriptFont } from '@/lib/languageUtils';
import { CoverageMap, isLanguageAvailable } from '@/lib/i18n/coverage';
import { cn } from '@/lib/utils';

interface GatedLanguageSwitcherProps {
  articleSlug: string;
  coverageMap: CoverageMap;
  className?: string;
  variant?: 'default' | 'compact';
}

export const GatedLanguageSwitcher: React.FC<GatedLanguageSwitcherProps> = ({
  articleSlug,
  coverageMap,
  className,
  variant = 'default'
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language);
  const articleCoverage = coverageMap[articleSlug] || {};

  const changeLanguage = (lng: SupportedLanguage) => {
    const coverage = articleCoverage[lng];
    
    // Only allow switching to languages with ≥99% coverage
    if (coverage && isLanguageAvailable(coverage)) {
      i18n.changeLanguage(lng);
      document.documentElement.setAttribute('lang', lng);
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  const getLanguageStatus = (langCode: SupportedLanguage) => {
    const coverage = articleCoverage[langCode];
    
    if (!coverage) {
      return { available: false, percent: 0, status: 'Not started' };
    }
    
    const available = isLanguageAvailable(coverage);
    return {
      available,
      percent: coverage.percent,
      status: available ? 'Available' : `In progress (${coverage.percent}%)`
    };
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('gap-2', className)}>
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {supportedLanguages[currentLanguage].nativeName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(supportedLanguages).map(([code, lang]) => {
            const langCode = code as SupportedLanguage;
            const status = getLanguageStatus(langCode);
            const isCurrent = langCode === currentLanguage;
            
            return (
              <DropdownMenuItem
                key={code}
                onClick={() => changeLanguage(langCode)}
                disabled={!status.available}
                className={cn(
                  'flex items-center justify-between gap-2',
                  isCurrent && 'bg-accent',
                  !status.available && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className={cn('flex items-center gap-2', getScriptFont(langCode))}>
                  {isCurrent && <Check className="h-4 w-4" />}
                  {lang.nativeName}
                </span>
                {status.available ? (
                  <Badge variant="default" className="text-xs">
                    {status.percent}%
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {status.percent}%
                  </div>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2 min-w-[200px]', className)}>
          <Globe className="h-4 w-4" />
          <span className={getScriptFont(currentLanguage)}>
            {supportedLanguages[currentLanguage].nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Available Languages
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(supportedLanguages).map(([code, lang]) => {
            const langCode = code as SupportedLanguage;
            const status = getLanguageStatus(langCode);
            const isCurrent = langCode === currentLanguage;
            
            return (
              <DropdownMenuItem
                key={code}
                onClick={() => changeLanguage(langCode)}
                disabled={!status.available}
                className={cn(
                  'flex items-start gap-3 py-3 px-3 cursor-pointer',
                  isCurrent && 'bg-accent',
                  !status.available && 'opacity-60 cursor-not-allowed'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {status.available ? (
                    isCurrent ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('font-medium', getScriptFont(langCode))}>
                      {lang.nativeName}
                    </span>
                    {status.available ? (
                      <Badge variant="default" className="text-xs shrink-0">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {status.percent}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {lang.name} • {status.status}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Languages with <Badge variant="outline" className="text-xs mx-1">≥99%</Badge> coverage are available
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
