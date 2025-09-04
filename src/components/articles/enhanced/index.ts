// Enhanced Article Components
export { InteractiveQuote } from './InteractiveQuote';
export { ExpandableSection } from './ExpandableSection';
export { ContextualSidebar, createHistoricalContext, createGeographicalContext } from './ContextualSidebar';
export { ParagraphWithHighlight, createHighlights, annotations } from './ParagraphWithHighlight';
export { DynamicTimeline, createTimelineEvent } from './DynamicTimeline';

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