import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  BookOpen,
  MapPin,
  RefreshCw,
  Loader2,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableHealth {
  name: string;
  displayName: string;
  count: number;
  status: "ok" | "warning" | "critical";
  icon: React.ReactNode;
}

interface MarkdownSourceAnalysis {
  id: string;
  articleId: string | null;
  filePath: string | null;
  hasBibliography: boolean;
  hasEvidenceTable: boolean;
  articleTitle: string | null;
}

interface BackfillResult {
  success: boolean;
  dryRun: boolean;
  stats: {
    articlesProcessed: number;
    bibliographyEntriesCreated: number;
    articleBibliographyLinksCreated: number;
    evidenceEntriesCreated: number;
    errors: string[];
  };
}

export default function DataHealth() {
  const queryClient = useQueryClient();
  const [dryRun, setDryRun] = useState(true);
  const [backfillLogs, setBackfillLogs] = useState<string[]>([]);
  const [ogProgress, setOgProgress] = useState({ current: 0, total: 0, generating: false });
  const [ogLogs, setOgLogs] = useState<string[]>([]);

  // Fetch table counts
  const { data: tableHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["data-health-tables"],
    queryFn: async () => {
      const tables: TableHealth[] = [];

      // Bibliography entries
      const { count: bibCount } = await supabase
        .from("srangam_bibliography_entries")
        .select("*", { count: "exact", head: true });
      tables.push({
        name: "srangam_bibliography_entries",
        displayName: "Bibliography Entries",
        count: bibCount || 0,
        status: bibCount && bibCount > 0 ? "ok" : "critical",
        icon: <BookOpen className="h-4 w-4" />,
      });

      // Article↔Bibliography links
      const { count: abCount } = await supabase
        .from("srangam_article_bibliography")
        .select("*", { count: "exact", head: true });
      tables.push({
        name: "srangam_article_bibliography",
        displayName: "Article↔Bibliography Links",
        count: abCount || 0,
        status: abCount && abCount > 0 ? "ok" : "critical",
        icon: <FileText className="h-4 w-4" />,
      });

      // Article evidence
      const { count: evCount } = await supabase
        .from("srangam_article_evidence")
        .select("*", { count: "exact", head: true });
      tables.push({
        name: "srangam_article_evidence",
        displayName: "Article Evidence",
        count: evCount || 0,
        status: evCount && evCount > 0 ? "ok" : "warning",
        icon: <MapPin className="h-4 w-4" />,
      });

      // Markdown sources
      const { count: mdCount } = await supabase
        .from("srangam_markdown_sources")
        .select("*", { count: "exact", head: true });
      tables.push({
        name: "srangam_markdown_sources",
        displayName: "Markdown Sources",
        count: mdCount || 0,
        status: mdCount && mdCount > 0 ? "ok" : "warning",
        icon: <Database className="h-4 w-4" />,
      });

      return tables;
    },
  });

  // Fetch markdown source analysis
  const { data: sourceAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["markdown-source-analysis"],
    queryFn: async () => {
      const { data: sources, error } = await supabase
        .from("srangam_markdown_sources")
        .select(`
          id,
          article_id,
          file_path,
          markdown_content
        `)
        .order("file_path");

      if (error) throw error;

      // Get article titles
      const articleIds = sources?.filter(s => s.article_id).map(s => s.article_id) || [];
      const { data: articles } = await supabase
        .from("srangam_articles")
        .select("id, title")
        .in("id", articleIds);

      const articleMap = new Map(articles?.map(a => [a.id, a.title]) || []);

      return sources?.map(source => {
        const content = source.markdown_content || "";
        const hasBibliography = /## (Bibliography|References|Works Cited)/i.test(content);
        const hasEvidenceTable = /\|.*Date.*\|.*Place.*\|/i.test(content) || 
                                  /\|.*तिथि.*\|.*स्थान.*\|/i.test(content);
        const title = source.article_id ? articleMap.get(source.article_id) : null;

        return {
          id: source.id,
          articleId: source.article_id,
          filePath: source.file_path,
          hasBibliography,
          hasEvidenceTable,
          articleTitle: title ? (title as { en?: string })?.en || "Untitled" : null,
        } as MarkdownSourceAnalysis;
      }) || [];
    },
  });

  // Backfill mutation
  const backfillMutation = useMutation({
    mutationFn: async (isDryRun: boolean) => {
      setBackfillLogs(prev => [...prev, `Starting ${isDryRun ? 'dry run' : 'backfill'}...`]);
      
      const { data, error } = await supabase.functions.invoke("backfill-bibliography", {
        body: { dryRun: isDryRun },
      });

      if (error) throw error;
      return data as BackfillResult;
    },
    onSuccess: (data) => {
      const { stats, dryRun: wasDryRun } = data;
      
      setBackfillLogs(prev => [
        ...prev,
        `${wasDryRun ? '[DRY RUN]' : '[COMPLETE]'} Processed ${stats.articlesProcessed} articles`,
        `  → ${stats.bibliographyEntriesCreated} bibliography entries`,
        `  → ${stats.articleBibliographyLinksCreated} article links`,
        `  → ${stats.evidenceEntriesCreated} evidence entries`,
        ...(stats.errors.length > 0 ? [`Errors: ${stats.errors.join(', ')}`] : []),
      ]);

      if (!wasDryRun) {
        queryClient.invalidateQueries({ queryKey: ["data-health-tables"] });
        queryClient.invalidateQueries({ queryKey: ["markdown-source-analysis"] });
        toast.success("Backfill completed successfully!");
      } else {
        toast.info("Dry run complete - no data was changed");
      }
    },
    onError: (error) => {
      setBackfillLogs(prev => [...prev, `ERROR: ${error.message}`]);
      toast.error("Backfill failed: " + error.message);
    },
  });

  // Fetch articles for OG image generation
  const { data: articlesForOg } = useQuery({
    queryKey: ["articles-for-og"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_articles")
        .select("id, title, theme, slug_alias, slug, og_image_url")
        .eq("status", "published")
        .order("title");
      if (error) throw error;
      return data || [];
    },
  });

  const articlesWithoutOg = articlesForOg?.filter(a => !a.og_image_url) || [];
  const estimatedCost = (articlesWithoutOg.length * 0.04).toFixed(2);

  // Generate OG images for articles
  const handleGenerateOgImages = async () => {
    if (articlesWithoutOg.length === 0) {
      toast.info("All articles already have OG images");
      return;
    }

    setOgProgress({ current: 0, total: articlesWithoutOg.length, generating: true });
    setOgLogs([`Starting OG image generation for ${articlesWithoutOg.length} articles...`]);

    for (let i = 0; i < articlesWithoutOg.length; i++) {
      const article = articlesWithoutOg[i];
      const title = (article.title as { en?: string })?.en || "Untitled";
      const slug = article.slug_alias || article.slug;

      setOgLogs(prev => [...prev, `[${i + 1}/${articlesWithoutOg.length}] Generating: ${title}`]);
      setOgProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const { data, error } = await supabase.functions.invoke("generate-article-og", {
          body: {
            articleId: article.id,
            title,
            theme: article.theme,
            slug,
          },
        });

        if (error) throw error;
        
        if (data.success) {
          setOgLogs(prev => [...prev, `  ✓ Generated: ${data.url}`]);
        } else {
          setOgLogs(prev => [...prev, `  ✗ Failed: ${data.error}`]);
        }
      } catch (err) {
        setOgLogs(prev => [...prev, `  ✗ Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setOgProgress(prev => ({ ...prev, generating: false }));
    setOgLogs(prev => [...prev, `\n✅ OG image generation complete!`]);
    queryClient.invalidateQueries({ queryKey: ["articles-for-og"] });
    toast.success("OG image generation complete!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case "critical":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Critical</Badge>;
      default:
        return null;
    }
  };

  const sourcesWithBib = sourceAnalysis?.filter(s => s.hasBibliography).length || 0;
  const sourcesWithEvidence = sourceAnalysis?.filter(s => s.hasEvidenceTable).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Data Health Dashboard
        </h2>
        <p className="text-muted-foreground">
          Monitor bibliography tables and run backfill operations
        </p>
      </div>

      {/* Database Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Table Health
          </CardTitle>
          <CardDescription>
            Status of bibliography and evidence tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead className="text-right">Row Count</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableHealth?.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {table.icon}
                      {table.displayName}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {table.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(table.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Backfill Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Bibliography Backfill
          </CardTitle>
          <CardDescription>
            Extract bibliography and evidence from existing markdown sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="dry-run"
                  checked={dryRun}
                  onCheckedChange={setDryRun}
                />
                <Label htmlFor="dry-run">Dry Run (preview only)</Label>
              </div>
            </div>
            <Button
              onClick={() => backfillMutation.mutate(dryRun)}
              disabled={backfillMutation.isPending}
            >
              {backfillMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Backfill
                </>
              )}
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold">{sourceAnalysis?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Markdown Sources</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold">{sourcesWithBib}</div>
              <div className="text-sm text-muted-foreground">With Bibliography</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold">{sourcesWithEvidence}</div>
              <div className="text-sm text-muted-foreground">With Evidence Tables</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold">{tableHealth?.find(t => t.name === "srangam_bibliography_entries")?.count || 0}</div>
              <div className="text-sm text-muted-foreground">Extracted Entries</div>
            </div>
          </div>

          {/* Logs */}
          {backfillLogs.length > 0 && (
            <div className="border rounded-lg">
              <div className="px-4 py-2 bg-muted/50 border-b font-medium text-sm">
                Execution Logs
              </div>
              <ScrollArea className="h-40">
                <div className="p-4 font-mono text-sm space-y-1">
                  {backfillLogs.map((log, i) => (
                    <div key={i} className={log.startsWith("ERROR") ? "text-red-500" : "text-muted-foreground"}>
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OG Image Generation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Dynamic OG Image Generation
          </CardTitle>
          <CardDescription>
            Generate AI-powered Open Graph images for social sharing (DALL-E 3, $0.04/image)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold">{articlesForOg?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{articlesForOg?.filter(a => a.og_image_url).length || 0}</div>
              <div className="text-sm text-muted-foreground">With OG Image</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-destructive">{articlesWithoutOg.length}</div>
              <div className="text-sm text-muted-foreground">Missing OG Image</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-2xl font-bold">${estimatedCost}</div>
              <div className="text-sm text-muted-foreground">Est. Cost</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              {articlesWithoutOg.length > 0 
                ? `Ready to generate ${articlesWithoutOg.length} OG images`
                : "All articles have OG images"}
            </div>
            <Button
              onClick={handleGenerateOgImages}
              disabled={ogProgress.generating || articlesWithoutOg.length === 0}
            >
              {ogProgress.generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating ({ogProgress.current}/{ogProgress.total})...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate OG Images
                </>
              )}
            </Button>
          </div>

          {/* Logs */}
          {ogLogs.length > 0 && (
            <div className="border rounded-lg">
              <div className="px-4 py-2 bg-muted/50 border-b font-medium text-sm">
                Generation Logs
              </div>
              <ScrollArea className="h-40">
                <div className="p-4 font-mono text-sm space-y-1">
                  {ogLogs.map((log, i) => (
                    <div key={i} className={log.includes("✗") ? "text-destructive" : log.includes("✓") ? "text-primary" : "text-muted-foreground"}>
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Markdown Source Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Markdown Source Analysis
          </CardTitle>
          <CardDescription>
            Detailed breakdown of bibliography and evidence table presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>File Path</TableHead>
                    <TableHead className="text-center">Bibliography</TableHead>
                    <TableHead className="text-center">Evidence Table</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceAnalysis?.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {source.articleTitle || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono max-w-[200px] truncate">
                        {source.filePath || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {source.hasBibliography ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {source.hasEvidenceTable ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
