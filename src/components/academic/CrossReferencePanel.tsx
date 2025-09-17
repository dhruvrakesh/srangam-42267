import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Network, 
  MapPin, 
  Calendar, 
  FileText, 
  Tag, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { InscriptionShastra } from '@/data/inscriptions/interfaces';
import { generateCrossReferences } from '@/lib/academicCitation';

interface CrossReferencePanelProps {
  inscription: InscriptionShastra;
  allInscriptions: InscriptionShastra[];
  onNavigate?: (inscriptionId: string) => void;
  className?: string;
}

export const CrossReferencePanel: React.FC<CrossReferencePanelProps> = ({
  inscription,
  allInscriptions,
  onNavigate,
  className = ''
}) => {
  const crossReferences = useMemo(() => 
    generateCrossReferences(inscription, allInscriptions), 
    [inscription, allInscriptions]
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Same Period':
        return <Calendar className="w-4 h-4" />;
      case 'Same Region':
        return <MapPin className="w-4 h-4" />;
      case 'Same Script Type':
        return <FileText className="w-4 h-4" />;
      case 'Related Tags':
        return <Tag className="w-4 h-4" />;
      case 'Explicit References':
        return <Network className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Same Period':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'Same Region':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'Same Script Type':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'Related Tags':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'Explicit References':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const renderInscriptionCard = (relatedInscription: InscriptionShastra) => (
    <div
      key={relatedInscription.id}
      className="p-3 border border-border rounded-lg bg-background hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => onNavigate?.(relatedInscription.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">
            {relatedInscription.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {relatedInscription.location.ancient}, {relatedInscription.location.region}
          </p>
          <p className="text-xs text-muted-foreground">
            {relatedInscription.period.dynasty} • {relatedInscription.period.century}
          </p>
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      </div>
      
      <div className="flex flex-wrap gap-1 mt-2">
        {relatedInscription.scripts.map((script, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {script.scriptType}
          </Badge>
        ))}
      </div>
    </div>
  );

  const totalReferences = Object.values(crossReferences).reduce(
    (sum, refs) => sum + refs.length, 0
  );

  if (totalReferences === 0) {
    return (
      <Card className={`border-dharma/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="w-5 h-5 text-saffron" />
            Cross-References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No cross-references found</p>
            <p className="text-xs">This inscription appears to be unique in the current collection</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-dharma/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="w-5 h-5 text-saffron" />
          Cross-References
          <Badge variant="secondary" className="ml-2">
            {totalReferences} found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reference Network Overview */}
        <div className="p-4 bg-gradient-to-r from-saffron/5 to-dharma/5 rounded-lg border border-saffron/10">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Network className="w-4 h-4 text-saffron" />
            Research Network Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Total Connections:</span>
              <span className="font-semibold ml-2">{totalReferences}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reference Types:</span>
              <span className="font-semibold ml-2">{Object.keys(crossReferences).length}</span>
            </div>
          </div>
        </div>

        {/* Reference Categories */}
        {Object.entries(crossReferences).map(([category, references], categoryIndex) => (
          <div key={category} className="space-y-3">
            {categoryIndex > 0 && <Separator />}
            
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
              </div>
              <h4 className="font-medium text-sm">{category}</h4>
              <Badge variant="outline" className="text-xs">
                {references.length}
              </Badge>
            </div>
            
            <div className="space-y-2 pl-8">
              {references.map(ref => renderInscriptionCard(ref))}
            </div>
          </div>
        ))}

        {/* Research Recommendations */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-medium text-sm mb-3 text-saffron">
            Research Recommendations
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            {crossReferences['Same Period'] && (
              <p>• Compare dating methods and historical contexts with contemporary inscriptions</p>
            )}
            {crossReferences['Same Region'] && (
              <p>• Analyze regional variations in scripts, languages, and cultural practices</p>
            )}
            {crossReferences['Same Script Type'] && (
              <p>• Study paleographic evolution and scribal traditions across time periods</p>
            )}
            {crossReferences['Related Tags'] && (
              <p>• Explore thematic connections and shared cultural motifs</p>
            )}
            {crossReferences['Explicit References'] && (
              <p>• Investigate direct historical connections and narrative continuities</p>
            )}
          </div>
        </div>

        {/* Academic Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline">
            <FileText className="w-4 h-4 mr-1" />
            Generate Report
          </Button>
          <Button size="sm" variant="outline">
            <ExternalLink className="w-4 h-4 mr-1" />
            Export Network
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossReferencePanel;