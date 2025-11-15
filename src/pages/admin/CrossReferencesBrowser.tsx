import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Network,
  Search,
  ArrowRight,
  ExternalLink,
  Gauge,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";

const THEME_COLORS: Record<string, string> = {
  "Ancient India": "#64B5F6",
  Vedic: "#FFB74D",
  Maritime: "#81C784",
  Default: "#9E9E9E",
};

const TYPE_COLORS: Record<string, string> = {
  same_theme: "#81C784",
  thematic: "#FFB74D",
  explicit_citation: "#64B5F6",
};

// Tag-based color categories for better visual grouping
const PERIOD_TAGS = ["Vedic Period", "Mauryan Empire", "Ancient India", "Sangam Period"];
const SUBJECT_TAGS = ["Puranic Literature", "Sanskrit Literature", "Ṛgveda", "Mahābhārata", "Rāmāyaṇa"];
const CONCEPT_TAGS = ["Cultural Continuity", "Religious Pluralism", "Textual Analysis", "Philosophy"];
const LOCATION_TAGS = ["Tamil Nadu", "Kashmir", "Kerala", "South India", "North India"];

const NODE_CATEGORY_COLORS = {
  period: "#64B5F6",      // Blue - Historical/Period
  subject: "#FFB74D",     // Orange - Textual Studies
  concept: "#81C784",     // Green - Conceptual/Philosophical
  location: "#F06292",    // Pink - Geographic/Regional
  default: "#9E9E9E",     // Gray - Uncategorized
};

interface ArticleNode {
  id: string;
  name: string;
  val: number;
  color: string;
  group: string;
  slug: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  type: string;
  color: string;
  label: string;
}

export default function CrossReferencesBrowser() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilters, setTypeFilters] = useState({
    same_theme: true,
    thematic: true,
    explicit_citation: true,
  });
  const [layoutType, setLayoutType] = useState<"force" | "radial">("force");
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Fetch articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["articles-network"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_articles")
        .select("id, slug, title, theme, tags, read_time_minutes, author")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch cross-references
  const { data: crossRefs = [], isLoading: refsLoading } = useQuery({
    queryKey: ["cross-references"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_cross_references")
        .select("*")
        .order("strength", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Responsive canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(600, containerRef.current.clientWidth * 0.5),
        });
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Create articles map for quick lookups
  const articlesMap = useMemo(() => {
    const map: Record<string, any> = {};
    articles.forEach((article) => {
      map[article.id] = article;
    });
    return map;
  }, [articles]);

  // Get node color based on dominant tag category
  const getNodeColor = useCallback((article: any): string => {
    const tags = article.tags || [];
    
    if (tags.some((t: string) => PERIOD_TAGS.includes(t))) return NODE_CATEGORY_COLORS.period;
    if (tags.some((t: string) => SUBJECT_TAGS.includes(t))) return NODE_CATEGORY_COLORS.subject;
    if (tags.some((t: string) => CONCEPT_TAGS.includes(t))) return NODE_CATEGORY_COLORS.concept;
    if (tags.some((t: string) => LOCATION_TAGS.includes(t))) return NODE_CATEGORY_COLORS.location;
    
    return NODE_CATEGORY_COLORS.default;
  }, []);

  // Calculate connection counts
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    crossRefs.forEach((ref: any) => {
      counts[ref.source_article_id] = (counts[ref.source_article_id] || 0) + 1;
      counts[ref.target_article_id] = (counts[ref.target_article_id] || 0) + 1;
    });
    return counts;
  }, [crossRefs]);

  // Transform data for force graph
  const graphData = useMemo(() => {
    const filteredArticles = articles.filter((article: any) =>
      article.title?.en?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRefs = crossRefs.filter(
      (ref: any) =>
        typeFilters[ref.reference_type as keyof typeof typeFilters] &&
        ref.strength >= 1 &&
        ref.strength <= 10
    );

    const nodes: ArticleNode[] = filteredArticles.map((article: any) => {
      const node = {
        id: article.id,
        name: article.title?.en || article.slug,
        val: connectionCounts[article.id] || 1,
        color: getNodeColor(article),
        group: article.theme,
        slug: article.slug,
      };
      
      // Apply radial layout if selected
      if (layoutType === "radial") {
        const sorted = [...filteredArticles].sort(
          (a: any, b: any) => (connectionCounts[b.id] || 0) - (connectionCounts[a.id] || 0)
        );
        const index = sorted.findIndex((a: any) => a.id === article.id);
        const angle = (index / sorted.length) * 2 * Math.PI;
        const radius = 100 + (connectionCounts[article.id] || 0) * 5;
        (node as any).fx = Math.cos(angle) * radius;
        (node as any).fy = Math.sin(angle) * radius;
      }
      
      return node;
    });

    const links: GraphLink[] = filteredRefs.map((ref: any) => ({
      source: ref.source_article_id,
      target: ref.target_article_id,
      value: ref.strength,
      type: ref.reference_type,
      color: TYPE_COLORS[ref.reference_type as keyof typeof TYPE_COLORS] || "#9E9E9E",
      label: ref.context_description?.reason || "",
    }));

    return { nodes, links };
  }, [articles, crossRefs, searchQuery, typeFilters, connectionCounts, layoutType, getNodeColor]);

  // Selected article data
  const selectedArticle = useMemo(() => {
    if (!selectedNode) return null;
    return articles.find((a: any) => a.id === selectedNode);
  }, [selectedNode, articles]);

  const selectedConnections = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    
    const incoming = crossRefs.filter((ref: any) => ref.target_article_id === selectedNode);
    const outgoing = crossRefs.filter((ref: any) => ref.source_article_id === selectedNode);
    
    return { incoming, outgoing };
  }, [selectedNode, crossRefs]);

  const handleNodeClick = useCallback((node: ArticleNode) => {
    setSelectedNode(node.id);
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.5, 400);
    }
  };

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 400);
      graphRef.current.zoom(1, 400);
    }
  };

  const toggleTypeFilter = (type: keyof typeof typeFilters) => {
    setTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const stats = {
    totalArticles: articles.length,
    totalReferences: crossRefs.length,
    avgStrength: crossRefs.length > 0
      ? ((crossRefs as any[]).reduce((sum, ref) => sum + ref.strength, 0) / crossRefs.length).toFixed(1)
      : "0",
    types: Object.keys(
      (crossRefs as any[]).reduce((acc, ref) => ({ ...acc, [ref.reference_type]: true }), {})
    ).length,
  };

  if (articlesLoading || refsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Cross-References Browser
          </h2>
          <p className="text-muted-foreground">Loading network data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Cross-References Browser
        </h2>
        <p className="text-muted-foreground">
          Interactive network visualization of article connections
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">References</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferences}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Strength</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgStrength}/10</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reference Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.types}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reference Types</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="same_theme"
                    checked={typeFilters.same_theme}
                    onCheckedChange={() => toggleTypeFilter("same_theme")}
                  />
                  <Label htmlFor="same_theme" className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.same_theme }} />
                    Same Theme
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="thematic"
                    checked={typeFilters.thematic}
                    onCheckedChange={() => toggleTypeFilter("thematic")}
                  />
                  <Label htmlFor="thematic" className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.thematic }} />
                    Thematic
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="explicit_citation"
                    checked={typeFilters.explicit_citation}
                    onCheckedChange={() => toggleTypeFilter("explicit_citation")}
                  />
                  <Label htmlFor="explicit_citation" className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.explicit_citation }} />
                    Explicit Citation
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Layout Type</Label>
              <RadioGroup value={layoutType} onValueChange={(v) => setLayoutType(v as "force" | "radial")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="force" id="force" />
                  <Label htmlFor="force">Force-Directed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="radial" id="radial" />
                  <Label htmlFor="radial">Radial Hierarchy</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Color Legend */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">Node Colors (by Tag Category)</Label>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: NODE_CATEGORY_COLORS.period }} />
                Historical/Period
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: NODE_CATEGORY_COLORS.subject }} />
                Textual Studies
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: NODE_CATEGORY_COLORS.concept }} />
                Conceptual
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: NODE_CATEGORY_COLORS.location }} />
                Geographic
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: NODE_CATEGORY_COLORS.default }} />
                Other
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="relative h-[600px] border rounded-lg bg-background overflow-hidden">
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel={(node: any) => {
                const article = articlesMap[node.id];
                const tags = article?.tags?.slice(0, 3).join(", ") || "No tags";
                return `
                  <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; color: white; max-width: 300px;">
                    <strong style="font-size: 14px;">${node.name}</strong><br/>
                    <span style="color: #aaa; font-size: 11px;">Theme: ${node.group}</span><br/>
                    <span style="color: #aaa; font-size: 11px;">Connections: ${node.val}</span><br/>
                    <span style="color: #81C784; font-size: 11px;">Tags: ${tags}</span>
                  </div>
                `;
              }}
              nodeVal={(node: any) => Math.max(3, Math.min(15, Math.log(node.val + 1) * 5))}
              nodeColor={(node: any) => node.color}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name.length > 30 ? node.name.substring(0, 27) + "..." : node.name;
                const fontSize = 10 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "#333";
                const nodeRadius = Math.max(3, Math.min(15, Math.log(node.val + 1) * 5));
                ctx.fillText(label, node.x, node.y + nodeRadius + 3);
              }}
              linkWidth={(link: any) => Math.sqrt(link.value) * 0.3}
              linkColor={(link: any) => link.color + "66"}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              linkCurvature={0.1}
              onNodeClick={handleNodeClick}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              minZoom={0.5}
              maxZoom={8}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              d3AlphaMin={0.001}
              warmupTicks={10}
              cooldownTicks={150}
              backgroundColor="#ffffff"
            />
            
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button size="sm" variant="secondary" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={handleResetView}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reference List ({graphData.links.length} connections)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {graphData.links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No references match current filters
                  </TableCell>
                </TableRow>
              ) : (
                graphData.links.map((link, idx) => {
                  const sourceArticle = articlesMap[link.source];
                  const targetArticle = articlesMap[link.target];
                  
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {sourceArticle?.title?.en || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {targetArticle?.title?.en || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: link.color,
                            color: link.color,
                          }}
                        >
                          {link.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{link.value}/10</span>
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(link.value / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {link.label || "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Article Detail Panel */}
      <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{(selectedArticle?.title as any)?.en || "Article Details"}</SheetTitle>
            <SheetDescription>
              <Badge variant="outline">{selectedArticle?.theme}</Badge>
            </SheetDescription>
          </SheetHeader>

          {selectedArticle && (
            <div className="mt-6 space-y-6">
              {/* Metadata */}
              <div>
                <h4 className="font-semibold mb-2">Metadata</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Author:</span>{" "}
                    {selectedArticle.author || "Unknown"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Read Time:</span>{" "}
                    {selectedArticle.read_time_minutes} min
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedArticle.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connections */}
              <div>
                <h4 className="font-semibold mb-2">
                  Connections ({selectedConnections.incoming.length + selectedConnections.outgoing.length})
                </h4>
                
                {selectedConnections.outgoing.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Outgoing References ({selectedConnections.outgoing.length})
                    </p>
                    <div className="space-y-2">
                      {selectedConnections.outgoing.map((ref: any) => {
                        const targetArticle = articlesMap[ref.target_article_id];
                        return (
                          <div key={ref.id} className="text-sm border rounded p-2">
                            <div className="font-medium">{targetArticle?.title?.en || "Unknown"}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {ref.reference_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Strength: {ref.strength}/10
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedConnections.incoming.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Incoming References ({selectedConnections.incoming.length})
                    </p>
                    <div className="space-y-2">
                      {selectedConnections.incoming.map((ref: any) => {
                        const sourceArticle = articlesMap[ref.source_article_id];
                        return (
                          <div key={ref.id} className="text-sm border rounded p-2">
                            <div className="font-medium">{sourceArticle?.title?.en || "Unknown"}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {ref.reference_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Strength: {ref.strength}/10
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => window.open(`/articles/${selectedArticle.slug}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Article
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
