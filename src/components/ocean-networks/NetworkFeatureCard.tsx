import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TagChip } from '@/components/ui/TagChip';
import { Link } from 'react-router-dom';
import oceanNetworksI18n from '@/data/ocean_networks/i18n.json';

interface NetworkFeatureCardProps {
  feature: {
    title: string;
    summary: string;
    readingMinutes?: number;
    tags: string[];
    slug: string;
    status: 'published' | 'draft';
    needs_citation?: boolean;
  };
}

export function NetworkFeatureCard({ feature }: NetworkFeatureCardProps) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{feature.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={feature.status === 'published' ? 'default' : 'secondary'}>
              {feature.status === 'published' ? oceanNetworksI18n.labels.published : 'Draft'}
            </Badge>
            {feature.needs_citation && (
              <Badge variant="outline" className="text-muted-foreground">
                ⚑ {oceanNetworksI18n.labels.needs_citation}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">{feature.summary}</p>
        
        <div className="flex flex-wrap gap-2">
          {feature.tags.map((tag) => {
            const chipData = oceanNetworksI18n.chips.find(c => c.slug === tag);
            return (
              <TagChip key={tag} variant="default" className="text-xs">
                {chipData ? (isHindi ? chipData.hi : chipData.en) : tag}
              </TagChip>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          {feature.readingMinutes && (
            <span className="text-sm text-muted-foreground">
              {feature.readingMinutes} {oceanNetworksI18n.labels.minutes}
            </span>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={feature.slug}>
              {isHindi ? oceanNetworksI18n.labels.read_more_hi : oceanNetworksI18n.labels.read_more_en}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}