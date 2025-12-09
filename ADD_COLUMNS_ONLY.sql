-- ============================================================================
-- MINIMAL SAFE MIGRATION: Add Only the Missing Columns
-- ============================================================================
-- This script ONLY adds the 4 new columns needed for buyer-demand feature.
-- Does NOT touch any constraints or existing data.
-- ============================================================================

-- Add contract_type column (defaults to FARMER_OFFER for existing rows)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'FARMER_OFFER';

-- Add IPFS content identifier for blockchain storage
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS ipfs_cid TEXT;

-- Add document hash for verification
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS document_hash TEXT;

-- Add timestamp when contract was accepted
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type 
ON public.contracts(contract_type);

CREATE INDEX IF NOT EXISTS idx_contracts_type_status 
ON public.contracts(contract_type, status);

-- ============================================================================
-- Verify the columns were added:
-- ============================================================================
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'contracts'
  AND column_name IN ('contract_type', 'ipfs_cid', 'document_hash', 'accepted_at')
ORDER BY column_name;

-- ============================================================================
-- DONE! The 4 new columns are ready.
-- ============================================================================
