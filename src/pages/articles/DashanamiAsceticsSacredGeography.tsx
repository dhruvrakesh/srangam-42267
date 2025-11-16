import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IconOm } from '@/components/icons/IconOm';
import { JyotirlingaMap } from '@/components/articles/maps/JyotirlingaMap';
import { dashanamiAsceticsSacredGeography } from '@/data/articles/dashanami-ascetics-sacred-geography';
import { useLanguage } from '@/components/language/LanguageProvider';

export default function DashanamiAsceticsSacredGeography() {
  const { currentLanguage } = useLanguage();
  
  const contentForNarration = typeof dashanamiAsceticsSacredGeography.content === 'object'
    ? ((dashanamiAsceticsSacredGeography.content as any)[currentLanguage] as string || '')
    : dashanamiAsceticsSacredGeography.content as string;

  return (
    <>
      <ArticlePage
        title={dashanamiAsceticsSacredGeography.title}
        dek={dashanamiAsceticsSacredGeography.dek}
        content={dashanamiAsceticsSacredGeography.content}
        tags={dashanamiAsceticsSacredGeography.tags}
        icon={IconOm}
        readTime={28}
        author="Śrīraṅgam Research Team"
        date="2024-01-15"
        dataComponents={[
          <ErrorBoundary 
            key="jyotirlinga-map"
            fallback={
              <div className="my-12 p-8 border border-border rounded-lg text-center bg-muted/30">
                <p className="text-muted-foreground">Map temporarily unavailable</p>
                <p className="text-xs text-muted-foreground mt-2">Please refresh to try again</p>
              </div>
            }
          >
            <JyotirlingaMap />
          </ErrorBoundary>
        ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="dashanami-ascetics-sacred-geography"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}
