import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeDeciduous, Leaf, Droplets, Heart } from 'lucide-react';

interface TreeSpecies {
  commonName: string;
  sanskritName: string;
  botanicalName: string;
  ritualUse: string;
  ecologicalRole: string;
  regions: string[];
  confidence: 'H' | 'M' | 'L';
  iconicAssociation?: string;
}

const sacredTrees: TreeSpecies[] = [
  {
    commonName: 'Banyan',
    sanskritName: 'Vaṭa',
    botanicalName: 'Ficus benghalensis',
    ritualUse: 'Dakṣiṇāmūrti meditation site, council grounds, oath-rituals at boundaries',
    ecologicalRole: 'Living cloisters with aerial roots; shade moderates tank-microclimates; pollinator keystone',
    regions: ['Pan-India', 'Tamil Nadu', 'Maharashtra', 'Bengal'],
    confidence: 'H',
    iconicAssociation: 'Gnosis under a tree; village councils'
  },
  {
    commonName: 'Peepal / Bodhi',
    sanskritName: 'Pippala',
    botanicalName: 'Ficus religiosa',
    ritualUse: 'Meditation tree, vāta-pitta-kapha healing, nocturnal vow prayers with lamp niches',
    ecologicalRole: 'Pollinator and frugivore keystone in settlement ecology; sacred grove anchor',
    regions: ['Pan-India', 'Bihar', 'Uttar Pradesh', 'Tamil Nadu'],
    confidence: 'H',
    iconicAssociation: 'Buddha\'s enlightenment; meditation'
  },
  {
    commonName: 'Bilva',
    sanskritName: 'Bilva',
    botanicalName: 'Aegle marmelos',
    ritualUse: 'Tri-foliate leaves for Śaiva worship; fruit for fasting-breaking and seasonal offerings',
    ecologicalRole: 'Grove understory moisture protection; leaf/twig ritual economy',
    regions: ['North India', 'Central India', 'Bengal'],
    confidence: 'H',
    iconicAssociation: 'Śiva\'s sacred tree; trident leaves'
  },
  {
    commonName: 'Nīm / Neem',
    sanskritName: 'Nīm',
    botanicalName: 'Azadirachta indica',
    ritualUse: 'Cooling/healing ceremonies; fumigation smudges; protective threshold liminality',
    ecologicalRole: 'Pest control (azadirachtin); medicinal compounds; drought-resistant shade',
    regions: ['Pan-India', 'Rajasthan', 'Gujarat', 'Tamil Nadu'],
    confidence: 'H',
    iconicAssociation: 'Village pharmacy tree; protective deity'
  },
  {
    commonName: 'Sal',
    sanskritName: 'Śāl',
    botanicalName: 'Shorea robusta',
    ritualUse: 'Sarhul calendar cue (sal blossom arrival); Sarna/Jaher grove backbone',
    ecologicalRole: 'Forest canopy dominant; ground moisture regulation; mushroom flushes; timber',
    regions: ['Jharkhand', 'Odisha', 'Bengal', 'Chhattisgarh', 'Assam'],
    confidence: 'H',
    iconicAssociation: 'Eastern Adivāsi spring rites'
  },
  {
    commonName: 'Punnai',
    sanskritName: 'Punnai',
    botanicalName: 'Calophyllum inophyllum',
    ritualUse: 'Coastal temple tree (Kaveri-delta shrines, Śrīraṅgam); maritime ritual presence',
    ecologicalRole: 'Oil for medicine and waterproofing; timber for boat-making; coastal strand ecology',
    regions: ['Tamil Nadu coast', 'Kerala', 'Andhra Pradesh coast'],
    confidence: 'M',
    iconicAssociation: 'Maritime temples; boat memory'
  },
  {
    commonName: 'Śamī / Khejri',
    sanskritName: 'Śamī',
    botanicalName: 'Prosopis cineraria',
    ritualUse: 'Śamī-pūjā at Daśahrā; Bishnoi conservation ethics; victory/renewal narratives',
    ecologicalRole: 'Desert keystone: fodder, pod, nitrogen-fixing canopy; drought-resistant',
    regions: ['Rajasthan', 'Gujarat', 'Haryana', 'Punjab'],
    confidence: 'H',
    iconicAssociation: 'Bishnoi tree-hugging martyrs; desert resilience'
  },
  {
    commonName: 'Aśoka',
    sanskritName: 'Aśoka',
    botanicalName: 'Saraca asoca',
    ritualUse: 'Court-garden and grove tree; fertility motifs; late winter-spring flowers',
    ecologicalRole: 'Ornamental understory; medicinal bark; pollinator attractor',
    regions: ['North India', 'Bengal', 'Assam', 'Kerala'],
    confidence: 'M',
    iconicAssociation: 'Royal gardens; fertility symbolism'
  }
];

const confidenceColors = {
  H: 'bg-green-600',
  M: 'bg-yellow-600',
  L: 'bg-orange-600'
};

export function SacredTreeSpeciesGallery() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="ancient-navigation">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TreeDeciduous className="text-primary animate-pulse-gentle" size={24} />
          Sacred Tree Lexicon: Species, Rites, Ecologies
        </CardTitle>
        <CardDescription>
          Visual guide to India's sacred trees as both ritual media and ecological infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {sacredTrees.map((tree, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{tree.commonName}</h4>
                  <div className="text-sm text-muted-foreground">
                    <em>{tree.sanskritName}</em> • <span className="text-xs">{tree.botanicalName}</span>
                  </div>
                </div>
                <Badge 
                  className={`${confidenceColors[tree.confidence]} text-white border-0 text-xs`}
                >
                  {tree.confidence}
                </Badge>
              </div>

              {tree.iconicAssociation && (
                <div className="mb-3 p-2 bg-primary/5 rounded text-xs text-accent">
                  <strong>Iconic:</strong> {tree.iconicAssociation}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-foreground">
                    <Heart size={14} className="text-red-500" />
                    <strong>Ritual Use:</strong>
                  </div>
                  <p className="text-muted-foreground pl-6">{tree.ritualUse}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 text-foreground">
                    <Leaf size={14} className="text-green-500" />
                    <strong>Ecological Role:</strong>
                  </div>
                  <p className="text-muted-foreground pl-6">{tree.ecologicalRole}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 text-foreground">
                    <Droplets size={14} className="text-blue-500" />
                    <strong>Regions:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1 pl-6">
                    {tree.regions.map((region, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <TreeDeciduous className="text-primary" size={18} />
            Sacred Trees as Infrastructure
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            India's sacred trees are simultaneously <strong>ritual media</strong> (vow-sites, procession anchors, 
            festival calendars) and <strong>ecological infrastructure</strong> (shade, water retention, fodder, 
            pollinator support, medicinal compounds). This dual function explains their stubborn survival against 
            land-use churn: they are protected by both faith and function.
          </p>
          <div className="text-xs text-accent">
            The sthāla-vṛkṣa shows how temple architecture grew around pre-existing arboreal sanctity rather 
            than imposing a new sacred geography. Tree worship predates stone temples across India.
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Botanical identifications cross-referenced with ethnographic ritual use and ecological studies
        </div>
      </CardContent>
    </Card>
  );
}
