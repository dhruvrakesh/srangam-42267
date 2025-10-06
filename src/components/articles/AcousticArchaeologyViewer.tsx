import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, Eye, Map, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface RingingRock {
  id: string;
  name: string;
  frequency: string;
  wearPattern: 'heavy' | 'moderate' | 'light';
  petroglyphs: string[];
  coordinates: [number, number];
}

const kupgalRocks: RingingRock[] = [
  {
    id: 'kr-01',
    name: 'Main Gong Stone',
    frequency: '800-1200 Hz',
    wearPattern: 'heavy',
    petroglyphs: ['Zebu cattle', 'Anthropomorphs', 'Net patterns'],
    coordinates: [15.35, 76.48]
  },
  {
    id: 'kr-02',
    name: 'North Bell Rock',
    frequency: '1500-2200 Hz',
    wearPattern: 'moderate',
    petroglyphs: ['Circular motifs', 'Hoof marks'],
    coordinates: [15.36, 76.47]
  },
  {
    id: 'kr-03',
    name: 'Pasture Corridor Stone',
    frequency: '600-900 Hz',
    wearPattern: 'moderate',
    petroglyphs: ['Linear markings', 'Possible script'],
    coordinates: [15.34, 76.49]
  },
  {
    id: 'kr-04',
    name: 'Ridge Echo Stone',
    frequency: '2000-3000 Hz',
    wearPattern: 'light',
    petroglyphs: ['Geometric patterns'],
    coordinates: [15.37, 76.46]
  }
];

export function AcousticArchaeologyViewer() {
  const [selectedRock, setSelectedRock] = useState<RingingRock>(kupgalRocks[0]);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const handlePlaySound = () => {
    setAudioPlaying(true);
    // Simulate audio playback
    setTimeout(() => setAudioPlaying(false), 2000);
  };

  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Kupgal–Sanganakallu: Acoustic Archaeology
        </CardTitle>
        <CardDescription>
          Interactive exploration of ringing rocks, wear patterns, and performance landscapes (Karnataka, Neolithic–Early Historic)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sound" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sound">
              <Volume2 className="h-4 w-4 mr-2" />
              Sound
            </TabsTrigger>
            <TabsTrigger value="wear">
              <Eye className="h-4 w-4 mr-2" />
              Wear
            </TabsTrigger>
            <TabsTrigger value="viewshed">
              <Map className="h-4 w-4 mr-2" />
              View-Shed
            </TabsTrigger>
            <TabsTrigger value="petroglyph">
              <ImageIcon className="h-4 w-4 mr-2" />
              Petroglyphs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sound" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {kupgalRocks.map((rock) => (
                <button
                  key={rock.id}
                  onClick={() => setSelectedRock(rock)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedRock.id === rock.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{rock.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Resonance: {rock.frequency}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {rock.wearPattern} wear
                  </Badge>
                </button>
              ))}
            </div>

            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Selected: {selectedRock.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Frequency range: <strong>{selectedRock.frequency}</strong> (audible 1-2 km in still air)
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlaySound}
                  disabled={audioPlaying}
                  variant="default"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {audioPlaying ? 'Playing...' : 'Play Simulated Tone'}
                </Button>
                <Badge variant="secondary">Experimental replication</Badge>
              </div>

              <div className="p-4 rounded bg-background border border-border">
                <div className="text-xs font-medium mb-2">ACOUSTIC NOTE</div>
                <p className="text-sm">
                  Resonant frequencies confirmed through experimental percussion using quartzite hammerstones. 
                  Sound carries across pasture corridors where line-of-sight is broken—functional homology 
                  with modern Kuruba drum signaling for herd coordination.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wear" className="space-y-4 mt-4">
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <h4 className="font-semibold">Strike-Lane Polishes: Evidence of Repeated Percussion</h4>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-background border-l-4 border-l-primary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Heavy Wear Pattern</span>
                    <Badge>Main Gong Stone</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Smooth polished channels 5-8cm wide, depth 2-4mm. Consistent with 5,000+ percussion events 
                    (Boivin replication data). Likely primary signaling station.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Moderate Wear Pattern</span>
                    <Badge variant="outline">2 stones</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visible strike marks with partial polish. Estimated 1,000-3,000 events. 
                    Secondary nodes in acoustic network.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border-l-4 border-l-muted">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Light Wear Pattern</span>
                    <Badge variant="outline">Ridge Echo Stone</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Faint percussion marks. Occasional use or natural weathering overlap. Ambiguous.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs font-medium mb-2 text-amber-700 dark:text-amber-400">
                  METHODOLOGICAL NOTE [H]
                </div>
                <p className="text-sm">
                  Micro-wear analysis by Boivin et al. (2007) distinguishes intentional percussion from accidental 
                  rockfall/animal activity through striations, micro-fractures, and polish directionality. 
                  Confidence: High (converging evidence from acoustics + wear + view-sheds + ethnography).
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="viewshed" className="space-y-4 mt-4">
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <h4 className="font-semibold">View-Shed Analysis: Pasture Corridor Alignments</h4>
              
              <div className="aspect-video bg-gradient-to-b from-sky-200 to-green-100 dark:from-sky-900 dark:to-green-900 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center space-y-2">
                  <Map className="h-12 w-12 mx-auto text-primary" />
                  <div className="text-sm font-medium">Topographic View-Shed Map</div>
                  <div className="text-xs text-muted-foreground">(Placeholder: GIS overlay showing rock positions + pasture routes)</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border">
                  <h5 className="font-medium mb-2 text-sm">North-South Corridor</h5>
                  <p className="text-xs text-muted-foreground">
                    Main Gong Stone + North Bell Rock form acoustic relay across 2.3 km ridge valley. 
                    Aligns with Neolithic cattle routes (ceramic scatter evidence).
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border">
                  <h5 className="font-medium mb-2 text-sm">East-West Pasture</h5>
                  <p className="text-xs text-muted-foreground">
                    Pasture Corridor Stone faces seasonal grazing lands. Audible from 3 kraal sites 
                    (lithic tool clusters suggest occupation).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded bg-background border border-primary/20">
                <div className="text-xs font-medium mb-2">FUNCTIONAL HOMOLOGY [M]</div>
                <p className="text-sm">
                  Modern Kuruba pastoralists use drum signals for herd coordination where terrain breaks line-of-sight. 
                  While direct continuity cannot be proven, the functional parallel is striking: acoustic infrastructure 
                  solves the same problem (distributed coordination) across millennia.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="petroglyph" className="space-y-4 mt-4">
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <h4 className="font-semibold">Petroglyphs: Images on Resonant Stones</h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border space-y-2">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="font-medium text-sm">Zebu Cattle</div>
                  <p className="text-xs text-muted-foreground">
                    Humped cattle motifs on Main Gong Stone. Consistent with Neolithic pastoralism.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border space-y-2">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="font-medium text-sm">Anthropomorphs</div>
                  <p className="text-xs text-muted-foreground">
                    Human figures with raised arms. Ritual gesture or ownership mark?
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border space-y-2">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="font-medium text-sm">Net Patterns</div>
                  <p className="text-xs text-muted-foreground">
                    Cross-hatched designs. Fish traps? Fencing? Meaning unclear.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded bg-background border border-primary/20">
                <div className="text-xs font-medium mb-2">PERFORMANCE LANDSCAPE MODEL [H]</div>
                <p className="text-sm">
                  Images + Acoustics + Movement = <strong>Performance Landscape</strong>. The petroglyphs are not 
                  decoration but <em>score notation</em>—visual cues for who strikes, when, and why. The stones 
                  are the <strong>venue</strong> (material infrastructure); the rituals are the <strong>score</strong> 
                  (performance). Both persist, but in different registers.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-xs font-medium mb-2">SOURCE ATTRIBUTION</div>
          <p className="text-sm">
            Boivin, Nicole, et al. "Geoarchaeological Evidence for the Persistence of Rock Gong and Lithophones 
            in South Asia." <em>Current Anthropology</em> 48.4 (2007). Replication experiments and micro-wear 
            analysis by Sanganakallu Archaeological Project. View-shed analysis: Kumar & Boivin GIS dataset.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
