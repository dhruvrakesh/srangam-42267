import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TagChip } from '@/components/ui/TagChip';
import { ExternalLink, Download } from 'lucide-react';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';

interface Port {
  id: string;
  display_name: string;
  region: string;
  coords: { lat: number; lon: number; approximate: boolean };
  period_band: string;
  specializations: string[];
  evidence_types: string[];
  tags: string[];
  reading_room_refs: string[];
  needs_citation: boolean;
  description: string;
}

interface PortCardProps {
  port: Port;
  showEvidence: boolean;
  onOpenReadingRoom: (ref: string) => void;
  onDownloadData: (portId: string) => void;
}

export function PortCard({ port, showEvidence, onOpenReadingRoom, onDownloadData }: PortCardProps) {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-serif">
            {port.display_name}
            {showEvidence && port.needs_citation && (
              <Badge variant="outline" className="ml-2 text-xs text-amber-600">
                <span className="mr-1">⚑</span>
                {cosmicOceanI18n.labels.needs_citation}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {port.period_band}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {port.specializations.map((spec) => (
            <TagChip key={spec} variant="default" className="text-xs">
              {spec}
            </TagChip>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {port.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {port.evidence_types.map((type) => (
            <Badge key={type} variant="outline" className="text-xs capitalize">
              {type}
            </Badge>
          ))}
        </div>
        
        {showEvidence && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Coordinates: {port.coords.lat.toFixed(2)}, {port.coords.lon.toFixed(2)}
              {port.coords.approximate && " (approximate)"}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {port.reading_room_refs.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenReadingRoom(port.reading_room_refs[0])}
              className="flex-1"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {cosmicOceanI18n.labels.sources}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownloadData(port.id)}
            className="px-2"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}