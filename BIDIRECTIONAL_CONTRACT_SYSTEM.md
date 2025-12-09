# Bidirectional Contract System Implementation

## Overview
Complete implementation of bidirectional contract system where both farmers and buyers can create and accept contracts.

## Current Status

### ✅ ALREADY WORKING
1. **Farmer App**
   - ✅ Create Farmer Offers (sell contracts) - via "Buyer Market" button → `/market`
   - ✅ Browse Buyer Demands - via "Buyer Demands" button → `/farmer/buyer-demands`
   - ✅ Accept Buyer Demands - API: `/api/buyer-demands/[id]/accept`
   - ✅ View My Contracts - via "My Contracts" button → `/farmer/contracts`

2. **Buyer App**
   - ✅ Create Buyer Demands (buy requests) - via "Create Demand" button → `/buyer/create-demand`
   - ✅ View My Contracts - via "My Contracts" button → `/buyer/contracts`

### ❌ MISSING
1. **Buyer App**
   - ❌ Browse Farmer Offers (marketplace to see what farmers are selling)
   - ❌ Accept Farmer Offers (accept a farmer's sell contract)

## Implementation Plan

### Step 1: Update Buyer Home Dashboard
Add "Browse Farmer Offers" button to buyer dashboard (already has "View Marketplace" but needs to be functional)

### Step 2: Create Buyer Marketplace Page
Path: `/buyer/marketplace-offers` or update existing `/buyer/marketplace`
- Show all FARMER_OFFER contracts with status='CREATED'
- Allow filtering by crop, price, quantity
- Each offer clickable to view details and accept

### Step 3: Create Buyer Accept Farmer Offer API
Path: `/api/contracts/[id]/accept`
- Update contract status to 'ACCEPTED'
- Set buyer_id
- Generate IPFS contract PDF
- Send notifications to both parties

### Step 4: Database Requirements
- Run `ADD_COLUMNS_ONLY.sql` to add:
  - `contract_type` (FARMER_OFFER vs BUYER_DEMAND)
  - `ipfs_cid` (for PDF storage)
  - `document_hash` (for verification)
  - `accepted_at` (timestamp)

## Contract Flow Matrix

| Action | Creator | Viewer/Acceptor | Contract Type | Status Flow |
|--------|---------|-----------------|---------------|-------------|
| Farmer creates offer to sell | Farmer | Buyer browses & accepts | FARMER_OFFER | CREATED → ACCEPTED |
| Buyer creates demand to buy | Buyer | Farmer browses & accepts | BUYER_DEMAND | CREATED → ACCEPTED |

## Files to Create/Update

### NEW FILES
1. `/buyer/marketplace-offers/page.tsx` - Browse farmer offers
2. `/buyer/marketplace-offers/[id]/page.tsx` - View & accept specific offer

### UPDATE FILES
1. `/buyer/home/page.tsx` - Ensure "View Marketplace" button works
2. `/api/contracts/[id]/accept/route.ts` - Create if doesn't exist
3. `/api/contracts/route.ts` - Ensure GET filters by contract_type

## Success Criteria
- ✅ Farmer can create sell offers
- ✅ Buyer can see and accept farmer sell offers
- ✅ Buyer can create buy demands
- ✅ Farmer can see and accept buyer buy demands
- ✅ Both parties get IPFS PDF for accepted contracts
- ✅ Both parties can view PDFs in "My Contracts" section
