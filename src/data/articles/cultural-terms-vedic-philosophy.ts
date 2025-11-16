import { CulturalTerm } from '@/types/multilingual';

// Vedic, philosophical, and genealogical terms
export const vedicPhilosophyCulturalTerms: Record<string, CulturalTerm> = {
  'atman': {
    term: 'atman',
    translations: {
      en: {
        translation: 'atman (individual soul)',
        transliteration: 'ātman',
        etymology: 'From Sanskrit ātman (self, soul, essence, breath)',
        culturalContext: 'The individual eternal soul or self in Hindu philosophy, identical with Brahman according to Advaita Vedanta, fundamental concept in Upanishadic thought'
      },
      hi: {
        translation: 'आत्मन् (व्यक्तिगत आत्मा)',
        transliteration: 'ātman',
        etymology: 'संस्कृत आत्मन् (स्व, आत्मा, सार, श्वास) से',
        culturalContext: 'हिंदू दर्शन में व्यक्तिगत शाश्वत आत्मा या स्व, अद्वैत वेदांत के अनुसार ब्रह्म के साथ समान, उपनिषदीय विचार में मौलिक अवधारणा'
      },
      pa: {
        translation: 'ਆਤਮਨ (ਵਿਅਕਤੀਗਤ ਆਤਮਾ)',
        transliteration: 'ātman',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਆਤਮਨ੍ (ਸਵੈ, ਆਤਮਾ, ਸਾਰ, ਸਾਹ) ਤੋਂ',
        culturalContext: 'ਹਿੰਦੂ ਦਰਸ਼ਨ ਵਿੱਚ ਵਿਅਕਤੀਗਤ ਸ਼ਾਸ਼ਵਤ ਆਤਮਾ ਜਾਂ ਸਵੈ, ਅਦਵੈਤ ਵੇਦਾਂਤ ਦੇ ਅਨੁਸਾਰ ਬ੍ਰਹਮ ਦੇ ਨਾਲ ਸਮਾਨ, ਉਪਨਿਸ਼ਦ ਵਿਚਾਰ ਵਿੱਚ ਮੂਲ ਧਾਰਨਾ'
      },
      ta: {
        translation: 'ஆத்மன் (தனி ஆன்மா)',
        transliteration: 'ātman',
        etymology: 'சமஸ்கிருதம் ஆத்மன் (சுயம், ஆன்மா, சாரம், மூச்சு) என்பதிலிருந்து',
        culturalContext: 'இந்து தத்துவத்தில் தனிப்பட்ட நித்திய ஆன்மா அல்லது சுயம், அத்வைத வேதாந்தத்தின்படி பிரம்மனுடன் ஒன்றானது, உபநிடத சிந்தனையில் அடிப்படைக் கருத்து'
      }
    }
  },
  'brahman': {
    term: 'brahman',
    translations: {
      en: {
        translation: 'Brahman (ultimate reality)',
        transliteration: 'Brahman',
        etymology: 'From Sanskrit brahman (ultimate reality, cosmic spirit, growth, expansion)',
        culturalContext: 'The absolute, unchanging, infinite, transcendent reality that is the divine ground of all being in Hinduism, central to Upanishadic philosophy'
      },
      hi: {
        translation: 'ब्रह्मन् (परम सत्य)',
        transliteration: 'Brahman',
        etymology: 'संस्कृत ब्रह्मन् (परम सत्य, ब्रह्मांडीय आत्मा, वृद्धि, विस्तार) से',
        culturalContext: 'हिंदू धर्म में सभी अस्तित्व का दिव्य आधार, परम, अपरिवर्तनीय, अनंत, परम वास्तविकता, उपनिषदीय दर्शन के लिए केंद्रीय'
      },
      pa: {
        translation: 'ਬ੍ਰਹਮਨ (ਪਰਮ ਸੱਚਾਈ)',
        transliteration: 'Brahman',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਬ੍ਰਹਮਨ੍ (ਪਰਮ ਸੱਚਾਈ, ਬ੍ਰਹਿਮੰਡੀ ਆਤਮਾ, ਵਾਧਾ, ਵਿਸਥਾਰ) ਤੋਂ',
        culturalContext: 'ਹਿੰਦੂ ਧਰਮ ਵਿੱਚ ਸਾਰੇ ਹੋਂਦ ਦਾ ਦੈਵੀ ਆਧਾਰ, ਪਰਮ, ਅਪਰਿਵਰਤਨਸ਼ੀਲ, ਅਨੰਤ, ਅਲੌਕਿਕ ਹਕੀਕਤ, ਉਪਨਿਸ਼ਦ ਦਰਸ਼ਨ ਲਈ ਕੇਂਦਰੀ'
      },
      ta: {
        translation: 'பிரம்மம் (முழுமையான உண்மை)',
        transliteration: 'Brahman',
        etymology: 'சமஸ்கிருதம் ப்ரஹ்மன் (முழுமையான உண்மை, பிரபஞ்ச ஆவி, வளர்ச்சி, விரிவாக்கம்) என்பதிலிருந்து',
        culturalContext: 'இந்து மதத்தில் அனைத்து இருப்பின் தெய்வீக அடித்தளமான முழுமையான, மாறாத, எல்லையற்ற, அதீத உண்மை, உபநிஷத் தத்துவத்திற்கு மையமானது'
      }
    }
  },
  'gotra': {
    term: 'gotra',
    translations: {
      en: {
        translation: 'gotra (lineage, clan)',
        transliteration: 'gotra',
        etymology: 'From Sanskrit gotra (cowshed, clan descended from a common ancestor)',
        culturalContext: 'Patrilineal clan system in Vedic tradition tracing descent from ancient sages (rishis), crucial for determining kinship and marriage rules'
      },
      hi: {
        translation: 'गोत्र (वंश, कुल)',
        transliteration: 'gotra',
        etymology: 'संस्कृत गोत्र (गोशाला, एक सामान्य पूर्वज से उत्पन्न कुल) से',
        culturalContext: 'वैदिक परंपरा में पितृवंशीय कुल प्रणाली जो प्राचीन ऋषियों से वंश का पता लगाती है, रिश्तेदारी और विवाह नियमों को निर्धारित करने के लिए महत्वपूर्ण'
      },
      pa: {
        translation: 'ਗੋਤਰ (ਵੰਸ਼, ਗੋਤ)',
        transliteration: 'gotar',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਗੋਤਰ (ਗੋਸ਼ਾਲਾ, ਇੱਕ ਸਾਂਝੇ ਪੂਰਵਜ ਤੋਂ ਉਤਪੰਨ ਗੋਤ) ਤੋਂ',
        culturalContext: 'ਵੈਦਿਕ ਪਰੰਪਰਾ ਵਿੱਚ ਪਿਤਰੀ ਗੋਤ ਪ੍ਰਣਾਲੀ ਜੋ ਪ੍ਰਾਚੀਨ ਰਿਸ਼ੀਆਂ ਤੋਂ ਵੰਸ਼ ਦਾ ਪਤਾ ਲਗਾਉਂਦੀ ਹੈ, ਰਿਸ਼ਤੇਦਾਰੀ ਅਤੇ ਵਿਆਹ ਦੇ ਨਿਯਮਾਂ ਨੂੰ ਨਿਰਧਾਰਤ ਕਰਨ ਲਈ ਮਹੱਤਵਪੂਰਨ'
      },
      ta: {
        translation: 'கோத்திரம் (பரம்பரை, குலம்)',
        transliteration: 'gōttiram',
        etymology: 'சமஸ்கிருதம் கோத்ர (கொட்டகை, பொதுவான மூதாதையரிடமிருந்து வந்த குலம்) என்பதிலிருந்து',
        culturalContext: 'வேத பாரம்பரியத்தில் பழங்கால முனிவர்களிடமிருந்து (ரிஷிகள்) வம்சாவளியைக் கண்டறியும் தந்தைவழி குல முறை, உறவினர் மற்றும் திருமண விதிகளை தீர்மானிக்க முக்கியமானது'
      }
    }
  },
  'pravara': {
    term: 'pravara',
    translations: {
      en: {
        translation: 'pravara (lineage invocation)',
        transliteration: 'pravara',
        etymology: 'From Sanskrit pravara (choice, excellence, ancestral invocation)',
        culturalContext: 'Vedic practice of invoking three or five ancestral sages during rituals to establish one\'s gotra lineage and ritual authority'
      },
      hi: {
        translation: 'प्रवर (वंश आह्वान)',
        transliteration: 'pravara',
        etymology: 'संस्कृत प्रवर (चयन, उत्कृष्टता, पैतृक आह्वान) से',
        culturalContext: 'अनुष्ठानों के दौरान तीन या पांच पूर्वज ऋषियों का आह्वान करने की वैदिक प्रथा ताकि किसी का गोत्र वंश और अनुष्ठानिक अधिकार स्थापित किया जा सके'
      },
      pa: {
        translation: 'ਪ੍ਰਵਰ (ਵੰਸ਼ ਅਰਦਾਸ)',
        transliteration: 'pravar',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਪ੍ਰਵਰ (ਚੋਣ, ਉੱਤਮਤਾ, ਪੁਰਖੀ ਅਰਦਾਸ) ਤੋਂ',
        culturalContext: 'ਰਸਮਾਂ ਦੌਰਾਨ ਤਿੰਨ ਜਾਂ ਪੰਜ ਪੁਰਖੀ ਰਿਸ਼ੀਆਂ ਦੀ ਅਰਦਾਸ ਕਰਨ ਦੀ ਵੈਦਿਕ ਪ੍ਰਥਾ ਤਾਂ ਜੋ ਕਿਸੇ ਦਾ ਗੋਤਰ ਵੰਸ਼ ਅਤੇ ਰਸਮੀ ਅਧਿਕਾਰ ਸਥਾਪਿਤ ਕੀਤਾ ਜਾ ਸਕੇ'
      },
      ta: {
        translation: 'பிரவரம் (பரம்பரை அழைப்பு)',
        transliteration: 'pravaram',
        etymology: 'சமஸ்கிருதம் ப்ரவர (தேர்வு, சிறப்பு, மூதாதையர் அழைப்பு) என்பதிலிருந்து',
        culturalContext: 'ஒருவரின் கோத்திர பரம்பரை மற்றும் சடங்கு அதிகாரத்தை நிறுவ சடங்குகளின் போது மூன்று அல்லது ஐந்து மூதாதையர் முனிவர்களை அழைக்கும் வேத நடைமுறை'
      }
    }
  },
  'anukramani': {
    term: 'anukramani',
    translations: {
      en: {
        translation: 'anukramani (Vedic index)',
        transliteration: 'anukramaṇī',
        etymology: 'From Sanskrit anukramaṇa (succession, systematic enumeration)',
        culturalContext: 'Ancient Vedic indices listing hymns, their authors (rishis), meters, and deities, preserving the cataloguing tradition of Vedic literature'
      },
      hi: {
        translation: 'अनुक्रमणी (वैदिक सूचकांक)',
        transliteration: 'anukramaṇī',
        etymology: 'संस्कृत अनुक्रमण (उत्तराधिकार, व्यवस्थित गणना) से',
        culturalContext: 'प्राचीन वैदिक सूचकांक जो भजनों, उनके लेखकों (ऋषियों), छंदों और देवताओं को सूचीबद्ध करते हैं, वैदिक साहित्य की सूचीकरण परंपरा को संरक्षित करते हैं'
      },
      pa: {
        translation: 'ਅਨੁਕ੍ਰਮਣੀ (ਵੈਦਿਕ ਸੂਚੀ)',
        transliteration: 'anukramaṇī',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਅਨੁਕ੍ਰਮਣ (ਉੱਤਰਾਧਿਕਾਰ, ਵਿਵਸਥਿਤ ਗਣਨਾ) ਤੋਂ',
        culturalContext: 'ਪ੍ਰਾਚੀਨ ਵੈਦਿਕ ਸੂਚੀਆਂ ਜੋ ਭਜਨਾਂ, ਉਨ੍ਹਾਂ ਦੇ ਲੇਖਕਾਂ (ਰਿਸ਼ੀਆਂ), ਛੰਦਾਂ ਅਤੇ ਦੇਵਤਿਆਂ ਨੂੰ ਸੂਚੀਬੱਧ ਕਰਦੀਆਂ ਹਨ, ਵੈਦਿਕ ਸਾਹਿਤ ਦੀ ਸੂਚੀਕਰਣ ਪਰੰਪਰਾ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰਦੀਆਂ ਹਨ'
      },
      ta: {
        translation: 'அனுக்ரமணீ (வேத குறியீடு)',
        transliteration: 'anukramaṇī',
        etymology: 'சமஸ்கிருதம் அனுக்ரமண (வரிசை, முறையான கணக்கெடுப்பு) என்பதிலிருந்து',
        culturalContext: 'பாடல்கள், அவற்றின் ஆசிரியர்கள் (ரிஷிகள்), யாப்புகள் மற்றும் தெய்வங்களை பட்டியலிடும் பண்டைய வேத குறியீடுகள், வேத இலக்கியத்தின் பட்டியல் பாரம்பரியத்தை பாதுகாக்கின்றன'
      }
    }
  },
  'bhrigu': {
    term: 'bhrigu',
    translations: {
      en: {
        translation: 'Bhrigu (legendary sage)',
        transliteration: 'Bhṛgu',
        etymology: 'From Sanskrit bhṛgu (name of a legendary sage)',
        culturalContext: 'One of the seven great sages (Saptarishi) in Vedic tradition, founder of the Bhrigu lineage, associated with fire rituals and astrological knowledge'
      },
      hi: {
        translation: 'भृगु (पौराणिक ऋषि)',
        transliteration: 'Bhṛgu',
        etymology: 'संस्कृत भृगु (एक पौराणिक ऋषि का नाम) से',
        culturalContext: 'वैदिक परंपरा में सात महान ऋषियों (सप्तर्षि) में से एक, भृगु वंश के संस्थापक, अग्नि अनुष्ठानों और ज्योतिषीय ज्ञान से जुड़े'
      },
      pa: {
        translation: 'ਭ੍ਰਿਗੂ (ਪੁਰਾਣਕ ਰਿਸ਼ੀ)',
        transliteration: 'Bhṛgu',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਭ੍ਰਿਗੁ (ਇੱਕ ਪੁਰਾਣਕ ਰਿਸ਼ੀ ਦਾ ਨਾਮ) ਤੋਂ',
        culturalContext: 'ਵੈਦਿਕ ਪਰੰਪਰਾ ਵਿੱਚ ਸੱਤ ਮਹਾਨ ਰਿਸ਼ੀਆਂ (ਸਪਤਰਿਸ਼ੀ) ਵਿੱਚੋਂ ਇੱਕ, ਭ੍ਰਿਗੁ ਵੰਸ਼ ਦੇ ਸੰਸਥਾਪਕ, ਅੱਗ ਦੀਆਂ ਰਸਮਾਂ ਅਤੇ ਜੋਤਿਸ਼ੀ ਗਿਆਨ ਨਾਲ ਜੁੜੇ'
      },
      ta: {
        translation: 'பிருகு (புராண முனிவர்)',
        transliteration: 'Bhṛgu',
        etymology: 'சமஸ்கிருதம் ப்ருகு (ஒரு புராண முனிவரின் பெயர்) என்பதிலிருந்து',
        culturalContext: 'வேத பாரம்பரியத்தில் ஏழு பெரிய முனிவர்களில் (சப்தரிஷி) ஒருவர், பிருகு பரம்பரையின் நிறுவனர், தீ சடங்குகள் மற்றும் சோதிட அறிவுடன் தொடர்புடையவர்'
      }
    }
  },
  'vasishtha': {
    term: 'vasishtha',
    translations: {
      en: {
        translation: 'Vasishtha (legendary sage)',
        transliteration: 'Vasiṣṭha',
        etymology: 'From Sanskrit vasiṣṭha (most excellent, best)',
        culturalContext: 'One of the Saptarishi, chief priest of the Ikshvaku dynasty, author of Rigvedic hymns, and legendary rival of sage Vishvamitra'
      },
      hi: {
        translation: 'वसिष्ठ (पौराणिक ऋषि)',
        transliteration: 'Vasiṣṭha',
        etymology: 'संस्कृत वसिष्ठ (सबसे उत्कृष्ट, सर्वश्रेष्ठ) से',
        culturalContext: 'सप्तर्षि में से एक, इक्ष्वाकु वंश के मुख्य पुरोहित, ऋग्वैदिक भजनों के लेखक, और ऋषि विश्वामित्र के पौराणिक प्रतिद्वंद्वी'
      },
      pa: {
        translation: 'ਵਸਿਸ਼ਠ (ਪੁਰਾਣਕ ਰਿਸ਼ੀ)',
        transliteration: 'Vasiṣṭh',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਵਸਿਸ਼ਠ (ਸਭ ਤੋਂ ਉੱਤਮ, ਸਭ ਤੋਂ ਵਧੀਆ) ਤੋਂ',
        culturalContext: 'ਸਪਤਰਿਸ਼ੀ ਵਿੱਚੋਂ ਇੱਕ, ਇਕਸ਼ਵਾਕੁ ਰਾਜਵੰਸ਼ ਦੇ ਮੁੱਖ ਪੁਰੋਹਿਤ, ਰਿਗਵੈਦਿਕ ਭਜਨਾਂ ਦੇ ਲੇਖਕ, ਅਤੇ ਰਿਸ਼ੀ ਵਿਸ਼ਵਾਮਿਤਰ ਦੇ ਪੁਰਾਣਕ ਪ੍ਰਤੀਦੁੰਦਵੀ'
      },
      ta: {
        translation: 'வசிஷ்டர் (புராண முனிவர்)',
        transliteration: 'Vasiṣṭhar',
        etymology: 'சமஸ்கிருதம் வசிஷ்ட (மிகச் சிறந்த, சிறந்த) என்பதிலிருந்து',
        culturalContext: 'சப்தரிஷிகளில் ஒருவர், இக்ஷ்வாகு வம்சத்தின் தலைமை குரு, ரிக்வேத பாடல்களின் ஆசிரியர், மற்றும் முனிவர் விஸ்வாமித்திரரின் புராண போட்டியாளர்'
      }
    }
  },
  'vishvamitra': {
    term: 'vishvamitra',
    translations: {
      en: {
        translation: 'Vishvamitra (legendary sage)',
        transliteration: 'Viśvāmitra',
        etymology: 'From Sanskrit viśva (all, universal) + mitra (friend)',
        culturalContext: 'One of the Saptarishi, born as a warrior king who became a brahmarishi through penance, author of Gayatri mantra, mentor of Rama'
      },
      hi: {
        translation: 'विश्वामित्र (पौराणिक ऋषि)',
        transliteration: 'Viśvāmitra',
        etymology: 'संस्कृत विश्व (सभी, सार्वभौमिक) + मित्र (मित्र) से',
        culturalContext: 'सप्तर्षि में से एक, एक योद्धा राजा के रूप में जन्मे जो तपस्या के माध्यम से ब्रह्मऋषि बन गए, गायत्री मंत्र के लेखक, राम के गुरु'
      },
      pa: {
        translation: 'ਵਿਸ਼ਵਾਮਿਤਰ (ਪੁਰਾਣਕ ਰਿਸ਼ੀ)',
        transliteration: 'Viśvāmitr',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਵਿਸ਼ਵ (ਸਭ, ਵਿਸ਼ਵਵਿਆਪੀ) + ਮਿਤਰ (ਮਿੱਤਰ) ਤੋਂ',
        culturalContext: 'ਸਪਤਰਿਸ਼ੀ ਵਿੱਚੋਂ ਇੱਕ, ਇੱਕ ਯੋਧਾ ਰਾਜੇ ਦੇ ਰੂਪ ਵਿੱਚ ਜਨਮ ਲਿਆ ਜੋ ਤਪੱਸਿਆ ਦੁਆਰਾ ਬ੍ਰਹਮਰਿਸ਼ੀ ਬਣ ਗਿਆ, ਗਾਇਤਰੀ ਮੰਤਰ ਦੇ ਲੇਖਕ, ਰਾਮ ਦੇ ਗੁਰੂ'
      },
      ta: {
        translation: 'விஸ்வாமித்திரர் (புராண முனிவர்)',
        transliteration: 'Viśvāmittrar',
        etymology: 'சமஸ்கிருதம் விஶ்வ (அனைத்தும், உலகளாவிய) + மித்ர (நண்பன்) என்பதிலிருந்து',
        culturalContext: 'சப்தரிஷிகளில் ஒருவர், போர்வீரன் அரசராக பிறந்து தவத்தின் மூலம் பிரம்மரிஷி ஆனவர், காயத்ரி மந்திரத்தின் ஆசிரியர், ராமரின் குரு'
      }
    }
  },
  'angirasa': {
    term: 'angirasa',
    translations: {
      en: {
        translation: 'Angirasa (legendary sage)',
        transliteration: 'Aṅgirasa',
        etymology: 'From Sanskrit aṅgiras (name of a sage, also meaning messenger, fire)',
        culturalContext: 'One of the Saptarishi, progenitor of the Angirasa gotra, associated with fire rituals and Atharvaveda, ancestor of many Rigvedic composers'
      },
      hi: {
        translation: 'अंगिरस (पौराणिक ऋषि)',
        transliteration: 'Aṅgirasa',
        etymology: 'संस्कृत अंगिरस (एक ऋषि का नाम, दूत, अग्नि का भी अर्थ) से',
        culturalContext: 'सप्तर्षि में से एक, अंगिरस गोत्र के पूर्वज, अग्नि अनुष्ठानों और अथर्ववेद से जुड़े, कई ऋग्वैदिक संगीतकारों के पूर्वज'
      },
      pa: {
        translation: 'ਅੰਗਿਰਸ (ਪੁਰਾਣਕ ਰਿਸ਼ੀ)',
        transliteration: 'Aṅgiras',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਅੰਗਿਰਸ (ਇੱਕ ਰਿਸ਼ੀ ਦਾ ਨਾਮ, ਸੰਦੇਸ਼ਵਾਹਕ, ਅੱਗ ਦਾ ਵੀ ਅਰਥ) ਤੋਂ',
        culturalContext: 'ਸਪਤਰਿਸ਼ੀ ਵਿੱਚੋਂ ਇੱਕ, ਅੰਗਿਰਸ ਗੋਤਰ ਦੇ ਪੁਰਖੇ, ਅੱਗ ਦੀਆਂ ਰਸਮਾਂ ਅਤੇ ਅਥਰਵਵੇਦ ਨਾਲ ਜੁੜੇ, ਕਈ ਰਿਗਵੈਦਿਕ ਰਚਨਾਕਾਰਾਂ ਦੇ ਪੁਰਖੇ'
      },
      ta: {
        translation: 'அங்கிரசர் (புராண முனிவர்)',
        transliteration: 'Aṅgirasar',
        etymology: 'சமஸ்கிருதம் அங்கிரஸ் (ஒரு முனிவரின் பெயர், தூதர், நெருப்பு என்ற பொருளும் உண்டு) என்பதிலிருந்து',
        culturalContext: 'சப்தரிஷிகளில் ஒருவர், அங்கிரச கோத்திரத்தின் முன்னோடி, தீ சடங்குகள் மற்றும் அதர்வ வேதத்துடன் தொடர்புடையவர், பல ரிக்வேத இசையமைப்பாளர்களின் மூதாதையர்'
      }
    }
  },
  'purusha': {
    term: 'purusha',
    translations: {
      en: {
        translation: 'purusha (cosmic being, consciousness)',
        transliteration: 'puruṣa',
        etymology: 'From Sanskrit puruṣa (person, man, consciousness, cosmic spirit)',
        culturalContext: 'The cosmic being in Rigvedic Purusha Sukta from whose sacrifice the universe was created; in Samkhya philosophy, the pure consciousness distinct from matter (prakriti)'
      },
      hi: {
        translation: 'पुरुष (ब्रह्मांडीय सत्ता, चेतना)',
        transliteration: 'puruṣa',
        etymology: 'संस्कृत पुरुष (व्यक्ति, मनुष्य, चेतना, ब्रह्मांडीय आत्मा) से',
        culturalContext: 'ऋग्वैदिक पुरुष सूक्त में ब्रह्मांडीय सत्ता जिसके यज्ञ से ब्रह्मांड की रचना हुई; सांख्य दर्शन में, पदार्थ (प्रकृति) से भिन्न शुद्ध चेतना'
      },
      pa: {
        translation: 'ਪੁਰੁਸ਼ (ਬ੍ਰਹਿਮੰਡੀ ਸੱਤਾ, ਚੇਤਨਾ)',
        transliteration: 'puruṣ',
        etymology: 'ਸੰਸਕ੍ਰਿਤ ਪੁਰੁਸ਼ (ਵਿਅਕਤੀ, ਮਨੁੱਖ, ਚੇਤਨਾ, ਬ੍ਰਹਿਮੰਡੀ ਆਤਮਾ) ਤੋਂ',
        culturalContext: 'ਰਿਗਵੈਦਿਕ ਪੁਰੁਸ਼ ਸੂਕਤ ਵਿੱਚ ਬ੍ਰਹਿਮੰਡੀ ਸੱਤਾ ਜਿਸਦੇ ਯੱਗ ਤੋਂ ਬ੍ਰਹਿਮੰਡ ਦੀ ਰਚਨਾ ਹੋਈ; ਸਾਂਖਿਆ ਦਰਸ਼ਨ ਵਿੱਚ, ਪਦਾਰਥ (ਪ੍ਰਕ੍ਰਿਤੀ) ਤੋਂ ਵੱਖਰੀ ਸ਼ੁੱਧ ਚੇਤਨਾ'
      },
      ta: {
        translation: 'புருஷன் (பிரபஞ்ச உயிர், உணர்வு)',
        transliteration: 'puruṣan',
        etymology: 'சமஸ்கிருதம் புருஷ (நபர், மனிதன், உணர்வு, பிரபஞ்ச ஆவி) என்பதிலிருந்து',
        culturalContext: 'ரிக்வேத புருஷ சூக்தத்தில் பிரபஞ்ச உயிர், அதன் தியாகத்திலிருந்து பிரபஞ்சம் உருவாக்கப்பட்டது; சாங்கிய தத்துவத்தில், பொருளிலிருந்து (பிரகிருதி) வேறுபட்ட தூய உணர்வு'
      }
    }
  }
};
