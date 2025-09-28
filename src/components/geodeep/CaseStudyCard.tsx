import { CaseStudy } from '@/lib/geodeep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconEdict, IconBasalt } from '@/components/icons';
import { BookOpen, ScrollText, Mountain } from 'lucide-react';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onOpenDetails: (slug: string) => void;
}

const getStudyIcon = (slug: string) => {
  switch (slug) {
    case 'gondwana-himalaya': return Mountain;
    case 'sutlej-sarasvati': return ScrollText;
    case 'satisar-kashmir': return IconBasalt;
    case 'earth-sea-sangam': return IconEdict;
    default: return BookOpen;
  }
};

const getConfidenceColor = (claims: any[]) => {
  const greenCount = claims.filter(c => c.confidence === 'green').length;
  const totalCount = claims.length;
  const ratio = greenCount / totalCount;
  
  if (ratio >= 0.8) return 'text-green-600';
  if (ratio >= 0.5) return 'text-amber-600';
  return 'text-red-600';
};

export const CaseStudyCard = ({ caseStudy, onOpenDetails }: CaseStudyCardProps) => {
  const StudyIcon = getStudyIcon(caseStudy.slug);
  const hasTextMemories = caseStudy.texts.length > 0;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-laterite/30 bg-gradient-to-br from-background to-background/95">
      <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-laterite/10 border border-laterite/20">
                <StudyIcon size={24} className="text-laterite" />
              </div>
            <div>
              <Badge variant="outline" className="text-xs mb-2">
                {caseStudy.claims.length} Claims
              </Badge>
              {hasTextMemories && (
                <Badge variant="secondary" className="text-xs mb-2 ml-2">
                  Sanskrit Source
                </Badge>
              )}
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${getConfidenceColor(caseStudy.claims)}`} />
        </div>
        
        <CardTitle className="text-lg font-serif text-foreground group-hover:text-laterite transition-colors">
          {caseStudy.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {caseStudy.summary}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Text memory preview */}
        {hasTextMemories && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-dharma/5 border border-indigo-dharma/20">
            <div className="text-xs text-indigo-dharma/70 mb-1">
              {caseStudy.texts[0].tradition}
            </div>
            <div className="font-sanskrit text-sm text-indigo-dharma mb-1">
              {caseStudy.texts[0].excerpt}
            </div>
            <div className="text-xs text-muted-foreground italic">
              "{caseStudy.texts[0].reference}"
            </div>
          </div>
        )}
        
        {/* Evidence indicators */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {caseStudy.claims.slice(0, 3).map((claim, idx) => (
              <div key={idx} 
                   className={`w-2 h-2 rounded-full ${
                     claim.confidence === 'green' ? 'bg-green-500' :
                     claim.confidence === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                   }`} />
            ))}
            {caseStudy.claims.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{caseStudy.claims.length - 3}
              </span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenDetails(caseStudy.slug)}
            className="text-laterite hover:text-laterite hover:bg-laterite/10"
          >
            Explore Evidence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};