import { 
  IconSarnathLion, IconConch, IconOm, IconBasalt, IconDharmaChakra 
} from "@/components/icons";
import { LucideIcon } from "lucide-react";

export interface ResearchTheme {
  id: string;
  name: string;
  nameSanskrit: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorderColor: string;
}

export const researchThemes: ResearchTheme[] = [
  {
    id: "ancient-india",
    name: "Ancient India",
    nameSanskrit: "प्राचीन भारत",
    description: "Vedic preservation, tribal continuity, and civilizational memory through millennia",
    path: "/themes/ancient-india",
    icon: IconSarnathLion,
    color: "text-saffron",
    bgColor: "bg-saffron/10",
    borderColor: "border-saffron/30",
    hoverBorderColor: "hover:border-saffron",
  },
  {
    id: "indian-ocean",
    name: "Indian Ocean World",
    nameSanskrit: "हिन्द महासागर",
    description: "Maritime networks, monsoon trade routes, and oceanic civilizations",
    path: "/themes/indian-ocean-world",
    icon: IconConch,
    color: "text-peacock-blue",
    bgColor: "bg-peacock-blue/10",
    borderColor: "border-peacock-blue/30",
    hoverBorderColor: "hover:border-peacock-blue",
  },
  {
    id: "scripts-inscriptions",
    name: "Scripts & Inscriptions",
    nameSanskrit: "लिपि एवं शिलालेख",
    description: "Epigraphy from Kandahar to Kutai — stone records across continents",
    path: "/themes/scripts-inscriptions",
    icon: IconOm,
    color: "text-indigo-dharma",
    bgColor: "bg-indigo-dharma/10",
    borderColor: "border-indigo-dharma/30",
    hoverBorderColor: "hover:border-indigo-light",
  },
  {
    id: "geology-deep-time",
    name: "Geology & Deep Time",
    nameSanskrit: "भूविज्ञान",
    description: "From Gondwana breakup to Himalayan uplift — Earth's memory meets sacred geography",
    path: "/themes/geology-deep-time",
    icon: IconBasalt,
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
    borderColor: "border-terracotta/30",
    hoverBorderColor: "hover:border-terracotta",
  },
  {
    id: "empires-exchange",
    name: "Empires & Exchange",
    nameSanskrit: "साम्राज्य एवं विनिमय",
    description: "Mauryas to Cholas, Silk Road to Spice Routes — power and commerce",
    path: "/themes/empires-exchange",
    icon: IconDharmaChakra,
    color: "text-turmeric",
    bgColor: "bg-turmeric/10",
    borderColor: "border-turmeric/30",
    hoverBorderColor: "hover:border-turmeric",
  },
];

// Theme ID mapping for database queries
export const themeIdToDbNames: Record<string, string[]> = {
  "ancient-india": ["Ancient India", "ancient-india", "sacred-geography", "acoustic-archaeology"],
  "indian-ocean": ["Indian Ocean World", "indian-ocean-world", "indian-ocean"],
  "scripts-inscriptions": ["Scripts & Inscriptions", "scripts-inscriptions", "scripts-and-inscriptions"],
  "geology-deep-time": ["Geology & Deep Time", "geology-deep-time", "geology"],
  "empires-exchange": ["Empires & Exchange", "empires-exchange", "empires-and-exchange"],
  "sacred-ecology": ["Sacred Ecology", "sacred-ecology"],
};

export function getThemeById(id: string): ResearchTheme | undefined {
  return researchThemes.find(theme => theme.id === id);
}
