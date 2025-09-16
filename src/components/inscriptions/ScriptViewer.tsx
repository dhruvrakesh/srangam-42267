import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScriptVariant } from '@/data/inscriptions/interfaces';

interface ScriptViewerProps {
  scripts: ScriptVariant[];
  title?: string;
  layout?: 'side-by-side' | 'stacked' | 'tabs';
  showTransliteration?: boolean;
  interactive?: boolean;
  className?: string;
}

export const ScriptViewer = React.memo(({ 
  scripts, 
  title, 
  layout = 'side-by-side',
  showTransliteration = true,
  interactive = true,
  className 
}: ScriptViewerProps) => {
  const [activeScript, setActiveScript] = useState(0);
  const [showTranslit, setShowTranslit] = useState(showTransliteration);

  const getScriptDisplayName = (scriptType: string, subType?: string) => {
    const names = {
      'brahmic': 'Brahmic Script',
      'greek': 'Greek Text',
      'aramaic': 'Aramaic Text',
      'kharoshthi': 'Kharoshthi Script',
      'cuneiform': 'Cuneiform Script'
    };
    return subType ? `${names[scriptType as keyof typeof names]} (${subType})` : names[scriptType as keyof typeof names];
  };

  const getScriptStyles = (scriptType: string) => {
    const styles = {
      'brahmic': 'text-saffron',
      'greek': 'text-terracotta',
      'aramaic': 'text-burgundy',
      'kharoshthi': 'text-gold-warm',
      'cuneiform': 'text-peacock-blue'
    };
    return styles[scriptType as keyof typeof styles] || 'text-foreground';
  };

  if (layout === 'tabs') {
    return (
      <div className={cn('space-y-4', className)}>
        {title && <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>}
        
        <div className="flex gap-2 border-b">
          {scripts.map((_, index) => (
            <Button
              key={index}
              variant={activeScript === index ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveScript(index)}
              className="rounded-b-none"
            >
              {getScriptDisplayName(scripts[index].scriptType, scripts[index].subType)}
            </Button>
          ))}
        </div>

        <div className="bg-background border rounded-lg p-6">
          <ScriptDisplay 
            script={scripts[activeScript]} 
            showTranslit={showTranslit}
            interactive={interactive}
          />
        </div>

        {interactive && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranslit(!showTranslit)}
            >
              {showTranslit ? <EyeOff size={16} /> : <Eye size={16} />}
              {showTranslit ? 'Hide' : 'Show'} Transliteration
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={cn('space-y-4', className)}>
        {title && <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>}
        
        <div className="space-y-6">
          {scripts.map((script, index) => (
            <div key={index} className="bg-background border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-4">
                {getScriptDisplayName(script.scriptType, script.subType)}
              </h4>
              <ScriptDisplay script={script} showTranslit={showTranslit} interactive={interactive} />
            </div>
          ))}
        </div>

        {interactive && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranslit(!showTranslit)}
            >
              {showTranslit ? <EyeOff size={16} /> : <Eye size={16} />}
              {showTranslit ? 'Hide' : 'Show'} Transliteration
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default: side-by-side layout
  return (
    <div className={cn('space-y-4', className)}>
      {title && <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>}
      
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <div className={cn(
          'grid gap-6',
          scripts.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        )}>
          {scripts.map((script, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold text-foreground">
                {getScriptDisplayName(script.scriptType, script.subType)}
              </h4>
              <ScriptDisplay script={script} showTranslit={showTranslit} interactive={interactive} />
            </div>
          ))}
        </div>

        {interactive && (
          <div className="border-t pt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranslit(!showTranslit)}
            >
              {showTranslit ? <EyeOff size={16} /> : <Eye size={16} />}
              {showTranslit ? 'Hide' : 'Show'} Transliteration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

ScriptViewer.displayName = 'ScriptViewer';

// Internal component for displaying individual scripts
const ScriptDisplay = React.memo(({ 
  script, 
  showTranslit, 
  interactive 
}: { 
  script: ScriptVariant; 
  showTranslit: boolean; 
  interactive: boolean; 
}) => {
  const getScriptStyles = (scriptType: string) => {
    const styles = {
      'brahmic': 'text-saffron',
      'greek': 'text-terracotta',
      'aramaic': 'text-burgundy',
      'kharoshthi': 'text-gold-warm',
      'cuneiform': 'text-peacock-blue'
    };
    return styles[scriptType as keyof typeof styles] || 'text-foreground';
  };

  return (
    <div className={cn('bg-sand/20 p-4 rounded font-mono text-sm space-y-2')}>
      <div 
        className={cn(
          'font-medium leading-relaxed',
          getScriptStyles(script.scriptType)
        )}
        dir={script.direction === 'rtl' ? 'rtl' : 'ltr'}
      >
        {script.text}
      </div>
      
      {script.transliteration && showTranslit && (
        <div className="text-muted-foreground text-xs">
          {script.transliteration}
        </div>
      )}
      
      <div className="text-muted-foreground border-t pt-2 mt-2" dir="ltr">
        [{script.translation}]
      </div>
    </div>
  );
});

ScriptDisplay.displayName = 'ScriptDisplay';