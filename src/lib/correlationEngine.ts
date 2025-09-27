// Simple CSV parser for correlation data

export interface CorrelationData {
  page_or_card: string;
  claim: string;
  evidence_primary: string;
  evidence_archaeology: string;
  pin_place: string;
  lat: string;
  lon: string;
  suggested_article: string;
  mla_primary: string;
  confidence?: 'high' | 'medium' | 'low';
  needs_citation?: boolean;
}

export interface Pin {
  name: string;
  lat: number;
  lon: number;
  approximate: boolean;
  category?: string;
  evidence_types?: string[];
  description?: string;
}

export interface SourcesAndPins {
  primary_sources: string[];
  archaeology_evidence: string[];
  pins: Pin[];
  mla_citations: string[];
  claims: {
    text: string;
    confidence: string;
    needs_citation: boolean;
  }[];
}

class CorrelationEngine {
  private correlationData: CorrelationData[] = [];
  
  constructor() {
    this.loadCorrelationData();
  }

  private async loadCorrelationData() {
    try {
      // Load the CSV data - in a real implementation this would be dynamic
      // For now, we'll return mock data that matches the structure
      this.correlationData = [
        {
          page_or_card: "Ancient India",
          claim: "Mauryan ports had systematic naval administration",
          evidence_primary: "Arthaśāstra navādhyakṣa provisions",
          evidence_archaeology: "Tamralipti harbor installations",
          pin_place: "Tamralipti",
          lat: "22.28",
          lon: "87.92",
          suggested_article: "Bharats Ancient Heritage",
          mla_primary: "Olivelle, Patrick. King, Governance, and Law in Ancient India. Oxford UP, 2013.",
          confidence: 'high',
          needs_citation: false
        },
        {
          page_or_card: "Indian Ocean World",
          claim: "Roman-Indian pepper trade transformed imperial finances",
          evidence_primary: "Periplus Maris Erythraei price records",
          evidence_archaeology: "Berenike spice containers",
          pin_place: "Muziris",
          lat: "10.21",
          lon: "76.26",
          suggested_article: "Pepper and Bullion",
          mla_primary: "Casson, Lionel. The Periplus Maris Erythraei. Princeton UP, 1989.",
          confidence: 'medium',
          needs_citation: true
        },
        {
          page_or_card: "Empires & Exchange",
          claim: "Chola naval expedition restructured Southeast Asian trade",
          evidence_primary: "Thanjavur inscription details",
          evidence_archaeology: "Sungai Batu occupation layers",
          pin_place: "Kedah",
          lat: "5.69",
          lon: "100.50",
          suggested_article: "The Chola Naval Raid",
          mla_primary: "Nilakanta Sastri, K.A. The Cōḷas. University of Madras, 1955.",
          confidence: 'high',
          needs_citation: false
        }
      ];
    } catch (error) {
      console.error('Failed to load correlation data:', error);
    }
  }

  public getSourcesAndPins(pageOrCard: string): SourcesAndPins {
    const matches = this.correlationData.filter(
      row => row.page_or_card.toLowerCase().includes(pageOrCard.toLowerCase()) ||
             pageOrCard.toLowerCase().includes(row.page_or_card.toLowerCase())
    );

    const primarySources = [...new Set(matches.map(m => m.evidence_primary).filter(Boolean))];
    const archaeologyEvidence = [...new Set(matches.map(m => m.evidence_archaeology).filter(Boolean))];
    const mlaCitations = [...new Set(matches.map(m => m.mla_primary).filter(Boolean))];
    
    // Deduplicate pins by location
    const pinMap = new Map<string, Pin>();
    matches.forEach(match => {
      if (match.pin_place && match.lat && match.lon) {
        const key = `${match.pin_place}_${match.lat}_${match.lon}`;
        if (!pinMap.has(key)) {
          pinMap.set(key, {
            name: match.pin_place,
            lat: parseFloat(match.lat),
            lon: parseFloat(match.lon),
            approximate: match.pin_place.includes('[approx.]') || match.confidence === 'low',
            category: this.categorizePin(match.page_or_card),
            evidence_types: [match.evidence_primary, match.evidence_archaeology].filter(Boolean),
            description: match.claim
          });
        }
      }
    });

    const claims = matches.map(match => ({
      text: match.claim,
      confidence: match.confidence || 'medium',
      needs_citation: match.needs_citation || false
    }));

    return {
      primary_sources: primarySources,
      archaeology_evidence: archaeologyEvidence,
      pins: Array.from(pinMap.values()),
      mla_citations: mlaCitations,
      claims
    };
  }

  private categorizePin(pageOrCard: string): string {
    const categories = {
      'ports': ['port', 'emporia', 'harbor'],
      'inscription': ['edict', 'inscription', 'kandahar'],
      'archaeology': ['archaeology', 'excavation', 'find'],
      'governance': ['mauryan', 'governance', 'administration'],
      'naval': ['chola', 'naval', 'fleet', 'raid']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => pageOrCard.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  public getPinsByCategory(category: string): Pin[] {
    const allPins = this.correlationData
      .filter(row => row.pin_place && row.lat && row.lon)
      .map(row => ({
        name: row.pin_place,
        lat: parseFloat(row.lat),
        lon: parseFloat(row.lon),
        approximate: row.pin_place.includes('[approx.]') || row.confidence === 'low',
        category: this.categorizePin(row.page_or_card),
        evidence_types: [row.evidence_primary, row.evidence_archaeology].filter(Boolean),
        description: row.claim
      }));

    return category === 'all' ? allPins : allPins.filter(pin => pin.category === category);
  }
}

export const correlationEngine = new CorrelationEngine();