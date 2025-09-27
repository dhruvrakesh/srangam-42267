import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OceanicArticlePage } from '@/components/oceanic/OceanicArticlePage';

export const OceanicRouter: React.FC = () => {
  return (
    <Routes>
      <Route path=":slug" element={<OceanicArticlePage />} />
    </Routes>
  );
};

export default OceanicRouter;