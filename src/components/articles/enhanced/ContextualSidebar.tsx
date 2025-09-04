import React from 'react';
import { Info, ExternalLink, Calendar, MapPin, Users, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon?: React.ReactNode;
  title: string;
  content: React.ReactNode;
  link?: {
    text: string;
    href: string;
    external?: boolean;
  };
}

interface ContextualSidebarProps {
  items: SidebarItem[];
  position?: 'left' | 'right';
  className?: string;
}

const iconMap = {
  info: <Info size={16} />,
  calendar: <Calendar size={16} />,
  location: <MapPin size={16} />,
  people: <Users size={16} />,
  economy: <Coins size={16} />
};

export const ContextualSidebar = React.memo(({ 
  items, 
  position = 'right',
  className 
}: ContextualSidebarProps) => {
  return (
    <aside className={cn(
      'space-y-4 p-4 bg-cream/30 border-l-4 border-burgundy/40 rounded-r-lg backdrop-blur-sm',
      position === 'left' && 'border-l-0 border-r-4 border-burgundy/40 rounded-l-lg rounded-r-none',
      className
    )}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-burgundy/30">
        <Info size={18} className="text-burgundy" />
        <h4 className="font-serif font-semibold text-burgundy">Context & Details</h4>
      </div>
      
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-accent">
              {item.icon}
            </div>
            <h5 className="font-medium text-foreground text-sm">
              {item.title}
            </h5>
          </div>
          
          <div className="pl-6 text-sm text-muted-foreground leading-relaxed">
            {item.content}
          </div>
          
          {item.link && (
            <div className="pl-6">
              <a 
                href={item.link.href}
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-foreground underline"
                target={item.link.external ? '_blank' : undefined}
                rel={item.link.external ? 'noopener noreferrer' : undefined}
              >
                {item.link.text}
                {item.link.external && <ExternalLink size={12} />}
              </a>
            </div>
          )}
        </div>
      ))}
    </aside>
  );
});

ContextualSidebar.displayName = 'ContextualSidebar';

// Pre-built common sidebar configurations
export const createHistoricalContext = (date: string, period: string, significance: string): SidebarItem[] => [
  {
    icon: iconMap.calendar,
    title: 'Historical Period',
    content: (
      <div>
        <div className="font-medium">{period}</div>
        <div className="text-xs text-muted-foreground mt-1">{date}</div>
      </div>
    )
  },
  {
    icon: iconMap.info,
    title: 'Historical Significance',
    content: significance
  }
];

export const createGeographicalContext = (location: string, description: string, modernLocation?: string): SidebarItem[] => [
  {
    icon: iconMap.location,
    title: 'Ancient Location',
    content: (
      <div>
        <div className="font-medium">{location}</div>
        {modernLocation && (
          <div className="text-xs text-muted-foreground mt-1">Modern: {modernLocation}</div>
        )}
      </div>
    )
  },
  {
    icon: iconMap.info,
    title: 'Geographic Context',
    content: description
  }
];