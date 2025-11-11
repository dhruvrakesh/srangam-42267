-- Enable RLS on srangam_articles table
ALTER TABLE public.srangam_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view published articles
CREATE POLICY "Anyone can view articles"
ON public.srangam_articles
FOR SELECT
USING (true);

-- Policy: Only admins can insert articles
CREATE POLICY "Only admins can insert articles"
ON public.srangam_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Only admins can update articles
CREATE POLICY "Only admins can update articles"
ON public.srangam_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Only admins can delete articles
CREATE POLICY "Only admins can delete articles"
ON public.srangam_articles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);