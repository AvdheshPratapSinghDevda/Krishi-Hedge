-- =====================================================
-- QUICK FIX FOR RLS POLICY ERROR
-- Run this in Supabase SQL Editor to fix the signup issue
-- =====================================================

-- Step 1: Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Step 2: Temporarily disable RLS to test (REMOVE THIS AFTER TESTING!)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create a permissive INSERT policy for testing
-- This allows ANY authenticated user to insert a profile with their own ID
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id);

-- Step 4: Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile';

-- =====================================================
-- ALTERNATIVE: If above doesn't work, try this
-- =====================================================

-- Option A: Disable RLS temporarily for testing (NOT RECOMMENDED FOR PRODUCTION!)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Option B: Create a more permissive policy (TEMPORARY - FOR DEBUGGING ONLY!)
-- DROP POLICY IF EXISTS "Allow all inserts for testing" ON public.profiles;
-- CREATE POLICY "Allow all inserts for testing"
--   ON public.profiles
--   FOR INSERT
--   WITH CHECK (true);

-- =====================================================
-- AFTER SIGNUP WORKS, run this to re-enable proper security:
-- =====================================================

-- DROP POLICY IF EXISTS "Allow all inserts for testing" ON public.profiles;
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can insert own profile"
--   ON public.profiles
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = id);
