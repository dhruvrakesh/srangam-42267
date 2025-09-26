import React from 'react';
import { useTranslation } from 'react-i18next';
import { EnhancedMultilingualText } from '@/components/language/EnhancedMultilingualText';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { MultilingualContent } from '@/types/multilingual';
import { SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode, getScriptFont } from '@/lib/languageUtils';
import { cn } from '@/lib/utils';

interface ImprovedTextFormattingProps {
  content: MultilingualContent;
  className?: string;
  enableCulturalTerms?: boolean;
  showQuotes?: boolean;
  paragraphSpacing?: 'normal' | 'wide' | 'compact';
}

export const ImprovedTextFormatting: React.FC<ImprovedTextFormattingProps> = ({
  content,
  className,
  enableCulturalTerms = true,
  showQuotes = true,
  paragraphSpacing = 'normal'
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en') as SupportedLanguage;
  const scriptFont = getScriptFont(currentLanguage);

  const getSpacingClass = () => {
    switch (paragraphSpacing) {
      case 'wide': return 'space-y-6';
      case 'compact': return 'space-y-3';
      default: return 'space-y-4';
    }
  };

  const formatContent = (text: string) => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Handle headers
      if (paragraph.startsWith('##')) {
        const headerText = paragraph.replace(/^##\s*/, '');
        return (
          <h2 
            key={index} 
            className={cn(
              'text-2xl font-serif font-semibold text-foreground mb-4 mt-6',
              'border-b border-border/30 pb-2',
              scriptFont
            )}
          >
            {enableCulturalTerms ? (
              <EnhancedMultilingualText
                content={{ [currentLanguage]: headerText }}
                enableCulturalTerms={true}
                fallback={headerText}
              />
            ) : (
              headerText
            )}
          </h2>
        );
      }

      // Handle block quotes (lines starting with >)
      if (paragraph.startsWith('>')) {
        const quoteText = paragraph.replace(/^>\s*/, '');
        return (
          <blockquote 
            key={index}
            className={cn(
              'border-l-4 border-saffron/50 pl-4 py-2 my-4',
              'bg-gradient-to-r from-saffron/5 to-transparent',
              'italic text-foreground/80',
              scriptFont
            )}
          >
            {enableCulturalTerms ? (
              <EnhancedMultilingualText
                content={{ [currentLanguage]: quoteText }}
                enableCulturalTerms={true}
                fallback={quoteText}
              />
            ) : (
              quoteText
            )}
          </blockquote>
        );
      }

      // Handle regular paragraphs with enhanced formatting
      const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      
      // Break long paragraphs into smaller chunks (max 4 sentences per visual paragraph)
      const chunks = [];
      for (let i = 0; i < sentences.length; i += 4) {
        chunks.push(sentences.slice(i, i + 4).join(' '));
      }

      return chunks.map((chunk, chunkIndex) => (
        <p 
          key={`${index}-${chunkIndex}`}
          className={cn(
            'text-base leading-relaxed text-foreground/90',
            'hyphens-auto text-justify',
            scriptFont
          )}
        >
          {enableCulturalTerms ? (
            <EnhancedMultilingualText
              content={{ [currentLanguage]: chunk }}
              enableCulturalTerms={true}
              fallback={chunk}
            />
          ) : (
            chunk
          )}
        </p>
      ));
    });
  };

  const getText = () => {
    return content[currentLanguage] || content.en || Object.values(content)[0] || '';
  };

  const textContent = getText();
  if (typeof textContent !== 'string') return null;

  return (
    <div className={cn('prose prose-lg max-w-none', getSpacingClass(), className)}>
      {formatContent(textContent)}
    </div>
  );
};