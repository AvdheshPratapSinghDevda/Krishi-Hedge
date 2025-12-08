-- =====================================================
-- Krishi Hedge - Complete Unified Database Schema
-- This replaces all existing auth tables with a unified approach
-- =====================================================

-- 1. DROP OLD TABLES (Clean slate)
-- =====================================================
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.buyers CASCADE;
DROP TABLE IF EXISTS public.fpos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- 2. CREATE UNIFIED PROFILES TABLE
-- =====================================================
-- Single table for ALL user types: farmer, buyer, fpo, admin
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- User role/type
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'buyer', 'fpo', 'admin')),
  
  -- Common fields
  email TEXT,
  phone TEXT,
  full_name TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  kyc_verified BOOLEAN DEFAULT FALSE,
  onboarded BOOLEAN DEFAULT FALSE,
  
  -- Farmer-specific fields
  state TEXT,
  district TEXT,
  village TEXT,
  pincode TEXT,
  land_size NUMERIC,
  primary_crop TEXT,
  farming_experience INTEGER,
  
  -- Buyer-specific fields
  organization_name TEXT,
  buyer_type TEXT CHECK (buyer_type IN ('wholesaler', 'retailer', 'processor', 'exporter', 'other') OR buyer_type IS NULL),
  gst_number TEXT,
  business_address TEXT,
  city TEXT,
  trading_volume NUMERIC,
  
  -- FPO-specific fields
  fpo_name TEXT,
  fpo_registration_number TEXT,
  fpo_district TEXT,
  fpo_state TEXT,
  member_count INTEGER,
  
  -- Admin-specific fields
  admin_role TEXT CHECK (admin_role IN ('super_admin', 'moderator', 'support') OR admin_role IS NULL),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 3. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_onboarded ON public.profiles(onboarded);

-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. DROP EXISTING POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 6. CREATE RLS POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 7. CREATE TRIGGER FUNCTIONS
-- =====================================================

-- Update timestamp on profile changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_type, 
    email, 
    phone,
    full_name,
    email_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'farmer'),
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. INSERT DEMO DATA (OPTIONAL)
-- =====================================================

-- You can manually insert test users after running this schema
-- Example:
-- INSERT INTO auth.users (id, email, phone, raw_user_meta_data)
-- VALUES (
--   gen_random_uuid(),
--   'farmer@test.com',
--   '+919876543210',
--   '{"user_type": "farmer", "full_name": "Test Farmer"}'::jsonb
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify setup:

-- Check if profiles table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'profiles';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Count profiles by type
-- SELECT user_type, COUNT(*) FROM public.profiles GROUP BY user_type;
