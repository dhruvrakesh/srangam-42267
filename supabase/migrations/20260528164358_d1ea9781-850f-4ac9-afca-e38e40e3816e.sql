-- Phase X.5.1: extend srangam_admin_jobs.kind check to include 'purana_extract'.
ALTER TABLE public.srangam_admin_jobs
  DROP CONSTRAINT IF EXISTS srangam_admin_jobs_kind_check;

ALTER TABLE public.srangam_admin_jobs
  ADD CONSTRAINT srangam_admin_jobs_kind_check
  CHECK (kind IN ('pin_backfill','og_generate','og_force','purana_extract'));