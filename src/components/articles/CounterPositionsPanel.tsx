import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CounterPositionsPanel() {
  return (
    <Card className="my-8 border-amber-500/20 bg-amber-500/5">
      <CardHeader>
        <CardTitle>Counter-Positions: Scholarly Skepticism</CardTitle>
        <CardDescription>Methodological humility and evidence limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div><strong>Survivals Trap:</strong> Avoid claims of "pristine continuity"—document structural rhymes, not genetic descent.</div>
        <div><strong>Taphonomy:</strong> Multiple pathways can produce similar outcomes. Acknowledge ambiguity.</div>
        <div><strong>Dating Humility:</strong> OSL dates carry ±10-20% uncertainty. Report ranges, not false precision.</div>
        <div><strong>Decline to Time-Lock:</strong> Oral traditions preserve patterns but resist exact dating without independent anchors.</div>
      </CardContent>
    </Card>
  );
}
