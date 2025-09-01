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
    title: "The Pepper Routes: Tracing Spice Networks Across the Arabian Sea",
    excerpt: "Archaeological evidence from Muziris reveals how pepper transformed ancient trade networks and connected India to the Roman world.",
    slug: "/themes/ancient-india/pepper-routes",
    theme: "Ancient India",
    tags: ["pepper", "trade", "Roman", "Muziris"],
    readTime: 8,
    author: "Dr. Sarah Chennai",
    date: "2024-03-15"
  },
  {
    id: 2,
    title: "Monsoon Memories: How Seasonal Winds Shaped Maritime Culture", 
    excerpt: "The predictable rhythm of monsoon winds created not just trade opportunities but entire cultural practices around waiting and seasonal movement.",
    slug: "/themes/indian-ocean-world/monsoon-memories",
    theme: "Indian Ocean World",
    tags: ["monsoon", "maritime", "culture", "seasons"],
    readTime: 6,
    author: "Prof. Ahmed Hassan",
    date: "2024-03-12"
  },
  {
    id: 3,
    title: "Stone Voices: Reading Inscriptions Across the Deccan",
    excerpt: "From Prakrit to early Tamil, rock inscriptions tell stories of local governance, trade guilds, and religious patronage across centuries.",
    slug: "/themes/scripts-inscriptions/stone-voices",
    theme: "Scripts & Inscriptions", 
    tags: ["epigraphy", "Prakrit", "Tamil", "governance"],
    readTime: 12,
    author: "Dr. Priya Venkat",
    date: "2024-03-08"
  }
];