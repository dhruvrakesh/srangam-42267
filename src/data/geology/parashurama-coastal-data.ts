export interface NagaShrine {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lon]
  legend: string;
  deity: string;
  significance: string;
  modernLocation: string;
}

export interface CoastlineLayer {
  period: string;
  yearBP: number;
  color: string;
  coordinates: [number, number][];
  seaLevel: number; // meters relative to present
  description: string;
}

export const nagaShrines: NagaShrine[] = [
  {
    id: 'gokarna',
    name: 'Gokarṇa',
    coordinates: [14.55, 74.32],
    legend: 'Starting point of Paraśurāma\'s axe throw',
    deity: 'Mahābaleśvara (Śiva)',
    significance: 'Northern terminus of reclaimed land',
    modernLocation: 'Uttara Kannada, Karnataka'
  },
  {
    id: 'ananthasayana',
    name: 'Ananthaśayana Temple',
    coordinates: [11.26, 75.77],
    legend: 'Viṣṇu reclining on the serpent Ananta',
    deity: 'Viṣṇu-Ananta',
    significance: 'Nāga symbolism in coastal emergence',
    modernLocation: 'Kasaragod, Kerala'
  },
  {
    id: 'mannarsala',
    name: 'Mannarsala Nāgarāja Temple',
    coordinates: [9.18, 76.52],
    legend: 'Premier serpent temple of Kerala',
    deity: 'Nāgarāja, Sarpayakṣi',
    significance: 'Center of serpent worship tradition',
    modernLocation: 'Alappuzha, Kerala'
  },
  {
    id: 'kanyakumari',
    name: 'Kanyakumari',
    coordinates: [8.08, 77.55],
    legend: 'Landing site of Paraśurāma\'s axe',
    deity: 'Kumāri Amman',
    significance: 'Southern terminus of reclaimed land',
    modernLocation: 'Tamil Nadu'
  },
  {
    id: 'thiruvananthapuram',
    name: 'Śrī Padmanābhasvāmy',
    coordinates: [8.48, 76.95],
    legend: 'Viṣṇu on Ananta Nāga',
    deity: 'Padmanābha',
    significance: 'Coastal deity with serpent symbolism',
    modernLocation: 'Thiruvananthapuram, Kerala'
  },
  {
    id: 'taliparamba',
    name: 'Taliparamba Rajarajeshwara',
    coordinates: [12.04, 75.37],
    legend: 'Temple with Nāga grove',
    deity: 'Śiva',
    significance: 'Serpent worship integral to rituals',
    modernLocation: 'Kannur, Kerala'
  },
  {
    id: 'subramanya',
    name: 'Subrahmanya Temple',
    coordinates: [12.78, 75.36],
    legend: 'Serpent king Vāsuki association',
    deity: 'Subrahmanya',
    significance: 'Serpent imagery in architecture',
    modernLocation: 'Dakshina Kannada, Karnataka'
  },
  {
    id: 'kollur',
    name: 'Kollur Mookambika',
    coordinates: [13.87, 74.80],
    legend: 'Goddess on serpent hood',
    deity: 'Mookambika',
    significance: 'Coastal Śakti worship with Nāga elements',
    modernLocation: 'Udupi, Karnataka'
  },
  {
    id: 'nagapattinam',
    name: 'Nāgappaṭṭinam',
    coordinates: [10.77, 79.84],
    legend: 'Town named after Nāga cult',
    deity: 'Various Nāga deities',
    significance: 'Historical serpent worship center',
    modernLocation: 'Tamil Nadu'
  },
  {
    id: 'ambalappuzha',
    name: 'Ambalappuzha Kṛṣṇa Temple',
    coordinates: [9.37, 76.38],
    legend: 'Coastal Krishna with Nāga associations',
    deity: 'Kṛṣṇa',
    significance: 'Backwater temple with serpent lore',
    modernLocation: 'Alappuzha, Kerala'
  },
  {
    id: 'kottiyoor',
    name: 'Kottiyoor Vyāsamaṇḍapa',
    coordinates: [11.93, 75.68],
    legend: 'Ancient serpent worship site',
    deity: 'Śiva',
    significance: 'Western Ghats connection to coastal myths',
    modernLocation: 'Kannur, Kerala'
  },
  {
    id: 'varkala',
    name: 'Varkala Janardhana',
    coordinates: [8.73, 76.71],
    legend: 'Coastal cliff temple',
    deity: 'Viṣṇu',
    significance: 'Geological formation with sacred status',
    modernLocation: 'Thiruvananthapuram, Kerala'
  },
  {
    id: 'vettikode',
    name: 'Vettikode Nāga Temple',
    coordinates: [11.35, 75.85],
    legend: 'Dedicated serpent shrine',
    deity: 'Nāgarāja',
    significance: 'Pure Nāga worship without syncretism',
    modernLocation: 'Kasaragod, Kerala'
  },
  {
    id: 'parassinikadavu',
    name: 'Parassinikadavu Muthappan',
    coordinates: [11.95, 75.48],
    legend: 'Theyyam tradition with serpent rituals',
    deity: 'Muthappan',
    significance: 'Living ritual connection to coastal lore',
    modernLocation: 'Kannur, Kerala'
  },
  {
    id: 'tiruvalla',
    name: 'Tiruvalla',
    coordinates: [9.38, 76.57],
    legend: 'Ancient settlement on emerged coast',
    deity: 'Various',
    significance: 'Archaeological evidence of coastal expansion',
    modernLocation: 'Pathanamthitta, Kerala'
  },
  {
    id: 'vettickal',
    name: 'Vettickal Cave Shrine',
    coordinates: [10.52, 76.21],
    legend: 'Cave with serpent imagery',
    deity: 'Nāga deities',
    significance: 'Pre-temple serpent worship',
    modernLocation: 'Palakkad, Kerala'
  },
  {
    id: 'kaviyoor',
    name: 'Kaviyoor Mahādeva',
    coordinates: [9.41, 76.61],
    legend: 'Rock-cut shrine with Nāga carvings',
    deity: 'Śiva',
    significance: 'Ancient architectural serpent motifs',
    modernLocation: 'Pathanamthitta, Kerala'
  },
  {
    id: 'cherthala',
    name: 'Cherthala Region Nāga Kāvu',
    coordinates: [9.68, 76.34],
    legend: 'Sacred serpent groves',
    deity: 'Sarpayakṣi',
    significance: 'Ecological-ritual complex',
    modernLocation: 'Alappuzha, Kerala'
  },
  {
    id: 'muzhappilangad',
    name: 'Muzhappilangad Beach',
    coordinates: [11.78, 75.39],
    legend: 'Coastal emergence folklore',
    deity: 'Various',
    significance: 'Recently emerged beach with local legends',
    modernLocation: 'Kannur, Kerala'
  },
  {
    id: 'payyanur',
    name: 'Payyanur Subrahmanya',
    coordinates: [12.10, 75.20],
    legend: 'Serpent-slaying myth',
    deity: 'Subrahmanya',
    significance: 'Nāga symbolism in purification ritual',
    modernLocation: 'Kannur, Kerala'
  },
  {
    id: 'edava',
    name: 'Edava Nāgarāja Temple',
    coordinates: [8.78, 76.73],
    legend: 'Coastal Nāga shrine',
    deity: 'Nāgarāja',
    significance: 'Active serpent worship near sea',
    modernLocation: 'Thiruvananthapuram, Kerala'
  }
];

export const coastlineLayers: CoastlineLayer[] = [
  {
    period: 'Modern (2025 CE)',
    yearBP: 0,
    color: '#10b981', // green
    seaLevel: 0,
    description: 'Current coastline with extensive laterite formations',
    coordinates: [
      [15.0, 74.10], [14.5, 74.20], [14.0, 74.35], [13.5, 74.50],
      [13.0, 74.65], [12.5, 74.80], [12.0, 75.00], [11.5, 75.20],
      [11.0, 75.40], [10.5, 75.60], [10.0, 75.75], [9.5, 75.90],
      [9.0, 76.10], [8.5, 76.30], [8.0, 76.90], [7.9, 77.50]
    ]
  },
  {
    period: 'Early Historic (1000 CE)',
    yearBP: 950,
    color: '#3b82f6', // blue
    seaLevel: -0.5,
    description: 'Medieval coastline, slightly seaward from modern',
    coordinates: [
      [15.0, 74.05], [14.5, 74.15], [14.0, 74.30], [13.5, 74.45],
      [13.0, 74.60], [12.5, 74.75], [12.0, 74.95], [11.5, 75.15],
      [11.0, 75.35], [10.5, 75.55], [10.0, 75.70], [9.5, 75.85],
      [9.0, 76.05], [8.5, 76.25], [8.0, 76.85], [7.9, 77.45]
    ]
  },
  {
    period: 'Late Holocene (3000 BCE)',
    yearBP: 5000,
    color: '#8b5cf6', // purple
    seaLevel: -2,
    description: 'Post-emergence baseline, 5-10km seaward',
    coordinates: [
      [15.0, 73.90], [14.5, 74.00], [14.0, 74.15], [13.5, 74.30],
      [13.0, 74.45], [12.5, 74.60], [12.0, 74.80], [11.5, 75.00],
      [11.0, 75.20], [10.5, 75.40], [10.0, 75.55], [9.5, 75.70],
      [9.0, 75.90], [8.5, 76.10], [8.0, 76.70], [7.9, 77.30]
    ]
  }
];

export const seaLevelTimeline = [
  { yearBP: 5000, seaLevel: -2, event: 'Holocene optimum ends, coastline stabilizes' },
  { yearBP: 4000, seaLevel: -1.5, event: 'Gradual emergence begins' },
  { yearBP: 3000, seaLevel: -1, event: 'Significant land exposure' },
  { yearBP: 2000, seaLevel: -0.7, event: 'Laterite formation intensifies' },
  { yearBP: 1000, seaLevel: -0.5, event: 'Medieval coastline established' },
  { yearBP: 500, seaLevel: -0.2, event: 'Minor adjustments' },
  { yearBP: 0, seaLevel: 0, event: 'Modern coastline' }
];
