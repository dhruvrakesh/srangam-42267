import { CaseStudy, getSourceById, formatCitation, getConfidenceBadge } from '@/lib/geodeep';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, BookOpen, AlertTriangle } from 'lucide-react';
import { IconScript, IconDharmaChakra } from '@/components/icons';

interface EvidenceDrawerProps {
  caseStudy: CaseStudy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceDrawer = ({ caseStudy, isOpen, onClose }: EvidenceDrawerProps) => {
  if (!caseStudy) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <IconDharmaChakra size={24} className="text-indigo-dharma" />
            <SheetTitle className="font-serif text-xl text-foreground">
              {caseStudy.title}
            </SheetTitle>
          </div>
          <SheetDescription className="text-muted-foreground">
            {caseStudy.summary}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-6">
          <div className="space-y-6">
            {/* Text Memories Section */}
            {caseStudy.texts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <IconScript size={20} className="text-indigo-dharma" />
                  <h3 className="font-medium text-foreground">Sacred Text Memories</h3>
                </div>
                
                {caseStudy.texts.map((text, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-indigo-dharma/5 border border-indigo-dharma/20 mb-3">
                    <div className="text-sm font-medium text-indigo-dharma mb-2">
                      {text.tradition}
                    </div>
                    <div className="font-sanskrit text-base text-indigo-dharma mb-2 leading-relaxed">
                      {text.excerpt}
                    </div>
                    <div className="text-sm text-muted-foreground italic border-l-2 border-indigo-dharma/30 pl-3">
                      "{text.translation}"
                    </div>
                    <div className="text-xs text-indigo-dharma/60 mt-2">
                      Word limit: {text.limitWords} | Character count: {text.excerpt.length}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Evidence Claims Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-laterite" />
                <h3 className="font-medium text-foreground">Evidence Claims</h3>
                <Badge variant="outline" className="text-xs">
                  {caseStudy.claims.length} Claims
                </Badge>
              </div>

              <div className="space-y-4">
                {caseStudy.claims.map((claim, idx) => {
                  const badge = getConfidenceBadge(claim.confidence);
                  
                  return (
                    <div key={idx} className="p-4 rounded-lg border border-border/50 bg-card/50">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.label}
                        </Badge>
                        {claim.confidence === 'amber' && (
                          <AlertTriangle size={16} className="text-amber-600" />
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground mb-3 leading-relaxed">
                        {claim.text}
                      </p>
                      
                      {claim.evidence.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Supporting Evidence:
                          </div>
                          {claim.evidence.map((evidenceId, evidenceIdx) => {
                            const source = getSourceById(evidenceId);
                            
                            if (!source) {
                              return (
                                <div key={evidenceIdx} 
                                     className="p-2 rounded bg-red-50 border border-red-200 text-red-800">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    <span className="text-xs font-medium">CITATION MISSING: {evidenceId}</span>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div key={evidenceIdx} 
                                   className="p-3 rounded-lg bg-background/50 border border-border/30">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {formatCitation(source)}
                                </div>
                                {source.url && (
                                  <Button variant="ghost" size="sm" className="h-6 text-xs p-1" asChild>
                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink size={12} className="mr-1" />
                                      View Source
                                    </a>
                                  </Button>
                                )}
                                {source.note && (
                                  <div className="text-xs text-amber-600 mt-1 italic">
                                    Note: {source.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assets Section */}
            {caseStudy.assets.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium text-foreground mb-3">Visual Evidence</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {caseStudy.assets.map((asset, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border/50 bg-card/30">
                        <div className="text-sm text-muted-foreground">
                          {asset.split('/').pop()?.replace(/\.[^/.]+$/, "").replace(/-/g, " ")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Path: {asset}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};