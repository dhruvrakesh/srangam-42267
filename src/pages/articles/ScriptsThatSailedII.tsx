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
  const kandaharEdict = inscriptionRegistry.getById('kandahar-bilingual-edict');
  const kutaiYupa = inscriptionRegistry.getById('kutai-yupa-borneo');
  const voCanhStele = inscriptionRegistry.getById('vo-canh-stele-champa');
  const kedukanBukit = inscriptionRegistry.getById('kedukan-bukit-palembang');

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
      dataComponents={[
        kandaharEdict && <EnhancedInscriptionView key="kandahar" inscription={kandaharEdict} layout="compact" />,
        <EpigraphicAtlasMap key="atlas-map" className="my-12" />,
        <EpigraphicTimeline key="timeline" className="my-12" />,
        kutaiYupa && <EnhancedInscriptionView key="kutai" inscription={kutaiYupa} layout="full" />,
        <PalaeographicComparison key="paleography" className="my-12" />,
        voCanhStele && <EnhancedInscriptionView key="vo-canh" inscription={voCanhStele} layout="full" />,
        kedukanBukit && <EnhancedInscriptionView key="kedukan-bukit" inscription={kedukanBukit} layout="full" />
      ].filter(Boolean)}
    />
  );
}
