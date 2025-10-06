import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, MapPin, Sparkles, Droplets } from 'lucide-react';

interface TreeSpecies {
  commonName: string;
  sanskritName: string;
  vernacularNames: string[];
  botanicalName: string;
  coreRegions: string[];
  linkedRites: string[];
  oralMotifs: string;
  ecologicalRole: string;
  confidence: 'H' | 'M' | 'L';
  plateNumber: string;
  ritualUse?: string;
}

const sacredTrees: TreeSpecies[] = [
  {
    commonName: 'Banyan',
    sanskritName: 'vaṭa',
    vernacularNames: ['bargad', 'āl', 'ālamaram'],
    botanicalName: 'Ficus benghalensis',
    coreRegions: ['Pan-India', 'Temple towns', 'Village councils'],
    linkedRites: ['Dakṣiṇāmūrti icon worship', 'Oath ceremonies', 'Council gatherings'],
    oralMotifs: 'Tree as teacher; clan oath-grounds; social court',
    ecologicalRole: 'Microclimate canopy; bird/fruit guilds; epiphyte host',
    confidence: 'H',
    plateNumber: 'P1',
    ritualUse: 'Public oath-grounds; Dakṣiṇāmūrti teaching icon; council shade as living court'
  },
  {
    commonName: 'Peepal',
    sanskritName: 'pippala / aśvattha',
    vernacularNames: ['arali', 'ashwattha'],
    botanicalName: 'Ficus religiosa',
    coreRegions: ['Pan-India', 'Ghats', 'Ward corners'],
    linkedRites: ['Vow fasts', 'Lamp niches', 'Satya-vāchana', 'Peepal-nīm marriage'],
    oralMotifs: 'Breath/meditation symbolism; hot-cool pairing with neem',
    ecologicalRole: 'Keystone frugivore host; epiphyte substrate; bird habitat',
    confidence: 'H',
    plateNumber: 'P2',
    ritualUse: 'Nightly lamp offerings; circumambulation vows; paired with neem for balancing ritual'
  },
  {
    commonName: 'Bilva / Bael',
    sanskritName: 'bilva',
    vernacularNames: ['bael', 'vilvam'],
    botanicalName: 'Aegle marmelos',
    coreRegions: ['Tamil Nadu', 'Odisha', 'North Indian Śaiva sites'],
    linkedRites: ['Śaiva pūjā', 'Tri-foliate vows', 'Vrata breaks'],
    oralMotifs: 'Leaf triad as theology; Śiva offering par excellence',
    ecologicalRole: 'Drought-tolerant food/fodder; pollinator nectar; medicinal bark',
    confidence: 'H',
    plateNumber: 'P3',
    ritualUse: 'Trifoliate leaves essential for Śaiva worship; vow completion offerings'
  },
  {
    commonName: 'Neem',
    sanskritName: 'nīm',
    vernacularNames: ['nimba', 'vembu', 'vepa'],
    botanicalName: 'Azadirachta indica',
    coreRegions: ['Deccan', 'Gangetic plains', 'Village thresholds'],
    linkedRites: ['Threshold fumigation', 'Warding rites', 'Cooling ceremonies'],
    oralMotifs: 'Liminality marker; cooling agent; protective boundary',
    ecologicalRole: 'Biopesticide compound source; courtyard shade; air purification',
    confidence: 'H',
    plateNumber: 'P4',
    ritualUse: 'Festival eve fumigation; threshold protection; paired with peepal as hot-cool balance'
  },
  {
    commonName: 'Khejri',
    sanskritName: 'śamī',
    vernacularNames: ['khejri', 'shami'],
    botanicalName: 'Prosopis cineraria',
    coreRegions: ['Rajasthan', 'Gujarat', 'Kutch', 'Saurashtra'],
    linkedRites: ['Śamī-pūjā (Daśahrā)', 'Bishnoi protection vows', 'Victory rites'],
    oralMotifs: 'Victory, renewal; desert ethics made wood; Bishnoi martyrdom',
    ecologicalRole: 'Nitrogen-fixer; dune stabilizer; drought fodder; pod nutrition',
    confidence: 'H',
    plateNumber: 'P5',
    ritualUse: 'Daśahrā leaf on tools/weapons; Bishnoi protection code; desert survival ethic'
  },
  {
    commonName: 'Sal',
    sanskritName: 'śāl',
    vernacularNames: ['sakhua', 'sakhoo'],
    botanicalName: 'Shorea robusta',
    coreRegions: ['Jharkhand', 'Odisha', 'Chota Nagpur', 'Bengal rim'],
    linkedRites: ['Sarhul (blossom rite)', 'Bāha', 'Village deity appeasement'],
    oralMotifs: 'Forest-field contract; deity/ancestor priority; calendrical cue',
    ecologicalRole: 'Moisture retention; leaf litter nutrient cycle; timber',
    confidence: 'H',
    plateNumber: 'P6',
    ritualUse: 'Sal blossom marks spring thanksgiving; Sarna/Jaher grove first-fruits ceremony'
  },
  {
    commonName: 'Karam',
    sanskritName: 'karam',
    vernacularNames: ['kadam', 'kurma'],
    botanicalName: 'Adina cordifolia',
    coreRegions: ['Munda belts', 'Santal regions', 'Jharkhand'],
    linkedRites: ['Karam (branch ceremony)', 'Women\'s song-night', 'Branch install-return'],
    oralMotifs: 'Forest-field reciprocity; women\'s chorus teaching restraint',
    ecologicalRole: 'Riparian canopy; deciduous shade; wildlife habitat',
    confidence: 'H',
    plateNumber: 'P7',
    ritualUse: 'Overnight song vigil around installed branch; returned to earth at dawn'
  },
  {
    commonName: 'Punnai',
    sanskritName: 'punnai',
    vernacularNames: ['pinnai', 'sultan champa'],
    botanicalName: 'Calophyllum inophyllum',
    coreRegions: ['Malabar', 'Coromandel', 'Kaveri delta'],
    linkedRites: ['Sea-edge shrines', 'Oil lamp offerings', 'Tide etiquette'],
    oralMotifs: 'Boat lore; littoral liturgy; maritime boundary',
    ecologicalRole: 'Coastal windbreak; shore stabilization; lamp oil source',
    confidence: 'M',
    plateNumber: 'P8',
    ritualUse: 'Shades coastal shrines; seed oil for maritime temple lamps'
  },
  {
    commonName: 'Arjuna',
    sanskritName: 'arjuna',
    vernacularNames: ['arjun', 'marudha'],
    botanicalName: 'Terminalia arjuna',
    coreRegions: ['Ganga banks', 'Godavari', 'Kaveri', 'Major riverbanks'],
    linkedRites: ['River vows', 'Healing fasts', 'Thread-tying ceremonies'],
    oralMotifs: 'Guardian of ghats; cardiac healing tradition',
    ecologicalRole: 'Bank stabilization; tannin-rich bark; riparian corridor',
    confidence: 'H',
    plateNumber: 'P9',
    ritualUse: 'Women tie threads for healing vows; bark used in traditional cardiac medicine'
  },
  {
    commonName: 'Udumbara',
    sanskritName: 'udumbara',
    vernacularNames: ['gular', 'atti'],
    botanicalName: 'Ficus racemosa',
    coreRegions: ['Central India', 'South India', 'Deccan'],
    linkedRites: ['Vow fruits', 'Ascetic sustenance', 'Hermitage marker'],
    oralMotifs: 'Hermitage fruit; ascetic lore; cauliflorous symbolism',
    ecologicalRole: 'Streamside shade; trunk-borne figs feed primates/birds',
    confidence: 'M',
    plateNumber: 'P10',
    ritualUse: 'Figs as hermit sustenance; ascetic vow offerings'
  },
  {
    commonName: 'Flame of the Forest',
    sanskritName: 'palāśa',
    vernacularNames: ['palas', 'dhak', 'kimsuka'],
    botanicalName: 'Butea monosperma',
    coreRegions: ['Central India', 'East India', 'Malwa'],
    linkedRites: ['Vedic fire sticks (araṇi)', 'Spring festivals', 'Holi colors'],
    oralMotifs: 'Sacrificial wood; spring renewal; fire-kindling pair',
    ecologicalRole: 'Lac insect host; bee nectar; soil nitrogen restoration',
    confidence: 'H',
    plateNumber: 'P11',
    ritualUse: 'Vedic araṇi fire-drill sticks; scarlet blooms mark spring celebrations'
  },
  {
    commonName: 'Ashoka',
    sanskritName: 'aśoka',
    vernacularNames: ['asoka', 'ashokam'],
    botanicalName: 'Saraca asoca',
    coreRegions: ['East India', 'South India', 'Temple gardens'],
    linkedRites: ['Fertility rites', 'Grove ceremonies', 'Court gardens'],
    oralMotifs: 'Sorrow-removal; monastery gardens; feminine fertility',
    ecologicalRole: 'Understory shade species; early spring blooms for pollinators',
    confidence: 'M',
    plateNumber: 'P12',
    ritualUse: 'Temple and monastery garden cultivation; fertility vows'
  },
  {
    commonName: 'Deodar',
    sanskritName: 'deodāra',
    vernacularNames: ['devdar', 'devadaru'],
    botanicalName: 'Cedrus deodara',
    coreRegions: ['Western Himalaya', 'Himachal', 'Kashmir'],
    linkedRites: ['Temple beam construction', 'Monastery timber', 'Highland shrines'],
    oralMotifs: 'Abode of the god (deva-dāru); sacred architecture',
    ecologicalRole: 'Montane slope retention; watershed protection; aromatic timber',
    confidence: 'M',
    plateNumber: 'P13',
    ritualUse: 'Temple roof beams; monastery construction; aromatic sacred architecture'
  },
  {
    commonName: 'Juniper',
    sanskritName: 'juniper',
    vernacularNames: ['dhup', 'shukpa'],
    botanicalName: 'Juniperus indica',
    coreRegions: ['Trans-Himalaya', 'Ladakh', 'Tawang', 'High passes'],
    linkedRites: ['Fumigation offerings', 'Highland Buddhist rites', 'Smoke ceremonies'],
    oralMotifs: 'Smoke as offering; high-pass sanctification',
    ecologicalRole: 'High-altitude windbreak; aromatic resin; cold-desert adaptation',
    confidence: 'M',
    plateNumber: 'P14',
    ritualUse: 'Smoke plumes in courtyard rituals; high-altitude Buddhist fumigation'
  },
  {
    commonName: 'Tulsi / Holy Basil',
    sanskritName: 'tulasī',
    vernacularNames: ['tulasi', 'thulasi', 'brinda'],
    botanicalName: 'Ocimum tenuiflorum',
    coreRegions: ['All-India', 'Household courtyards', 'Domestic altars'],
    linkedRites: ['Daily lamp offerings', 'Vrata cycles', 'Tulsi Vivaha'],
    oralMotifs: 'Domestic altar tree; daily piety marker; Viṣṇu association',
    ecologicalRole: 'Pollinator herb; medicinal compounds; household microclimate',
    confidence: 'H',
    plateNumber: 'P15',
    ritualUse: 'Central domestic altar plant; daily lamping; marriage ceremony to Viṣṇu'
  },
  {
    commonName: 'Silk Cotton Tree',
    sanskritName: 'semal',
    vernacularNames: ['semal', 'ilavam', 'buruga'],
    botanicalName: 'Bombax ceiba',
    coreRegions: ['North India', 'Central India', 'Deciduous forests'],
    linkedRites: ['Spring bloom markers', 'Folk song cycles', 'Fertility symbolism'],
    oralMotifs: 'Color and fertility in folk songs; dramatic spring blooms',
    ecologicalRole: 'Bird/bat nectar source; silk-cotton fiber; canopy emergent',
    confidence: 'M',
    plateNumber: 'P16',
    ritualUse: 'Spring bloom as festival marker; folk song imagery'
  },
  {
    commonName: 'Mangroves',
    sanskritName: 'mangrove',
    vernacularNames: ['kandal', 'kadol', 'baen'],
    botanicalName: 'Rhizophora, Avicennia spp.',
    coreRegions: ['Sundarbans', 'Gulf of Kachchh', 'E/W coasts'],
    linkedRites: ['Sea-edge taboos', 'Banabibi cycles (regional)', 'Fishing closures'],
    oralMotifs: 'Cyclone/erosion memory; guardian deity; tide etiquette',
    ecologicalRole: 'Storm surge buffer; fishery nurseries; carbon sequestration',
    confidence: 'M',
    plateNumber: 'P17',
    ritualUse: 'Coastal shrine offerings; fishing calendar tied to lunar-monsoon cycles'
  }
];

const confidenceColors = {
  H: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  M: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  L: 'bg-slate-500/10 text-slate-700 border-slate-500/20'
};

const confidenceLabels = {
  H: 'High - Multi-source convergence',
  M: 'Medium - Partial evidence',
  L: 'Low - Suggestive only'
};

export function SacredTreeSpeciesGallery() {
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');

  const regions = ['all', 'Pan-India', 'Jharkhand', 'Tamil Nadu', 'Rajasthan', 'Himalaya', 'Coastal'];
  
  const filteredTrees = sacredTrees.filter(tree => {
    const regionMatch = filterRegion === 'all' || tree.coreRegions.some(r => 
      r.toLowerCase().includes(filterRegion.toLowerCase())
    );
    const confidenceMatch = filterConfidence === 'all' || tree.confidence === filterConfidence;
    return regionMatch && confidenceMatch;
  });

  return (
    <Card className="w-full border-border/40">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              Sacred Tree Lexicon: Botanical–Ritual Continuities
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Master index of trees functioning as ritual infrastructure across Bhāratavarṣa. 
              Each entry documents convergence of botanical identity, ecological role, and ceremonial practice—
              evidence grades indicate multi-source validation strength.
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Region:</span>
            {regions.map(region => (
              <Button
                key={region}
                variant={filterRegion === region ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRegion(region)}
                className="h-7 text-xs"
              >
                {region === 'all' ? 'All' : region}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Evidence:</span>
            {['all', 'H', 'M', 'L'].map(conf => (
              <Button
                key={conf}
                variant={filterConfidence === conf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterConfidence(conf)}
                className="h-7 text-xs"
              >
                {conf === 'all' ? 'All' : conf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrees.map((tree, idx) => (
            <Card key={idx} className="border-border/40 bg-card/50 hover:bg-card transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {tree.commonName}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <div className="font-sanskrit italic">{tree.sanskritName}</div>
                      <div className="text-xs">{tree.vernacularNames.join(' • ')}</div>
                      <div className="text-xs italic text-muted-foreground/80">{tree.botanicalName}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge 
                      variant="outline" 
                      className={confidenceColors[tree.confidence]}
                      title={confidenceLabels[tree.confidence]}
                    >
                      {tree.confidence}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{tree.plateNumber}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Regions</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{tree.coreRegions.join(' • ')}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Linked Rites</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{tree.linkedRites.join(' • ')}</p>
                </div>

                {tree.ritualUse && (
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground leading-relaxed italic">{tree.ritualUse}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Oral Motifs</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{tree.oralMotifs}</p>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Ecological Role</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tree.ecologicalRole}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/40 bg-muted/30 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Continuity Pattern: Trees Before Temples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              Across peninsular and eastern India, multiple precincts and village memories attest that 
              <strong> tree-shrines pre-date masonry</strong>, with later enclosures built around earlier vow practices. 
              The banyan as council court, peepal as lamp-niche, śamī as victory marker—each functioned as 
              <strong> social infrastructure before architectural elaboration</strong>.
            </p>
            <p>
              The <strong>dual role of sacred trees</strong> as both ritual media and ecological infrastructure 
              (nitrogen fixers, bank stabilizers, microclimate generators) suggests <strong>reciprocal selection</strong>: 
              communities protect trees that protect the land. Confidence grades (H/M/L) reflect multi-disciplinary 
              convergence of ethnographic, ecological, and archaeological evidence.
            </p>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
              <strong>Evidence grading:</strong> H = Multi-source convergence (ethnography + ecology + archaeology/text); 
              M = Strong in one domain, partial in others; L = Suggestive patterns requiring additional validation.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
