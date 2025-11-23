import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
    if (typeof text === 'string') {
      // CRITICAL FIX: Trim leading/trailing whitespace and normalize line breaks
      return text.trim().replace(/^\s+/gm, '');
    }
    console.warn('ProfessionalTextFormatter received non-string content:', text);
    return '';
  };

  // Title case converter
  const toTitleCase = (str: string): string => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // PRE-RENDERING APPROACH: Parse and render cultural terms BEFORE markdown processing
  const renderWithCulturalTerms = (text: string): React.ReactNode => {
    if (!enableCulturalTerms || !text) {
      return (
        <ReactMarkdown 
          components={customRenderers}
          rehypePlugins={[rehypeRaw]}
        >
          {text}
        </ReactMarkdown>
      );
    }

    const segments: React.ReactNode[] = [];
    let currentMarkdown = '';
    let segmentKey = 0;

    // Split text by lines to handle markdown structure properly
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const culturalPattern = /\{\{cultural:([^}]+)\}\}/g;
      
      // Check if this line contains cultural terms
      if (culturalPattern.test(line)) {
        // Flush accumulated markdown before processing this line
        if (currentMarkdown) {
          segments.push(
            <ReactMarkdown
              key={`md-${segmentKey++}`}
              components={customRenderers}
              rehypePlugins={[rehypeRaw]}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }

        // Process line with cultural terms
        let processedLine: React.ReactNode[] = [];
        let lastIndex = 0;
        culturalPattern.lastIndex = 0; // Reset regex
        let match;

        while ((match = culturalPattern.exec(line)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            processedLine.push(line.substring(lastIndex, match.index));
          }

          // Add cultural term tooltip
          const term = match[1].trim().toLowerCase();
          const displayTerm = toTitleCase(term);
          
          processedLine.push(
            <CulturalTermTooltip key={`cultural-${term}-${segmentKey++}`} term={term}>
              <span className="cultural-term-highlight">
                {displayTerm}
              </span>
            </CulturalTermTooltip>
          );

          lastIndex = culturalPattern.lastIndex;
        }

        // Add remaining text
        if (lastIndex < line.length) {
          processedLine.push(line.substring(lastIndex));
        }

        // Wrap processed line in appropriate markdown container
        const lineMarkdown = line.replace(/\{\{cultural:[^}]+\}\}/g, '');
        const isHeading = lineMarkdown.trim().startsWith('#');
        const isListItem = lineMarkdown.trim().startsWith('-') || lineMarkdown.trim().startsWith('*');
        const isBlockquote = lineMarkdown.trim().startsWith('>');

        if (isHeading) {
          const level = (lineMarkdown.match(/^#+/) || [''])[0].length;
          const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
          const CustomHeading = customRenderers[HeadingTag] || customRenderers.h2;
          segments.push(
            <CustomHeading key={`heading-${segmentKey++}`}>
              {processedLine}
            </CustomHeading>
          );
        } else if (isListItem) {
          segments.push(
            <div key={`list-${segmentKey++}`}>
              {customRenderers.li({ children: processedLine })}
            </div>
          );
        } else if (isBlockquote) {
          segments.push(
            customRenderers.blockquote({ 
              key: `blockquote-${segmentKey++}`,
              children: <p>{processedLine}</p>
            })
          );
        } else {
          segments.push(
            <p 
              key={`p-${segmentKey++}`}
              className={cn(
                'text-lg leading-relaxed mb-6 text-foreground/90',
                'break-words',
                scriptFont,
                'hyphens-auto'
              )}
            >
              {processedLine}
            </p>
          );
        }
      } else {
        // Accumulate regular markdown
        currentMarkdown += line + '\n';
      }
    }

    // Flush remaining markdown
    if (currentMarkdown.trim()) {
      segments.push(
        <ReactMarkdown
          key={`md-${segmentKey++}`}
          components={customRenderers}
          rehypePlugins={[rehypeRaw]}
        >
          {currentMarkdown}
        </ReactMarkdown>
      );
    }

    return <>{segments}</>;
  };

  const rawText = getText();
  if (!rawText || typeof rawText !== 'string') {
    console.error('ProfessionalTextFormatter: Invalid text content');
    return null;
  }

  const customRenderers = {
    a: ({ href, children, ...props }: any) => {
      return <a href={href} className="text-ocean hover:text-ocean-dark underline transition-colors" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },

    h1: ({ children, ...props }: any) => {
      return (
        <h1 
          className={cn(
            'text-4xl font-serif font-bold text-burgundy mt-12 mb-8',
            'border-b-4 border-burgundy/40 pb-6',
            scriptFont
          )}
          {...props}
        >
          {children}
        </h1>
      );
    },

    h2: ({ children, ...props }: any) => {
      return (
        <div className="relative mt-14 mb-7">
          <div className="absolute -top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent" />
          
          <h2 
            className={cn(
              'text-2xl font-serif font-bold text-burgundy pb-3',
              'border-b-2 border-burgundy/30',
              'flex items-center gap-3',
              scriptFont
            )}
            {...props}
          >
            <span className="text-saffron text-3xl">§</span>
            {children}
          </h2>
        </div>
      );
    },

    h3: ({ children, ...props }: any) => {
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
          {children}
        </h3>
      );
    },

    p: ({ children, ...props }: any) => {
      return (
        <p 
          className={cn(
            'text-lg leading-relaxed mb-6 text-foreground/90',
            'break-words',
            enableDropCap && 'first-letter:text-6xl first-letter:font-serif first-letter:font-bold',
            enableDropCap && 'first-letter:text-burgundy first-letter:float-left first-letter:mr-3',
            enableDropCap && 'first-letter:mt-1 first-letter:leading-none',
            scriptFont,
            'hyphens-auto'
          )}
          {...props}
        >
          {children}
        </p>
      );
    },

    ul: ({ children, ...props }: any) => (
      <ul className="list-none space-y-4 mb-8 ml-4" {...props}>
        {children}
      </ul>
    ),

    li: ({ children, ...props }: any) => {
      return (
        <li className={cn(
          'flex items-start gap-4 text-lg leading-relaxed text-foreground/90',
          'break-words',
          scriptFont
        )} {...props}>
          <span className="text-saffron text-2xl font-bold leading-none mt-1">•</span>
          <span className="flex-1">
            {children}
          </span>
        </li>
      );
    },

    blockquote: ({ children, ...props }: any) => {
      return (
        <blockquote 
          className={cn(
            'border-l-4 border-burgundy',
            'bg-gradient-to-r from-sandalwood/50 via-cream/30 to-transparent',
            'pl-8 pr-6 py-6 my-12 rounded-r-2xl',
            'relative overflow-hidden',
            'break-words',
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
      );
    },

    strong: ({ children, ...props }: any) => {
      return (
        <strong 
          className="font-semibold text-burgundy"
          {...props}
        >
          {children}
        </strong>
      );
    },

    em: ({ children, ...props }: any) => (
      <em className="italic text-burgundy font-medium" {...props}>
        {children}
      </em>
    ),

    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),

    td: ({ children, ...props }: any) => {
      return (
        <td 
          className="border border-burgundy/20 px-4 py-3 text-base break-words" 
          {...props}
        >
          {children}
        </td>
      );
    },

    th: ({ children, ...props }: any) => {
      return (
        <th 
          className="border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-left font-semibold text-burgundy break-words" 
          {...props}
        >
          {children}
        </th>
      );
    },

    hr: ({ ...props }: any) => (
      <hr 
        className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent" 
        {...props}
      />
    )
  };

  return (
    <div 
      className={cn('prose prose-xl max-w-none article-content', className)}
      style={{ maxWidth: 'none', width: '100%' }}
    >
      {renderWithCulturalTerms(rawText)}
    </div>
  );
};
