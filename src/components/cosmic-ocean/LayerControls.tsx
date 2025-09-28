import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';
import layersData from '@/data/cosmic_ocean/layers.json';

interface LayerControlsProps {
  enabledLayers: string[];
  onLayerToggle: (layerId: string) => void;
}

export function LayerControls({ enabledLayers, onLayerToggle }: LayerControlsProps) {
  // Debug: Log when LayerControls receives new props
  React.useEffect(() => {
    console.log('LayerControls received enabledLayers:', enabledLayers);
  }, [enabledLayers]);

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-sm font-medium mb-3">{cosmicOceanI18n.labels.layers}</h3>
      <div className="flex flex-wrap gap-4">
        {layersData.map.layers.map((layer) => (
          <div key={layer.id} className="flex items-center space-x-2">
            <Switch
              id={`layer-${layer.id}`}
              checked={enabledLayers.includes(layer.id)}
              onCheckedChange={() => {
                console.log('LayerControls switch clicked:', layer.id);
                onLayerToggle(layer.id);
              }}
            />
            <Label htmlFor={`layer-${layer.id}`} className="text-sm">
              {layer.label}
            </Label>
          </div>
        ))}
      </div>
    </Card>
  );
}