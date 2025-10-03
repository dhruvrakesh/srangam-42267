import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen, Download, Info } from 'lucide-react';

interface Correlation {
  geologicalEvent: string;
  ageMa: number;
  culturalSources: Array<{
    source: string;
    text: string;
    correlation: string;
    confidence: 'A' | 'B' | 'C' | 'D';
    notes: string;
  }>;
}

interface MatrixData {
  correlations: Correlation[];
  confidenceScale: Record<string, string>;
}

export function CulturalCorrelationMatrix() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<string>('all');

  useEffect(() => {
    fetch('/data/geology/cultural_correlations.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <Card className="my-8">
        <CardContent className="p-12 text-center text-muted-foreground">
          Loading cultural correlation matrix...
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: string) => {
    const colors = {
      'A': 'hsl(var(--chart-1))',
      'B': 'hsl(var(--chart-3))',
      'C': 'hsl(var(--chart-4))',
      'D': 'hsl(var(--destructive))'
    };
    return colors[confidence as keyof typeof colors] || 'hsl(var(--muted))';
  };

  const filteredCorrelations = filterConfidence === 'all'
    ? data.correlations
    : data.correlations.map(corr => ({
        ...corr,
        culturalSources: corr.culturalSources.filter(src => src.confidence === filterConfidence)
      })).filter(corr => corr.culturalSources.length > 0);

  const exportCitations = () => {
    const citations = filteredCorrelations.flatMap(corr => 
      corr.culturalSources.map(src => 
        `${src.source}. ${src.text}. Correlation: ${src.correlation} [Confidence: ${src.confidence}]`
      )
    );
    
    const blob = new Blob([citations.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stone-purana-cultural-correlations.txt';
    a.click();
  };

  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Cultural-Scientific Correlation Matrix
            </CardTitle>
            <CardDescription className="mt-2">
              How geological events map onto India's cultural memory. Hover cells for details.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCitations}>
            <Download className="h-4 w-4 mr-2" />
            Export Citations
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filter controls */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filterConfidence === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterConfidence('all')}
          >
            All Confidence Levels
          </Badge>
          {(['A', 'B', 'C', 'D'] as const).map((conf) => (
            <Badge
              key={conf}
              variant={filterConfidence === conf ? 'default' : 'outline'}
              className="cursor-pointer"
              style={filterConfidence === conf ? { backgroundColor: getConfidenceColor(conf), color: 'white' } : {}}
              onClick={() => setFilterConfidence(conf)}
            >
              {conf} - {conf === 'A' ? 'Direct' : conf === 'B' ? 'Strong' : conf === 'C' ? 'Plausible' : 'Speculative'}
            </Badge>
          ))}
        </div>

        {/* Matrix grid */}
        <div className="space-y-6">
          {filteredCorrelations.map((correlation) => (
            <Card key={correlation.geologicalEvent} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{correlation.geologicalEvent}</span>
                  <Badge variant="secondary">{correlation.ageMa} Ma</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-3">
                  {correlation.culturalSources.map((source, idx) => (
                    <TooltipProvider key={idx}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="p-3 rounded-lg border-l-4 cursor-help hover:bg-muted/50 transition-colors"
                            style={{ borderColor: getConfidenceColor(source.confidence) }}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="font-semibold text-sm">{source.source}</div>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ backgroundColor: getConfidenceColor(source.confidence), color: 'white' }}
                              >
                                {source.confidence}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground italic mb-1">{source.text}</div>
                            <div className="text-sm">{source.correlation}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <div className="space-y-2">
                            <div className="font-semibold text-xs flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Research Notes
                            </div>
                            <p className="text-xs">{source.notes}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Confidence scale explanation */}
        <Card className="bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Understanding Confidence Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              {Object.entries(data.confidenceScale).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3">
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: getConfidenceColor(key), color: 'white' }}
                  >
                    {key}
                  </Badge>
                  <span className="text-muted-foreground flex-1">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-4">
          Note: These correlations represent scholarly interpretations and hypotheses. 
          Lower confidence ratings (C, D) indicate speculative connections requiring further research. 
          Cultural memory operates on vastly different timescales than geological processes.
        </p>
      </CardContent>
    </Card>
  );
}
