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
    author: "Mrs. Rekha Bansal, MA History",
    date: "2024-03-12"
  },
  {
    id: 4,
    title: "Riding the Monsoon Winds: Commerce, Culture and the Ancient Indian Ocean",
    excerpt: "How seasonal wind patterns powered the world's first globalized trade network, shaping cultures from East Africa to Southeast Asia. From the Hermapollon cargo to Chola naval expeditions, discover how monsoon winds became the engine of early globalization.",
    slug: "/scripts-that-sailed",
    theme: "Indian Ocean World",
    tags: ["Indian Ocean World", "Maritime Trade", "Monsoon Navigation", "Cultural Exchange", "Ancient Globalization"],
    readTime: 28,
    author: "Kanika Rakesh",
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
    title: "Indian Ocean Power Networks: From the Malabar Spice Circuit to the Chola Expedition",
    excerpt: "How trade in spices and bullion fueled ancient economies, and how medieval Indian naval expeditions projected power across the waves—revealing the interconnected world of the pre-modern Indian Ocean.",
    slug: "/indian-ocean-power-networks",
    theme: "Empires & Exchange", 
    tags: ["Empires & Exchange", "Maritime Networks", "Ancient Economics", "Naval History", "Cultural Exchange"],
    readTime: 24,
    author: "Nartiang Foundation",
    date: "2024-03-28"
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
  },
  {
    id: 10,
    title: "Riders on the Monsoon: Indigenous Navigation and Maritime Knowledge",
    excerpt: "Long before European exploration, South Asian navigators developed sophisticated monsoon-based navigation systems. Recent palm-leaf manuscript discoveries reveal the scientific depth of indigenous maritime knowledge.",
    slug: "/riders-on-monsoon",
    theme: "Indian Ocean World",
    tags: ["Navigation", "Indigenous Knowledge", "Monsoon", "Palm-leaf Manuscripts"],
    readTime: 16,
    author: "Nartiang Foundation",
    date: "2024-03-25"
  },
  {
    id: 11,
    title: "Earth, Sea and Sangam: Geological Transformations and the Ancient Ports of South India",
    excerpt: "How tectonic forces, river floods, and rising seas shaped—and reshaped—the maritime geography of Southern India. From Muziris' disappearance to Kochi's birth, geology tells the story of ports in motion.",
    slug: "/earth-sea-sangam",
    theme: "Geology & Deep Time",
    tags: ["Geology & Deep Time", "Maritime Networks", "Coastal Change", "Ancient Ports"],
    readTime: 16,
    author: "Nartiang Foundation",
    date: "2024-03-28"
  }
];