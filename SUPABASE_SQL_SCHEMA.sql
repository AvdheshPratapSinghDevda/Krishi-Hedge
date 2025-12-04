-- =====================================================
-- Krishi Hedge - Supabase Database Schema
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- 0. DROP EXISTING TABLES (Clean slate)
-- =====================================================
-- WARNING: This will delete all existing data!
-- Comment out these lines if you want to keep existing data

DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- 1. CREATE PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'business')),
  
  -- Common fields
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  kyc_verified BOOLEAN DEFAULT FALSE,
  
  -- Farmer-specific fields
  full_name TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  pincode TEXT,
  land_size NUMERIC,
  primary_crop TEXT,
  farming_experience INTEGER,
  
  -- Business-specific fields
  business_name TEXT,
  gst_number TEXT,
  business_type TEXT,
  company_size TEXT,
  address TEXT,
  city TEXT,
  contact_person TEXT,
  designation TEXT,
  trading_volume NUMERIC,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);


-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- 4. DROP EXISTING POLICIES (if any)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;


-- 5. CREATE RLS POLICIES
-- =====================================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow any authenticated user to insert a profile (needed for signup)
CREATE POLICY "Allow authenticated users to insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- 6. CREATE UPDATE TIMESTAMP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 7. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================
-- OPTIONAL: CONTRACTS TABLE
-- Only run this if you want contracts functionality
-- =====================================================

CREATE TABLE public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_number TEXT UNIQUE,
  commodity TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'quintals',
  strike_price NUMERIC NOT NULL,
  current_price NUMERIC,
  contract_type TEXT CHECK (contract_type IN ('buy', 'sell', 'hedge')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  premium NUMERIC,
  counterparty TEXT,
  profit_loss NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for contracts
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_commodity ON public.contracts(commodity);

-- Enable RLS for contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for contracts
DROP POLICY IF EXISTS "Users can view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can insert own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can update own contracts" ON public.contracts;

-- RLS Policies for contracts
CREATE POLICY "Users can view own contracts"
  ON public.contracts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts"
  ON public.contracts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON public.contracts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for contracts updated_at
DROP TRIGGER IF EXISTS set_contracts_updated_at ON public.contracts;

CREATE TRIGGER set_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================
-- VERIFICATION: Check if tables were created
-- Run this separately to verify
-- =====================================================

-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'contracts');
