import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconScript, IconLotus, IconMonsoon } from '@/components/icons';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { MapPin, Book, Calendar, FileText } from 'lucide-react';

interface SourceEntry {
  id: string;
  work: string;
  snippet_en: string;
  original_lang: string;
  theme: string;
  place: string;
  lat?: number;
  lon?: number;
  period: string;
  source_type: string;
  citation_hint: string;
  tags: string;
}

interface SourcebookProps {
  sources: SourceEntry[];
  onPinClick?: (lat: number, lon: number, entry: SourceEntry) => void;
}

export function Sourcebook({ sources, onPinClick }: SourcebookProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const themes = useMemo(() => {
    const themeSet = new Set(sources.map(s => s.theme));
    return ['all', ...Array.from(themeSet)];
  }, [sources]);

  const periods = useMemo(() => {
    const periodSet = new Set(sources.map(s => s.period));
    return ['all', ...Array.from(periodSet)];
  }, [sources]);

  const filteredSources = useMemo(() => {
    return sources.filter(source => {
      const themeMatch = selectedTheme === 'all' || source.theme === selectedTheme;
      const periodMatch = selectedPeriod === 'all' || source.period === selectedPeriod;
      return themeMatch && periodMatch;
    });
  }, [sources, selectedTheme, selectedPeriod]);

  const getSourceIcon = (sourceType: string) => {
    if (sourceType.includes('Vedic')) return <IconLotus size={20} className="text-lotus-pink" />;
    if (sourceType.includes('inscription')) return <IconScript size={20} className="text-ocean" />;
    if (sourceType.includes('poem') || sourceType.includes('epic')) return <Book className="text-peacock-blue" size={20} />;
    return <FileText className="text-charcoal" size={20} />;
  };

  const getConfidenceBadge = (entry: SourceEntry) => {
    if (entry.place.includes('approx') || entry.place.includes('near')) {
      return <Badge variant="outline" className="text-xs">Approx.</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <IconScript size={32} className="text-ocean" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            <CulturalTermTooltip term="grantha">
              Sources & Testimonia
            </CulturalTermTooltip>
          </h2>
          <IconMonsoon size={32} className="text-peacock-blue" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Primary sources from Vedic hymns to stone inscriptions, mapping the cultural geography 
          of monsoon-bound <CulturalTermTooltip term="samudra">maritime networks</CulturalTermTooltip>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Theme:</span>
          {themes.map(theme => (
            <Button
              key={theme}
              variant={selectedTheme === theme ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTheme(theme)}
              className="capitalize"
            >
              {theme === 'all' ? 'All' : theme.replace(/&amp;/g, '&')}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Period:</span>
          {periods.slice(0, 4).map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="text-xs"
            >
              {period === 'all' ? 'All' : period.split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((entry) => (
          <Card key={entry.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getSourceIcon(entry.source_type)}
                  <div>
                    <CardTitle className="text-base font-serif text-foreground">
                      {entry.work}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {entry.original_lang} • {entry.period.split(' ')[0]}
                    </CardDescription>
                  </div>
                </div>
                {getConfidenceBadge(entry)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <blockquote className="text-sm text-foreground/90 italic border-l-2 border-primary/30 pl-3 leading-relaxed">
                "{entry.snippet_en}"
              </blockquote>
              
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {entry.theme}
                </Badge>
                
                {entry.lat && entry.lon && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPinClick?.(entry.lat!, entry.lon!, entry)}
                    className="w-full justify-start text-xs text-muted-foreground hover:text-primary"
                  >
                    <MapPin size={14} className="mr-1" />
                    {entry.place}
                  </Button>
                )}
                
                <div className="text-xs text-muted-foreground">
                  <strong>Source:</strong> {entry.citation_hint}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {entry.tags.split(',').map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sources match the selected filters.</p>
        </div>
      )}
    </div>
  );
}