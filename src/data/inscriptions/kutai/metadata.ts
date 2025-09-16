import { InscriptionShastra } from '../interfaces';

export const kutaiYupa: InscriptionShastra = {
  id: 'kutai-yupa-borneo',
  title: 'Kutai Yūpa Inscriptions of Borneo',
  location: {
    ancient: 'Kutai Kingdom',
    modern: 'Muara Kaman, East Kalimantan, Indonesia',
    region: 'Insular Southeast Asia',
    coordinates: {
      latitude: -0.4614,
      longitude: 117.0595
    },
    description: 'Early Indianized kingdom in equatorial Borneo rainforest, strategic river network location'
  },
  period: {
    dynasty: 'Kutai Kingdom',
    ruler: 'Mūlavarman',
    century: '5th century CE',
    dating: {
      approximate: 'c. 400-450 CE',
      method: 'paleographic'
    }
  },
  scripts: [
    {
      scriptType: 'brahmic',
      subType: 'southern-brahmic',
      text: 'वापुकेव महाराज श्री मूलवर्मणो यूप',
      transliteration: 'vāpukeva mahārāja śrī mūlavarmaṇo yūpa',
      translation: 'The yūpa of His Majesty Śrī Mūlavarman of Vāpu',
      direction: 'ltr',
      rendering: 'both'
    }
  ],
  translations: {
    primary: 'Seven Sanskrit inscriptions on sacrificial posts (yūpa) recording King Mūlavarman\'s ritual donations and genealogy in classical prashasti style.',
    literal: 'Praise-inscriptions following Vedic yūpa tradition, transplanted to Bornean river-kingdom context with local political adaptations.',
    contextual: 'These represent the creative adaptation of Indic ritual culture to equatorial Southeast Asian political ecology - old verse forms, new forest kingdoms.',
    scholarly: 'Earliest systematic evidence of Sanskrit ritual culture in insular Southeast Asia, demonstrating cultural translation rather than mere copying of Indic traditions.',
    notes: [
      'Yūpa = Vedic sacrificial post, indicating transplanted ritual grammar',
      'Prashasti genre = classical Indian royal panegyric verse',
      'Local names and river networks integrated with Sanskrit cosmology',
      'Evidence of brahmin ritual specialists in Bornean court context'
    ]
  },
  significance: {
    ritualContext: 'Vedic sacrifice ceremonies (likely Asvamedha or similar royal rituals) adapted to rainforest kingdom setting',
    politicalContext: 'Early Indianized state formation in Southeast Asia through ritual legitimacy and Sanskrit cultural prestige',
    linguisticFeatures: [
      'Classical Sanskrit prashasti conventions',
      'Integration of local toponyms and political structures',
      'Vedic ceremonial terminology in tropical context',
      'Royal genealogy following Indian models'
    ],
    historicalImportance: 'Represents earliest phase of systematic Indianization in insular Southeast Asia through ritual culture',
    comparativeAnalysis: [
      'Parallels with contemporary Tarumanagara inscriptions (Java)',
      'Connection to Gupta period Indian models',
      'Precedent for later Majapahit and Srivijaya Sanskrit traditions',
      'Evidence for early India-Southeast Asia cultural networks'
    ]
  },
  culturalContext: {
    ritualSignificance: 'Vedic yūpa sacrificial posts establishing cosmic order and royal legitimacy in new geographical context',
    historicalPeriod: {
      phase: 'post-gupta',
      characteristics: [
        'Early Southeast Asian state formation',
        'Indian cultural expansion via maritime networks',
        'Brahmanical ritual adoption by local courts',
        'Sanskrit as prestige language of governance'
      ]
    },
    geographicRelevance: {
      culturalArea: 'Early Malayu cultural sphere - river-based trading kingdoms',
      tradingNetworks: ['South China Sea routes', 'Strait of Malacca corridor', 'Java Sea networks'],
      linguisticInfluences: ['Sanskrit', 'Old Malay', 'Local Dayak languages']
    },
    linguisticFeatures: {
      genre: 'prashasti',
      meter: 'Anushtubh (classical Sanskrit verse)',
      linguisticFeatures: [
        'Classical Sanskrit grammatical forms',
        'Royal titulature following Indian models',
        'Genealogical narrative structure',
        'Ritual donation formulae',
        'Integration of local river and place names'
      ]
    },
    scriptEvolution: {
      scriptEvolution: 'Southern Brahmic scripts (Pallava/Grantha influence) in Indonesian context',
      comparativeScripts: ['Pallava (Tamil Nadu)', 'Grantha (South India)', 'Early Javanese scripts'],
      dating: {
        period: '5th century CE',
        confidence: 'medium'
      }
    }
  },
  visualComponents: [
    {
      type: 'pillar-visualization',
      props: {
        count: 7,
        customHeight: true,
        metadata: {
          ritualContext: ['Vedic sacrifice posts (yūpa)', 'Royal patronage markers', 'Sanskrit prashasti verse'],
          scriptFeatures: ['Early southern Brahmic', 'Pallava/Grantha influence', '5th century CE dating'],
          location: 'Found at Muara Kaman, East Kalimantan',
          dating: 'These Sanskrit inscriptions represent some of the earliest evidence of Indic ritual culture in Borneo'
        }
      }
    },
    {
      type: 'script-viewer',
      props: {
        layout: 'stacked',
        showTransliteration: true,
        interactive: true
      }
    },
    {
      type: 'contextual-sidebar',
      props: {
        position: 'inline',
        expandable: true,
        defaultExpanded: false
      }
    }
  ],
  tags: [
    'Kutai Kingdom',
    'Sanskrit Inscriptions',
    'Southeast Asia',
    'Yūpa Pillars',
    'Indianization',
    'Brahmic Scripts',
    'Prashasti',
    'Vedic Rituals',
    'King Mūlavarman',
    'River Kingdoms',
    'Cultural Adaptation'
  ],
  bibliography: [
    'Coedès, G. (1968). The Indianized States of Southeast Asia',
    'Kulke, H. (1991). Kings and Cults: State Formation and Legitimation in India and Southeast Asia',
    'Hall, K. R. (1985). Maritime Trade and State Development in Early Southeast Asia',
    'Wolters, O. W. (1999). History, Culture, and Region in Southeast Asian Perspectives'
  ],
  relatedInscriptions: ['kandahar-bilingual-edict']
};