import React, { useState } from 'react';
import { PLATE_SPEED } from '@/data/siteData';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { PlateSpeedChart } from '@/components/articles/PlateSpeedChart';

interface PlateTimelineProps {
  onClose: () => void;
}

export function PlateTimeline({ onClose }: PlateTimelineProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof PLATE_SPEED[0] | null>(PLATE_SPEED[0]);

  const getPeriodColor = (speed: number) => {
    if (speed >= 15) return 'hsl(var(--laterite))';
    if (speed >= 10) return 'hsl(var(--gold))';
    if (speed >= 6) return 'hsl(var(--ocean))';
    return 'hsl(var(--muted-foreground))';
  };

  const getPeriodDescription = (period: typeof PLATE_SPEED[0]) => {
    if (period.Ma >= 100) {
      return "Early formation period - India as part of Gondwana supercontinent";
    } else if (period.Ma >= 70) {
      return "The Great Sprint - India racing northward after Gondwana breakup";
    } else if (period.Ma >= 50) {
      return "Collision approach - Slowing as India nears the Eurasian plate";
    } else if (period.Ma >= 20) {
      return "Active collision - Himalayan orogeny in full swing";
    } else {
      return "Modern era - Continued slow collision and mountain building";
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Interactive Plate Timeline</h2>
            <p className="text-muted-foreground">Explore India's geological journey through deep time</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Visualization */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Timeline</h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
                
                <div className="space-y-4">
                  {PLATE_SPEED.map((period, index) => (
                    <div 
                      key={period.Ma}
                      className={`relative flex items-center gap-4 cursor-pointer p-3 rounded-lg transition-colors ${
                        selectedPeriod?.Ma === period.Ma 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {/* Timeline dot */}
                      <div 
                        className="w-4 h-4 rounded-full border-2 bg-card z-10"
                        style={{ 
                          borderColor: getPeriodColor(period.cm_per_yr),
                          backgroundColor: selectedPeriod?.Ma === period.Ma 
                            ? getPeriodColor(period.cm_per_yr) 
                            : 'hsl(var(--card))'
                        }}
                      ></div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{period.Ma} Ma</span>
                          <span 
                            className="text-sm font-medium px-2 py-1 rounded"
                            style={{ 
                              color: getPeriodColor(period.cm_per_yr),
                              backgroundColor: `${getPeriodColor(period.cm_per_yr)}20`
                            }}
                          >
                            {period.cm_per_yr} cm/yr
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getPeriodDescription(period)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Period Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {selectedPeriod ? `${selectedPeriod.Ma} Million Years Ago` : 'Select a Period'}
              </h3>
              
              {selectedPeriod && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="text-center mb-4">
                      <div 
                        className="w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center text-lg font-bold text-card mb-2"
                        style={{ 
                          borderColor: getPeriodColor(selectedPeriod.cm_per_yr),
                          backgroundColor: getPeriodColor(selectedPeriod.cm_per_yr)
                        }}
                      >
                        {selectedPeriod.cm_per_yr}
                      </div>
                      <p className="text-sm text-muted-foreground">cm per year</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Geological Context</p>
                        <p className="text-sm text-muted-foreground">
                          {getPeriodDescription(selectedPeriod)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-foreground">Speed Category</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPeriod.cm_per_yr >= 15 ? 'Ultra-fast (Sprint Phase)' :
                           selectedPeriod.cm_per_yr >= 10 ? 'Very Fast' :
                           selectedPeriod.cm_per_yr >= 6 ? 'Moderate' : 'Slow (Modern)'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-foreground">Human Perspective</p>
                        <p className="text-sm text-muted-foreground">
                          In a human lifetime (~80 years), the plate would move approximately{' '}
                          <strong>{(selectedPeriod.cm_per_yr * 80 / 100).toFixed(1)} meters</strong>
                        </p>
                      </div>
                      
                      {selectedPeriod.Ma === 70 && (
                        <div>
                          <p className="text-sm font-medium text-foreground">Peak Speed Era</p>
                          <p className="text-sm text-muted-foreground">
                            This represents the fastest recorded movement of the Indian plate,
                            earning the nickname "sprint phase" among geologists.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="border-t border-border pt-6">
            <PlateSpeedChart />
          </div>

          {/* Key Insights */}
          <div className="border-t border-border pt-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-laterite/10 border border-laterite/20">
                <h4 className="font-medium text-foreground text-sm mb-2">The Great Sprint</h4>
                <p className="text-xs text-muted-foreground">
                  70 Ma: India moved at 18 cm/yr, making it one of the fastest-moving plates in Earth's history
                </p>
              </div>
              <div className="p-4 rounded-lg bg-ocean/10 border border-ocean/20">
                <h4 className="font-medium text-foreground text-sm mb-2">Collision Impact</h4>
                <p className="text-xs text-muted-foreground">
                  50-20 Ma: Dramatic slowdown as India collided with Eurasia, creating the Himalayas
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gold/10 border border-gold/20">
                <h4 className="font-medium text-foreground text-sm mb-2">Modern Era</h4>
                <p className="text-xs text-muted-foreground">
                  Present: Continues at ~4 cm/yr, still pushing up the world's highest mountains
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}