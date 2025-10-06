import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeDeciduous, Mountain, Music, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapSite {
  id: string;
  name: string;
  region: string;
  type: 'grove' | 'megalith' | 'petroglyph' | 'festival';
  description: string;
  significance: string;
  confidence: 'H' | 'M' | 'L';
  coordinates?: string;
}

const sites: MapSite[] = [
  {
    id: 'srirangam',
    name: 'Śrīraṅgam',
    region: 'Tamil Nadu',
    type: 'grove',
    description: 'Sthāla-vṛkṣa temple complex with tree–tank–procession system',
    significance: 'Exemplar of tree-first, temple-later sacred architecture',
    confidence: 'H'
  },
  {
    id: 'nartiang',
    name: 'Nartiang',
    region: 'Meghalaya',
    type: 'megalith',
    description: 'Menhir clusters adjacent to Law Kyntang sacred groves',
    significance: 'Living megalithic social grammar with grove adjacency',
    confidence: 'H'
  },
  {
    id: 'kupgal',
    name: 'Kupgal-Sanganakallu',
    region: 'Karnataka',
    type: 'petroglyph',
    description: 'Neolithic petroglyphs with acoustic "rock gongs"',
    significance: 'Performance landscapes with sound-stone-season grammar',
    confidence: 'H'
  },
  {
    id: 'law-kyntang',
    name: 'Law Kyntang/Lyngdoh',
    region: 'Meghalaya (Khasi-Jaintia)',
    type: 'grove',
    description: 'Sacred forests under priestly lineage governance',
    significance: 'Old-growth refugia buffering springs and biodiversity',
    confidence: 'H'
  },
  {
    id: 'devrai',
    name: 'Devrai/Devarakāḍu',
    region: 'Western Ghats',
    description: 'God-groves from Konkan to Kodagu',
    type: 'grove',
    significance: 'Customary law protecting water security and pollinators',
    confidence: 'H'
  },
  {
    id: 'sarna',
    name: 'Sarna/Jaher Groves',
    region: 'Jharkhand-Odisha-Bengal',
    type: 'grove',
    description: 'Sal-dominated village groves for Sarhul and Karam rites',
    significance: 'Forest–field reciprocity and spring ritual calendar',
    confidence: 'H'
  },
  {
    id: 'edakkal',
    name: 'Edakkal',
    region: 'Kerala (Wayanad)',
    type: 'petroglyph',
    description: 'Pass petroglyphs spanning multiple periods',
    significance: 'Stone archive in mobile landscape',
    confidence: 'M'
  },
  {
    id: 'bastar',
    name: 'Bastar Dussehra Route',
    region: 'Chhattisgarh (Bastar)',
    type: 'festival',
    description: 'Weeks-long processional route through forests and villages',
    significance: 'Polity as procession dramatizing sacred geography',
    confidence: 'H'
  },
  {
    id: 'wangala',
    name: 'Wāngalā Festival Zones',
    region: 'Meghalaya (Garo Hills)',
    type: 'festival',
    description: 'Hundred drums post-harvest thanksgiving to Sun',
    significance: 'Sonic calendar of land and sky',
    confidence: 'H'
  },
  {
    id: 'malabar-kavu',
    name: 'Malabar Kāvu',
    region: 'Kerala (Malabar)',
    type: 'grove',
    description: 'Sacred groves with serpent shrines and Theyyam performance',
    significance: 'Tree-mask-drum-story ritual circuits',
    confidence: 'H'
  }
];

const typeConfig = {
  grove: { color: 'bg-green-500/10 border-green-500', icon: TreeDeciduous, label: 'Sacred Grove' },
  megalith: { color: 'bg-stone-500/10 border-stone-500', icon: Mountain, label: 'Megalithic Site' },
  petroglyph: { color: 'bg-amber-500/10 border-amber-500', icon: Music, label: 'Petroglyph/Acoustic' },
  festival: { color: 'bg-purple-500/10 border-purple-500', icon: MapPin, label: 'Festival Region' }
};

const confidenceColors = {
  H: 'bg-green-600',
  M: 'bg-yellow-600',
  L: 'bg-orange-600'
};

export function SacredTreeMap() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredSites = selectedType 
    ? sites.filter(s => s.type === selectedType)
    : sites;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="ancient-navigation">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MapPin className="text-primary animate-pulse-gentle" size={24} />
          Sacred Geography: Groves, Megaliths, and Festival Landscapes
        </CardTitle>
        <CardDescription>
          Distribution of sacred sites across Bhāratavarṣa where ritual time is encoded in trees, stones, and seasonal performance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            All Sites ({sites.length})
          </Button>
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const count = sites.filter(s => s.type === type).length;
            return (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                <Icon size={16} className="mr-1" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredSites.map((site) => {
            const config = typeConfig[site.type];
            const Icon = config.icon;
            
            return (
              <div
                key={site.id}
                className={`p-4 rounded-lg border-l-4 ${config.color} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Icon className="text-primary mt-1" size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{site.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${confidenceColors[site.confidence]} text-white border-0`}
                      >
                        {site.confidence}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{site.region}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{site.description}</p>
                  <p className="text-accent text-xs">
                    <strong>Significance:</strong> {site.significance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-3">Understanding the Map</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-foreground mb-2">Site Types:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <TreeDeciduous size={16} className="text-green-500" />
                  <span>Sacred groves protecting water and biodiversity</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mountain size={16} className="text-stone-500" />
                  <span>Megalithic memory stones with grove adjacency</span>
                </li>
                <li className="flex items-center gap-2">
                  <Music size={16} className="text-amber-500" />
                  <span>Petroglyph/acoustic sites as performance landscapes</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} className="text-purple-500" />
                  <span>Festival regions with harvest calendar rites</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">Confidence Markers:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Badge className="bg-green-600 text-white text-xs">H</Badge>
                  <span>High: Multiple convergent sources, clear evidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge className="bg-yellow-600 text-white text-xs">M</Badge>
                  <span>Medium: Partial support, one interpretation of several</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge className="bg-orange-600 text-white text-xs">L</Badge>
                  <span>Low: Oral tradition without material confirmation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Interactive map shows ethnographic, archaeological, and geological evidence for sacred ecology across India
        </div>
      </CardContent>
    </Card>
  );
}
