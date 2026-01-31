import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUniqueAuthors } from "@/hooks/useUniqueAuthors";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Users } from "lucide-react";

interface BulkAuthorUpdateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkAuthorUpdate({ open, onOpenChange }: BulkAuthorUpdateProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: authors = [], isLoading: authorsLoading } = useUniqueAuthors();
  
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [targetAuthor, setTargetAuthor] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSourceToggle = (authorName: string) => {
    setSelectedSources(prev => 
      prev.includes(authorName)
        ? prev.filter(a => a !== authorName)
        : [...prev, authorName]
    );
  };

  const affectedCount = authors
    .filter(a => selectedSources.includes(a.name))
    .reduce((sum, a) => sum + a.count, 0);

  const handlePreview = () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one author to merge",
        variant: "destructive",
      });
      return;
    }
    if (!targetAuthor) {
      toast({
        title: "No target selected",
        description: "Please select the target author name",
        variant: "destructive",
      });
      return;
    }
    if (selectedSources.includes(targetAuthor)) {
      toast({
        title: "Invalid selection",
        description: "Target author cannot be in the source list",
        variant: "destructive",
      });
      return;
    }
    setPreviewMode(true);
  };

  const handleApplyMerge = async () => {
    setIsUpdating(true);
    try {
      const { error, count } = await supabase
        .from('srangam_articles')
        .update({ 
          author: targetAuthor,
          updated_at: new Date().toISOString(),
        })
        .in('author', selectedSources);

      if (error) throw error;

      toast({
        title: "Authors merged",
        description: `Updated ${count || affectedCount} articles to "${targetAuthor}"`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['unique-authors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });

      // Reset and close
      setSelectedSources([]);
      setTargetAuthor("");
      setPreviewMode(false);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Merge error:', err);
      toast({
        title: "Merge failed",
        description: err.message || "Failed to update author names",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedSources([]);
    setTargetAuthor("");
    setPreviewMode(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Normalize Author Names
          </DialogTitle>
          <DialogDescription>
            Merge multiple author name variants into a single canonical name.
          </DialogDescription>
        </DialogHeader>

        {authorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : previewMode ? (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will update <strong>{affectedCount} articles</strong> from:
                <ul className="list-disc list-inside mt-2">
                  {selectedSources.map(s => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <div className="mt-2">
                  To: <strong>{targetAuthor}</strong>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Source Authors */}
            <div className="space-y-3">
              <Label>Select authors to merge:</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {authors.map((author) => (
                  <div key={author.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={author.name}
                      checked={selectedSources.includes(author.name)}
                      onCheckedChange={() => handleSourceToggle(author.name)}
                      disabled={author.name === targetAuthor}
                    />
                    <label
                      htmlFor={author.name}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {author.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({author.count} article{author.count !== 1 ? 's' : ''})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Author */}
            <div className="space-y-2">
              <Label>Merge into:</Label>
              <Select value={targetAuthor} onValueChange={setTargetAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target author" />
                </SelectTrigger>
                <SelectContent>
                  {authors
                    .filter(a => !selectedSources.includes(a.name))
                    .map((author) => (
                      <SelectItem key={author.name} value={author.name}>
                        {author.name} ({author.count})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSources.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {affectedCount} article{affectedCount !== 1 ? 's' : ''} will be updated
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          {previewMode ? (
            <>
              <Button variant="outline" onClick={() => setPreviewMode(false)} disabled={isUpdating}>
                Back
              </Button>
              <Button onClick={handleApplyMerge} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  'Apply Merge'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handlePreview} disabled={selectedSources.length === 0 || !targetAuthor}>
              Preview Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
