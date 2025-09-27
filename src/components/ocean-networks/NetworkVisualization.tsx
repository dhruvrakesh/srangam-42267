import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import graphData from '@/data/ocean_networks/graph.json';
import oceanNetworksI18n from '@/data/ocean_networks/i18n.json';

interface NetworkVisualizationProps {
  tabId: 'bujang' | 'nagapattinam' | 'churn';
  selectedTags: string[];
}

function project([lat, lon]: [number, number], w = 900, h = 400) {
  const x = ((lon - 20) / (120 - 20)) * (w - 60) + 30;
  const y = ((30 - lat) / (30 - -10)) * (h - 60) + 30;
  return [x, y];
}

export function NetworkVisualization({ tabId, selectedTags }: NetworkVisualizationProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const graphConfig = graphData.graphs[tabId];

  // Filter nodes and edges based on selected tags
  const filteredNodes = selectedTags.length === 0 
    ? graphConfig.nodes 
    : graphConfig.nodes.filter(node => 
        node.tags.some(tag => selectedTags.includes(tag))
      );

  const filteredEdges = graphConfig.edges.filter(edge => 
    filteredNodes.some(node => node.id === edge.from) && 
    filteredNodes.some(node => node.id === edge.to)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Network Visualization
          <span className="text-xs text-muted-foreground">
            ({filteredNodes.length} nodes, {filteredEdges.length} connections)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg 
          width="100%" 
          height="400" 
          viewBox="0 0 900 400" 
          className="border border-border rounded-lg bg-background"
        >
          {/* Ocean background */}
          <rect width="900" height="400" fill="hsl(var(--ocean) / 0.1)" />
          
          {/* Edges */}
          {filteredEdges.map((edge, i) => {
            const fromNode = filteredNodes.find(n => n.id === edge.from);
            const toNode = filteredNodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            const [x1, y1] = project([fromNode.lat, fromNode.lon]);
            const [x2, y2] = project([toNode.lat, toNode.lon]);
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.needs_citation ? "hsl(var(--muted-foreground))" : "hsl(var(--gold))"}
                  strokeWidth="2"
                  strokeDasharray={edge.needs_citation ? "5,5" : "none"}
                />
                {edge.needs_citation && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    ⚑
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Nodes */}
          {filteredNodes.map((node) => {
            const [x, y] = project([node.lat, node.lon]);
            const isHovered = hoveredNode === node.id;
            
            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 6}
                  fill={node.needs_citation ? "hsl(var(--muted))" : "hsl(var(--laterite))"}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="text-xs font-medium fill-foreground"
                >
                  {node.name}
                  {node.needs_citation && (
                    <tspan className="fill-muted-foreground"> ⚑</tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>{oceanNetworksI18n.footnotes[0]}</p>
          <p className="flex items-center gap-2">
            <span className="text-muted-foreground">⚑</span>
            {oceanNetworksI18n.labels.needs_citation} — {oceanNetworksI18n.footnotes[1]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}