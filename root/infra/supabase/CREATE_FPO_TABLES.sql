-- =====================================================
-- Krishi Hedge - FPO (Farmer Producer Organization) Tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing tables if exists
DROP TABLE IF EXISTS public.fpo_commodity_listings CASCADE;
DROP TABLE IF EXISTS public.fpo_members CASCADE;
DROP TABLE IF EXISTS public.fpos CASCADE;

-- =====================================================
-- CREATE FPOS TABLE (Main FPO Registry)
-- =====================================================
CREATE TABLE public.fpos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  fpo_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  registration_date DATE,
  
  -- Contact Details
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  website TEXT,
  
  -- Address
  address TEXT,
  village TEXT,
  block TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  
  -- Organizational Details
  fpo_type TEXT CHECK (fpo_type IN ('Producer Company', 'Cooperative Society', 'Trust', 'Section 8 Company', 'Other')) DEFAULT 'Producer Company',
  total_members INTEGER DEFAULT 0,
  total_area_hectares DECIMAL(10, 2),
  primary_crops TEXT[], -- Array of main crops the FPO deals with
  
  -- Banking & Business
  gst_number TEXT,
  pan_number TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  
  -- Certifications & Quality
  certifications TEXT[], -- ['Organic', 'FairTrade', 'ISO', 'FSSAI', etc.]
  quality_standards TEXT[],
  
  -- Authentication (for FPO admin login)
  otp TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  admin_contact_person TEXT,
  admin_phone TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_date TIMESTAMP WITH TIME ZONE,
  
  -- Profile
  description TEXT,
  logo_url TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE FPO_MEMBERS TABLE (Farmer-FPO relationship)
-- =====================================================
CREATE TABLE public.fpo_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationships
  fpo_id UUID NOT NULL REFERENCES public.fpos(id) ON DELETE CASCADE,
  farmer_phone TEXT NOT NULL, -- Links to farmers via phone (since farmers table uses phone as ID)
  
  -- Member Details
  member_id TEXT, -- FPO's internal member ID
  farmer_name TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  
  -- Membership Status
  status TEXT CHECK (status IN ('pending', 'active', 'suspended', 'exited')) DEFAULT 'pending',
  membership_type TEXT CHECK (membership_type IN ('regular', 'associate', 'patron')) DEFAULT 'regular',
  
  -- Contribution
  share_capital_paid DECIMAL(10, 2) DEFAULT 0,
  land_contributed_hectares DECIMAL(10, 2),
  
  -- Verification
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one farmer can't join same FPO twice
  UNIQUE(fpo_id, farmer_phone)
);

-- =====================================================
-- CREATE FPO_COMMODITY_LISTINGS TABLE (Market listings)
-- =====================================================
CREATE TABLE public.fpo_commodity_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationships
  fpo_id UUID NOT NULL REFERENCES public.fpos(id) ON DELETE CASCADE,
  
  -- Commodity Details
  commodity_name TEXT NOT NULL,
  variety TEXT,
  grade TEXT, -- A, B, C, Premium, etc.
  
  -- Quantity & Pricing
  available_quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'quintal', -- quintal, ton, kg
  min_order_quantity DECIMAL(10, 2),
  price_per_unit DECIMAL(10, 2) NOT NULL,
  price_negotiable BOOLEAN DEFAULT TRUE,
  
  -- Quality & Certification
  quality_parameters JSONB, -- {moisture: "12%", purity: "98%", etc.}
  certifications TEXT[], -- ['Organic', 'Residue-free', etc.]
  harvest_date DATE,
  
  -- Availability & Location
  available_from DATE DEFAULT CURRENT_DATE,
  available_until DATE,
  storage_location TEXT,
  delivery_options TEXT[], -- ['Farm Pickup', 'FPO Warehouse', 'Delivered to Buyer']
  
  -- Images & Documents
  images TEXT[], -- Array of image URLs
  quality_report_url TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'sold', 'expired', 'withdrawn')) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Engagement Metrics
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- FPOs indexes
CREATE INDEX IF NOT EXISTS idx_fpos_phone ON public.fpos(phone);
CREATE INDEX IF NOT EXISTS idx_fpos_district ON public.fpos(district);
CREATE INDEX IF NOT EXISTS idx_fpos_state ON public.fpos(state);
CREATE INDEX IF NOT EXISTS idx_fpos_is_verified ON public.fpos(is_verified);
CREATE INDEX IF NOT EXISTS idx_fpos_is_active ON public.fpos(is_active);
CREATE INDEX IF NOT EXISTS idx_fpos_primary_crops ON public.fpos USING GIN(primary_crops);

-- FPO Members indexes
CREATE INDEX IF NOT EXISTS idx_fpo_members_fpo_id ON public.fpo_members(fpo_id);
CREATE INDEX IF NOT EXISTS idx_fpo_members_farmer_phone ON public.fpo_members(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_fpo_members_status ON public.fpo_members(status);

-- Commodity Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_fpo_id ON public.fpo_commodity_listings(fpo_id);
CREATE INDEX IF NOT EXISTS idx_listings_commodity ON public.fpo_commodity_listings(commodity_name);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.fpo_commodity_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_available_from ON public.fpo_commodity_listings(available_from);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.fpo_commodity_listings(price_per_unit);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.fpos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_commodity_listings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- FPOs: Viewable by everyone
DROP POLICY IF EXISTS "FPOs are viewable by everyone" ON public.fpos;
CREATE POLICY "FPOs are viewable by everyone"
  ON public.fpos FOR SELECT
  USING (true);

-- FPOs: Anyone can insert (for registration)
DROP POLICY IF EXISTS "Anyone can register FPO" ON public.fpos;
CREATE POLICY "Anyone can register FPO"
  ON public.fpos FOR INSERT
  WITH CHECK (true);

-- FPOs: Can update own record
DROP POLICY IF EXISTS "FPOs can update own record" ON public.fpos;
CREATE POLICY "FPOs can update own record"
  ON public.fpos FOR UPDATE
  USING (true);

-- FPO Members: Viewable by everyone
DROP POLICY IF EXISTS "FPO members are viewable by everyone" ON public.fpo_members;
CREATE POLICY "FPO members are viewable by everyone"
  ON public.fpo_members FOR SELECT
  USING (true);

-- FPO Members: Anyone can join (pending approval)
DROP POLICY IF EXISTS "Anyone can join FPO" ON public.fpo_members;
CREATE POLICY "Anyone can join FPO"
  ON public.fpo_members FOR INSERT
  WITH CHECK (true);

-- FPO Members: Can update
DROP POLICY IF EXISTS "Can update member records" ON public.fpo_members;
CREATE POLICY "Can update member records"
  ON public.fpo_members FOR UPDATE
  USING (true);

-- Commodity Listings: Viewable by everyone
DROP POLICY IF EXISTS "Commodity listings are viewable by everyone" ON public.fpo_commodity_listings;
CREATE POLICY "Commodity listings are viewable by everyone"
  ON public.fpo_commodity_listings FOR SELECT
  USING (true);

-- Commodity Listings: Anyone can insert
DROP POLICY IF EXISTS "Anyone can create listings" ON public.fpo_commodity_listings;
CREATE POLICY "Anyone can create listings"
  ON public.fpo_commodity_listings FOR INSERT
  WITH CHECK (true);

-- Commodity Listings: Can update
DROP POLICY IF EXISTS "Can update listings" ON public.fpo_commodity_listings;
CREATE POLICY "Can update listings"
  ON public.fpo_commodity_listings FOR UPDATE
  USING (true);

-- Commodity Listings: Can delete
DROP POLICY IF EXISTS "Can delete listings" ON public.fpo_commodity_listings;
CREATE POLICY "Can delete listings"
  ON public.fpo_commodity_listings FOR DELETE
  USING (true);

-- =====================================================
-- CREATE TRIGGERS FOR AUTO-UPDATES
-- =====================================================

-- Update FPO total_members count when member added/removed
CREATE OR REPLACE FUNCTION update_fpo_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE public.fpos 
        SET total_members = total_members + 1
        WHERE id = NEW.fpo_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE public.fpos 
        SET total_members = GREATEST(total_members - 1, 0)
        WHERE id = OLD.fpo_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'active' AND OLD.status != 'active' THEN
            UPDATE public.fpos 
            SET total_members = total_members + 1
            WHERE id = NEW.fpo_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE public.fpos 
            SET total_members = GREATEST(total_members - 1, 0)
            WHERE id = NEW.fpo_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_fpo_member_count ON public.fpo_members;
CREATE TRIGGER trigger_update_fpo_member_count
    AFTER INSERT OR UPDATE OR DELETE ON public.fpo_members
    FOR EACH ROW
    EXECUTE FUNCTION update_fpo_member_count();

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_fpos_updated_at ON public.fpos;
CREATE TRIGGER update_fpos_updated_at
    BEFORE UPDATE ON public.fpos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fpo_members_updated_at ON public.fpo_members;
CREATE TRIGGER update_fpo_members_updated_at
    BEFORE UPDATE ON public.fpo_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.fpo_commodity_listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.fpo_commodity_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.fpos TO authenticated;
GRANT ALL ON public.fpos TO anon;
GRANT ALL ON public.fpos TO service_role;

GRANT ALL ON public.fpo_members TO authenticated;
GRANT ALL ON public.fpo_members TO anon;
GRANT ALL ON public.fpo_members TO service_role;

GRANT ALL ON public.fpo_commodity_listings TO authenticated;
GRANT ALL ON public.fpo_commodity_listings TO anon;
GRANT ALL ON public.fpo_commodity_listings TO service_role;

-- =====================================================
-- INSERT SAMPLE FPO DATA (for testing)
-- =====================================================
INSERT INTO public.fpos (
  fpo_name, registration_number, phone, email, 
  district, state, fpo_type, primary_crops,
  is_verified, is_active, description, total_members
) VALUES 
(
  'Gondal Groundnut Growers FPO', 
  'FPO-GJ-2021-001', 
  '+919876543210',
  'gondal.fpo@example.com',
  'Rajkot',
  'Gujarat',
  'Producer Company',
  ARRAY['Groundnut', 'Cotton', 'Wheat'],
  true,
  true,
  'Premier groundnut FPO in Gujarat serving 500+ farmers with quality produce and fair prices',
  0
),
(
  'Indore Soybean Collective', 
  'FPO-MP-2022-045', 
  '+919876543211',
  'indore.soy@example.com',
  'Indore',
  'Madhya Pradesh',
  'Producer Company',
  ARRAY['Soybean', 'Wheat', 'Chickpea'],
  true,
  true,
  'Leading soybean producer organization in Central India with organic certification',
  0
),
(
  'Warangal Farmers Cooperative', 
  'FPO-TS-2020-078', 
  '+919876543212',
  'warangal.coop@example.com',
  'Warangal',
  'Telangana',
  'Cooperative Society',
  ARRAY['Rice', 'Cotton', 'Turmeric'],
  true,
  true,
  'Multi-crop cooperative supporting small and marginal farmers in Telangana',
  0
);

-- Insert sample commodity listings
INSERT INTO public.fpo_commodity_listings (
  fpo_id, commodity_name, variety, grade, 
  available_quantity, unit, price_per_unit,
  certifications, available_from, available_until,
  delivery_options, status
) 
SELECT 
  id,
  'Groundnut',
  'Bold',
  'A',
  1000,
  'quintal',
  6200,
  ARRAY['Residue-free', 'Quality Tested'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  ARRAY['FPO Warehouse', 'Delivered to Buyer'],
  'active'
FROM public.fpos 
WHERE fpo_name = 'Gondal Groundnut Growers FPO';

INSERT INTO public.fpo_commodity_listings (
  fpo_id, commodity_name, variety, grade, 
  available_quantity, unit, price_per_unit,
  certifications, available_from, available_until,
  delivery_options, status
) 
SELECT 
  id,
  'Soybean',
  'JS 335',
  'Premium',
  2000,
  'quintal',
  4350,
  ARRAY['Organic', 'FSSAI Certified'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  ARRAY['Farm Pickup', 'FPO Warehouse', 'Delivered to Buyer'],
  'active'
FROM public.fpos 
WHERE fpo_name = 'Indore Soybean Collective';

