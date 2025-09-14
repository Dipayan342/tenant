-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update profiles in their tenant" ON public.profiles;

-- Create non-recursive policies for profiles
-- Users can always view their own profile (no recursion)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can view other profiles in the same tenant (using direct tenant_id comparison)
CREATE POLICY "Users can view tenant profiles" ON public.profiles
  FOR SELECT USING (
    tenant_id = (
      SELECT p.tenant_id 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
      LIMIT 1
    )
  );

-- Simplified tenant policies using auth.uid() directly
CREATE POLICY "Users can view their tenant" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.tenant_id = tenants.id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their tenant" ON public.tenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.tenant_id = tenants.id 
      AND p.id = auth.uid() 
      AND p.role IN ('owner', 'admin')
    )
  );

-- Admin update policy for profiles (non-recursive)
CREATE POLICY "Admins can update tenant profiles" ON public.profiles
  FOR UPDATE USING (
    -- Allow users to update their own profile
    auth.uid() = id
    OR
    -- Allow admins to update profiles in their tenant
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.tenant_id = profiles.tenant_id
      AND admin_profile.role IN ('owner', 'admin')
    )
  );
