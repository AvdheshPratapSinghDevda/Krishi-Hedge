-- Run this in Supabase SQL Editor to verify your setup

-- 1. Check if RLS is enabled or disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
-- rowsecurity should be FALSE if you disabled RLS

-- 2. Check existing policies (should be empty if RLS is disabled)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Count existing profiles
SELECT COUNT(*) as total_profiles, user_type
FROM public.profiles
GROUP BY user_type;

-- 5. See recent profiles (if any)
SELECT id, user_type, email, full_name, business_name, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
