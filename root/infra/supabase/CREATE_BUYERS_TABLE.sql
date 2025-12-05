-- =====================================================
-- Krishi Hedge - Buyers Table (Separate from Farmers)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing buyers table if exists
DROP TABLE IF EXISTS public.buyers CASCADE;

-- =====================================================
-- CREATE BUYERS TABLE
-- =====================================================
CREATE TABLE public.buyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  organization_name TEXT,
  buyer_type TEXT CHECK (buyer_type IN ('Institutional', 'Retail Chain', 'Mandi Agent', 'Exporter', 'Other')),
  location TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  interested_crops TEXT[],
  volume_band TEXT,
  gst_number TEXT,
  
  -- Authentication
  otp TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Profile status
  profile_completed BOOLEAN DEFAULT FALSE,
  onboarded BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_buyers_phone ON public.buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON public.buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_created_at ON public.buyers(created_at);
CREATE INDEX IF NOT EXISTS idx_buyers_buyer_type ON public.buyers(buyer_type);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Buyers are viewable by everyone
DROP POLICY IF EXISTS "Buyers are viewable by everyone" ON public.buyers;
CREATE POLICY "Buyers are viewable by everyone"
  ON public.buyers FOR SELECT
  USING (true);

-- Buyers can update own record
DROP POLICY IF EXISTS "Buyers can update own record" ON public.buyers;
CREATE POLICY "Buyers can update own record"
  ON public.buyers FOR UPDATE
  USING (true);

-- Anyone can insert buyers
DROP POLICY IF EXISTS "Anyone can insert buyers" ON public.buyers;
CREATE POLICY "Anyone can insert buyers"
  ON public.buyers FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_buyers_updated_at ON public.buyers;
CREATE TRIGGER update_buyers_updated_at
    BEFORE UPDATE ON public.buyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.buyers TO authenticated;
GRANT ALL ON public.buyers TO anon;
GRANT ALL ON public.buyers TO service_role;
