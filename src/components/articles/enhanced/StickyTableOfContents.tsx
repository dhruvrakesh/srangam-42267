import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface StickyTableOfContentsProps {
  items: TableOfContentsItem[];
  className?: string;
}

export const StickyTableOfContents: React.FC<StickyTableOfContentsProps> = ({
  items,
  className
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Find the current section
      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={cn(
      "hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40",
      "w-80 max-h-[70vh] overflow-hidden",
      "bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg",
      "transition-all duration-300 ease-in-out",
      isCollapsed && "w-12",
      className
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          {!isCollapsed && (
            <span className="text-sm font-medium text-foreground">Contents</span>
          )}
        </div>
        <ChevronRight 
          size={16} 
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isCollapsed ? "rotate-0" : "rotate-90"
          )}
        />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <nav className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md text-xs transition-all duration-200",
                  "hover:bg-muted hover:text-foreground",
                  item.level === 1 && "font-medium",
                  item.level === 2 && "ml-3 text-muted-foreground",
                  item.level === 3 && "ml-6 text-muted-foreground",
                  activeSection === item.id && [
                    "bg-primary/10 text-primary border-l-2 border-primary",
                    "hover:bg-primary/15"
                  ]
                )}
              >
                <span className="line-clamp-2 leading-tight">
                  {item.title}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

// Helper function to extract TOC items from article content
export const extractTableOfContents = (content: string): TableOfContentsItem[] => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    items.push({ id, title, level });
  }

  return items;
};