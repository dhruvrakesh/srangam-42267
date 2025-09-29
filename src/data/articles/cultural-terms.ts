import { CulturalTerm } from '@/types/multilingual';

// Comprehensive database of dharmic and bharatiya terms with cultural context
import { enhancedCulturalTerms } from './enhanced-cultural-terms';
import { jambudvipaCulturalTerms } from './cultural-terms-jambudvipa';

export const culturalTermsDatabase: Record<string, CulturalTerm> = {
  ...enhancedCulturalTerms,
  ...jambudvipaCulturalTerms,
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