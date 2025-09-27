import React from 'react';
import { getNodeDetails } from '@/data/empiresExchangeTimeline';

interface TimelineNodeDetailsProps {
  nodeId: string;
}

export const TimelineNodeDetails: React.FC<TimelineNodeDetailsProps> = ({ nodeId }) => {
  const details = getNodeDetails(nodeId);
  
  if (!details) return null;
  
  return (
    <div className="space-y-3">
      <div>
        <h5 className="font-semibold text-sm text-foreground mb-2">Waterways & Geography</h5>
        <p className="text-sm text-muted-foreground">{details.waterways}</p>
      </div>
      <div>
        <h5 className="font-semibold text-sm text-foreground mb-2">Primary Sources</h5>
        <p className="text-sm text-muted-foreground">{details.primarySources}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {details.tags.map(tag => (
          <span key={tag} className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};