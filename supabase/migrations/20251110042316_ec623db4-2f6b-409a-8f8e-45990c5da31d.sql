-- Phase 1: Create User Roles Infrastructure
-- Note: app_role enum already exists, skipping creation

-- Create user_roles table following srangam naming convention
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    UNIQUE (user_id, role)
);

-- Add helpful comment
COMMENT ON TABLE public.user_roles IS 'Role-based access control (RBAC) for Srangam admin functions';

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

COMMENT ON FUNCTION public.has_role IS 'Check if user has specific role (bypasses RLS to prevent recursion)';

-- RLS Policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Phase 2: Update srangam_tags RLS Policies
-- Drop existing authenticated policies
DROP POLICY IF EXISTS "Authenticated users can update tags" ON public.srangam_tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.srangam_tags;

-- Create admin-only policies
CREATE POLICY "Only admins can update tags"
ON public.srangam_tags
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert tags"
ON public.srangam_tags
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tags"
ON public.srangam_tags
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));