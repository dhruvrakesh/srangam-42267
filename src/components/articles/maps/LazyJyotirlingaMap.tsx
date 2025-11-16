import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { JyotirlingaMap } from './JyotirlingaMap';
import { ClientSideMapWrapper } from './ClientSideMapWrapper';

function MapLoadingFallback() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🕉️</span>
          The Twelve Jyotirliṅgas: Sacred Geography of Śiva Worship
        </CardTitle>
        <CardDescription>
          Loading interactive sacred geography map...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] rounded-lg bg-muted/20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing sacred geography visualization...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LazyJyotirlingaMapProps {
  selectedSite?: string | null;
}

export function LazyJyotirlingaMap(props: LazyJyotirlingaMapProps) {
  return (
    <ClientSideMapWrapper fallback={<MapLoadingFallback />}>
      <JyotirlingaMap {...props} />
    </ClientSideMapWrapper>
  );
}
