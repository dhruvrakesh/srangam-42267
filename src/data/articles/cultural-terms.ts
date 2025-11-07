import { CulturalTerm } from '@/types/multilingual';

// Comprehensive database of dharmic and bharatiya terms with cultural context
import { enhancedCulturalTerms } from './enhanced-cultural-terms';
import { jambudvipaCulturalTerms } from './cultural-terms-jambudvipa';
import { cosmicIslandCulturalTerms } from './cultural-terms-cosmic-island';
import { stonePuranaCulturalTerms } from './cultural-terms-stone-purana';
import { scriptsSailedIICulturalTerms } from './cultural-terms-scripts-sailed-ii';
import { geomythologyCulturalTerms } from './cultural-terms-geomythology';

export const culturalTermsDatabase: Record<string, CulturalTerm> = {
  ...enhancedCulturalTerms,
  ...jambudvipaCulturalTerms.reduce((acc, term) => ({ ...acc, [term.term]: term }), {}),
  ...cosmicIslandCulturalTerms,
  ...stonePuranaCulturalTerms,
  ...scriptsSailedIICulturalTerms,
  ...geomythologyCulturalTerms,
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
  },
  // Archaeological Sites & Ancient Places
  'korkai': {
    term: 'korkai',
    translations: {
      en: {
        translation: 'Korkai',
        transliteration: 'kōrkai',
        etymology: 'Tamil kōr (sharp) + kai (settlement by water)',
        culturalContext: 'Ancient Pandya capital and major pearl diving center, flourished as a port city from 3rd century BCE'
      },
      ta: {
        translation: 'கோர்கை',
        transliteration: 'kōrkai',
        etymology: 'கோர் (கூர்மையான) + கை (நீருக்கு அருகே குடியிருப்பு)',
        culturalContext: 'பண்டைய பாண்டிய தலைநகர் மற்றும் முக்கிய முத்து வேட்டை மையம், கி.மு. 3ஆம் நூற்றாண்டிலிருந்து துறைமுக நகரமாக வளர்ந்தது'
      }
    }
  },
  'arikamedu': {
    term: 'arikamedu',
    translations: {
      en: {
        translation: 'Arikamedu',
        transliteration: 'arikamēḍu',
        etymology: 'Tamil ari (broken) + kamedu (platform/settlement)',
        culturalContext: 'Ancient Roman trading post near Pondicherry, known as Poduke to Greeks, major Indo-Roman trade center'
      },
      ta: {
        translation: 'அரிகமேடு',
        transliteration: 'arikamēḍu',
        etymology: 'அரி (உடைந்த) + கமேடு (மேடை/குடியிருப்பு)',
        culturalContext: 'பாண்டிச்சேரி அருகே உள்ள பண்டைய ரோமானிய வணிக நிலையம், கிரேக்கர்களுக்கு போடுகே என்று அறியப்பட்டது, முக்கிய இந்திய-ரோமானிய வணிக மையம்'
      }
    }
  },
  'tamilakam': {
    term: 'tamilakam',
    translations: {
      en: {
        translation: 'Tamilakam',
        transliteration: 'tamiḻakam',
        etymology: 'Tamil tamiḻ + akam (home/region)',
        culturalContext: 'Ancient geographical and cultural region of Tamil people, encompassing modern Tamil Nadu and parts of Kerala, Karnataka, Andhra Pradesh'
      },
      ta: {
        translation: 'தமிழகம்',
        transliteration: 'tamiḻakam',
        etymology: 'தமிழ் + அகம் (வீடு/பகுதி)',
        culturalContext: 'தமிழ் மக்களின் பண்டைய புவியியல் மற்றும் கலாச்சார பகுதி, நவீன தமிழ்நாடு மற்றும் கேரளா, கர்நாடக, ஆந்திர பிரதேசத்தின் சில பகுதிகளை உள்ளடக்கியது'
      }
    }
  },
  'poduke': {
    term: 'poduke',
    translations: {
      en: {
        translation: 'Poduke',
        transliteration: 'podukē',
        etymology: 'Greek rendering of Tamil port name, possibly from podu (entrance) + kay (settlement)',
        culturalContext: 'Ancient Greek name for Arikamedu, mentioned in Periplus of the Erythraean Sea as major trading port'
      },
      ta: {
        translation: 'போடுகே',
        transliteration: 'pōdukē',
        etymology: 'தமிழ் துறைமுக பெயரின் கிரேக்க உச்சரிப்பு, போது (நுழைவு) + கே (குடியிருப்பு)',
        culturalContext: 'அரிகமேடுவின் பண்டைய கிரேக்க பெயர், எரித்ரியன் கடல் பெரிப்ளஸில் முக்கிய வணிக துறைமுகமாக குறிப்பிடப்பட்டது'
      }
    }
  },
  // Rivers & Geography
  'thamirabarani': {
    term: 'thamirabarani',
    translations: {
      en: {
        translation: 'Thamirabarani',
        transliteration: 'tāmiraparṇi',
        etymology: 'Sanskrit tāmra (copper) + parṇi (leaves)',
        culturalContext: 'Sacred river in Tamil Nadu, mentioned in ancient texts, sustains the Tirunelveli region'
      },
      ta: {
        translation: 'தாமிரபரணி',
        transliteration: 'tāmiraparṇi',
        etymology: 'சமஸ்கிருத tāmra (செம்பு) + parṇi (இலைகள்)',
        culturalContext: 'தமிழ்நாட்டின் புனித நதி, பண்டைய நூல்களில் குறிப்பிடப்பட்டு, திருநெல்வேலி பகுதியை வளமாக்குகிறது'
      }
    }
  },
  'ganga': {
    term: 'ganga',
    translations: {
      en: {
        translation: 'Ganga',
        transliteration: 'gaṅgā',
        etymology: 'Sanskrit gaṅ (to go) + gā (stream)',
        culturalContext: 'Most sacred river in Hinduism, goddess personification, spiritual purification'
      },
      ta: {
        translation: 'கங்கா',
        transliteration: 'gaṅgā',
        etymology: 'சமஸ்கிருத gaṅ (செல்லுதல்) + gā (ஓடை)',
        culturalContext: 'இந்து மதத்தில் மிகவும் புனிதமான நதி, தேவி அவதாரம், ஆன்மீக தூய்மை'
      }
    }
  },
  'yamuna': {
    term: 'yamuna',
    translations: {
      en: {
        translation: 'Yamuna',
        transliteration: 'yamunā',
        etymology: 'Sanskrit yama (restraint) + una (water)',
        culturalContext: 'Sacred river associated with Lord Krishna, twin of Ganga in spiritual significance'
      },
      ta: {
        translation: 'யமுனா',
        transliteration: 'yamunā',
        etymology: 'சமஸ்கிருத yama (கட்டுப்பாடு) + una (நீர்)',
        culturalContext: 'கிருஷ்ணருடன் தொடர்புடைய புனித நதி, ஆன்மீக முக்கியத்துவத்தில் கங்கையின் இரட்டையர்'
      }
    }
  },
  'godavari': {
    term: 'godavari',
    translations: {
      en: {
        translation: 'Godavari',
        transliteration: 'godāvarī',
        etymology: 'Sanskrit go (cow/earth) + dāvarī (giving)',
        culturalContext: 'Sacred river known as Southern Ganga, major pilgrimage sites along its banks'
      },
      ta: {
        translation: 'கோதாவரி',
        transliteration: 'godāvarī',
        etymology: 'சமஸ்கிருத go (பசு/பூமி) + dāvarī (கொடுப்பவள்)',
        culturalContext: 'தென் கங்கை என்று அழைக்கப்படும் புனித நதி, அதன் கரைகளில் முக்கிய புண்ணிய தலங்கள்'
      }
    }
  },
  'krishnaveni': {
    term: 'krishnaveni',
    translations: {
      en: {
        translation: 'Krishnaveni',
        transliteration: 'kṛṣṇavēṇī',
        etymology: 'Sanskrit kṛṣṇa (dark/Krishna) + vēṇī (braid/river)',
        culturalContext: 'Ancient name for Krishna river, sacred waterway in Andhra Pradesh and Karnataka'
      },
      ta: {
        translation: 'கிருஷ்ணவேணி',
        transliteration: 'kṛṣṇavēṇī',
        etymology: 'சமஸ்கிருத kṛṣṇa (கருமை/கிருஷ்ணர்) + vēṇī (பின்னல்/நதி)',
        culturalContext: 'கிருஷ்ணா நதியின் பண்டைய பெயர், ஆந்திர பிரதேசம் மற்றும் கர்நாடகத்தின் புனித நீர்வழி'
      }
    }
  },
  'kaveri': {
    term: 'kaveri',
    translations: {
      en: {
        translation: 'Kaveri',
        transliteration: 'kāvērī',
        etymology: 'Sanskrit kā (prosperity) + vērī (bestowing)',
        culturalContext: 'Sacred river of South India, sustains Tamil and Kannada regions, source of ancient kingdoms'
      },
      ta: {
        translation: 'காவிரி',
        transliteration: 'kāvērī',
        etymology: 'சமஸ்கிருத kā (செழிப்பு) + vērī (அளிப்பவள்)',
        culturalContext: 'தென்னிந்தியாவின் புனித நதி, தமிழ் மற்றும் கன்னட பகுதிகளை வளமாக்குகிறது, பண்டைய அரசுகளின் ஊற்று'
      }
    }
  },
  // Scripts & Languages
  'tamil-brahmi': {
    term: 'tamil-brahmi',
    translations: {
      en: {
        translation: 'Tamil-Brahmi',
        transliteration: 'tamiḻ-brāhmī',
        etymology: 'Tamil script derived from Brahmi script',
        culturalContext: 'Ancient Tamil script used from 3rd century BCE, found in cave inscriptions and pottery'
      },
      ta: {
        translation: 'தமிழ்-பிராமி',
        transliteration: 'tamiḻ-brāhmī',
        etymology: 'பிராமி எழுத்திலிருந்து பெறப்பட்ட தமிழ் எழுத்து',
        culturalContext: 'கி.மு. 3ஆம் நூற்றாண்டிலிருந்து பயன்படுத்தப்பட்ட பண்டைய தமிழ் எழுத்து, குகை கல்வெட்டுகள் மற்றும் மண்பாண்டங்களில் காணப்படுகிறது'
      }
    }
  },
  'indus-script': {
    term: 'indus-script',
    translations: {
      en: {
        translation: 'Indus Script',
        transliteration: 'sindhu-lipi',
        etymology: 'Script of the Indus Valley Civilization',
        culturalContext: 'Undeciphered script of Harappan civilization (3300-1300 BCE), found on seals and pottery'
      },
      ta: {
        translation: 'சிந்து எழுத்து',
        transliteration: 'sindhu-eḻuttu',
        etymology: 'சிந்து வெளி நாகரிகத்தின் எழுத்து',
        culturalContext: 'ஹரப்பா நாகரிகத்தின் (கி.மு. 3300-1300) விடுகதை எழுத்து, முத்திரைகள் மற்றும் மண்பாண்டங்களில் காணப்படுகிறது'
      }
    }
  },
  // Mahabharata Terms
  'sabha-parva': {
    term: 'sabha-parva',
    translations: {
      en: {
        translation: 'Sabha Parva',
        transliteration: 'sabhā-parva',
        etymology: 'Sanskrit sabhā (assembly hall) + parva (book/section)',
        culturalContext: 'Second book of Mahabharata describing Yudhishthira\'s royal assembly and Pandava expansion'
      },
      ta: {
        translation: 'சபா பர்வம்',
        transliteration: 'sabhā-parvam',
        etymology: 'சமஸ்கிருத sabhā (அவைக்கூடம்) + parva (புத்தகம்/பகுதி)',
        culturalContext: 'யுதிஷ்டிரரின் அரச அவை மற்றும் பாண்டவர் விரிவாக்கத்தை விவரிக்கும் மகாபாரதத்தின் இரண்டாம் புத்தகம்'
      }
    }
  },
  'digvijaya-parva': {
    term: 'digvijaya-parva',
    translations: {
      en: {
        translation: 'Digvijaya Parva',
        transliteration: 'digvijaya-parva',
        etymology: 'Sanskrit dig (direction) + vijaya (conquest) + parva (section)',
        culturalContext: 'Section describing conquest of all directions by Pandava brothers for Rajasuya sacrifice'
      },
      ta: {
        translation: 'திக்விஜய பர்வம்',
        transliteration: 'digvijaya-parvam',
        etymology: 'சமஸ்கிருத dig (திசை) + vijaya (வெற்றி) + parva (பகுதி)',
        culturalContext: 'ராஜசூய யாகத்திற்காக பாண்டவ சகோதரர்கள் எல்லா திசைகளையும் வென்றதை விவரிக்கும் பகுதி'
      }
    }
  },
  'sahadeva': {
    term: 'sahadeva',
    translations: {
      en: {
        translation: 'Sahadeva',
        transliteration: 'sahadēva',
        etymology: 'Sanskrit saha (with/together) + dēva (divine)',
        culturalContext: 'Youngest Pandava prince, twin of Nakula, known for wisdom and prophetic abilities'
      },
      ta: {
        translation: 'சகாதேவ',
        transliteration: 'sahadēva',
        etymology: 'சமஸ்கிருத saha (உடன்/சேர்ந்து) + dēva (தெய்வீக)',
        culturalContext: 'இளைய பாண்டவ இளவரசன், நகுலனின் இரட்டையன், ஞானம் மற்றும் தீர்க்கதரிசன திறனுக்கு புகழ்பெற்றவன்'
      }
    }
  },
  'yudhishthira': {
    term: 'yudhishthira',
    translations: {
      en: {
        translation: 'Yudhishthira',
        transliteration: 'yudhiṣṭhira',
        etymology: 'Sanskrit yuddha (war) + sthira (steady/firm)',
        culturalContext: 'Eldest Pandava, known as Dharmaraja for his righteousness, future king of Hastinapura'
      },
      ta: {
        translation: 'யுதிஷ்டிர',
        transliteration: 'yudhiṣṭhira',
        etymology: 'சமஸ்கிருத yuddha (போர்) + sthira (நிலையான/உறுதியான)',
        culturalContext: 'மூத்த பாண்டவன், நீதிநேர்மைக்காக தர்மராஜா என்று அழைக்கப்படுபவன், ஹஸ்தினாபுரத்தின் வருங்கால அரசன்'
      }
    }
  },
  'rajasuya': {
    term: 'rajasuya',
    translations: {
      en: {
        translation: 'Rajasuya',
        transliteration: 'rājasūya',
        etymology: 'Sanskrit rāja (king) + sūya (sacrifice/consecration)',
        culturalContext: 'Imperial consecration sacrifice performed by universal emperors, establishes sovereignty over all kings'
      },
      ta: {
        translation: 'ராஜசூய',
        transliteration: 'rājasūya',
        etymology: 'சமஸ्கிருத rāja (அரசன்) + sūya (தியாகம்/அபிஷேகம்)',
        culturalContext: 'உலகாண்ட சக்ரவர்த்திகளால் நடத்தப்படும் பேரரசு அபிஷேக யாகம், எல்லா மன்னர்களின் மீதும் இறையாண்மையை நிறுவுகிறது'
      }
    }
  },
  'mahishimati': {
    term: 'mahishimati',
    translations: {
      en: {
        translation: 'Mahishimati',
        transliteration: 'māhiṣmatī',
        etymology: 'Sanskrit māhiṣa (buffalo/mighty) + mati (city/capital)',
        culturalContext: 'Ancient capital city mentioned in Mahabharata, located on Narmada river, powerful kingdom'
      },
      ta: {
        translation: 'மாஹிஷ்மதி',
        transliteration: 'māhiṣmatī',
        etymology: 'சமஸ্কிருত māhiṣa (எருமை/வலிமையான) + mati (நகரம்/தலைநகர்)',
        culturalContext: 'மகாபாரதத்தில் குறிப்பிடப்பட்ட பண்டைய தலைநகரம், நர்மதா நதிக்கரையில் அமைந்த சக்திவாய்ந்த அரசு'
      }
    }
  },
  'kurukshetra': {
    term: 'kurukshetra',
    translations: {
      en: {
        translation: 'Kurukshetra',
        transliteration: 'kurukṣētra',
        etymology: 'Sanskrit kuru (dynasty name) + kṣētra (field/sacred ground)',
        culturalContext: 'Sacred battlefield of Mahabharata war, site where Bhagavad Gita was spoken, place of righteousness'
      },
      ta: {
        translation: 'குருக்ஷேத்ர',
        transliteration: 'kurukṣētra',
        etymology: 'சமஸ्कিருত kuru (வம்ச பெயர்) + kṣētra (புலம்/புனித பூமி)',
        culturalContext: 'மகாபாரத போரின் புனித போர்க்களம், பகவத் கீதை கூறப்பட்ட இடம், நீதியின் ஸ்தலம்'
      }
    }
  },
  'bhishma': {
    term: 'bhishma',
    translations: {
      en: {
        translation: 'Bhishma',
        transliteration: 'bhīṣma',
        etymology: 'Sanskrit bhīṣma (terrible/fearsome) from bhī (to fear)',
        culturalContext: 'Grand patriarch of Kuru dynasty, took vow of celibacy, supreme warrior and strategist'
      },
      ta: {
        translation: 'பீஷ்ம',
        transliteration: 'bhīṣma',
        etymology: 'சமஸ්கிருত bhīṣma (பயங்கரமான/அச்சமூட்டும்) bhī (பயம்) விலிருந்து',
        culturalContext: 'குரு வம்சத்தின் பெரியவர், பிரம்மச்சரிய விரதம் எடுத்தவர், உச்ச வீரர் மற்றும் தந்திரவாதி'
      }
    }
  },
  'arjuna': {
    term: 'arjuna',
    translations: {
      en: {
        translation: 'Arjuna',
        transliteration: 'arjuna',
        etymology: 'Sanskrit arjuna (bright/silver/pure)',
        culturalContext: 'Third Pandava prince, greatest archer, receiver of Bhagavad Gita teachings from Krishna'
      },
      ta: {
        translation: 'அர்ஜுன',
        transliteration: 'arjuna',
        etymology: 'சமஸ்கிருত arjuna (பிரகாசமான/வெள்ளி/தூய்மையான)',
        culturalContext: 'மூன்றாம் பாண்டவ இளவரசன், மிகச்சிறந்த வில்வீரன், கிருஷ்ணரிடமிருந்து பகவத் கீதை உபதேசம் பெற்றவன்'
      }
    }
  },
  'harivamsha': {
    term: 'harivamsha',
    translations: {
      en: {
        translation: 'Harivamsha',
        transliteration: 'harivaṃśa',
        etymology: 'Sanskrit hari (Vishnu/Krishna) + vaṃśa (lineage/genealogy)',
        culturalContext: 'Supplement to Mahabharata containing Krishna\'s life story and Yadava genealogy'
      },
      ta: {
        translation: 'ஹரிவம்ச',
        transliteration: 'harivaṃśa',
        etymology: 'சமஸ্কিருத hari (விஷ்ணு/கிருஷ்ணர்) + vaṃśa (வம்சம்/வம்சாவளி)',
        culturalContext: 'கிருஷ்ணரின் வாழ்க்கை வரலாறு மற்றும் யாதவ வம்சாவளியைக் கொண்ட மகாபாரதத்தின் துணைநூல்'
      }
    }
  },
  // Vedic & Epic Texts
  'rigveda': {
    term: 'rigveda',
    translations: {
      en: {
        translation: 'Rigveda',
        transliteration: 'ṛgveda',
        etymology: 'Sanskrit ṛc (praise) + veda (knowledge)',
        culturalContext: 'Oldest of the four Vedas, collection of 1,028 hymns composed c. 1500-1200 BCE'
      },
      hi: {
        translation: 'ऋग्वेद',
        transliteration: 'ṛgveda',
        etymology: 'संस्कृत ऋच् (स्तुति) + वेद (ज्ञान)',
        culturalContext: 'चार वेदों में सबसे प्राचीन, 1,028 मंत्रों का संग्रह, रचनाकाल लगभग 1500-1200 ईसा पूर्व'
      }
    }
  },
  'vedic': {
    term: 'vedic',
    translations: {
      en: {
        translation: 'Vedic',
        transliteration: 'vaidika',
        etymology: 'From Sanskrit veda (knowledge)',
        culturalContext: 'Relating to the Vedas, the oldest Sanskrit texts and foundation of Hindu philosophy'
      },
      hi: {
        translation: 'वैदिक',
        transliteration: 'vaidika',
        etymology: 'संस्कृत वेद (ज्ञान) से',
        culturalContext: 'वेदों से संबंधित, सबसे प्राचीन संस्कृत ग्रंथ और हिंदू दर्शन की नींव'
      }
    }
  },
  'shatapatha-brahmana': {
    term: 'shatapatha-brahmana',
    translations: {
      en: {
        translation: 'Shatapatha Brahmana',
        transliteration: 'śatapatha brāhmaṇa',
        etymology: 'Sanskrit śata (hundred) + patha (path/chapter) + brāhmaṇa',
        culturalContext: 'Vedic text containing ritual instructions and narratives of eastward expansion'
      },
      hi: {
        translation: 'शतपथ ब्राह्मण',
        transliteration: 'śatapatha brāhmaṇa',
        etymology: 'संस्कृत शत (सौ) + पथ (मार्ग/अध्याय) + ब्राह्मण',
        culturalContext: 'वैदिक ग्रंथ जिसमें यज्ञ विधि और पूर्व की ओर विस्तार की कथाएं हैं'
      }
    }
  },
  'vishnu-purana': {
    term: 'vishnu-purana',
    translations: {
      en: {
        translation: 'Vishnu Purana',
        transliteration: 'viṣṇu purāṇa',
        etymology: 'Named after deity Vishnu + purāṇa (ancient lore)',
        culturalContext: 'Major Purana containing cosmology, geography, and genealogies of gods and kings'
      },
      hi: {
        translation: 'विष्णु पुराण',
        transliteration: 'viṣṇu purāṇa',
        etymology: 'देवता विष्णु के नाम पर + पुराण (प्राचीन कथाएं)',
        culturalContext: 'प्रमुख पुराण जिसमें ब्रह्मांड विज्ञान, भूगोल, और देवताओं तथा राजाओं की वंशावली है'
      }
    }
  },
  'markandeya-purana': {
    term: 'markandeya-purana',
    translations: {
      en: {
        translation: 'Markandeya Purana',
        transliteration: 'mārkaṇḍeya purāṇa',
        etymology: 'Named after sage Markandeya + purāṇa',
        culturalContext: 'Purana containing detailed geography of Bharatvarsha and Devi Mahatmya'
      },
      hi: {
        translation: 'मार्कण्डेय पुराण',
        transliteration: 'mārkaṇḍeya purāṇa',
        etymology: 'ऋषि मार्कण्डेय के नाम पर + पुराण',
        culturalContext: 'पुराण जिसमें भारतवर्ष का विस्तृत भूगोल और देवी माहात्म्य है'
      }
    }
  },
  'vayu-purana': {
    term: 'vayu-purana',
    translations: {
      en: {
        translation: 'Vayu Purana',
        transliteration: 'vāyu purāṇa',
        etymology: 'Named after wind deity Vayu + purāṇa',
        culturalContext: 'Purana with extensive geographical and genealogical information'
      },
      hi: {
        translation: 'वायु पुराण',
        transliteration: 'vāyu purāṇa',
        etymology: 'वायु देवता के नाम पर + पुराण',
        culturalContext: 'विस्तृत भौगोलिक और वंशावली जानकारी वाला पुराण'
      }
    }
  },
  'brahmanda-purana': {
    term: 'brahmanda-purana',
    translations: {
      en: {
        translation: 'Brahmanda Purana',
        transliteration: 'brahmāṇḍa purāṇa',
        etymology: 'Sanskrit brahma (cosmic) + aṇḍa (egg) + purāṇa',
        culturalContext: 'Purana describing cosmic structure and regional geography'
      },
      hi: {
        translation: 'ब्रह्मांड पुराण',
        transliteration: 'brahmāṇḍa purāṇa',
        etymology: 'संस्कृत ब्रह्म (ब्रह्मांडीय) + अंड (अंडा) + पुराण',
        culturalContext: 'ब्रह्मांडीय संरचना और क्षेत्रीय भूगोल का वर्णन करने वाला पुराण'
      }
    }
  },
  'adi-parva': {
    term: 'adi-parva',
    translations: {
      en: {
        translation: 'Adi Parva',
        transliteration: 'ādi parva',
        etymology: 'Sanskrit ādi (first) + parva (book/chapter)',
        culturalContext: 'First book of the Mahabharata, containing origin stories and genealogies'
      },
      hi: {
        translation: 'आदि पर्व',
        transliteration: 'ādi parva',
        etymology: 'संस्कृत आदि (प्रथम) + पर्व (पुस्तक/अध्याय)',
        culturalContext: 'महाभारत का प्रथम पर्व, जिसमें उत्पत्ति कथाएं और वंशावली हैं'
      }
    }
  },
  // Cosmology & Geography
  'bhumandala': {
    term: 'bhumandala',
    translations: {
      en: {
        translation: 'Bhumandala',
        transliteration: 'bhūmaṇḍala',
        etymology: 'Sanskrit bhū (earth) + maṇḍala (circle/disc)',
        culturalContext: 'The terrestrial disc in Puranic cosmology, containing the seven continents'
      },
      hi: {
        translation: 'भूमंडल',
        transliteration: 'bhūmaṇḍala',
        etymology: 'संस्कृत भू (पृथ्वी) + मंडल (वृत्त/चक्र)',
        culturalContext: 'पौराणिक ब्रह्मांड विज्ञान में पार्थिव चक्र, जिसमें सात द्वीप हैं'
      }
    }
  },
  'sapta-dvipa': {
    term: 'sapta-dvipa',
    translations: {
      en: {
        translation: 'Sapta-Dvipa',
        transliteration: 'sapta-dvīpa',
        etymology: 'Sanskrit sapta (seven) + dvīpa (island/continent)',
        culturalContext: 'The seven concentric island-continents of Puranic cosmography'
      },
      hi: {
        translation: 'सप्त-द्वीप',
        transliteration: 'sapta-dvīpa',
        etymology: 'संस्कृत सप्त (सात) + द्वीप (द्वीप/महाद्वीप)',
        culturalContext: 'पौराणिक भूगोल के सात संकेंद्रित द्वीप-महाद्वीप'
      }
    }
  },
  'dvipas': {
    term: 'dvipas',
    translations: {
      en: {
        translation: 'Dvipas',
        transliteration: 'dvīpas',
        etymology: 'Plural of Sanskrit dvīpa (island/continent)',
        culturalContext: 'The island-continents in Puranic world model'
      },
      hi: {
        translation: 'द्वीप',
        transliteration: 'dvīpas',
        etymology: 'संस्कृत द्वीप (द्वीप/महाद्वीप) का बहुवचन',
        culturalContext: 'पौराणिक विश्व मॉडल में द्वीप-महाद्वीप'
      }
    }
  },
  'meru': {
    term: 'meru',
    translations: {
      en: {
        translation: 'Mount Meru',
        transliteration: 'meru',
        etymology: 'Sanskrit meru (cosmic mountain)',
        culturalContext: 'The golden cosmic axis mountain at the center of the universe in Hindu cosmology'
      },
      hi: {
        translation: 'मेरु पर्वत',
        transliteration: 'meru',
        etymology: 'संस्कृत मेरु (ब्रह्मांडीय पर्वत)',
        culturalContext: 'हिंदू ब्रह्मांड विज्ञान में ब्रह्मांड के केंद्र में स्थित स्वर्णिम अक्ष पर्वत'
      }
    }
  },
  'himavan': {
    term: 'himavan',
    translations: {
      en: {
        translation: 'Himavan',
        transliteration: 'himavān',
        etymology: 'Sanskrit hima (snow) + vān (possessing)',
        culturalContext: 'Ancient name for the Himalayan mountains, abode of snow'
      },
      hi: {
        translation: 'हिमवान',
        transliteration: 'himavān',
        etymology: 'संस्कृत हिम (बर्फ) + वान (युक्त)',
        culturalContext: 'हिमालय पर्वत का प्राचीन नाम, हिम का निवास'
      }
    }
  },
  'ilavrita': {
    term: 'ilavrita',
    translations: {
      en: {
        translation: 'Ilavrita',
        transliteration: 'ilāvṛta',
        etymology: 'Sanskrit proper name, possibly "enclosed by Ila"',
        culturalContext: 'Central varsha of Jambudvipa where Mount Meru is located'
      },
      hi: {
        translation: 'इलावृत',
        transliteration: 'ilāvṛta',
        etymology: 'संस्कृत व्यक्तिवाचक नाम',
        culturalContext: 'जम्बूद्वीप का केंद्रीय वर्ष जहां मेरु पर्वत स्थित है'
      }
    }
  },
  'uttarakuru': {
    term: 'uttarakuru',
    translations: {
      en: {
        translation: 'Uttarakuru',
        transliteration: 'uttarakuru',
        etymology: 'Sanskrit uttara (north) + kuru (people)',
        culturalContext: 'Northern varsha of Jambudvipa, described as earthly paradise'
      },
      hi: {
        translation: 'उत्तरकुरु',
        transliteration: 'uttarakuru',
        etymology: 'संस्कृत उत्तर (उत्तर) + कुरु (लोग)',
        culturalContext: 'जम्बूद्वीप का उत्तरी वर्ष, पार्थिव स्वर्ग के रूप में वर्णित'
      }
    }
  },
  'varshas': {
    term: 'varshas',
    translations: {
      en: {
        translation: 'Varshas',
        transliteration: 'varṣas',
        etymology: 'Plural of Sanskrit varṣa (region/division)',
        culturalContext: 'The nine divisions of Jambudvipa in Puranic geography'
      },
      hi: {
        translation: 'वर्ष',
        transliteration: 'varṣas',
        etymology: 'संस्कृत वर्ष (क्षेत्र/विभाग) का बहुवचन',
        culturalContext: 'पौराणिक भूगोल में जम्बूद्वीप के नौ विभाग'
      }
    }
  },
  'kulaparvatas': {
    term: 'kulaparvatas',
    translations: {
      en: {
        translation: 'Kulaparvatas',
        transliteration: 'kulaparvatas',
        etymology: 'Sanskrit kula (clan/principal) + parvata (mountain)',
        culturalContext: 'The seven principal mountain ranges of Bharatvarsha'
      },
      hi: {
        translation: 'कुलपर्वत',
        transliteration: 'kulaparvatas',
        etymology: 'संस्कृत कुल (कुल/मुख्य) + पर्वत (पहाड़)',
        culturalContext: 'भारतवर्ष की सात प्रमुख पर्वत श्रृंखलाएं'
      }
    }
  },
  'bhuvanakosha': {
    term: 'bhuvanakosha',
    translations: {
      en: {
        translation: 'Bhuvanakosha',
        transliteration: 'bhuvanakośa',
        etymology: 'Sanskrit bhuvana (world) + kośa (treasury/compendium)',
        culturalContext: 'World atlas sections of Puranic texts containing systematic geography'
      },
      hi: {
        translation: 'भुवनकोश',
        transliteration: 'bhuvanakośa',
        etymology: 'संस्कृत भुवन (संसार) + कोश (खजाना/संग्रह)',
        culturalContext: 'पौराणिक ग्रंथों के विश्व मानचित्र खंड जिनमें व्यवस्थित भूगोल है'
      }
    }
  },
  // Philosophy & Concepts
  'karma': {
    term: 'karma',
    translations: {
      en: {
        translation: 'Karma',
        transliteration: 'karma',
        etymology: 'Sanskrit kṛ (to do, act)',
        culturalContext: 'Law of cause and effect; actions determining future consequences'
      },
      hi: {
        translation: 'कर्म',
        transliteration: 'karma',
        etymology: 'संस्कृत कृ (करना, कार्य करना)',
        culturalContext: 'कारण और प्रभाव का नियम; कर्म जो भविष्य के परिणाम निर्धारित करते हैं'
      }
    }
  },
  'moksha': {
    term: 'moksha',
    translations: {
      en: {
        translation: 'Moksha',
        transliteration: 'mokṣa',
        etymology: 'Sanskrit muc (to free, release)',
        culturalContext: 'Liberation from cycle of rebirth, ultimate spiritual goal in Hinduism'
      },
      hi: {
        translation: 'मोक्ष',
        transliteration: 'mokṣa',
        etymology: 'संस्कृत मुच् (मुक्त करना, छोड़ना)',
        culturalContext: 'पुनर्जन्म के चक्र से मुक्ति, हिंदू धर्म में परम आध्यात्मिक लक्ष्य'
      }
    }
  },
  'svarga': {
    term: 'svarga',
    translations: {
      en: {
        translation: 'Svarga',
        transliteration: 'svarga',
        etymology: 'Sanskrit svar (heaven) + ga (going)',
        culturalContext: 'Heaven or paradise in Hindu cosmology'
      },
      hi: {
        translation: 'स्वर्ग',
        transliteration: 'svarga',
        etymology: 'संस्कृत स्वर् (स्वर्ग) + ग (जाना)',
        culturalContext: 'हिंदू ब्रह्मांड विज्ञान में स्वर्ग या परम धाम'
      }
    }
  },
  'dharmic': {
    term: 'dharmic',
    translations: {
      en: {
        translation: 'Dharmic',
        transliteration: 'dhārmika',
        etymology: 'From Sanskrit dharma + -ic suffix',
        culturalContext: 'Relating to dharma; religious traditions originating in India'
      },
      hi: {
        translation: 'धार्मिक',
        transliteration: 'dhārmika',
        etymology: 'संस्कृत धर्म से',
        culturalContext: 'धर्म से संबंधित; भारत में उत्पन्न धार्मिक परंपराएं'
      }
    }
  },
  // Deities & Figures
  'agni': {
    term: 'agni',
    translations: {
      en: {
        translation: 'Agni',
        transliteration: 'agni',
        etymology: 'Sanskrit agni (fire)',
        culturalContext: 'Vedic fire deity, mediator between humans and gods through sacrifice'
      },
      hi: {
        translation: 'अग्नि',
        transliteration: 'agni',
        etymology: 'संस्कृत अग्नि (आग)',
        culturalContext: 'वैदिक अग्नि देवता, यज्ञ के माध्यम से मनुष्य और देवताओं के बीच मध्यस्थ'
      }
    }
  },
  'brahma': {
    term: 'brahma',
    translations: {
      en: {
        translation: 'Brahma',
        transliteration: 'brahmā',
        etymology: 'From Sanskrit brahman (cosmic principle)',
        culturalContext: 'Creator deity in Hindu trinity, dwells atop Mount Meru'
      },
      hi: {
        translation: 'ब्रह्मा',
        transliteration: 'brahmā',
        etymology: 'संस्कृत ब्रह्मन् (ब्रह्मांडीय सिद्धांत) से',
        culturalContext: 'हिंदू त्रिमूर्ति में सृष्टिकर्ता देवता, मेरु पर्वत के शिखर पर निवास'
      }
    }
  },
  'vishnu': {
    term: 'vishnu',
    translations: {
      en: {
        translation: 'Vishnu',
        transliteration: 'viṣṇu',
        etymology: 'Sanskrit viṣ (to pervade)',
        culturalContext: 'Preserver deity in Hindu trinity, from whom Akasha Ganga descends'
      },
      hi: {
        translation: 'विष्णु',
        transliteration: 'viṣṇu',
        etymology: 'संस्कृत विष् (व्याप्त होना)',
        culturalContext: 'हिंदू त्रिमूर्ति में पालनकर्ता देवता, जिनसे आकाश गंगा उतरती है'
      }
    }
  },
  'indra': {
    term: 'indra',
    translations: {
      en: {
        translation: 'Indra',
        transliteration: 'indra',
        etymology: 'Sanskrit ind (to conquer)',
        culturalContext: 'King of gods in Vedic pantheon, wielder of thunderbolt'
      },
      hi: {
        translation: 'इंद्र',
        transliteration: 'indra',
        etymology: 'संस्कृत इन्द् (जीतना)',
        culturalContext: 'वैदिक देवताओं के राजा, वज्र धारण करने वाले'
      }
    }
  },
  'siddhas': {
    term: 'siddhas',
    translations: {
      en: {
        translation: 'Siddhas',
        transliteration: 'siddhas',
        etymology: 'From Sanskrit sidh (to accomplish)',
        culturalContext: 'Accomplished beings with supernatural powers in Hindu and Jain traditions'
      },
      hi: {
        translation: 'सिद्ध',
        transliteration: 'siddhas',
        etymology: 'संस्कृत सिध् (सिद्ध करना) से',
        culturalContext: 'हिंदू और जैन परंपराओं में अलौकिक शक्तियों वाले सिद्ध प्राणी'
      }
    }
  },
  'buddha': {
    term: 'buddha',
    translations: {
      en: {
        translation: 'Buddha',
        transliteration: 'buddha',
        etymology: 'Sanskrit budh (to awaken)',
        culturalContext: 'Awakened one; founder of Buddhism, attained enlightenment in Jambudvipa'
      },
      hi: {
        translation: 'बुद्ध',
        transliteration: 'buddha',
        etymology: 'संस्कृत बुध् (जागना)',
        culturalContext: 'जागृत व्यक्ति; बौद्ध धर्म के संस्थापक, जम्बूद्वीप में ज्ञान प्राप्त किया'
      }
    }
  },
  'tirthankaras': {
    term: 'tirthankaras',
    translations: {
      en: {
        translation: 'Tirthankaras',
        transliteration: 'tīrthaṅkaras',
        etymology: 'Sanskrit tīrtha (ford) + kara (maker)',
        culturalContext: 'Ford-makers; 24 spiritual teachers in Jainism who showed path to liberation'
      },
      hi: {
        translation: 'तीर्थंकर',
        transliteration: 'tīrthaṅkaras',
        etymology: 'संस्कृत तीर्थ (घाट) + कर (बनाने वाला)',
        culturalContext: 'जैन धर्म में 24 आध्यात्मिक शिक्षक जिन्होंने मुक्ति का मार्ग दिखाया'
      }
    }
  },
  'videgha-mathava': {
    term: 'videgha-mathava',
    translations: {
      en: {
        translation: 'Videgha Mathava',
        transliteration: 'videha māthava',
        etymology: 'Sanskrit proper name',
        culturalContext: 'Legendary king who led Vedic expansion eastward, founder of Videha kingdom'
      },
      hi: {
        translation: 'विदेघ माथव',
        transliteration: 'videha māthava',
        etymology: 'संस्कृत व्यक्तिवाचक नाम',
        culturalContext: 'पौराणिक राजा जिन्होंने वैदिक विस्तार का नेतृत्व किया, विदेह राज्य के संस्थापक'
      }
    }
  },
  'dushyanta': {
    term: 'dushyanta',
    translations: {
      en: {
        translation: 'Dushyanta',
        transliteration: 'duṣyanta',
        etymology: 'Sanskrit proper name',
        culturalContext: 'King of Lunar Dynasty, father of Emperor Bharata through Shakuntala'
      },
      hi: {
        translation: 'दुष्यंत',
        transliteration: 'duṣyanta',
        etymology: 'संस्कृत व्यक्तिवाचक नाम',
        culturalContext: 'चंद्रवंश के राजा, शकुंतला के माध्यम से सम्राट भरत के पिता'
      }
    }
  },
  'shakuntala': {
    term: 'shakuntala',
    translations: {
      en: {
        translation: 'Shakuntala',
        transliteration: 'śakuntalā',
        etymology: 'Sanskrit śakunta (bird) + -la suffix',
        culturalContext: 'Celestial nymph, mother of Emperor Bharata, heroine of famous play'
      },
      hi: {
        translation: 'शकुंतला',
        transliteration: 'śakuntalā',
        etymology: 'संस्कृत शकुंत (पक्षी) + -ला प्रत्यय',
        culturalContext: 'अप्सरा, सम्राट भरत की माता, प्रसिद्ध नाटक की नायिका'
      }
    }
  },
  'sudas': {
    term: 'sudas',
    translations: {
      en: {
        translation: 'Sudas',
        transliteration: 'sudās',
        etymology: 'Sanskrit proper name, possibly "good servant"',
        culturalContext: 'Bharata king who won the Battle of Ten Kings in Rigveda'
      },
      hi: {
        translation: 'सुदास',
        transliteration: 'sudās',
        etymology: 'संस्कृत व्यक्तिवाचक नाम',
        culturalContext: 'भरत राजा जिन्होंने ऋग्वेद में दशराज्ञ युद्ध जीता'
      }
    }
  },
  // Rivers & Places
  'sarasvati': {
    term: 'sarasvati',
    translations: {
      en: {
        translation: 'Sarasvati',
        transliteration: 'sarasvatī',
        etymology: 'Sanskrit saras (pool) + vatī (possessing)',
        culturalContext: 'Sacred Vedic river, center of early Vedic civilization, now dried up'
      },
      hi: {
        translation: 'सरस्वती',
        transliteration: 'sarasvatī',
        etymology: 'संस्कृत सरस् (तालाब) + वती (युक्त)',
        culturalContext: 'पवित्र वैदिक नदी, प्रारंभिक वैदिक सभ्यता का केंद्र, अब सूख गई'
      }
    }
  },
  'tungabhadra': {
    term: 'tungabhadra',
    translations: {
      en: {
        translation: 'Tungabhadra',
        transliteration: 'tuṅgabhadrā',
        etymology: 'Sanskrit tuṅga (high) + bhadrā (auspicious)',
        culturalContext: 'Sacred river in Karnataka, tributary of Krishna, site of Vijayanagara'
      },
      hi: {
        translation: 'तुंगभद्रा',
        transliteration: 'tuṅgabhadrā',
        etymology: 'संस्कृत तुंग (ऊंचा) + भद्रा (मंगलकारी)',
        culturalContext: 'कर्नाटक में पवित्र नदी, कृष्णा की सहायक, विजयनगर का स्थल'
      }
    }
  },
  'tamraparni': {
    term: 'tamraparni',
    translations: {
      en: {
        translation: 'Tamraparni',
        transliteration: 'tāmraparṇī',
        etymology: 'Sanskrit tāmra (copper) + parṇī (leaf)',
        culturalContext: 'Ancient river of far south, flows from Malaya mountains in Tamil Nadu'
      },
      hi: {
        translation: 'ताम्रपर्णी',
        transliteration: 'tāmraparṇī',
        etymology: 'संस्कृत ताम्र (तांबा) + पर्णी (पत्ती)',
        culturalContext: 'सुदूर दक्षिण की प्राचीन नदी, तमिलनाडु में मलय पर्वत से बहती है'
      }
    }
  },
  'chambal': {
    term: 'chambal',
    translations: {
      en: {
        translation: 'Chambal',
        transliteration: 'carmaṇvatī',
        etymology: 'Ancient Charmanvati in Sanskrit',
        culturalContext: 'River flowing from Aravalli ranges, tributary of Yamuna'
      },
      hi: {
        translation: 'चंबल',
        transliteration: 'carmaṇvatī',
        etymology: 'संस्कृत में प्राचीन चर्मण्वती',
        culturalContext: 'अरावली पर्वतमाला से बहने वाली नदी, यमुना की सहायक'
      }
    }
  },
  'betwa': {
    term: 'betwa',
    translations: {
      en: {
        translation: 'Betwa',
        transliteration: 'vetravatī',
        etymology: 'Ancient Vetravati in Sanskrit',
        culturalContext: 'River in central India, tributary of Yamuna'
      },
      hi: {
        translation: 'बेतवा',
        transliteration: 'vetravatī',
        etymology: 'संस्कृत में प्राचीन वेत्रवती',
        culturalContext: 'मध्य भारत में नदी, यमुना की सहायक'
      }
    }
  },
  'son': {
    term: 'son',
    translations: {
      en: {
        translation: 'Son',
        transliteration: 'śoṇa',
        etymology: 'Sanskrit śoṇa (red)',
        culturalContext: 'Major tributary of Ganga, flows from Vindhya mountains'
      },
      hi: {
        translation: 'सोन',
        transliteration: 'śoṇa',
        etymology: 'संस्कृत शोण (लाल)',
        culturalContext: 'गंगा की प्रमुख सहायक, विंध्य पर्वत से बहती है'
      }
    }
  },
  'mahanadi': {
    term: 'mahanadi',
    translations: {
      en: {
        translation: 'Mahanadi',
        transliteration: 'mahānadī',
        etymology: 'Sanskrit mahā (great) + nadī (river)',
        culturalContext: 'Great river of Odisha, flows from central India to Bay of Bengal'
      },
      hi: {
        translation: 'महानदी',
        transliteration: 'mahānadī',
        etymology: 'संस्कृत महा (महान) + नदी (नदी)',
        culturalContext: 'ओडिशा की महान नदी, मध्य भारत से बंगाल की खाड़ी तक बहती है'
      }
    }
  },
  'tapi': {
    term: 'tapi',
    translations: {
      en: {
        translation: 'Tapi',
        transliteration: 'tāpī',
        etymology: 'Sanskrit tāpī, from daughter of Sun',
        culturalContext: 'River flowing west from Satpura mountains to Arabian Sea'
      },
      hi: {
        translation: 'ताप्ती',
        transliteration: 'tāpī',
        etymology: 'संस्कृत ताप्ती, सूर्य की पुत्री से',
        culturalContext: 'सतपुड़ा पर्वत से अरब सागर तक पश्चिम में बहने वाली नदी'
      }
    }
  },
  'bhima': {
    term: 'bhima',
    translations: {
      en: {
        translation: 'Bhima',
        transliteration: 'bhīma',
        etymology: 'Sanskrit bhīma (terrible/mighty)',
        culturalContext: 'Major tributary of Krishna river, flows through Maharashtra and Karnataka'
      },
      hi: {
        translation: 'भीमा',
        transliteration: 'bhīma',
        etymology: 'संस्कृत भीम (भयंकर/शक्तिशाली)',
        culturalContext: 'कृष्णा नदी की प्रमुख सहायक, महाराष्ट्र और कर्नाटक से होकर बहती है'
      }
    }
  },
  'sadanira': {
    term: 'sadanira',
    translations: {
      en: {
        translation: 'Sadanira',
        transliteration: 'sadānīrā',
        etymology: 'Sanskrit sadā (always) + nīrā (with water)',
        culturalContext: 'Ancient name for Gandak river, eastern frontier in Shatapatha Brahmana'
      },
      hi: {
        translation: 'सदानीरा',
        transliteration: 'sadānīrā',
        etymology: 'संस्कृत सदा (हमेशा) + नीरा (पानी के साथ)',
        culturalContext: 'गंडक नदी का प्राचीन नाम, शतपथ ब्राह्मण में पूर्वी सीमा'
      }
    }
  },
  // Peoples & Kingdoms
  'cholas': {
    term: 'cholas',
    translations: {
      en: {
        translation: 'Cholas',
        transliteration: 'cōḻas',
        etymology: 'Plural of Tamil cōḻa',
        culturalContext: 'Ancient Tamil people and dynasty known for maritime empire and temple architecture'
      },
      hi: {
        translation: 'चोल',
        transliteration: 'cōḻas',
        etymology: 'तमिल cōḻa का बहुवचन',
        culturalContext: 'कदल्सार पेररस्यु और कोविल कट्टिडक्कलैक्कु पुकझ्पेट्र पण्डैय तमिळ वम्सम्'
      }
    }
  },
  'kambojas': {
    term: 'kambojas',
    translations: {
      en: {
        translation: 'Kambojas',
        transliteration: 'kāmboja',
        etymology: 'Sanskrit proper name',
        culturalContext: 'Ancient northwest Indian people mentioned in Mahabharata and Puranas'
      },
      hi: {
        translation: 'कंबोज',
        transliteration: 'kāmboja',
        etymology: 'संस्कृत व्यक्तिवाचक नाम',
        culturalContext: 'महाभारत और पुराणों में उल्लिखित प्राचीन उत्तर पश्चिमी भारतीय लोग'
      }
    }
  },
  'kuru': {
    term: 'kuru',
    translations: {
      en: {
        translation: 'Kuru',
        transliteration: 'kuru',
        etymology: 'Sanskrit proper name',
        culturalContext: 'Kingdom formed by merger of Bharata and Puru tribes, site of Mahabharata war'
      },
      hi: {
        translation: 'कुरु',
        transliteration: 'kuru',
        etymology: 'संस्कृत व्यक्तिवाचक नाम',
        culturalContext: 'भरत और पुरु जनजातियों के विलय से बना राज्य, महाभारत युद्ध का स्थल'
      }
    }
  },
  'videha': {
    term: 'videha',
    translations: {
      en: {
        translation: 'Videha',
        transliteration: 'videha',
        etymology: 'Sanskrit vi (without) + deha (body)',
        culturalContext: 'Ancient kingdom east of Sadanira, founded by Videgha Mathava'
      },
      hi: {
        translation: 'विदेह',
        transliteration: 'videha',
        etymology: 'संस्कृत वि (बिना) + देह (शरीर)',
        culturalContext: 'सदानीरा के पूर्व में प्राचीन राज्य, विदेघ माथव द्वारा स्थापित'
      }
    }
  },
  // Identity & Cultural Terms
  'arya': {
    term: 'arya',
    translations: {
      en: {
        translation: 'Arya',
        transliteration: 'ārya',
        etymology: 'Sanskrit ār (to honor)',
        culturalContext: 'Noble one; cultural and ethical designation, not racial; adherent of Vedic dharma'
      },
      hi: {
        translation: 'आर्य',
        transliteration: 'ārya',
        etymology: 'संस्कृत आर् (सम्मान करना)',
        culturalContext: 'कुलीन व्यक्ति; सांस्कृतिक और नैतिक पदनाम, नस्लीय नहीं; वैदिक धर्म का अनुयायी'
      }
    }
  },
  'aryavarta': {
    term: 'aryavarta',
    translations: {
      en: {
        translation: 'Aryavarta',
        transliteration: 'āryāvarta',
        etymology: 'Sanskrit ārya (noble) + āvarta (abode)',
        culturalContext: 'Abode of noble ones; the cultural heartland of Vedic civilization'
      },
      hi: {
        translation: 'आर्यावर्त',
        transliteration: 'āryāvarta',
        etymology: 'संस्कृत आर्य (कुलीन) + आवर्त (निवास)',
        culturalContext: 'कुलीनों का निवास; वैदिक सभ्यता की सांस्कृतिक जन्मभूमि'
      }
    }
  },
  'dasyu': {
    term: 'dasyu',
    translations: {
      en: {
        translation: 'Dasyu',
        transliteration: 'dasyu',
        etymology: 'Sanskrit das (to destroy/plunder)',
        culturalContext: 'Non-Arya; one not following Vedic practices, cultural not racial designation'
      },
      hi: {
        translation: 'दस्यु',
        transliteration: 'dasyu',
        etymology: 'संस्कृत दस् (नष्ट करना/लूटना)',
        culturalContext: 'अनार्य; वैदिक प्रथाओं का पालन न करने वाला, सांस्कृतिक न कि नस्लीय पदनाम'
      }
    }
  },
  'varnas': {
    term: 'varnas',
    translations: {
      en: {
        translation: 'Varnas',
        transliteration: 'varṇas',
        etymology: 'Plural of Sanskrit varṇa (color/class)',
        culturalContext: 'Four social orders in Vedic society: Brahmin, Kshatriya, Vaishya, Shudra'
      },
      hi: {
        translation: 'वर्ण',
        transliteration: 'varṇas',
        etymology: 'संस्कृत वर्ण (रंग/वर्ग) का बहुवचन',
        culturalContext: 'वैदिक समाज में चार सामाजिक व्यवस्थाएं: ब्राह्मण, क्षत्रिय, वैश्य, शूद्र'
      }
    }
  },
  'brahmin': {
    term: 'brahmin',
    translations: {
      en: {
        translation: 'Brahmin',
        transliteration: 'brāhmaṇa',
        etymology: 'From Sanskrit brahman (sacred knowledge)',
        culturalContext: 'Priestly class, keepers of Vedic knowledge and ritual tradition'
      },
      hi: {
        translation: 'ब्राह्मण',
        transliteration: 'brāhmaṇa',
        etymology: 'संस्कृत ब्रह्मन् (पवित्र ज्ञान) से',
        culturalContext: 'पुरोहित वर्ग, वैदिक ज्ञान और अनुष्ठान परंपरा के रक्षक'
      }
    }
  },
  'kshatriya': {
    term: 'kshatriya',
    translations: {
      en: {
        translation: 'Kshatriya',
        transliteration: 'kṣatriya',
        etymology: 'From Sanskrit kṣatra (dominion/power)',
        culturalContext: 'Warrior and ruling class, protectors of dharma and territory'
      },
      hi: {
        translation: 'क्षत्रिय',
        transliteration: 'kṣatriya',
        etymology: 'संस्कृत क्षत्र (शासन/शक्ति) से',
        culturalContext: 'योद्धा और शासक वर्ग, धर्म और क्षेत्र के रक्षक'
      }
    }
  },
  'vaishya': {
    term: 'vaishya',
    translations: {
      en: {
        translation: 'Vaishya',
        transliteration: 'vaiśya',
        etymology: 'From Sanskrit viś (people/settlement)',
        culturalContext: 'Merchant and agricultural class, providers of economic prosperity'
      },
      hi: {
        translation: 'वैश्य',
        transliteration: 'vaiśya',
        etymology: 'संस्कृत विश् (लोग/बस्ती) से',
        culturalContext: 'व्यापारी और कृषि वर्ग, आर्थिक समृद्धि के प्रदाता'
      }
    }
  },
  // Dynasty & Rulership
  'chandravamsha': {
    term: 'chandravamsha',
    translations: {
      en: {
        translation: 'Chandravamsha',
        transliteration: 'candravamśa',
        etymology: 'Sanskrit candra (moon) + vaṃśa (lineage)',
        culturalContext: 'Lunar Dynasty, one of two great royal lineages, includes Bharata and Pandavas'
      },
      hi: {
        translation: 'चंद्रवंश',
        transliteration: 'candravamśa',
        etymology: 'संस्कृत चंद्र (चांद) + वंश (वंशावली)',
        culturalContext: 'चंद्रवंश, दो महान राजवंशों में से एक, भरत और पांडवों को शामिल करता है'
      }
    }
  },
  'chakravartin': {
    term: 'chakravartin',
    translations: {
      en: {
        translation: 'Chakravartin',
        transliteration: 'cakravartin',
        etymology: 'Sanskrit cakra (wheel) + vartin (one who turns)',
        culturalContext: 'Universal emperor whose chariot wheels roll unobstructed across the world'
      },
      hi: {
        translation: 'चक्रवर्ती',
        transliteration: 'cakravartin',
        etymology: 'संस्कृत चक्र (पहिया) + वर्तिन् (घुमाने वाला)',
        culturalContext: 'सार्वभौम सम्राट जिसके रथ के पहिये निर्बाध रूप से विश्व भर में घूमते हैं'
      }
    }
  },
  'digvijaya': {
    term: 'digvijaya',
    translations: {
      en: {
        translation: 'Digvijaya',
        transliteration: 'digvijaya',
        etymology: 'Sanskrit dig (direction) + vijaya (victory)',
        culturalContext: 'Universal conquest; campaign to conquer all directions and establish sovereignty'
      },
      hi: {
        translation: 'दिग्विजय',
        transliteration: 'digvijaya',
        etymology: 'संस्कृत दिग् (दिशा) + विजय (जीत)',
        culturalContext: 'सार्वभौमिक विजय; सभी दिशाओं को जीतने और संप्रभुता स्थापित करने का अभियान'
      }
    }
  },
  // Historical Concepts
  'dasarajna': {
    term: 'dasarajna',
    translations: {
      en: {
        translation: 'Dasarajna',
        transliteration: 'daśarājña',
        etymology: 'Sanskrit daśa (ten) + rājña (kings)',
        culturalContext: 'Battle of Ten Kings in Rigveda where Bharatas defeated confederation on Ravi river'
      },
      hi: {
        translation: 'दशराज्ञ',
        transliteration: 'daśarājña',
        etymology: 'संस्कृत दश (दस) + राज्ञ (राजा)',
        culturalContext: 'ऋग्वेद में दस राजाओं का युद्ध जहां भरतों ने रवि नदी पर संघ को हराया'
      }
    }
  },
  'sapta-sindhu': {
    term: 'sapta-sindhu',
    translations: {
      en: {
        translation: 'Sapta-Sindhu',
        transliteration: 'sapta sindhu',
        etymology: 'Sanskrit sapta (seven) + sindhu (river)',
        culturalContext: 'Land of seven rivers; the geographical heartland of the Rigveda in Punjab'
      },
      hi: {
        translation: 'सप्त-सिंधु',
        transliteration: 'sapta sindhu',
        etymology: 'संस्कृत सप्त (सात) + सिंधु (नदी)',
        culturalContext: 'सात नदियों की भूमि; पंजाब में ऋग्वेद की भौगोलिक जन्मभूमि'
      }
    }
  },
  'nadistuti-sukta': {
    term: 'nadistuti-sukta',
    translations: {
      en: {
        translation: 'Nadistuti Sukta',
        transliteration: 'nadīstuti sūkta',
        etymology: 'Sanskrit nadī (river) + stuti (praise) + sūkta (hymn)',
        culturalContext: 'Hymn in praise of rivers in Rigveda 10.75, geographic map of Vedic world'
      },
      hi: {
        translation: 'नदीस्तुति सूक्त',
        transliteration: 'nadīstuti sūkta',
        etymology: 'संस्कृत नदी (नदी) + स्तुति (स्तुति) + सूक्त (स्तोत्र)',
        culturalContext: 'ऋग्वेद 10.75 में नदियों की स्तुति का सूक्त, वैदिक दुनिया का भौगोलिक मानचित्र'
      }
    }
  },
  'mandala': {
    term: 'mandala',
    translations: {
      en: {
        translation: 'Mandala',
        transliteration: 'maṇḍala',
        etymology: 'Sanskrit maṇḍa (essence) + la (container)',
        culturalContext: 'Circular cosmic diagram; book division in Rigveda; ritual circle'
      },
      hi: {
        translation: 'मंडल',
        transliteration: 'maṇḍala',
        etymology: 'संस्कृत मंड (सार) + ल (पात्र)',
        culturalContext: 'वृत्ताकार ब्रह्मांडीय आरेख; ऋग्वेद में पुस्तक विभाजन; अनुष्ठान वृत्त'
      }
    }
  },
  // Cosmological & Philosophical
  'loka': {
    term: 'loka',
    translations: {
      en: {
        translation: 'Loka',
        transliteration: 'loka',
        etymology: 'Sanskrit lok (to see, perceive)',
        culturalContext: 'World or realm; universe in Jain cosmology'
      },
      hi: {
        translation: 'लोक',
        transliteration: 'loka',
        etymology: 'संस्कृत लोक् (देखना, अनुभव करना)',
        culturalContext: 'संसार या क्षेत्र; जैन ब्रह्मांड विज्ञान में ब्रह्मांड'
      }
    }
  },
  'yojanas': {
    term: 'yojanas',
    translations: {
      en: {
        translation: 'Yojanas',
        transliteration: 'yojanas',
        etymology: 'Plural of Sanskrit yojana (distance unit)',
        culturalContext: 'Ancient Indian unit of distance, approximately 8-9 miles'
      },
      hi: {
        translation: 'योजन',
        transliteration: 'yojanas',
        etymology: 'संस्कृत योजन (दूरी इकाई) का बहुवचन',
        culturalContext: 'प्राचीन भारतीय दूरी की इकाई, लगभग 8-9 मील'
      }
    }
  },
  'akasha-ganga': {
    term: 'akasha-ganga',
    translations: {
      en: {
        translation: 'Akasha Ganga',
        transliteration: 'ākāśa gaṅgā',
        etymology: 'Sanskrit ākāśa (sky) + gaṅgā (Ganga)',
        culturalContext: 'Celestial river descending from Vishnu, splits into four earthly rivers'
      },
      hi: {
        translation: 'आकाश गंगा',
        transliteration: 'ākāśa gaṅgā',
        etymology: 'संस्कृत आकाश (आकाश) + गंगा (गंगा)',
        culturalContext: 'विष्णु से उतरती हुई दिव्य नदी, चार पार्थिव नदियों में विभाजित होती है'
      }
    }
  },
  // Added capitalization variants
  'bharata': {
    term: 'bharata',
    translations: {
      en: {
        translation: 'Bharata',
        transliteration: 'bharata',
        etymology: 'Sanskrit bhṛ (to bear, maintain)',
        culturalContext: 'Vedic tribe; legendary emperor who united India; eponym of Bharatvarsha'
      },
      hi: {
        translation: 'भरत',
        transliteration: 'bharata',
        etymology: 'संस्कृत भृ (सहना, बनाए रखना)',
        culturalContext: 'वैदिक जनजाति; पौराणिक सम्राट जिन्होंने भारत को एकजुट किया; भारतवर्ष का नामकरण'
      }
    }
  },
  'puranas': {
    term: 'puranas',
    translations: {
      en: {
        translation: 'Puranas',
        transliteration: 'purāṇas',
        etymology: 'Plural of Sanskrit purāṇa (ancient)',
        culturalContext: 'Ancient Sanskrit texts containing mythology, cosmology, genealogies, and history'
      },
      hi: {
        translation: 'पुराण',
        transliteration: 'purāṇas',
        etymology: 'संस्कृत पुराण (प्राचीन) का बहुवचन',
        culturalContext: 'प्राचीन संस्कृत ग्रंथ जिनमें पौराणिक कथाएं, ब्रह्मांड विज्ञान, वंशावली और इतिहास है'
      }
    }
  },
  'himalayas': {
    term: 'himalayas',
    translations: {
      en: {
        translation: 'Himalayas',
        transliteration: 'himālaya',
        etymology: 'Sanskrit hima (snow) + ālaya (abode)',
        culturalContext: 'Abode of snow; worlds highest mountain range, northern boundary of Bharatvarsha'
      },
      hi: {
        translation: 'हिमालय',
        transliteration: 'himālaya',
        etymology: 'संस्कृत हिम (बर्फ) + आलय (निवास)',
        culturalContext: 'बर्फ का निवास; दुनिया की सबसे ऊंची पर्वत श्रृंखला, भारतवर्ष की उत्तरी सीमा'
      }
    }
  },
  // Mahabharata references
  'bhishma-parva': {
    term: 'sindhu',
    translations: {
      en: {
        translation: 'Sindhu (Indus River)',
        transliteration: 'sindhu',
        etymology: 'From Sanskrit sindhu (river, ocean)',
        culturalContext: 'The great river of the Sapta Sindhu region; gave its name to India'
      },
      hi: {
        translation: 'सिंधु',
        transliteration: 'sindhu',
        etymology: 'संस्कृत सिंधु (नदी, सागर)',
        culturalContext: 'सप्त सिंधु क्षेत्र की महान नदी; भारत को इसका नाम दिया'
      },
      ta: {
        translation: 'சிந்து',
        transliteration: 'sintu',
        etymology: 'சமஸ்கிருத sindhu (ஆறு, கடல்)',
        culturalContext: 'சப்த சிந்து பகுதியின் மாபெரும் ஆறு; இந்தியாவிற்கு பெயர் அளித்த நதி'
      }
    }
  },
  'rigvedic': {
    term: 'sutlej',
    translations: {
      en: {
        translation: 'Sutlej River',
        transliteration: 'śatadru',
        etymology: 'From Sanskrit śatadru (having hundred channels)',
        culturalContext: 'One of the five rivers of Punjab; ancient Śatadru of the Rigveda'
      },
      hi: {
        translation: 'सतलुज',
        transliteration: 'sutlej',
        etymology: 'संस्कृत शतद्रु (सौ धाराओं वाली)',
        culturalContext: 'पंजाब की पांच नदियों में से एक; ऋग्वेद की प्राचीन शतद्रु'
      }
    }
  },
  'jhelum': {
    term: 'jhelum',
    translations: {
      en: {
        translation: 'Jhelum River',
        transliteration: 'vitastā',
        etymology: 'Sanskrit Vitastā; Greek Hydaspes',
        culturalContext: 'River in Kashmir and Punjab; site of Alexander\'s battle with Porus'
      },
      hi: {
        translation: 'झेलम',
        transliteration: 'jhelum',
        etymology: 'संस्कृत वितस्ता; ग्रीक हाइडास्पीज़',
        culturalContext: 'कश्मीर और पंजाब की नदी; सिकंदर और पोरस के युद्ध का स्थल'
      }
    }
  },
  'narmada': {
    term: 'narmada',
    translations: {
      en: {
        translation: 'Narmada River',
        transliteration: 'narmadā',
        etymology: 'From Sanskrit narmadā (the delightful one)',
        culturalContext: 'Sacred river of central India; one of the seven holy rivers'
      },
      hi: {
        translation: 'नर्मदा',
        transliteration: 'narmadā',
        etymology: 'संस्कृत नर्मदा (आनंददायिनी)',
        culturalContext: 'मध्य भारत की पवित्र नदी; सात पवित्र नदियों में से एक'
      },
      ta: {
        translation: 'நர்மதை',
        transliteration: 'narmatai',
        etymology: 'சமஸ்கிருத narmadā (மகிழ்ச்சி அளிப்பவள்)',
        culturalContext: 'மத்திய இந்தியாவின் புனித நதி; ஏழு புனித நதிகளில் ஒன்று'
      }
    }
  },
  'krishna': {
    term: 'krishna',
    translations: {
      en: {
        translation: 'Krishna River',
        transliteration: 'kṛṣṇa',
        etymology: 'From Sanskrit kṛṣṇa (dark, black)',
        culturalContext: 'Major river of Deccan; flows through Karnataka, Maharashtra, and Andhra Pradesh'
      },
      hi: {
        translation: 'कृष्णा',
        transliteration: 'kṛṣṇā',
        etymology: 'संस्कृत कृष्ण (काला, गहरा)',
        culturalContext: 'दक्कन की प्रमुख नदी; कर्नाटक, महाराष्ट्र और आंध्र प्रदेश से बहती है'
      },
      ta: {
        translation: 'கிருஷ்ணா',
        transliteration: 'kiruṣṇā',
        etymology: 'சமஸ்கிருத kṛṣṇa (கருமை, இருள்)',
        culturalContext: 'தக்காணத்தின் முக்கிய நதி; கர்நாடகா, மகாராஷ்டிரா, ஆந்திரா வழியாக பாய்கிறது'
      }
    }
  },
  'chenab': {
    term: 'chenab',
    translations: {
      en: {
        translation: 'Chenab River',
        transliteration: 'asiknī',
        etymology: 'Sanskrit Asiknī (dark one)',
        culturalContext: 'One of the five rivers of Punjab; ancient Asiknī of the Rigveda'
      },
      hi: {
        translation: 'चिनाब',
        transliteration: 'chenab',
        etymology: 'संस्कृत असिक्नी (अंधेरी)',
        culturalContext: 'पंजाब की पांच नदियों में से एक; ऋग्वेद की प्राचीन असिक्नी'
      }
    }
  },
  'ravi': {
    term: 'ravi',
    translations: {
      en: {
        translation: 'Ravi River',
        transliteration: 'parūṣṇī',
        etymology: 'Sanskrit Parūṣṇī; modern Ravi from Sanskrit ravi (sun)',
        culturalContext: 'One of the five rivers of Punjab; site of the Battle of Ten Kings'
      },
      hi: {
        translation: 'रावी',
        transliteration: 'ravi',
        etymology: 'संस्कृत पारुष्णी; आधुनिक रावी संस्कृत रवि (सूर्य) से',
        culturalContext: 'पंजाब की पांच नदियों में से एक; दस राजाओं के युद्ध का स्थल'
      }
    }
  },
  'beas': {
    term: 'beas',
    translations: {
      en: {
        translation: 'Beas River',
        transliteration: 'vipāśā',
        etymology: 'Sanskrit Vipāśā (free from bonds)',
        culturalContext: 'One of the five rivers of Punjab; easternmost limit of Alexander\'s conquest'
      },
      hi: {
        translation: 'ब्यास',
        transliteration: 'beas',
        etymology: 'संस्कृत विपाशा (बंधनों से मुक्त)',
        culturalContext: 'पंजाब की पांच नदियों में से एक; सिकंदर की विजय की पूर्वी सीमा'
      }
    }
  },
  'sanjaya': {
    term: 'sanjaya',
    translations: {
      en: {
        translation: 'Sanjaya',
        transliteration: 'sañjaya',
        etymology: 'Sanskrit sañjaya (completely victorious)',
        culturalContext: 'Dhritarashtra\'s charioteer; narrator of the Kurukshetra battle in the Mahabharata'
      },
      hi: {
        translation: 'संजय',
        transliteration: 'sañjaya',
        etymology: 'संस्कृत संजय (पूर्णतः विजयी)',
        culturalContext: 'धृतराष्ट्र के सारथी; महाभारत में कुरुक्षेत्र युद्ध के वर्णनकर्ता'
      }
    }
  },
  'dhritarashtra': {
    term: 'dhritarashtra',
    translations: {
      en: {
        translation: 'Dhritarashtra',
        transliteration: 'dhṛtarāṣṭra',
        etymology: 'Sanskrit dhṛta (held) + rāṣṭra (kingdom)',
        culturalContext: 'Blind king of Hastinapura; father of the Kauravas in the Mahabharata'
      },
      hi: {
        translation: 'धृतराष्ट्र',
        transliteration: 'dhṛtarāṣṭra',
        etymology: 'संस्कृत धृत (धारण किया) + राष्ट्र (राज्य)',
        culturalContext: 'हस्तिनापुर के अंधे राजा; महाभारत में कौरवों के पिता'
      }
    }
  },
  'madhyadesa': {
    term: 'madhyadesa',
    translations: {
      en: {
        translation: 'Madhyadesa',
        transliteration: 'madhyadeśa',
        etymology: 'Sanskrit madhya (middle) + deśa (land)',
        culturalContext: 'The middle land; heartland of Vedic civilization between Himalayas and Vindhyas'
      },
      hi: {
        translation: 'मध्यदेश',
        transliteration: 'madhyadeśa',
        etymology: 'संस्कृत मध्य (बीच) + देश (भूमि)',
        culturalContext: 'मध्य भूमि; हिमालय और विंध्य के बीच वैदिक सभ्यता का केंद्र'
      }
    }
  },
  // Ancient peoples and kingdoms
  'panchalas': {
    term: 'panchalas',
    translations: {
      en: {
        translation: 'Panchalas',
        transliteration: 'pāñcālāḥ',
        etymology: 'Sanskrit pañca (five) + āla (tribes)',
        culturalContext: 'Ancient kingdom in north-central India; allies of the Pandavas in the Mahabharata'
      },
      hi: {
        translation: 'पांचाल',
        transliteration: 'pāñcālāḥ',
        etymology: 'संस्कृत पञ्च (पांच) + आल (कबीले)',
        culturalContext: 'उत्तर-मध्य भारत का प्राचीन राज्य; महाभारत में पांडवों के सहयोगी'
      }
    }
  },
  'surasenas': {
    term: 'surasenas',
    translations: {
      en: {
        translation: 'Surasenas',
        transliteration: 'śūrasenāḥ',
        etymology: 'Sanskrit śūra (brave) + senā (army)',
        culturalContext: 'Ancient kingdom around Mathura; associated with Krishna\'s lineage'
      },
      hi: {
        translation: 'शूरसेन',
        transliteration: 'śūrasenāḥ',
        etymology: 'संस्कृत शूर (वीर) + सेना (सेना)',
        culturalContext: 'मथुरा के आसपास प्राचीन राज्य; कृष्ण के वंश से जुड़ा'
      }
    }
  },
  'kalingas': {
    term: 'kalingas',
    translations: {
      en: {
        translation: 'Kalingas',
        transliteration: 'kaliṅgāḥ',
        etymology: 'Sanskrit kaliṅga (ancient kingdom)',
        culturalContext: 'Ancient kingdom in coastal Odisha; conquered by Ashoka in the famous Kalinga War'
      },
      hi: {
        translation: 'कलिंग',
        transliteration: 'kaliṅgāḥ',
        etymology: 'संस्कृत कलिंग (प्राचीन राज्य)',
        culturalContext: 'तटीय ओडिशा का प्राचीन राज्य; प्रसिद्ध कलिंग युद्ध में अशोक द्वारा जीता गया'
      },
      ta: {
        translation: 'கலிங்கர்கள்',
        transliteration: 'kaliṅkarkaḷ',
        etymology: 'சமஸ்கிருத kaliṅga (பண்டைய அரசு)',
        culturalContext: 'கடலோர ஒடிசாவின் பண்டைய அரசு; புகழ்பெற்ற கலிங்க போரில் அசோகரால் வென்றது'
      }
    }
  },
  'magadhas': {
    term: 'magadhas',
    translations: {
      en: {
        translation: 'Magadhas',
        transliteration: 'magadhāḥ',
        etymology: 'Sanskrit magadha (ancient kingdom)',
        culturalContext: 'Ancient kingdom in Bihar; birthplace of Buddhism and Jainism; Mauryan Empire\'s heartland'
      },
      hi: {
        translation: 'मगध',
        transliteration: 'magadhāḥ',
        etymology: 'संस्कृत मगध (प्राचीन राज्य)',
        culturalContext: 'बिहार का प्राचीन राज्य; बौद्ध धर्म और जैन धर्म का जन्मस्थान; मौर्य साम्राज्य का केंद्र'
      }
    }
  },
  'keralas': {
    term: 'keralas',
    translations: {
      en: {
        translation: 'Keralas',
        transliteration: 'keralāḥ',
        etymology: 'Sanskrit kerala (land of coconuts)',
        culturalContext: 'Ancient people of Kerala; known for spice trade and maritime connections'
      },
      hi: {
        translation: 'केरल',
        transliteration: 'keralāḥ',
        etymology: 'संस्कृत केरल (नारियल की भूमि)',
        culturalContext: 'केरल के प्राचीन लोग; मसाला व्यापार और समुद्री संबंधों के लिए जाने जाते हैं'
      },
      ta: {
        translation: 'கேரளர்கள்',
        transliteration: 'kēraḷarkaḷ',
        etymology: 'சமஸ்கிருத kerala (தேங்காயின் நிலம்)',
        culturalContext: 'கேரளாவின் பண்டைய மக்கள்; மசாலா வர்த்தகம் மற்றும் கடல்சார் தொடர்புகளுக்கு பெயர் பெற்றவர்கள்'
      }
    }
  },
  'aryas': {
    term: 'aryas',
    translations: {
      en: {
        translation: 'Aryas',
        transliteration: 'āryāḥ',
        etymology: 'Sanskrit ārya (noble, honorable)',
        culturalContext: 'Cultural designation for people following Vedic dharma; not a racial term'
      },
      hi: {
        translation: 'आर्य',
        transliteration: 'āryāḥ',
        etymology: 'संस्कृत आर्य (श्रेष्ठ, सम्मानीय)',
        culturalContext: 'वैदिक धर्म का पालन करने वाले लोगों का सांस्कृतिक पदनाम; नस्लीय शब्द नहीं'
      },
      ta: {
        translation: 'ஆரியர்கள்',
        transliteration: 'āriyarkaḷ',
        etymology: 'சமஸ்கிருத ārya (உன்னதமான, மதிப்புமிக்க)',
        culturalContext: 'வேத தர்மத்தை பின்பற்றும் மக்களின் கலாச்சார பெயர்; இன சொல் அல்ல'
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