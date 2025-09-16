import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Calendar, 
  BookOpen, 
  Globe, 
  Scroll, 
  Crown,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CulturalContext } from '@/data/inscriptions/interfaces';

interface ContextualCommentaryProps {
  context: CulturalContext;
  title?: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
  position?: 'sidebar' | 'inline' | 'modal';
  className?: string;
}

export const ContextualCommentary = React.memo(({ 
  context, 
  title = "Cultural Context",
  expandable = true,
  defaultExpanded = false,
  position = 'inline',
  className 
}: ContextualCommentaryProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const sections = [
    {
      key: 'ritual',
      title: 'Ritual Significance',
      icon: Scroll,
      content: context.ritualSignificance,
      color: 'text-saffron'
    },
    {
      key: 'historical',
      title: 'Historical Period',
      icon: Calendar,
      content: getHistoricalPeriodDescription(context.historicalPeriod),
      color: 'text-burgundy'
    },
    {
      key: 'geographic',
      title: 'Geographic Context',
      icon: MapPin,
      content: `${context.geographicRelevance.culturalArea}. Trade networks: ${context.geographicRelevance.tradingNetworks.join(', ')}.`,
      color: 'text-terracotta'
    },
    {
      key: 'linguistic',
      title: 'Linguistic Features',
      icon: BookOpen,
      content: getLinguisticDescription(context.linguisticFeatures),
      color: 'text-gold-warm'
    },
    {
      key: 'script',
      title: 'Script Evolution',
      icon: Globe,
      content: `${context.scriptEvolution.scriptEvolution}. Dating confidence: ${context.scriptEvolution.dating.confidence}.`,
      color: 'text-peacock-blue'
    }
  ].filter(section => section.content);

  if (position === 'sidebar') {
    return (
      <div className={cn('space-y-4 p-4 bg-background border rounded-lg', className)}>
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Crown size={16} className="text-saffron" />
          {title}
        </h4>
        
        <div className="space-y-3">
          {sections.map(({ key, title, icon: Icon, content, color }) => (
            <div key={key} className="space-y-1">
              <div className={cn('flex items-center gap-2 text-sm font-medium', color)}>
                <Icon size={14} />
                {title}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                {content}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (position === 'modal') {
    // This would typically be used with a dialog component
    return (
      <div className={cn('max-w-2xl space-y-6', className)}>
        <h3 className="text-xl font-serif font-semibold text-foreground">{title}</h3>
        
        {sections.map(({ key, title, icon: Icon, content, color }) => (
          <div key={key} className="space-y-2">
            <h4 className={cn('flex items-center gap-2 font-medium', color)}>
              <Icon size={16} />
              {title}
            </h4>
            <p className="text-muted-foreground leading-relaxed pl-6">
              {content}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Default: inline position
  return (
    <div className={cn('space-y-3', className)}>
      {expandable ? (
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 p-0 h-auto font-semibold text-foreground hover:text-saffron"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Crown size={16} />
          {title}
        </Button>
      ) : (
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Crown size={16} className="text-saffron" />
          {title}
        </h4>
      )}
      
      {(!expandable || expanded) && (
        <div className="space-y-4 pl-6">
          {sections.map(({ key, title, icon: Icon, content, color }) => (
            <div key={key} className="space-y-2">
              <h5 className={cn('flex items-center gap-2 text-sm font-medium', color)}>
                <Icon size={14} />
                {title}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                {content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ContextualCommentary.displayName = 'ContextualCommentary';

// Helper functions for formatting context data
function getHistoricalPeriodDescription(period: any): string {
  if ('phase' in period && 'characteristics' in period) {
    return `${period.phase.replace('-', ' ')} period. Key characteristics: ${period.characteristics.join(', ')}.`;
  }
  return 'Historical period information not available.';
}

function getLinguisticDescription(features: any): string {
  if ('genre' in features && 'linguisticFeatures' in features) {
    return `Genre: ${features.genre}. Linguistic features: ${features.linguisticFeatures.join(', ')}.${features.meter ? ` Meter: ${features.meter}.` : ''}`;
  }
  if ('dialect' in features && 'characteristics' in features) {
    return `Dialect: ${features.dialect}. Characteristics: ${features.characteristics.join(', ')}.`;
  }
  return 'Linguistic information not available.';
}