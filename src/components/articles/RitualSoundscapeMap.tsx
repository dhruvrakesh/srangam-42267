import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function RitualSoundscapeMap() {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Ritual Soundscapes: Drum Vocabularies</CardTitle>
        <CardDescription>Geographic distribution of percussion instruments as regulatory infrastructure</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Wāngalā (Garo), gōṭul (Muria Gond), and other drum grammars encode harvest closures and coordination.</p>
      </CardContent>
    </Card>
  );
}
