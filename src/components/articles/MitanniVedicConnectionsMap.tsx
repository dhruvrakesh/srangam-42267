import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MitanniVedicConnectionsMap() {
  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Mitanni-Vedic Connections: Geographic Evidence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">India: Vedic Heartland</h4>
            <p className="text-sm text-muted-foreground">Sapta Sindhu region - Vedic deities (Indra, Varuna, Mitra)</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Mitanni Kingdom (1380 BCE)</h4>
            <p className="text-sm text-muted-foreground">Syria-Iraq - Same deities in treaty inscriptions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
