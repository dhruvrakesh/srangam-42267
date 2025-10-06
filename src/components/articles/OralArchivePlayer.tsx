import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function OralArchivePlayer() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Andaman Voices: Oral Archives at Risk</CardTitle>
        <CardDescription>Great Andamanese songs and ecological knowledge (fewer than 60 fluent speakers)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Ornithological lexicons of 100+ bird species encode fine-grained environmental knowledge in moribund languages.</p>
      </CardContent>
    </Card>
  );
}
