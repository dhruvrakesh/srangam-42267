import { CulturalTerm } from '@/types/multilingual';

// Expanded cultural terms database honoring Bibek Debroy's Sanskrit translation methodology
// Adding comprehensive dharmic terms with Hindi and Punjabi translations
export const enhancedCulturalTerms: Record<string, CulturalTerm> = {
  'purana': {
    term: 'purana',
    translations: {
      en: {
        translation: 'purana (ancient chronicles)',
        transliteration: 'purāṇa',
        etymology: 'From Sanskrit purāṇa (ancient, old)',
        culturalContext: 'Ancient Sanskrit texts containing cosmic history, genealogies, and spiritual wisdom'
      },
      hi: {
        translation: 'पुराण',
        transliteration: 'purāṇa',
        etymology: 'संस्कृत पुराण (प्राचीन, पुराना) से',
        culturalContext: 'प्राचीन संस्कृत ग्रंथ जिनमें ब्रह्मांडीय इतिहास, वंशावली और आध्यात्मिक ज्ञान है'
      },
      pa: {
        translation: 'ਪੁਰਾਣ',
        transliteration: 'purāṇ',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਪੁਰਾਣ (ਪ੍ਰਾਚੀਨ, ਪੁਰਾਣਾ) ਤੋਂ',
        culturalContext: 'ਪ੍ਰਾਚੀਨ ਸੰਸਕ੍ਰਿਤ ਗ੍ਰੰਥ ਜਿਨ੍ਹਾਂ ਵਿੱਚ ਬ੍ਰਹਿਮੰਡੀ ਇਤਿਹਾਸ, ਵੰਸ਼ਾਵਲੀ ਅਤੇ ਅਧਿਆਤਮਿਕ ਗਿਆਨ ਹੈ'
      }
    }
  },
  'itihasa': {
    term: 'itihasa',
    translations: {
      en: {
        translation: 'itihasa (sacred history)',
        transliteration: 'itihāsa',
        etymology: 'From Sanskrit iti-ha-āsa (thus-indeed-it was)',
        culturalContext: 'Sacred historical narratives like Ramayana and Mahabharata'
      },
      hi: {
        translation: 'इतिहास',
        transliteration: 'itihāsa',
        etymology: 'संस्कृत इति-ह-आस (इस प्रकार-वास्तव में-यह था) से',
        culturalContext: 'रामायण और महाभारत जैसे पवित्र ऐतिहासिक आख्यान'
      },
      pa: {
        translation: 'ਇਤਿਹਾਸ',
        transliteration: 'itihās',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਇਤਿ-ਹ-ਆਸ (ਇਸ ਤਰ੍ਹਾਂ-ਸੱਚਮੁੱਚ-ਇਹ ਸੀ) ਤੋਂ',
        culturalContext: 'ਰਾਮਾਇਣ ਅਤੇ ਮਹਾਭਾਰਤ ਵਰਗੇ ਪਵਿੱਤਰ ਇਤਿਹਾਸਕ ਬਿਰਤਾਂਤ'
      }
    }
  },
  'veda': {
    term: 'veda',
    translations: {
      en: {
        translation: 'veda (sacred knowledge)',
        transliteration: 'veda',
        etymology: 'From Sanskrit vid (to know)',
        culturalContext: 'The four foundational texts of Hindu spiritual knowledge'
      },
      hi: {
        translation: 'वेद',
        transliteration: 'veda',
        etymology: 'संस्कृत विद् (जानना) से',
        culturalContext: 'हिंदू आध्यात्मिक ज्ञान के चार मूलभूत ग्रंथ'
      },
      pa: {
        translation: 'ਵੇਦ',
        transliteration: 'ved',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਵਿਦ੍ (ਜਾਨਣਾ) ਤੋਂ',
        culturalContext: 'ਹਿੰਦੂ ਅਧਿਆਤਮਿਕ ਗਿਆਨ ਦੇ ਚਾਰ ਮੂਲ ਗ੍ਰੰਥ'
      }
    }
  },
  'upanishad': {
    term: 'upanishad',
    translations: {
      en: {
        translation: 'upanishad (mystical teachings)',
        transliteration: 'upaniṣad',
        etymology: 'From Sanskrit upa-ni-ṣad (sitting near, secret teaching)',
        culturalContext: 'Philosophical texts exploring the nature of ultimate reality'
      },
      hi: {
        translation: 'उपनिषद्',
        transliteration: 'upaniṣad',
        etymology: 'संस्कृत उप-नि-षद् (पास बैठना, गुप्त शिक्षा) से',
        culturalContext: 'परम सत्य की प्रकृति का अन्वेषण करने वाले दार्शनिक ग्रंथ'
      },
      pa: {
        translation: 'ਉਪਨਿਸ਼ਦ',
        transliteration: 'upaniṣad',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਉਪ-ਨਿ-ਸ਼ਦ੍ (ਨੇੜੇ ਬੈਠਣਾ, ਗੁਪਤ ਸਿੱਖਿਆ) ਤੋਂ',
        culturalContext: 'ਪਰਮ ਸੱਚਾਈ ਦੀ ਪ੍ਰਕਿਰਤੀ ਦੀ ਖੋਜ ਕਰਨ ਵਾਲੇ ਦਾਰਸ਼ਨਿਕ ਗ੍ਰੰਥ'
      }
    }
  },
  'shastra': {
    term: 'shastra',
    translations: {
      en: {
        translation: 'shastra (sacred treatise)',
        transliteration: 'śāstra',
        etymology: 'From Sanskrit śās (to teach, instruct)',
        culturalContext: 'Authoritative texts on various subjects including dharma, science, and arts'
      },
      hi: {
        translation: 'शास्त्र',
        transliteration: 'śāstra',
        etymology: 'संस्कृत शास् (सिखाना, निर्देश देना) से',
        culturalContext: 'धर्म, विज्ञान और कलाओं सहित विभिन्न विषयों पर आधिकारिक ग्रंथ'
      },
      pa: {
        translation: 'ਸ਼ਾਸਤਰ',
        transliteration: 'śāstar',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਸ਼ਾਸ੍ (ਸਿਖਾਉਣਾ, ਨਿਰਦੇਸ਼ ਦੇਣਾ) ਤੋਂ',
        culturalContext: 'ਧਰਮ, ਵਿਗਿਆਨ ਅਤੇ ਕਲਾਵਾਂ ਸਮੇਤ ਵੱਖ-ਵੱਖ ਵਿਸ਼ਿਆਂ ਉੱਤੇ ਅਧਿਕਾਰਿਕ ਗ੍ਰੰਥ'
      }
    }
  },
  'yupa': {
    term: 'yupa',
    translations: {
      en: {
        translation: 'yupa (sacrificial post)',
        transliteration: 'yūpa',
        etymology: 'From Sanskrit yūpa (wooden post for ritual)',
        culturalContext: 'Sacred pillar used in Vedic fire sacrifices, found in ancient inscriptions'
      },
      hi: {
        translation: 'यूप',
        transliteration: 'yūpa',
        etymology: 'संस्कृत यूप (यज्ञ के लिए लकड़ी का खंभा) से',
        culturalContext: 'वैदिक अग्नि यज्ञों में प्रयुक्त पवित्र स्तंभ, प्राचीन शिलालेखों में मिलता है'
      },
      pa: {
        translation: 'ਯੂਪ',
        transliteration: 'yūp',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਯੂਪ (ਯੱਗ ਲਈ ਲੱਕੜ ਦਾ ਖੰਭਾ) ਤੋਂ',
        culturalContext: 'ਵੈਦਿਕ ਅੱਗ ਯੱਗਾਂ ਵਿੱਚ ਵਰਤਿਆ ਜਾਂਦਾ ਪਵਿੱਤਰ ਖੰਭਾ, ਪ੍ਰਾਚੀਨ ਸ਼ਿਲਾਲੇਖਾਂ ਵਿੱਚ ਮਿਲਦਾ ਹੈ'
      }
    }
  }
};