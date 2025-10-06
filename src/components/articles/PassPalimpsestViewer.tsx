import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PassPalimpsestViewer() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Edakkal: The Pass Palimpsest</CardTitle>
        <CardDescription>Multi-phase petroglyphs spanning Neolithic to medieval (Kerala)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Trade corridor nexus with 5,000+ years of cumulative marking.</p>
      </CardContent>
    </Card>
  );
}
