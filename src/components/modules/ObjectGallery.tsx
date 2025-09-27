import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconConch, IconEdict, IconBasalt } from '@/components/icons';
import { MapPin, Calendar, Ruler, Eye, ExternalLink } from 'lucide-react';

interface ArtifactObject {
  id: string;
  name: string;
  type: 'ceramic' | 'coin' | 'anchor' | 'inscription' | 'textile' | 'organic';
  period: string;
  site: string;
  coordinates?: [number, number];
  culture: string;
  description: string;
  significance: string;
  dimensions?: string;
  material: string;
  currentLocation: string;
  imageUrl?: string;
  excavationYear?: string;
  tradeConnections: string[];
  relatedSites: string[];
  bibliography: string[];
}

const ARTIFACTS: ArtifactObject[] = [
  {
    id: 'arikamedu-amphora',
    name: 'Roman Amphora Sherds',
    type: 'ceramic',
    period: '1st century BCE - 2nd century CE',
    site: 'Arikamedu, Puducherry',
    coordinates: [79.83, 11.93],
    culture: 'Roman/Mediterranean',
    description: 'Large ceramic storage vessels used for transporting wine, oil, and garum (fish sauce) from the Mediterranean to the Indian Ocean. The Arikamedu examples show typical Dressel forms with painted inscriptions indicating contents and origins.',
    significance: 'Direct evidence of Roman maritime trade reaching the Coromandel Coast. These amphora represent organized, large-scale exchange between the Roman Empire and South India, corroborating accounts in the Periplus.',
    dimensions: 'H: 60-80cm, Rim diameter: 12-15cm',
    material: 'Fired clay, occasional lead-glazed examples',
    currentLocation: 'Government Museum, Chennai',
    imageUrl: '/images/artifacts/roman-amphora.jpg',
    excavationYear: '1940s-1950s (Wheeler)',
    tradeConnections: ['Red Sea ports', 'Alexandria', 'Mediterranean workshops'],
    relatedSites: ['Muziris', 'Barbarikon', 'Puhar'],
    bibliography: ['Begley & De Puma 1991', 'Tomber 2008', 'Wheeler et al. 1946']
  },
  {
    id: 'mantai-rouletted-ware',
    name: 'Rouletted Ware Bowl',
    type: 'ceramic',
    period: '3rd century BCE - 3rd century CE',
    site: 'Mantai, Sri Lanka',
    coordinates: [79.833, 8.036],
    culture: 'Indo-Pacific/South Asian',
    description: 'Fine red-slipped pottery decorated with rouletted (wheel-made) patterns around the rim and body. This distinctive ware appears at multiple Indian Ocean sites, suggesting either centralized production or shared technological traditions.',
    significance: 'Hallmark of Indian Ocean connectivity. Its wide distribution from Arikamedu to Southeast Asia indicates established trade networks and possibly standardized ceramic technology for maritime markets.',
    dimensions: 'Rim diameter: 15-25cm, Height: 8-12cm',
    material: 'Fine-tempered red clay with red slip',
    currentLocation: 'Colombo National Museum',
    excavationYear: '1980s (Carswell)',
    tradeConnections: ['Arikamedu production centers', 'Southeast Asian ports', 'East African coast'],
    relatedSites: ['Arikamedu', 'Oc Eo', 'Khor Rori', 'Berenice'],
    bibliography: ['Carswell 1991', 'Begley 1996', 'Tomber 2007']
  },
  {
    id: 'malabar-anchor',
    name: 'Stone Anchor with Tamil-Brahmi',
    type: 'anchor',
    period: '2nd-4th century CE',
    site: 'Malabar Coast, Kerala',
    coordinates: [75.8, 11.2],
    culture: 'South Indian maritime',
    description: 'Granite stone anchor with Tamil-Brahmi inscription mentioning merchant guild affiliation. These heavy anchors were used by large ocean-going vessels, with inscriptions indicating ownership or dedicatory purposes.',
    significance: 'Evidence of organized merchant shipping with guild structures. The inscriptions suggest ritual consecration of maritime equipment, linking trade ventures with religious practice.',
    dimensions: 'Length: 120cm, Weight: ~200kg',
    material: 'Local granite with iron reinforcement',
    currentLocation: 'Kerala Museum, Thiruvananthapuram',
    excavationYear: '1990s (underwater survey)',
    tradeConnections: ['Arabian Sea circuits', 'Socotra Island', 'Red Sea passages'],
    relatedSites: ['Muziris', 'Tyndis', 'Socotra caves'],
    bibliography: ['Cherian et al. 2007', 'Tomber 2008', 'Shajan et al. 2004']
  },
  {
    id: 'kutai-gold-coins',
    name: 'Kutai Kingdom Gold Coins',
    type: 'coin',
    period: '4th-5th century CE',
    site: 'Muara Kaman, East Kalimantan',
    coordinates: [116.61, -0.27],
    culture: 'Indianized Southeast Asian',
    description: 'Gold coins featuring Sanskrit inscriptions and Indian iconography (conch, lotus, śrīvatsa). Minted by the Kutai kingdom contemporary with the yūpa inscriptions, showing sophisticated monetary systems in early Southeast Asian polities.',
    significance: 'Demonstrates Indianization beyond cultural borrowing to include economic systems. The coins indicate that Sanskrit-literate elites controlled both trade and currency, integrating Indian Ocean commercial practices.',
    dimensions: 'Diameter: 18-22mm, Weight: 7-9g',
    material: 'High-purity gold (>85%)',
    currentLocation: 'Museum Mulawarman, Tenggarong',
    excavationYear: '1920s-1930s (Dutch period)',
    tradeConnections: ['South Indian ports', 'Java', 'Malay Peninsula'],
    relatedSites: ['Oc Eo', 'Funan centers', 'Takuapa'],
    bibliography: ['Bosch 1961', 'Kulke 1991', 'Miksic 2013']
  },
  {
    id: 'socotra-brahmi-graffiti',
    name: 'Brahmi Cave Inscriptions',
    type: 'inscription',
    period: '1st-4th century CE',
    site: 'Hoq Cave, Socotra Island',
    coordinates: [53.823, 12.463],
    culture: 'Indian maritime (multiple regions)',
    description: 'Numerous Brahmi graffiti inscribed by Indian sailors and traders taking shelter in Socotra\'s caves. Names, prayers, and short dedicatory texts in various Prakrit dialects reveal the diversity of Indian Ocean voyagers.',
    significance: 'Unprecedented window into the lived experience of ancient Indian Ocean navigation. The inscriptions show Socotra as a crucial waystation where multiple Indian regional traditions converged.',
    dimensions: 'Individual inscriptions: 5-15cm length',
    material: 'Carbon ink/soot on limestone cave walls',
    currentLocation: 'In situ (documented photographically)',
    excavationYear: '1990s-2000s (Strauch, Robin)',
    tradeConnections: ['Bharuch/Barygaza', 'South Indian ports', 'Red Sea navigation'],
    relatedSites: ['Kanheri caves', 'Nasik caves', 'Karla'],
    bibliography: ['Robin & Gorea 2002', 'Strauch 2012', 'Dridi 2012']
  },
  {
    id: 'pepper-storage-jar',
    name: 'Pepper Storage Jar (Bharaṇi)',
    type: 'ceramic',
    period: '1st-3rd century CE',
    site: 'Pattanam (ancient Muziris), Kerala',
    coordinates: [76.2, 10.17],
    culture: 'South Indian/Malabar',
    description: 'Large ceramic storage vessels designed specifically for pepper preservation during maritime transport. Interior surfaces show pepper residue analysis, confirming their use in the lucrative spice trade documented in the Periplus.',
    significance: 'Material evidence for the pepper trade that connected South India with the Roman Empire. These jars represent the technological adaptation required for long-distance spice commerce.',
    dimensions: 'Height: 45-60cm, Mouth diameter: 25cm',
    material: 'Coarse red clay with organic temper',
    currentLocation: 'Pattanam Archaeological Site Museum',
    excavationYear: '2007-2015 (KCHR excavations)',
    tradeConnections: ['Roman Red Sea trade', 'Alexandria merchants', 'Socotra hub'],
    relatedSites: ['Arikamedu', 'Barbarikon', 'Myos Hormos'],
    bibliography: ['Cherian et al. 2007', 'Tomber 2008', 'Shajan et al. 2004']
  },
  {
    id: 'chola-ship-anchor',
    name: 'Bronze Ship Fitting with Royal Inscription',
    type: 'anchor',
    period: '11th-12th century CE',
    site: 'Nagapattinam, Tamil Nadu',
    coordinates: [79.85, 10.77],
    culture: 'Chola imperial',
    description: 'Ornate bronze ship fitting inscribed with Tamil and Sanskrit verses praising Chola naval power. Likely from a royal vessel used in Chola naval expeditions to Southeast Asia, combining functional maritime equipment with imperial propaganda.',
    significance: 'Represents the height of Indian Ocean naval power under the Cholas. The inscription links royal ideology with maritime dominance, showing how naval expeditions served both commercial and political purposes.',
    dimensions: 'Length: 85cm, decorated sections: 25x15cm',
    material: 'Bronze with silver inlay work',
    currentLocation: 'Thanjavur Art Gallery',
    excavationYear: '1960s (ASI recovery)',
    tradeConnections: ['Chola Southeast Asian expeditions', 'Srivijaya contacts', 'Pagan trade'],
    relatedSites: ['Kedah', 'Palembang', 'Bagan'],
    bibliography: ['Nilakanta Sastri 1955', 'Sen 2006', 'Ptak 1998']
  }
];

interface ObjectGalleryProps {
  onLocationClick?: (lat: number, lon: number, artifact: ArtifactObject) => void;
}

export function ObjectGallery({ onLocationClick }: ObjectGalleryProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactObject | null>(null);

  const types = [...new Set(ARTIFACTS.map(a => a.type))];
  const periods = [...new Set(ARTIFACTS.map(a => a.period.split('-')[0].trim()))];

  const filteredArtifacts = ARTIFACTS.filter(artifact => {
    const typeMatch = selectedType === 'all' || artifact.type === selectedType;
    const periodMatch = selectedPeriod === 'all' || artifact.period.includes(selectedPeriod);
    return typeMatch && periodMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ceramic': return <IconBasalt className="text-earthen" size={20} />;
      case 'coin': return <IconConch className="text-saffron" size={20} />;
      case 'inscription': return <IconEdict className="text-ocean" size={20} />;
      case 'anchor': return <IconConch className="text-charcoal" size={20} />;
      default: return <IconBasalt className="text-muted-foreground" size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ceramic: 'bg-earthen/10 text-earthen border-earthen/20',
      coin: 'bg-saffron/10 text-saffron border-saffron/20',
      inscription: 'bg-ocean/10 text-ocean border-ocean/20',
      anchor: 'bg-charcoal/10 text-charcoal border-charcoal/20',
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <IconBasalt size={32} className="text-earthen" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Object Gallery</h2>
          <IconConch size={32} className="text-saffron" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Archaeological witnesses to Indian Ocean exchange—from Roman amphorae to merchant anchors, 
          each artifact tells stories of monsoon voyages and cultural encounter.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Type:</span>
          <Button
            variant={selectedType === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Types
          </Button>
          {types.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <Calendar size={16} />
          <span className="text-sm font-medium">Period:</span>
          {periods.slice(0, 4).map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="text-xs"
            >
              {period === 'all' ? 'All' : period}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artifacts Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArtifacts.map((artifact) => (
            <Card 
              key={artifact.id} 
              className={`cursor-pointer transition-all duration-300 hover:border-primary/30 ${
                selectedArtifact?.id === artifact.id ? 'border-primary bg-primary/5' : 'bg-card/50 backdrop-blur-sm'
              }`}
              onClick={() => setSelectedArtifact(artifact)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(artifact.type)}
                    <div>
                      <CardTitle className="text-base font-serif text-foreground">
                        {artifact.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {artifact.site} • {artifact.culture}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getTypeColor(artifact.type)}`}>
                    {artifact.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg flex items-center justify-center">
                  <Eye size={24} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-2">Archaeological Photo</span>
                </div>
                
                <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                  {artifact.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{artifact.period}</span>
                </div>
                
                {artifact.dimensions && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Ruler size={12} />
                    <span>{artifact.dimensions}</span>
                  </div>
                )}
                
                {artifact.coordinates && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocationClick?.(artifact.coordinates![1], artifact.coordinates![0], artifact);
                    }}
                    className="w-full justify-start text-xs text-muted-foreground hover:text-primary"
                  >
                    <MapPin size={12} className="mr-1" />
                    View on Map
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedArtifact ? (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedArtifact.type)}
                  Artifact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <h3 className="text-lg font-serif text-foreground mb-2">{selectedArtifact.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{selectedArtifact.site}</div>
                    <div>{selectedArtifact.period}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedArtifact.description}
                  </p>
                </div>

                <div className="bg-amber/5 p-3 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Historical Significance</h4>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {selectedArtifact.significance}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Material</h5>
                    <p className="text-muted-foreground">{selectedArtifact.material}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Culture</h5>
                    <p className="text-muted-foreground">{selectedArtifact.culture}</p>
                  </div>
                  {selectedArtifact.dimensions && (
                    <div className="col-span-2">
                      <h5 className="font-medium text-foreground mb-1">Dimensions</h5>
                      <p className="text-muted-foreground">{selectedArtifact.dimensions}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Trade Connections</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedArtifact.tradeConnections.map((connection, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Related Sites</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedArtifact.relatedSites.map((site, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {site}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Current Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedArtifact.currentLocation}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Bibliography</h4>
                  <div className="space-y-1">
                    {selectedArtifact.bibliography.map((source, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        • {source}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50">
              <CardContent className="pt-6 text-center">
                <IconBasalt size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select an artifact to view detailed information, provenance, and cultural significance
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {filteredArtifacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No artifacts match the selected filters.</p>
        </div>
      )}
    </div>
  );
}