-- Seed demo data for testing (optional)

-- Insert demo tenant
INSERT INTO public.tenants (id, name, slug) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization', 'demo-org')
ON CONFLICT (slug) DO NOTHING;

-- Note: User profiles will be created automatically via the trigger when users sign up
-- Demo notes can be created through the UI after user registration
