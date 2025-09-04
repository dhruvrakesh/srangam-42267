import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info, BookOpen, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'detail' | 'location';
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  level?: 'h2' | 'h3' | 'h4';
}

export const ExpandableSection = React.memo(({ 
  title, 
  children, 
  type = 'info',
  defaultExpanded = false,
  icon,
  level = 'h3'
}: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const typeConfig = {
    info: { 
      bgColor: 'bg-blue-500/30', 
      borderColor: 'border-blue-500/40',
      icon: <Info size={20} />
    },
    detail: { 
      bgColor: 'bg-gold-warm/30', 
      borderColor: 'border-gold-warm/40',
      icon: <BookOpen size={20} />
    },
    location: { 
      bgColor: 'bg-terracotta/30', 
      borderColor: 'border-terracotta/40',
      icon: <MapPin size={20} />
    }
  };

  const config = typeConfig[type];
  const displayIcon = icon || config.icon;

  const HeaderComponent = level === 'h2' ? 'h2' : level === 'h3' ? 'h3' : 'h4';
  const headerClasses = {
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold', 
    h4: 'text-lg font-medium'
  };

  return (
    <div className={cn(
      'my-6 rounded-lg border transition-all duration-300',
      config.borderColor,
      isExpanded ? config.bgColor : 'bg-background/60'
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-background/40 transition-colors rounded-lg"
      >
        {isExpanded ? (
          <ChevronDown size={20} className="text-accent flex-shrink-0" />
        ) : (
          <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
        )}
        
        <div className="text-accent flex-shrink-0">
          {displayIcon}
        </div>
        
        <HeaderComponent className={cn(
          'font-serif text-foreground flex-1',
          headerClasses[level]
        )}>
          {title}
        </HeaderComponent>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 animate-accordion-down">
          <div className="pl-11 space-y-4 text-foreground leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

ExpandableSection.displayName = 'ExpandableSection';