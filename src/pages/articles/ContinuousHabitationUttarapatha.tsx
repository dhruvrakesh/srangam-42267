import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IconOm } from '@/components/icons/IconOm';
import { DataComponentErrorBoundary } from '@/components/articles/DataComponentErrorBoundary';
import { AncientTradeRoutesMap } from '@/components/articles/maps/AncientTradeRoutesMap';
import { ContinuousHabitationTimeline } from '@/components/articles/enhanced/ContinuousHabitationTimeline';
import { ArchaeologicalStrataViewer } from '@/components/articles/enhanced/ArchaeologicalStrataViewer';
import { continuousHabitationUttarapatha } from '@/data/articles/continuous-habitation-uttarapatha';
import { useLanguage } from '@/components/language/LanguageProvider';

export default function ContinuousHabitationUttarapatha() {
  const { currentLanguage } = useLanguage();
  
  const contentForNarration = typeof continuousHabitationUttarapatha.content === 'object'
    ? ((continuousHabitationUttarapatha.content as any)[currentLanguage] as string || '')
    : continuousHabitationUttarapatha.content as string;

  return (
    <>
      <ArticlePage
        title={continuousHabitationUttarapatha.title}
        dek={continuousHabitationUttarapatha.dek}
        content={continuousHabitationUttarapatha.content}
        tags={continuousHabitationUttarapatha.tags}
        icon={IconOm}
        readTime={35}
        author="Śrīraṅgam Research Team"
        date="2024-01-16"
        dataComponents={[
          <ErrorBoundary 
            key="trade-routes-map"
            fallback={
              <div className="my-12 p-8 border border-border rounded-lg text-center bg-muted/30">
                <p className="text-muted-foreground">Map temporarily unavailable</p>
                <p className="text-xs text-muted-foreground mt-2">Please refresh to try again</p>
              </div>
            }
          >
            <AncientTradeRoutesMap />
          </ErrorBoundary>,
          <DataComponentErrorBoundary 
            key="habitation-timeline" 
            componentName="Continuous Habitation Timeline"
          >
            <ContinuousHabitationTimeline />
          </DataComponentErrorBoundary>,
          <DataComponentErrorBoundary 
            key="archaeological-strata" 
            componentName="Archaeological Strata Viewer"
          >
            <ArchaeologicalStrataViewer />
          </DataComponentErrorBoundary>
        ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="continuous-habitation-uttarapatha"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}
