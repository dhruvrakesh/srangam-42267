import { InscriptionShastra } from '../interfaces';

export const voCanhStele: InscriptionShastra = {
  id: 'vo-canh-stele-champa',
  title: 'Võ Cảnh Stele',
  location: {
    ancient: 'Champa Kingdom',
    modern: 'Near Nha Trang, Khánh Hòa Province, Vietnam',
    region: 'Champa (Central Vietnam)',
    coordinates: {
      latitude: 12.2388,
      longitude: 109.1967
    },
    description: 'Early Sanskrit inscription found near ancient Kauthara, a major Cham port city'
  },
  period: {
    dynasty: 'Early Champa',
    century: '2nd-4th century CE (contested)',
    dating: {
      approximate: 'c. 200-350 CE',
      method: 'paleographic'
    }
  },
  scripts: [{
    scriptType: 'brahmic',
    subType: 'southern-brahmic',
    text: 'श्री भगवते शर्वाय चन्द्रवर्मणः',
    transliteration: 'śrī bhagavate śarvāya candravarmaṇaḥ',
    translation: 'To the blessed Sharva (Shiva), by Candravarman',
    direction: 'ltr',
    rendering: 'both'
  }],
  translations: {
    primary: 'The Võ Cảnh stele is often cited as the earliest Sanskrit inscription in mainland Southeast Asia, commemorating a royal dedication to Śiva.',
    contextual: 'The stele demonstrates early adoption of Southern Brāhmī/Grantha-type script for Sanskrit in Champa, showing strong South Indian scribal connections.',
    scholarly: 'Filliozat and EFEO scholars have debated the dating, with some placing it in the 2nd-3rd century CE, others in the 4th century. The ductus shows characteristics of Late Southern Brahmī consistent with early Pallava styles.',
    notes: [
      'Date contested between 2nd-4th century CE based on paleographic analysis',
      'Uses Southern Brāhmī/Grantha-type script similar to Tamil-Brahmi evolution',
      'Shows Sanskrit royal titulature (Candravarman) with Śaiva dedication',
      'First evidence of Indic scripts in Champa, predating later Cham script development'
    ]
  },
  significance: {
    ritualContext: 'Royal Śaiva dedication in early Champa, showing Hindu ritual adoption',
    politicalContext: 'Earliest evidence of Sanskritic statecraft in Champa maritime polity',
    linguisticFeatures: [
      'Pure Sanskrit (not mixed with local language)',
      'Southern Brāhmī/Grantha ductus showing Tamil-Vaigai corridor connection',
      'Royal genealogical formula (Candravarman)',
      'Śrī invocation following South Indian donative patterns'
    ],
    historicalImportance: 'Anchor point for dating Indic script transmission to mainland Southeast Asia',
    comparativeAnalysis: [
      'Precedes or contemporary with Kutai inscriptions in Borneo',
      'Shows parallel script adoption across maritime Southeast Asia',
      'Links to Pallava-Grantha family via ductus features'
    ]
  },
  culturalContext: {
    ritualSignificance: 'Śaiva devotional practice adopted by early Cham rulers',
    historicalPeriod: {
      phase: 'early-buddhist',
      characteristics: [
        'Early state formation in Champa',
        'Hindu-Buddhist syncretism',
        'Maritime trade integration with South India',
        'Adoption of Indic royal idioms'
      ]
    },
    geographicRelevance: {
      culturalArea: 'Champa - South China Sea coastal corridor',
      tradingNetworks: ['South China Sea routes', 'Mekong delta connections', 'Indian Ocean to East Asia'],
      linguisticInfluences: ['Sanskrit', 'Tamil', 'Old Cham', 'Southern Brāhmī scripts']
    },
    linguisticFeatures: {
      genre: 'prashasti',
      linguisticFeatures: [
        'Sanskrit royal panegyric formula',
        'Śaiva theological vocabulary',
        'Genealogical naming (Candravarman)',
        'Southern Indian epigraphic conventions'
      ]
    },
    scriptEvolution: {
      scriptEvolution: 'Southern Brāhmī/Grantha adoption in Champa, later evolves to Cham script',
      comparativeScripts: ['Tamil-Brāhmī', 'Pallava', 'Early Khmer scripts', 'Cham scripts'],
      dating: {
        period: '2nd-4th century CE (debated)',
        confidence: 'medium'
      }
    }
  },
  visualComponents: [
    {
      type: 'script-viewer',
      props: {
        layout: 'vertical',
        showTransliteration: true,
        interactive: true
      }
    },
    {
      type: 'translation-panel',
      props: {
        showAllTypes: true,
        defaultType: 'scholarly'
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
    'Champa',
    'Sanskrit',
    'Southern Brāhmī',
    'Grantha',
    'Early Southeast Asia',
    'Śaiva',
    'Candravarman',
    'Maritime Trade',
    'EFEO Corpus'
  ],
  bibliography: [
    'Filliozat, J. "L\'inscription dite de Vỏ‑Cạnh" in BEFEO (1969)',
    'Corpus of the Inscriptions of Campā (CIC/EFEO project)',
    'Griffiths, A. & Lammerts, D.C. "Epigraphy: Southeast Asia" (2015)',
    'Coedès, G. The Indianized States of Southeast Asia (1968)'
  ],
  relatedInscriptions: ['kandahar-bilingual-edict', 'kutai-yupa-borneo', 'kedukan-bukit-palembang']
};
