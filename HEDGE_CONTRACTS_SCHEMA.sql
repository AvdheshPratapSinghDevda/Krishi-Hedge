-- Hedge Contracts Table
CREATE TABLE IF NOT EXISTS hedge_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fpo_id UUID REFERENCES fpos(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contract Details
  commodity VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL, -- in quintals
  hedge_type VARCHAR(20) NOT NULL CHECK (hedge_type IN ('price_floor', 'price_ceiling', 'fixed_price')),
  
  -- Pricing
  strike_price DECIMAL(10, 2) NOT NULL, -- ₹ per quintal
  current_market_price DECIMAL(10, 2) NOT NULL,
  premium DECIMAL(10, 2) NOT NULL, -- upfront cost
  settlement_price DECIMAL(10, 2), -- final price at expiry
  
  -- Dates
  contract_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  matched_date TIMESTAMPTZ,
  settlement_date TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'executed', 'expired', 'cancelled')),
  
  -- Additional Info
  notes TEXT,
  potential_buyers INTEGER DEFAULT 0,
  ipfs_hash VARCHAR(100), -- for blockchain verification
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hedge_contracts_farmer ON hedge_contracts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_hedge_contracts_fpo ON hedge_contracts(fpo_id);
CREATE INDEX IF NOT EXISTS idx_hedge_contracts_buyer ON hedge_contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_hedge_contracts_status ON hedge_contracts(status);
CREATE INDEX IF NOT EXISTS idx_hedge_contracts_commodity ON hedge_contracts(commodity);
CREATE INDEX IF NOT EXISTS idx_hedge_contracts_expiry ON hedge_contracts(expiry_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_hedge_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hedge_contracts_updated_at
  BEFORE UPDATE ON hedge_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_hedge_contracts_updated_at();

-- Contract Matches Table (for buyer interest)
CREATE TABLE IF NOT EXISTS hedge_contract_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES hedge_contracts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Match Details
  offered_price DECIMAL(10, 2), -- buyer's counter-offer
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(contract_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_hedge_matches_contract ON hedge_contract_matches(contract_id);
CREATE INDEX IF NOT EXISTS idx_hedge_matches_buyer ON hedge_contract_matches(buyer_id);

-- RLS Policies
ALTER TABLE hedge_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hedge_contract_matches ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own contracts and all open contracts
CREATE POLICY hedge_contracts_farmers_select ON hedge_contracts
  FOR SELECT
  USING (
    auth.uid() = farmer_id 
    OR status = 'open'
    OR auth.uid() IN (SELECT farmer_id FROM fpo_members WHERE fpo_id = hedge_contracts.fpo_id)
  );

-- Buyers can view all open contracts and contracts they've matched with
CREATE POLICY hedge_contracts_buyers_select ON hedge_contracts
  FOR SELECT
  USING (
    status = 'open'
    OR auth.uid() = buyer_id
    OR auth.uid() IN (SELECT buyer_id FROM hedge_contract_matches WHERE contract_id = hedge_contracts.id)
  );

-- Farmers can create their own contracts
CREATE POLICY hedge_contracts_farmers_insert ON hedge_contracts
  FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

-- Farmers can update their own unmatched contracts
CREATE POLICY hedge_contracts_farmers_update ON hedge_contracts
  FOR UPDATE
  USING (auth.uid() = farmer_id AND status IN ('open', 'cancelled'));

-- Buyers can view matches
CREATE POLICY hedge_matches_buyers_select ON hedge_contract_matches
  FOR SELECT
  USING (auth.uid() = buyer_id);

-- Buyers can create match requests
CREATE POLICY hedge_matches_buyers_insert ON hedge_contract_matches
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own matches
CREATE POLICY hedge_matches_buyers_update ON hedge_contract_matches
  FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Sample data
INSERT INTO hedge_contracts (
  farmer_id,
  fpo_id,
  commodity,
  quantity,
  hedge_type,
  strike_price,
  current_market_price,
  premium,
  contract_date,
  expiry_date,
  status,
  potential_buyers
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    NULL,
    'Wheat',
    100,
    'price_floor',
    2400,
    2350,
    7200,
    NOW(),
    NOW() + INTERVAL '3 months',
    'open',
    5
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    NULL,
    'Soybean',
    75,
    'fixed_price',
    4500,
    4200,
    10125,
    NOW(),
    NOW() + INTERVAL '2 months',
    'open',
    12
  );

COMMENT ON TABLE hedge_contracts IS 'Stores farmer hedge contracts for price protection';
COMMENT ON TABLE hedge_contract_matches IS 'Tracks buyer interest and matches for hedge contracts';
