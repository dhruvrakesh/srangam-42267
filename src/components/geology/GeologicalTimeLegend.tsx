import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Layers, Clock, Beaker, ChevronDown, ChevronUp } from 'lucide-react';
import { karewaLayers } from '@/data/geology/kashmir-lake-data';
import type { KarewaLayer } from '@/data/geology/kashmir-lake-data';

interface GeologicalTimeLegendProps {
  selectedLayer?: KarewaLayer | null;
  onLayerSelect?: (layer: KarewaLayer | null) => void;
  onFilterChange?: (visibleLayerIds: string[]) => void;
  onTimeRangeChange?: (range: [number, number]) => void;
}

export function GeologicalTimeLegend({
  selectedLayer,
  onLayerSelect,
  onFilterChange,
  onTimeRangeChange
}: GeologicalTimeLegendProps) {
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(
    new Set(karewaLayers.map(l => l.id))
  );
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 900000]);

  const formatAge = (yearBP: number): string => {
    if (yearBP >= 1000000) {
      return `${(yearBP / 1000000).toFixed(1)} Ma`;
    } else if (yearBP >= 1000) {
      return `${(yearBP / 1000).toFixed(0)} ka`;
    }
    return `${yearBP} years BP`;
  };

  const toggleLayerVisibility = (layerId: string) => {
    const newVisible = new Set(visibleLayers);
    if (newVisible.has(layerId)) {
      newVisible.delete(layerId);
    } else {
      newVisible.add(layerId);
    }
    setVisibleLayers(newVisible);
    onFilterChange?.(Array.from(newVisible));
  };

  const handleTimeRangeChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]];
    setTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const handleShowAll = () => {
    const allLayerIds = karewaLayers.map(l => l.id);
    setVisibleLayers(new Set(allLayerIds));
    onFilterChange?.(allLayerIds);
  };

  const filteredLayers = karewaLayers.filter(
    l => l.endYearBP >= timeRange[0] && l.startYearBP <= timeRange[1]
  );

  const compositionColors = {
    clay: 'hsl(25, 60%, 40%)',
    silt: 'hsl(43, 74%, 49%)',
    sand: 'hsl(28, 87%, 67%)',
    volcanicAsh: 'hsl(0, 0%, 41%)'
  };

  return (
    <Card className="my-6 bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="w-5 h-5 text-primary" />
          Geological Timeline Legend
        </CardTitle>
        <CardDescription>
          Filter and explore Karewa formation layers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range Filter */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Time Range Filter
          </h5>
          <Slider
            min={0}
            max={900000}
            step={1000}
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatAge(timeRange[0])}</span>
            <span>{formatAge(timeRange[1])}</span>
          </div>
        </div>

        {/* Layer List */}
        <div className="space-y-3">
          {filteredLayers.map((layer) => {
            const isVisible = visibleLayers.has(layer.id);
            const isSelected = selectedLayer?.id === layer.id;
            const isExpanded = expandedLayer === layer.id;

            return (
              <div
                key={layer.id}
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card'
                } ${
                  isVisible ? 'opacity-100' : 'opacity-40'
                }`}
                style={{
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Layer Header */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={() => toggleLayerVisibility(layer.id)}
                    className="mt-1"
                    aria-label={`Toggle ${layer.name} visibility`}
                  />
                  
                  <div
                    className="w-10 h-10 rounded flex-shrink-0 border-2 border-background shadow-sm"
                    style={{ backgroundColor: layer.color }}
                    aria-label={`${layer.name} color indicator`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => onLayerSelect?.(isSelected ? null : layer)}
                        className="font-semibold text-left hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        {layer.name}
                      </button>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {layer.period}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatAge(layer.startYearBP)} - {formatAge(layer.endYearBP)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Beaker className="w-3 h-3" />
                        {layer.thickness}m thick
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs mt-3 h-7"
                      onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Show Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-accordion-down">
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Description</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {layer.description}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-3">Composition</h5>
                      <div className="space-y-3">
                        {Object.entries(layer.composition).map(([type, percentage]) => (
                          <div key={type}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="capitalize font-medium">{type.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <strong>{percentage}%</strong>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-500 ease-out"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: compositionColors[type as keyof typeof compositionColors]
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Fossil Evidence</h5>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {layer.fossilEvidence.map((fossil, idx) => (
                          <li key={idx} className="leading-relaxed">{fossil}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Bar */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Visible Layers:</span>
              <strong className="text-primary">{visibleLayers.size} / {karewaLayers.length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Thickness:</span>
              <strong className="text-primary">
                {filteredLayers
                  .filter(l => visibleLayers.has(l.id))
                  .reduce((sum, l) => sum + l.thickness, 0)}m
              </strong>
            </div>
          </div>
          {visibleLayers.size < karewaLayers.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowAll}
              className="w-full mt-3"
            >
              Show All Layers
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
