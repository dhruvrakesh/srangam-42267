import { SupportedLanguage } from '@/types/multilingual';

/**
 * Sanskrit/IAST transliteration mapping for enhanced search
 */
const DEVANAGARI_TO_IAST: Record<string, string> = {
  // Vowels
  'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
  'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ॡ': 'ḹ', 'ए': 'e', 'ऐ': 'ai',
  'ओ': 'o', 'औ': 'au',
  
  // Consonants
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'ṅa',
  'च': 'ca', 'छ': 'cha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'ña',
  'ट': 'ṭa', 'ठ': 'ṭha', 'ड': 'ḍa', 'ढ': 'ḍha', 'ण': 'ṇa',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
  'श': 'śa', 'ष': 'ṣa', 'स': 'sa', 'ह': 'ha',
  
  // Additional characters
  'ं': 'ṃ', 'ः': 'ḥ', '्': '', 'ॐ': 'oṃ'
};

const IAST_TO_SIMPLE: Record<string, string> = {
  'ā': 'a', 'ī': 'i', 'ū': 'u', 'ṛ': 'r', 'ṝ': 'r', 'ḷ': 'l', 'ḹ': 'l',
  'ṅ': 'n', 'ñ': 'n', 'ṇ': 'n', 'ṭ': 't', 'ḍ': 'd', 'ṃ': 'm', 'ḥ': 'h',
  'ś': 's', 'ṣ': 's'
};

/**
 * Common Sanskrit term variations and their English equivalents
 */
export const SANSKRIT_VARIANTS: Record<string, string[]> = {
  'dharma': ['dharma', 'dhamma', 'law', 'righteousness'],
  'karma': ['karma', 'kamma', 'action', 'deed'],
  'moksha': ['moksha', 'moksa', 'liberation', 'release'],
  'yoga': ['yoga', 'union', 'practice'],
  'mantra': ['mantra', 'sacred-sound', 'chant'],
  'yuga': ['yuga', 'age', 'epoch', 'era'],
  'sangam': ['sangam', 'confluence', 'assembly'],
  'shastra': ['shastra', 'sastra', 'treatise', 'scripture'],
  'purana': ['purana', 'ancient-story', 'legend'],
  'veda': ['veda', 'knowledge', 'sacred-text'],
  'upanishad': ['upanishad', 'philosophical-text'],
  'itihasa': ['itihasa', 'history', 'epic'],
  'artha': ['artha', 'wealth', 'prosperity', 'economics'],
  'kama': ['kama', 'desire', 'pleasure'],
  'ahimsa': ['ahimsa', 'non-violence', 'compassion'],
  'samsara': ['samsara', 'cycle', 'rebirth', 'world'],
  'nirvana': ['nirvana', 'enlightenment', 'cessation'],
  'brahman': ['brahman', 'ultimate-reality', 'divine'],
  'atman': ['atman', 'self', 'soul'],
  'maharaja': ['maharaja', 'great-king', 'emperor'],
  'deva': ['deva', 'god', 'divine-being'],
  'devi': ['devi', 'goddess', 'divine-feminine'],
  'guru': ['guru', 'teacher', 'guide'],
  'shishya': ['shishya', 'student', 'disciple'],
  'ashrama': ['ashrama', 'life-stage', 'hermitage'],
  'varna': ['varna', 'class', 'category'],
  'jati': ['jati', 'birth-group', 'community'],
  'raga': ['raga', 'melody', 'musical-mode'],
  'tala': ['tala', 'rhythm', 'time-measure'],
  'mudra': ['mudra', 'gesture', 'seal'],
  'yantra': ['yantra', 'diagram', 'machine'],
  'tantra': ['tantra', 'technique', 'system'],
  'sutra': ['sutra', 'thread', 'aphorism'],
  'sloka': ['sloka', 'verse', 'couplet'],
  'ramayana': ['ramayana', 'rama-story'],
  'mahabharata': ['mahabharata', 'great-bharata'],
  'bhagavad-gita': ['bhagavad-gita', 'divine-song'],
  'matsya': ['matsya', 'fish'],
  'kurma': ['kurma', 'tortoise'],
  'varaha': ['varaha', 'boar'],
  'narasimha': ['narasimha', 'man-lion'],
  'vamana': ['vamana', 'dwarf'],
  'parashurama': ['parashurama', 'rama-with-axe'],
  'rama': ['rama', 'pleasing'],
  'krishna': ['krishna', 'dark', 'black'],
  'buddha': ['buddha', 'awakened'],
  'kalki': ['kalki', 'destroyer-of-darkness'],
  'amavasu': ['amavasu', 'new-moon-wealth', 'dark-fortnight-treasure']
};

/**
 * Convert Devanagari to IAST transliteration
 */
export function devanagariToIAST(text: string): string {
  let result = text;
  Object.entries(DEVANAGARI_TO_IAST).forEach(([dev, iast]) => {
    result = result.replace(new RegExp(dev, 'g'), iast);
  });
  return result;
}

/**
 * Convert IAST to simplified Latin
 */
export function iastToSimple(text: string): string {
  let result = text;
  Object.entries(IAST_TO_SIMPLE).forEach(([iast, simple]) => {
    result = result.replace(new RegExp(iast, 'g'), simple);
  });
  return result;
}

/**
 * Generate search variants for a Sanskrit term
 */
export function generateSanskritVariants(term: string): string[] {
  const variants = new Set<string>();
  const lowerTerm = term.toLowerCase();
  
  // Add original term
  variants.add(lowerTerm);
  
  // Check if it's in our variants database
  if (SANSKRIT_VARIANTS[lowerTerm]) {
    SANSKRIT_VARIANTS[lowerTerm].forEach(variant => {
      variants.add(variant.toLowerCase());
    });
  }
  
  // Generate transliteration variants
  const simplified = iastToSimple(lowerTerm);
  if (simplified !== lowerTerm) {
    variants.add(simplified);
  }
  
  // Add common spelling variations
  const withoutDiacritics = lowerTerm
    .replace(/[āáàâäã]/g, 'a')
    .replace(/[īíìîï]/g, 'i')
    .replace(/[ūúùûü]/g, 'u')
    .replace(/[ṛṝ]/g, 'r')
    .replace(/[ḷḹ]/g, 'l')
    .replace(/[ṅñṇ]/g, 'n')
    .replace(/[ṭḍ]/g, 't')
    .replace(/[ṃḥ]/g, '')
    .replace(/[śṣ]/g, 's');
  
  if (withoutDiacritics !== lowerTerm) {
    variants.add(withoutDiacritics);
  }
  
  return Array.from(variants);
}

/**
 * Check if a term matches Sanskrit patterns
 */
export function isSanskritTerm(term: string): boolean {
  // Check for IAST diacritics
  const iastPattern = /[āīūṛṝḷḹēōṅñṇṭḍṃḥśṣ]/;
  if (iastPattern.test(term)) return true;
  
  // Check for Devanagari characters
  const devanagariPattern = /[\u0900-\u097F]/;
  if (devanagariPattern.test(term)) return true;
  
  // Check against known Sanskrit terms
  const lowerTerm = term.toLowerCase();
  return Object.keys(SANSKRIT_VARIANTS).includes(lowerTerm);
}

/**
 * Enhanced Sanskrit-aware search matching
 */
export function matchesSanskritTerm(searchTerm: string, targetText: string): boolean {
  const searchVariants = generateSanskritVariants(searchTerm.toLowerCase());
  const targetLower = targetText.toLowerCase();
  
  return searchVariants.some(variant => 
    targetLower.includes(variant)
  );
}

/**
 * Get cultural context for Sanskrit terms
 */
export function getSanskritContext(term: string, language: SupportedLanguage = 'en'): string | null {
  const lowerTerm = term.toLowerCase();
  
  // Enhanced context for specific terms relevant to the project
  const contexts: Record<string, Partial<Record<SupportedLanguage, string>>> = {
    'amavasu': {
      'en': 'In Vedic tradition, refers to the wealth or treasures associated with the new moon period; often used in the context of lunar cycles and maritime timing.',
      'hi': 'वैदिक परंपरा में अमावस्या काल से जुड़ी संपत्ति या खजाने का संकेत; अक्सर चंद्र चक्र और समुद्री समय के संदर्भ में प्रयुक्त।',
      'ta': 'வேத மரபில், அமாவாசை காலத்துடன் தொடர்புடைய செல்வம் அல்லது புதையல்களைக் குறிக்கும்; பெரும்பாலும் சந்திர சுழற்சிகள் மற்றும் கடல்சார் நேரத்தின் சூழலில் பயன்படுத்தப்படுகிறது।'
    },
    'dharma': {
      'en': 'Fundamental principle of cosmic order, righteousness, and individual duty in Dharmic traditions.',
      'hi': 'धर्मिक परंपराओं में ब्रह्मांडीय व्यवस्था, धार्मिकता और व्यक्तिगत कर्तव्य का मूलभूत सिद्धांत।',
      'ta': 'தர்ம மரபுகளில் அண்ட ஒழுங்கு, நீதி மற்றும் தனிப்பட்ட கடமையின் அடிப்படைக் கொள்கை।'
    }
  };
  
  if (contexts[lowerTerm] && contexts[lowerTerm][language]) {
    return contexts[lowerTerm][language];
  }
  
  return null;
}