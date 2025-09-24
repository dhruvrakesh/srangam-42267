import { CulturalTerm } from '@/types/multilingual';

// Comprehensive database of dharmic and bharatiya terms with cultural context
export const culturalTermsDatabase: Record<string, CulturalTerm> = {
  'dharma': {
    term: 'dharma',
    translations: {
      en: {
        translation: 'dharma',
        transliteration: 'dharma',
        etymology: 'From Sanskrit dhṛ (to hold, maintain)',
        culturalContext: 'Fundamental concept of righteous duty, natural law, and cosmic order'
      },
      ta: {
        translation: 'தர்மம்',
        transliteration: 'dharmam',
        etymology: 'சமஸ்கிருத dhṛ (நிலைநிறுத்த, பேணுதல்)',
        culturalContext: 'நீதிக்கடமை, இயற்கை விதி, பிரபஞ்ச ஒழுங்கு என்ற அடிப்படைக் கொள்கை'
      }
    }
  },
  'yuga': {
    term: 'yuga',
    translations: {
      en: {
        translation: 'yuga (cosmic age)',
        transliteration: 'yuga',
        etymology: 'From Sanskrit yuga (joining, age)',
        culturalContext: 'Vast cycles of time in Hindu cosmology'
      },
      ta: {
        translation: 'யுகம்',
        transliteration: 'yugam',
        etymology: 'சமஸ்கிருத yuga (இணைப்பு, காலம்)',
        culturalContext: 'இந்து அண்ட சிந்தனையில் காலத்தின் மாபெரும் சுழற்சிகள்'
      }
    }
  },
  'sangam': {
    term: 'sangam',
    translations: {
      en: {
        translation: 'sangam (confluence)',
        transliteration: 'saṅgam',
        etymology: 'From Sanskrit saṅgama (meeting, confluence)',
        culturalContext: 'Sacred confluence of rivers; literary assemblies in Tamil tradition'
      },
      ta: {
        translation: 'சங்கம்',
        transliteration: 'saṅgam',
        etymology: 'சமஸ்கிருத saṅgama (சந்திப்பு, சங்கமம்)',
        culturalContext: 'ஆறுகளின் புனித சங்கமம்; தமிழ் மரபில் இலக்கிய அவைகள்'
      }
    }
  },
  'yajna': {
    term: 'yajna',
    translations: {
      en: {
        translation: 'yajna (sacred fire ritual)',
        transliteration: 'yajña',
        etymology: 'From Sanskrit yaj (to worship, sacrifice)',
        culturalContext: 'Vedic fire sacrifice; cosmic principle of giving and receiving'
      },
      ta: {
        translation: 'யக்ஞம்',
        transliteration: 'yajñam',
        etymology: 'சமஸ्கிருत yaj (வழிபாடு, தியாகம்)',
        culturalContext: 'வேத அக்னி யாகம்; கொடுப்பதும் பெறுவதும் என்ற பிரபஞ்ச கொள்கை'
      }
    }
  },
  'maharaja': {
    term: 'maharaja',
    translations: {
      en: {
        translation: 'maharaja (great king)',
        transliteration: 'mahārāja',
        etymology: 'From Sanskrit mahā (great) + rāja (king)',
        culturalContext: 'Title for paramount rulers in ancient Indian kingdoms'
      },
      ta: {
        translation: 'மகாராஜா',
        transliteration: 'mahārājā',
        etymology: 'சமஸ்கிருத mahā (பெரிய) + rāja (அரசன்)',
        culturalContext: 'பண்டைய இந்திய அரசுகளில் உச்ச அரசர்களின் பட்டம்'
      }
    }
  },
  'chola': {
    term: 'chola',
    translations: {
      en: {
        translation: 'Chola',
        transliteration: 'cōḻa',
        etymology: 'From Tamil cōḻa, possibly meaning "warrior"',
        culturalContext: 'Ancient Tamil dynasty known for maritime empire and temple architecture'
      },
      ta: {
        translation: 'சோழ',
        transliteration: 'cōḻa',
        etymology: 'தமிழ் cōḻa, வீரன் என்று பொருள்',
        culturalContext: 'கடல்சார் பேரரசு மற்றும் கோவில் கட்டிடக்கலைக்கு புகழ்பெற்ற பண்டைய தமிழ் வம்சம்'
      }
    }
  },
  'pandya': {
    term: 'pandya',
    translations: {
      en: {
        translation: 'Pandya',
        transliteration: 'pāṇḍya',
        etymology: 'From Tamil pāṇḍya, associated with pearls',
        culturalContext: 'Ancient Tamil dynasty known for pearl diving and trade in the south'
      },
      ta: {
        translation: 'பாண்டிய',
        transliteration: 'pāṇḍya',
        etymology: 'தமிழ் pāṇḍya, முத்துக்களுடன் தொடர்புடையது',
        culturalContext: 'முத்து எடுப்பதற்கும் தென்பகுதி வணிகத்திற்கும் புகழ்பெற்ற பண்டைய தமிழ் வம்சம்'
      }
    }
  },
  'chera': {
    term: 'chera',
    translations: {
      en: {
        translation: 'Chera',
        transliteration: 'cēra',
        etymology: 'From Tamil cēra, meaning "serene" or "mountain dweller"',
        culturalContext: 'Ancient Tamil dynasty controlling the western coast and spice trade'
      },
      ta: {
        translation: 'சேர',
        transliteration: 'cēra',
        etymology: 'தமிழ் cēra, அமைதியான அல்லது மலைவாசி என்று பொருள்',
        culturalContext: 'மேற்கு கடற்கரை மற்றும் மசாலா வணிகத்தைக் கட்டுப்படுத்திய பண்டைய தமிழ் வம்சம்'
      }
    }
  }
};

// Helper function to get cultural context for a term
export const getCulturalContext = (term: string, language: string = 'en') => {
  const termData = culturalTermsDatabase[term.toLowerCase()];
  if (!termData) return null;
  
  const translation = termData.translations[language as keyof typeof termData.translations];
  return translation || termData.translations.en;
};

// Helper function to enhance text with cultural terms
export const enhanceTextWithCulturalTerms = (text: string, language: string = 'en') => {
  let enhancedText = text;
  const terms = Object.keys(culturalTermsDatabase);
  
  terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const context = getCulturalContext(term, language);
    
    if (context && regex.test(enhancedText)) {
      // This would be used by components to add cultural context tooltips
      enhancedText = enhancedText.replace(regex, `{{cultural:${term}}}`);
    }
  });
  
  return enhancedText;
};