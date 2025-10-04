import { InscriptionShastra } from '../interfaces';

export const kedukanBukitStone: InscriptionShastra = {
  id: 'kedukan-bukit-palembang',
  title: 'Kedukan Bukit Inscription',
  location: {
    ancient: 'Śrīvijaya Empire',
    modern: 'Palembang, South Sumatra, Indonesia',
    region: 'Sumatra',
    coordinates: {
      latitude: -2.9761,
      longitude: 104.7754
    },
    description: 'Stone inscription from the heart of Śrīvijaya maritime empire, near the Musi River'
  },
  period: {
    dynasty: 'Śrīvijaya',
    ruler: 'Dapunta Hyang',
    century: '7th century CE',
    dating: {
      approximate: '683 CE',
      precise: '1 May 683 CE (Saka 605)',
      method: 'historical'
    }
  },
  scripts: [{
    scriptType: 'brahmic',
    subType: 'pallava',
    text: 'स्वस्ति श्री शक वर्षातीत ६०५... दापुन्त ह्यङ् नय्याक दि संवौ मङ्लप सिद्धयात्र',
    transliteration: 'svasti śrī śaka varṣātīta 605... dapunta hyang nayyāka di saṃvau maṅlapa siddhayātra',
    translation: 'Hail! In the blessed Saka year 605 [683 CE]... Dapunta Hyang embarked from Sambau, undertaking a successful expedition',
    direction: 'ltr',
    rendering: 'both'
  }],
  translations: {
    primary: 'The Kedukan Bukit inscription records Dapunta Hyang\'s successful military expedition (siddhayātra), marking the expansion of Śrīvijaya power. It precisely dates the event to 1 May 683 CE.',
    literal: 'The text enumerates troops (20,000 soldiers, 200 ships, 1,312 crew), supplies, and celebrates victory, using Old Malay with heavy Sanskrit lexical borrowing.',
    contextual: 'This is a foundational Śrīvijaya document showing a mature maritime polity that writes local language (Old Malay) in a South Indian-derived script (Pallava-type) while borrowing Sanskrit state-craft vocabulary.',
    scholarly: 'De Casparis\'s Prasasti Indonesia II (1956) and Coedès\'s Les inscriptions malaises de Çrivijaya (1930) established the corpus. The text exemplifies "Old Malay in Pallava script with Sanskrit cosmopolis idioms" — a perfect instance of language ≠ script ≠ sovereignty.',
    notes: [
      'Dated 1 May 683 CE (Saka 605) — among most precisely dated early SEA inscriptions',
      'Old Malay language, not Sanskrit, but uses Pallava-type Indic script',
      'Sanskrit loans: svasti, śrī, śaka, siddhayātra (successful expedition)',
      'Military enumeration: 20,000 troops, 200 ships, 1,312 crew, 312 artisans',
      'Shows Śrīvijaya as organized maritime polity with scribal sophistication'
    ]
  },
  significance: {
    ritualContext: 'Royal siddhayātra (successful expedition) proclamation — military victory as dharmic achievement',
    politicalContext: 'Śrīvijaya expansion documented at moment of maritime empire formation',
    linguisticFeatures: [
      'Old Malay written in Pallava-type Southern Brāhmī script',
      'Sanskrit lexical borrowing for state idioms (svasti, śrī, siddhayātra)',
      'Saka dating formula (Indian astronomical system)',
      'Bilingual/biliteracy: local language + Indic script + Sanskrit loans',
      'Palm-leaf orthographic habits visible in stone (cursive features)'
    ],
    historicalImportance: 'Earliest dated Old Malay inscription; foundational document of Śrīvijaya studies; evidence of Malacca-Musi corridor maritime power',
    comparativeAnalysis: [
      'Parallels Pallava copperplate conventions (formula, orthography)',
      'Contemporary with Bujang Valley/Sungai Batu port archaeology',
      'Shows network with Tamil-Vaigai scribal traditions via Pallava ductus',
      'Part of corpus with Talang Tuwo, Telaga Batu, and other Śrīvijaya stones'
    ]
  },
  culturalContext: {
    ritualSignificance: 'Military victory as dharmic statecraft; siddhayātra as ritual-political performance',
    historicalPeriod: {
      phase: 'classical-buddhist',
      characteristics: [
        'Formation of Śrīvijaya maritime empire',
        'Buddhist-Hindu synthesis in statecraft',
        'Malay-Sanskrit bilingual literacy',
        'Integration into Indian Ocean trade networks',
        'Adoption of Indic royal idioms in local language'
      ]
    },
    geographicRelevance: {
      culturalArea: 'Sumatra - Malacca Straits corridor',
      tradingNetworks: ['Malacca-Musi axis', 'South China Sea routes', 'Java Sea connections', 'Indian Ocean to China'],
      linguisticInfluences: ['Old Malay', 'Sanskrit', 'Pallava scripts', 'Tamil', 'Javanese']
    },
    linguisticFeatures: {
      genre: 'administrative',
      linguisticFeatures: [
        'Old Malay base language with Sanskrit superstratum',
        'Pallava-type syllabary with palm-leaf adaptations',
        'Military enumeration formulae',
        'Saka astronomical dating',
        'Royal titulature (Dapunta Hyang)',
        'Sanskrit cosmopolis vocabulary in local matrix'
      ]
    },
    scriptEvolution: {
      scriptEvolution: 'Pallava-type Southern Brāhmī adapted for Old Malay; evolves to Kawi and later Javanese/Balinese scripts',
      comparativeScripts: ['Pallava copperplates', 'Grantha', 'Early Kawi', 'Cham scripts', 'Tamil-Brāhmī'],
      dating: {
        period: '683 CE (precise)',
        confidence: 'high'
      }
    }
  },
  visualComponents: [
    {
      type: 'script-viewer',
      props: {
        layout: 'side-by-side',
        showTransliteration: true,
        interactive: true,
        highlightSanskritLoans: true
      }
    },
    {
      type: 'translation-panel',
      props: {
        showAllTypes: true,
        defaultType: 'contextual'
      }
    },
    {
      type: 'contextual-sidebar',
      props: {
        position: 'inline',
        expandable: true,
        showMap: true
      }
    }
  ],
  tags: [
    'Śrīvijaya',
    'Old Malay',
    'Pallava Script',
    'Sumatra',
    'Palembang',
    'Siddhayātra',
    'Dapunta Hyang',
    '683 CE',
    'Maritime Empire',
    'Sanskrit Cosmopolis',
    'Malacca Straits'
  ],
  bibliography: [
    'de Casparis, J.G. Prasasti Indonesia II: Selected Inscriptions from the 7th to the 9th Century A.D. (1956)',
    'Coedès, G. Les inscriptions malaises de Çrivijaya (1930)',
    'Kulke, H. "The Naval Expeditions of the Cholas in the Context of Asian History" (1993)',
    'Wolters, O.W. Early Indonesian Commerce (1967)',
    'UNESCO Memory of the World - Śrīvijaya Inscriptions'
  ],
  relatedInscriptions: ['kutai-yupa-borneo', 'vo-canh-stele-champa', 'kandahar-bilingual-edict']
};
