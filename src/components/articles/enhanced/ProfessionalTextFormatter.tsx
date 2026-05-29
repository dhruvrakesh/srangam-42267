import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// Phase O.5 — Allow the small set of HTML attributes our article system relies on
// (footnote anchors, cultural-term spans, evidence-table cell spans, language hints)
// while stripping <script>, event handlers, and other XSS vectors.
const articleSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [
      ...((defaultSchema.attributes && defaultSchema.attributes['*']) || []),
      'className', 'id', 'dir', 'lang',
      ['data*'],
    ],
    a: [
      ...((defaultSchema.attributes && defaultSchema.attributes.a) || []),
      'href', 'name', 'target', 'rel', 'id',
    ],
    td: [
      ...((defaultSchema.attributes && defaultSchema.attributes.td) || []),
      'colSpan', 'rowSpan',
    ],
    th: [
      ...((defaultSchema.attributes && defaultSchema.attributes.th) || []),
      'colSpan', 'rowSpan', 'scope',
    ],
    span: [
      ...((defaultSchema.attributes && defaultSchema.attributes.span) || []),
      'className', 'id', 'dir', 'lang',
      ['data*'],
    ],
    sup: [...((defaultSchema.attributes && defaultSchema.attributes.sup) || []), 'id'],
    sub: [...((defaultSchema.attributes && defaultSchema.attributes.sub) || []), 'id'],
  },
};
const ARTICLE_REHYPE_PLUGINS: any = [rehypeRaw, [rehypeSanitize, articleSanitizeSchema]];

import { useTranslation } from 'react-i18next';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { MultilingualContent } from '@/types/multilingual';
import { SupportedLanguage } from '@/lib/i18n';
import { normalizeLanguageCode, getScriptFont } from '@/lib/languageUtils';
import { cn } from '@/lib/utils';
import { enhanceTextWithCulturalTerms } from '@/lib/culturalTermEnhancer';
import { sanitizeArticleHtml, stripLeadingTitle } from '@/lib/textSanitizer';
import { slugifyHeading } from '@/lib/headingSlug';
import { EvidenceTable, isEvidenceTable } from './EvidenceTable';
import { MermaidBlock } from './MermaidBlock';

interface ProfessionalTextFormatterProps {
  content: MultilingualContent;
  className?: string;
  enableCulturalTerms?: boolean;
  enableDropCap?: boolean;
  autoHighlightTerms?: boolean; // Auto-detect and highlight cultural terms
  /**
   * Phase U.2 — When supplied, the first leading <h1> / `# ` heading in
   * the body is suppressed at render time IF it is semantically equivalent
   * to this title. Prevents duplicate-title clipping on mobile cards.
   * Source DB rows are never mutated.
   */
  suppressLeadingTitle?: string;
}

// ============================================================================
// Phase AR.1 — Cultural-term token resolution at the LEAF level.
//
// History: prior implementation split body by `\n` and started a new
// <ReactMarkdown> instance every time a line contained `{{cultural:...}}`.
// That tore multi-line blocks (GFM tables, fenced ```mermaid / ```code,
// multi-line blockquotes, nested lists) across separate parses, corrupting
// rendering on essentially every article with autoHighlightTerms enabled.
//
// Current contract: body is parsed by ONE <ReactMarkdown>; tokens are
// resolved inside leaf renderers via resolveCulturalTokens. NEVER reintroduce
// line-split rendering — see mem://index.md Core invariants.
// ============================================================================
const CULTURAL_TOKEN_RE = /\{\{cultural:([^}]+)\}\}/g;

const toTitleCase = (str: string): string =>
  str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const ProfessionalTextFormatter: React.FC<ProfessionalTextFormatterProps> = ({
  content,
  className,
  enableCulturalTerms = true,
  enableDropCap = false,
  autoHighlightTerms = true,
  suppressLeadingTitle,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.language || 'en') as SupportedLanguage;
  const scriptFont = getScriptFont(currentLanguage);

  const getText = (): string => {
    let text = content[currentLanguage] || content.en || Object.values(content)[0] || '';
    if (typeof text === 'string') {
      // Phase AR.3 — Whitespace-safe normalisation. The earlier
      // `replace(/^\s+/gm, '')` stripped every line's leading whitespace,
      // flattening nested-list indentation and corrupting indented/fenced
      // code blocks. We now only collapse 3+ blank lines so paragraph
      // boundaries are predictable while indentation is preserved verbatim.
      text = text.trim().replace(/\n{3,}/g, '\n\n');

      // Phase T.4 — Strip ChatGPT export artefacts (`fileturn…`, PUA cite
      // tokens, dangling footnote digits) at render time. Additive; the
      // source row in srangam_articles.content is untouched.
      text = sanitizeArticleHtml(text);

      // Phase U.2 — Suppress duplicate leading title (HTML <h1> or `# `)
      // when the caller declares the page-shell title. Render-time only;
      // source rows are not mutated.
      if (suppressLeadingTitle) {
        text = stripLeadingTitle(text, suppressLeadingTitle);
      }

      // AUTO-ENHANCE: Inject cultural term markers if enabled.
      if (enableCulturalTerms && autoHighlightTerms) {
        text = enhanceTextWithCulturalTerms(text, {
          maxLength: 15000,
          preserveExisting: true,
        });
      }

      return text;
    }
    console.warn('ProfessionalTextFormatter received non-string content:', text);
    return '';
  };

  /**
   * Phase AR.1 — Walk React children; for STRING leaves, replace
   * `{{cultural:term}}` tokens with <CulturalTermTooltip>. Pre-rendered
   * elements pass through untouched (their own renderers will resolve
   * tokens inside their children). NEVER apply to <code>.
   */
  const resolveCulturalTokens = (children: React.ReactNode): React.ReactNode => {
    if (!enableCulturalTerms) return children;
    return React.Children.map(children, (child, idx) => {
      if (typeof child !== 'string') return child;
      if (child.indexOf('{{cultural:') === -1) return child;

      const out: React.ReactNode[] = [];
      const re = new RegExp(CULTURAL_TOKEN_RE.source, 'g'); // fresh, no shared lastIndex
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(child)) !== null) {
        if (m.index > last) out.push(child.slice(last, m.index));
        const term = m[1].trim().toLowerCase();
        out.push(
          <CulturalTermTooltip key={`ct-${idx}-${m.index}`} term={term}>
            <span className="cultural-term-highlight">{toTitleCase(term)}</span>
          </CulturalTermTooltip>
        );
        last = re.lastIndex;
      }
      if (last < child.length) out.push(child.slice(last));
      return <React.Fragment key={`crf-${idx}`}>{out}</React.Fragment>;
    });
  };

  /**
   * Phase AR.3 — Recursively coerce React children into a plain string.
   * Strips `{{cultural:...}}` wrappers to inner term text so heading
   * anchor ids match what the reader actually sees, and so EvidenceTable
   * detection / cell text never contain raw tokens.
   */
  const extractHeadingText = (node: React.ReactNode): string => {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string') return node.replace(/\{\{cultural:([^}]+)\}\}/g, '$1');
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractHeadingText).join('');
    const props = (node as any)?.props;
    if (props?.children !== undefined) return extractHeadingText(props.children);
    return '';
  };

  const customRenderers = {
    a: ({ href, children, ...props }: any) => (
      <a
        href={href}
        className="text-ocean hover:text-ocean-dark underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),

    h1: ({ children, ...props }: any) => {
      const id = slugifyHeading(extractHeadingText(children));
      // Phase U.1 — mobile-safe ramp + shrink contract.
      return (
        <h1
          id={id || undefined}
          className={cn(
            'text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-burgundy mt-12 mb-8',
            'leading-snug min-w-0 max-w-full',
            'break-words [overflow-wrap:break-word] [hyphens:auto]',
            'border-b-4 border-burgundy/40 pb-6',
            scriptFont
          )}
          {...props}
        >
          {resolveCulturalTokens(children)}
        </h1>
      );
    },

    h2: ({ children, ...props }: any) => {
      const id = slugifyHeading(extractHeadingText(children));
      // Phase U.1 — icon stays `shrink-0`; text in a `min-w-0` span so the
      // flex row can wrap on narrow viewports. Phase AR.3 — id lives on the
      // <h2> itself (not the wrapping <div>) so getElementById returns the
      // actual semantic heading.
      return (
        <div className="relative mt-14 mb-7 min-w-0 max-w-full">
          <div className="absolute -top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent" />
          <h2
            id={id || undefined}
            className={cn(
              'text-xl sm:text-2xl font-serif font-bold text-burgundy pb-3',
              'border-b-2 border-burgundy/30',
              'flex items-start gap-3 min-w-0 max-w-full',
              scriptFont
            )}
            {...props}
          >
            <span className="text-saffron text-2xl shrink-0 leading-none">§</span>
            <span className="min-w-0 flex-1 break-words [overflow-wrap:break-word]">
              {resolveCulturalTokens(children)}
            </span>
          </h2>
        </div>
      );
    },

    h3: ({ children, ...props }: any) => {
      const id = slugifyHeading(extractHeadingText(children));
      return (
        <h3
          id={id || undefined}
          className={cn(
            'text-lg sm:text-xl font-serif font-semibold text-burgundy mt-10 mb-6',
            'flex items-start gap-2 min-w-0 max-w-full',
            scriptFont
          )}
          {...props}
        >
          <span className="text-gold-warm text-xl shrink-0 leading-none">◆</span>
          <span className="min-w-0 flex-1 break-words [overflow-wrap:break-word]">
            {resolveCulturalTokens(children)}
          </span>
        </h3>
      );
    },

    // Phase AR.2 — drop cap is gated by a class on the OUTER container, not
    // per-paragraph utilities. ::first-letter is per-block, so attaching it
    // here was making every <p> render with a giant initial.
    p: ({ children, ...props }: any) => (
      <p
        className={cn(
          'text-base leading-relaxed mb-6 text-foreground/90',
          'min-w-0 max-w-full break-words [overflow-wrap:break-word]',
          scriptFont,
          'hyphens-auto'
        )}
        {...props}
      >
        {resolveCulturalTokens(children)}
      </p>
    ),

    ul: ({ children, ...props }: any) => (
      <ul className="list-none space-y-4 mb-8 ml-4 min-w-0 max-w-full" {...props}>
        {children}
      </ul>
    ),

    li: ({ children, ...props }: any) => (
      <li
        className={cn(
          'flex items-start gap-4 text-base leading-relaxed text-foreground/90',
          'min-w-0 max-w-full',
          scriptFont
        )}
        {...props}
      >
        <span className="text-saffron text-xl font-bold leading-none mt-1 shrink-0">•</span>
        <span className="min-w-0 flex-1 break-words [overflow-wrap:break-word]">
          {resolveCulturalTokens(children)}
        </span>
      </li>
    ),

    blockquote: ({ children, ...props }: any) => (
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
          {resolveCulturalTokens(children)}
        </div>
        <div className="absolute top-4 right-6 text-6xl text-burgundy/20 font-serif leading-none">
          "
        </div>
      </blockquote>
    ),

    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold text-burgundy" {...props}>
        {resolveCulturalTokens(children)}
      </strong>
    ),

    em: ({ children, ...props }: any) => (
      <em className="italic text-burgundy font-medium" {...props}>
        {resolveCulturalTokens(children)}
      </em>
    ),

    // Table elements - detect evidence tables and render with specialized component
    table: ({ children, ...props }: any) => {
      const tableData = extractTableData(children);
      if (tableData && isEvidenceTable(tableData.headers)) {
        return (
          <EvidenceTable
            headers={tableData.headers}
            rows={tableData.rows}
            className="my-8"
          />
        );
      }
      return (
        <div className="relative overflow-x-auto my-8 rounded-lg border border-burgundy/20 shadow-sm">
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none lg:hidden z-20" />
          <table className="w-full border-collapse min-w-[900px]" {...props}>
            {children}
          </table>
        </div>
      );
    },

    thead: ({ children, ...props }: any) => (
      <thead
        className="sticky top-0 z-10 bg-sandalwood/95 backdrop-blur-sm border-b-2 border-burgundy/30"
        {...props}
      >
        {children}
      </thead>
    ),

    tbody: ({ children, ...props }: any) => (
      <tbody
        className="divide-y divide-burgundy/10 [&>tr:nth-child(even)]:bg-cream/30 [&>tr:hover]:bg-saffron/5 transition-colors"
        {...props}
      >
        {children}
      </tbody>
    ),

    td: ({ children, ...props }: any) => (
      <td
        className={cn(
          'border border-burgundy/15 px-3 py-2.5 text-sm leading-relaxed',
          'min-w-[80px] max-w-[280px] break-words align-top',
          'first:font-medium first:bg-sandalwood/20 first:min-w-[70px]',
          scriptFont
        )}
        {...props}
      >
        {resolveCulturalTokens(children)}
      </td>
    ),

    th: ({ children, ...props }: any) => (
      <th
        className={cn(
          'border border-burgundy/20 bg-burgundy/10 px-3 py-2.5',
          'text-left font-semibold text-burgundy text-xs uppercase tracking-wide',
          'min-w-[80px] max-w-[200px] whitespace-normal',
          scriptFont
        )}
        {...props}
      >
        {resolveCulturalTokens(children)}
      </th>
    ),

    hr: ({ ...props }: any) => (
      <hr
        className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent"
        {...props}
      />
    ),

    // Phase H — render fenced ```mermaid blocks via the lazy MermaidBlock.
    // Phase AR.1 — `code` deliberately does NOT resolve cultural tokens.
    // `culturalTermEnhancer` protects HTML/markdown tables but does not
    // skip fenced code/mermaid blocks, so a stray token may land here;
    // leaving it as literal text is the correct, safe fallback.
    code: ({ inline, className: codeClass, children, ...props }: any) => {
      const lang = /language-(\w+)/.exec(codeClass || '')?.[1];
      const codeText = String(children ?? '').replace(/\n$/, '');
      if (!inline && lang === 'mermaid' && codeText.trim()) {
        return <MermaidBlock chart={codeText} />;
      }
      return (
        <code className={codeClass} {...props}>
          {children}
        </code>
      );
    },
  };

  // Helper to extract table data from React children for evidence table detection
  const extractTableData = (
    children: React.ReactNode
  ): { headers: string[]; rows: string[][] } | null => {
    try {
      const headers: string[] = [];
      const rows: string[][] = [];

      const isTheadElement = (node: any): boolean => {
        if (!node) return false;
        if (node.type === 'thead') return true;
        if (
          typeof node.type === 'function' &&
          (node.type.name?.toLowerCase()?.includes('thead') ||
            node.type.displayName?.toLowerCase()?.includes('thead'))
        )
          return true;
        if (node.props?.['data-tag'] === 'thead') return true;
        return false;
      };

      const isTbodyElement = (node: any): boolean => {
        if (!node) return false;
        if (node.type === 'tbody') return true;
        if (
          typeof node.type === 'function' &&
          (node.type.name?.toLowerCase()?.includes('tbody') ||
            node.type.displayName?.toLowerCase()?.includes('tbody'))
        )
          return true;
        if (node.props?.['data-tag'] === 'tbody') return true;
        return false;
      };

      const extractHeaders = (trChildren: any) => {
        React.Children.forEach(trChildren, (tr: any) => {
          if (!tr?.props?.children) return;
          React.Children.forEach(tr.props.children, (th: any) => {
            const text = extractTextFromNode(th);
            if (text && text.trim()) headers.push(text.trim());
          });
        });
      };

      const extractRows = (trChildren: any) => {
        React.Children.forEach(trChildren, (tr: any) => {
          if (!tr?.props?.children) return;
          const row: string[] = [];
          React.Children.forEach(tr.props.children, (td: any) => {
            const text = extractTextFromNode(td);
            row.push((text || '').trim());
          });
          if (row.length > 0 && row.some(cell => cell)) rows.push(row);
        });
      };

      const processNode = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
          node.forEach(processNode);
          return;
        }
        if (isTheadElement(node)) {
          extractHeaders(node.props?.children);
        } else if (isTbodyElement(node)) {
          extractRows(node.props?.children);
        } else if (node?.props?.children) {
          processNode(node.props.children);
        }
      };

      React.Children.forEach(children, processNode);

      // Phase AR.3 — log only in dev so production console stays clean.
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[TableExtraction]', {
          headerCount: headers.length,
          rowCount: rows.length,
          headers: headers.slice(0, 3).join(', '),
        });
      }

      return headers.length > 0 ? { headers, rows } : null;
    } catch (e) {
      console.error('[TableExtraction] Failed:', e);
      return null;
    }
  };

  const extractTextFromNode = (node: any): string => {
    if (!node) return '';
    // Phase AR.1 — strip cultural-term wrappers down to inner term text so
    // EvidenceTable detection and cell text never carry raw tokens.
    if (typeof node === 'string') return node.replace(/\{\{cultural:([^}]+)\}\}/g, '$1');
    if (typeof node === 'number') return String(node);
    if (node.props?.children) {
      if (typeof node.props.children === 'string') {
        return node.props.children.replace(/\{\{cultural:([^}]+)\}\}/g, '$1');
      }
      if (Array.isArray(node.props.children)) {
        return node.props.children.map(extractTextFromNode).join(' ');
      }
      return extractTextFromNode(node.props.children);
    }
    return '';
  };

  const rawText = getText();
  if (!rawText || typeof rawText !== 'string') {
    console.error('ProfessionalTextFormatter: Invalid text content');
    return null;
  }

  return (
    <div
      className={cn(
        'prose prose-lg sm:prose-xl max-w-none article-content min-w-0',
        // Phase AR.2 — drop cap gating class; CSS lives in src/index.css
        // under `.article-content.article-dropcap > p:first-of-type::first-letter`.
        enableDropCap && 'article-dropcap',
        className
      )}
      style={{ maxWidth: 'none', width: '100%' }}
    >
      <ReactMarkdown components={customRenderers} rehypePlugins={ARTICLE_REHYPE_PLUGINS}>
        {rawText}
      </ReactMarkdown>
    </div>
  );
};
