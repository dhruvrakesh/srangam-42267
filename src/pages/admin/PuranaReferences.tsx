import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, RefreshCw, Trash2, Edit, CheckCircle, XCircle, TrendingUp, BarChart3 } from "lucide-react";
import { ConfidenceBadge } from "@/components/admin/purana/ConfidenceBadge";
import { PuranaCategoryBadge } from "@/components/admin/purana/PuranaCategoryBadge";
// Phase X.7.1 — ExtractionProgress legacy bar retired; JobProgressCard owns batch UX.
import { JobProgressCard } from "@/components/admin/JobProgressCard";
import { usePuranaReferences, usePuranaStats, useExtractReferences, useUpdateReference, useDeleteReference } from "@/hooks/usePuranaReferences";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PuranaReferences() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  // Phase X.7.1 — currentArticle state removed with the legacy progress bar.
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Phase X.5 — rehydrate the most-recent running purana_extract job on
  // mount so a tab refresh re-attaches the progress card to a run the
  // server is still pumping. Admin-only RLS already scopes the query.
  useEffect(() => {
    if (activeJobId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('srangam_admin_jobs')
        .select('id')
        .eq('status', 'running')
        .eq('kind', 'purana_extract')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data?.id) setActiveJobId(data.id);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Filters
  const [selectedArticle, setSelectedArticle] = useState<string>("");
  const [selectedPurana, setSelectedPurana] = useState<string>("__all__");
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [validationFilter, setValidationFilter] = useState<string>("__all__");

  // Get published articles for extraction
  const { data: articles } = useQuery({
    queryKey: ['published-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, title')
        .eq('status', 'published')
        .order('slug');
      if (error) throw error;
      return data;
    },
  });

  // Get references with filters
  const { data: references, isLoading: referencesLoading } = usePuranaReferences({
    article_id: selectedArticle || undefined,
    purana_name: selectedPurana === "__all__" ? undefined : selectedPurana,
    min_confidence: minConfidence,
    validation_status: validationFilter === "__all__" ? undefined : validationFilter,
  });

  // Get statistics
  const { data: stats } = usePuranaStats();
  
  // Mutations
  const extractMutation = useExtractReferences();
  const updateMutation = useUpdateReference();
  const deleteMutation = useDeleteReference();

  // Get unique Purana names for filter
  const uniquePuranas = Array.from(new Set(references?.map(r => r.purana_name) || [])).sort();

  const totalReferences = references?.length || 0;
  const highConfidence = references?.filter(r => (r.confidence_score || 0) >= 0.80).length || 0;
  const pendingReview = references?.filter(r => r.validation_status === 'pending').length || 0;
  const articlesProcessed = new Set(references?.map(r => r.article_id) || []).size;

  const handleBatchExtract = async () => {
    setShowBatchDialog(false);
    setIsProcessing(true);
    try {
      const result: any = await extractMutation.mutateAsync({ batch_mode: true });
      if (result?.mode === 'batch' && result.job_id) {
        setActiveJobId(result.job_id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleExtract = async () => {
    if (!selectedArticle) {
      toast.error('Please select an article');
      return;
    }
    
    setIsProcessing(true);
    try {
      await extractMutation.mutateAsync({ 
        article_id: selectedArticle, 
        batch_mode: false 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async (id: string, status: 'verified' | 'rejected') => {
    await updateMutation.mutateAsync({
      id,
      updates: { validation_status: status }
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Puranic Citation Extraction</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered extraction of Puranic, Vedic, and Itihāsa references
          </p>
        </div>
        <BookOpen className="h-8 w-8 text-primary" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {articlesProcessed} processed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total References</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferences}</div>
            <p className="text-xs text-muted-foreground">
              Extracted citations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highConfidence}</div>
            <p className="text-xs text-muted-foreground">
              ≥0.80 confidence score
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting validation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Extraction Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Extraction Controls</CardTitle>
          <CardDescription>
            Extract Puranic references using AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => setShowBatchDialog(true)}
              disabled={isProcessing}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Extract All Published Articles
            </Button>
            
            <div className="flex gap-2 flex-1 max-w-md">
              <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select article..." />
                </SelectTrigger>
                <SelectContent>
                  {articles?.map((article) => {
                    const title = typeof article.title === 'object' && article.title && 'en' in article.title 
                      ? String(article.title.en)
                      : article.slug;
                    return (
                      <SelectItem key={article.id} value={article.id}>
                        {title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleSingleExtract}
                disabled={isProcessing || !selectedArticle}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Extract
              </Button>
            </div>
          </div>

          {activeJobId ? (
            <JobProgressCard jobId={activeJobId} onDismiss={() => setActiveJobId(null)} />
          ) : isProcessing ? (
            // Phase X.7.1 — brief one-tick state between user click and the
            // job row insert returning. Once the insert resolves, the
            // JobProgressCard above takes over with realtime updates. We no
            // longer show a useless "Processing… 0/0" bar that confused
            // operators when the kind_check constraint blocked the insert.
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-1">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Queueing extraction job…</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Purana</label>
              <Select value={selectedPurana} onValueChange={setSelectedPurana}>
                <SelectTrigger>
                  <SelectValue placeholder="All Puranas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Puranas</SelectItem>
                  {uniquePuranas.map((purana) => (
                    <SelectItem key={purana} value={purana}>
                      {purana}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Min Confidence</label>
              <Input 
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Validation Status</label>
              <Select value={validationFilter} onValueChange={setValidationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedArticle("");
                  setSelectedPurana("__all__");
                  setMinConfidence(0);
                  setValidationFilter("__all__");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References Table */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted References ({totalReferences})</CardTitle>
        </CardHeader>
        <CardContent>
          {referencesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading references...</div>
          ) : references && references.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Purana</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Citation</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Claim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {references.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">
                        {ref.srangam_articles?.title?.en || ref.srangam_articles?.slug || 'Unknown'}
                      </TableCell>
                      <TableCell>{ref.purana_name}</TableCell>
                      <TableCell>
                        <PuranaCategoryBadge category={ref.purana_category || 'Other'} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ref.reference_text || '-'}
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge score={ref.confidence_score || 0} />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <p className="truncate text-sm text-muted-foreground">
                                {ref.claim_made || 'No claim recorded'}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p>{ref.claim_made || 'No claim recorded'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          ref.validation_status === 'verified' ? 'default' :
                          ref.validation_status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {ref.validation_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {ref.validation_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleValidate(ref.id, 'verified')}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleValidate(ref.id, 'rejected')}
                                className="h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(ref.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No references found. Start by extracting from published articles.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Extraction Confirmation Dialog */}
      <AlertDialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Extract from All Articles?</AlertDialogTitle>
            <AlertDialogDescription>
              This will process {articles?.length || 0} published articles using AI analysis.
              <br /><br />
              <strong>Estimated cost:</strong> $0.50-1.50 in AI API calls
              <br />
              <strong>Estimated time:</strong> 15-20 minutes
              <br /><br />
              This operation cannot be undone, but extracted references can be reviewed and validated afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchExtract}>
              Start Extraction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reference?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this Puranic reference. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
