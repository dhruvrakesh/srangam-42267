import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ForceGraph2D from 'react-force-graph-2d';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Network, ZoomIn, ZoomOut, Maximize2, Download, FileDown, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom';

// Theme colors matching existing design system
const THEME_COLORS: Record<string, string> = {
  'Ancient India': 'hsl(var(--saffron))',
  'Indian Ocean World': 'hsl(var(--peacock-blue))',
  'Scripts & Inscriptions': 'hsl(var(--indigo-dharma))',
  'Geology & Deep Time': 'hsl(var(--terracotta))',
  'Empires & Exchange': 'hsl(var(--turmeric))',
};

const TYPE_COLORS: Record<string, string> = {
  'same_theme': 'hsl(var(--peacock-blue))',
  'thematic': 'hsl(var(--turmeric))',
  'geographical': 'hsl(var(--laterite))',
  'temporal': 'hsl(var(--terracotta))',
  'methodological': 'hsl(var(--indigo-dharma))',
};

interface ArticleNode {
  id: string;
  name: string;
  value: number;
  color: string;
  group: string;
  slug: string;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string | any;
  target: string | any;
  value: number;
  type: string;
  color: string;
  label?: string;
}

export default function ResearchNetwork() {
  const [selectedNode, setSelectedNode] = useState<ArticleNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilters, setTypeFilters] = useState<string[]>(['same_theme', 'thematic', 'geographical', 'temporal', 'methodological']);
  const [minStrength, setMinStrength] = useState([1]);
  const [layout, setLayout] = useState<'force' | 'radial'>('force');
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles-for-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, title, theme, tags, read_time_minutes')
        .eq('status', 'published');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch cross-references
  const { data: crossRefs, isLoading: crossRefsLoading } = useQuery({
    queryKey: ['cross-references-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_cross_references')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(800, window.innerHeight - 400);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create articles map for quick lookups
  const articlesMap = useMemo(() => {
    if (!articles) return new Map();
    return new Map(articles.map(a => [a.id, a]));
  }, [articles]);

  // Determine node color based on theme
  const getNodeColor = (article: any) => {
    if (!article?.theme) return 'hsl(var(--muted))';
    return THEME_COLORS[article.theme] || 'hsl(var(--muted))';
  };

  // Calculate connection counts
  const connectionCounts = useMemo(() => {
    if (!crossRefs) return new Map();
    const counts = new Map<string, number>();
    
    crossRefs.forEach(ref => {
      counts.set(ref.source_article_id, (counts.get(ref.source_article_id) || 0) + 1);
      counts.set(ref.target_article_id, (counts.get(ref.target_article_id) || 0) + 1);
    });
    
    return counts;
  }, [crossRefs]);

  // Generate graph data
  const graphData = useMemo(() => {
    if (!articles || !crossRefs) return { nodes: [], links: [] };

    // Filter articles by search
    const filteredArticles = articles.filter(article => {
      const title = article.title;
      const titleText = typeof title === 'object' && title && 'en' in title 
        ? String(title.en) 
        : typeof title === 'string' 
        ? title 
        : '';
      return titleText.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Create nodes
    const nodes: ArticleNode[] = filteredArticles.map(article => {
      const title = article.title;
      const titleText = typeof title === 'object' && title && 'en' in title 
        ? String(title.en) 
        : typeof title === 'string' 
        ? title 
        : 'Untitled';
      const connectionCount = connectionCounts.get(article.id) || 0;
      
      return {
        id: article.id,
        name: titleText,
        value: connectionCount + 5,
        color: getNodeColor(article),
        group: article.theme || 'Other',
        slug: article.slug,
      };
    });

    const nodeIds = new Set(nodes.map(n => n.id));

    // Filter and create links
    const links: GraphLink[] = crossRefs
      .filter(ref => 
        nodeIds.has(ref.source_article_id) && 
        nodeIds.has(ref.target_article_id) &&
        typeFilters.includes(ref.reference_type) &&
        (ref.strength || 1) >= minStrength[0]
      )
      .map(ref => ({
        source: ref.source_article_id,
        target: ref.target_article_id,
        value: ref.strength || 1,
        type: ref.reference_type,
        color: TYPE_COLORS[ref.reference_type] || 'hsl(var(--muted-foreground))',
        label: ref.reference_type,
      }));

    // Apply layout
    if (layout === 'radial' && nodes.length > 0) {
      const centerNode = nodes.reduce((max, node) => 
        node.value > max.value ? node : max
      );
      
      nodes.forEach((node, i) => {
        if (node.id === centerNode.id) {
          node.fx = 0;
          node.fy = 0;
        } else {
          const angle = (i / nodes.length) * 2 * Math.PI;
          const radius = 300;
          node.fx = Math.cos(angle) * radius;
          node.fy = Math.sin(angle) * radius;
        }
      });
    } else {
      nodes.forEach(node => {
        delete node.fx;
        delete node.fy;
      });
    }

    return { nodes, links };
  }, [articles, crossRefs, searchQuery, typeFilters, minStrength, layout, connectionCounts]);

  // Selected article details
  const selectedArticle = useMemo(() => {
    if (!selectedNode || !articlesMap) return null;
    return articlesMap.get(selectedNode.id);
  }, [selectedNode, articlesMap]);

  // Selected article connections
  const selectedConnections = useMemo(() => {
    if (!selectedNode || !crossRefs) return [];
    return crossRefs.filter(ref => 
      ref.source_article_id === selectedNode.id || 
      ref.target_article_id === selectedNode.id
    );
  }, [selectedNode, crossRefs]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
    }
  };

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  const handleExportPNG = async () => {
    if (!containerRef.current) return;
    
    const canvas = await html2canvas(containerRef.current);
    const link = document.createElement('a');
    link.download = 'research-network.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExportCSV = () => {
    if (!crossRefs || !articlesMap) return;
    
    const rows = crossRefs.map(ref => {
      const source = articlesMap.get(ref.source_article_id);
      const target = articlesMap.get(ref.target_article_id);
      const sourceTitle = source && typeof source.title === 'object' ? source.title.en : source?.title || '';
      const targetTitle = target && typeof target.title === 'object' ? target.title.en : target?.title || '';
      
      return [
        sourceTitle,
        targetTitle,
        ref.reference_type,
        ref.strength || 1,
      ].join(',');
    });
    
    const csv = ['Source,Target,Type,Strength', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'research-network.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const stats = useMemo(() => {
    if (!articles || !crossRefs) return null;
    
    const avgStrength = crossRefs.reduce((sum, ref) => sum + (ref.strength || 0), 0) / crossRefs.length;
    const typeBreakdown = crossRefs.reduce((acc, ref) => {
      acc[ref.reference_type] = (acc[ref.reference_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      articles: articles.length,
      connections: crossRefs.length,
      avgStrength: avgStrength.toFixed(1),
      types: Object.keys(typeBreakdown).length,
    };
  }, [articles, crossRefs]);

  if (articlesLoading || crossRefsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Network className="animate-pulse mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Loading research network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Network className="text-peacock-blue" size={56} />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">
            Research Network Visualization
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Explore {stats?.connections || 474} scholarly connections across {stats?.articles || 22} articles
          </p>
          
          {/* User Guide */}
          <Card className="max-w-3xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={20} />
                How to Use This Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-2 text-sm">
                <li><strong>Click</strong> nodes to view article details</li>
                <li><strong>Drag</strong> nodes to rearrange the network</li>
                <li><strong>Scroll</strong> to zoom in/out</li>
                <li><strong>Filter</strong> by connection type or strength below</li>
                <li><strong>Export</strong> as PNG or CSV for presentations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Articles</CardDescription>
                <CardTitle className="text-3xl">{stats.articles}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Cross-References</CardDescription>
                <CardTitle className="text-3xl">{stats.connections}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Strength</CardDescription>
                <CardTitle className="text-3xl">{stats.avgStrength}/10</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Reference Types</CardDescription>
                <CardTitle className="text-3xl">{stats.types}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Filters & Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div>
              <Label htmlFor="search">Search Articles</Label>
              <Input
                id="search"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Reference Type Filters */}
            <div>
              <Label className="mb-3 block">Reference Types</Label>
              <div className="flex flex-wrap gap-4">
                {Object.keys(TYPE_COLORS).map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={typeFilters.includes(type)}
                      onCheckedChange={() => toggleTypeFilter(type)}
                    />
                    <Label htmlFor={type} className="cursor-pointer">
                      {type.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Strength Slider */}
            <div>
              <Label className="mb-3 block">Minimum Strength: {minStrength[0]}/10</Label>
              <Slider
                value={minStrength}
                onValueChange={setMinStrength}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Layout Toggle */}
            <div>
              <Label className="mb-3 block">Layout</Label>
              <RadioGroup value={layout} onValueChange={(v: any) => setLayout(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="force" id="force" />
                  <Label htmlFor="force" className="cursor-pointer">Force-Directed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="radial" id="radial" />
                  <Label htmlFor="radial" className="cursor-pointer">Radial</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleExportPNG} variant="outline" className="flex-1">
                <Download className="mr-2" size={16} />
                Export PNG
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="flex-1">
                <FileDown className="mr-2" size={16} />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Graph */}
        <Card>
          <CardContent className="p-0 relative" ref={containerRef}>
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel="name"
              nodeColor="color"
              nodeVal="value"
              linkColor="color"
              linkWidth={link => link.value / 2}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.002}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.value, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = 'hsl(var(--foreground))';
                ctx.fillText(label, node.x, node.y + node.value + fontSize);
              }}
            />
            
            {/* Zoom Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button size="icon" variant="secondary" onClick={handleZoomIn}>
                <ZoomIn size={16} />
              </Button>
              <Button size="icon" variant="secondary" onClick={handleZoomOut}>
                <ZoomOut size={16} />
              </Button>
              <Button size="icon" variant="secondary" onClick={handleResetView}>
                <Maximize2 size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reference Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Cross-References ({graphData.links.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Target</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {graphData.links.slice(0, 50).map((link, i) => {
                    const sourceId = typeof link.source === 'object' && link.source && 'id' in link.source 
                      ? link.source.id 
                      : typeof link.source === 'string' 
                      ? link.source 
                      : '';
                    const targetId = typeof link.target === 'object' && link.target && 'id' in link.target 
                      ? link.target.id 
                      : typeof link.target === 'string' 
                      ? link.target 
                      : '';
                    const source = articlesMap.get(sourceId);
                    const target = articlesMap.get(targetId);
                    const sourceTitle = source 
                      ? (typeof source.title === 'object' && source.title && 'en' in source.title 
                        ? String(source.title.en) 
                        : typeof source.title === 'string' 
                        ? source.title 
                        : 'Untitled')
                      : 'Unknown';
                    const targetTitle = target 
                      ? (typeof target.title === 'object' && target.title && 'en' in target.title 
                        ? String(target.title.en) 
                        : typeof target.title === 'string' 
                        ? target.title 
                        : 'Untitled')
                      : 'Unknown';

                    return (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="p-2 text-sm">{sourceTitle}</td>
                        <td className="p-2 text-sm">{targetTitle}</td>
                        <td className="p-2">
                          <Badge variant="outline">{link.type}</Badge>
                        </td>
                        <td className="p-2 text-sm">{link.value}/10</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {graphData.links.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing first 50 of {graphData.links.length} connections
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Detail Panel */}
      <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedArticle && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">
                  {(() => {
                    const title = selectedArticle.title;
                    return typeof title === 'object' && title && 'en' in title 
                      ? String(title.en) 
                      : typeof title === 'string' 
                      ? title 
                      : 'Untitled';
                  })()}
                </SheetTitle>
                <SheetDescription>
                  <Badge variant="outline" className="mt-2">
                    {selectedArticle.theme}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Reading time: {selectedArticle.read_time_minutes} min
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Connections: {selectedConnections.length}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Connected Articles ({selectedConnections.length})</h4>
                  <div className="space-y-2">
                    {selectedConnections.slice(0, 10).map((ref, i) => {
                      const connectedId = ref.source_article_id === selectedNode?.id 
                        ? ref.target_article_id 
                        : ref.source_article_id;
                      const connectedArticle = articlesMap.get(connectedId);
                      const connectedTitle = connectedArticle 
                        ? (typeof connectedArticle.title === 'object' && connectedArticle.title && 'en' in connectedArticle.title 
                          ? String(connectedArticle.title.en) 
                          : typeof connectedArticle.title === 'string' 
                          ? connectedArticle.title 
                          : 'Untitled')
                        : 'Unknown';

                      return (
                        <div key={i} className="p-2 rounded border">
                          <p className="text-sm font-medium">{connectedTitle}</p>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-xs">
                              {ref.reference_type}
                            </Badge>
                            <span>Strength: {ref.strength}/10</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <Link to={`/${selectedArticle.slug}`}>
                  <Button className="w-full">
                    Read Full Article
                  </Button>
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
