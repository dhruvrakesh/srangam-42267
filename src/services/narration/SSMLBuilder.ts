// SSML Builder for context-aware pronunciation and emphasis

interface SSMLOptions {
  language: string;
  hasCitations?: boolean;
  hasSanskrit?: boolean;
  hasPoetry?: boolean;
  culturalTerms?: string[];
}

// Sanskrit pronunciation dictionary (IPA phonemes)
const SANSKRIT_PRONUNCIATION: Record<string, string> = {
  'paraśurāma': 'pəɾəʃʊɾaːmə',
  'kaśyapa': 'kəʃjəpə',
  'satisaras': 'sətiːsərəs',
  'nāga': 'naːɡə',
  'purāṇa': 'pʊɾaːɳə',
  'mahābhārata': 'məhaːbʱaːɾətə',
  'rājataraṅgiṇī': 'ɾaːdʒətəɾəŋɡɪɳiː',
  'sarasvatī': 'səɾəsvətiː',
  'ṛgveda': 'ɾ̩ɡveːdə',
  'śatapatha': 'ʃətəpətʰə',
  'brāhmaṇa': 'bɾaːhməɳə',
};

export class SSMLBuilder {
  /**
   * Build SSML for full article narration
   */
  buildForArticle(content: string, options: SSMLOptions): string {
    // Defensive check: handle null/undefined/empty content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.warn('SSMLBuilder: invalid content provided');
      return '<speak></speak>';
    }

    let ssml = `<speak>`;
    
    let processedContent = content;

    // Apply transformations in order
    if (options.hasSanskrit) {
      processedContent = this.pronounceDiacritics(processedContent);
    }

    if (options.hasCitations) {
      processedContent = this.emphasizeCitations(processedContent);
    }

    if (options.hasPoetry) {
      processedContent = this.enhancePoetry(processedContent);
    }

    // Add section breaks for headings
    processedContent = this.addNarrationCues(processedContent);

    ssml += processedContent;
    ssml += `</speak>`;

    return ssml;
  }

  /**
   * Build SSML for glossary term (short-form)
   */
  buildForGlossary(term: string, etymology: string, context: string): string {
    // Defensive checks
    if (!term || typeof term !== 'string') {
      console.warn('SSMLBuilder: invalid term provided');
      return '<speak></speak>';
    }

    const phoneme = SANSKRIT_PRONUNCIATION[term.toLowerCase()] || '';
    
    let ssml = `<speak>`;
    
    if (phoneme) {
      ssml += `<phoneme alphabet="ipa" ph="${phoneme}">${term}</phoneme>. `;
    } else {
      ssml += `${term}. `;
    }

    ssml += `<break time="300ms"/>`;
    ssml += etymology;
    ssml += `<break time="500ms"/>`;
    ssml += context;
    ssml += `</speak>`;

    return ssml;
  }

  /**
   * Add phoneme pronunciation for Sanskrit terms with diacritics
   */
  private pronounceDiacritics(text: string): string {
    let processed = text;

    // Match Sanskrit terms (words with diacritics)
    Object.entries(SANSKRIT_PRONUNCIATION).forEach(([term, ipa]) => {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
      processed = processed.replace(
        regex,
        `<phoneme alphabet="ipa" ph="${ipa}">${term}</phoneme>`
      );
    });

    return processed;
  }

  /**
   * Add pauses and emphasis around citations
   */
  private emphasizeCitations(text: string): string {
    // Pattern: (Author Year), [Author Year], or "According to Author"
    let processed = text;

    // Parenthetical citations: (Smith 2024)
    processed = processed.replace(
      /\(([A-Z][a-z]+ \d{4})\)/g,
      `<break time="200ms"/><prosody rate="105%" pitch="-2%">$1</prosody><break time="200ms"/>`
    );

    // "According to X" phrases
    processed = processed.replace(
      /According to ([A-Z][a-z]+( [A-Z][a-z]+)?)/g,
      `<break time="300ms"/>According to <prosody rate="95%">$1</prosody>`
    );

    return processed;
  }

  /**
   * Enhance poetry/verse with slower pacing
   */
  private enhancePoetry(text: string): string {
    // Detect verse blocks (lines ending with specific meters or indentation patterns)
    // For now, simple heuristic: lines that look like verse
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      // If line is short and doesn't end with period (likely verse)
      if (line.trim().length > 0 && line.trim().length < 80 && !line.trim().endsWith('.')) {
        return `<prosody rate="85%" pitch="+3%">${line}</prosody>`;
      }
      return line;
    });

    return processedLines.join('\n');
  }

  /**
   * Add narration cues for section breaks and headings
   */
  private addNarrationCues(text: string): string {
    let processed = text;

    // Markdown headings
    processed = processed.replace(
      /^## (.+)$/gm,
      `<break time="800ms"/><prosody rate="95%" pitch="+5%" volume="+3dB">$1</prosody><break time="600ms"/>`
    );

    processed = processed.replace(
      /^### (.+)$/gm,
      `<break time="600ms"/><prosody rate="97%" pitch="+3%">$1</prosody><break time="400ms"/>`
    );

    // Paragraph breaks
    processed = processed.replace(/\n\n/g, '\n<break time="500ms"/>\n');

    return processed;
  }

  /**
   * Build minimal SSML (just wrap in speak tags)
   */
  buildMinimal(content: string): string {
    return `<speak>${content}</speak>`;
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Add custom pronunciation for specific terms
   */
  addCustomPronunciation(term: string, ipa: string): void {
    SANSKRIT_PRONUNCIATION[term.toLowerCase()] = ipa;
  }
}

export const ssmlBuilder = new SSMLBuilder();
