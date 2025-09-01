import React, { useState, useEffect } from 'react';
import { MONSOON } from '@/data/siteData';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface MonsoonAnimationProps {
  onClose: () => void;
}

export function MonsoonAnimation({ onClose }: MonsoonAnimationProps) {
  const [currentSeason, setCurrentSeason] = useState<'summer' | 'winter'>('summer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 100);
        // Switch seasons every 50 frames
        if (animationFrame % 50 === 0 && animationFrame > 0) {
          setCurrentSeason(prev => prev === 'summer' ? 'winter' : 'summer');
        }
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, animationFrame]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setAnimationFrame(0);
    setCurrentSeason('summer');
  };

  const seasonData = MONSOON[currentSeason];
  const isTransitioning = animationFrame % 50 > 40;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Monsoon Seasonal Animation</h2>
            <p className="text-muted-foreground">Watch how wind patterns shaped ancient navigation</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handlePlay} variant="outline">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={currentSeason === 'summer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSeason('summer')}
              >
                Summer Monsoon
              </Button>
              <Button
                variant={currentSeason === 'winter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSeason('winter')}
              >
                Winter Monsoon
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Animation Canvas */}
            <div className="lg:col-span-2">
              <svg 
                viewBox="0 0 800 500" 
                className="w-full h-auto border border-border rounded-lg bg-ocean/5"
              >
                <defs>
                  {/* Animated arrow marker */}
                  <marker
                    id="wind-arrow"
                    markerWidth="12"
                    markerHeight="8"
                    refX="10"
                    refY="4"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 12 4, 0 8"
                      fill={currentSeason === 'summer' ? 'hsl(var(--laterite))' : 'hsl(var(--ocean))'}
                      opacity={isTransitioning ? 0.5 : 1}
                    />
                  </marker>
                  
                  {/* Gradient for ocean */}
                  <radialGradient id="oceanGradient" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="hsl(var(--ocean) / 0.1)" />
                    <stop offset="100%" stopColor="hsl(var(--ocean) / 0.3)" />
                  </radialGradient>
                </defs>

                {/* Ocean background */}
                <rect width="800" height="500" fill="url(#oceanGradient)" />
                
                {/* Landmasses (simplified) */}
                <path
                  d="M 50 100 Q 200 80 350 100 Q 500 120 700 100 L 750 150 Q 600 170 450 150 Q 300 130 100 150 Z"
                  fill="hsl(var(--sand) / 0.6)"
                  stroke="hsl(var(--sand))"
                />
                <path
                  d="M 100 350 Q 300 330 500 350 Q 650 370 750 350 L 750 450 Q 600 430 400 450 Q 200 470 50 450 Z"
                  fill="hsl(var(--sand) / 0.6)"
                  stroke="hsl(var(--sand))"
                />

                {/* Wind arrows - animated based on season */}
                {Array.from({ length: 8 }, (_, i) => {
                  const baseY = currentSeason === 'summer' ? 250 : 280;
                  const direction = currentSeason === 'summer' ? 1 : -1;
                  const offset = (animationFrame * 2) % 40;
                  
                  return (
                    <g key={i}>
                      <path
                        d={`M ${100 + i * 80 + offset} ${baseY + Math.sin(i * 0.5) * 20} 
                           L ${180 + i * 80 + offset} ${baseY + Math.sin(i * 0.5) * 20 + direction * 10}`}
                        stroke={currentSeason === 'summer' ? 'hsl(var(--laterite))' : 'hsl(var(--ocean))'}
                        strokeWidth="3"
                        markerEnd="url(#wind-arrow)"
                        opacity={isTransitioning ? 0.5 : 0.8}
                        className="transition-opacity duration-300"
                      />
                      
                      {/* Secondary wind lines */}
                      <path
                        d={`M ${120 + i * 80 + offset} ${baseY + 30 + Math.sin(i * 0.7) * 15} 
                           L ${200 + i * 80 + offset} ${baseY + 30 + Math.sin(i * 0.7) * 15 + direction * 8}`}
                        stroke={currentSeason === 'summer' ? 'hsl(var(--laterite))' : 'hsl(var(--ocean))'}
                        strokeWidth="2"
                        markerEnd="url(#wind-arrow)"
                        opacity={isTransitioning ? 0.3 : 0.6}
                        className="transition-opacity duration-300"
                      />
                    </g>
                  );
                })}

                {/* Season label */}
                <text
                  x="400"
                  y="50"
                  textAnchor="middle"
                  className="fill-foreground font-serif text-2xl font-bold"
                  opacity={isTransitioning ? 0.7 : 1}
                >
                  {currentSeason === 'summer' ? 'Summer Monsoon' : 'Winter Monsoon'}
                </text>
                
                {/* Direction indicator */}
                <text
                  x="400"
                  y="80"
                  textAnchor="middle"
                  className="fill-muted-foreground text-sm"
                >
                  {currentSeason === 'summer' ? '→ Eastward Navigation' : '← Westward Return'}
                </text>
              </svg>
            </div>

            {/* Season Information */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {currentSeason === 'summer' ? 'Summer Monsoon' : 'Winter Monsoon'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Active Months</p>
                  <p className="text-sm text-muted-foreground">
                    {seasonData.months.join(', ')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Wind Direction</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentSeason === 'summer' ? '→' : '←'}</span>
                    <span className="text-sm text-muted-foreground">
                      {currentSeason === 'summer' ? 'Southwest winds' : 'Northeast winds'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Navigation Impact</p>
                  <p className="text-sm text-muted-foreground">
                    {currentSeason === 'summer' 
                      ? 'Enabled eastward travel from Arabia and India to Southeast Asia'
                      : 'Allowed westward return journeys, completing the trade cycle'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Trade Significance</p>
                  <p className="text-sm text-muted-foreground">
                    {currentSeason === 'summer' 
                      ? 'Merchants departed with manufactured goods, spices, and bullion'
                      : 'Return with pepper, precious woods, and Southeast Asian luxuries'
                    }
                  </p>
                </div>
              </div>

              {/* Animation Progress */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Animation Progress</span>
                  <span>{Math.round((animationFrame % 50) * 2)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-ocean h-2 rounded-full transition-all duration-100"
                    style={{ width: `${(animationFrame % 50) * 2}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}