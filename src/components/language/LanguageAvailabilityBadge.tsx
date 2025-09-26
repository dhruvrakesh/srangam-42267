import React from 'react';
import { Badge } from '@/components/ui/badge';
import { supportedLanguages, SupportedLanguage } from '@/lib/i18n';
import { MultilingualContent } from '@/types/multilingual';
import { Globe, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageAvailabilityBadgeProps {
  content: MultilingualContent;
  currentLanguage: SupportedLanguage;
  className?: string;
  showDetails?: boolean;
}

export const LanguageAvailabilityBadge: React.FC<LanguageAvailabilityBadgeProps> = ({
  content,
  currentLanguage,
  className,
  showDetails = false
}) => {
  const availableLanguages = Object.keys(content) as SupportedLanguage[];
  const totalLanguages = Object.keys(supportedLanguages).length;
  const completionPercentage = Math.round((availableLanguages.length / totalLanguages) * 100);
  
  const isCurrentLanguageAvailable = availableLanguages.includes(currentLanguage);
  
  const getCompletionColor = () => {
    if (completionPercentage === 100) return 'bg-emerald-500 text-white';
    if (completionPercentage >= 70) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getCompletionIcon = () => {
    if (completionPercentage === 100) return <Check size={12} />;
    if (completionPercentage >= 70) return <Globe size={12} />;
    return <AlertCircle size={12} />;
  };

  if (showDetails) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Badge variant="outline" className={cn('flex items-center gap-1', getCompletionColor())}>
          {getCompletionIcon()}
          {completionPercentage}% Complete
        </Badge>
        
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(supportedLanguages).map(([code, lang]) => {
            const isAvailable = availableLanguages.includes(code as SupportedLanguage);
            const isCurrent = code === currentLanguage;
            
            return (
              <Badge
                key={code}
                variant={isAvailable ? "default" : "outline"}
                className={cn(
                  'text-xs px-1 py-0.5 h-6 justify-center',
                  isAvailable ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'text-muted-foreground',
                  isCurrent && 'ring-2 ring-primary ring-offset-1'
                )}
              >
                {lang.nativeName.substring(0, 3)}
              </Badge>
            );
          })}
        </div>
        
        {!isCurrentLanguageAvailable && (
          <p className="text-xs text-muted-foreground">
            Content not available in {supportedLanguages[currentLanguage].nativeName}
          </p>
        )}
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'flex items-center gap-1 text-xs',
        getCompletionColor(),
        className
      )}
    >
      {getCompletionIcon()}
      {availableLanguages.length}/{totalLanguages}
    </Badge>
  );
};