import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useTranslation } from 'react-i18next';
import { EnhancedMultilingualText } from '@/components/language/EnhancedMultilingualText';
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

  const textContent = getText();
  if (!textContent || typeof textContent !== 'string') {
    console.error('ProfessionalTextFormatter: Invalid text content');
    return null;
  }

  // Pre-process text to identify and mark cultural terms before markdown processing
  const preprocessText = (text: string) => {
    if (!enableCulturalTerms) return text;
    
    // Pattern to find existing {{cultural:term}} markers
    const existingPattern = /\{\{cultural:([^}]+)\}\}/g;
    const existingTerms = new Set();
    let match;
    
    // Track existing terms to avoid double-processing
    while ((match = existingPattern.exec(text)) !== null) {
      existingTerms.add(match[1].toLowerCase());
    }
    
    return text;
  };

  // Pre-process markdown to convert {{cultural:term}} to inline components
  const preprocessCulturalTerms = (text: string): string => {
    if (!enableCulturalTerms) return text;
    
    // Convert {{cultural:term}} to <cultural-term data-term="term">Display Term</cultural-term>
    // This custom HTML will be processed by ReactMarkdown and handled by our renderer
    const culturalTermPattern = /\{\{cultural:([^}]+)\}\}/g;
    return text.replace(culturalTermPattern, (match, term) => {
      const trimmedTerm = term.trim();
      const displayTerm = trimmedTerm
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      // Use a custom HTML element that ReactMarkdown will pass to our components
      return `<cultural-term data-term="${trimmedTerm}">${displayTerm}</cultural-term>`;
    });
  };

  const customRenderers = {
    // Handle custom cultural-term HTML elements (rehype-raw converts to camelCase)
    culturalTerm: ({ node, ...props }: any) => {
      const term = props['data-term'] || props.dataTerm || '';
      if (!term) return <span>{props.children}</span>;
      
      return (
        <CulturalTermTooltip term={term}>
          <span className="font-semibold text-burgundy bg-gradient-to-r from-saffron/10 to-gold-warm/10 px-1.5 py-0.5 rounded-md border border-saffron/20 cursor-help hover:bg-saffron/20 transition-colors">
            {props.children}
          </span>
        </CulturalTermTooltip>
      );
    },

    // Regular link renderer
    a: ({ href, children, ...props }: any) => {
      return <a href={href} className="text-ocean hover:text-ocean-dark underline transition-colors" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },

    // Enhanced heading rendering
    h2: ({ children, ...props }: any) => (
      <h2 
        className={cn(
          'text-3xl font-serif font-bold text-burgundy mt-16 mb-8 pb-4',
          'border-b-2 border-gradient-to-r from-burgundy via-saffron to-gold-warm',
          'relative',
          'before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5',
          'before:bg-gradient-to-r before:from-burgundy before:via-saffron before:to-gold-warm',
          scriptFont
        )}
        {...props}
      >
        {children}
      </h2>
    ),

    // Enhanced paragraph rendering with smart chunking
    p: ({ children, ...props }: any) => {
      const content = typeof children === 'string' ? children : 
        React.Children.toArray(children).join('');
      
      if (typeof content === 'string') {
        // Split long paragraphs into readable chunks (max 3-4 sentences)
        const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        if (sentences.length > 4) {
          const chunks = [];
          for (let i = 0; i < sentences.length; i += 3) {
            chunks.push(sentences.slice(i, i + 3).join(' '));
          }
          
          return (
            <>
              {chunks.map((chunk, index) => (
                <p 
                  key={index}
                  className={cn(
                    'text-lg leading-relaxed mb-6 text-foreground/90',
                    'first-letter:text-6xl first-letter:font-serif first-letter:font-bold',
                    'first-letter:text-burgundy first-letter:float-left first-letter:mr-3',
                    'first-letter:mt-1 first-letter:leading-none',
                    enableDropCap && index === 0 ? '' : 'first-letter:text-lg first-letter:float-none first-letter:mr-0 first-letter:mt-0',
                    scriptFont,
                    'hyphens-auto text-justify'
                  )}
                  {...props}
                >
                  {chunk}
                </p>
              ))}
            </>
          );
        }
      }
      
      return (
        <p 
          className={cn(
            'text-lg leading-relaxed mb-6 text-foreground/90',
            'first-letter:text-6xl first-letter:font-serif first-letter:font-bold',
            'first-letter:text-burgundy first-letter:float-left first-letter:mr-3',
            'first-letter:mt-1 first-letter:leading-none',
            enableDropCap ? '' : 'first-letter:text-lg first-letter:float-none first-letter:mr-0 first-letter:mt-0',
            scriptFont,
            'hyphens-auto text-justify'
          )}
          {...props}
        >
          {children}
        </p>
      );
    },

    // Enhanced list rendering
    ul: ({ children, ...props }: any) => (
      <ul className="list-none space-y-4 mb-8 ml-4" {...props}>
        {children}
      </ul>
    ),

    li: ({ children, ...props }: any) => (
      <li className={cn(
        'flex items-start gap-4 text-lg leading-relaxed text-foreground/90',
        scriptFont
      )} {...props}>
        <span className="text-saffron text-2xl font-bold leading-none mt-1">•</span>
        <span className="flex-1">
          {children}
        </span>
      </li>
    ),

    // Enhanced blockquote rendering
    blockquote: ({ children, ...props }: any) => (
      <blockquote 
        className={cn(
          'border-l-4 border-gradient-to-b from-burgundy to-saffron',
          'bg-gradient-to-r from-sandalwood/50 via-cream/30 to-transparent',
          'pl-8 pr-6 py-6 my-12 rounded-r-2xl',
          'relative overflow-hidden',
          'before:absolute before:inset-0 before:bg-gradient-to-r',
          'before:from-saffron/5 before:to-transparent before:-z-10',
          scriptFont
        )}
        {...props}
      >
        <div className="text-xl italic text-charcoal/80 leading-relaxed">
          {children}
        </div>
        <div className="absolute top-4 right-6 text-6xl text-burgundy/20 font-serif leading-none">
          "
        </div>
      </blockquote>
    ),

    // Enhanced strong/bold text
    strong: ({ children, ...props }: any) => (
      <strong 
        className="font-semibold text-burgundy bg-gradient-to-r from-saffron/15 to-gold-warm/15 px-1.5 py-0.5 rounded-md border border-saffron/30"
        {...props}
      >
        {children}
      </strong>
    ),

    // Enhanced emphasis/italic text
    em: ({ children, ...props }: any) => (
      <em className="italic text-burgundy font-medium" {...props}>
        {children}
      </em>
    )
  };

  const processedText = preprocessCulturalTerms(preprocessText(textContent));

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('prose prose-xl max-w-none', className)}>
        <ReactMarkdown 
          components={customRenderers}
          rehypePlugins={[rehypeRaw]}
        >
          {processedText}
        </ReactMarkdown>
      </div>
    </TooltipProvider>
  );
};