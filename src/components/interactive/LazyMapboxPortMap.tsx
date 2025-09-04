import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

const MapboxPortMap = lazy(() => 
  import('./MapboxPortMap').then(module => ({ default: module.MapboxPortMap }))
);

interface LazyMapboxPortMapProps {
  onClose: () => void;
}

function MapLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="text-ocean animate-pulse" size={48} />
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">Loading Interactive Map</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span>Initializing ancient port network...</span>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          This may take a moment to load geographic data and satellite imagery.
        </div>
      </div>
    </div>
  );
}

export function LazyMapboxPortMap({ onClose }: LazyMapboxPortMapProps) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <MapboxPortMap onClose={onClose} />
    </Suspense>
  );
}