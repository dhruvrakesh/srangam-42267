import React from 'react';
import { cn } from '@/lib/utils';
import { InscriptionShastra } from '@/data/inscriptions/interfaces';
import { ScriptViewer } from './ScriptViewer';
import { TranslationPanel } from './TranslationPanel';
import { InscriptionVisualizer } from './InscriptionVisualizer';
import { ContextualCommentary } from './ContextualCommentary';

interface EnhancedInscriptionViewProps {
  inscription: InscriptionShastra;
  layout?: 'full' | 'compact' | 'visualization-only';
  showComponents?: ('script-viewer' | 'translation-panel' | 'visualization' | 'commentary')[];
  className?: string;
}

export const EnhancedInscriptionView = React.memo(({ 
  inscription, 
  layout = 'full',
  showComponents = ['script-viewer', 'translation-panel', 'visualization', 'commentary'],
  className 
}: EnhancedInscriptionViewProps) => {
  // FIX 1: Defensive null check
  if (!inscription) {
    console.warn('EnhancedInscriptionView: inscription is undefined');
    return null;
  }

  const { scripts, translations, culturalContext, visualComponents } = inscription;

  // Get visualization config if available
  const visualizationConfig = visualComponents.find(comp => 
    comp.type === 'pillar-visualization' || comp.type === 'script-viewer'
  );

  const renderVisualization = () => {
    if (!showComponents.includes('visualization')) return null;
    
    if (visualizationConfig?.type === 'pillar-visualization') {
      return (
        <InscriptionVisualizer 
          type="pillar"
          title={`The ${inscription.id.includes('kutai') ? 'Seven' : ''} ${inscription.title.includes('Yūpa') ? 'Yūpa Pillars' : 'Inscription'}`}
          {...visualizationConfig.props}
          className="mb-8"
        />
      );
    }
    
    // Default stone visualization for other types
    return (
      <InscriptionVisualizer 
        type="stone"
        count={1}
        title={inscription.title}
        metadata={{
          ritualContext: [culturalContext.ritualSignificance || 'Ancient inscription'],
          scriptFeatures: scripts.map(script => `${script.scriptType}${script.subType ? ` (${script.subType})` : ''}`),
          location: `${inscription.location.ancient}, ${inscription.location.modern}`,
          dating: inscription.period.dating.approximate
        }}
        className="mb-8"
      />
    );
  };

  const renderScriptViewer = () => {
    if (!showComponents.includes('script-viewer') || !scripts.length) return null;
    
    return (
      <ScriptViewer 
        scripts={scripts}
        title="Inscription Texts"
        layout={scripts.length > 1 ? 'side-by-side' : 'stacked'}
        showTransliteration={true}
        interactive={true}
        className="mb-8"
      />
    );
  };

  const renderTranslationPanel = () => {
    if (!showComponents.includes('translation-panel')) return null;
    
    return (
      <TranslationPanel 
        translations={translations}
        title="Translation & Analysis"
        showAllTypes={layout === 'full'}
        defaultType="contextual"
        className="mb-8"
      />
    );
  };

  const renderCommentary = () => {
    if (!showComponents.includes('commentary')) return null;
    
    return (
      <ContextualCommentary 
        context={culturalContext}
        title="Cultural & Historical Context"
        expandable={layout !== 'compact'}
        defaultExpanded={layout === 'full'}
        position="inline"
        className="mb-8"
      />
    );
  };

  if (layout === 'visualization-only') {
    return (
      <div className={cn('space-y-6', className)}>
        {renderVisualization()}
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {renderVisualization()}
        {renderScriptViewer()}
        {renderTranslationPanel()}
      </div>
    );
  }

  // Full layout
  return (
    <div className={cn('space-y-8', className)}>
      {renderVisualization()}
      {renderScriptViewer()}
      {renderTranslationPanel()}
      {renderCommentary()}
    </div>
  );
});

EnhancedInscriptionView.displayName = 'EnhancedInscriptionView';

// Utility function to create inscription components for articles
export const createInscriptionComponent = (
  inscriptionId: string, 
  options?: Partial<EnhancedInscriptionViewProps>
) => {
  return function InscriptionComponent() {
    // This would typically fetch from the registry
    // For now, return a placeholder that could be filled by the registry
    return (
      <div className="p-6 bg-muted/30 rounded-lg">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
          Inscription: {inscriptionId}
        </h3>
        <p className="text-muted-foreground">
          This component will render the inscription data when connected to the registry.
        </p>
      </div>
    );
  };
};