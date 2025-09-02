import React from 'react';

export function IndoIranianMap() {
  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-foreground">
        Indo-Iranian Cultural Sphere (2nd-1st Millennium BCE)
      </h3>
      
      <div className="bg-sand/10 rounded-lg p-6 border">
        <div className="relative w-full h-96 bg-gradient-to-br from-sand/20 to-laterite/10 rounded border overflow-hidden">
          {/* Geographic regions */}
          
          {/* Indian Subcontinent */}
          <div className="absolute bottom-8 right-12 w-24 h-32 bg-primary/30 rounded-lg border border-primary/50">
            <div className="p-2 text-xs font-medium text-primary">
              <div>Vedic India</div>
              <div className="text-[10px] mt-1">Kuru-Panchala</div>
              <div className="text-[10px]">Rigveda</div>
            </div>
          </div>
          
          {/* Central Asia */}
          <div className="absolute top-12 right-20 w-20 h-16 bg-gold/30 rounded border border-gold/50">
            <div className="p-1 text-[10px] font-medium text-gold">
              <div>Bactria</div>
              <div>BMAC</div>
            </div>
          </div>
          
          {/* Iran */}
          <div className="absolute bottom-16 left-1/2 w-20 h-24 bg-laterite/30 rounded border border-laterite/50">
            <div className="p-2 text-[10px] font-medium text-laterite">
              <div>Parsua</div>
              <div>Persians</div>
            </div>
          </div>
          
          {/* Mitanni */}
          <div className="absolute top-20 left-16 w-18 h-16 bg-sand-dark/40 rounded border border-sand-dark/60">
            <div className="p-1 text-[10px] font-medium text-sand-dark">
              <div>Mitanni</div>
              <div>1400 BCE</div>
            </div>
          </div>
          
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* India to Central Asia */}
            <path 
              d="M300 280 Q320 200 340 120" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
              strokeDasharray="5,5" 
              fill="none"
              opacity="0.6"
            />
            
            {/* Central Asia to Iran */}
            <path 
              d="M340 120 Q280 160 240 220" 
              stroke="hsl(var(--gold))" 
              strokeWidth="2" 
              strokeDasharray="5,5" 
              fill="none"
              opacity="0.6"
            />
            
            {/* Iran to Mitanni */}
            <path 
              d="M240 220 Q180 180 120 140" 
              stroke="hsl(var(--laterite))" 
              strokeWidth="2" 
              strokeDasharray="5,5" 
              fill="none"
              opacity="0.6"
            />
          </svg>
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-background/90 p-3 rounded border">
            <div className="text-xs font-medium text-foreground mb-2">Cultural Connections</div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-primary/60"></div>
                <span>Vedic traditions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-gold/60"></div>
                <span>Indo-Iranian links</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-laterite/60"></div>
                <span>Persian connections</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Shared Elements</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Mitanni gods: Mitra, Varuna, Indra, Nasatya</li>
              <li>• Horse training terminology (Sanskrit)</li>
              <li>• Common ritual fire practices</li>
              <li>• Indo-Iranian linguistic roots</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Cultural Exchange</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Vedic Parśu = Persian migrations</li>
              <li>• Shared deity names and concepts</li>
              <li>• Administrative practices</li>
              <li>• Multilingual governance models</li>
            </ul>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        This cultural sphere provided the foundation for Ashoka's sophisticated multilingual 
        administration, building on millennia of Indo-Iranian connections and shared governance practices.
      </p>
    </div>
  );
}