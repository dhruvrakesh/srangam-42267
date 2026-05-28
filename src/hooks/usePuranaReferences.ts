import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PuranaReference {
  id: string;
  article_id: string;
  purana_name: string;
  purana_category: string | null;
  kanda: string | null;
  adhyaya: string | null;
  shloka_start: number | null;
  shloka_end: number | null;
  reference_text: string | null;
  context_snippet: string | null;
  claim_made: string | null;
  confidence_score: number | null;
  is_primary_source: boolean | null;
  validation_status: string | null;
  validation_notes: string | null;
  extraction_method: string | null;
  created_at: string | null;
  srangam_articles?: {
    slug: string;
    title: any;
  };
}

export interface PuranaStatistics {
  purana_name: string;
  purana_category: string;
  citation_count: number;
  avg_confidence: number;
  article_count: number;
}

export const usePuranaReferences = (filters?: {
  article_id?: string;
  purana_name?: string;
  min_confidence?: number;
  validation_status?: string;
}) => {
  return useQuery({
    queryKey: ['purana-references', filters],
    queryFn: async () => {
      let query = supabase
        .from('srangam_purana_references')
        .select(`
          *,
          srangam_articles!inner(slug, title)
        `)
        .order('confidence_score', { ascending: false });

      if (filters?.article_id) query = query.eq('article_id', filters.article_id);
      if (filters?.purana_name) query = query.eq('purana_name', filters.purana_name);
      if (filters?.min_confidence !== undefined) query = query.gte('confidence_score', filters.min_confidence);
      if (filters?.validation_status) query = query.eq('validation_status', filters.validation_status);

      const { data, error } = await query;
      if (error) throw error;
      return data as PuranaReference[];
    },
  });
};

export const usePuranaStats = () => {
  return useQuery({
    queryKey: ['purana-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_purana_statistics');
      if (error) throw error;
      return data as PuranaStatistics[];
    },
  });
};

export const useUpdateReference = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PuranaReference> }) => {
      const { data, error } = await supabase
        .from('srangam_purana_references')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purana-references'] });
      queryClient.invalidateQueries({ queryKey: ['purana-stats'] });
      toast.success('Reference updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update reference: ${error.message}`);
    },
  });
};

export const useDeleteReference = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('srangam_purana_references')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purana-references'] });
      queryClient.invalidateQueries({ queryKey: ['purana-stats'] });
      toast.success('Reference deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete reference: ${error.message}`);
    },
  });
};

export const useExtractReferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { article_id?: string; batch_mode: boolean }) => {
      // ---- Single article: synchronous, unchanged ----------------------
      if (!args.batch_mode) {
        const { data, error } = await supabase.functions.invoke('extract-purana-references', {
          body: { article_id: args.article_id, batch_mode: false },
        });
        if (error) throw error;
        return { mode: 'single' as const, ...data };
      }

      // ---- Batch: create the job row first, then kick chunk 0. The edge
      // function self-pumps via EdgeRuntime.waitUntil for all remaining
      // chunks, so closing the tab no longer stalls extraction. ---------
      const { count } = await supabase
        .from('srangam_articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');
      const total = count ?? 0;
      if (total === 0) throw new Error('No published articles to extract from');

      const { data: { user } } = await supabase.auth.getUser();
      const { data: jobRow, error: jobErr } = await supabase
        .from('srangam_admin_jobs')
        .insert({
          kind: 'purana_extract',
          status: 'running',
          total,
          started_at: new Date().toISOString(),
          created_by: user?.id ?? null,
          params: { chunk_size: 3 },
        })
        .select('id')
        .single();
      if (jobErr || !jobRow) throw jobErr ?? new Error('failed to create job');

      const jobId = jobRow.id as string;

      // Kick off chunk 0 — fire-and-forget; the function returns quickly
      // after scheduling its own next reinvoke.
      const { error: invokeErr } = await supabase.functions.invoke(
        'extract-purana-references',
        { body: { batch_mode: true, job_id: jobId, offset: 0, chunk_size: 3 } },
      );
      if (invokeErr) {
        // Mark the job failed so the watchdog/UI both see it cleanly.
        await supabase
          .from('srangam_admin_jobs')
          .update({
            status: 'failed',
            finished_at: new Date().toISOString(),
            last_error: invokeErr.message,
          })
          .eq('id', jobId);
        throw invokeErr;
      }
      return { mode: 'batch' as const, job_id: jobId, total };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['purana-references'] });
      queryClient.invalidateQueries({ queryKey: ['purana-stats'] });
      if (data?.mode === 'batch') {
        toast.success(`Batch extraction started across ${data.total} articles`);
      } else {
        toast.success(
          `Extraction complete: ${data.total_references ?? 0} references from ${data.processed_articles ?? 1} article(s)`,
        );
      }
    },
    onError: (error: Error) => {
      toast.error(`Extraction failed: ${error.message}`);
    },
  });
};
