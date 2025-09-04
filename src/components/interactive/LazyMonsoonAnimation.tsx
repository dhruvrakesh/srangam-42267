import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wind } from 'lucide-react';

const MonsoonAnimation = lazy(() => 
  import('./MonsoonAnimation').then(module => ({ default: module.MonsoonAnimation }))
);

interface LazyMonsoonAnimationProps {
  onClose: () => void;
}

function MonsoonLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Wind className="text-ocean animate-pulse" size={48} />
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">Loading Monsoon Animation</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span>Preparing wind pattern visualization...</span>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Initializing seasonal monsoon cycle demonstration with ancient navigation patterns.
        </div>
      </div>
    </div>
  );
}

export function LazyMonsoonAnimation({ onClose }: LazyMonsoonAnimationProps) {
  return (
    <Suspense fallback={<MonsoonLoadingFallback />}>
      <MonsoonAnimation onClose={onClose} />
    </Suspense>
  );
}