import React from 'react';
import { useTranslation } from 'react-i18next';
import { MultilingualContent } from '@/types/multilingual';
import { SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode } from '@/lib/languageUtils';

interface SimplifiedMarkdownRendererProps {
  content: MultilingualContent;
  className?: string;
}

export const SimplifiedMarkdownRenderer: React.FC<SimplifiedMarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en') as SupportedLanguage;

  const getText = () => {
    return content[currentLanguage] || content.en || Object.values(content)[0] || '';
  };

  const processMarkdown = (text: string): string => {
    if (typeof text !== 'string') return '';

    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-serif font-semibold text-foreground mb-3 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-serif font-semibold text-foreground mb-4 mt-8 border-b border-border/30 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-serif font-bold text-foreground mb-6 mt-8">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/90">$1</em>')
      // Block quotes
      .replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-saffron/50 pl-4 py-2 my-4 bg-gradient-to-r from-saffron/5 to-transparent italic text-foreground/80">$1</blockquote>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="text-base leading-relaxed text-foreground/90 mb-4">')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  const rawContent = getText();
  if (typeof rawContent !== 'string') return null;
  
  const processedContent = processMarkdown(rawContent);

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <p className="text-base leading-relaxed text-foreground/90 mb-4">
        <span dangerouslySetInnerHTML={{ __html: processedContent }} />
      </p>
    </div>
  );
};
