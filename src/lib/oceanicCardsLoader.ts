// Oceanic Cards Data Loader
import oceanicCardsJson from '@/data/oceanic_bharat/oceanic_cards_8.json';

export interface OceanicCard {
  slug: string;
  title: string;
  title_hi?: string;
  read_time_min: number;
  tags: string[];
  abstract: string;
  pins: Array<{
    name: string;
    lat: number;
    lon: number;
    approximate?: boolean;
  }>;
  mla_refs: string[];
}

export interface OceanicCardData {
  cards: OceanicCard[];
}

// Type assertion for the imported JSON data
const typedOceanicData = oceanicCardsJson as OceanicCardData;

export const getOceanicCards = (): OceanicCard[] => {
  return typedOceanicData.cards || [];
};

export const getOceanicCardBySlug = (slug: string): OceanicCard | undefined => {
  return typedOceanicData.cards?.find(card => card.slug === slug);
};

export const getOceanicCardsByTag = (tag: string): OceanicCard[] => {
  return typedOceanicData.cards?.filter(card => 
    card.tags.some(cardTag => cardTag.toLowerCase().includes(tag.toLowerCase()))
  ) || [];
};

export const getAllOceanicPins = () => {
  const allPins: Array<{
    name: string;
    lat: number;
    lon: number;
    approximate: boolean;
    cardSlug: string;
    cardTitle: string;
  }> = [];

  typedOceanicData.cards?.forEach(card => {
    card.pins.forEach(pin => {
      allPins.push({
        ...pin,
        approximate: pin.approximate || false,
        cardSlug: card.slug,
        cardTitle: card.title
      });
    });
  });

  return allPins;
};

// Export the data for external use
export const oceanicCardsData = typedOceanicData;