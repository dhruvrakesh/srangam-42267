import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, BookOpen, Flag, ExternalLink, Download } from 'lucide-react';
import { correlationEngine, type SourcesAndPins as SourcesAndPinsData } from '@/lib/correlationEngine';
import { useLanguage } from '@/components/language/LanguageProvider';

interface SourcesAndPinsProps {
  pageOrCard: string;
  compact?: boolean;
}

export const SourcesAndPins: React.FC<SourcesAndPinsProps> = ({ 
  pageOrCard, 
  compact = false 
}) => {
  const { currentLanguage } = useLanguage();
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  
  const data = correlationEngine.getSourcesAndPins(pageOrCard);

  const handleDownloadData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pageOrCard.toLowerCase().replace(/\s+/g, '-')}-sources-pins.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <Sheet>
        <SheetTrigger asChild>  
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Sources & Pins
            <Badge variant="secondary" className="ml-1">
              {data.pins.length}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sources & Pins
            </SheetTitle>
          </SheetHeader>
          <SourcesAndPinsContent data={data} onDownload={handleDownloadData} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sources & Pins
          </span>
          <Button variant="ghost" size="sm" onClick={handleDownloadData}>
            <Download className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SourcesAndPinsContent data={data} onDownload={handleDownloadData} />
      </CardContent>
    </Card>
  );
};

const SourcesAndPinsContent: React.FC<{
  data: SourcesAndPinsData;
  onDownload: () => void;
}> = ({ data }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Evidence Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={!showEvidence ? "default" : "outline"}
          size="sm"
          onClick={() => setShowEvidence(false)}
        >
          Narrative
        </Button>
        <Button
          variant={showEvidence ? "default" : "outline"}
          size="sm"
          onClick={() => setShowEvidence(true)}
        >
          Evidence
        </Button>
      </div>

      {/* Claims */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Key Claims
        </h4>
        {data.claims.map((claim, index) => (
          <div key={index} className="p-3 rounded-lg bg-muted/30 border-l-2 border-l-primary/40">
            <p className="text-sm">{claim.text}</p>
            {showEvidence && claim.needs_citation && (
              <Badge variant="outline" className="mt-2 gap-1">
                <Flag className="h-3 w-3" />
                Needs citation
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Primary Sources */}
      {data.primary_sources.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Primary Sources
          </h4>
          {data.primary_sources.map((source, index) => (
            <div key={index} className="p-2 rounded bg-background border">
              <p className="text-sm">{source}</p>
            </div>
          ))}
        </div>
      )}

      {/* Archaeological Evidence */}
      {showEvidence && data.archaeology_evidence.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Archaeological Evidence
          </h4>
          {data.archaeology_evidence.map((evidence, index) => (
            <div key={index} className="p-2 rounded bg-background border">
              <p className="text-sm">{evidence}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pins */}
      {data.pins.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Geographical Pins ({data.pins.length})
          </h4>
          <div className="grid gap-2">
            {data.pins.map((pin, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-background border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{pin.name}</span>
                  {pin.approximate && (
                    <Badge variant="secondary" className="text-xs">
                      Approx.
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setSelectedPin(pin)}
                >
                  <ExternalLink className="h-3 w-3" />
                  Sources
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MLA Citations */}
      {showEvidence && data.mla_citations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            MLA Citations
          </h4>
          <div className="text-xs space-y-1 bg-muted/20 p-3 rounded border">
            {data.mla_citations.map((citation, index) => (
              <p key={index} className="font-mono">{citation}</p>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full">
            See full bibliography
          </Button>
        </div>
      )}

      {/* Pin Sources Dialog */}
      <Dialog open={!!selectedPin} onOpenChange={(open) => !open && setSelectedPin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedPin?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Coordinates</h4>
              <p className="text-muted-foreground font-mono">
                {selectedPin?.lat.toFixed(4)}°N, {selectedPin?.lon.toFixed(4)}°E
                {selectedPin?.approximate && (
                  <Badge variant="secondary" className="ml-2">Approximate</Badge>
                )}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Evidence Sources</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Archaeological Survey of India Reports</li>
                <li>Historical gazetteers and colonial surveys</li>
                <li>Epigraphic records from the region</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Verification Status</h4>
              <Badge variant={selectedPin?.approximate ? "secondary" : "default"}>
                {selectedPin?.approximate ? "Requires Field Verification" : "GPS Verified"}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SourcesAndPins;