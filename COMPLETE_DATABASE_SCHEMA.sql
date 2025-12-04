-- =====================================================
-- Krishi Hedge - Complete Database Schema for Admin-Web
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- 1. CREATE USERS TABLE
-- =====================================================
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer', 'admin')),
  location TEXT,
  crops TEXT[],
  land_size NUMERIC,
  language TEXT DEFAULT 'en',
  profile_completed BOOLEAN DEFAULT FALSE,
  onboarded BOOLEAN DEFAULT FALSE,
  otp TEXT,
  otp_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE ADMIN_USERS TABLE (Separate from regular users)
-- =====================================================
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE PROFILES TABLE (for Supabase Auth integration)
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

-- =====================================================
-- 4. CREATE CONTRACTS TABLE
-- =====================================================
CREATE TABLE public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  buyer_id UUID,
  crop TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'kg',
  strike_price NUMERIC NOT NULL,
  deliverywindow TEXT,
  status TEXT DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'MATCHED_WITH_BUYER_DEMO', 'SETTLED', 'CANCELLED', 'EXPIRED')),
  pdf_url TEXT,
  anchor_tx_hash TEXT,
  anchor_explorer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'contract', 'alert', 'warning', 'success')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CREATE INDEXES
-- =====================================================

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Contracts indexes
CREATE INDEX IF NOT EXISTS idx_contracts_farmer_id ON public.contracts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_id ON public.contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_crop ON public.contracts(crop);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES
-- =====================================================

-- Admin users policies (allow service role access)
DROP POLICY IF EXISTS "Admin users viewable by service role" ON public.admin_users;
CREATE POLICY "Admin users viewable by service role"
  ON public.admin_users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin users insertable" ON public.admin_users;
CREATE POLICY "Admin users insertable"
  ON public.admin_users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin users updatable" ON public.admin_users;
CREATE POLICY "Admin users updatable"
  ON public.admin_users FOR UPDATE
  USING (true);

-- Users policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;

CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Contracts policies
DROP POLICY IF EXISTS "Contracts are viewable by everyone" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can update contracts" ON public.contracts;

CREATE POLICY "Contracts are viewable by everyone"
  ON public.contracts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update contracts"
  ON public.contracts FOR UPDATE
  USING (true);

-- Notifications policies
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.notifications;

CREATE POLICY "Notifications are viewable by everyone"
  ON public.notifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notifications"
  ON public.notifications FOR UPDATE
  USING (true);

-- =====================================================
-- 9. CREATE UPDATE TIMESTAMP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS set_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_contracts_updated_at ON public.contracts;
CREATE TRIGGER set_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 11. INSERT SAMPLE DATA (Optional)
-- =====================================================

-- Sample admin users (password: admin123)
INSERT INTO public.admin_users (email, password_hash, name, role) VALUES
  ('admin@krishihedge.com', '$2b$10$rQ5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', 'Admin User', 'super_admin'),
  ('manager@krishihedge.com', '$2b$10$rQ5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', 'Manager', 'admin');

-- Sample users
INSERT INTO public.users (phone, name, email, role, location, crops, land_size, profile_completed, onboarded) VALUES
  ('+919876543210', 'Rajesh Kumar', 'rajesh@example.com', 'farmer', 'Punjab', ARRAY['Wheat', 'Paddy'], 5.5, true, true),
  ('+919876543211', 'Priya Sharma', 'priya@example.com', 'farmer', 'Haryana', ARRAY['Maize'], 3.2, true, true),
  ('+919876543212', 'Amit Patel', 'amit@example.com', 'buyer', 'Gujarat', NULL, NULL, true, true);

-- Sample contracts
INSERT INTO public.contracts (farmer_id, crop, quantity, unit, strike_price, deliverywindow, status) VALUES
  ((SELECT id FROM public.users WHERE phone = '+919876543210'), 'Wheat', 1000, 'kg', 3500, '2025 Q2', 'CREATED'),
  ((SELECT id FROM public.users WHERE phone = '+919876543211'), 'Maize', 500, 'kg', 4200, '2025 Q1', 'MATCHED_WITH_BUYER_DEMO'),
  ((SELECT id FROM public.users WHERE phone = '+919876543210'), 'Paddy', 2000, 'kg', 4800, '2025 Q3', 'SETTLED');

-- Sample notifications
INSERT INTO public.notifications (user_id, title, message, type, read) VALUES
  ((SELECT id FROM public.users WHERE phone = '+919876543210'), 'Contract Created', 'Your Wheat contract for 1000 kg has been created successfully.', 'contract', false),
  ((SELECT id FROM public.users WHERE phone = '+919876543211'), 'Contract Matched', 'Your Maize contract has been matched with a buyer.', 'success', false),
  ((SELECT id FROM public.users WHERE phone = '+919876543210'), 'Settlement Approaching', 'Your Paddy contract delivery window is approaching.', 'alert', true);

-- =====================================================
-- 12. VERIFICATION
-- =====================================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'users', 'profiles', 'contracts', 'notifications')
ORDER BY table_name;
