import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LittoralCalendarViewer() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Ocean Edge: Littoral Rites and Monsoon Memory</CardTitle>
        <CardDescription>Coastal fishing closures timed to monsoon onset</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Punnai shrines (Malabar/Coromandel) and Bonbibi cycles (Sundarbans) encode adaptive risk management across centuries.</p>
      </CardContent>
    </Card>
  );
}
