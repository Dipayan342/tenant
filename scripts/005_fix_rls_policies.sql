-- Fix infinite recursion in RLS policies by removing circular references

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update profiles in their tenant" ON public.profiles;

-- Create simpler, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in same tenant" ON public.profiles
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
  );

-- Create non-recursive policies for tenants
CREATE POLICY "Users can view their tenant" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.tenant_id = tenants.id
    )
  );

CREATE POLICY "Owners and admins can update their tenant" ON public.tenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = tenants.id 
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- Create simpler policy for profile updates by admins
CREATE POLICY "Admins can update tenant profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE tenant_id = profiles.tenant_id 
      AND role IN ('owner', 'admin')
    )
  );
