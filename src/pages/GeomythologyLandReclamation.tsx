import React from 'react';
import { Mountain } from 'lucide-react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '@/data/articles';
import { ParashuramaCoastMap } from '@/components/articles/geology/ParashuramaCoastMap';
import { KashmirLakeTimeline } from '@/components/articles/geology/KashmirLakeTimeline';
import { FossilWorshipSitesMap } from '@/components/articles/geology/FossilWorshipSitesMap';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { useLanguage } from '@/components/language/LanguageProvider';

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
          <ParashuramaCoastMap key="parashurama-map" />,
          <KashmirLakeTimeline key="kashmir-timeline" />,
          <FossilWorshipSitesMap key="fossil-sites-map" />
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
