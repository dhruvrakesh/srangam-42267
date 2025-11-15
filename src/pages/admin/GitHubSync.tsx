import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GitBranch, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  FileText, 
  Clock,
  AlertCircle,
  Play,
  Github
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
  type: string;
}

interface DuplicateMatch {
  github_file: GitHubFile;
  matched_article: any;
  confidence: number;
  method: string;
  reasoning?: string;
}

interface ScanResult {
  new_files: GitHubFile[];
  updated_files: GitHubFile[];
  synced_files: GitHubFile[];
  confirmed_duplicates: DuplicateMatch[];
  potential_duplicates: DuplicateMatch[];
  total_in_github: number;
  total_in_db: number;
  last_scan: string;
}

interface ImportProgress {
  current: number;
  total: number;
  currentFile: string;
  logs: string[];
}

export default function GitHubSync() {
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    currentFile: '',
    logs: []
  });

  // Scan GitHub repository
  const { data: scanResult, isLoading: scanLoading, refetch: refetchScan } = useQuery({
    queryKey: ['github-scan'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('scan-github-markdown');
      if (error) throw error;
      return data as ScanResult;
    },
  });

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await refetchScan();
      toast.success('Repository scanned successfully');
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan repository');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBatchImport = async (files: GitHubFile[], mode: 'new' | 'all') => {
    if (files.length === 0) {
      toast.error('No files to import');
      return;
    }

    setIsImporting(true);
    setImportProgress({
      current: 0,
      total: files.length,
      currentFile: '',
      logs: [`Starting import of ${files.length} files...`]
    });

    try {
      const { data, error } = await supabase.functions.invoke('batch-import-from-github', {
        body: {
          files,
          overwrite_existing: mode === 'all'
        }
      });

      if (error) throw error;

      const successCount = data.succeeded || 0;
      const failedCount = data.failed || 0;

      setImportProgress(prev => ({
        ...prev,
        current: files.length,
        logs: [
          ...prev.logs,
          `✅ Import complete!`,
          `   Success: ${successCount}`,
          `   Failed: ${failedCount}`,
          `   Total: ${files.length}`
        ]
      }));

      if (successCount > 0) {
        toast.success(`Imported ${successCount} articles successfully`);
        await refetchScan();
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} imports failed`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Batch import failed');
      setImportProgress(prev => ({
        ...prev,
        logs: [...prev.logs, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }));
    } finally {
      setIsImporting(false);
    }
  };

  const totalFiles = scanResult?.total_in_github || 0;
  const newFilesCount = scanResult?.new_files.length || 0;
  const updatedFilesCount = scanResult?.updated_files.length || 0;
  const syncedFilesCount = scanResult?.synced_files.length || 0;
  const confirmedDuplicatesCount = scanResult?.confirmed_duplicates.length || 0;
  const potentialDuplicatesCount = scanResult?.potential_duplicates.length || 0;

  const progressPercentage = importProgress.total > 0 
    ? (importProgress.current / importProgress.total) * 100 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GitHub Sync</h1>
          <p className="text-muted-foreground">
            Sync markdown articles from GitHub repository to database
          </p>
        </div>
        <Button 
          onClick={handleScan} 
          disabled={isScanning || scanLoading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${(isScanning || scanLoading) ? 'animate-spin' : ''}`} />
          {isScanning || scanLoading ? 'Scanning...' : 'Scan Repository'}
        </Button>
      </div>

      {/* Sync Status Dashboard */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              In GitHub
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Articles</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newFilesCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready to import
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updated</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updatedFilesCount}</div>
            <p className="text-xs text-muted-foreground">
              Modified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncedFilesCount}</div>
            <p className="text-xs text-muted-foreground">
              Up to date
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {confirmedDuplicatesCount}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              High confidence
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {potentialDuplicatesCount}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Review needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Repository Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Repository Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Repository:</span>
            <a 
              href="https://github.com/dhruvrakesh/srangam-42267" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              dhruvrakesh/srangam-42267
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Branch:</span>
            <Badge variant="outline">main</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Folder:</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">data/</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last scan:</span>
            <span className="text-sm">
              {scanResult?.last_scan 
                ? new Date(scanResult.last_scan).toLocaleString() 
                : 'Never'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Detection Results */}
      {(confirmedDuplicatesCount > 0 || potentialDuplicatesCount > 0) && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Duplicate Detection Results
            </CardTitle>
            <CardDescription>
              AI-powered analysis found {confirmedDuplicatesCount + potentialDuplicatesCount} potential duplicate(s).
              Review before importing to prevent duplicate content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GitHub File</TableHead>
                  <TableHead>Matched Article</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Confirmed Duplicates (High Confidence) */}
                {scanResult?.confirmed_duplicates.map((dup) => (
                  <TableRow key={dup.github_file.path} className="bg-red-50 dark:bg-red-950/30">
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[250px] truncate font-mono text-sm">
                              {dup.github_file.name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[400px]">{dup.github_file.path}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <div className="font-medium truncate">
                          {dup.matched_article.title?.en || dup.matched_article.slug}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Slug: {dup.matched_article.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-red-500 hover:bg-red-600">
                              {dup.confidence.toFixed(0)}% Match
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p className="font-semibold mb-1">AI Analysis:</p>
                            <p className="text-xs">{dup.reasoning || 'High confidence duplicate detected'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {dup.method === 'ai_semantic' ? 'AI Semantic' : 
                         dup.method === 'title' ? 'Title Match' : 
                         dup.method === 'content_hash' ? 'Content Hash' : dup.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        Will Skip on Import
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Potential Duplicates (Medium Confidence) */}
                {scanResult?.potential_duplicates.map((dup) => (
                  <TableRow key={dup.github_file.path} className="bg-orange-50 dark:bg-orange-950/30">
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[250px] truncate font-mono text-sm">
                              {dup.github_file.name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[400px]">{dup.github_file.path}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <div className="font-medium truncate">
                          {dup.matched_article.title?.en || dup.matched_article.slug}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Slug: {dup.matched_article.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-orange-500 hover:bg-orange-600">
                              {dup.confidence.toFixed(0)}% Match
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p className="font-semibold mb-1">Analysis:</p>
                            <p className="text-xs">{dup.reasoning || 'Potential duplicate - review recommended'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {dup.method === 'title' ? 'Title Similarity' : dup.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        Review Recommended
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Duplicate Prevention Active
              </h4>
              <p className="text-sm text-muted-foreground">
                Files with <strong>&gt;90% confidence</strong> will be automatically skipped during batch import to prevent duplicates.
                Files with 60-90% confidence will be imported but flagged for manual review.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Import Controls */}
      {(newFilesCount > 0 || updatedFilesCount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Import</CardTitle>
            <CardDescription>
              Import multiple articles from GitHub in one operation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              {newFilesCount > 0 && (
                <Button
                  onClick={() => handleBatchImport(scanResult?.new_files || [], 'new')}
                  disabled={isImporting}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Import {newFilesCount} New Article{newFilesCount > 1 ? 's' : ''}
                </Button>
              )}
              
              {updatedFilesCount > 0 && (
                <Button
                  onClick={() => handleBatchImport(scanResult?.updated_files || [], 'all')}
                  disabled={isImporting}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-import {updatedFilesCount} Updated Article{updatedFilesCount > 1 ? 's' : ''}
                </Button>
              )}
            </div>

            {/* Progress Display */}
            {isImporting && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing articles...</span>
                    <span className="font-medium">
                      {importProgress.current} / {importProgress.total}
                    </span>
                  </div>
                  <Progress value={progressPercentage} />
                </div>

                {/* Live Logs */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Import Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] w-full">
                      <div className="space-y-1 font-mono text-xs">
                        {importProgress.logs.map((log, idx) => (
                          <div key={idx} className="text-muted-foreground">
                            {log}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files in GitHub Repository</CardTitle>
          <CardDescription>
            Compare GitHub files with imported articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* New Files */}
              {scanResult?.new_files.map((file) => (
                <TableRow key={file.path}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-[300px] truncate font-mono text-sm">
                            {file.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[400px]">{file.path}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      🆕 New
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBatchImport([file], 'new')}
                      disabled={isImporting}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Updated Files */}
              {scanResult?.updated_files.map((file) => (
                <TableRow key={file.path}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-[300px] truncate font-mono text-sm">
                            {file.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[400px]">{file.path}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      🔄 Updated
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBatchImport([file], 'all')}
                      disabled={isImporting}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Synced Files */}
              {scanResult?.synced_files.map((file) => (
                <TableRow key={file.path} className="opacity-60">
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-[300px] truncate font-mono text-sm">
                            {file.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[400px]">{file.path}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                      ✅ Synced
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </TableCell>
                  <TableCell className="text-right">
                    <CheckCircle className="h-4 w-4 text-green-500 inline" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!scanResult && !scanLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Scan Repository" to check for new articles
            </div>
          )}

          {scanLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Scanning repository...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
