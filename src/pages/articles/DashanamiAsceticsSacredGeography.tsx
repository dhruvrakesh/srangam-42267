import React, { Suspense } from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { IconOm } from '@/components/icons/IconOm';
import { DataComponentErrorBoundary } from '@/components/articles/DataComponentErrorBoundary';
import { dashanamiAsceticsSacredGeography } from '@/data/articles/dashanami-ascetics-sacred-geography';
import { useLanguage } from '@/components/language/LanguageProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LazyJyotirlingaMap = React.lazy(() => 
  import('@/components/articles/maps/JyotirlingaMap').then(m => ({ default: m.JyotirlingaMap }))
);

const DataComponentLoading = () => (
  <Card className="my-8 bg-muted/20">
    <CardContent className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin mr-2 text-muted-foreground" />
      <span className="text-muted-foreground">Loading visualization...</span>
    </CardContent>
  </Card>
);

export default function DashanamiAsceticsSacredGeography() {
  const { currentLanguage } = useLanguage();
  const content = dashanamiAsceticsSacredGeography.content[currentLanguage] as string;

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
          <Suspense key="jyotirlinga-suspense" fallback={<DataComponentLoading />}>
            <DataComponentErrorBoundary 
              key="jyotirlinga-map" 
              componentName="Sacred Geography Map"
            >
              {typeof window !== 'undefined' && <LazyJyotirlingaMap />}
            </DataComponentErrorBoundary>
          </Suspense>
        ]}
      />
      <NarrationErrorBoundary>
        <div className="fixed bottom-4 right-4 z-50">
          <UniversalNarrator
            content={content}
            contentType="article"
            articleSlug="dashanami-ascetics-sacred-geography"
            variant="floating"
          />
        </div>
      </NarrationErrorBoundary>
    </>
  );
}
