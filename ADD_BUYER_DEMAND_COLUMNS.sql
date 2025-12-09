-- ============================================================================
-- SAFE MIGRATION: Add Buyer Demand Contract Columns
-- ============================================================================
-- This script ONLY adds new columns to the contracts table.
-- It does NOT modify or delete any existing data.
-- Safe to run multiple times (uses IF NOT EXISTS checks).
-- ============================================================================

-- Step 1: Add new columns (will skip if they already exist)
-- ----------------------------------------------------------------------------

-- Add contract_type column to distinguish between FARMER_OFFER and BUYER_DEMAND
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

-- Step 2: Update the status constraint to include ACCEPTED status
-- ----------------------------------------------------------------------------

-- First, let's see what status values currently exist in your database
-- (This is just for information - you can see the results)
SELECT DISTINCT status, COUNT(*) as count
FROM public.contracts 
GROUP BY status
ORDER BY status;

-- Drop the old constraint if it exists (we'll add a better one)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'contracts_status_check'
    ) THEN
        ALTER TABLE public.contracts DROP CONSTRAINT contracts_status_check;
    END IF;
END $$;

-- Add the new constraint with ALL possible status values
-- Including ACCEPTED and any other statuses that might exist
ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('CREATED', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'PENDING', 'ACTIVE', 'EXPIRED', 'REJECTED'));

-- Step 3: Create indexes for better query performance
-- ----------------------------------------------------------------------------

-- Index for filtering by contract type
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type 
ON public.contracts(contract_type);

-- Index for filtering by contract type and status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_contracts_type_status 
ON public.contracts(contract_type, status);

-- Index for IPFS lookups
CREATE INDEX IF NOT EXISTS idx_contracts_ipfs_cid 
ON public.contracts(ipfs_cid) 
WHERE ipfs_cid IS NOT NULL;

-- ============================================================================
-- VERIFICATION: Check the results
-- ============================================================================

-- Run this to verify the columns were added successfully:
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'contracts'
  AND column_name IN ('contract_type', 'ipfs_cid', 'document_hash', 'accepted_at')
ORDER BY column_name;

-- ============================================================================
-- COMPLETE! 
-- Your existing data is safe and untouched.
-- New columns are ready for the buyer-demand feature.
-- ============================================================================
