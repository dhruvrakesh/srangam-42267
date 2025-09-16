import { InscriptionShastra } from '../interfaces';

export const kandaharEdict: InscriptionShastra = {
  id: 'kandahar-bilingual-edict',
  title: 'Kandahar Bilingual Edict of Ashoka',
  location: {
    ancient: 'Kandahar',
    modern: 'Kandahar, Afghanistan',
    region: 'Gandhara',
    coordinates: {
      latitude: 31.6131,
      longitude: 65.7372
    },
    description: 'Ancient crossroads city at the intersection of Central and South Asian trade routes'
  },
  period: {
    dynasty: 'Mauryan',
    ruler: 'Ashoka Maurya',
    century: '3rd century BCE',
    dating: {
      approximate: 'c. 250 BCE',
      precise: '258-250 BCE',
      method: 'historical'
    }
  },
  scripts: [
    {
      scriptType: 'greek',
      text: 'ΒΑΣΙΛΕΥΣ ΠΙΟΔΑΣΣΗΣ ΕΥΣΕΒΕΙΑΣ ΧΑΡΙΝ',
      transliteration: 'BASILEUS PIODASSES EUSEBEIAS CHARIN',
      translation: 'King Piodasses for the sake of piety',
      direction: 'ltr',
      rendering: 'both'
    },
    {
      scriptType: 'aramaic',
      text: 'מלכא פריודרש חסיד צדיק',
      transliteration: "malk'a prywd'rš ḥsyd ṣdyq",
      translation: 'King Priyadarshi, the pious righteous one',
      direction: 'rtl',
      rendering: 'both'
    }
  ],
  translations: {
    primary: 'This bilingual edict demonstrates Ashoka\'s adaptation of his dhamma message to local linguistic and cultural contexts in the Hellenistic regions of his empire.',
    contextual: 'The Greek version uses "eusebeia" (piety) while the Aramaic uses "ḥsyd ṣdyq" (pious righteous), showing sophisticated translation strategies that preserved meaning across cultures.',
    scholarly: 'Represents the earliest known example of systematic multilingual governance in the Indo-Iranian cultural sphere, building on Achaemenid precedents while innovating Mauryan administrative practices.',
    notes: [
      'Name adaptations: Ashoka → Piodasses (Greek) → Priyadarshi (Aramaic)',
      'Conceptual translations: Dhamma → Eusebeia (piety) → Qshyt (truth/righteousness)',
      'Both versions follow royal proclamation formulae of their respective traditions'
    ]
  },
  significance: {
    ritualContext: 'Imperial dhamma proclamation adapted to Hellenistic and Persian administrative traditions',
    politicalContext: 'Demonstrates Mauryan imperial integration of diverse cultural regions through linguistic accommodation',
    linguisticFeatures: [
      'Sophisticated translation strategies preserving meaning across cultures',
      'Adaptation of Indian dharmic concepts to Greek and Aramaic conceptual frameworks',
      'Use of local royal titulature and formulaic expressions'
    ],
    historicalImportance: 'Earliest systematic example of multilingual governance in South Asian imperial tradition',
    comparativeAnalysis: [
      'Precedents in Achaemenid multilingual inscriptions',
      'Continuation in later Indo-Greek and Kushan administrations',
      'Influence on subsequent Buddhist missionary translations'
    ]
  },
  culturalContext: {
    ritualSignificance: 'Dharmic governance principles adapted to diverse religious and philosophical traditions',
    historicalPeriod: {
      phase: 'mauryan',
      characteristics: [
        'Peak of early Indian imperial expansion',
        'Integration of Hellenistic territories',
        'Development of administrative multilingualism',
        'Buddhist influence on governance'
      ]
    },
    geographicRelevance: {
      culturalArea: 'Gandhara - Indo-Greek cultural synthesis region',
      tradingNetworks: ['Silk Road', 'Indian Ocean routes', 'Central Asian corridors'],
      linguisticInfluences: ['Greek', 'Aramaic', 'Prakrit', 'Sanskrit']
    },
    linguisticFeatures: {
      genre: 'administrative',
      linguisticFeatures: [
        'Royal proclamation formulae',
        'Multilingual conceptual translation',
        'Cultural adaptation strategies',
        'Administrative standardization'
      ]
    },
    scriptEvolution: {
      scriptEvolution: 'Greek and Aramaic scripts in imperial Indian context',
      comparativeScripts: ['Kharoshthi', 'Brahmi', 'Achaemenid cuneiform'],
      dating: {
        period: 'Mid-3rd century BCE',
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
        interactive: true
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
        expandable: true
      }
    }
  ],
  tags: [
    'Mauryan Empire',
    'Ashoka',
    'Multilingual Administration',
    'Gandhara',
    'Greek Script',
    'Aramaic Script',
    'Dhamma',
    'Imperial Governance',
    'Cultural Translation'
  ],
  bibliography: [
    'Fussman, G. (1974). Documents épigraphiques kouchans',
    'Salomon, R. (1999). Ancient Buddhist Scrolls from Gandhara',
    'Falk, H. (2006). Aśokan Sites and Artefacts'
  ],
  relatedInscriptions: ['kutai-yupa-borneo']
};