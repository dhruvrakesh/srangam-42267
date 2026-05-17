-- Phase M.2: Remove direct self-select on user_roles.
-- All client role checks now go through public.has_role() SECURITY DEFINER RPC,
-- which returns only a boolean and eliminates the role-enumeration surface.
-- The "Admins can view all roles" policy is preserved for Admin Dashboard UX.
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;