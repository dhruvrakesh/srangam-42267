import { getSources } from '@/lib/geodeep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Book, FileText, Scroll, AlertTriangle } from 'lucide-react';
import { IconScript } from '@/components/icons';

export const ReadingRoomGeology = () => {
  const sources = getSources();
  
  const peerReviewSources = sources.filter(s => 
    s.type === 'article' && s.confidence === 'green'
  );
  
  const textualSources = sources.filter(s => s.type === 'text');
  
  const interpretiveSources = sources.filter(s => 
    (s.type === 'book' && s.confidence === 'amber') || s.note?.includes('interpretation')
  );

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'book': return Book;
      case 'text': return Scroll;
      default: return FileText;
    }
  };

  const SourceCard = ({ source }: { source: any }) => {
    const SourceIcon = getSourceIcon(source.type);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-laterite/10 border border-laterite/20">
                {source.type === 'text' ? (
                  <IconScript size={20} className="text-indigo-dharma" />
                ) : (
                  <SourceIcon size={20} className="text-laterite" />
                )}
              </div>
              <div>
                <Badge 
                  variant={source.confidence === 'green' ? 'default' : 'secondary'}
                  className="text-xs mb-1"
                >
                  {source.confidence === 'green' ? 'Established' : 
                   source.confidence === 'amber' ? 'Debated' : 'Disputed'}
                </Badge>
                {source.note && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} className="text-amber-600" />
                    <span className="text-xs text-amber-600">Note Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <CardTitle className="text-base font-medium text-foreground">
            {source.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {source.authors} • {source.year || 'Traditional'}
            {source.journal && ` • ${source.journal}`}
            {source.publisher && ` • ${source.publisher}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          {source.note && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-3">
              <div className="text-xs text-amber-800">
                <strong>Interpretive Note:</strong> {source.note}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {source.doi && `DOI: ${source.doi.split('/').pop()}`}
            </div>
            {source.url && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} className="mr-1" />
                  Access
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
          Reading Room: Sources & Methods
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Distinguish rigorous geology from interpretive frameworks. Every claim tracks back to peer-reviewed evidence.
        </p>
      </div>

      <Tabs defaultValue="peer-review" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="peer-review" className="flex items-center gap-2">
            <FileText size={16} />
            Peer-Reviewed ({peerReviewSources.length})
          </TabsTrigger>
          <TabsTrigger value="textual" className="flex items-center gap-2">
            <IconScript size={16} />
            Textual Sources ({textualSources.length})
          </TabsTrigger>
          <TabsTrigger value="interpretive" className="flex items-center gap-2">
            <AlertTriangle size={16} />
            Interpretive ({interpretiveSources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peer-review" className="mt-6">
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm text-green-800">
              <strong>Green Badge Sources:</strong> Peer-reviewed articles in major journals with reproducible methodologies. 
              These form the evidence backbone for geological claims.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {peerReviewSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="textual" className="mt-6">
          <div className="mb-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="text-sm text-indigo-800">
              <strong>Sacred Text Memories:</strong> Vedic, Puranic, and Sangam sources that preserve geographical and geological memories. 
              Quoted in ≤25 word excerpts with precise citations.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textualSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interpretive" className="mt-6">
          <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-sm text-amber-800">
              <strong>Amber Badge Sources:</strong> Popular interpretations and historical theories. 
              Valuable for context but require critical evaluation. Clearly flagged as interpretive.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interpretiveSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};