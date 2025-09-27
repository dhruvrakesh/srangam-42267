import { Badge } from '@/components/ui/badge';

export const CoastalEvolutionTimeline = () => (
  <div className="space-y-6">
    <h3 className="font-serif text-lg font-semibold text-foreground">
      Major Geological Events Affecting South Indian Ports
    </h3>
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-ocean/30"></div>
      
      {/* Events */}
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">c. 300 CE</Badge>
            <h4 className="font-semibold text-foreground">Puhār Tsunami/Storm Surge</h4>
            <p className="text-sm text-muted-foreground">
              Major Chola port of Kaveripattinam submerged by catastrophic marine event. 
              Archaeological evidence found 6-8m underwater off modern Poompuhar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">1341 CE</Badge>
            <h4 className="font-semibold text-foreground">Great Periyar Flood</h4>
            <p className="text-sm text-muted-foreground">
              Massive flood silts up Muziris harbor, creates Vypin Island, and births 
              modern Kochi port. Transforms Kerala's entire coastal geography.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">c. 1400 BCE</Badge>
            <h4 className="font-semibold text-foreground">Dwarka Submergence (Proposed)</h4>
            <p className="text-sm text-muted-foreground">
              Possible seismic event submerges original Dwarka in Gulf of Cambay, 
              preserved in cultural memory as Krishna's city beneath the waves.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-background rounded-full"></div>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">7000-11000 years ago</Badge>
            <h4 className="font-semibold text-foreground">Post-Glacial Sea Level Rise</h4>
            <p className="text-sm text-muted-foreground">
              60m sea level rise in Gulf of Mannar drowns coastal areas, preserved 
              in Tamil cultural memory as the lost lands of Kumari Kandam.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);