export interface EmpireTimelineNode {
  id: string;
  node: string;
  period: string;
  dateRange: string;
  region: string;
  locusPlace: string;
  lat: number;
  lon: number;
  waterways: string;
  powerLogic: string;
  oceanicLink: string;
  primarySources: string;
  tags: string;
}

export const empiresExchangeTimeline: EmpireTimelineNode[] = [
  {
    id: "VEDA-DASARAJNA",
    node: "Sudas & the War of Ten Kings (Daśarājña)",
    period: "Late Rigvedic",
    dateRange: "c. 2nd millennium BCE (approx.)",
    region: "Punjab—Paruṣṇī (Ravi) river",
    locusPlace: "Paruṣṇī (Ravi) near present-day Punjab",
    lat: 31.5,
    lon: 75.0,
    waterways: "Indus tributaries (Paruṣṇī/Ravi)",
    powerLogic: "Riverine control and alliance politics; ritual sovereignty tied to Varuṇa/Indra hymns.",
    oceanicLink: "Upstream control of river corridors that feed into the Indus delta and Arabian Sea exchange.",
    primarySources: "Rig Veda (hymns to Sudas/Daśarājña)",
    tags: "Vedic, Riverine, Alliance, Sovereignty"
  },
  {
    id: "KURU-JANAMEJAYA",
    node: "Janamejaya & Kuru Statecraft",
    period: "Early Iron Age polities",
    dateRange: "1st millennium BCE (early)",
    region: "Upper Ganga–Yamuna–Sarasvati doab",
    locusPlace: "Kurukṣetra region",
    lat: 29.96,
    lon: 76.82,
    waterways: "Sarasvati–Drishadvati–Yamuna",
    powerLogic: "Ritual kingship (āśvamedha, snake sacrifice narratives) consolidates Kuru authority and legal-ritual norms.",
    oceanicLink: "Doab trade routes connect westward river systems with Ganga navigation to the Bay of Bengal.",
    primarySources: "Mahābhārata traditions; early dharma/statecraft texts",
    tags: "Kuru, Ritual, Statecraft"
  },
  {
    id: "MAGADHA-BIMBISARA",
    node: "Bimbisara & the Rise of Magadha",
    period: "Haryanka dynasty",
    dateRange: "6th–5th century BCE (approx.)",
    region: "Rajagriha (Rajgir), Magadha",
    locusPlace: "Rajgir, Bihar",
    lat: 25.0,
    lon: 85.42,
    waterways: "Ganga–Son networks",
    powerLogic: "Annexations and alliances along Ganga corridor; taxation and road–river integration.",
    oceanicLink: "Ganga shipping opens to eastern emporia and, later, Bay of Bengal routes (e.g., Tamralipti).",
    primarySources: "Early Buddhist/Jain texts; later chronicles",
    tags: "Magadha, Ganga, Trade"
  },
  {
    id: "MAURYA-STATE",
    node: "Mauryan State & Port Governance",
    period: "Maurya Empire",
    dateRange: "4th–3rd century BCE",
    region: "Pan‑Indian imperial network",
    locusPlace: "Pāṭaliputra; Tamralipti (port)",
    lat: 25.61,
    lon: 85.13,
    waterways: "Ganga system to Bay of Bengal; coastal shipping",
    powerLogic: "Centralized departments incl. Navādhya kṣa (shipping superintendent); road–river integration; edictal communication.",
    oceanicLink: "Bay of Bengal connections to Sri Lanka and Southeast Asia; regulated port dues and customs.",
    primarySources: "Arthaśāstra (port & shipping); Ashokan inscriptions",
    tags: "Maurya, Ports, Administration"
  },
  {
    id: "GUPTA-NETWORKS",
    node: "Gupta Networks & Tamralipti",
    period: "Gupta Era",
    dateRange: "4th–6th century CE",
    region: "Eastern India (Bengal/Bihar)",
    locusPlace: "Tamralipti (Tamluk)",
    lat: 22.3,
    lon: 87.92,
    waterways: "Lower Ganga delta",
    powerLogic: "Guilds and long-distance trade; imperial patronage and inscriptional diplomacy.",
    oceanicLink: "Tamralipti as embarkation for Sri Lanka/SEA; pilgrims (e.g., Faxian) depart by sea.",
    primarySources: "Allahabad pillar inscription; Chinese pilgrim accounts",
    tags: "Gupta, Guilds, Bay of Bengal"
  },
  {
    id: "CHOLA-1025",
    node: "Rajendra I's 1025 CE Srivijaya Raid",
    period: "Imperial Cholas",
    dateRange: "c. 1025 CE",
    region: "Tamilakam to Straits of Malacca",
    locusPlace: "Nagapattinam; Kedah–Sumatra theatre",
    lat: 10.77,
    lon: 79.84,
    waterways: "Bay of Bengal, Malacca, monsoon routes",
    powerLogic: "Naval power projects mercantile leverage; control of choke points and tribute networks.",
    oceanicLink: "Direct strike on maritime hub Srivijaya to secure Tamil merchant interests.",
    primarySources: "Chola inscriptions; later chronicles",
    tags: "Chola, Srivijaya, Naval"
  },
  {
    id: "MARATHA-SHIVAJI",
    node: "Shivaji & the Western Coast Navy",
    period: "Maratha polity",
    dateRange: "17th century CE",
    region: "Konkan coast, Maharashtra",
    locusPlace: "Raigad–Sindhudurg coastal forts",
    lat: 16.0,
    lon: 73.5,
    waterways: "Arabian Sea littoral",
    powerLogic: "Coastal fort–fleet system deters European/privateer threats; protects maritime customs.",
    oceanicLink: "Builds indigenous sea power; later expanded under admirals like Kanhoji Angre.",
    primarySources: "Maratha chronicles; European factory records",
    tags: "Maratha, Navy, Forts"
  },
  {
    id: "INDIA-SAGAR",
    node: "Contemporary India: SAGAR & Indo-Pacific",
    period: "21st century",
    dateRange: "2015–present",
    region: "Indian Ocean Region",
    locusPlace: "Andaman–Nicobar, IOR littoral",
    lat: 11.67,
    lon: 92.74,
    waterways: "Indian Ocean sea lanes",
    powerLogic: "Maritime security, connectivity, disaster relief, and blue-economy initiatives in a rules-based Indo-Pacific.",
    oceanicLink: "Policy focus on 'Security And Growth for All in the Region' (SAGAR) and regional partnerships.",
    primarySources: "Official policy speeches, white papers",
    tags: "Policy, SAGAR, Indo-Pacific"
  }
];

import React from 'react';
import { TimelineNodeDetails } from '@/components/modules/TimelineNodeDetails';

// Transform timeline data for DynamicTimeline component
export const transformTimelineData = () => {
  return empiresExchangeTimeline.map(node => ({
    id: node.id,
    date: node.dateRange,
    title: node.node,
    description: node.powerLogic,
    type: getPowerType(node.tags),
    location: node.locusPlace,
    significance: node.oceanicLink,
    expandable: true,
    details: React.createElement(TimelineNodeDetails, { nodeId: node.id })
  }));
};

// Get node details data for component rendering
export const getNodeDetails = (nodeId: string) => {
  const node = empiresExchangeTimeline.find(n => n.id === nodeId);
  if (!node) return null;
  
  return {
    waterways: node.waterways,
    primarySources: node.primarySources,
    tags: node.tags.split(', ')
  };
};

const getPowerType = (tags: string): 'political' | 'trade' | 'cultural' | 'discovery' => {
  if (tags.includes('Naval') || tags.includes('Sovereignty') || tags.includes('Policy')) return 'political';
  if (tags.includes('Trade') || tags.includes('Guilds') || tags.includes('Ports')) return 'trade';
  if (tags.includes('Ritual') || tags.includes('Vedic')) return 'cultural';
  return 'discovery';
};