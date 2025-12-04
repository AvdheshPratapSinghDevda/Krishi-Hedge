-- =====================================================
-- Create Admin Users Table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  admin_id TEXT UNIQUE,
  user_type TEXT DEFAULT 'admin' CHECK (user_type IN ('admin', 'fpo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_admin_id ON public.admin_users(admin_id);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to read/write
CREATE POLICY "Allow service role full access to admin_users" 
ON public.admin_users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create policy to allow admins to read their own data
CREATE POLICY "Allow admins to read their own data" 
ON public.admin_users 
FOR SELECT 
TO authenticated 
USING (email = auth.jwt() ->> 'email');

-- Grant necessary permissions
GRANT ALL ON public.admin_users TO service_role;
GRANT SELECT ON public.admin_users TO authenticated;

COMMENT ON TABLE public.admin_users IS 'Stores admin and FPO user accounts separate from farmers';
COMMENT ON COLUMN public.admin_users.user_type IS 'Either admin or fpo - determines access level';
COMMENT ON COLUMN public.admin_users.admin_id IS 'Optional admin/FPO ID for verification system';
