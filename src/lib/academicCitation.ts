// Advanced Academic Citation System for Dharmic Scholarship
import { InscriptionShastra } from '@/data/inscriptions/interfaces';

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'dharmic' | 'iast';

export interface AcademicCitation {
  id: string;
  title: string;
  authors: string[];
  year: string;
  location: string;
  publisher?: string;
  doi?: string;
  sanskritTitle?: string;
  traditionalSource?: string;
}

export interface SanskritValidation {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  iastCompliant: boolean;
}

// Academic citation formatting following multiple scholarly traditions
export const generateCitation = (
  inscription: InscriptionShastra, 
  style: CitationStyle = 'dharmic',
  additionalAuthors: string[] = []
): string => {
  const { title, location, period, bibliography } = inscription;
  const date = period.dating.precise || period.dating.approximate;
  const authors = additionalAuthors.length > 0 ? additionalAuthors : ['Anonymous'];
  
  switch (style) {
    case 'dharmic':
      // Traditional Indic scholarly format with Sanskrit conventions
      const sanskritLocation = location.ancient !== location.modern 
        ? `${location.ancient} (${location.modern})` 
        : location.ancient;
      return `${title}। ${sanskritLocation}, ${location.region}। ${period.dynasty} काल, ${date}। [Dharmic Archaeological Archive]`;
    
    case 'apa':
      return `${authors.join(', ')}. (${extractYear(date)}). ${title}. ${location.ancient}, ${location.modern}. ${location.region}.`;
    
    case 'mla':
      return `${authors[0]}${authors.length > 1 ? ', et al.' : ''}. "${title}." ${location.ancient}, ${location.modern}, ${extractYear(date)}.`;
    
    case 'chicago':
      return `${authors.join(', ')}. ${title}. ${location.ancient}, ${location.modern}: ${location.region}, ${extractYear(date)}.`;
    
    case 'iast':
      // Strict IAST transliteration format for academic publications
      const iastTitle = convertToIAST(title);
      return `${iastTitle} (${location.ancient}). ${period.dynasty} vaṃśa, ${date}. ${location.region} pradeśa.`;
    
    default:
      return generateCitation(inscription, 'dharmic', additionalAuthors);
  }
};

// Sanskrit term validation with IAST compliance
export const validateSanskritTerm = (term: string): SanskritValidation => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // IAST character validation
  const iastPattern = /^[a-zA-Z\u0101\u012B\u016B\u1E5D\u1E47\u1E37\u1E43\u1E33\u015B\u1E63\u1E25\u1E0D\u1E6D\u1E47\u1E5B\u1E37\u1E43\u1E33\u1E63\u1E25\u1E0D\u1E6D]+$/;
  const iastCompliant = iastPattern.test(term);
  
  if (!iastCompliant) {
    errors.push('Contains non-IAST characters');
    suggestions.push('Use standard IAST transliteration (ā, ī, ū, ṛ, ṇ, ṭ, ḍ, ś, ṣ, ḥ)');
  }
  
  // Common Sanskrit validation rules
  if (term.includes('ch') && !term.includes('cch')) {
    suggestions.push('Consider using "c" instead of "ch" for Sanskrit transliteration');
  }
  
  if (term.includes('kh') || term.includes('gh') || term.includes('th') || term.includes('dh')) {
    // Aspirated consonants are valid in IAST
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    suggestions,
    iastCompliant
  };
};

// Convert Devanagari to IAST (simplified implementation)
export const convertToIAST = (devanagariText: string): string => {
  const conversionMap: { [key: string]: string } = {
    'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
    'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ए': 'e', 'ओ': 'o',
    'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'ṅa',
    'च': 'ca', 'छ': 'cha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'ña',
    'ट': 'ṭa', 'ठ': 'ṭha', 'ड': 'ḍa', 'ढ': 'ḍha', 'ण': 'ṇa',
    'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
    'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
    'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
    'श': 'śa', 'ष': 'ṣa', 'स': 'sa', 'ह': 'ha'
  };
  
  let result = devanagariText;
  Object.entries(conversionMap).forEach(([dev, iast]) => {
    result = result.replace(new RegExp(dev, 'g'), iast);
  });
  
  return result;
};

// Academic bibliography generation
export const generateBibliography = (inscriptions: InscriptionShastra[]): string[] => {
  return inscriptions
    .filter(inscription => inscription.bibliography && inscription.bibliography.length > 0)
    .flatMap(inscription => inscription.bibliography || [])
    .sort()
    .filter((item, index, array) => array.indexOf(item) === index); // Remove duplicates
};

// Cross-reference generation for related inscriptions
export const generateCrossReferences = (
  inscription: InscriptionShastra, 
  allInscriptions: InscriptionShastra[]
): { [category: string]: InscriptionShastra[] } => {
  const crossRefs: { [category: string]: InscriptionShastra[] } = {
    'Same Period': [],
    'Same Region': [],
    'Same Script Type': [],
    'Related Tags': [],
    'Explicit References': []
  };
  
  allInscriptions.forEach(other => {
    if (other.id === inscription.id) return;
    
    // Same period
    if (other.period.dynasty === inscription.period.dynasty) {
      crossRefs['Same Period'].push(other);
    }
    
    // Same region
    if (other.location.region === inscription.location.region) {
      crossRefs['Same Region'].push(other);
    }
    
    // Same script type
    const hasCommonScript = other.scripts.some(script => 
      inscription.scripts.some(inscScript => inscScript.scriptType === script.scriptType)
    );
    if (hasCommonScript) {
      crossRefs['Same Script Type'].push(other);
    }
    
    // Related tags
    const commonTags = other.tags.filter(tag => inscription.tags.includes(tag));
    if (commonTags.length >= 2) {
      crossRefs['Related Tags'].push(other);
    }
    
    // Explicit references
    if (inscription.relatedInscriptions?.includes(other.id) || 
        other.relatedInscriptions?.includes(inscription.id)) {
      crossRefs['Explicit References'].push(other);
    }
  });
  
  // Remove empty categories and limit results
  Object.keys(crossRefs).forEach(category => {
    if (crossRefs[category].length === 0) {
      delete crossRefs[category];
    } else {
      crossRefs[category] = crossRefs[category].slice(0, 5); // Limit to 5 per category
    }
  });
  
  return crossRefs;
};

// Helper function to extract year from date string
const extractYear = (dateString: string): string => {
  const match = dateString.match(/\d{3,4}/);
  return match ? match[0] : 'Unknown';
};

// Traditional knowledge validation framework
export const validateTraditionalSource = (source: string): {
  isRecognized: boolean;
  tradition: string;
  authority: 'high' | 'medium' | 'low';
  notes: string[];
} => {
  const traditionalSources = {
    'Vedic': { authority: 'high' as const, patterns: ['veda', 'samhita', 'brahmana', 'upanishad'] },
    'Puranic': { authority: 'high' as const, patterns: ['purana', 'itihasa', 'ramayana', 'mahabharata'] },
    'Agamic': { authority: 'high' as const, patterns: ['agama', 'tantra', 'samhita'] },
    'Kavya': { authority: 'medium' as const, patterns: ['kavya', 'mahakavya', 'katha'] },
    'Dharmashastra': { authority: 'high' as const, patterns: ['dharma', 'smriti', 'sutra'] },
    'Local Tradition': { authority: 'medium' as const, patterns: ['sthala', 'mahatmya', 'gatha'] }
  };
  
  const sourceLower = source.toLowerCase();
  let tradition = 'Unknown';
  let authority: 'high' | 'medium' | 'low' = 'low';
  let isRecognized = false;
  const notes: string[] = [];
  
  Object.entries(traditionalSources).forEach(([trad, config]) => {
    if (config.patterns.some(pattern => sourceLower.includes(pattern))) {
      tradition = trad;
      authority = config.authority;
      isRecognized = true;
      notes.push(`Recognized as ${trad} tradition source`);
    }
  });
  
  if (!isRecognized) {
    notes.push('Source not found in traditional knowledge classification system');
    notes.push('Consider validation with traditional scholars');
  }
  
  return { isRecognized, tradition, authority, notes };
};