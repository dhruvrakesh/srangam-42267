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
      // Load expanded CSV data with 69 correlation points
      const response = await fetch('/src/data/oceanic_bharat/correlation_matrix_expanded.csv');
      const csvText = await response.text();
      
      this.correlationData = this.parseCSV(csvText);
    } catch (error) {
      console.error('Failed to load correlation data:', error);
      // Fallback to key Ancient India correlations
      this.correlationData = [
        {
          page_or_card: "Ancient India",
          claim: "Mauryan ports had systematic naval administration",
          evidence_primary: "Arthaśāstra navādhyakṣa provisions",
          evidence_archaeology: "Tamralipti harbor installations",
          pin_place: "Tamralipti",
          lat: "22.3",
          lon: "87.92",
          suggested_article: "Bharat's Ancient Heritage",
          mla_primary: "Olivelle, Patrick. King, Governance, and Law in Ancient India. Oxford UP, 2013."
        }
      ];
    }
  }

  private parseCSV(csvText: string): CorrelationData[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data: CorrelationData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length >= 9) {
        data.push({
          page_or_card: values[0],
          claim: values[1],
          evidence_primary: values[2],
          evidence_archaeology: values[3],
          pin_place: values[4],
          lat: values[5],
          lon: values[6],
          suggested_article: values[7],
          mla_primary: values[8],
          confidence: values[4]?.includes('[approx.]') ? 'low' : 'high',
          needs_citation: values[2] === '—' || values[3] === '—'
        });
      }
    }
    
    return data;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
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
    const categoryMap: Record<string, string> = {
      'Ports & Emporia': 'ports',
      'Transoceanic Hubs': 'transoceanic',
      'Epigraphy & Guilds': 'inscription',
      'Red Sea Gateways': 'red-sea',
      'Arabian Littoral': 'arabian',
      'Horn of Africa': 'horn-africa',
      'Western Indian Ocean': 'western-ocean',
      'Governance & Edicts': 'governance',
      'Court & Diplomacy': 'court',
      'Coin Hoards': 'coins',
      'Forts & Naval': 'naval',
      'Waypoints': 'waypoints',
      'Interior Corridors': 'interior',
      'Ritual Memory': 'ritual'
    };

    return categoryMap[pageOrCard] || 'general';
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

  public getAllCorrelationData(): CorrelationData[] {
    return this.correlationData;
  }
}

export const correlationEngine = new CorrelationEngine();