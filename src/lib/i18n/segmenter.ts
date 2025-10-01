/**
 * Content Segmentation System
 * Parses article content into stable, human-readable keys
 */

export interface SegmentedContent {
  title: string;
  abstract: string;
  sections: Record<string, {
    heading: string;
    body: Record<string, string>;
  }>;
  figures: Record<string, {
    caption: string;
    alt: string;
  }>;
  ui: Record<string, string>;
}

export interface ArticleStrings {
  [key: string]: string;
}

/**
 * Segment markdown content into stable keys
 */
export function segmentContent(markdown: string): ArticleStrings {
  const strings: ArticleStrings = {};
  const lines = markdown.split('\n');
  
  let currentSection = '';
  let paragraphIndex = 0;
  let headingLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Handle headings
    if (line.startsWith('##')) {
      headingLevel = line.match(/^#+/)?.[0].length || 0;
      const headingText = line.replace(/^#+\s*/, '');
      
      // Create section identifier from heading
      currentSection = headingText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const key = headingLevel === 2 
        ? `section.${currentSection}.heading`
        : `section.${currentSection}.subheading`;
      
      strings[key] = headingText;
      paragraphIndex = 0;
      continue;
    }
    
    // Handle paragraphs
    if (line.length > 0 && !line.startsWith('#')) {
      paragraphIndex++;
      const key = currentSection
        ? `section.${currentSection}.p${paragraphIndex}`
        : `intro.p${paragraphIndex}`;
      
      strings[key] = line;
    }
  }
  
  return strings;
}

/**
 * Flatten multilingual content into strings format
 */
export function flattenMultilingualContent(
  content: { [key: string]: string | any }
): ArticleStrings {
  const strings: ArticleStrings = {};
  
  function flatten(obj: any, prefix = ''): void {
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        strings[newKey] = value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value, newKey);
      }
    }
  }
  
  flatten(content);
  return strings;
}

/**
 * Extract stable keys from article data
 */
export function extractArticleKeys(article: any): ArticleStrings {
  const strings: ArticleStrings = {};
  
  // Extract title
  if (article.title?.en) {
    strings['meta.title'] = article.title.en;
  }
  
  // Extract dek/abstract
  if (article.dek?.en) {
    strings['meta.dek'] = article.dek.en;
  }
  
  // Extract content
  if (article.content?.en) {
    const contentStrings = segmentContent(article.content.en);
    Object.assign(strings, contentStrings);
  }
  
  // Extract tags
  if (Array.isArray(article.tags)) {
    article.tags.forEach((tag: any, index: number) => {
      const tagText = typeof tag === 'string' ? tag : tag.en;
      if (tagText) {
        strings[`tag.${index}`] = tagText;
      }
    });
  }
  
  return strings;
}
