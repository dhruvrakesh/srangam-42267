import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OceanicArticlePage } from '@/components/oceanic/OceanicArticlePage';
import Articles from '@/pages/Articles';

export const ArticlesRouter: React.FC = () => {
  return (
    <Routes>
      {/* Articles browse page with unified filtering */}
      <Route path="/" element={<Articles />} />
      
      {/* Individual article pages (both JSON and database) */}
      <Route path=":slug" element={<OceanicArticlePage />} />
    </Routes>
  );
};

export default ArticlesRouter;
