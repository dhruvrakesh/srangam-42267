import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function FloodStratigraphyDiagram() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Hastināpura: Epic Floods and PGW Stratigraphy</CardTitle>
        <CardDescription>Text-stratum dialogue (9th-8th centuries BCE, Uttar Pradesh)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Silt-flood band interrupting Painted Grey Ware occupation corresponds to Mahābhārata flood narratives.</p>
      </CardContent>
    </Card>
  );
}
