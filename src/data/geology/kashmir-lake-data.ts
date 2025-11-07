export interface KarewaLayer {
  id: string;
  name: string;
  period: string;
  startYearBP: number;
  endYearBP: number;
  composition: {
    clay: number;
    silt: number;
    sand: number;
    volcanicAsh: number;
  };
  color: string;
  thickness: number; // meters
  description: string;
  fossilEvidence: string[];
}

export interface CrossSectionPoint {
  location: string;
  elevation: number; // meters above sea level
  karewaThickness: number; // meters
  coordinates: [number, number];
}

export interface LakePhase {
  yearBP: number;
  waterLevel: number; // meters above modern valley floor
  event: string;
  description: string;
}

export const karewaLayers: KarewaLayer[] = [
  {
    id: 'lower-karewa',
    name: 'Lower Karewa',
    period: 'Early-Middle Pleistocene',
    startYearBP: 850000,
    endYearBP: 750000,
    composition: {
      clay: 55,
      silt: 30,
      sand: 10,
      volcanicAsh: 5
    },
    color: '#8b4513',
    thickness: 300,
    description: 'Oldest lacustrine deposits with high clay content indicating deep, calm lake conditions',
    fossilEvidence: [
      'Freshwater diatoms (Cyclotella)',
      'Plant macrofossils (aquatic)',
      'Gastropod shells (Viviparus)',
      'Pollen grains (coniferous)'
    ]
  },
  {
    id: 'middle-karewa',
    name: 'Middle Karewa',
    period: 'Middle Pleistocene',
    startYearBP: 500000,
    endYearBP: 400000,
    composition: {
      clay: 35,
      silt: 40,
      sand: 15,
      volcanicAsh: 10
    },
    color: '#a0522d',
    thickness: 350,
    description: 'Mixed sediments with volcanic ash intercalations from Pir Panjal activity',
    fossilEvidence: [
      'Diatom assemblages (diverse)',
      'Volcanic glass shards',
      'Mammalian bone fragments',
      'Wood fragments (conifer, oak)'
    ]
  },
  {
    id: 'upper-karewa',
    name: 'Upper Karewa',
    period: 'Late Middle Pleistocene',
    startYearBP: 300000,
    endYearBP: 200000,
    composition: {
      clay: 40,
      silt: 35,
      sand: 20,
      volcanicAsh: 5
    },
    color: '#cd853f',
    thickness: 400,
    description: 'Freshwater lake phase with abundant organic material and mollusks',
    fossilEvidence: [
      'Freshwater bivalves (Corbicula)',
      'Gastropods (Melanoides, Bithynia)',
      'Fish vertebrae',
      'Charcoal fragments',
      'Pollen (temperate forest)'
    ]
  },
  {
    id: 'terminal-karewa',
    name: 'Terminal Karewa',
    period: 'Late Pleistocene',
    startYearBP: 150000,
    endYearBP: 100000,
    composition: {
      clay: 30,
      silt: 40,
      sand: 25,
      volcanicAsh: 5
    },
    color: '#daa520',
    thickness: 250,
    description: 'Final lake phase before drainage, with plant macrofossils indicating shallowing',
    fossilEvidence: [
      'Plant macrofossils (abundant)',
      'Ostracods (shallow water indicators)',
      'Charophytes (stoneworts)',
      'Beetle fragments',
      'Mammalian teeth (herbivores)'
    ]
  },
  {
    id: 'post-karewa',
    name: 'Post-Karewa Alluvium',
    period: 'Holocene',
    startYearBP: 10000,
    endYearBP: 0,
    composition: {
      clay: 20,
      silt: 30,
      sand: 45,
      volcanicAsh: 5
    },
    color: '#f4a460',
    thickness: 50,
    description: 'Modern alluvial deposits after lake drainage, showing fluvial activity',
    fossilEvidence: [
      'Modern pollen (agricultural)',
      'Pottery fragments (Neolithic onwards)',
      'Charcoal (human occupation)',
      'Recent fauna bones'
    ]
  }
];

export const crossSectionPoints: CrossSectionPoint[] = [
  {
    location: 'Baramulla',
    elevation: 1600,
    karewaThickness: 80,
    coordinates: [34.20, 74.34]
  },
  {
    location: 'Srinagar',
    elevation: 1585,
    karewaThickness: 120,
    coordinates: [34.08, 74.80]
  },
  {
    location: 'Anantnag',
    elevation: 1620,
    karewaThickness: 90,
    coordinates: [33.73, 75.15]
  }
];

export const lakePhases: LakePhase[] = [
  {
    yearBP: 900000,
    waterLevel: 150,
    event: 'Tectonic damming',
    description: 'Pir Panjal uplift creates natural dam, forming paleolake Satisaras'
  },
  {
    yearBP: 600000,
    waterLevel: 140,
    event: 'Maximum lake extent',
    description: 'Lake reaches maximum depth and area, depositing thick clay layers'
  },
  {
    yearBP: 300000,
    waterLevel: 120,
    event: 'Stable lake phase',
    description: 'Long period of stability with rich biodiversity'
  },
  {
    yearBP: 150000,
    waterLevel: 80,
    event: 'Progressive shallowing',
    description: 'Sedimentation and tectonic adjustment reduce lake depth'
  },
  {
    yearBP: 85000,
    waterLevel: 40,
    event: 'Catastrophic drainage',
    description: 'Baramulla breach drains lake, creating Kashmir Valley'
  },
  {
    yearBP: 10000,
    waterLevel: 5,
    event: 'Wular Lake remnant',
    description: 'Small residual lake remains in northern valley'
  }
];
