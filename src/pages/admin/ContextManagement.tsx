import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RefreshCw, Loader2, Download, ExternalLink, Package, Copy, MoreHorizontal, Database, Cloud } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const ContextManagement = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bundleConfig, setBundleConfig] = useState({
    includeArticles: true,
    includeTerms: true,
    includeSchema: true,
    includeDocs: true
  });
  const [lastBundle, setLastBundle] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch snapshots
  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['context-snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_context_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Get latest snapshot
  const latestSnapshot = snapshots[0];

  // Calculate freshness score (simplified)
  const freshnessScore = latestSnapshot
    ? Math.max(0, 100 - Math.floor((Date.now() - new Date(latestSnapshot.snapshot_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Manual sync mutation
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('context-save-drive', {
        body: { triggered_by: 'manual' }
      });

      if (error) throw error;

      toast.success('Context snapshot created successfully');
      queryClient.invalidateQueries({ queryKey: ['context-snapshots'] });
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate bundle
  const handleGenerateBundle = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('context-bundle-generator', {
        body: bundleConfig
      });

      if (error) throw error;

      setLastBundle(data);
      toast.success(`Bundle generated (${formatBytes(data.bundleSize)})`);
    } catch (error) {
      console.error('Error generating bundle:', error);
      toast.error('Failed to generate bundle');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download snapshot
  const handleDownloadSnapshot = async (snapshot: any) => {
    if (snapshot.google_drive_share_url) {
      window.open(snapshot.google_drive_share_url, '_blank');
    } else {
      toast.error('No Google Drive URL available');
    }
  };

  // Copy bundle to clipboard
  const handleCopyToClipboard = () => {
    if (lastBundle?.markdown) {
      navigator.clipboard.writeText(lastBundle.markdown);
      toast.success('Copied to clipboard');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Context Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system snapshots and generate AI context bundles
        </p>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Snapshot</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSnapshot ? formatDistanceToNow(new Date(latestSnapshot.snapshot_date), { addSuffix: true }) : 'Never'}
            </div>
            <Button onClick={handleManualSync} disabled={isSyncing} size="sm" className="mt-2">
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Sync Now</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Snapshots</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snapshots.length}</div>
            <p className="text-xs text-muted-foreground">
              {snapshots.filter(s => s.status === 'success').length} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drive Storage</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(snapshots.reduce((acc, s) => acc + (s.file_size_bytes || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">across all snapshots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Context Freshness</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={freshnessScore > 80 ? 'default' : 'secondary'}>
              {freshnessScore}% Fresh
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Based on last snapshot age
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot History */}
      <Card>
        <CardHeader>
          <CardTitle>Snapshot History</CardTitle>
          <CardDescription>View all context snapshots with change tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{formatDate(snapshot.snapshot_date)}</div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{snapshot.articles_count} articles</Badge>
                      <Badge variant="outline">{snapshot.terms_count} terms</Badge>
                      <Badge variant="outline">{snapshot.tags_count} tags</Badge>
                      <Badge variant="outline">{snapshot.cross_refs_count} cross-refs</Badge>
                      {snapshot.triggered_by && (
                        <Badge variant="secondary">via {snapshot.triggered_by}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {snapshot.google_drive_share_url && (
                        <DropdownMenuItem onClick={() => handleDownloadSnapshot(snapshot)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Google Drive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDownloadSnapshot(snapshot)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Markdown
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {snapshot.context_summary && (
                  <p className="text-sm text-muted-foreground mt-2">{snapshot.context_summary}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Context Bundle Generator */}
      <Card>
        <CardHeader>
          <CardTitle>AI Context Bundle Generator</CardTitle>
          <CardDescription>
            Create a comprehensive context package for AI tools (ChatGPT, Claude, Lovable)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Checkbox
                id="include-articles"
                checked={bundleConfig.includeArticles}
                onCheckedChange={(checked) => 
                  setBundleConfig(prev => ({ ...prev, includeArticles: checked as boolean }))
                }
              />
              <Label htmlFor="include-articles">Include all articles metadata</Label>
            </div>
            
            <div className="flex items-center gap-4">
              <Checkbox
                id="include-terms"
                checked={bundleConfig.includeTerms}
                onCheckedChange={(checked) => 
                  setBundleConfig(prev => ({ ...prev, includeTerms: checked as boolean }))
                }
              />
              <Label htmlFor="include-terms">Include cultural terms database</Label>
            </div>
            
            <div className="flex items-center gap-4">
              <Checkbox
                id="include-schema"
                checked={bundleConfig.includeSchema}
                onCheckedChange={(checked) => 
                  setBundleConfig(prev => ({ ...prev, includeSchema: checked as boolean }))
                }
              />
              <Label htmlFor="include-schema">Include database schema</Label>
            </div>
            
            <div className="flex items-center gap-4">
              <Checkbox
                id="include-docs"
                checked={bundleConfig.includeDocs}
                onCheckedChange={(checked) => 
                  setBundleConfig(prev => ({ ...prev, includeDocs: checked as boolean }))
                }
              />
              <Label htmlFor="include-docs">Include architecture documentation</Label>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleGenerateBundle} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                Generate Bundle
              </Button>
              <Button variant="outline" onClick={handleCopyToClipboard} disabled={!lastBundle}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Markdown
              </Button>
            </div>

            {lastBundle && (
              <Alert>
                <AlertTitle>Bundle Ready</AlertTitle>
                <AlertDescription>
                  Generated {formatBytes(lastBundle.bundleSize)} bundle with {lastBundle.fileCount} sections.
                  {lastBundle.googleDriveUrl && (
                    <>
                      <br />
                      <a href={lastBundle.googleDriveUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        View on Google Drive
                      </a>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextManagement;