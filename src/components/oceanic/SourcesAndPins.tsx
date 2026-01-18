import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, BookOpen, Flag, ExternalLink, Download, AlertCircle, Database } from 'lucide-react';
import { useArticleBibliographyBySlug, type ArticleBibliographyLink } from '@/hooks/useArticleBibliography';
import { useArticleEvidenceBySlug, type ArticleEvidence } from '@/hooks/useArticleEvidence';
import { correlationEngine, type SourcesAndPins as LegacySourcesAndPinsData } from '@/lib/correlationEngine';
import { useLanguage } from '@/components/language/LanguageProvider';

interface SourcesAndPinsProps {
  pageOrCard: string;
  articleSlug?: string; // New: for database lookup
  compact?: boolean;
}

export const SourcesAndPins: React.FC<SourcesAndPinsProps> = ({ 
  pageOrCard, 
  articleSlug,
  compact = false 
}) => {
  const { currentLanguage } = useLanguage();
  
  // Database queries
  const { data: bibliography, isLoading: bibLoading } = useArticleBibliographyBySlug(articleSlug);
  const { data: evidence, isLoading: evidenceLoading } = useArticleEvidenceBySlug(articleSlug);
  
  // Legacy fallback
  const legacyData = correlationEngine.getSourcesAndPins(pageOrCard);
  
  // Determine if we have database data
  const hasDbData = (bibliography && bibliography.length > 0) || (evidence && evidence.length > 0);
  const isLoading = bibLoading || evidenceLoading;

  const handleDownloadData = () => {
    const exportData = hasDbData
      ? { bibliography, evidence, source: 'database' }
      : { ...legacyData, source: 'legacy' };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(articleSlug || pageOrCard).toLowerCase().replace(/\s+/g, '-')}-sources.json`;
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
            {hasDbData && <Database className="h-3 w-3 text-primary" />}
            <Badge variant="secondary" className="ml-1">
              {hasDbData ? (bibliography?.length || 0) + (evidence?.length || 0) : legacyData.pins.length}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sources & Pins
              {hasDbData && (
                <Badge variant="outline" className="ml-2 gap-1">
                  <Database className="h-3 w-3" />
                  Database
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          <SourcesAndPinsContent 
            bibliography={bibliography}
            evidence={evidence}
            legacyData={legacyData}
            hasDbData={hasDbData}
            isLoading={isLoading}
            onDownload={handleDownloadData}
          />
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
            {hasDbData && (
              <Badge variant="outline" className="ml-2 gap-1 text-xs">
                <Database className="h-3 w-3" />
                Database
              </Badge>
            )}
          </span>
          <Button variant="ghost" size="sm" onClick={handleDownloadData}>
            <Download className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SourcesAndPinsContent 
          bibliography={bibliography}
          evidence={evidence}
          legacyData={legacyData}
          hasDbData={hasDbData}
          isLoading={isLoading}
          onDownload={handleDownloadData}
        />
      </CardContent>
    </Card>
  );
};

const SourceQualityBadge: React.FC<{ quality: string | null }> = ({ quality }) => {
  const variants: Record<string, { color: string; label: string }> = {
    primary: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', label: 'Primary' },
    secondary: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', label: 'Secondary' },
    tradition: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300', label: 'Tradition' },
  };
  
  const variant = variants[quality || 'secondary'] || variants.secondary;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variant.color}`}>
      {variant.label}
    </span>
  );
};

const SourcesAndPinsContent: React.FC<{
  bibliography: ArticleBibliographyLink[] | undefined;
  evidence: ArticleEvidence[] | undefined;
  legacyData: LegacySourcesAndPinsData;
  hasDbData: boolean;
  isLoading: boolean;
  onDownload: () => void;
}> = ({ bibliography, evidence, legacyData, hasDbData, isLoading }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<ArticleEvidence | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Use database data if available, otherwise fall back to legacy
  if (hasDbData) {
    return (
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={!showEvidence ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEvidence(false)}
          >
            Bibliography
          </Button>
          <Button
            variant={showEvidence ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEvidence(true)}
          >
            Evidence ({evidence?.length || 0})
          </Button>
        </div>

        {/* Bibliography View */}
        {!showEvidence && bibliography && bibliography.length > 0 && (
          <div className="space-y-4">
            {/* Group by source type */}
            {['primary', 'secondary'].map(sourceType => {
              const filtered = bibliography.filter(b => 
                sourceType === 'primary' ? b.is_primary_source : !b.is_primary_source
              );
              if (filtered.length === 0) return null;
              
              return (
                <div key={sourceType} className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <SourceQualityBadge quality={sourceType} />
                    Sources ({filtered.length})
                  </h4>
                  {filtered.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-muted/30 border-l-2 border-l-primary/40">
                      <p className="text-sm font-mono">
                        {item.bibliography.full_citation_mla || 
                         `${item.bibliography.authors?.[0]?.last || 'Unknown'}, ${item.bibliography.title?.en || 'Untitled'}. ${item.bibliography.year || ''}`}
                      </p>
                      {item.citation_context && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Context: {item.citation_context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Evidence View */}
        {showEvidence && evidence && evidence.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Evidence Points ({evidence.length})
            </h4>
            {evidence.map((entry) => (
              <div 
                key={entry.id} 
                className="p-3 rounded-lg bg-background border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedEvidence(entry)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.date_approx && (
                        <Badge variant="outline" className="text-xs">{entry.date_approx}</Badge>
                      )}
                      {entry.place && (
                        <span className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.place}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.event_description}
                    </p>
                  </div>
                  <SourceQualityBadge quality={entry.source_quality} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Data Message */}
        {!showEvidence && (!bibliography || bibliography.length === 0) && (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No structured bibliography available</p>
          </div>
        )}

        {/* Evidence Detail Dialog */}
        <Dialog open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {selectedEvidence?.place || 'Evidence Detail'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {selectedEvidence?.date_approx && (
                <div>
                  <h4 className="font-semibold mb-1">Date</h4>
                  <p className="text-muted-foreground">{selectedEvidence.date_approx}</p>
                </div>
              )}
              {selectedEvidence?.actors && selectedEvidence.actors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1">Key Figures</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvidence.actors.map((actor, i) => (
                      <Badge key={i} variant="secondary">{actor}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedEvidence?.event_description && (
                <div>
                  <h4 className="font-semibold mb-1">Event</h4>
                  <p className="text-muted-foreground">{selectedEvidence.event_description}</p>
                </div>
              )}
              {selectedEvidence?.significance && (
                <div>
                  <h4 className="font-semibold mb-1">Significance</h4>
                  <p className="text-muted-foreground">{selectedEvidence.significance}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-1">Source Quality</h4>
                <SourceQualityBadge quality={selectedEvidence?.source_quality || null} />
              </div>
              {selectedEvidence?.latitude && selectedEvidence?.longitude && (
                <div>
                  <h4 className="font-semibold mb-1">Coordinates</h4>
                  <p className="text-muted-foreground font-mono">
                    {selectedEvidence.latitude.toFixed(4)}°N, {selectedEvidence.longitude.toFixed(4)}°E
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Legacy fallback (original implementation)
  return (
    <div className="space-y-6">
      {/* Legacy Notice */}
      <div className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <span className="text-xs text-amber-700 dark:text-amber-300">
          Using cached sources. Re-import article for structured bibliography.
        </span>
      </div>

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
        {legacyData.claims.map((claim, index) => (
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
      {legacyData.primary_sources.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Primary Sources
          </h4>
          {legacyData.primary_sources.map((source, index) => (
            <div key={index} className="p-2 rounded bg-background border">
              <p className="text-sm">{source}</p>
            </div>
          ))}
        </div>
      )}

      {/* Archaeological Evidence */}
      {showEvidence && legacyData.archaeology_evidence.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Archaeological Evidence
          </h4>
          {legacyData.archaeology_evidence.map((evidence, index) => (
            <div key={index} className="p-2 rounded bg-background border">
              <p className="text-sm">{evidence}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pins */}
      {legacyData.pins.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Geographical Pins ({legacyData.pins.length})
          </h4>
          <div className="grid gap-2">
            {legacyData.pins.map((pin, index) => (
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
      {showEvidence && legacyData.mla_citations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            MLA Citations
          </h4>
          <div className="text-xs space-y-1 bg-muted/20 p-3 rounded border">
            {legacyData.mla_citations.map((citation, index) => (
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
