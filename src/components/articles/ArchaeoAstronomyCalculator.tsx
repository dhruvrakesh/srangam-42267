import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ArchaeoAstronomyCalculator() {
  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Archaeo-Astronomy: Dating Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Interactive astronomical dating calculator - demonstrating precession-based chronology methods used by Tilak and Jacobi.</p>
      </CardContent>
    </Card>
  );
}
