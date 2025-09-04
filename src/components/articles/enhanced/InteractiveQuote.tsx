import React, { useState } from 'react';
import { Quote, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveQuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
  date?: string;
  type?: 'primary' | 'historical' | 'cultural';
  expandable?: boolean;
  context?: string;
}

export const InteractiveQuote = React.memo(({ 
  children, 
  author, 
  source, 
  date, 
  type = 'primary',
  expandable = false,
  context
}: InteractiveQuoteProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeStyles = {
    primary: 'border-burgundy/40 bg-burgundy/30 text-burgundy-light',
    historical: 'border-saffron/40 bg-saffron/30 text-saffron',
    cultural: 'border-gold-warm/40 bg-gold-warm/30 text-gold-warm'
  };

  return (
    <div className={cn(
      'relative group my-8 p-6 rounded-lg border-l-4 transition-all duration-300',
      'hover:shadow-lg hover:scale-[1.01] cursor-pointer backdrop-blur-sm',
      typeStyles[type]
    )}>
      <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-70 transition-opacity">
        <Quote size={32} className="rotate-180" />
      </div>
      
      <div className="relative z-10">
        <blockquote className="text-lg font-serif italic leading-relaxed mb-4 text-foreground">
          {children}
        </blockquote>
        
        {(author || source || date) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {author && (
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>{author}</span>
              </div>
            )}
            {source && <span>• {source}</span>}
            {date && (
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{date}</span>
              </div>
            )}
          </div>
        )}
        
        {expandable && context && (
          <div className="mt-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-accent hover:text-accent-foreground underline"
            >
              {isExpanded ? 'Show less context' : 'Show more context'}
            </button>
            
            {isExpanded && (
              <div className="mt-3 p-4 bg-background/60 rounded border text-sm text-muted-foreground animate-fade-in">
                {context}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

InteractiveQuote.displayName = 'InteractiveQuote';