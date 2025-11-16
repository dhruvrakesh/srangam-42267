import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { IconOm } from '@/components/icons/IconOm';
import { JyotirlingaMap } from '@/components/articles/enhanced';
import { dashanamiAsceticsSacredGeography } from '@/data/articles/dashanami-ascetics-sacred-geography';
import { useLanguage } from '@/components/language/LanguageProvider';

export default function DashanamiAsceticsSacredGeography() {
  const { currentLanguage } = useLanguage();
  const content = dashanamiAsceticsSacredGeography.content[currentLanguage] as string;

  return (
    <NarrationErrorBoundary>
      <div className="relative">
        <UniversalNarrator
          content={content}
          contentType="article"
          articleSlug="dashanami-ascetics-sacred-geography"
          variant="sticky-bottom"
        />
        <ArticlePage
          title={dashanamiAsceticsSacredGeography.title}
          dek={dashanamiAsceticsSacredGeography.dek}
          content={dashanamiAsceticsSacredGeography.content}
          tags={dashanamiAsceticsSacredGeography.tags}
          icon={IconOm}
          readTime={28}
          author="Śrīraṅgam Research Team"
          date="2024-01-15"
          dataComponents={[<JyotirlingaMap key="jyotirlinga-map" />]}
        />
      </div>
    </NarrationErrorBoundary>
  );
}
