import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Rocket, Image, Tags, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickActionsPanelProps {
  draftCount: number;
  onPublishComplete?: () => void;
}

export function QuickActionsPanel({ draftCount, onPublishComplete }: QuickActionsPanelProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishAllDrafts = async () => {
    setIsPublishing(true);
    try {
      const { data, error } = await supabase
        .from('srangam_articles')
        .update({ 
          status: 'published', 
          updated_at: new Date().toISOString() 
        })
        .eq('status', 'draft')
        .select('id');

      if (error) throw error;

      toast.success(`Published ${data?.length || 0} articles`);
      setShowPublishDialog(false);
      onPublishComplete?.();
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error(`Failed to publish: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common content management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="default"
              className="gap-2"
              disabled={draftCount === 0}
              onClick={() => setShowPublishDialog(true)}
            >
              <Rocket className="h-4 w-4" />
              Publish All Drafts
              {draftCount > 0 && (
                <span className="ml-1 bg-primary-foreground/20 px-2 py-0.5 rounded text-xs">
                  {draftCount}
                </span>
              )}
            </Button>
            
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/admin/data-health">
                <Image className="h-4 w-4" />
                Generate OG Images
              </Link>
            </Button>
            
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/admin/tags">
                <Tags className="h-4 w-4" />
                Manage Tags
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish All Draft Articles?</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish {draftCount} draft article{draftCount !== 1 ? 's' : ''}. 
              They will become visible to all visitors on the site.
              This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublishAllDrafts}
              disabled={isPublishing}
              className="gap-2"
            >
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
