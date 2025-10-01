import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, AlertCircle, ExternalLink } from 'lucide-react';
import { ArticleCoverage, isLanguageAvailable } from '@/lib/i18n/coverage';
import { supportedLanguages } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface TranslationStatusHUDProps {
  coverage: ArticleCoverage;
  className?: string;
  showMissingKeys?: boolean;
}

export const TranslationStatusHUD: React.FC<TranslationStatusHUDProps> = ({
  coverage,
  className,
  showMissingKeys = false
}) => {
  const isAvailable = isLanguageAvailable(coverage);
  const langInfo = supportedLanguages[coverage.lang];
  
  const handleReportIssue = () => {
    const issueTitle = `Translation incomplete: ${coverage.slug} (${coverage.lang})`;
    const issueBody = `
**Article**: ${coverage.slug}
**Language**: ${langInfo.nativeName} (${coverage.lang})
**Coverage**: ${coverage.percent}%
**Missing keys**: ${coverage.missingKeys.length}

${coverage.missingKeys.length > 0 ? `
**Missing translations for:**
${coverage.missingKeys.slice(0, 10).map(key => `- ${key}`).join('\n')}
${coverage.missingKeys.length > 10 ? `\n...and ${coverage.missingKeys.length - 10} more` : ''}
` : ''}
    `.trim();
    
    const url = `https://github.com/yourusername/srangam/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className={cn('p-4 border-l-4', isAvailable ? 'border-l-emerald-500' : 'border-l-amber-500', className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Globe className={cn('h-6 w-6', isAvailable ? 'text-emerald-500' : 'text-amber-500')} />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">
                Translation Status: {langInfo.nativeName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {coverage.translatedKeys} of {coverage.totalKeys} strings translated
              </p>
            </div>
            
            <Badge variant={isAvailable ? 'default' : 'secondary'} className="ml-2">
              {coverage.percent}%
            </Badge>
          </div>
          
          <Progress value={coverage.percent} className="h-2" />
          
          {!isAvailable && (
            <Alert className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This translation is in progress. Some content may fall back to English.
              </AlertDescription>
            </Alert>
          )}
          
          {showMissingKeys && coverage.missingKeys.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Missing translations ({coverage.missingKeys.length}):
              </p>
              <div className="bg-muted/50 rounded p-2 max-h-32 overflow-y-auto">
                <ul className="text-xs space-y-1 font-mono">
                  {coverage.missingKeys.slice(0, 5).map(key => (
                    <li key={key} className="text-muted-foreground">• {key}</li>
                  ))}
                  {coverage.missingKeys.length > 5 && (
                    <li className="text-muted-foreground italic">
                      ...and {coverage.missingKeys.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReportIssue}
                className="w-full text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Report Translation Issue
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
