import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { EnhancedInscriptionView } from '@/components/inscriptions/EnhancedInscriptionView';
import { EpigraphicAtlasMap } from '@/components/inscriptions/EpigraphicAtlasMap';
import { PalaeographicComparison } from '@/components/inscriptions/PalaeographicComparison';
import { EpigraphicTimeline } from '@/components/inscriptions/EpigraphicTimeline';
import { inscriptionRegistry } from '@/data/inscriptions/registry';
import { scriptsThatSailedII } from '@/data/articles/scripts-that-sailed-ii';
import { IconScript } from '@/components/icons';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

export default function ScriptsThatSailedII() {
  const contentForNarration = typeof scriptsThatSailedII.content === 'object'
    ? ((scriptsThatSailedII.content as any).en as string || '')
    : scriptsThatSailedII.content as string;

  const inscriptions = {
    kandahar: inscriptionRegistry.getById('kandahar-bilingual-edict'),
    kutai: inscriptionRegistry.getById('kutai-yupa-borneo'),
    voCanh: inscriptionRegistry.getById('vo-canh-stele-champa'),
    kedukanBukit: inscriptionRegistry.getById('kedukan-bukit-palembang')
  };

  // FIX 4: Debug logging to verify registry loading
  if (process.env.NODE_ENV === 'development') {
    console.log('[ScriptsThatSailedII] Registry lookup results:', {
      kandahar: !!inscriptions.kandahar,
      kutai: !!inscriptions.kutai,
      voCanh: !!inscriptions.voCanh,
      kedukanBukit: !!inscriptions.kedukanBukit,
      totalInRegistry: inscriptionRegistry.inscriptions?.length || 0
    });
  }

  // FIX 2: TypeScript type guard for inscription validation
  const isValidInscription = (inscription: any): inscription is typeof inscriptions.kandahar => {
    return inscription !== undefined && inscription !== null;
  };

  const dataComponents: React.ReactNode[] = [];
  
  if (isValidInscription(inscriptions.kandahar)) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="kandahar" 
        inscription={inscriptions.kandahar} 
        layout="compact" 
      />
    );
  }
  
  dataComponents.push(
    <ErrorBoundary 
      key="atlas-map" 
      fallback={
        <div className="my-12 p-8 border border-border rounded-lg text-center bg-muted/30">
          <p className="text-muted-foreground">Map temporarily unavailable</p>
          <p className="text-xs text-muted-foreground mt-2">Please refresh to try again</p>
        </div>
      }
    >
      <EpigraphicAtlasMap className="my-12" />
    </ErrorBoundary>
  );
  dataComponents.push(<EpigraphicTimeline key="timeline" className="my-12" />);
  
  if (isValidInscription(inscriptions.kutai)) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="kutai" 
        inscription={inscriptions.kutai} 
        layout="full" 
      />
    );
  }
  
  dataComponents.push(<PalaeographicComparison key="paleography" className="my-12" />);
  
  if (isValidInscription(inscriptions.voCanh)) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="vo-canh" 
        inscription={inscriptions.voCanh} 
        layout="full" 
      />
    );
  }
  
  if (isValidInscription(inscriptions.kedukanBukit)) {
    dataComponents.push(
      <EnhancedInscriptionView 
        key="kedukan-bukit" 
        inscription={inscriptions.kedukanBukit} 
        layout="full" 
      />
    );
  }

  return (
    <>
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
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}
