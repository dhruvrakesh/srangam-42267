import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';

interface EvidenceToggleProps {
  showEvidence: boolean;
  onToggle: (value: boolean) => void;
}

export function EvidenceToggle({ showEvidence, onToggle }: EvidenceToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
      <Label htmlFor="evidence-mode" className="text-sm font-medium">
        {cosmicOceanI18n.labels.narrative}
      </Label>
      <Switch
        id="evidence-mode"
        checked={showEvidence}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      <Label htmlFor="evidence-mode" className="text-sm font-medium">
        {cosmicOceanI18n.labels.evidence}
      </Label>
      {showEvidence && (
        <Badge variant="outline" className="ml-2 text-xs">
          <span className="mr-1">⚑</span>
          {cosmicOceanI18n.labels.needs_citation}
        </Badge>
      )}
    </div>
  );
}