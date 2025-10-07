import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TriadNode {
  id: string;
  label: string;
  title: string;
  description: string;
  color: string;
  examples: string[];
}

const triadNodes: TriadNode[] = [
  {
    id: 'rishi',
    label: 'Ṛṣi',
    title: 'The Seer (ऋषि)',
    description: 'The spiritual lineage through which the eternal Vedic knowledge was revealed. Not authorship in the modern sense, but the traditional provenance linking mantras to specific Vedic clans.',
    color: 'hsl(var(--chart-1))',
    examples: ['Viśvāmitra', 'Vasiṣṭha', 'Aṅgiras', 'Atri', 'Bharadvāja']
  },
  {
    id: 'devata',
    label: 'Devatā',
    title: 'The Deity (देवता)',
    description: 'The divine force or deity to whom the hymn is addressed. This theological tag preserves the ritual purpose and cosmological placement of each mantra.',
    color: 'hsl(var(--chart-2))',
    examples: ['Indra', 'Agni', 'Savitṛ', 'Varuṇa', 'Mitrā-Varuṇa', 'Viśvedevas']
  },
  {
    id: 'chandas',
    label: 'Chandas',
    title: 'The Meter (छन्द)',
    description: 'The precise syllabic structure imposing a rigid mathematical framework. This metrical lock provides immediate error-detection for any textual corruption.',
    color: 'hsl(var(--chart-3))',
    examples: ['Gāyatrī (24)', 'Uṣṇih (28)', 'Anuṣṭubh (32)', 'Triṣṭubh (44)', 'Jagatī (48)']
  }
];

export function AnukramaniTriadVisualization() {
  const [selectedNode, setSelectedNode] = useState<TriadNode | null>(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>The Ṛṣi-Devatā-Chandas Tripartite System</CardTitle>
        <CardDescription>
          The "holographic key" of Vedic preservation: each mantra's complete identity through three complementary dimensions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Triad */}
        <div className="relative h-64 flex items-center justify-center">
          {/* Triangle connecting lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            <line x1="200" y1="60" x2="100" y2="220" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4" />
            <line x1="200" y1="60" x2="300" y2="220" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4" />
            <line x1="100" y1="220" x2="300" y2="220" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4" />
          </svg>

          {/* Node positions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <NodeButton node={triadNodes[0]} selected={selectedNode?.id === triadNodes[0].id} onClick={() => setSelectedNode(triadNodes[0])} />
          </div>
          <div className="absolute bottom-4 left-8">
            <NodeButton node={triadNodes[1]} selected={selectedNode?.id === triadNodes[1].id} onClick={() => setSelectedNode(triadNodes[1])} />
          </div>
          <div className="absolute bottom-4 right-8">
            <NodeButton node={triadNodes[2]} selected={selectedNode?.id === triadNodes[2].id} onClick={() => setSelectedNode(triadNodes[2])} />
          </div>

          {/* Center text */}
          <div className="text-center">
            <div className="text-sm font-semibold text-muted-foreground">Mantra Identity</div>
            <div className="text-xs text-muted-foreground mt-1">Click nodes to explore</div>
          </div>
        </div>

        {/* Details Panel */}
        {selectedNode && (
          <div className="p-4 rounded-lg border bg-card animate-in fade-in-50 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <h4 className="font-bold text-lg">{selectedNode.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedNode.description}</p>
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Examples:</div>
              <div className="flex flex-wrap gap-2">
                {selectedNode.examples.map((example) => (
                  <Badge key={example} variant="secondary">{example}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Explanatory Text */}
        <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
          <p><strong>Holographic Preservation:</strong> The <em>ṛṣi</em> provides the context of origin (the knower), the <em>devatā</em> provides the context of purpose (the object of knowledge), and the <em>chandas</em> provides the physical, sonic structure (the known form). Together, they create a multi-factor authentication system ensuring each mantra's integrity across millennia of oral transmission.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NodeButton({ node, selected, onClick }: { node: TriadNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full font-semibold transition-all duration-200
        ${selected 
          ? 'scale-110 shadow-lg ring-2 ring-offset-2' 
          : 'hover:scale-105 hover:shadow-md'
        }
      `}
      style={{ 
        backgroundColor: node.color,
        color: 'white'
      }}
    >
      {node.label}
    </button>
  );
}
