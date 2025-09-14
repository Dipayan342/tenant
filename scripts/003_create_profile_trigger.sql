-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_id_var UUID;
  tenant_slug TEXT;
BEGIN
  -- Extract tenant info from metadata or create default
  tenant_slug := COALESCE(NEW.raw_user_meta_data ->> 'tenant_slug', 'tenant-' || SUBSTRING(NEW.id::text FROM 1 FOR 8));
  
  -- Create or get tenant
  INSERT INTO public.tenants (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'tenant_name', 'My Organization'),
    tenant_slug
  )
  ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
  RETURNING id INTO tenant_id_var;
  
  -- If tenant already exists, get its ID
  IF tenant_id_var IS NULL THEN
    SELECT id INTO tenant_id_var FROM public.tenants WHERE slug = tenant_slug;
  END IF;
  
  -- Create user profile
  INSERT INTO public.profiles (id, tenant_id, email, role, subscription_plan)
  VALUES (
    NEW.id,
    tenant_id_var,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner'),
    COALESCE(NEW.raw_user_meta_data ->> 'subscription_plan', 'free')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
