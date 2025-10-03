import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MultilingualContent } from '@/types/multilingual';
import { SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode, getScriptFont } from '@/lib/languageUtils';
import { cn } from '@/lib/utils';

interface ProfessionalTextFormatterProps {
  content: MultilingualContent;
  className?: string;
  enableCulturalTerms?: boolean;
  enableDropCap?: boolean;
}

export const ProfessionalTextFormatter: React.FC<ProfessionalTextFormatterProps> = ({
  content,
  className,
  enableCulturalTerms = true,
  enableDropCap = false
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en') as SupportedLanguage;
  const scriptFont = getScriptFont(currentLanguage);

  const getText = (): string => {
    const text = content[currentLanguage] || content.en || Object.values(content)[0] || '';
    // Ensure we always return a string, never an object
    if (typeof text === 'string') {
      return text;
    }
    // Fallback if somehow an object got through
    console.warn('ProfessionalTextFormatter received non-string content:', text);
    return '';
  };

  // Cultural term storage for placeholder → component mapping
  const culturalTermMap = new Map<string, string>();

  // STAGE 1: Pre-process - Convert {{cultural:term}} → __CULTURAL_TERM__
  const preprocessCulturalTerms = (text: string): string => {
    if (!enableCulturalTerms) return text;
    
    const culturalTermPattern = /\{\{cultural:([^}]+)\}\}/g;
    return text.replace(culturalTermPattern, (match, term) => {
      const normalizedTerm = term.trim().toLowerCase();
      const placeholder = `__CULTURAL_${normalizedTerm.toUpperCase().replace(/[^A-Z0-9]/g, '_')}__`;
      culturalTermMap.set(placeholder, normalizedTerm);
      return placeholder;
    });
  };

  // STAGE 2: Post-process - Convert __CULTURAL_TERM__ → <CulturalTermTooltip>
  const injectCulturalTerm = (text: string): React.ReactNode => {
    if (!enableCulturalTerms || typeof text !== 'string') return text;
    
    const parts: React.ReactNode[] = [];
    const placeholderPattern = /__CULTURAL_([A-Z0-9_]+)__/g;
    let lastIndex = 0;
    let match;
    
    while ((match = placeholderPattern.exec(text)) !== null) {
      const placeholder = match[0];
      const term = culturalTermMap.get(placeholder);
      
      if (!term) continue;
      
      // Add text before placeholder
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Create display term (capitalize words)
      const displayTerm = term
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Add CulturalTermTooltip component
      parts.push(
        <CulturalTermTooltip key={`${term}-${match.index}`} term={term}>
          <span className="cultural-term-highlight">
            {displayTerm}
          </span>
        </CulturalTermTooltip>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Helper: Process React children recursively
  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, child => {
      if (typeof child === 'string') {
        return injectCulturalTerm(child);
      }
      return child;
    });
  };

  const rawText = getText();
  if (!rawText || typeof rawText !== 'string') {
    console.error('ProfessionalTextFormatter: Invalid text content');
    return null;
  }

  // PRE-PROCESS: Convert {{cultural:term}} to placeholders BEFORE ReactMarkdown
  const textContent = preprocessCulturalTerms(rawText);

  const customRenderers = {
    // Regular link renderer
    a: ({ href, children, ...props }: any) => {
      return <a href={href} className="text-ocean hover:text-ocean-dark underline transition-colors" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },

    // Enhanced heading rendering with cultural terms support
    h2: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      
      return (
        <div className="relative mt-16 mb-8">
          {/* Visual divider */}
          <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent" />
          
          <h2 
            className={cn(
              'text-3xl font-serif font-bold text-burgundy pb-4',
              'border-b-2 border-burgundy/30',
              'flex items-center gap-3',
              scriptFont
            )}
            {...props}
          >
            <span className="text-saffron text-4xl">§</span>
            {processedChildren}
          </h2>
        </div>
      );
    },

    h3: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      
      return (
        <h3 
          className={cn(
            'text-2xl font-serif font-semibold text-burgundy mt-10 mb-6',
            'flex items-center gap-2',
            scriptFont
          )}
          {...props}
        >
          <span className="text-gold-warm">◆</span>
          {processedChildren}
        </h3>
      );
    },

    // Simplified paragraph rendering with cultural term support
    p: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      
      return (
        <p 
          className={cn(
            'text-lg leading-relaxed mb-6 text-foreground/90',
            enableDropCap && 'first-letter:text-6xl first-letter:font-serif first-letter:font-bold',
            enableDropCap && 'first-letter:text-burgundy first-letter:float-left first-letter:mr-3',
            enableDropCap && 'first-letter:mt-1 first-letter:leading-none',
            scriptFont,
            'hyphens-auto'
          )}
          {...props}
        >
          {processedChildren}
        </p>
      );
    },

    // Enhanced list rendering
    ul: ({ children, ...props }: any) => (
      <ul className="list-none space-y-4 mb-8 ml-4" {...props}>
        {children}
      </ul>
    ),

    li: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      
      return (
        <li className={cn(
          'flex items-start gap-4 text-lg leading-relaxed text-foreground/90',
          scriptFont
        )} {...props}>
          <span className="text-saffron text-2xl font-bold leading-none mt-1">•</span>
          <span className="flex-1">
            {processedChildren}
          </span>
        </li>
      );
    },

    // Enhanced blockquote rendering with cultural term support
    blockquote: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      
      return (
        <blockquote 
          className={cn(
            'border-l-4 border-burgundy',
            'bg-gradient-to-r from-sandalwood/50 via-cream/30 to-transparent',
            'pl-8 pr-6 py-6 my-12 rounded-r-2xl',
            'relative overflow-hidden',
            scriptFont
          )}
          {...props}
        >
          <div className="text-xl italic text-charcoal/80 leading-relaxed">
            {processedChildren}
          </div>
          <div className="absolute top-4 right-6 text-6xl text-burgundy/20 font-serif leading-none">
            "
          </div>
        </blockquote>
      );
    },

    // Enhanced strong/bold text (simplified to avoid conflicts)
    strong: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      
      return (
        <strong 
          className="font-semibold text-burgundy"
          {...props}
        >
          {processedChildren}
        </strong>
      );
    },

    // Enhanced emphasis/italic text
    em: ({ children, ...props }: any) => (
      <em className="italic text-burgundy font-medium" {...props}>
        {children}
      </em>
    ),

    // Table support with cultural terms
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),

    td: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      return (
        <td 
          className="border border-burgundy/20 px-4 py-3 text-base" 
          {...props}
        >
          {processedChildren}
        </td>
      );
    },

    th: ({ children, ...props }: any) => {
      const processedChildren = processChildren(children);
      return (
        <th 
          className="border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-left font-semibold text-burgundy" 
          {...props}
        >
          {processedChildren}
        </th>
      );
    },

    // Horizontal rule with elegant styling
    hr: ({ ...props }: any) => (
      <hr 
        className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent" 
        {...props}
      />
    )
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('prose prose-xl max-w-none', className)}>
        <ReactMarkdown 
          components={customRenderers}
        >
          {textContent}
        </ReactMarkdown>
      </div>
    </TooltipProvider>
  );
};