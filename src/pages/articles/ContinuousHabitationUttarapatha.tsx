import React, { Suspense } from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { IconOm } from '@/components/icons/IconOm';
import { DataComponentErrorBoundary } from '@/components/articles/DataComponentErrorBoundary';
import { ContinuousHabitationTimeline } from '@/components/articles/enhanced/ContinuousHabitationTimeline';
import { ArchaeologicalStrataViewer } from '@/components/articles/enhanced/ArchaeologicalStrataViewer';
import { continuousHabitationUttarapatha } from '@/data/articles/continuous-habitation-uttarapatha';
import { useLanguage } from '@/components/language/LanguageProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LazyAncientTradeRoutesMap = React.lazy(() => 
  import('@/components/articles/maps/AncientTradeRoutesMap').then(m => ({ default: m.AncientTradeRoutesMap }))
);

const DataComponentLoading = () => (
  <Card className="my-8 bg-muted/20">
    <CardContent className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin mr-2 text-muted-foreground" />
      <span className="text-muted-foreground">Loading visualization...</span>
    </CardContent>
  </Card>
);

export default function ContinuousHabitationUttarapatha() {
  const { currentLanguage } = useLanguage();
  const content = continuousHabitationUttarapatha.content[currentLanguage] as string;

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
          <Suspense key="trade-routes-suspense" fallback={<DataComponentLoading />}>
            <DataComponentErrorBoundary 
              key="trade-routes-map" 
              componentName="Ancient Trade Routes Map"
            >
              {typeof window !== 'undefined' && <LazyAncientTradeRoutesMap />}
            </DataComponentErrorBoundary>
          </Suspense>,
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
        <div className="fixed bottom-4 right-4 z-50">
          <UniversalNarrator
            content={content}
            contentType="article"
            articleSlug="continuous-habitation-uttarapatha"
            variant="floating"
          />
        </div>
      </NarrationErrorBoundary>
    </>
  );
}
