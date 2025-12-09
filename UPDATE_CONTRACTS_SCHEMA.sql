-- Update contracts table to support buyer demand contracts
-- Run this SQL in your Supabase SQL Editor

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add contract_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contracts' AND column_name='contract_type') THEN
    ALTER TABLE public.contracts ADD COLUMN contract_type TEXT DEFAULT 'FARMER_OFFER' 
      CHECK (contract_type IN ('FARMER_OFFER', 'BUYER_DEMAND'));
  END IF;

  -- Add ipfs_cid column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contracts' AND column_name='ipfs_cid') THEN
    ALTER TABLE public.contracts ADD COLUMN ipfs_cid TEXT;
  END IF;

  -- Add document_hash column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contracts' AND column_name='document_hash') THEN
    ALTER TABLE public.contracts ADD COLUMN document_hash TEXT;
  END IF;

  -- Add accepted_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contracts' AND column_name='accepted_at') THEN
    ALTER TABLE public.contracts ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Update status check constraint to include ACCEPTED
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check 
  CHECK (status IN ('CREATED', 'ACCEPTED', 'MATCHED_WITH_BUYER_DEMO', 'SETTLED', 'CANCELLED', 'EXPIRED'));

-- Create index on contract_type for faster queries
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type ON public.contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_id ON public.contracts(buyer_id);

-- Create a view for active buyer demands (for farmers to browse)
CREATE OR REPLACE VIEW active_buyer_demands AS
SELECT 
  id,
  buyer_id,
  crop,
  quantity,
  unit,
  strike_price,
  deliverywindow,
  status,
  created_at
FROM public.contracts
WHERE contract_type = 'BUYER_DEMAND' 
  AND status = 'CREATED'
ORDER BY created_at DESC;

-- Create a view for active farmer offers (for buyers to browse)
CREATE OR REPLACE VIEW active_farmer_offers AS
SELECT 
  id,
  farmer_id,
  crop,
  quantity,
  unit,
  strike_price,
  deliverywindow,
  status,
  created_at
FROM public.contracts
WHERE contract_type = 'FARMER_OFFER' 
  AND status = 'CREATED'
ORDER BY created_at DESC;

COMMENT ON TABLE public.contracts IS 'Hedging contracts - supports both farmer offers and buyer demands';
COMMENT ON COLUMN public.contracts.contract_type IS 'FARMER_OFFER: Farmer creates contract offering to sell. BUYER_DEMAND: Buyer creates contract requesting to buy.';
COMMENT ON COLUMN public.contracts.ipfs_cid IS 'IPFS Content Identifier for blockchain-stored contract document';
COMMENT ON COLUMN public.contracts.document_hash IS 'SHA-256 hash of contract document for verification';
