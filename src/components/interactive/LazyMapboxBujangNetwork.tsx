import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Ship } from 'lucide-react';

const MapboxBujangNetwork = lazy(() => 
  import('./MapboxBujangNetwork').then(module => ({ default: module.MapboxBujangNetwork }))
);

interface LazyMapboxBujangNetworkProps {
  onClose: () => void;
}

function BujangLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Ship className="text-ocean animate-pulse" size={48} />
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">Loading Bujang Valley Network</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span>Initializing archaeological site map...</span>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Loading detailed satellite imagery and archaeological data for the ancient Bujang Valley.
        </div>
      </div>
    </div>
  );
}

export function LazyMapboxBujangNetwork({ onClose }: LazyMapboxBujangNetworkProps) {
  return (
    <Suspense fallback={<BujangLoadingFallback />}>
      <MapboxBujangNetwork onClose={onClose} />
    </Suspense>
  );
}