import { CulturalTerm } from '@/types/multilingual';

/**
 * Cultural Terms Database: Stone Purāṇa (Geo-Heritage)
 * 
 * Specialized terminology for "The Stone Purāṇa: Deep Time, Living Memory, and India's Geo-Heritage"
 * Covers geological, paleontological, and geomythological terms with Sanskrit/Dharmic analogies.
 */

export const stonePuranaCulturalTerms: Record<string, CulturalTerm> = {
  // ============================================================
  // A. Geological Terms with Sanskrit Analogies
  // ============================================================
  
  'pralaya': {
    term: 'pralaya',
    translations: {
      en: {
        translation: 'Pralaya',
        transliteration: 'pralaya',
        etymology: 'Sanskrit: pra (forth) + laya (dissolution)',
        culturalContext: 'In Purāṇic cosmology, pralaya denotes cosmic dissolution at the end of a kalpa or yuga cycle. In geological writing, the term serves as a cultural analogy for mass extinction events—catastrophic boundaries where biological and environmental systems undergo systemic collapse. The Permian-Triassic extinction (~252 Ma) is sometimes metaphorically termed a pralaya-like event, signaling not identity but interpretive resonance between textual tradition and stratigraphic record.'
      },
      hi: {
        translation: 'प्रलय',
        transliteration: 'pralaya',
        etymology: 'संस्कृत: प्र (आगे) + लय (विघटन)',
        culturalContext: 'पुराणिक ब्रह्माण्ड विज्ञान में, प्रलय कल्प या युग चक्र के अंत में ब्रह्माण्डीय विघटन को दर्शाता है। भूवैज्ञानिक लेखन में, यह शब्द सामूहिक विलुप्ति घटनाओं के लिए एक सांस्कृतिक सादृश्य के रूप में कार्य करता है—विनाशकारी सीमाएं जहां जैविक और पर्यावरणीय प्रणालियां व्यापक पतन से गुजरती हैं।'
      },
      ta: {
        translation: 'பிரளயம்',
        transliteration: 'pralayam',
        etymology: 'சமஸ்கிருதம்: ப்ர (முன்னோக்கி) + லய (கரைதல்)',
        culturalContext: 'புராண அண்டவியலில், பிரளயம் என்பது கல்ப அல்லது யுக சுழற்சியின் முடிவில் அண்ட கரைதலைக் குறிக்கிறது. புவியியல் எழுத்தில், இந்த சொல் வெகுஜன அழிவு நிகழ்வுகளுக்கான கலாச்சார ஒப்புமையாக செயல்படுகிறது.'
      }
    }
  },

  'kalpa': {
    term: 'kalpa',
    translations: {
      en: {
        translation: 'Kalpa',
        transliteration: 'kalpa',
        etymology: 'Sanskrit: fixed order, eon',
        culturalContext: 'A kalpa in Vedic-Purāṇic time is a day of Brahmā (4.32 billion years), approximating the age of Earth itself. Used metaphorically in geological discourse to denote vast temporal scales—"deep time"—that exceed human intuition. The term bridges textual cosmology and geochronology, though precision lies with radiometric dating, not śāstra.'
      },
      hi: {
        translation: 'कल्प',
        transliteration: 'kalpa',
        etymology: 'संस्कृत: निर्धारित क्रम, युग',
        culturalContext: 'वैदिक-पौराणिक समय में एक कल्प ब्रह्मा का एक दिन है (4.32 अरब वर्ष), जो पृथ्वी की आयु के लगभग बराबर है। भूवैज्ञानिक विमर्श में विशाल समय पैमानों—"गहन समय"—को दर्शाने के लिए रूपक के रूप में उपयोग किया जाता है।'
      },
      ta: {
        translation: 'கல்பம்',
        transliteration: 'kalpam',
        etymology: 'சமஸ்கிருதம்: நிலையான வரிசை, யுகம்',
        culturalContext: 'வேத-புராண காலத்தில் ஒரு கல்பம் என்பது பிரம்மாவின் ஒரு நாள் (4.32 பில்லியன் ஆண்டுகள்), இது பூமியின் வயதை தோராயமாகக் குறிக்கிறது.'
      }
    }
  },

  'hiranyagarbha': {
    term: 'hiranyagarbha',
    translations: {
      en: {
        translation: 'Hiraṇyagarbha',
        transliteration: 'hiraṇyagarbha',
        etymology: 'Sanskrit: hiraṇya (golden) + garbha (womb/egg)',
        culturalContext: 'In Ṛgvedic hymns (RV 10.121), Hiraṇyagarbha is the "golden embryo" or cosmic egg from which creation emerges. In geological metaphor, it evokes Gondwana—the ancient supercontinent that cradled India's Permian forests, coal seams, and early reptilian life. The analogy is poetic, not causal; Gondwana assembly and breakup follow plate tectonics, not cosmogonic myth.'
      },
      hi: {
        translation: 'हिरण्यगर्भ',
        transliteration: 'hiraṇyagarbha',
        etymology: 'संस्कृत: हिरण्य (सुनहरा) + गर्भ (गर्भ/अंडा)',
        culturalContext: 'ऋग्वेदिक भजनों में (ऋ. 10.121), हिरण्यगर्भ "स्वर्णिम भ्रूण" या ब्रह्माण्डीय अंडा है जिससे सृष्टि उत्पन्न होती है। भूवैज्ञानिक रूपक में, यह गोंडवाना को दर्शाता है—वह प्राचीन महाद्वीप जिसने भारत के पर्मियन वनों को पालन किया।'
      },
      ta: {
        translation: 'ஹிரண்யகர்பா',
        transliteration: 'hiraṇyagarbha',
        etymology: 'சமஸ்கிருதம்: ஹிரண்ய (தங்கம்) + கர்பா (கருப்பை/முட்டை)',
        culturalContext: 'ரிக்வேத துதிகளில் (ரிவி 10.121), ஹிரண்யகர்பா என்பது "தங்க கரு" அல்லது அண்ட முட்டை ஆகும், அதிலிருந்து படைப்பு தோன்றுகிறது.'
      }
    }
  },

  'yuga': {
    term: 'yuga',
    translations: {
      en: {
        translation: 'Yuga',
        transliteration: 'yuga',
        etymology: 'Sanskrit: age, epoch',
        culturalContext: 'In Purāṇic chronology, a yuga is a cosmic age (Satya, Tretā, Dvāpara, Kali). Geologically, "yuga" is employed metaphorically to denote major temporal divisions—eras, periods, epochs—without implying cyclical moral decline. The term aids mnemonic framing of the stratigraphic column for lay audiences familiar with traditional cosmologies.'
      },
      hi: {
        translation: 'युग',
        transliteration: 'yuga',
        etymology: 'संस्कृत: युग, काल',
        culturalContext: 'पौराणिक कालक्रम में, एक युग एक ब्रह्माण्डीय युग है (सत्य, त्रेता, द्वापर, कलि)। भूवैज्ञानिक रूप से, "युग" प्रमुख अस्थायी विभाजनों—युग, अवधि, काल—को दर्शाने के लिए रूपक रूप से नियोजित किया जाता है।'
      },
      ta: {
        translation: 'யுகம்',
        transliteration: 'yugam',
        etymology: 'சமஸ்கிருதம்: வயது, காலம்',
        culturalContext: 'புராண காலவரிசையில், ஒரு யுகம் என்பது ஒரு அண்ட வயது (சத்ய, திரேதா, துவாபர, கலி). புவியியல் ரீதியாக, "யுகம்" முக்கிய நேர பிரிவுகளைக் குறிக்க உருவகமாகப் பயன்படுத்தப்படுகிறது.'
      }
    }
  },

  // ============================================================
  // B. Fossil & Geomythology Terms
  // ============================================================

  'saligrama': {
    term: 'saligrama',
    translations: {
      en: {
        translation: 'Śāligrāma',
        transliteration: 'śāligrāma',
        etymology: 'Sanskrit: śāla (a tree) + grāma (village); or śālā (water) + grāma',
        culturalContext: 'Śāligrāma stones are fossilized ammonites (Jurassic-Cretaceous marine cephalopods) from the Gandak River catchment in the Himalaya. Revered in Vaiṣṇava traditions as self-manifested forms of Viṣṇu, the spiral suture pattern is identified as the Sudarśana Chakra. This sacred geography preserved countless specimens within ritual economies long before formal paleontology. The stones are scientifically confirmed as ammonite fossils, while their theological status remains a matter of faith and community practice.'
      },
      hi: {
        translation: 'शालिग्राम',
        transliteration: 'śāligrāma',
        etymology: 'संस्कृत: शाल (एक पेड़) + ग्राम (गाँव); या शाला (पानी) + ग्राम',
        culturalContext: 'शालिग्राम पत्थर हिमालय में गंडक नदी से प्राप्त जीवाश्म अमोनाइट (जुरासिक-क्रेटेशियस समुद्री सेफलोपोड) हैं। वैष्णव परंपराओं में विष्णु के स्व-प्रकट रूपों के रूप में पूजनीय, सर्पिल सीवन पैटर्न को सुदर्शन चक्र के रूप में पहचाना जाता है।'
      },
      ta: {
        translation: 'சாளக்கிராமம்',
        transliteration: 'śāligrāmam',
        etymology: 'சமஸ்கிருதம்: ஶால (ஒரு மரம்) + கிராம (கிராமம்)',
        culturalContext: 'சாளக்கிராம கற்கள் இமயமலையில் கண்டக் நதி படுகையிலிருந்து வரும் புதைபடிவ அம்மோனைட்டுகள் (ஜுராசிக்-கிரெடேசியஸ் கடல் செபலோபாட்கள்) ஆகும். வைஷ்ணவ பாரம்பரியங்களில் விஷ்ணுவின் சுய-வெளிப்பாட்டு வடிவங்களாக வணங்கப்படுகின்றன.'
      }
    }
  },

  'sudarsana-chakra': {
    term: 'sudarsana-chakra',
    translations: {
      en: {
        translation: 'Sudarśana Chakra',
        transliteration: 'sudarśana cakra',
        etymology: 'Sanskrit: su (good) + darśana (vision) + cakra (wheel/disc)',
        culturalContext: 'The Sudarśana Chakra is Viṣṇu's discus weapon in Hindu iconography. In geomythology, the spiral morphology of ammonite fossils—particularly Śāligrāma stones—is interpreted as the imprint of this divine disc. The resemblance is morphological: ammonite suture patterns form logarithmic spirals. This cultural reading protected and circulated fossils for millennia within devotional networks.'
      },
      hi: {
        translation: 'सुदर्शन चक्र',
        transliteration: 'sudarśana cakra',
        etymology: 'संस्कृत: सु (अच्छा) + दर्शन (दृष्टि) + चक्र (पहिया/चक्र)',
        culturalContext: 'सुदर्शन चक्र हिंदू प्रतिमा विज्ञान में विष्णु का चक्र हथियार है। भू-पुराण में, अमोनाइट जीवाश्मों की सर्पिल आकृति—विशेष रूप से शालिग्राम पत्थर—को इस दिव्य चक्र के निशान के रूप में व्याख्या किया जाता है।'
      },
      ta: {
        translation: 'சுதர்சன சக்கரம்',
        transliteration: 'sudarśana cakkaram',
        etymology: 'சமஸ்கிருதம்: ஸு (நல்ல) + தர்சன (பார்வை) + சக்ர (சக்கரம்/வட்டு)',
        culturalContext: 'சுதர்சன சக்கரம் இந்து சின்னவியலில் விஷ்ணுவின் வட்டு ஆயுதம் ஆகும். புவி-தொன்மவியலில், அம்மோனைட் புதைபடிவங்களின் சுழல் வடிவம்—குறிப்பாக சாளக்கிராம கற்கள்—இந்த தெய்வீக வட்டின் அடையாளமாக விளக்கப்படுகிறது.'
      }
    }
  },

  'kakar-bhairav': {
    term: 'kakar-bhairav',
    translations: {
      en: {
        translation: 'Kākar Bhairav',
        transliteration: 'kākar bhairava',
        etymology: 'Hindi/regional: kākar (egg-like stone) + Bhairava (fierce form of Śiva)',
        culturalContext: 'In villages around Dhar district (Madhya Pradesh), smooth spherical stones venerated as Kākar Bhairav or Bhilat Baba were scientifically identified as titanosaur eggs from the Late Cretaceous Lameta Formation. Ritual respect and shrine placement prevented breakage and casual trade, making local communities inadvertent custodians of paleontological heritage. This is a textbook case of geomythology: culturally assigned meanings producing real conservation outcomes decades before formal legal protection.'
      },
      hi: {
        translation: 'काकर भैरव',
        transliteration: 'kākar bhairava',
        etymology: 'हिंदी/क्षेत्रीय: काकर (अंडे जैसा पत्थर) + भैरव (शिव का भयंकर रूप)',
        culturalContext: 'धार जिले (मध्य प्रदेश) के आसपास के गांवों में, काकर भैरव या भिलात बाबा के रूप में पूजे जाने वाले चिकने गोलाकार पत्थरों को वैज्ञानिक रूप से लेट क्रेटेशियस लामेटा संरचना से टाइटानोसॉर अंडे के रूप में पहचाना गया। अनुष्ठानिक सम्मान ने टूटने और आकस्मिक व्यापार को रोका, जिससे स्थानीय समुदाय जीवाश्म विज्ञान विरासत के अनजाने संरक्षक बन गए।'
      },
      ta: {
        translation: 'காகர் பைரவர்',
        transliteration: 'kākar bhairavar',
        etymology: 'இந்தி/பிராந்திய: காகர் (முட்டை போன்ற கல்) + பைரவர் (சிவனின் கடுமையான வடிவம்)',
        culturalContext: 'தார் மாவட்டத்தைச் (மத்திய பிரதேசம்) சுற்றியுள்ள கிராமங்களில், காகர் பைரவர் அல்லது பிலாத் பாபா என வணங்கப்படும் மென்மையான கோள கற்கள் விஞ்ஞான ரீதியாக லேட் க்ரெடேசியஸ் லமேட்டா உருவாக்கத்திலிருந்து டைட்டானோசர் முட்டைகளாக அடையாளம் காணப்பட்டன.'
      }
    }
  },

  'bhilat-baba': {
    term: 'bhilat-baba',
    translations: {
      en: {
        translation: 'Bhilāt Bābā',
        transliteration: 'bhilāt bābā',
        etymology: 'Regional (Malwa): bhilāt (possibly related to Bhil tribal etymology) + bābā (revered elder/deity)',
        culturalContext: 'An alternate folk name for the spherical stones (titanosaur eggs) venerated in rural Madhya Pradesh. Bhilāt Bābā shrines mark nesting sites of the Late Cretaceous, with communities treating these "stones" as sacred objects requiring protection. The practice exemplifies how indigenous and rural epistemologies can align with conservation imperatives, even without formal scientific knowledge.'
      },
      hi: {
        translation: 'भिलात बाबा',
        transliteration: 'bhilāt bābā',
        etymology: 'क्षेत्रीय (मालवा): भिलात (संभवतः भील जनजातीय व्युत्पत्ति से संबंधित) + बाबा (सम्मानित बुजुर्ग/देवता)',
        culturalContext: 'ग्रामीण मध्य प्रदेश में पूजे जाने वाले गोलाकार पत्थरों (टाइटानोसॉर अंडे) के लिए एक वैकल्पिक लोक नाम। भिलात बाबा मंदिर लेट क्रेटेशियस के घोंसले के स्थानों को चिह्नित करते हैं, जहां समुदाय इन "पत्थरों" को पवित्र वस्तुओं के रूप में मानते हैं जिन्हें संरक्षण की आवश्यकता होती है।'
      },
      ta: {
        translation: 'பிலாத் பாபா',
        transliteration: 'bhilāt bābā',
        etymology: 'பிராந்திய (மால்வா): பிலாத் (பில் பழங்குடி சொற்பிறப்பியலுடன் தொடர்புடையது) + பாபா (மதிக்கப்படும் மூத்தவர்/தெய்வம்)',
        culturalContext: 'கிராமப்புற மத்திய பிரதேசத்தில் வணங்கப்படும் கோள கற்களுக்கு (டைட்டானோசர் முட்டைகள்) மாற்று நாட்டுப்புற பெயர். பிலாத் பாபா ஆலயங்கள் லேட் க்ரெடேசியஸின் கூடு கட்டும் தளங்களைக் குறிக்கின்றன.'
      }
    }
  },

  // ============================================================
  // C. Sacred Geography
  // ============================================================

  'narmada-mai': {
    term: 'narmada-mai',
    translations: {
      en: {
        translation: 'Narmadā Māī',
        transliteration: 'Narmadā Māī',
        etymology: 'Sanskrit Narmadā (the river) + Hindi Māī (Mother)',
        culturalContext: 'The Narmadā River, revered as a goddess and "Mother" in Hindu tradition, flows through central India. On 5 December 1982, a Middle Pleistocene hominin calvarium—India\'s oldest known human ancestor fossil—was recovered near Hathnora on the Narmadā\'s banks. The convergence is poetic: a river worshipped as life-giver yielding the skull of an ancient "mother." Geologically, the Narmadā valley is a major tectonic lineament with rich Quaternary deposits; spiritually, it is a tirtha of immense significance. The fossil and the faith coexist in the same landscape.'
      },
      hi: {
        translation: 'नर्मदा माई',
        transliteration: 'Narmadā Māī',
        etymology: 'संस्कृत नर्मदा (नदी) + हिंदी माई (माता)',
        culturalContext: 'नर्मदा नदी, जिसे हिंदू परंपरा में देवी और "माता" के रूप में पूजा जाता है, मध्य भारत से होकर बहती है। 5 दिसंबर 1982 को, नर्मदा के किनारे हथनोरा के पास एक मध्य प्लीस्टोसीन मानव खोपड़ी—भारत का सबसे पुराना ज्ञात मानव पूर्वज जीवाश्म—बरामद किया गया था। अभिसरण काव्यात्मक है: एक प्राचीन "माता" की खोपड़ी देने वाली जीवन-दाता के रूप में पूजी जाने वाली नदी।'
      },
      ta: {
        translation: 'நர்மதா மாய்',
        transliteration: 'Narmadā Māī',
        etymology: 'சமஸ்கிருதம் நர்மதா (நதி) + இந்தி மாய் (தாய்)',
        culturalContext: 'நர்மதா நதி, இந்து பாரம்பரியத்தில் தேவி மற்றும் "தாய்" என வணங்கப்படுகிறது, மத்திய இந்தியா வழியாக பாய்கிறது. 5 டிசம்பர் 1982 அன்று, நர்மதாவின் கரையில் ஹத்னோரா அருகே ஒரு நடுத்தர ப்ளைஸ்டோசீன் மனித மண்டை ஓடு—இந்தியாவின் பழமையான மனித மூதாதையர் புதைபடிவம்—மீட்கப்பட்டது.'
      }
    }
  },

  'satadru': {
    term: 'satadru',
    translations: {
      en: {
        translation: 'Śatadru',
        transliteration: 'Śatadru',
        etymology: 'Sanskrit: śata (hundred) + dru (run/stream); "hundred-channeled"',
        culturalContext: 'The Sutlej River, known in Sanskrit as Śatadru. Detrital zircon provenance and fluvial geomorphology indicate that the Sutlej once flowed into the Ghaggar-Hakra paleochannel system before avulsing to the Indus during the late Pleistocene-Holocene transition. This rerouting transformed a major perennial artery into a seasonal one, with profound implications for Bronze Age settlements. The name evokes multiplicity and dynamism—apt for a river whose course history is one of dramatic shifts.'
      },
      hi: {
        translation: 'शतद्रु',
        transliteration: 'Śatadru',
        etymology: 'संस्कृत: शत (सौ) + द्रु (दौड़ना/धारा); "सौ-धाराओं वाला"',
        culturalContext: 'सतलुज नदी, जिसे संस्कृत में शतद्रु के नाम से जाना जाता है। डेट्रिटल जिरकोन उत्पत्ति और नदी भू-आकृति विज्ञान संकेत करते हैं कि सतलुज कभी घग्गर-हकरा पुरा-चैनल प्रणाली में बहती थी, फिर प्लीस्टोसीन-होलोसीन संक्रमण के दौरान सिंधु की ओर मुड़ गई।'
      },
      ta: {
        translation: 'சதத்ரு',
        transliteration: 'Śatadru',
        etymology: 'சமஸ்கிருதம்: சத (நூறு) + த்ரு (ஓடு/நீரோடை); "நூறு-கால்வாய்கள்"',
        culturalContext: 'சட்லெஜ் நதி, சமஸ்கிருதத்தில் சதத்ரு என அழைக்கப்படுகிறது. டெட்ரிட்டல் சிர்கான் தோற்றம் மற்றும் நதி புவியியல் வடிவியல் ப்ளைஸ்டோசீன்-ஹோலோசீன் மாற்றத்தின் போது சட்லெஜ் ஒரு காலத்தில் கக்கர்-ஹக்ரா பழங்கால கால்வாய் அமைப்பில் பாய்ந்தது என்று சுட்டிக்காட்டுகின்றன.'
      }
    }
  },

  'rama-setu': {
    term: 'rama-setu',
    translations: {
      en: {
        translation: 'Rāma Setu',
        transliteration: 'Rāma Setu',
        etymology: 'Sanskrit: Rāma (hero of the Rāmāyaṇa) + setu (bridge)',
        culturalContext: 'Rāma Setu, also known as Adam\'s Bridge, is a ~50 km chain of natural shoals, sand bars, and coral formations between Rāmeśvaram (India) and Mannar (Sri Lanka). Geologically, it sits on a shallow limestone ridge that was periodically emergent during lower Pleistocene sea levels. Scientific and official assessments characterize it as a natural formation. In devotional geography and oral tradition, it is venerated as the engineered causeway built by Rāma\'s army to reach Laṅkā. Both readings—geological and theological—coexist. A robust stewardship regime protects the formation and the pilgrimage without conflating faith and stratigraphy.'
      },
      hi: {
        translation: 'राम सेतु',
        transliteration: 'Rāma Setu',
        etymology: 'संस्कृत: राम (रामायण के नायक) + सेतु (पुल)',
        culturalContext: 'राम सेतु, जिसे एडम ब्रिज के नाम से भी जाना जाता है, रामेश्वरम (भारत) और मन्नार (श्रीलंका) के बीच प्राकृतिक उथले, रेत की पट्टियों और प्रवाल संरचनाओं की ~50 किमी श्रृंखला है। भूवैज्ञानिक रूप से, यह एक उथली चूना पत्थर की चट्टान पर स्थित है जो प्लीस्टोसीन के निचले समुद्र स्तरों के दौरान समय-समय पर उभरी थी। वैज्ञानिक और आधिकारिक मूल्यांकन इसे एक प्राकृतिक संरचना के रूप में चिह्नित करते हैं।'
      },
      ta: {
        translation: 'ராம சேது',
        transliteration: 'Rāma Sētu',
        etymology: 'சமஸ்கிருதம்: ராம (ராமாயணத்தின் நாயகன்) + சேது (பாலம்)',
        culturalContext: 'ராம சேது, ஆடம்ஸ் பாலம் என்றும் அழைக்கப்படுகிறது, இது ராமேஸ்வரம் (இந்தியா) மற்றும் மன்னார் (இலங்கை) இடையே உள்ள இயற்கையான ஆழமற்ற நீர், மணல் கரைகள் மற்றும் பவள உருவாக்கங்களின் ~50 கிமீ சங்கிலி ஆகும். புவியியல் ரீதியாக, இது ஒரு ஆழமற்ற சுண்ணாம்பு முகட்டில் அமைந்துள்ளது.'
      }
    }
  },

  'setubandha': {
    term: 'setubandha',
    translations: {
      en: {
        translation: 'Setubandha',
        transliteration: 'setubandha',
        etymology: 'Sanskrit: setu (bridge) + bandha (binding/construction)',
        culturalContext: 'The act of bridge construction in the Rāmāyaṇa, where stones were cast into the sea to create a causeway to Laṅkā. The term is used in Vālmīki\'s text and later retellings. Geomythologically, the narrative may encode cultural memory of navigating or engineering across the Palk Strait during periods of lower sea level, though direct archaeological evidence for Bronze Age construction is absent. The story remains powerful in pilgrimage and identity, independent of historical verification.'
      },
      hi: {
        translation: 'सेतुबन्ध',
        transliteration: 'setubandha',
        etymology: 'संस्कृत: सेतु (पुल) + बन्ध (बांधना/निर्माण)',
        culturalContext: 'रामायण में पुल निर्माण का कार्य, जहां लंका तक पहुंचने के लिए समुद्र में पत्थर डाले गए थे। यह शब्द वाल्मीकि के पाठ और बाद के पुनर्कथनों में प्रयोग किया गया है। भू-पौराणिक रूप से, कथा निचले समुद्र स्तर की अवधि के दौरान पाल्क जलडमरूमध्य को पार करने की सांस्कृतिक स्मृति को एन्कोड कर सकती है।'
      },
      ta: {
        translation: 'சேதுபந்தம்',
        transliteration: 'setubandham',
        etymology: 'சமஸ்கிருதம்: சேது (பாலம்) + பந்த (கட்டுதல்/கட்டுமானம்)',
        culturalContext: 'ராமாயணத்தில் பாலம் கட்டும் செயல், அங்கு இலங்கைக்கு ஒரு பாதையை உருவாக்க கடலில் கற்கள் போடப்பட்டன. இந்த சொல் வால்மீகியின் உரையிலும் பிற்கால மறுபரிசீலனைகளிலும் பயன்படுத்தப்படுகிறது.'
      }
    }
  },

  'dwaraka': {
    term: 'dwaraka',
    translations: {
      en: {
        translation: 'Dvārakā',
        transliteration: 'Dvārakā',
        etymology: 'Sanskrit: dvāra (door/gate) + suffix',
        culturalContext: 'In the Mahābhārata and Purāṇas, Dvārakā is Kṛṣṇa\'s fabled western coastal city, said to have been submerged by the sea after his departure. Modern coastal and marine archaeology around Dwarka (Gujarat) has identified submerged structural remains and artifacts spanning several periods, though their identification with the textual Dvārakā remains contested. Sea-level changes, coastal subsidence, and tectonic activity in the region are well-documented. The site exemplifies the interplay between textual tradition, archaeological stratigraphy, and coastal geomorphology.'
      },
      hi: {
        translation: 'द्वारका',
        transliteration: 'Dvārakā',
        etymology: 'संस्कृत: द्वार (दरवाजा/द्वार) + प्रत्यय',
        culturalContext: 'महाभारत और पुराणों में, द्वारका कृष्ण का पौराणिक पश्चिमी तटीय शहर है, जिसके बारे में कहा जाता है कि उनके जाने के बाद समुद्र द्वारा जलमग्न हो गया था। द्वारका (गुजरात) के आसपास आधुनिक तटीय और समुद्री पुरातत्व ने कई अवधियों में फैले जलमग्न संरचनात्मक अवशेषों और कलाकृतियों की पहचान की है।'
      },
      ta: {
        translation: 'துவாரகா',
        transliteration: 'Dvārakā',
        etymology: 'சமஸ்கிருதம்: த்வார (கதவு/வாசல்) + பின்னொட்டு',
        culturalContext: 'மகாபாரதம் மற்றும் புராணங்களில், துவாரகா கிருஷ்ணரின் புகழ்பெற்ற மேற்கு கடலோர நகரம், அவர் புறப்பட்ட பிறகு கடலால் மூழ்கடிக்கப்பட்டதாகக் கூறப்படுகிறது. துவாரகா (குஜராத்) சுற்றியுள்ள நவீன கடலோர மற்றும் கடல் தொல்லியல் பல காலகட்டங்களில் பரவியுள்ள மூழ்கிய கட்டமைப்பு எச்சங்களையும் கலைப்பொருட்களையும் அடையாளம் கண்டுள்ளது.'
      }
    }
  },

  'puhar': {
    term: 'puhar',
    translations: {
      en: {
        translation: 'Puhār / Kāvēri-Pumpattinam',
        transliteration: 'Puhār / Kāvēri-Pumpattinam',
        etymology: 'Tamil: Puhār (ancient port name); Kāvēri-Pumpattinam (new town on Kaveri)',
        culturalContext: 'Puhār (also Kāvēripūmpattinam or Poompuhar) was a major Sangam-era port at the mouth of the Kaveri River. Tamil literature (e.g., Pattināppālai, Silappatikāram) describes its prosperity and eventual submersion by floods and coastal erosion. Archaeological and sedimentological studies document coastal progradation, monsoon flood events, and possible seismic activity. The literary and geological records converge: a thriving port compromised by natural forces—delta dynamics, sea-level oscillations, and episodic inundations.'
      },
      hi: {
        translation: 'पुहार / कावेरी-पुम्पट्टिनम',
        transliteration: 'Puhār / Kāvērī-Pumpaṭṭinam',
        etymology: 'तमिल: पुहार (प्राचीन बंदरगाह नाम); कावेरी-पुम्पट्टिनम (कावेरी पर नया शहर)',
        culturalContext: 'पुहार (कावेरीपूम्पट्टिनम या पूम्पुहार भी) कावेरी नदी के मुहाने पर एक प्रमुख संगम युग का बंदरगाह था। तमिल साहित्य (जैसे, पट्टिनाप्पालै, सिलप्पतिकारम) इसकी समृद्धि और बाढ़ और तटीय कटाव द्वारा अंतिम जलमग्नता का वर्णन करता है।'
      },
      ta: {
        translation: 'பூம்புகார் / காவிரிப்பூம்பட்டினம்',
        transliteration: 'Pūmpukār / Kāvirippūmpaṭṭiṉam',
        etymology: 'தமிழ்: பூகார் (பண்டைய துறைமுக பெயர்); காவிரிப்பூம்பட்டினம் (காவிரியில் புதிய நகரம்)',
        culturalContext: 'பூம்புகார் (காவிரிப்பூம்பட்டினம் அல்லது பூம்பூகார் என்றும் அழைக்கப்படுகிறது) காவிரி நதியின் முகத்துவாரத்தில் ஒரு முக்கிய சங்க கால துறைமுகமாக இருந்தது. தமிழ் இலக்கியம் (உதாரணமாக, பட்டினப்பாலை, சிலப்பதிகாரம்) அதன் செழிப்பு மற்றும் வெள்ளம் மற்றும் கடலோர அரிப்பு மூலம் இறுதியில் மூழ்கடிக்கப்பட்டதை விவரிக்கிறது.'
      }
    }
  },

  // ============================================================
  // D. Textual References
  // ============================================================

  'valmiki': {
    term: 'valmiki',
    translations: {
      en: {
        translation: 'Vālmīki',
        transliteration: 'Vālmīki',
        etymology: 'Sanskrit: traditional author of the Rāmāyaṇa',
        culturalContext: 'Vālmīki is venerated as the ādi-kavi (first poet) and composer of the Sanskrit Rāmāyaṇa, the epic narrative foundational to Hindu devotional and literary traditions. In the context of geomythology, Vālmīki\'s text preserves cultural memory of landscape, river systems, and engineering feats (e.g., the Setubandha). While the Rāmāyaṇa is not a geological treatise, its geographic references have inspired modern efforts to map sacred topography and compare textual descriptions with environmental archaeology.'
      },
      hi: {
        translation: 'वाल्मीकि',
        transliteration: 'Vālmīki',
        etymology: 'संस्कृत: रामायण के पारंपरिक लेखक',
        culturalContext: 'वाल्मीकि को आदि-कवि (पहला कवि) और संस्कृत रामायण के रचयिता के रूप में पूजा जाता है, जो हिंदू भक्ति और साहित्यिक परंपराओं की आधारशिला महाकाव्य कथा है। भू-पुराण के संदर्भ में, वाल्मीकि का पाठ परिदृश्य, नदी प्रणालियों और इंजीनियरिंग कारनामों (जैसे, सेतुबन्ध) की सांस्कृतिक स्मृति को संरक्षित करता है।'
      },
      ta: {
        translation: 'வால்மீகி',
        transliteration: 'Vālmīki',
        etymology: 'சமஸ்கிருதம்: ராமாயணத்தின் பாரம்பரிய ஆசிரியர்',
        culturalContext: 'வால்மீகி ஆதி-கவி (முதல் கவிஞர்) மற்றும் சமஸ்கிருத ராமாயணத்தின் இயற்றியவராக வணங்கப்படுகிறார், இது இந்து பக்தி மற்றும் இலக்கிய பாரம்பரியங்களுக்கு அடிப்படையான காவிய கதை. புவி-தொன்மவியலின் சூழலில், வால்மீகியின் உரை நிலப்பரப்பு, நதி அமைப்புகள் மற்றும் பொறியியல் சாதனைகளின் (உதாரணமாக, சேதுபந்தம்) கலாச்சார நினைவைப் பாதுகாக்கிறது.'
      }
    }
  },

  'pattinappalai': {
    term: 'pattinappalai',
    translations: {
      en: {
        translation: 'Pattināppālai',
        transliteration: 'Pattināppālai',
        etymology: 'Tamil: Pattina (port town) + pālai (a poetic mode/landscape)',
        culturalContext: 'Pattināppālai is a classical Tamil Sangam poem (Pattuppāṭṭu collection) praising the Chola port of Kāvēripūmpattinam. It provides rich descriptions of maritime trade, warehouses filled with foreign goods, and the bustling cosmopolitan life of a delta port. For scholars of maritime history and coastal archaeology, the text is a primary source documenting the material culture and economic networks of early South India. Geologically, the poem\'s setting—the Kaveri delta—has undergone significant morphological changes due to sediment deposition, flood events, and relative sea-level shifts.'
      },
      hi: {
        translation: 'पट्टिनाप्पालै',
        transliteration: 'Pattināppālai',
        etymology: 'तमिल: पट्टिन (बंदरगाह शहर) + पालै (एक काव्य मोड/परिदृश्य)',
        culturalContext: 'पट्टिनाप्पालै एक शास्त्रीय तमिल संगम कविता (पट्टुप्पाट्टु संग्रह) है जो चोल बंदरगाह कावेरीपूम्पट्टिनम की प्रशंसा करती है। यह समुद्री व्यापार, विदेशी वस्तुओं से भरे गोदामों, और डेल्टा बंदरगाह के हलचल भरे ब्रह्माण्डीय जीवन का समृद्ध विवरण प्रदान करती है।'
      },
      ta: {
        translation: 'பட்டினப்பாலை',
        transliteration: 'Paṭṭiṉappālai',
        etymology: 'தமிழ்: பட்டின (துறைமுக நகரம்) + பாலை (ஒரு கவிதை முறை/நிலப்பரப்பு)',
        culturalContext: 'பட்டினப்பாலை என்பது சோழர் துறைமுகமான காவிரிப்பூம்பட்டினத்தைப் புகழும் ஒரு செவ்வியல் தமிழ் சங்க கவிதை (பத்துப்பாட்டு தொகுப்பு) ஆகும். இது கடல்சார் வர்த்தகம், வெளிநாட்டு பொருட்களால் நிரம்பிய கிடங்குகள் மற்றும் டெல்டா துறைமுகத்தின் பரபரப்பான அண்ட வாழ்க்கை பற்றிய வளமான விளக்கங்களை வழங்குகிறது.'
      }
    }
  },

  'nilamata-purana': {
    term: 'nilamata-purana',
    translations: {
      en: {
        translation: 'Nīlamata Purāṇa',
        transliteration: 'Nīlamata Purāṇa',
        etymology: 'Sanskrit: Nīla (a sage or name) + mata (teaching/doctrine) + Purāṇa',
        culturalContext: 'The Nīlamata Purāṇa is a regional Kashmiri text (~6th–8th century CE) that blends mythology, ritual prescription, and geographic lore. It preserves a tradition that Kashmir valley was once a vast lake (Satīsara) drained by cutting through mountains at Bāramoola. Modern geological studies confirm that the Kashmir valley was indeed a Pleistocene paleolake (Karewa lake) that drained through tectonic and erosional breaching. This is one of the clearest examples of geomythology where oral/textual tradition and stratigraphic evidence converge.'
      },
      hi: {
        translation: 'नीलमत पुराण',
        transliteration: 'Nīlamata Purāṇa',
        etymology: 'संस्कृत: नीला (एक ऋषि या नाम) + मत (शिक्षण/सिद्धांत) + पुराण',
        culturalContext: 'नीलमत पुराण एक क्षेत्रीय कश्मीरी पाठ है (~6वीं–8वीं शताब्दी ईस्वी) जो पौराणिक कथा, अनुष्ठान निर्देश और भौगोलिक विद्या को मिश्रित करता है। यह एक परंपरा को संरक्षित करता है कि कश्मीर घाटी कभी एक विशाल झील (सतीसर) थी जिसे बारामूला में पहाड़ों को काटकर निकाला गया था। आधुनिक भूवैज्ञानिक अध्ययन पुष्टि करते हैं कि कश्मीर घाटी वास्तव में एक प्लीस्टोसीन पुरा-झील (करेवा झील) थी।'
      },
      ta: {
        translation: 'நீலமத புராணம்',
        transliteration: 'Nīlamata Purāṇam',
        etymology: 'சமஸ்கிருதம்: நீல (ஒரு முனிவர் அல்லது பெயர்) + மத (போதனை/கோட்பாடு) + புராணம்',
        culturalContext: 'நீலமத புராணம் என்பது ஒரு பிராந்திய காஷ்மீரி உரை (~6வது–8வது நூற்றாண்டு CE) ஆகும், இது புராணக்கதை, சடங்கு விதிமுறை மற்றும் புவியியல் அறிவை கலக்கிறது. காஷ்மீர் பள்ளத்தாக்கு ஒரு காலத்தில் ஒரு பரந்த ஏரியாக (சதீசர) இருந்ததாகவும், பாரமூலாவில் மலைகளை வெட்டி வடிகட்டப்பட்டதாகவும் ஒரு பாரம்பரியத்தை இது பாதுகாக்கிறது.'
      }
    }
  },

  'nadistuti': {
    term: 'nadistuti',
    translations: {
      en: {
        translation: 'Nadīstuti',
        transliteration: 'Nadīstuti',
        etymology: 'Sanskrit: nadī (river) + stuti (hymn of praise)',
        culturalContext: 'The Nadīstuti (RV 10.75) is a Rigvedic hymn praising rivers, listing them from east to west: Gaṅgā, Yamunā, Sarasvatī, Sutudri (Sutlej), and others. It is one of the earliest literary attestations of major river systems in the subcontinent. For historical geographers and hydrologists, the hymn provides a baseline inventory of rivers recognized in the Vedic period. Some rivers mentioned (e.g., Sarasvatī) have shifted course or dried up, making the text valuable for reconstructing Bronze Age and early Iron Age hydrology.'
      },
      hi: {
        translation: 'नदीस्तुति',
        transliteration: 'Nadīstuti',
        etymology: 'संस्कृत: नदी (नदी) + स्तुति (प्रशंसा का भजन)',
        culturalContext: 'नदीस्तुति (ऋ. 10.75) एक ऋग्वेदिक भजन है जो नदियों की प्रशंसा करता है, उन्हें पूर्व से पश्चिम तक सूचीबद्ध करता है: गंगा, यमुना, सरस्वती, शतुद्रि (सतलुज), और अन्य। यह उपमहाद्वीप में प्रमुख नदी प्रणालियों के सबसे शुरुआती साहित्यिक साक्ष्यों में से एक है।'
      },
      ta: {
        translation: 'நதீஸ்துதி',
        transliteration: 'Nadīstuti',
        etymology: 'சமஸ்கிருதம்: நதீ (நதி) + ஸ்துதி (புகழ்ச்சி துதி)',
        culturalContext: 'நதீஸ்துதி (ரிவி 10.75) என்பது நதிகளைப் புகழும் ஒரு ரிக்வேத துதி ஆகும், அவற்றை கிழக்கிலிருந்து மேற்கு வரை பட்டியலிடுகிறது: கங்கா, யமுனா, சரஸ்வதி, சுதுத்ரி (சட்லெஜ்), மற்றும் பிறர். இது துணைக்கண்டத்தில் முக்கிய நதி அமைப்புகளின் ஆரம்பகால இலக்கிய சான்றுகளில் ஒன்றாகும்.'
      }
    }
  },

  'satisar': {
    term: 'satisar',
    translations: {
      en: {
        translation: 'Satīsara',
        transliteration: 'Satīsara',
        etymology: 'Sanskrit: Satī (goddess/name) + sara (lake)',
        culturalContext: 'In the Nīlamata Purāṇa, Satīsara is the primordial lake that once filled the Kashmir valley. The text narrates how the sage Kaśyapa drained it by cutting a pass at Bāramoola (Varahamūla). Geological research confirms that Kashmir was indeed a large Pleistocene paleolake (~85,000–15,000 years ago), formed by tectonic damming and drained through fluvial incision and possibly seismic breaching. The textual memory is remarkably accurate in outline, though not in precise chronology. This is a canonical case study in geomythology.'
      },
      hi: {
        translation: 'सतीसर',
        transliteration: 'Satīsara',
        etymology: 'संस्कृत: सती (देवी/नाम) + सर (झील)',
        culturalContext: 'नीलमत पुराण में, सतीसर वह आदिम झील है जिसने कभी कश्मीर घाटी को भर दिया था। पाठ बताता है कि कैसे ऋषि कश्यप ने बारामूला (वराहमूल) में एक दर्रा काटकर इसे निकाल दिया। भूवैज्ञानिक शोध पुष्टि करता है कि कश्मीर वास्तव में एक बड़ी प्लीस्टोसीन पुरा-झील थी (~85,000–15,000 वर्ष पहले)।'
      },
      ta: {
        translation: 'சதீசர',
        transliteration: 'Satīsara',
        etymology: 'சமஸ்கிருதம்: சதீ (தேவி/பெயர்) + சர (ஏரி)',
        culturalContext: 'நீலமத புராணத்தில், சதீசர என்பது காஷ்மீர் பள்ளத்தாக்கை ஒரு காலத்தில் நிரப்பிய ஆதி ஏரி ஆகும். கஷ்யப முனிவர் பாரமூலாவில் (வராகமூல) ஒரு கணவாயை வெட்டி அதை வடிகட்டியதாக உரை விவரிக்கிறது. புவியியல் ஆராய்ச்சி காஷ்மீர் உண்மையில் ஒரு பெரிய ப்ளைஸ்டோசீன் பழங்கால ஏரியாக (~85,000–15,000 ஆண்டுகளுக்கு முன்பு) இருந்ததை உறுதிப்படுத்துகிறது.'
      }
    }
  },

  // ============================================================
  // E. Scientific-Cultural Bridge Terms
  // ============================================================

  'lameta': {
    term: 'lameta',
    translations: {
      en: {
        translation: 'Lameta Formation',
        transliteration: 'Lameta Formation',
        etymology: 'Place name (Lameta Ghat, Jabalpur region)',
        culturalContext: 'The Lameta Formation is a latest Cretaceous (~70–66 Ma) geological unit exposed in central India (Madhya Pradesh, Gujarat), consisting of fluvial and lacustrine sediments interbedded with Deccan basalt flows. It is world-famous for preserving titanosaur nesting grounds—92 clutches and 256 eggs documented in systematic surveys. The formation provides a rare window into sauropod reproductive behavior on the eve of the K-Pg extinction. Culturally, many Lameta eggs have been venerated as Kākar Bhairav, demonstrating geomythological conservation.'
      },
      hi: {
        translation: 'लामेटा संरचना',
        transliteration: 'Lameta Formation',
        etymology: 'स्थान नाम (लामेटा घाट, जबलपुर क्षेत्र)',
        culturalContext: 'लामेटा संरचना मध्य भारत (मध्य प्रदेश, गुजरात) में उजागर एक अंतिम क्रेटेशियस (~70–66 Ma) भूवैज्ञानिक इकाई है, जिसमें डेक्कन बेसाल्ट प्रवाह के साथ नदी और झील अवसाद शामिल हैं। यह टाइटानोसॉर घोंसले के मैदानों को संरक्षित करने के लिए विश्व प्रसिद्ध है—92 क्लच और 256 अंडे व्यवस्थित सर्वेक्षणों में प्रलेखित हैं।'
      },
      ta: {
        translation: 'லமேட்டா உருவாக்கம்',
        transliteration: 'Lameta Formation',
        etymology: 'இட பெயர் (லமேட்டா காட், ஜபல்பூர் பகுதி)',
        culturalContext: 'லமேட்டா உருவாக்கம் என்பது மத்திய இந்தியாவில் (மத்திய பிரதேசம், குஜராத்) வெளிப்பட்ட ஒரு சமீபத்திய க்ரெடேசியஸ் (~70–66 Ma) புவியியல் அலகு ஆகும், இது டெக்கான் பாசால்ட் ஓட்டங்களுடன் நதி மற்றும் ஏரி படிவுகளைக் கொண்டுள்ளது. டைட்டானோசர் கூடு கட்டும் இடங்களைப் பாதுகாப்பதற்காக இது உலகப் புகழ்பெற்றது.'
      }
    }
  },

  'megaloolithus': {
    term: 'megaloolithus',
    translations: {
      en: {
        translation: 'Megaloolithus',
        transliteration: 'Megaloolithus',
        etymology: 'Greek: megas (large) + ōion (egg) + lithos (stone)',
        culturalContext: 'Megaloolithus is an oogenus (egg-based taxon) of dinosaur eggs, primarily associated with titanosaur sauropods. Several oospecies (M. jabalpurensis, M. cylindricus, M. megadermus) have been described from the Lameta Formation. These large, spherical eggs—some culturally venerated as Kākar Bhairav—provide critical data on sauropod nesting behavior, clutch size, and reproductive physiology. The scientific name anchors the eggs in formal paleontological systematics, while folk names anchor them in living tradition.'
      },
      hi: {
        translation: 'मेगालूलिथस',
        transliteration: 'Megaloolithus',
        etymology: 'ग्रीक: मेगास (बड़ा) + ओइओन (अंडा) + लिथोस (पत्थर)',
        culturalContext: 'मेगालूलिथस डायनासोर अंडों का एक ऊजीनस (अंडा-आधारित वर्गीकरण) है, मुख्य रूप से टाइटानोसॉर सौरोपोड से जुड़ा है। लामेटा संरचना से कई ऊस्पीसीज (M. जबलपुरेंसिस, M. सिलिंड्रिकस, M. मेगाडर्मस) का वर्णन किया गया है। ये बड़े, गोलाकार अंडे—जिनमें से कुछ सांस्कृतिक रूप से काकर भैरव के रूप में पूजे जाते हैं।'
      },
      ta: {
        translation: 'மெகலூலித்தஸ்',
        transliteration: 'Megaloolithus',
        etymology: 'கிரேக்கம்: மெகாஸ் (பெரிய) + ஓயோன் (முட்டை) + லித்தோஸ் (கல்)',
        culturalContext: 'மெகலூலித்தஸ் என்பது டைனோசர் முட்டைகளின் ஒரு ஓஜீனஸ் (முட்டை அடிப்படையிலான வகைபிரிப்பு) ஆகும், முதன்மையாக டைட்டானோசர் சௌரோபாட்களுடன் தொடர்புடையது. லமேட்டா உருவாக்கத்திலிருந்து பல ஓஸ்பீசிஸ் (M. ஜபல்பூரென்சிஸ், M. சிலிண்ட்ரிகஸ், M. மெகாடெர்மஸ்) விவரிக்கப்பட்டுள்ளன.'
      }
    }
  },

  'rajasaurus': {
    term: 'rajasaurus',
    translations: {
      en: {
        translation: 'Rajasaurus',
        transliteration: 'Rājasaurus',
        etymology: 'Sanskrit rāja (king) + Greek sauros (lizard); "king lizard"',
        culturalContext: 'Rajasaurus narmadensis is an abelisaurid theropod dinosaur from the Lameta Formation, described in 2003. Its name honors both Indian sovereignty ("rāja") and the Narmadā region where it was found. This medium-sized carnivore (~7–9 m long) likely hunted or scavenged near titanosaur nesting colonies. Rajasaurus is iconic in Indian paleontology—a predator with a Sanskrit name, bridging deep time and cultural identity.'
      },
      hi: {
        translation: 'राजासॉरस',
        transliteration: 'Rājasaurus',
        etymology: 'संस्कृत राज (राजा) + ग्रीक सॉरोस (छिपकली); "राजा छिपकली"',
        culturalContext: 'राजासॉरस नर्मदेंसिस लामेटा संरचना से एक एबेलिसॉरिड थेरोपोड डायनासोर है, 2003 में वर्णित। इसका नाम भारतीय संप्रभुता ("राजा") और नर्मदा क्षेत्र दोनों को सम्मानित करता है जहां यह पाया गया था। यह मध्यम आकार का मांसाहारी (~7–9 मी लंबा) संभवतः टाइटानोसॉर घोंसले की कॉलोनियों के पास शिकार या मैला ढोता था।'
      },
      ta: {
        translation: 'ராஜாசரஸ்',
        transliteration: 'Rājasaurus',
        etymology: 'சமஸ்கிருதம் ராஜா (மன்னன்) + கிரேக்கம் சௌரோஸ் (பல்லி); "அரசன் பல்லி"',
        culturalContext: 'ராஜாசரஸ் நர்மாடென்சிஸ் என்பது லமேட்டா உருவாக்கத்திலிருந்து ஒரு அபெலிசௌரிட் தெரோபாட் டைனோசர் ஆகும், 2003 இல் விவரிக்கப்பட்டது. அதன் பெயர் இந்திய இறையாண்மை ("ராஜா") மற்றும் அது கண்டுபிடிக்கப்பட்ட நர்மதா பகுதி இரண்டையும் கௌரவிக்கிறது.'
      }
    }
  },

  'barapasaurus': {
    term: 'barapasaurus',
    translations: {
      en: {
        translation: 'Barapasaurus',
        transliteration: 'Barapāsaurus',
        etymology: 'Telugu/Hindi bara/bada (big) + pā (leg) + Greek sauros (lizard); "big-legged lizard"',
        culturalContext: 'Barapasaurus tagorei is an Early Jurassic sauropod (~190 Ma) from the Kota Formation (Andhra Pradesh/Telangana). One of the earliest large quadrupedal sauropods globally, Barapasaurus demonstrates that India was a center for early sauropod evolution. The name blends Indian vernacular ("bara pā") with classical paleontological convention, reflecting the hybrid identity of Indian earth sciences—rooted in local languages and global frameworks.'
      },
      hi: {
        translation: 'बारापासॉरस',
        transliteration: 'Barapāsaurus',
        etymology: 'तेलुगु/हिंदी बारा/बड़ा (बड़ा) + पा (पैर) + ग्रीक सॉरोस (छिपकली); "बड़े पैर वाली छिपकली"',
        culturalContext: 'बारापासॉरस टैगोरी कोटा संरचना (आंध्र प्रदेश/तेलंगाना) से एक प्रारंभिक जुरासिक सौरोपोड (~190 Ma) है। वैश्विक स्तर पर सबसे शुरुआती बड़े चतुष्पाद सौरोपोड में से एक, बारापासॉरस प्रदर्शित करता है कि भारत प्रारंभिक सौरोपोड विकास का एक केंद्र था।'
      },
      ta: {
        translation: 'பராபாசரஸ்',
        transliteration: 'Barapāsaurus',
        etymology: 'தெலுங்கு/இந்தி பரா/படா (பெரிய) + பா (கால்) + கிரேக்கம் சௌரோஸ் (பல்லி); "பெரிய-காலுடைய பல்லி"',
        culturalContext: 'பராபாசரஸ் டாகோரெய் என்பது கோட்டா உருவாக்கத்திலிருந்து (ஆந்திர பிரதேசம்/தெலங்கானா) ஒரு ஆரம்ப ஜுராசிக் சௌரோபாட் (~190 Ma) ஆகும். உலகளவில் ஆரம்பகால பெரிய நான்கு கால் சௌரோபாட்களில் ஒன்றான பராபாசரஸ், இந்தியா ஆரம்ப சௌரோபாட் பரிணாமத்திற்கான மையமாக இருந்ததை நிரூபிக்கிறது.'
      }
    }
  },

  'stegodon': {
    term: 'stegodon',
    translations: {
      en: {
        translation: 'Stegodon',
        transliteration: 'Stegodon',
        etymology: 'Greek: stegos (roof/covering) + odont (tooth); referring to roof-like enamel ridges',
        culturalContext: 'Stegodon is a genus of extinct elephantids (Neogene–Pleistocene) found widely across Asia, including the Siwalik hills of India. Species such as Stegodon ganesa are notable for their massive, nearly parallel tusks and distinctive molar morphology. Siwalik fossils of Stegodon and other megafauna provided early evidence for mammalian evolution in the Indian subcontinent and were among the first fossils studied by British and Indian geologists in the 19th century. These bones may have contributed to local folklore of giants and battlefield relics.'
      },
      hi: {
        translation: 'स्टेगोडन',
        transliteration: 'Stegodon',
        etymology: 'ग्रीक: स्टेगोस (छत/आवरण) + ओडोंट (दांत); छत जैसी इनेमल लकीरों को संदर्भित करता है',
        culturalContext: 'स्टेगोडन विलुप्त हाथियों का एक जीनस (नियोजीन–प्लीस्टोसीन) है जो एशिया भर में व्यापक रूप से पाया जाता है, जिसमें भारत की शिवालिक पहाड़ियां शामिल हैं। स्टेगोडन गणेश जैसी प्रजातियां अपने विशाल, लगभग समानांतर दांतों और विशिष्ट दाढ़ आकृति विज्ञान के लिए उल्लेखनीय हैं।'
      },
      ta: {
        translation: 'ஸ்டெகோடன்',
        transliteration: 'Stegodon',
        etymology: 'கிரேக்கம்: ஸ்டெகோஸ் (கூரை/மூடுதல்) + ஓடோண்ட் (பல்); கூரை போன்ற பற்சிப்பி முகடுகளைக் குறிக்கிறது',
        culturalContext: 'ஸ்டெகோடன் என்பது ஆசியா முழுவதும் பரவலாகக் காணப்படும் அழிந்துபோன யானைகளின் (நியோஜீன்–ப்ளைஸ்டோசீன்) ஒரு இனமாகும், இந்தியாவின் சிவாலிக் மலைகள் உட்பட. ஸ்டெகோடன் கணேசா போன்ற இனங்கள் அவற்றின் மாபெரும், கிட்டத்தட்ட இணையான கோரைப்பற்கள் மற்றும் தனித்துவமான கடைவாய்ப் பல் உருவ அமைப்பிற்காக குறிப்பிடத்தக்கவை.'
      }
    }
  },

  'sivatherium': {
    term: 'sivatherium',
    translations: {
      en: {
        translation: 'Sivatherium',
        transliteration: 'Sivatherium',
        etymology: 'Named after Śiva + Greek therion (beast); "Śiva\'s beast"',
        culturalContext: 'Sivatherium is an extinct giraffid from the Pliocene–Pleistocene Siwalik deposits, among the largest ruminants ever. With robust limbs, moose-like antlers, and estimated mass >1,000 kg, it was a striking megafaunal element of the South Asian savanna–woodland mosaic. The genus name explicitly honors Śiva, linking paleontology with Hindu tradition—a 19th-century practice of naturalizing science within local cultural vocabularies. Sivatherium bones, like other Siwalik megafauna, may have fed geomythological narratives of ancient battles and giants.'
      },
      hi: {
        translation: 'शिवथेरियम',
        transliteration: 'Śivatherium',
        etymology: 'शिव + ग्रीक थेरियन (जानवर) के नाम पर; "शिव का जानवर"',
        culturalContext: 'शिवथेरियम प्लायोसीन–प्लीस्टोसीन शिवालिक जमाओं से एक विलुप्त जिराफ है, जो अब तक के सबसे बड़े जुगाली करने वालों में से एक है। मजबूत अंगों, मूस जैसे सींगों और अनुमानित द्रव्यमान >1,000 किग्रा के साथ, यह दक्षिण एशियाई सवाना–वुडलैंड मोज़ेक का एक हड़ताली मेगाफौनल तत्व था।'
      },
      ta: {
        translation: 'சிவதீரியம்',
        transliteration: 'Sivatherium',
        etymology: 'சிவன் + கிரேக்கம் தெரியன் (மிருகம்) பெயரிடப்பட்டது; "சிவனின் மிருகம்"',
        culturalContext: 'சிவதீரியம் என்பது ப்லையோசீன்–ப்ளைஸ்டோசீன் சிவாலிக் படிவுகளிலிருந்து அழிந்துபோன ஒரு ஜிராஃபிட் ஆகும், இதுவரை இருந்த மிகப்பெரிய அசைபோடும் விலங்குகளில் ஒன்றாகும். வலுவான கால்கள், மூஸ் போன்ற கொம்புகள் மற்றும் மதிப்பிடப்பட்ட நிறை >1,000 கிலோவுடன், இது தெற்காசிய சவன்னா–வனப்பகுதி மொசைக்கின் ஒரு குறிப்பிடத்தக்க மெகாஃபெளனல் உறுப்பு ஆகும்.'
      }
    }
  }
};
