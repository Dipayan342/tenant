-- Completely eliminate all cross-table references in RLS policies
-- This approach uses only direct auth.uid() comparisons to prevent any recursion

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "notes_select" ON public.notes;
DROP POLICY IF EXISTS "notes_insert" ON public.notes;
DROP POLICY IF EXISTS "notes_update" ON public.notes;
DROP POLICY IF EXISTS "notes_delete" ON public.notes;

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- PROFILES: Only allow users to see their own profile
-- This is the most critical - no cross-table references at all
CREATE POLICY "profiles_own_only" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- TENANTS: Allow access based on direct user_id comparison
-- We'll store the user_id directly in tenants table for this to work
CREATE POLICY "tenants_by_user" ON public.tenants
  FOR ALL USING (
    -- Allow if user is the owner
    owner_id = auth.uid()
    OR
    -- Allow if user is a member (we'll need to check this differently)
    id = ANY(
      SELECT unnest(member_ids) FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- NOTES: Allow access based on direct ownership
-- We'll add user_id to notes table to make this work without cross-table queries
CREATE POLICY "notes_by_user" ON public.notes
  FOR ALL USING (
    -- Allow if user owns the note directly
    user_id = auth.uid()
  );

-- Add user_id column to notes table if it doesn't exist
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add member_ids array to tenants table if it doesn't exist
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS member_ids UUID[] DEFAULT '{}';

-- Update existing data to populate the new columns
-- Set user_id for notes based on current tenant membership
UPDATE public.notes 
SET user_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.tenant_id = notes.tenant_id 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Set owner_id for tenants based on current profiles
UPDATE public.tenants 
SET owner_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.tenant_id = tenants.id 
  AND p.role = 'admin'
  LIMIT 1
)
WHERE owner_id IS NULL;
