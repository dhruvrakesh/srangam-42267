export interface JyotirlingaSite {
  name: string;
  nameDevanagari: string;
  coords: [number, number];
  location: string;
  state: string;
  associatedRiver: string;
  legend: string;
  puranicSource: string;
  asceticOrders: string[];
  kumbhMela: boolean;
  pilgrimageSignificance: string;
}

export const JYOTIRLINGAS: JyotirlingaSite[] = [
  {
    name: "Somnath",
    nameDevanagari: "सोमनाथ",
    coords: [20.8880, 70.4013],
    location: "Prabhas Patan, Veraval",
    state: "Gujarat",
    associatedRiver: "Sarasvati (ancient)",
    legend: "First among the twelve Jyotirliṅgas, where Soma (Moon God) was freed from his curse. Site of legendary temple destroyed and rebuilt multiple times.",
    puranicSource: "Śiva Purāṇa, Skanda Purāṇa",
    asceticOrders: ["Giri", "Puri", "Bharati"],
    kumbhMela: false,
    pilgrimageSignificance: "Starting point of traditional Jyotirliṅga pilgrimage circuit"
  },
  {
    name: "Mallikarjuna",
    nameDevanagari: "मल्लिकार्जुन",
    coords: [16.0739, 78.8677],
    location: "Srisailam",
    state: "Andhra Pradesh",
    associatedRiver: "Krishna",
    legend: "Where Śiva appeared as Mallikārjuna and Pārvatī as Bhramarāmbā. Sacred to both Śaivas and Śāktas.",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Sarasvati", "Tirtha"],
    kumbhMela: false,
    pilgrimageSignificance: "One of the 18 Mahā Śakti Pīṭhas, dual significance"
  },
  {
    name: "Mahakaleshwar",
    nameDevanagari: "महाकालेश्वर",
    coords: [23.1765, 75.7685],
    location: "Ujjain",
    state: "Madhya Pradesh",
    associatedRiver: "Shipra",
    legend: "Only Jyotirliṅga facing south (dakṣiṇāmukha). Site where Śiva defeated the demon Dūṣaṇa to protect devotees.",
    puranicSource: "Śiva Purāṇa, Skanda Purāṇa",
    asceticOrders: ["Giri", "Puri", "Bharati", "Nāth Yogis"],
    kumbhMela: true,
    pilgrimageSignificance: "Major Kumbh Melā site, ancient astronomical observatory city"
  },
  {
    name: "Omkareshwar",
    nameDevanagari: "ओंकारेश्वर",
    coords: [22.2394, 76.1469],
    location: "Mandhata Island",
    state: "Madhya Pradesh",
    associatedRiver: "Narmada",
    legend: "Island shaped like the sacred syllable 'Oṁ'. Site where Vindhya mountain performed penance.",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Vana", "Aranya"],
    kumbhMela: false,
    pilgrimageSignificance: "Narmadā Parikramā (circumambulation) route"
  },
  {
    name: "Kedarnath",
    nameDevanagari: "केदारनाथ",
    coords: [30.7346, 79.0669],
    location: "Kedarnath",
    state: "Uttarakhand",
    associatedRiver: "Mandakini",
    legend: "Where the Pāṇḍavas sought Śiva's forgiveness after the Kurukṣetra war. Śiva manifested as a bull's hump.",
    puranicSource: "Skanda Purāṇa",
    asceticOrders: ["Giri", "Puri", "Bharati"],
    kumbhMela: false,
    pilgrimageSignificance: "Part of Chota Char Dham, highest Jyotirliṅga at 3,583m"
  },
  {
    name: "Bhimashankar",
    nameDevanagari: "भीमाशंकर",
    coords: [19.0728, 73.5362],
    location: "Bhimashankar",
    state: "Maharashtra",
    associatedRiver: "Bhima",
    legend: "Where Śiva defeated the demon Tripurāsura. Source of the Bhīmā river.",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Sarasvati", "Tirtha"],
    kumbhMela: false,
    pilgrimageSignificance: "Sacred forests, wildlife sanctuary"
  },
  {
    name: "Vishwanath",
    nameDevanagari: "विश्वनाथ",
    coords: [25.3176, 83.0099],
    location: "Varanasi (Kashi)",
    state: "Uttar Pradesh",
    associatedRiver: "Ganga",
    legend: "Most sacred of all Jyotirliṅgas. Kāśī, the eternal city, never abandoned by Śiva. Site of cosmic pillar of light.",
    puranicSource: "Kāśī Khaṇḍa (Skanda Purāṇa)",
    asceticOrders: ["All Dashanami Orders", "Nāth Yogis", "Aghoris"],
    kumbhMela: false,
    pilgrimageSignificance: "Most sacred city in Hinduism, Mokṣa-kṣetra (liberation field)"
  },
  {
    name: "Tryambakeshwar",
    nameDevanagari: "त्र्यंबकेश्वर",
    coords: [19.9333, 73.5333],
    location: "Trimbak",
    state: "Maharashtra",
    associatedRiver: "Godavari (source)",
    legend: "Source of the Godāvarī river. Śiva appeared with three faces (Brahmā, Viṣṇu, Rudra) to sage Gautama.",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Giri", "Puri", "Bharati", "Nāth Yogis"],
    kumbhMela: true,
    pilgrimageSignificance: "Kumbh Melā site (Simhastha), sacred Brahmagiri mountain"
  },
  {
    name: "Vaidyanath",
    nameDevanagari: "वैद्यनाथ",
    coords: [24.4908, 86.7029],
    location: "Deoghar",
    state: "Jharkhand",
    associatedRiver: "None (dry region)",
    legend: "Where Śiva healed (vaidya) Rāvaṇa after he offered his heads in devotion. Also called Baidyanath.",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Giri", "Puri"],
    kumbhMela: false,
    pilgrimageSignificance: "Śrāvaṇa month pilgrimage, kanwariyas carry Gangā water"
  },
  {
    name: "Nageshwar",
    nameDevanagari: "नागेश्वर",
    coords: [22.2397, 69.0839],
    location: "Dwarka",
    state: "Gujarat",
    associatedRiver: "Arabian Sea",
    legend: "Where Śiva protected his devotee Supriya from the demon Daruka. Lord of serpents (Nāgeśvara).",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Sagara", "Aranya"],
    kumbhMela: false,
    pilgrimageSignificance: "Near Dvārakā (Kṛṣṇa's capital), coastal pilgrimage"
  },
  {
    name: "Ramanathaswamy",
    nameDevanagari: "रामनाथस्वामी",
    coords: [9.2876, 79.3129],
    location: "Rameswaram",
    state: "Tamil Nadu",
    associatedRiver: "Indian Ocean",
    legend: "Installed by Śrī Rāma to absolve sin of killing Rāvaṇa (a Brahmin). Bridge to Lanka built from this site.",
    puranicSource: "Skanda Purāṇa",
    asceticOrders: ["Sagara", "Bharati"],
    kumbhMela: false,
    pilgrimageSignificance: "Southernmost Jyotirliṅga, Char Dham pilgrimage, sacred bath (22 wells)"
  },
  {
    name: "Grishneshwar",
    nameDevanagari: "घृष्णेश्वर",
    coords: [20.0244, 75.1779],
    location: "Ellora (near Aurangabad)",
    state: "Maharashtra",
    associatedRiver: "None (dry region)",
    legend: "Where Śiva appeared to Ghushma, a devoted woman. Last of the twelve Jyotirliṅgas listed in scriptures.",
    puranicSource: "Śiva Purāṇa",
    asceticOrders: ["Giri", "Puri"],
    kumbhMela: false,
    pilgrimageSignificance: "Near Ellora caves (UNESCO site), smallest temple among 12"
  }
];

// Pilgrimage routes connecting Jyotirlingas (major traditional circuits)
export const PILGRIMAGE_ROUTES = [
  {
    name: "Western Circuit",
    color: "#f97316", // orange
    coordinates: [
      [20.8880, 70.4013], // Somnath
      [22.2397, 69.0839], // Nageshwar
      [23.1765, 75.7685], // Mahakaleshwar
      [22.2394, 76.1469], // Omkareshwar
      [19.9333, 73.5333], // Tryambakeshwar
      [19.0728, 73.5362], // Bhimashankar
      [20.0244, 75.1779], // Grishneshwar
    ] as [number, number][],
  },
  {
    name: "Northern Circuit",
    color: "#3b82f6", // blue
    coordinates: [
      [25.3176, 83.0099], // Vishwanath
      [30.7346, 79.0669], // Kedarnath
      [24.4908, 86.7029], // Vaidyanath
    ] as [number, number][],
  },
  {
    name: "Southern Circuit",
    color: "#10b981", // green
    coordinates: [
      [16.0739, 78.8677], // Mallikarjuna
      [9.2876, 79.3129],  // Ramanathaswamy
    ] as [number, number][],
  },
];
