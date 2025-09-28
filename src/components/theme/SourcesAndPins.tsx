import React, { useState } from 'react';
import { MapPin, Table, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { InteractivePinCards } from '@/components/correlation/InteractivePinCards';
import { QACorrelationTable } from '@/components/correlation/QACorrelationTable';
import { useTranslation } from 'react-i18next';

interface SourcesAndPinsProps {
  pageOrCard: string;
  title?: string;
  description?: string;
  tags?: string[];
  compact?: boolean;
}

export const SourcesAndPins: React.FC<SourcesAndPinsProps> = ({
  pageOrCard,
  title,
  description,
  tags = [],
  compact = false
}) => {
  const { t, i18n } = useTranslation();
  const [showTable, setShowTable] = useState(false);

  const handleAtlasOpen = () => {
    const url = `/atlas?search=${encodeURIComponent(pageOrCard)}&lang=${i18n.language}`;
    window.open(url, '_blank');
  };

  if (compact) {
    return (
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Sources & Pins
            </CardTitle>
            <Badge variant="secondary">{pageOrCard}</Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InteractivePinCards 
              pageOrCard={pageOrCard}
              tags={tags}
              limit={3}
              compact={true}
            />
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAtlasOpen}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Atlas
              </Button>
              <Dialog open={showTable} onOpenChange={setShowTable}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Table className="h-4 w-4 mr-2" />
                    QA Table
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Correlation Quality Assurance</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto">
                    <QACorrelationTable pageFilter={pageOrCard} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          {title || 'Sources & Evidence Pins'}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {description || `Explore geographic locations and archaeological evidence related to ${pageOrCard}. Each pin represents a site with documented historical or archaeological significance.`}
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">{pageOrCard}</Badge>
          {tags.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Pin Cards */}
      <InteractivePinCards 
        pageOrCard={pageOrCard}
        tags={tags}
        limit={6}
        compact={false}
      />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleAtlasOpen} size="lg">
          <MapPin className="h-5 w-5 mr-2" />
          Explore in Interactive Atlas
        </Button>
        
        <Dialog open={showTable} onOpenChange={setShowTable}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              <Table className="h-5 w-5 mr-2" />
              View Correlation Table
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Quality Assurance: {pageOrCard}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              <QACorrelationTable pageFilter={pageOrCard} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Methodology Note */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">Research Methodology</p>
            <p className="text-muted-foreground">
              Each pin represents a location with documented evidence from primary sources and/or archaeological investigations. 
              Our correlation matrix maintains transparency by requiring paired evidence (textual + archaeological) for high-confidence ratings. 
              Approximate locations and medium-confidence entries are clearly marked to maintain academic rigor.
            </p>
            <div className="flex gap-2 pt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">High: Paired Evidence</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium: Single Source</Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">Approximate: Needs Citation</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};