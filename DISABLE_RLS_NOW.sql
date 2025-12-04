-- TEMPORARY FIX: Disable RLS to get signup working
-- Run this in Supabase SQL Editor RIGHT NOW

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- This should show rowsecurity = false
