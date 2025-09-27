import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OceanicArticlePage } from '@/components/oceanic/OceanicArticlePage';
import { OceanicIndex } from '@/components/oceanic/OceanicIndex';

export const OceanicRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<OceanicIndex />} />
      <Route path=":slug" element={<OceanicArticlePage />} />
    </Routes>
  );
};

export default OceanicRouter;