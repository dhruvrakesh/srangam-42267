import { culturalTermsDatabase } from '@/data/articles/cultural-terms';

/**
 * Cultural Term Enhancement Utility
 * Auto-detects and highlights cultural terms in text
 * Optimized with caching and efficient regex patterns
 */

// Cache for the compiled regex pattern (module-level singleton)
let cachedPattern: RegExp | null = null;
let cachedTermsSet: Set<string> | null = null;

/**
 * Builds an optimized regex pattern from cultural terms database
 * - Sorts terms by length (longer first) to prioritize multi-word terms
 * - Escapes special regex characters
 * - Uses word boundaries for accurate matching
 */
const buildTermPattern = (): RegExp => {
  if (cachedPattern) return cachedPattern;

  // Get all terms and sort by length (descending) to match longer terms first
  const terms = Object.keys(culturalTermsDatabase)
    .sort((a, b) => b.length - a.length);

  // Build set for O(1) existence checks
  cachedTermsSet = new Set(terms.map(t => t.toLowerCase()));

  // Escape special regex characters and create alternation pattern
  const escapedTerms = terms.map(term =>
    term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  );

  // Use word boundaries to avoid partial matches
  // Case-insensitive matching
  cachedPattern = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

  return cachedPattern;
};

/**
 * Get the cached set of cultural terms for existence checks
 */
export const getCulturalTermsSet = (): Set<string> => {
  if (!cachedTermsSet) {
    buildTermPattern(); // Initialize if not already done
  }
  return cachedTermsSet!;
};

/**
 * Enhances text by auto-injecting {{cultural:term}} markers for known terms
 * @param text - The text to enhance
 * @param options - Enhancement options
 * @returns Enhanced text with cultural term markers
 */
export const enhanceTextWithCulturalTerms = (
  text: string,
  options: {
    maxLength?: number; // Max characters to process (for performance)
    preserveExisting?: boolean; // Don't re-mark already marked terms
  } = {}
): string => {
  const { maxLength = 10000, preserveExisting = true } = options;

  if (!text || text.length === 0) return text;

  // If preserving existing markers, skip text that already has markers
  if (preserveExisting && text.includes('{{cultural:')) {
    return text; // Already enhanced
  }

  // Phase K.2: Protect HTML anchor tags from enhancement.
  // Without this, a cultural term that appears inside an href attribute
  // (e.g. "veda" inside ".../sayana-veda-english-translation/...") gets
  // rewritten to {{cultural:veda}}, splitting the URL and producing raw
  // attribute text in the rendered article body.
  const anchorRegex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  const anchors: string[] = [];
  let protectedText = text.replace(anchorRegex, (match) => {
    anchors.push(match);
    return `__A_PLACEHOLDER_${anchors.length - 1}__`;
  });

  // Phase K.2: Protect markdown link syntax [text](url).
  const mdLinkRegex = /\[[^\]]+\]\([^)]+\)/g;
  const mdLinks: string[] = [];
  protectedText = protectedText.replace(mdLinkRegex, (match) => {
    mdLinks.push(match);
    return `__MDLINK_PLACEHOLDER_${mdLinks.length - 1}__`;
  });

  // Phase K.2: Protect bare URLs.
  const bareUrlRegex = /\bhttps?:\/\/[^\s<>"')]+/gi;
  const bareUrls: string[] = [];
  protectedText = protectedText.replace(bareUrlRegex, (match) => {
    bareUrls.push(match);
    return `__URL_PLACEHOLDER_${bareUrls.length - 1}__`;
  });

  // CRITICAL: Protect table content from enhancement to prevent HTML corruption
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  const tables: string[] = [];
  protectedText = protectedText.replace(tableRegex, (match) => {
    tables.push(match);
    return `__TABLE_PLACEHOLDER_${tables.length - 1}__`;
  });

  // Also protect markdown tables (lines starting with |)
  const markdownTableRegex = /(\|[^\n]+\|\n)+/g;
  const mdTables: string[] = [];
  protectedText = protectedText.replace(markdownTableRegex, (match) => {
    mdTables.push(match);
    return `__MDTABLE_PLACEHOLDER_${mdTables.length - 1}__`;
  });

  // Limit processing for very long texts
  const textToProcess = protectedText.length > maxLength 
    ? protectedText.substring(0, maxLength) 
    : protectedText;

  const pattern = buildTermPattern();
  const termsSet = getCulturalTermsSet();
  const processedTerms = new Set<string>(); // Track terms we've already marked

  // Replace matches with cultural term markers
  let enhancedText = textToProcess.replace(pattern, (match) => {
    const normalizedTerm = match.toLowerCase().trim();
    
    // Check if term exists in our database
    if (!termsSet.has(normalizedTerm)) {
      return match; // Not a cultural term, return as-is
    }

    // Avoid duplicate marking of the same term in the text
    // (only mark first occurrence to reduce visual clutter)
    if (processedTerms.has(normalizedTerm)) {
      return match;
    }

    processedTerms.add(normalizedTerm);
    return `{{cultural:${normalizedTerm}}}`;
  });

  // If we truncated, append the rest of the protected text
  if (protectedText.length > maxLength) {
    enhancedText += protectedText.substring(maxLength);
  }

  // Restore in reverse order of protection so nested placeholders unwind correctly.
  mdTables.forEach((table, index) => {
    enhancedText = enhancedText.replace(`__MDTABLE_PLACEHOLDER_${index}__`, table);
  });
  tables.forEach((table, index) => {
    enhancedText = enhancedText.replace(`__TABLE_PLACEHOLDER_${index}__`, table);
  });
  bareUrls.forEach((url, index) => {
    enhancedText = enhancedText.replace(`__URL_PLACEHOLDER_${index}__`, url);
  });
  mdLinks.forEach((link, index) => {
    enhancedText = enhancedText.replace(`__MDLINK_PLACEHOLDER_${index}__`, link);
  });
  anchors.forEach((anchor, index) => {
    enhancedText = enhancedText.replace(`__A_PLACEHOLDER_${index}__`, anchor);
  });

  return enhancedText;
};

/**
 * Checks if a term is in the cultural terms database
 */
export const isCulturalTerm = (term: string): boolean => {
  const termsSet = getCulturalTermsSet();
  return termsSet.has(term.toLowerCase().trim());
};

/**
 * Extracts all cultural terms found in a text
 */
export const extractCulturalTerms = (text: string): string[] => {
  if (!text) return [];

  const pattern = buildTermPattern();
  const termsSet = getCulturalTermsSet();
  const foundTerms = new Set<string>();

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const term = match[1].toLowerCase().trim();
    if (termsSet.has(term)) {
      foundTerms.add(term);
    }
  }

  return Array.from(foundTerms);
};

/**
 * Gets statistics about cultural terms in text
 */
export const getCulturalTermStats = (text: string): {
  totalTerms: number;
  uniqueTerms: number;
  terms: string[];
  coverage: number; // Percentage of text that are cultural terms
} => {
  const foundTerms = extractCulturalTerms(text);
  const pattern = buildTermPattern();
  const matches = text.match(pattern) || [];

  return {
    totalTerms: matches.length,
    uniqueTerms: foundTerms.length,
    terms: foundTerms,
    coverage: text.length > 0 ? (matches.length / text.split(/\s+/).length) * 100 : 0
  };
};
