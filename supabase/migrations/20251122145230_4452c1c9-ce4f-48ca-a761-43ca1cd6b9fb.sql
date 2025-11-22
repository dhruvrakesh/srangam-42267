-- Create context snapshots table for tracking system state over time
CREATE TABLE srangam_context_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date timestamptz NOT NULL DEFAULT now(),
  
  -- Google Drive Integration
  google_drive_file_id text,
  google_drive_share_url text,
  file_size_bytes bigint,
  document_length integer,
  
  -- System Statistics (captured at snapshot time)
  articles_count integer NOT NULL,
  terms_count integer NOT NULL,
  tags_count integer NOT NULL,
  cross_refs_count integer NOT NULL,
  modules_count integer,
  
  -- Detailed Stats (JSONB for flexibility)
  stats_detail jsonb,
  
  -- AI-Generated Summary
  context_summary text,
  
  -- Change Detection
  changes_from_previous jsonb,
  
  -- Trigger Information
  triggered_by text DEFAULT 'manual',
  triggered_by_user uuid,
  
  -- Status
  status text DEFAULT 'success',
  error_message text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE srangam_context_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all snapshots
CREATE POLICY "Admins can view snapshots"
  ON srangam_context_snapshots
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admins can create snapshots
CREATE POLICY "Admins can create snapshots"
  ON srangam_context_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Indexes for fast retrieval
CREATE INDEX idx_snapshots_date ON srangam_context_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_status ON srangam_context_snapshots(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_context_snapshots_updated_at
  BEFORE UPDATE ON srangam_context_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();