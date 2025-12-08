-- Add increment function for potential buyers
CREATE OR REPLACE FUNCTION increment_potential_buyers(contract_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE hedge_contracts
  SET potential_buyers = potential_buyers + 1
  WHERE id = contract_id;
END;
$$ LANGUAGE plpgsql;

-- Update user_type enum to include 'fpo'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'user_type_enum' AND e.enumlabel = 'fpo'
  ) THEN
    ALTER TYPE user_type_enum ADD VALUE 'fpo';
  END IF;
END $$;

-- Alternatively, if the enum doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
    CREATE TYPE user_type_enum AS ENUM ('farmer', 'business', 'fpo');
  END IF;
END $$;

-- Update profiles table check constraint to include 'fpo'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type IN ('farmer', 'business', 'fpo'));

-- Create FPOs table if not exists
CREATE TABLE IF NOT EXISTS fpos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  total_members INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create FPO members table if not exists
CREATE TABLE IF NOT EXISTS fpo_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpo_id UUID NOT NULL REFERENCES fpos(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  membership_type VARCHAR(50),
  join_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fpo_id, farmer_id)
);

-- Create FPO commodity listings table if not exists
CREATE TABLE IF NOT EXISTS fpo_commodity_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpo_id UUID NOT NULL REFERENCES fpos(id) ON DELETE CASCADE,
  commodity_name VARCHAR(100) NOT NULL,
  available_quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'quintal',
  price_per_unit DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for FPO tables
CREATE INDEX IF NOT EXISTS idx_fpos_user_id ON fpos(user_id);
CREATE INDEX IF NOT EXISTS idx_fpo_members_fpo ON fpo_members(fpo_id);
CREATE INDEX IF NOT EXISTS idx_fpo_members_farmer ON fpo_members(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fpo_listings_fpo ON fpo_commodity_listings(fpo_id);

-- RLS for FPO tables
ALTER TABLE fpos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpo_commodity_listings ENABLE ROW LEVEL SECURITY;

-- FPO policies
CREATE POLICY fpos_select ON fpos FOR SELECT USING (true);
CREATE POLICY fpos_insert ON fpos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY fpos_update ON fpos FOR UPDATE USING (auth.uid() = user_id);

-- FPO members policies
CREATE POLICY fpo_members_select ON fpo_members FOR SELECT USING (
  auth.uid() = farmer_id OR 
  fpo_id IN (SELECT id FROM fpos WHERE user_id = auth.uid())
);
CREATE POLICY fpo_members_insert ON fpo_members FOR INSERT WITH CHECK (
  fpo_id IN (SELECT id FROM fpos WHERE user_id = auth.uid())
);

-- FPO listings policies
CREATE POLICY fpo_listings_select ON fpo_commodity_listings FOR SELECT USING (true);
CREATE POLICY fpo_listings_insert ON fpo_commodity_listings FOR INSERT WITH CHECK (
  fpo_id IN (SELECT id FROM fpos WHERE user_id = auth.uid())
);
CREATE POLICY fpo_listings_update ON fpo_commodity_listings FOR UPDATE USING (
  fpo_id IN (SELECT id FROM fpos WHERE user_id = auth.uid())
);

-- Sample FPO data
INSERT INTO fpos (name, registration_number, district, state, is_verified, total_members)
VALUES 
  ('Gujarat Groundnut FPO', 'FPO-GJ-2023-001', 'Junagadh', 'Gujarat', true, 42),
  ('Punjab Wheat Cooperative', 'FPO-PB-2023-002', 'Ludhiana', 'Punjab', true, 58),
  ('Maharashtra Cotton Producers', 'FPO-MH-2023-003', 'Nagpur', 'Maharashtra', true, 35)
ON CONFLICT (registration_number) DO NOTHING;

COMMENT ON TABLE fpos IS 'Farmer Producer Organizations registry';
COMMENT ON TABLE fpo_members IS 'FPO membership tracking';
COMMENT ON TABLE fpo_commodity_listings IS 'Bulk commodity listings by FPOs';
