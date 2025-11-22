import React, { Suspense } from 'react';
import { Mountain, Loader2 } from 'lucide-react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '@/data/articles';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { useLanguage } from '@/components/language/LanguageProvider';
import { VisualizationErrorBoundary } from '@/components/geology/VisualizationErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load visualizations to prevent SSR issues with D3
const KashmirLakeTimeline = React.lazy(() =>
  import('@/components/articles/geology/KashmirLakeTimeline').then(m => ({ default: m.KashmirLakeTimeline }))
);

// Import React-only components directly (no Leaflet dependencies)
import { ParashuramaCoastalTimeline } from '@/components/articles/geology/ParashuramaCoastalTimeline';
import { FossilWorshipSitesGrid } from '@/components/articles/geology/FossilWorshipSitesGrid';

// Loading fallback component
const VisualizationLoading = () => (
  <Card className="my-8 bg-muted/20">
    <CardContent className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin mr-2 text-muted-foreground" />
      <span className="text-muted-foreground">Loading visualization...</span>
    </CardContent>
  </Card>
);

export default function GeomythologyLandReclamation() {
  const { currentLanguage } = useLanguage();
  
  const article = MULTILINGUAL_ARTICLES.find(a => a.id === 'geomythology-land-reclamation');
  const metadata = ARTICLE_METADATA['geomythology-land-reclamation'];
  
  if (!article) {
    return <div>Article not found</div>;
  }

  const getLocalizedString = (field: any): string => {
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field !== null) {
      return (field[currentLanguage] as string) || (field.en as string) || '';
    }
    return '';
  };

  const title = getLocalizedString(article.title);
  const dek = getLocalizedString(article.dek);
  const content = getLocalizedString(article.content);
  const tags = article.tags.map(tag => getLocalizedString(tag));

  return (
    <>
      <ArticlePage
        title={title}
        dek={dek}
        content={content}
        tags={tags}
        icon={Mountain as React.ComponentType<{ className?: string; size?: number }>}
        readTime={metadata.readTime}
        author={metadata.author}
        date={metadata.date}
        dataComponents={[
          <VisualizationErrorBoundary key="parashurama" visualizationName="Paraśurāma Coastal Timeline">
            <ParashuramaCoastalTimeline />
          </VisualizationErrorBoundary>,
          <Suspense key="kashmir-suspense" fallback={<VisualizationLoading />}>
            <VisualizationErrorBoundary visualizationName="Kashmir Lake Timeline">
              {typeof window !== 'undefined' && <KashmirLakeTimeline />}
            </VisualizationErrorBoundary>
          </Suspense>,
          <VisualizationErrorBoundary key="fossil" visualizationName="Fossil Worship Sites">
            <FossilWorshipSitesGrid />
          </VisualizationErrorBoundary>
        ]}
      />

      <NarrationErrorBoundary>
        <UniversalNarrator
          content={content}
          contentType="article"
          articleSlug="geomythology-land-reclamation"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}
