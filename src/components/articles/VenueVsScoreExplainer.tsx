import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Music, Layers } from 'lucide-react';

export function VenueVsScoreExplainer() {
  return (
    <Card className="my-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Methodology: Venue vs. Score
        </CardTitle>
        <CardDescription>
          The central framework for analyzing cultural continuity across millennia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="definitions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="definitions">Definitions</TabsTrigger>
            <TabsTrigger value="kupgal">Kupgal Example</TabsTrigger>
            <TabsTrigger value="continuity">Continuity Model</TabsTrigger>
          </TabsList>

          <TabsContent value="definitions" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-background border-2 border-primary">
                <div className="flex items-center gap-2 mb-3">
                  <Mountain className="h-6 w-6 text-primary" />
                  <h3 className="font-bold text-lg">VENUE</h3>
                </div>
                <Badge variant="outline" className="mb-3">Material Infrastructure</Badge>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Stone sites (petroglyphs, megaliths, acoustic rocks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Sacred groves (forest precincts with custodial rules)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Acoustic spaces (resonant landscapes, amphitheaters)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Oath-stones, springheads, funerary routes</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 rounded bg-primary/10">
                  <p className="text-xs font-medium">
                    <strong>Persistence:</strong> Venues endure across millennia. Stones weather but remain. 
                    Groves regenerate but stay anchored to place.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-background border-2 border-blue-500">
                <div className="flex items-center gap-2 mb-3">
                  <Music className="h-6 w-6 text-blue-500" />
                  <h3 className="font-bold text-lg">SCORE</h3>
                </div>
                <Badge variant="outline" className="mb-3 border-blue-500 text-blue-500">Ritual Performance</Badge>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Drum calls, percussion patterns, acoustic signals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Step vocabularies, dance grammars, choreographies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>First-fruits rules, harvest closure dates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Vow ceremonies, oath-taking rituals, funerary processions</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 rounded bg-blue-500/10">
                  <p className="text-xs font-medium">
                    <strong>Evolution:</strong> Scores adapt across generations. Songs change, steps vary, 
                    but the <em>grammar</em> of performance persists.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-600" />
                Why Both Are Required
              </h4>
              <p className="text-sm mb-3">
                A ringing rock without ritual context is <strong>geology</strong>. A harvest song without place-keeping 
                is <strong>entertainment</strong>. Together they form a <strong>Performance Landscape</strong>—the 
                material + performative infrastructure that makes tradition <em>legible</em> across millennia.
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-background">
                  <div className="font-medium mb-1">Venue without Score:</div>
                  <div className="text-muted-foreground">Archaeological site with unknown function</div>
                </div>
                <div className="p-3 rounded bg-background">
                  <div className="font-medium mb-1">Score without Venue:</div>
                  <div className="text-muted-foreground">Performance lacking terrestrial anchor</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kupgal" className="space-y-4 mt-4">
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <h3 className="font-semibold">Kupgal–Sanganakallu: Complete System Example</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-primary/10 border-l-4 border-l-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain className="h-5 w-5 text-primary" />
                    <span className="font-medium">VENUE Elements</span>
                  </div>
                  <ul className="space-y-1 text-sm ml-7">
                    <li>• Dolerite boulders with resonant frequencies (200-3000 Hz)</li>
                    <li>• Petroglyphs on same stones (zebu, anthropomorphs, nets)</li>
                    <li>• View-sheds aligned with pasture corridors</li>
                    <li>• Strike-lane polishes (wear evidence 5,000+ percussion events)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">SCORE Elements</span>
                  </div>
                  <ul className="space-y-1 text-sm ml-7">
                    <li>• Percussion patterns (experimental replication confirms intentionality)</li>
                    <li>• Acoustic signaling for herd coordination (functional homology with Kuruba drum calls)</li>
                    <li>• Ritual performance (petroglyphs as score notation?)</li>
                    <li>• Movement choreography (pasture routes + sound = coordinated labor)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-background border border-primary/20">
                <div className="font-medium mb-2 text-sm">= PERFORMANCE LANDSCAPE [H]</div>
                <p className="text-sm text-muted-foreground">
                  Images (petroglyphs) + Acoustics (resonant stones) + Movement (herd routes) = complete system. 
                  The stones persist; the exact rhythms may have changed, but the <strong>grammar of acoustic 
                  coordination</strong> endures across Neolithic → Iron Age → ethnographic present.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="continuity" className="space-y-4 mt-4">
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <h3 className="font-semibold">Continuity Model: How Tradition Persists</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background border border-border">
                  <h4 className="font-medium mb-2 text-sm">Stage 1: Initial Construction (Neolithic)</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium mb-1">Venue:</div>
                      <div className="text-muted-foreground">Megaliths erected, groves designated, stones selected for acoustics</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Score:</div>
                      <div className="text-muted-foreground">Original rituals, drum patterns, harvest rules</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="text-2xl text-muted-foreground">↓</div>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border">
                  <h4 className="font-medium mb-2 text-sm">Stage 2: Evolution (Iron Age → Early Historic)</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium mb-1">Venue:</div>
                      <div className="text-muted-foreground">Stones weather but remain. New megaliths added. Groves expand/contract.</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Score:</div>
                      <div className="text-muted-foreground">Songs adapt. Steps change. But functional grammar persists (first-fruits, acoustic signaling).</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="text-2xl text-muted-foreground">↓</div>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border">
                  <h4 className="font-medium mb-2 text-sm">Stage 3: Contemporary Practice (Present)</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium mb-1">Venue:</div>
                      <div className="text-muted-foreground">Ancient stones + groves still anchor rituals. Some sites lost, others protected.</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Score:</div>
                      <div className="text-muted-foreground">Modern harvest festivals, oath ceremonies, funerals. Structural rhyme with ancient patterns.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                <h4 className="font-semibold mb-2">Key Insight: Structural Rhyme, Not Linear Descent</h4>
                <p className="text-sm mb-3">
                  We do not claim "pristine continuity" or unchanged traditions. Instead, we document 
                  <strong> structural rhymes</strong>—functional parallels where the <em>grammar</em> of 
                  place-keeping persists even as specific performances evolve.
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-background">
                    <div className="font-medium mb-1 text-red-600 dark:text-red-400">❌ Avoid:</div>
                    <div className="text-muted-foreground">"This song is 5,000 years old unchanged"</div>
                  </div>
                  <div className="p-3 rounded bg-background">
                    <div className="font-medium mb-1 text-green-600 dark:text-green-400">✓ Better:</div>
                    <div className="text-muted-foreground">"This performance landscape preserves functional grammar across 5,000 years"</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
          <div className="text-xs font-medium mb-2">METHODOLOGICAL ADVANTAGE</div>
          <p className="text-sm">
            The Venue vs. Score framework avoids essentialist claims ("traditions never change") while still 
            permitting rigorous analysis of cultural continuity. It respects the <em>longue durée</em> persistence 
            of material infrastructure while acknowledging performative evolution. This is how we study tradition 
            <strong> without romanticism</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
