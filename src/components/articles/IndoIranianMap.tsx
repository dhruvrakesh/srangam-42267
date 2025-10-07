import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export function IndoIranianMap() {
  const [timelineYear, setTimelineYear] = useState(2500);

  // Determine which migration routes to show based on timeline
  const showSaptaSindhu = timelineYear >= 2500;
  const showAratta = timelineYear >= 2000;
  const showMitanni = timelineYear >= 1600;
  const showIranian = timelineYear >= 1800;

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Indo-Iranian Migrations and Cultural Sphere</CardTitle>
        <CardDescription>
          Interactive map showing westward migrations from the Sapta Sindhu (2500-1400 BCE)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Slider */}
        <div className="space-y-3 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Timeline: {timelineYear} BCE</span>
            <div className="flex gap-2">
              <Badge variant={showSaptaSindhu ? 'default' : 'outline'} className="text-xs">
                Sapta Sindhu
              </Badge>
              <Badge variant={showAratta ? 'default' : 'outline'} className="text-xs">
                Aratta Region
              </Badge>
              <Badge variant={showMitanni ? 'default' : 'outline'} className="text-xs">
                Mitanni
              </Badge>
            </div>
          </div>
          <Slider
            value={[timelineYear]}
            onValueChange={(value) => setTimelineYear(value[0])}
            min={1400}
            max={2500}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1400 BCE</span>
            <span>2000 BCE</span>
            <span>2500 BCE</span>
          </div>
        </div>

        {/* Main Map */}
        <div className="bg-sand/10 rounded-lg p-6 border">
          <div className="relative w-full h-96 bg-gradient-to-br from-sand/20 to-laterite/10 rounded border overflow-hidden">
            {/* Geographic regions */}
            
            {/* Sapta Sindhu (Northwestern India) - Origin */}
            {showSaptaSindhu && (
              <div className="absolute bottom-8 right-12 w-32 h-40 bg-primary/40 rounded-lg border-2 border-primary shadow-lg">
                <div className="p-2 text-xs font-medium text-primary">
                  <div className="font-bold">Sapta Sindhu</div>
                  <div className="text-[10px] mt-1">"Land of Seven Rivers"</div>
                  <div className="text-[10px]">Rigvedic Heartland</div>
                  <div className="text-[10px] mt-1">c. 3000-1500 BCE</div>
                </div>
              </div>
            )}

            {/* Aratta Region (Northwestern departure zone) */}
            {showAratta && (
              <div className="absolute bottom-12 right-44 w-28 h-24 bg-orange-400/40 rounded-lg border-2 border-orange-500 shadow-lg animate-pulse">
                <div className="p-2 text-xs font-medium text-orange-700 dark:text-orange-300">
                  <div className="font-bold">Aratta</div>
                  <div className="text-[10px] mt-1">Departure Zone</div>
                  <div className="text-[10px]">Horse Culture</div>
                  <div className="text-[10px]">c. 2000 BCE</div>
                </div>
              </div>
            )}
            
            {/* Iranian Plateau */}
            {showIranian && (
              <div className="absolute bottom-16 left-1/2 w-24 h-28 bg-red-400/30 rounded-lg border-2 border-red-500">
                <div className="p-2 text-[10px] font-medium text-red-700 dark:text-red-300">
                  <div className="font-bold">Iranian Plateau</div>
                  <div className="text-[9px] mt-1">Proto-Iranians</div>
                  <div className="text-[9px]">Zoroastrian Reform</div>
                  <div className="text-[9px]">c. 1800 BCE</div>
                </div>
              </div>
            )}
            
            {/* Mitanni Kingdom (Northern Mesopotamia) */}
            {showMitanni && (
              <div className="absolute top-16 left-12 w-28 h-20 bg-blue-400/40 rounded-lg border-2 border-blue-500 shadow-lg">
                <div className="p-2 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                  <div className="font-bold">Mitanni Kingdom</div>
                  <div className="text-[9px] mt-1">Indo-Aryan Elite</div>
                  <div className="text-[9px]">Maryannu Warriors</div>
                  <div className="text-[9px]">c. 1600-1260 BCE</div>
                </div>
              </div>
            )}
            
            {/* Migration Arrow Overlays */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Main westward migration: Sapta Sindhu → Aratta → Mitanni */}
              {showAratta && (
                <>
                  {/* Sapta Sindhu to Aratta */}
                  <defs>
                    <marker
                      id="arrowhead-orange"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="rgb(249, 115, 22)" opacity="0.8" />
                    </marker>
                  </defs>
                  <path 
                    d="M380 280 Q320 240 260 220" 
                    stroke="rgb(249, 115, 22)" 
                    strokeWidth="3" 
                    fill="none"
                    opacity="0.7"
                    markerEnd="url(#arrowhead-orange)"
                  />
                  <text x="320" y="235" fill="rgb(249, 115, 22)" fontSize="10" fontWeight="bold">
                    Westward Migration
                  </text>
                </>
              )}

              {/* Aratta to Mitanni (if timeline advanced) */}
              {showMitanni && (
                <>
                  <defs>
                    <marker
                      id="arrowhead-blue"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="rgb(59, 130, 246)" opacity="0.8" />
                    </marker>
                  </defs>
                  <path 
                    d="M260 220 Q180 180 110 130" 
                    stroke="rgb(59, 130, 246)" 
                    strokeWidth="3" 
                    fill="none"
                    opacity="0.7"
                    markerEnd="url(#arrowhead-blue)"
                  />
                  <text x="180" y="170" fill="rgb(59, 130, 246)" fontSize="10" fontWeight="bold">
                    To Mesopotamia
                  </text>
                </>
              )}

              {/* Northwest to Iranian Plateau */}
              {showIranian && (
                <>
                  <defs>
                    <marker
                      id="arrowhead-red"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="rgb(239, 68, 68)" opacity="0.8" />
                    </marker>
                  </defs>
                  <path 
                    d="M340 240 Q300 230 250 240" 
                    stroke="rgb(239, 68, 68)" 
                    strokeWidth="3" 
                    fill="none"
                    opacity="0.7"
                    markerEnd="url(#arrowhead-red)"
                  />
                  <text x="280" y="225" fill="rgb(239, 68, 68)" fontSize="10" fontWeight="bold">
                    Proto-Iranians
                  </text>
                </>
              )}
            </svg>
            
            {/* Enhanced Legend */}
            <div className="absolute top-4 left-4 bg-background/95 p-3 rounded-lg border-2 border-border shadow-lg">
              <div className="text-xs font-semibold text-foreground mb-2">Migration Routes & Regions</div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-orange-500"></div>
                  <span>Westward to Aratta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span>To Mitanni (Mesopotamia)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500"></div>
                  <span>Northwest to Iranian Plateau</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border/50 mt-1">
                  <div className="w-3 h-3 bg-orange-400/40 border border-orange-500 rounded"></div>
                  <span>Aratta departure zone</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Information Grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Shared Linguistic Evidence</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Mitanni gods: Mitra, Varuna, Indra, Nasatya</li>
                <li>• Sanskrit numerals in Kikkuli manual</li>
                <li>• Indo-Aryan royal names (Tushratta, Artashumara)</li>
                <li>• Prakritic sound changes (sapta → šatta)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Archaeological Markers</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Peacock imagery in Near East (post-1600 BCE)</li>
                <li>• Indian zebu cattle introduction</li>
                <li>• Asian elephant remains</li>
                <li>• Advanced chariot technology</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Textual Memory</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Baudhayana Shrautasutra westward migration</li>
                <li>• Mahabharata references to Aratta</li>
                <li>• Rigveda pre-schism pantheon</li>
                <li>• Avesta hostile deity inversions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Timeline Context */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Using the Timeline:</p>
          <p>
            Adjust the timeline slider to see the progressive westward migrations from the Sapta Sindhu homeland. 
            The Aratta region in northwestern India served as the departure zone for multiple waves of emigration. 
            The Mitanni (c. 1600 BCE) represent the westernmost extent of Indo-Aryan migration, preserving an 
            archaic form of Vedic religion before the final Deva-Asura schism. Proto-Iranian groups moved northwest 
            to the Iranian Plateau, carrying Zarathustra's reformed religion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}