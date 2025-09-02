export const PORTS = [
  { id: "Muziris", lat: 10.21, lon: 76.26, region: "Malabar", era: "1st c. CE–", tags: ["pepper", "roman", "guilds"] },
  { id: "Berenike", lat: 23.91, lon: 35.50, region: "Red Sea", era: "1st c. CE–", tags: ["pepper", "ceramics"] },
  { id: "Myos Hormos", lat: 26.16, lon: 34.26, region: "Red Sea", era: "1st c. CE–", tags: ["periplus"] },
  { id: "Kedah (Bujang)", lat: 5.69, lon: 100.50, region: "Malaya", era: "4th–10th c.", tags: ["SEAsia", "Hindu-Buddhist"] },
  { id: "Nagapattinam", lat: 10.77, lon: 79.84, region: "Coromandel", era: "Chola", tags: ["Chola", "Srivijaya"] }
];

export const MONSOON = {
  summer: { 
    months: ["Jun", "Jul", "Aug", "Sep"], 
    arrows: [
      { from: [15, 40], to: [10, 75] }, 
      { from: [20, 52], to: [10, 70] }
    ]
  },
  winter: { 
    months: ["Dec", "Jan", "Feb"], 
    arrows: [
      { from: [10, 75], to: [20, 40] }, 
      { from: [12, 70], to: [18, 50] }
    ]
  }
};

export const PLATE_SPEED = [
  { Ma: 120, cm_per_yr: 5 },
  { Ma: 90, cm_per_yr: 15 },
  { Ma: 70, cm_per_yr: 18 },
  { Ma: 50, cm_per_yr: 10 },
  { Ma: 0, cm_per_yr: 4 }
];

export const PEPPER_CARGO = [
  { leg: "Muziris→Berenike", sacks: 300, est_kg: 300 * 55, bullion_back: true },
  { leg: "Barygaza→Oman", sacks: 120, est_kg: 120 * 55, bullion_back: false }
];

// Sample articles data structure
export const ARTICLES = [
  {
    id: 1,
    title: "Maritime Memories of South India: Emporia of the Ocean",
    excerpt: "Recent archaeological breakthroughs at Berenike confirm the vast scale of Indo-Roman maritime trade. From pepper markets to desert ports, this exploration traces how South India became a pivotal hub of the ancient world.",
    slug: "/maritime-memories-south-india",
    theme: "Ancient India", 
    tags: ["Indo-Roman Trade", "Muziris", "Berenike", "Maritime Networks"],
    readTime: 18,
    author: "Nartiang Foundation",
    date: "2024-03-15"
  },
  {
    id: 2,
    title: "The Pepper Routes: Tracing Spice Networks Across the Arabian Sea",
    excerpt: "Archaeological evidence from Muziris reveals how pepper transformed ancient trade networks and connected India to the Roman world.",
    slug: "/themes/ancient-india/pepper-routes",
    theme: "Ancient India",
    tags: ["pepper", "trade", "Roman", "Muziris"],
    readTime: 18,
    author: "Nartiang Foundation",
    date: "2024-03-15"
  },
  {
    id: 3,
    title: "Riding the Monsoon: How Winds Became an Engine of Commerce",
    excerpt: "A logistics revolution long before steam—sailing the Arabian Sea on a seasonal clock.",
    slug: "/monsoon-trade-clock",
    theme: "Indian Ocean World",
    tags: ["Indian Ocean World", "Trade", "Monsoon"],
    readTime: 8,
    author: "Prof. Ahmed Hassan",
    date: "2024-03-12"
  },
  {
    id: 4,
    title: "Scripts that Sailed: From Southern Brāhmī to Kawi, Khmer, and Thai",
    excerpt: "Letterforms as shipping records: how Indic scripts adapted to new languages around the Bay of Bengal.",
    slug: "/scripts-that-sailed",
    theme: "Scripts & Inscriptions",
    tags: ["Scripts & Inscriptions", "Epigraphy", "SE Asia"],
    readTime: 12,
    author: "Dr. Priya Venkat",
    date: "2024-03-08"
  },
  {
    id: 5,
    title: "India on the Move: From Gondwana to the Himalaya",
    excerpt: "A plate that sprinted, a flood basalt that roared, a mountain range still rising.",
    slug: "/gondwana-to-himalaya",
    theme: "Geology & Deep Time",
    tags: ["Geology & Deep Time", "Plate Tectonics", "Deccan"],
    readTime: 10,
    author: "Dr. Geological Survey", 
    date: "2024-03-05"
  },
  {
    id: 6,
    title: "Pepper and Bullion: The Malabar–Red Sea Circuit",
    excerpt: "Sacks of spice eastbound; silver and gold westbound—the corridor that fed two worlds.",
    slug: "/pepper-and-bullion",
    theme: "Empires & Exchange",
    tags: ["Empires & Exchange", "Malabar", "Roman World"],
    readTime: 6,
    author: "Dr. Maritime Historian",
    date: "2024-03-08"
  },
  {
    id: 7,
    title: "Rajendra's Ocean: The Chola Strike on Srivijaya, 1025 CE",
    excerpt: "A hard-power raid in a sea network bound by soft-power ties.",
    slug: "/chola-srivijaya-1025",
    theme: "Empires & Exchange",
    tags: ["Empires & Exchange", "Chola", "Straits of Malacca"],
    readTime: 7,
    author: "Prof. Naval History",
    date: "2024-03-15"
  },
  {
    id: 8,
    title: "Stones that Speak: Ashoka's Greek and Aramaic at Kandahar",
    excerpt: "Imperial ethics in multiple languages at a cultural crossroads.",
    slug: "/ashoka-kandahar-edicts",
    theme: "Ancient India",
    tags: ["Ancient India", "Edicts", "Hellenistic Links"],
    readTime: 5,
    author: "Dr. Epigraphy Specialist",
    date: "2024-03-18"
  },
  {
    id: 9,
    title: "Rainforest Prashastis: The Kutai Yūpa Inscriptions of Borneo",
    excerpt: "Sanskrit verse and Vedic ritual vocabulary on sacrificial posts at the edge of the equator.",
    slug: "/kutai-yupa-borneo",
    theme: "Scripts & Inscriptions",
    tags: ["Scripts & Inscriptions", "Sanskrit", "SE Asia"],
    readTime: 8,
    author: "Dr. Epigraphic Studies",
    date: "2024-03-22"
  }
];