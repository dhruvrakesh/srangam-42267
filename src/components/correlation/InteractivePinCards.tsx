import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, BookOpen, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';

interface PinData {
  id: string;
  title: { [key: string]: string };
  type: string;
  category: string;
  period: { start: number; end: number };
  summary: { [key: string]: string };
  tags: string[];
  sources: string[];
  articleSlug?: string;
  confidence: 'high' | 'medium' | 'approximate';
  approximate?: boolean;
  coordinates: [number, number];
}

interface InteractivePinCardsProps {
  pageOrCard?: string;
  tags?: string[];
  limit?: number;
  compact?: boolean;
  onAtlasOpen?: (pinId: string) => void;
}

const TYPE_COLORS = {
  port: '#3b82f6',
  city: '#8b5cf6', 
  fort: '#ef4444',
  inscription: '#f59e0b',
  coin_hoard: '#10b981',
  waypoint: '#6b7280'
};

export const InteractivePinCards: React.FC<InteractivePinCardsProps> = ({
  pageOrCard,
  tags = [],
  limit = 6,
  compact = false,
  onAtlasOpen
}) => {
  const { t, i18n } = useTranslation();
  const { preferences } = useLanguagePreferences();
  const [pins, setPins] = useState<PinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPins = async () => {
      try {
        const response = await fetch('/atlas/atlas_nodes.json');
        const data = await response.json();
        
        const processedPins: PinData[] = data.features.map((feature: any) => ({
          id: feature.properties.id,
          title: feature.properties.title,
          type: feature.properties.type,
          category: feature.properties.category,
          period: feature.properties.period,
          summary: feature.properties.summary,
          tags: feature.properties.tags,
          sources: feature.properties.sources,
          articleSlug: feature.properties.articleSlug,
          confidence: feature.properties.confidence,
          approximate: feature.properties.approximate,
          coordinates: feature.geometry.coordinates
        }));

        // Filter pins based on props
        let filteredPins = processedPins;
        
        if (pageOrCard) {
          filteredPins = filteredPins.filter(pin => 
            pin.category.toLowerCase().includes(pageOrCard.toLowerCase()) ||
            pin.tags.some(tag => tag.toLowerCase().includes(pageOrCard.toLowerCase()))
          );
        }

        if (tags.length > 0) {
          filteredPins = filteredPins.filter(pin =>
            tags.some(tag => 
              pin.tags.some(pinTag => pinTag.toLowerCase().includes(tag.toLowerCase()))
            )
          );
        }

        // Sort by confidence and limit
        filteredPins.sort((a, b) => {
          const confidenceOrder = { 'high': 3, 'medium': 2, 'approximate': 1 };
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
        });

        setPins(filteredPins.slice(0, limit));
      } catch (error) {
        console.error('Failed to load pin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPins();
  }, [pageOrCard, tags, limit]);

  const formatPeriod = (period: { start: number; end: number }) => {
    const formatYear = (year: number) => {
      if (year < 0) return `${Math.abs(year)} BCE`;
      return `${year} CE`;
    };
    
    if (period.start === period.end) {
      return formatYear(period.start);
    }
    return `${formatYear(period.start)} - ${formatYear(period.end)}`;
  };

  const handleOpenInAtlas = (pin: PinData) => {
    const url = `/atlas?id=${pin.id}&lat=${pin.coordinates[1]}&lon=${pin.coordinates[0]}&lang=${i18n.language}`;
    if (onAtlasOpen) {
      onAtlasOpen(pin.id);
    } else {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No pins found for the specified criteria.</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {pins.map((pin) => {
          const currentLang = preferences.primaryLanguage;
          const title = pin.title[currentLang] || pin.title.en || pin.id;
          const summary = pin.summary[currentLang] || pin.summary.en || '';

          return (
            <Card key={pin.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{title}</h4>
                    {pin.approximate && (
                      <Badge variant="outline" className="text-xs">
                        Approx.
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${TYPE_COLORS[pin.type as keyof typeof TYPE_COLORS]}20`, 
                        color: TYPE_COLORS[pin.type as keyof typeof TYPE_COLORS] 
                      }}
                    >
                      {pin.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatPeriod(pin.period)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {summary.substring(0, 120)}...
                  </p>

                  {pin.sources.length > 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      {pin.sources[0].substring(0, 60)}...
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1 ml-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenInAtlas(pin)}
                    className="h-8 px-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  {pin.articleSlug && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/articles/${pin.articleSlug}`, '_blank')}
                      className="h-8 px-2"
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pins.map((pin) => {
        const currentLang = preferences.primaryLanguage;
        const title = pin.title[currentLang] || pin.title.en || pin.id;
        const summary = pin.summary[currentLang] || pin.summary.en || '';

        return (
          <Card key={pin.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: `${TYPE_COLORS[pin.type as keyof typeof TYPE_COLORS]}20`, 
                        color: TYPE_COLORS[pin.type as keyof typeof TYPE_COLORS] 
                      }}
                    >
                      {pin.type.replace('_', ' ')}
                    </Badge>
                    {pin.approximate && (
                      <Badge variant="outline">Approx.</Badge>
                    )}
                    <Badge 
                      variant={pin.confidence === 'high' ? 'default' : 'secondary'}
                      className={
                        pin.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        pin.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }
                    >
                      {pin.confidence}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatPeriod(pin.period)}</span>
                </div>

                <p className="text-sm line-clamp-3">{summary}</p>

                {pin.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {pin.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {pin.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pin.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {pin.sources.length > 0 && (
                  <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                    {pin.sources[0]}
                    {pin.sources.length > 1 && ` (+${pin.sources.length - 1} more)`}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenInAtlas(pin)}
                    className="flex-1"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Open on Atlas
                  </Button>
                  {pin.articleSlug && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/articles/${pin.articleSlug}`, '_blank')}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};