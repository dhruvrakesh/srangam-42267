import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OceanicArticlePage } from '@/components/oceanic/OceanicArticlePage';
import { OceanicIndex } from '@/components/oceanic/OceanicIndex';
import { SomnathaPrabhasaItihasa } from '@/pages/articles/SomnathaPrabhasaItihasa';
import { RingingRocksRhythmicCosmology } from '@/pages/articles/RingingRocksRhythmicCosmology';

export const OceanicRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<OceanicIndex />} />
      <Route path="somnatha-prabhasa-itihasa" element={<SomnathaPrabhasaItihasa />} />
      <Route path="ringing-rocks-rhythmic-cosmology" element={<RingingRocksRhythmicCosmology />} />
      <Route path=":slug" element={<OceanicArticlePage />} />
    </Routes>
  );
};

export default OceanicRouter;