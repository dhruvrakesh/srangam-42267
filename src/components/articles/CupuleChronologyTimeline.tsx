import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CupuleChronologyTimeline() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Daraki-Chattān: Cupules and Deep Time</CardTitle>
        <CardDescription>Lower Palaeolithic origins (200,000+ years BP) - Madhya Pradesh</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <Badge className="mb-2">OSL Dating: 200,000+ BP</Badge>
            <p className="text-sm">Thousands of cupules—hemispherical depressions pecked into rock. Among oldest known rock art.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
