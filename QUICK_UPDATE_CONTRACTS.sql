-- Quick update for contracts table
-- Copy and paste this entire script into Supabase SQL Editor and click Run

-- Add contract_type column
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'FARMER_OFFER' 
CHECK (contract_type IN ('FARMER_OFFER', 'BUYER_DEMAND'));

-- Add ipfs_cid column
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS ipfs_cid TEXT;

-- Add document_hash column
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS document_hash TEXT;

-- Add accepted_at column
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Update existing contracts to have contract_type
UPDATE public.contracts 
SET contract_type = 'FARMER_OFFER' 
WHERE contract_type IS NULL;

-- Drop old status constraint if exists
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Add new status constraint with ACCEPTED
ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('CREATED', 'ACCEPTED', 'MATCHED_WITH_BUYER_DEMO', 'SETTLED', 'CANCELLED', 'EXPIRED'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type ON public.contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_id ON public.contracts(buyer_id);

-- Success message
SELECT 'Database schema updated successfully! ✅' as message;
