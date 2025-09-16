// Main inscription registry and exports
export * from './interfaces';
export * from './registry';

// Re-export individual inscription data
export * from './kandahar/metadata';
export * from './kutai/metadata';

// Component exports
export { ScriptViewer } from '@/components/inscriptions/ScriptViewer';
export { TranslationPanel } from '@/components/inscriptions/TranslationPanel';
export { InscriptionVisualizer } from '@/components/inscriptions/InscriptionVisualizer';
export { ContextualCommentary } from '@/components/inscriptions/ContextualCommentary';