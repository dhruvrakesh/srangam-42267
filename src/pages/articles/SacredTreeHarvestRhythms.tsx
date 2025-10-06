import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { sacredTreeHarvestRhythms } from '@/data/articles/sacred-tree-harvest-rhythms';
import { IconLotus } from '@/components/icons';
import { FestivalCalendar } from '@/components/articles/FestivalCalendar';
import { SacredTreeMap } from '@/components/articles/SacredTreeMap';
import { SacredTreeSpeciesGallery } from '@/components/articles/SacredTreeSpeciesGallery';
import { HarvestRhythmsTimeline } from '@/components/articles/HarvestRhythmsTimeline';
import { MegalithAndGroveViewer } from '@/components/articles/MegalithAndGroveViewer';
import { TreeRiteEcologyMatrix } from '@/components/articles/TreeRiteEcologyMatrix';

export default function SacredTreeHarvestRhythms() {
  return (
    <ArticlePage
      title={sacredTreeHarvestRhythms.title}
      dek={sacredTreeHarvestRhythms.dek}
      content={sacredTreeHarvestRhythms.content}
      tags={sacredTreeHarvestRhythms.tags}
      icon={IconLotus}
      readTime={26}
      author="Nartiang Foundation Research Team"
      date="2025-10-06"
      dataComponents={[
        <SacredTreeMap key="map" />,
        <HarvestRhythmsTimeline key="timeline" />,
        <TreeRiteEcologyMatrix key="matrix" />,
        <SacredTreeSpeciesGallery key="species" />,
        <MegalithAndGroveViewer key="megaliths" />,
        <FestivalCalendar key="festival" />
      ]}
    />
  );
}
