import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { EnhancedInscriptionView } from '@/components/inscriptions/EnhancedInscriptionView';
import { EpigraphicAtlasMap } from '@/components/inscriptions/EpigraphicAtlasMap';
import { PalaeographicComparison } from '@/components/inscriptions/PalaeographicComparison';
import { EpigraphicTimeline } from '@/components/inscriptions/EpigraphicTimeline';
import { inscriptionRegistry } from '@/data/inscriptions/registry';
import { scriptsThatSailedII } from '@/data/articles/scripts-that-sailed-ii';
import { IconScript } from '@/components/icons';

export default function ScriptsThatSailedII() {
  const inscriptions = {
    kandahar: inscriptionRegistry.getById('kandahar-bilingual-edict'),
    kutai: inscriptionRegistry.getById('kutai-yupa-borneo'),
    voCanh: inscriptionRegistry.getById('vo-canh-stele-champa'),
    kedukanBukit: inscriptionRegistry.getById('kedukan-bukit-palembang')
  };

  const dataComponents: React.ReactNode[] = [];
  
  if (inscriptions.kandahar) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="kandahar" 
        inscription={inscriptions.kandahar} 
        layout="compact" 
      />
    );
  }
  
  dataComponents.push(<EpigraphicAtlasMap key="atlas-map" className="my-12" />);
  dataComponents.push(<EpigraphicTimeline key="timeline" className="my-12" />);
  
  if (inscriptions.kutai) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="kutai" 
        inscription={inscriptions.kutai} 
        layout="full" 
      />
    );
  }
  
  dataComponents.push(<PalaeographicComparison key="paleography" className="my-12" />);
  
  if (inscriptions.voCanh) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="vo-canh" 
        inscription={inscriptions.voCanh} 
        layout="full" 
      />
    );
  }
  
  if (inscriptions.kedukanBukit) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="kedukan-bukit" 
        inscription={inscriptions.kedukanBukit} 
        layout="full" 
      />
    );
  }

  return (
    <ArticlePage
      title={scriptsThatSailedII.title}
      dek={scriptsThatSailedII.dek}
      content={scriptsThatSailedII.content}
      tags={scriptsThatSailedII.tags}
      icon={IconScript}
      readTime={45}
      author="Kanika Rakesh"
      date="2025-10-04"
      dataComponents={dataComponents}
    />
  );
}
