import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OceanicArticlePage } from '@/components/oceanic/OceanicArticlePage';
import Articles from '@/pages/Articles';

export const ArticlesRouter: React.FC = () => {
  return (
    <Routes>
      {/* Articles browse page with unified filtering */}
      <Route path="/" element={<Articles />} />
      
      {/* SEO-GSC-2026-10-22: the three duplicates retired by consolidate_03_merge_duplicates.sql (2026-09-06,
          srangam_article_merges) render "Article not found" at HTTP 200 - Search Console reads that as a soft 404
          (shiva-bunjil-altair-connections). Send each to the article it duplicated. Static segments outrank :slug. */}
      <Route path="shiva-bunjil-altair-connections" element={<Navigate to="/articles/celestial-bridge-shaivism-bunjil" replace />} />
      <Route path="vishnu-shiva-hari-hara" element={<Navigate to="/articles/har-har-hari-hari" replace />} />
      <Route path="deep-dive-indoiranian-origins" element={<Navigate to="/articles/asura-exiles-mitanni" replace />} />

      {/* Individual article pages (both JSON and database) */}
      <Route path=":slug" element={<OceanicArticlePage />} />
    </Routes>
  );
};

export default ArticlesRouter;
