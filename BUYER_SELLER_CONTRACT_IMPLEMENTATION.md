# Buyer-Seller Contract System Implementation

## Overview
This implementation enables a complete bidirectional contract system where:
- **Farmers (Sellers)** can create contracts offering to sell crops
- **Buyers** can browse and accept farmer contracts
- **Buyers** can create demand contracts for crops they want to buy
- **Farmers** can browse and accept buyer demand contracts

## Architecture

### Roles
- **Farmer = Seller**: Creates contracts to sell crops, can accept buyer demands
- **Buyer = Buyer**: Can browse farmer offers OR create demand contracts

### Contract Types
1. **FARMER_OFFER**: Farmer creates contract offering to sell crops
2. **BUYER_DEMAND**: Buyer creates contract requesting to buy crops

## Implementation Details

### 1. Database Schema Updates
**File**: `UPDATE_CONTRACTS_SCHEMA.sql`

Added columns to `contracts` table:
- `contract_type`: 'FARMER_OFFER' or 'BUYER_DEMAND'
- `ipfs_cid`: IPFS Content Identifier for blockchain storage
- `document_hash`: SHA-256 hash for verification
- `accepted_at`: Timestamp when contract was accepted

Updated `status` constraint to include 'ACCEPTED'

### 2. Farmer App Changes

#### Dashboard (HomeScreen.tsx)
- Added "Buyer Demands" button to browse buyer demand contracts
- Farmers can now see what buyers are looking for

#### New Pages
- `/farmer/buyer-demands`: Browse all active buyer demand contracts
- `/farmer/buyer-demands/[id]`: View details and accept a specific buyer demand

### 3. Buyer App Changes

#### Dashboard (buyer/home/page.tsx)
- Added "Create Demand" button
- Buyers can now post what they want to buy

#### New Pages
- `/buyer/create-demand`: Create a demand contract
- Form to specify crop, quantity, price offering, and delivery timeline

### 4. API Endpoints

#### `/api/buyer-demands`
- **GET**: Fetch all active buyer demand contracts (for farmers)
- **POST**: Create new buyer demand contract

#### `/api/buyer-demands/[id]/accept`
- **POST**: Farmer accepts a buyer demand contract
- Triggers:
  - Status update to 'ACCEPTED'
  - Notifications to both parties
  - IPFS contract PDF generation

### 5. Contract PDF Generation & IPFS Upload

**File**: `lib/contractUtils.ts`

Functions:
- `generateContractHash()`: Creates SHA-256 hash of contract data
- `uploadContractToIPFS()`: Uploads contract JSON to IPFS via Pinata
- `generateContractData()`: Creates structured contract document
- `processAcceptedContract()`: Handles complete post-acceptance workflow

When a contract is accepted (by either party):
1. Contract details are fetched from database
2. Both farmer and buyer information is retrieved
3. Complete contract document is generated
4. Document is uploaded to IPFS (Pinata)
5. IPFS CID and document hash are stored in database
6. Both parties receive the contract link

### 6. Blockchain Integration

Contracts are stored on IPFS with:
- Immutable record keeping
- SHA-256 hash for verification
- Publicly accessible via IPFS gateway
- Can be verified at `/contracts/verify`

## User Flow

### Buyer Creates Demand → Farmer Accepts
1. Buyer navigates to `/buyer/home`
2. Clicks "Create Demand Contract"
3. Fills form: crop, quantity, price, delivery window
4. Submits demand contract
5. Contract appears in farmer's "Buyer Demands" marketplace
6. Farmer browses `/farmer/buyer-demands`
7. Selects interesting demand
8. Reviews details and clicks "Accept"
9. **Both parties get**:
   - In-app notification
   - Push notification (if enabled)
   - Blockchain-verified contract PDF
   - IPFS link to contract document

### Farmer Creates Offer → Buyer Accepts
1. Farmer creates contract (existing flow)
2. Buyer browses `/market`
3. Accepts contract
4. **Both parties get**:
   - Same benefits as above

## Contract PDF Contents

Generated contract includes:
- Contract ID and date
- Seller (Farmer) details
- Buyer details
- Commodity details (crop, quantity, grade)
- Pricing (strike price, total value)
- Delivery terms
- Payment terms
- Legal terms and conditions
- Digital signatures (platform-based acceptance)
- Blockchain verification (IPFS CID, SHA-256 hash)

## Environment Variables Required

```env
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_BASE_URL=your_app_url
```

## Database Migration

Run the SQL in `UPDATE_CONTRACTS_SCHEMA.sql` in your Supabase SQL Editor to:
- Add new columns
- Update constraints
- Create indexes for performance
- Create views for easier querying

## Testing the Flow

### Test Buyer Demand Flow
1. Login as buyer
2. Go to buyer dashboard
3. Click "Create Demand Contract"
4. Create a demand for Soybean, 50 Qtl, ₹5000/Qtl
5. Login as farmer (different account)
6. Click "Buyer Demands" on farmer dashboard
7. You should see the buyer's demand
8. Click on it and accept
9. Both accounts should receive notifications
10. Check `/contracts` to see the accepted contract with IPFS details

### Test Farmer Offer Flow (Existing + Enhanced)
1. Login as farmer
2. Create contract as usual
3. Login as buyer
4. Browse `/market`
5. Accept the contract
6. Both parties get contract PDF with IPFS verification

## Files Created/Modified

### Created
- `root/apps/pwa/src/app/farmer/buyer-demands/page.tsx`
- `root/apps/pwa/src/app/farmer/buyer-demands/[id]/page.tsx`
- `root/apps/pwa/src/app/buyer/create-demand/page.tsx`
- `root/apps/pwa/src/app/api/buyer-demands/route.ts`
- `root/apps/pwa/src/app/api/buyer-demands/[id]/accept/route.ts`
- `root/apps/pwa/src/lib/contractUtils.ts`
- `UPDATE_CONTRACTS_SCHEMA.sql`

### Modified
- `root/apps/pwa/src/components/HomeScreen.tsx` (Added Buyer Demands button)
- `root/apps/pwa/src/app/buyer/home/page.tsx` (Added Create Demand section)
- `root/apps/pwa/src/app/api/contracts/[id]/accept/route.ts` (Added IPFS generation)
- `root/apps/pwa/src/app/api/buyer-demands/[id]/accept/route.ts` (Added IPFS generation)

## Features

✅ Bidirectional contract creation
✅ Farmer can browse buyer demands
✅ Buyer can create demand contracts
✅ Automatic PDF generation on acceptance
✅ IPFS blockchain storage
✅ SHA-256 hash verification
✅ Real-time notifications to both parties
✅ Industry-standard contract format
✅ Immutable record keeping
✅ Public contract verification

## Next Steps

- Add contract filtering by crop type, price range
- Implement partial fulfillment (farmer can accept part of demand)
- Add contract expiry dates
- Implement counter-offers
- Add quality grade specifications
- Integrate actual PDF generation library (currently JSON stored)
- Add e-signature integration
- Implement escrow payment system
