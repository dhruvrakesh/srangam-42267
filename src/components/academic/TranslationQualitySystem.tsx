import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';
import { TranslationMetadata, SupportedLanguage } from '@/types/multilingual';

interface TranslationQualitySystemProps {
  metadata: Partial<Record<SupportedLanguage, TranslationMetadata>>;
  currentLanguage: SupportedLanguage;
}

export const TranslationQualitySystem: React.FC<TranslationQualitySystemProps> = ({
  metadata,
  currentLanguage
}) => {
  const currentMeta = metadata[currentLanguage];
  
  if (!currentMeta || currentLanguage === 'en') return null;

  const getQualityColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLevel = (confidence: number) => {
    if (confidence >= 95) return 'Excellent';
    if (confidence >= 85) return 'Good';
    if (confidence >= 70) return 'Fair';
    return 'Needs Review';
  };

  const getQualityIcon = (confidence: number) => {
    if (confidence >= 95) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (confidence >= 85) return <Star className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card className="mt-6 border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getQualityIcon(currentMeta.confidence || 0)}
          Translation Quality Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quality Score</span>
            <span className={`text-sm font-medium ${getQualityColor(currentMeta.confidence || 0)}`}>
              {getQualityLevel(currentMeta.confidence || 0)} ({currentMeta.confidence || 0}%)
            </span>
          </div>
          <Progress value={currentMeta.confidence || 0} className="h-2" />
        </div>

        {/* Translation Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {currentMeta.translatedBy && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Translated by</div>
                <div className="font-medium">{currentMeta.translatedBy}</div>
              </div>
            </div>
          )}
          
          {currentMeta.reviewedBy && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Reviewed by</div>
                <div className="font-medium">{currentMeta.reviewedBy}</div>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        {currentMeta.lastUpdated && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last updated: {currentMeta.lastUpdated}</span>
          </div>
        )}

        {/* Cultural Notes */}
        {currentMeta.culturalNotes && currentMeta.culturalNotes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Cultural Context Notes</div>
            <div className="space-y-1">
              {currentMeta.culturalNotes.map((note, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Improve Translation Button */}
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            Suggest Improvement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationQualitySystem;