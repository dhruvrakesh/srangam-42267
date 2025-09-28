import { CulturalTerm } from '@/types/multilingual';

// Comprehensive database of dharmic and bharatiya terms with cultural context
import { enhancedCulturalTerms } from './enhanced-cultural-terms';

export const culturalTermsDatabase: Record<string, CulturalTerm> = {
  ...enhancedCulturalTerms,
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
      },
      hi: {
        translation: 'धर्म',
        transliteration: 'dharma',
        etymology: 'संस्कृत धृ (धारणा करना, पालन करना) से',
        culturalContext: 'न्याय, कर्तव्य, प्राकृतिक नियम और ब्रह्मांडीय व्यवस्था का मूलभूत सिद्धांत'
      },
      pa: {
        translation: 'ਧਰਮ',
        transliteration: 'dharam',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਧ੃ (ਧਾਰਨ ਕਰਨਾ, ਪਾਲਣ ਕਰਨਾ) ਤੋਂ',
        culturalContext: 'ਨਿਆਂ, ਫਰਜ਼, ਕੁਦਰਤੀ ਨਿਯਮ ਅਤੇ ਬ੍ਰਹਿਮੰਡੀ ਵਿਵਸਥਾ ਦਾ ਬੁਨਿਆਦੀ ਸਿਧਾਂਤ'
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
      },
      hi: {
        translation: 'युग',
        transliteration: 'yuga',
        etymology: 'संस्कृत युग (जुड़ना, काल) से',
        culturalContext: 'हिंदू ब्रह्मांड विज्ञान में समय के विशाल चक्र'
      },
      pa: {
        translation: 'ਯੁਗ',
        transliteration: 'yug',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਯੁਗ (ਜੋੜਨਾ, ਸਮਾਂ) ਤੋਂ',
        culturalContext: 'ਹਿੰਦੂ ਬ੍ਰਹਿਮੰਡ ਵਿਗਿਆਨ ਵਿੱਚ ਸਮੇਂ ਦੇ ਵਿਸ਼ਾਲ ਚੱਕਰ'
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
  },
  'adichanallur': {
    term: 'adichanallur',
    translations: {
      en: {
        translation: 'Adichanallur',
        transliteration: 'ādicāṉallūr',
        etymology: 'Tamil ādi (ancient) + cāṉal (urn) + ūr (village)',
        culturalContext: 'Ancient archaeological site in Tamil Nadu known for urn burials dating to 1000-600 BCE, evidence of early Tamil civilization'
      },
      ta: {
        translation: 'ஆதிச்சநல்லூர்',
        transliteration: 'ādicāṉallūr',
        etymology: 'ஆதி (பண்டைய) + சாணல் (கலயம்) + ஊர் (ஊர்)',
        culturalContext: 'கி.மு. 1000-600 காலகட்டத்திய கலய அடக்கத்திற்கு புகழ்பெற்ற தமிழ்நாட்டின் பண்டைய தொல்லியல் தளம், ஆரம்பகால தமிழ் நாகரிகத்தின் சான்று'
      }
    }
  },
  'keezhadi': {
    term: 'keezhadi',
    translations: {
      en: {
        translation: 'Keezhadi',
        transliteration: 'kīḻaṭi',
        etymology: 'Tamil kīḻ (below/ancient) + aṭi (settlement)',
        culturalContext: 'Revolutionary archaeological site on Vaigai river showing urban civilization from 6th century BCE, rewriting Tamil history timeline'
      },
      ta: {
        translation: 'கீழடி',
        transliteration: 'kīḻaṭi',
        etymology: 'கீழ் (கீழ்/பண்டைய) + அடி (குடியிருப்பு)',
        culturalContext: 'கி.மு. 6ஆம் நூற்றாண்டிலிருந்து நகர நாகரிகத்தைக் காட்டும் வைகை நதிக்கரையின் புரட்சிகர தொல்லியல் தளம், தமிழ் வரலாற்று காலவரிசையை மீண்டும் எழுதுகிறது'
      }
    }
  },
  'vaigai': {
    term: 'vaigai',
    translations: {
      en: {
        translation: 'Vaigai',
        transliteration: 'vaigai',
        etymology: 'Tamil vai (sharp/swift) + gai (flow)',
        culturalContext: 'Sacred river in Tamil Nadu, cradle of ancient Tamil civilization, site of Keezhadi and other archaeological discoveries'
      },
      ta: {
        translation: 'வைகை',
        transliteration: 'vaigai',
        etymology: 'வை (கூர்மையான/வேகமான) + கை (ஓட்டம்)',
        culturalContext: 'தமிழ்நாட்டின் புனித நதி, பண்டைய தமிழ் நாகரிகத்தின் தொட்டில், கீழடி மற்றும் பிற தொல்லியல் கண்டுபிடிப்புகளின் இடம்'
      }
    }
  },
  'jambudvipa': {
    term: 'jambudvipa',
    translations: {
      en: {
        translation: 'Jambudvipa',
        transliteration: 'jambudvīpa',
        etymology: 'Sanskrit jambu (rose apple tree) + dvīpa (island/continent)',
        culturalContext: 'Ancient Sanskrit name for the Indian subcontinent, representing the known inhabited world in Hindu and Buddhist cosmology'
      },
      ta: {
        translation: 'ஜம்புத்வீபம்',
        transliteration: 'jambudvīpam',
        etymology: 'சமஸ்கிருத jambu (நாவல் மரம்) + dvīpa (தீவு/கண்டம்)',
        culturalContext: 'இந்திய துணைக்கண்டத்திற்கான பண்டைய சமஸ்கிருத பெயர், இந்து மற்றும் பௌத்த அண்டவியலில் அறியப்பட்ட வாழக்கூடிய உலகத்தைக் குறிக்கும்'
      },
      hi: {
        translation: 'जम्बुद्वीप',
        transliteration: 'jambudvīp',
        etymology: 'संस्कृत जम्बु (जामुन वृक्ष) + द्वीप (द्वीप/महाद्वीप)',
        culturalContext: 'भारतीय उपमहाद्वीप का प्राचीन संस्कृत नाम, हिंदू और बौद्ध ब्रह्मांड विज्ञान में ज्ञात निवास योग्य संसार का प्रतिनिधित्व'
      }
    }
  },
  'mahabharata': {
    term: 'mahabharata',
    translations: {
      en: {
        translation: 'Mahabharata',
        transliteration: 'mahābhārata',
        etymology: 'Sanskrit mahā (great) + bhārata (descendants of Bharata)',
        culturalContext: 'Epic narrative of ancient India, containing the Bhagavad Gita and foundational stories of dharmic civilization'
      },
      ta: {
        translation: 'மகாபாரதம்',
        transliteration: 'mahābhāratam',
        etymology: 'சமஸ்கிருத mahā (பெரிய) + bhārata (பரதன் வம்சம்)',
        culturalContext: 'பண்டைய இந்தியாவின் காவிய கதை, பகவத் கீதை மற்றும் தர்ம நாகரிகத்தின் அடிப்படைக் கதைகளைக் கொண்டது'
      }
    }
  },
  'puranic': {
    term: 'puranic',
    translations: {
      en: {
        translation: 'Puranic',
        transliteration: 'paurāṇika',
        etymology: 'From Sanskrit purāṇa (ancient stories)',
        culturalContext: 'Relating to the Puranas, ancient Sanskrit texts containing mythology, traditions, and genealogies'
      },
      ta: {
        translation: 'புராணிக',
        transliteration: 'paurāṇika',
        etymology: 'சமஸ்கிருத purāṇa (பண்டைய கதைகள்)',
        culturalContext: 'புராணங்களுடன் தொடர்புடையது, புராணக்கதைகள், மரபுகள் மற்றும் வம்சாவளிகளைக் கொண்ட பண்டைய சமஸ்கிருத நூல்கள்'
      }
    }
  },
  'uttarapatha': {
    term: 'uttarapatha',
    translations: {
      en: {
        translation: 'Uttarapatha',
        transliteration: 'uttarāpatha',
        etymology: 'Sanskrit uttara (north) + patha (path/route)',
        culturalContext: 'Ancient northern trade route connecting northwestern India to eastern regions, major commercial artery'
      },
      ta: {
        translation: 'உத்தராபதம்',
        transliteration: 'uttarāpatham',
        etymology: 'சமஸ்கிருத uttara (வடக்கு) + patha (பாதை/வழி)',
        culturalContext: 'வடமேற்கு இந்தியாவை கிழக்குப் பகுதிகளுடன் இணைக்கும் பண்டைய வடக்கு வணிகப் பாதை, முக்கிய வணிக நாடி'
      }
    }
  },
  'dakshinapatha': {
    term: 'dakshinapatha',
    translations: {
      en: {
        translation: 'Dakshinapatha',
        transliteration: 'dakṣiṇāpatha',
        etymology: 'Sanskrit dakṣiṇa (south) + patha (path/route)',
        culturalContext: 'Ancient southern trade route through peninsular India, connecting northern plains to Tamil kingdoms'
      },
      ta: {
        translation: 'தக்ஷிணாபதம்',
        transliteration: 'dakṣiṇāpatham',
        etymology: 'சமஸ்கிருத dakṣiṇa (தெற்கு) + patha (பாதை/வழி)',
        culturalContext: 'தீபகற்ப இந்தியா வழியாக செல்லும் பண்டைய தென் வணிகப் பாதை, வடக்கு சமவெளிகளை தமிழ் அரசுகளுடன் இணைக்கும்'
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