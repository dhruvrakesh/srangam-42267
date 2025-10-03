import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconBasalt } from '@/components/icons/IconBasalt';
import { Ruler, Info } from 'lucide-react';

interface FaunaSpecies {
  id: string;
  name: string;
  commonName: string;
  height?: number;
  length?: number;
  age: string;
  zone: string;
  ecology: string;
  modernAnalog: string;
  description: string;
}

interface FaunaData {
  species: FaunaSpecies[];
  humanReference: {
    height: number;
    label: string;
  };
}

export const SiwalikMegafaunaViewer: React.FC = () => {
  const [faunaData, setFaunaData] = useState<FaunaData | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    fetch('/data/geology/siwalik_fauna.json')
      .then(res => res.json())
      .then(data => {
        setFaunaData(data);
        if (data.species.length > 0) {
          setSelectedSpecies(data.species[0].id);
        }
      })
      .catch(err => console.error('Error loading fauna data:', err));
  }, []);

  if (!faunaData) {
    return (
      <Card className="my-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const convertHeight = (meters: number) => {
    if (unit === 'imperial') {
      const feet = meters * 3.28084;
      return `${feet.toFixed(1)} ft`;
    }
    return `${meters.toFixed(1)} m`;
  };

  const selected = faunaData.species.find(s => s.id === selectedSpecies);

  return (
    <Card className="my-8 border-amber-500/20 bg-gradient-to-br from-amber-950/10 to-stone-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBasalt className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Figure 3: Siwalik Megafauna Size Comparison</CardTitle>
          </div>
          <button
            onClick={() => setUnit(u => u === 'metric' ? 'imperial' : 'metric')}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
          >
            <Ruler className="h-3 w-3" />
            {unit === 'metric' ? 'Metric' : 'Imperial'}
          </button>
        </div>
        <CardDescription>
          Interactive size comparison of Miocene-Pliocene fauna from the Siwalik "Fossil Library"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SVG Figure */}
        <div className="bg-muted/50 rounded-lg p-4 overflow-auto">
          <img 
            src="/images/geology/stone_purana_fig3_siwalik.svg" 
            alt="Siwalik megafauna silhouettes with 2m human for scale"
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>

        {/* Species Selector */}
        <Tabs value={selectedSpecies || undefined} onValueChange={setSelectedSpecies}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto p-2">
            {faunaData.species.map(species => (
              <TabsTrigger 
                key={species.id} 
                value={species.id}
                className="text-xs px-2 py-1.5"
              >
                {species.commonName}
              </TabsTrigger>
            ))}
          </TabsList>

          {faunaData.species.map(species => (
            <TabsContent key={species.id} value={species.id} className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Species Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                      {species.commonName}
                    </h3>
                    <p className="text-sm italic text-muted-foreground">{species.name}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {species.age}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {species.zone}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Ruler className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Size: </span>
                        {species.height && `${convertHeight(species.height)} tall`}
                        {species.length && `${convertHeight(species.length)} long`}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Modern analog: </span>
                        {species.modernAnalog}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    {species.description}
                  </div>
                </div>

                {/* Right: Ecology & Context */}
                <div className="space-y-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 text-primary">Ecology</h4>
                    <p className="text-sm text-muted-foreground">{species.ecology}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-500/10 to-stone-500/10 border border-amber-500/20 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <IconBasalt className="h-4 w-4 text-amber-600" />
                      Geological Context
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Found in the <strong>{species.zone}</strong> subdivision of the Siwalik Group 
                      foreland basin deposits. These sediments record Himalayan erosion and mammalian 
                      evolution during the {species.age.split('-')[0]} million years ago period.
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Compared to human reference:</strong> {' '}
                      {species.height && `${(species.height / faunaData.humanReference.height).toFixed(1)}× taller`}
                      {species.length && `${(species.length / faunaData.humanReference.height).toFixed(1)}× longer`}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Legend */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> All silhouettes shown to scale with 2m human reference. 
            The Siwalik Group preserves the world's most complete record of Miocene-Pliocene mammalian evolution, 
            spanning 18-2 million years of continuous sedimentation in the Himalayan foreland basin.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
