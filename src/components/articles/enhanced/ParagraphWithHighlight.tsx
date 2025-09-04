import React, { useState } from 'react';
import { Lightbulb, Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighlightProps {
  text: string;
  type?: 'key-term' | 'date' | 'location' | 'person' | 'concept';
  tooltip?: string;
  interactive?: boolean;
}

interface ParagraphWithHighlightProps {
  children: React.ReactNode;
  highlights?: HighlightProps[];
  className?: string;
  type?: 'normal' | 'lead' | 'emphasis';
  annotation?: {
    icon?: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'inline';
  };
}

const Highlight = React.memo(({ text, type = 'key-term', tooltip, interactive = true }: HighlightProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const typeStyles = {
    'key-term': 'bg-saffron/30 border-saffron/50 text-saffron hover:bg-saffron/40',
    'date': 'bg-burgundy/30 border-burgundy/50 text-burgundy hover:bg-burgundy/40',
    'location': 'bg-terracotta/30 border-terracotta/50 text-terracotta hover:bg-terracotta/40',
    'person': 'bg-gold-warm/30 border-gold-warm/50 text-gold-warm hover:bg-gold-warm/40',
    'concept': 'bg-peacock-blue/30 border-peacock-blue/50 text-peacock-blue hover:bg-peacock-blue/40'
  };

  return (
    <span className="relative inline-block">
      <span 
        className={cn(
          'px-2 py-1 rounded border font-medium transition-all duration-200 cursor-help',
          typeStyles[type],
          interactive && 'hover:scale-105'
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {text}
      </span>
      
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
          <div className="bg-charcoal text-cream text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-charcoal"></div>
          </div>
        </div>
      )}
    </span>
  );
});

Highlight.displayName = 'Highlight';

export const ParagraphWithHighlight = React.memo(({ 
  children, 
  highlights = [], 
  className,
  type = 'normal',
  annotation
}: ParagraphWithHighlightProps) => {
  const typeStyles = {
    normal: 'text-foreground leading-relaxed',
    lead: 'text-lg font-medium text-foreground leading-relaxed',
    emphasis: 'text-foreground leading-relaxed font-serif'
  };

  const annotationIcons = {
    insight: <Lightbulb size={16} className="text-gold-warm" />,
    quote: <Quote size={16} className="text-burgundy" />,
    important: <Star size={16} className="text-saffron" />
  };

  return (
    <div className={cn('my-6 relative group', className)}>
      {annotation && annotation.position === 'top' && (
        <div className="mb-3 flex items-start gap-2 p-3 bg-cream/40 rounded-lg border border-burgundy/30">
          {annotation.icon}
          <div className="text-sm text-muted-foreground flex-1">
            {annotation.content}
          </div>
        </div>
      )}
      
      <p className={cn(typeStyles[type], 'mb-4')}>
        {children}
      </p>
      
      {annotation && annotation.position === 'inline' && (
        <div className="ml-4 pl-4 border-l-2 border-accent/40 text-sm text-muted-foreground italic">
          <div className="flex items-start gap-2">
            {annotation.icon}
            <span>{annotation.content}</span>
          </div>
        </div>
      )}
      
      {annotation && annotation.position === 'bottom' && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-cream/40 rounded-lg border border-burgundy/30">
          {annotation.icon}
          <div className="text-sm text-muted-foreground flex-1">
            {annotation.content}
          </div>
        </div>
      )}
    </div>
  );
});

ParagraphWithHighlight.displayName = 'ParagraphWithHighlight';

// Utility function to create highlights from text
export const createHighlights = (highlights: HighlightProps[]): HighlightProps[] => highlights;

// Pre-built annotation types
export const annotations = {
  insight: (content: string) => ({
    icon: <Lightbulb size={16} className="text-gold-warm" />,
    content,
    position: 'inline' as const
  }),
  historicalNote: (content: string) => ({
    icon: <Quote size={16} className="text-burgundy" />,
    content,
    position: 'bottom' as const
  }),
  keyPoint: (content: string) => ({
    icon: <Star size={16} className="text-saffron" />,
    content,
    position: 'top' as const
  })
};