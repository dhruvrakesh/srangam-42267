import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, TreeDeciduous, History, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SiteProfile {
  id: string;
  name: string;
  region: string;
  megalithType: string;
  groveType: string;
  adjacency: string;
  oralTradition: string;
  contemporaryUse: string;
  confidence: 'H' | 'M' | 'L';
  keyFeatures: string[];
  statistics?: {
    totalMenhirs?: number;
    tallestMenhir?: string;
    heightRange?: string;
    capRatio?: string;
    groveArea?: string;
    springheadProximity?: string;
  };
  ecologicalMetrics?: {
    waterRetention?: string;
    biodiversity?: string;
    carbonStorage?: string;
    downstreamBeneficiaries?: string;
  };
}

const sites: SiteProfile[] = [
  {
    id: 'nartiang',
    name: 'Nartiang',
    region: 'West Jaintia Hills, Meghalaya',
    megalithType: 'Menhirs and dolmens in curated clusters',
    groveType: 'Law Kyntang/Lyngdoh sacred forests',
    adjacency: 'Megalith field directly contiguous with grove; stone and tree share ritual space',
    oralTradition: 'Mar Phalyngki royal memories; summer palace stays; clan law stones',
    contemporaryUse: 'Living social grammar: clan feasts, lineage oaths, funerary memory at stones',
    confidence: 'H',
    keyFeatures: [
      'Dimensional stone typologies (height, orientation patterns)',
      'Grove as water-source protector (springheads)',
      'Stone as statute: inheritance and law articulated spatially',
      'Continuing custodianship by village councils'
    ],
    statistics: {
      totalMenhirs: 500,
      tallestMenhir: '8.5m',
      heightRange: '2m - 8.5m',
      capRatio: '1:3 (female:male stones)',
      groveArea: '80+ hectares',
      springheadProximity: '<100m for 80% of stones'
    },
    ecologicalMetrics: {
      waterRetention: '40% higher than non-grove areas',
      biodiversity: '120+ tree species, 70+ bird species',
      carbonStorage: '250 tons/hectare (vs. 80 in degraded forest)',
      downstreamBeneficiaries: '10+ villages'
    }
  },
  {
    id: 'kupgal',
    name: 'Kupgal-Sanganakallu',
    region: 'Ballari, Karnataka',
    megalithType: 'Neolithic petroglyphs with acoustic "rock gongs"',
    groveType: 'Pastoral corridors (not groves proper, but ecological context)',
    adjacency: 'Sound-stone-landscape integration: hilltops as performance locales',
    oralTradition: 'No direct modern ritual linkage; inferential bridges to drum-dance traditions',
    contemporaryUse: 'Archaeological site; no living liturgy, but analogy to Wāngalā/gōṭul sound-season patterns',
    confidence: 'H',
    keyFeatures: [
      'Pecked panels: cattle, humans, nets, abstract forms',
      'Use-wear on resonant basalt surfaces (documented drumming)',
      'Sound-mapping of ledges and view-sheds',
      'Seasonal gathering evidence (site patterning, artifact scatters)'
    ]
  },
  {
    id: 'edakkal',
    name: 'Edakkal',
    region: 'Wayanad, Kerala',
    megalithType: 'Pass petroglyphs (anthropomorphs, animals, sign-like forms)',
    groveType: 'Highland pass ecology (not managed groves, but forest context)',
    adjacency: 'Stone archive in mobile landscape; pass as natural corridor',
    oralTradition: 'Later ballads and folk pilgrimages "read" the shelter as repository',
    contemporaryUse: 'Pilgrimage site; direct linkage to village calendars unproven',
    confidence: 'M',
    keyFeatures: [
      'Palimpsest of engravings spanning periods',
      'Pass position between Malanād and Mysore plateau',
      'Repeated visitation across time (layer evidence)',
      'Folk memory treats site as sacred archive'
    ]
  }
];

const confidenceColors = {
  H: 'bg-green-600',
  M: 'bg-yellow-600',
  L: 'bg-orange-600'
};

export function MegalithAndGroveViewer() {
  const [selectedSite, setSelectedSite] = useState<string>(sites[0].id);

  const currentSite = sites.find(s => s.id === selectedSite)!;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="ancient-navigation">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Mountain className="text-primary animate-pulse-gentle" size={24} />
          Stone & Grove Adjacency: Case Studies
        </CardTitle>
        <CardDescription>
          How megalithic memory stones and sacred groves occupy shared ritual space, binding law to landscape
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={selectedSite} onValueChange={setSelectedSite} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {sites.map(site => (
              <TabsTrigger key={site.id} value={site.id} className="text-xs">
                {site.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {sites.map(site => (
            <TabsContent key={site.id} value={site.id} className="mt-0">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{site.name}</h3>
                    <p className="text-sm text-muted-foreground">{site.region}</p>
                  </div>
                  <Badge className={`${confidenceColors[site.confidence]} text-white border-0`}>
                    Confidence: {site.confidence}
                  </Badge>
                </div>

                {/* Megalith Type */}
                <div className="p-4 bg-stone-500/10 rounded-lg border-l-4 border-stone-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain size={18} className="text-stone-500" />
                    <h4 className="font-semibold text-foreground">Megalithic Features</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{site.megalithType}</p>
                </div>

                {/* Grove Type */}
                <div className="p-4 bg-green-500/10 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <TreeDeciduous size={18} className="text-green-500" />
                    <h4 className="font-semibold text-foreground">Grove/Ecological Context</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{site.groveType}</p>
                </div>

                {/* Adjacency Pattern */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Stone-Grove Adjacency Pattern</h4>
                  <p className="text-sm text-muted-foreground">{site.adjacency}</p>
                </div>

                {/* Oral Tradition */}
                <div className="p-4 bg-amber-500/10 rounded-lg border-l-4 border-amber-500">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={18} className="text-amber-500" />
                    <h4 className="font-semibold text-foreground">Oral Tradition & Memory</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{site.oralTradition}</p>
                </div>

                {/* Contemporary Use */}
                <div className="p-4 bg-purple-500/10 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-purple-500" />
                    <h4 className="font-semibold text-foreground">Contemporary Use</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{site.contemporaryUse}</p>
                </div>

                {/* Key Features */}
                <div className="p-4 bg-card border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Key Features & Evidence</h4>
                  <ul className="space-y-2">
                    {site.keyFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Statistics (Nartiang only) */}
                {site.statistics && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Site Statistics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {site.statistics.totalMenhirs && (
                        <div>
                          <div className="text-muted-foreground">Total Menhirs</div>
                          <div className="font-medium text-foreground">{site.statistics.totalMenhirs}+</div>
                        </div>
                      )}
                      {site.statistics.tallestMenhir && (
                        <div>
                          <div className="text-muted-foreground">Tallest Menhir</div>
                          <div className="font-medium text-foreground">{site.statistics.tallestMenhir}</div>
                        </div>
                      )}
                      {site.statistics.heightRange && (
                        <div>
                          <div className="text-muted-foreground">Height Range</div>
                          <div className="font-medium text-foreground">{site.statistics.heightRange}</div>
                        </div>
                      )}
                      {site.statistics.capRatio && (
                        <div>
                          <div className="text-muted-foreground">Dolmen:Menhir Ratio</div>
                          <div className="font-medium text-foreground">{site.statistics.capRatio}</div>
                        </div>
                      )}
                      {site.statistics.groveArea && (
                        <div>
                          <div className="text-muted-foreground">Grove Area</div>
                          <div className="font-medium text-foreground">{site.statistics.groveArea}</div>
                        </div>
                      )}
                      {site.statistics.springheadProximity && (
                        <div>
                          <div className="text-muted-foreground">Springhead Proximity</div>
                          <div className="font-medium text-foreground">{site.statistics.springheadProximity}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ecological Metrics (Nartiang only) */}
                {site.ecologicalMetrics && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TreeDeciduous size={18} className="text-green-500" />
                      Ecological Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {site.ecologicalMetrics.waterRetention && (
                        <div>
                          <div className="text-muted-foreground">Water Retention</div>
                          <div className="font-medium text-foreground">{site.ecologicalMetrics.waterRetention}</div>
                        </div>
                      )}
                      {site.ecologicalMetrics.biodiversity && (
                        <div>
                          <div className="text-muted-foreground">Biodiversity</div>
                          <div className="font-medium text-foreground">{site.ecologicalMetrics.biodiversity}</div>
                        </div>
                      )}
                      {site.ecologicalMetrics.carbonStorage && (
                        <div>
                          <div className="text-muted-foreground">Carbon Storage</div>
                          <div className="font-medium text-foreground">{site.ecologicalMetrics.carbonStorage}</div>
                        </div>
                      )}
                      {site.ecologicalMetrics.downstreamBeneficiaries && (
                        <div>
                          <div className="text-muted-foreground">Downstream Villages</div>
                          <div className="font-medium text-foreground">{site.ecologicalMetrics.downstreamBeneficiaries}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Mountain className="text-primary" size={18} />
            Stone as Social Grammar
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            In northeast India particularly, <strong>megalithic practice</strong> remains a <strong>living social 
            grammar</strong> rather than archaeological debris. At Nartiang, clan stones articulate <strong>law and 
            lineage</strong> spatially; their adjacency to sacred groves shows how <strong>memory (stone), water 
            (grove), and law (oath-site)</strong> occupy the same landscape.
          </p>
          <div className="text-xs text-accent">
            Kupgal-Sanganakallu's acoustic petroglyphs suggest that <strong>sound</strong> (rock gongs, drumming) 
            was integral to seasonal gatherings — a pattern echoed in modern Wāngalā ("hundred drums") and gōṭul 
            pedagogy. The hill itself becomes an <strong>instrument</strong> in ritual performance.
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Archaeological documentation, oral histories, and ethnographic fieldwork synthesized for comparative analysis
        </div>
      </CardContent>
    </Card>
  );
}
