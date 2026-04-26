-- Phase H.4 — Durable admin job tracker for long-running operations
CREATE TABLE IF NOT EXISTS public.srangam_admin_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL CHECK (kind IN ('pin_backfill','og_generate','og_force')),
  status      text NOT NULL DEFAULT 'queued'
              CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
  total       integer NOT NULL DEFAULT 0,
  processed   integer NOT NULL DEFAULT 0,
  succeeded   integer NOT NULL DEFAULT 0,
  failed      integer NOT NULL DEFAULT 0,
  cost_usd    numeric(10,6) NOT NULL DEFAULT 0,
  last_item   text,
  last_error  text,
  params      jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at  timestamptz,
  finished_at timestamptz,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS srangam_admin_jobs_kind_status_idx
  ON public.srangam_admin_jobs (kind, status, created_at DESC);

-- Auto-touch updated_at
CREATE OR REPLACE FUNCTION public.srangam_admin_jobs_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS srangam_admin_jobs_touch_trg ON public.srangam_admin_jobs;
CREATE TRIGGER srangam_admin_jobs_touch_trg
  BEFORE UPDATE ON public.srangam_admin_jobs
  FOR EACH ROW EXECUTE FUNCTION public.srangam_admin_jobs_touch();

-- RLS: admin-only
ALTER TABLE public.srangam_admin_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage admin jobs" ON public.srangam_admin_jobs;
CREATE POLICY "Admins manage admin jobs"
  ON public.srangam_admin_jobs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Realtime publication for live progress
ALTER TABLE public.srangam_admin_jobs REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'srangam_admin_jobs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.srangam_admin_jobs';
  END IF;
END$$;