import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Network, Search, ArrowRight, ExternalLink, Gauge } from "lucide-react";
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

  // Create articles map for quick lookups
  const articlesMap = useMemo(() => {
    const map: Record<string, any> = {};
    articles.forEach((article) => {
      map[article.id] = article;
    });
    return map;
  }, [articles]);

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

    const nodes: ArticleNode[] = filteredArticles.map((article: any) => ({
      id: article.id,
      name: article.title?.en || article.slug,
      val: connectionCounts[article.id] || 1,
      color: THEME_COLORS[article.theme] || THEME_COLORS.Default,
      group: article.theme,
      slug: article.slug,
    }));

    const links: GraphLink[] = filteredRefs.map((ref: any) => ({
      source: ref.source_article_id,
      target: ref.target_article_id,
      value: ref.strength,
      type: ref.reference_type,
      color: TYPE_COLORS[ref.reference_type as keyof typeof TYPE_COLORS] || "#9E9E9E",
      label: ref.context_description?.reason || "",
    }));

    return { nodes, links };
  }, [articles, crossRefs, searchQuery, typeFilters, connectionCounts]);

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
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
        </CardContent>
      </Card>

      {/* Network Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] border rounded-lg bg-background">
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeVal={(node: any) => node.val}
              nodeColor={(node: any) => node.color}
              linkWidth={(link: any) => link.value * 0.5}
              linkColor={(link: any) => link.color}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              onNodeClick={handleNodeClick}
              enableNodeDrag={true}
              cooldownTicks={100}
              backgroundColor="#ffffff"
              width={1200}
              height={600}
            />
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
