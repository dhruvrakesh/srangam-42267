import React from 'react';
import { cn } from '@/lib/utils';

interface InscriptionVisualizerProps {
  type: 'pillar' | 'stone' | 'tablet' | 'seal';
  count?: number;
  title?: string;
  metadata?: {
    ritualContext?: string[];
    scriptFeatures?: string[];
    location?: string;
    dating?: string;
  };
  customHeight?: boolean;
  className?: string;
}

export const InscriptionVisualizer = React.memo(({ 
  type, 
  count = 1, 
  title, 
  metadata,
  customHeight = true,
  className 
}: InscriptionVisualizerProps) => {
  const renderPillars = () => {
    const pillars = Array.from({ length: count }, (_, i) => i + 1);
    
    return (
      <div className="flex justify-center items-end space-x-4 py-8">
        {pillars.map((pillar) => (
          <div key={pillar} className="flex flex-col items-center space-y-2">
            <div 
              className="w-8 bg-gradient-to-t from-stone to-stone/70 rounded-t-sm flex flex-col justify-center items-center"
              style={{ 
                height: customHeight ? `${60 + Math.random() * 40}px` : '80px' 
              }}
            >
              <div className="w-full h-full flex flex-col justify-center items-center text-xs text-stone-content opacity-80">
                <div className="writing-mode-vertical text-center">
                  <div className="rotate-90 transform origin-center text-saffron">
                    संस्कृत
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">#{pillar}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStones = () => {
    const stones = Array.from({ length: count }, (_, i) => i + 1);
    
    return (
      <div className="flex justify-center items-center space-x-6 py-8">
        {stones.map((stone) => (
          <div key={stone} className="flex flex-col items-center space-y-2">
            <div className="w-16 h-20 bg-gradient-to-br from-stone to-stone/60 rounded-lg flex items-center justify-center">
              <div className="text-xs text-stone-content opacity-70 text-center leading-tight">
                <div className="text-saffron">𑀲𑀁𑀲𑁆𑀓𑀼𑀢</div>
                <div className="text-terracotta text-[10px] mt-1">script</div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Stone {stone}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTablets = () => {
    const tablets = Array.from({ length: count }, (_, i) => i + 1);
    
    return (
      <div className="flex justify-center items-center space-x-4 py-8">
        {tablets.map((tablet) => (
          <div key={tablet} className="flex flex-col items-center space-y-2">
            <div className="w-12 h-16 bg-gradient-to-b from-sand to-sand/70 rounded border border-sand-border flex items-center justify-center">
              <div className="text-[10px] text-sand-content opacity-80 text-center leading-tight">
                <div className="text-burgundy">𐎠𐎼𐎶𐎡𐎣</div>
                <div className="text-terracotta text-[8px] mt-1">text</div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">#{tablet}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSeals = () => {
    const seals = Array.from({ length: count }, (_, i) => i + 1);
    
    return (
      <div className="flex justify-center items-center space-x-4 py-8">
        {seals.map((seal) => (
          <div key={seal} className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gradient-to-br from-terracotta to-terracotta/70 rounded-full flex items-center justify-center">
              <div className="text-[8px] text-terracotta-content opacity-80 text-center">
                <div className="text-gold-warm">𒀀𒀭</div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">#{seal}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderVisualization = () => {
    switch (type) {
      case 'pillar':
        return renderPillars();
      case 'stone':
        return renderStones();
      case 'tablet':
        return renderTablets();
      case 'seal':
        return renderSeals();
      default:
        return renderPillars();
    }
  };

  return (
    <div className={cn('space-y-6 p-6 bg-muted/30 rounded-lg', className)}>
      {title && (
        <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
      )}
      
      {renderVisualization()}
      
      {metadata && (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {metadata.ritualContext && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Ritual Context</h4>
              <ul className="space-y-1 text-muted-foreground">
                {metadata.ritualContext.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {metadata.scriptFeatures && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Script Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                {metadata.scriptFeatures.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {(metadata?.location || metadata?.dating) && (
        <p className="text-sm text-muted-foreground italic">
          {metadata.location && `Found at ${metadata.location}. `}
          {metadata.dating && `Dating: ${metadata.dating}.`}
        </p>
      )}
    </div>
  );
});

InscriptionVisualizer.displayName = 'InscriptionVisualizer';