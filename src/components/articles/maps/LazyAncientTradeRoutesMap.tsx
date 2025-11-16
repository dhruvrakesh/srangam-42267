import React, { lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AncientTradeRoutesMap = lazy(() => 
  import('./AncientTradeRoutesMap').then(module => ({ 
    default: module.AncientTradeRoutesMap 
  }))
);

function MapLoadingFallback() {
  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Ancient Trade Routes: Uttarāpatha & Dakṣiṇāpatha</CardTitle>
        <CardDescription>
          Loading interactive trade routes map...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] rounded-lg bg-muted/20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing ancient trade routes visualization...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LazyAncientTradeRoutesMap() {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <AncientTradeRoutesMap />
    </Suspense>
  );
}
