import { InscriptionShastra, InscriptionRegistry } from './interfaces';
import { kandaharEdict } from './kandahar/metadata';
import { kutaiYupa } from './kutai/metadata';
import { voCanhStele } from './vo-canh/metadata';
import { kedukanBukitStone } from './kedukan-bukit/metadata';

class InscriptionRegistryImpl implements InscriptionRegistry {
  inscriptions: InscriptionShastra[] = [
    kandaharEdict,
    kutaiYupa,
    voCanhStele,
    kedukanBukitStone
  ];

  getById(id: string): InscriptionShastra | undefined {
    return this.inscriptions.find(inscription => inscription.id === id);
  }

  getByTags(tags: string[]): InscriptionShastra[] {
    return this.inscriptions.filter(inscription =>
      tags.some(tag => inscription.tags.includes(tag))
    );
  }

  getByRegion(region: string): InscriptionShastra[] {
    return this.inscriptions.filter(inscription =>
      inscription.location.region.toLowerCase().includes(region.toLowerCase()) ||
      inscription.location.ancient.toLowerCase().includes(region.toLowerCase()) ||
      inscription.location.modern.toLowerCase().includes(region.toLowerCase())
    );
  }

  getByPeriod(period: string): InscriptionShastra[] {
    return this.inscriptions.filter(inscription =>
      inscription.period.dynasty.toLowerCase().includes(period.toLowerCase()) ||
      inscription.period.century.toLowerCase().includes(period.toLowerCase())
    );
  }

  search(query: string): InscriptionShastra[] {
    const lowercaseQuery = query.toLowerCase();
    return this.inscriptions.filter(inscription =>
      inscription.title.toLowerCase().includes(lowercaseQuery) ||
      inscription.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      inscription.location.ancient.toLowerCase().includes(lowercaseQuery) ||
      inscription.location.modern.toLowerCase().includes(lowercaseQuery) ||
      inscription.period.dynasty.toLowerCase().includes(lowercaseQuery) ||
      inscription.scripts.some(script => 
        script.translation.toLowerCase().includes(lowercaseQuery) ||
        script.transliteration?.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Additional utility methods
  getAllTags(): string[] {
    const allTags = this.inscriptions.flatMap(inscription => inscription.tags);
    return [...new Set(allTags)].sort();
  }

  getAllRegions(): string[] {
    const allRegions = this.inscriptions.map(inscription => inscription.location.region);
    return [...new Set(allRegions)].sort();
  }

  getAllPeriods(): string[] {
    const allPeriods = this.inscriptions.map(inscription => `${inscription.period.dynasty} (${inscription.period.century})`);
    return [...new Set(allPeriods)].sort();
  }

  getRelated(inscriptionId: string): InscriptionShastra[] {
    const inscription = this.getById(inscriptionId);
    if (!inscription) return [];

    return this.inscriptions.filter(other => 
      other.id !== inscriptionId && (
        // Same region
        other.location.region === inscription.location.region ||
        // Similar time period
        other.period.dynasty === inscription.period.dynasty ||
        // Shared tags
        other.tags.some(tag => inscription.tags.includes(tag)) ||
        // Explicitly related
        inscription.relatedInscriptions?.includes(other.id) ||
        other.relatedInscriptions?.includes(inscriptionId)
      )
    );
  }
}

// Export singleton instance
export const inscriptionRegistry = new InscriptionRegistryImpl();

// Export utility functions
export const createInscriptionShastra = (data: InscriptionShastra): InscriptionShastra => data;

export const addToRegistry = (inscription: InscriptionShastra): void => {
  inscriptionRegistry.inscriptions.push(inscription);
};

// Academic citation helpers
export const generateCitation = (inscription: InscriptionShastra, style: 'apa' | 'mla' | 'chicago' = 'apa'): string => {
  const { title, location, period, bibliography } = inscription;
  const date = period.dating.precise || period.dating.approximate;
  
  switch (style) {
    case 'apa':
      return `${title}. (${date}). ${location.ancient}, ${location.modern}. ${location.region}.`;
    case 'mla':
      return `"${title}." ${location.ancient}, ${location.modern}, ${date}.`;
    case 'chicago':
      return `${title}, ${location.ancient}, ${location.modern} (${date}).`;
    default:
      return `${title} (${date})`;
  }
};

// Export for book compilation
export const exportInscriptionsForBook = (inscriptionIds: string[]): {
  inscriptions: InscriptionShastra[];
  metadata: {
    totalCount: number;
    regions: string[];
    periods: string[];
    scriptTypes: string[];
  };
} => {
  const inscriptions = inscriptionIds
    .map(id => inscriptionRegistry.getById(id))
    .filter((inscription): inscription is InscriptionShastra => inscription !== undefined);

  const metadata = {
    totalCount: inscriptions.length,
    regions: [...new Set(inscriptions.map(i => i.location.region))],
    periods: [...new Set(inscriptions.map(i => i.period.dynasty))],
    scriptTypes: [...new Set(inscriptions.flatMap(i => i.scripts.map(s => s.scriptType)))]
  };

  return { inscriptions, metadata };
};