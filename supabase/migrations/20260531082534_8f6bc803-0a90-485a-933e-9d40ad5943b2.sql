UPDATE public.srangam_admin_jobs
SET status      = 'succeeded',
    finished_at = now(),
    processed   = COALESCE(total, processed),
    last_error  = COALESCE(last_error, 'unstuck by phase_1_fix_b: pump_reinvoke_404_self_url_bug')
WHERE kind        = 'og_generate'
  AND status      = 'running'
  AND finished_at IS NULL
  AND (heartbeat_at IS NULL OR heartbeat_at < now() - interval '5 minutes');