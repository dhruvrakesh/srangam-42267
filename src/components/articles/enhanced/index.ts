// Enhanced Article Components
export { InteractiveQuote } from './InteractiveQuote';
export { ExpandableSection } from './ExpandableSection';
export { ContextualSidebar, createHistoricalContext, createGeographicalContext } from './ContextualSidebar';
export { ParagraphWithHighlight, createHighlights, annotations } from './ParagraphWithHighlight';
export { DynamicTimeline, createTimelineEvent } from './DynamicTimeline';
export { ImprovedTextFormatting } from './ImprovedTextFormatting';
export { ProfessionalTextFormatter } from './ProfessionalTextFormatter';

// New Enhanced Layout Components
export { EnhancedTimeline, jambudvipaTimelineData } from './EnhancedTimeline';
export { ArchaeologicalChart } from './ArchaeologicalChart';
export { InteractiveTextualSources } from './InteractiveTextualSources';
export { StickyTableOfContents, extractTableOfContents } from './StickyTableOfContents';
export { ImprovedInteractiveChart, archaeologicalSitesData } from './ImprovedInteractiveChart';
export { ContinuousHabitationTimeline } from './ContinuousHabitationTimeline';
export { ArchaeologicalStrataViewer } from './ArchaeologicalStrataViewer';

// Maps
export { JyotirlingaMap } from '../maps/JyotirlingaMap';
export { AncientTradeRoutesMap } from '../maps/AncientTradeRoutesMap';
export { AcousticSiteMap } from '../maps/AcousticSiteMap';
export { PrabhasaMandalaMap } from '../maps/PrabhasaMandalaMap';
export { JyotirlingaComprehensiveMap } from '../maps/JyotirlingaComprehensiveMap';

// Diagrams
export { VedicMeterDiagram } from '../diagrams/VedicMeterDiagram';

// Component composition utilities
export const createArticleSection = (title: string, content: React.ReactNode, options?: {
  expandable?: boolean;
  sidebar?: React.ReactNode;
  annotation?: React.ReactNode;
}) => ({
  title,
  content,
  ...options
});