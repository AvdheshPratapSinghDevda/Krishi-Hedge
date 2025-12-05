# Buyer Flow Implementation Guide

## Overview

This document describes the complete **separate buyer authentication and flow** implementation for the Krishi Hedge platform. Buyers have their own database table, authentication flow, dashboard, and profile section - completely separate from the farmer flow.

## Database Schema

### Buyers Table

A new `buyers` table has been created in Supabase with the following structure:

```sql
CREATE TABLE public.buyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  organization_name TEXT,
  buyer_type TEXT CHECK (buyer_type IN ('Institutional', 'Retail Chain', 'Mandi Agent', 'Exporter', 'Other')),
  location TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  interested_crops TEXT[],
  volume_band TEXT,
  gst_number TEXT,
  
  -- Authentication
  otp TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Profile status
  profile_completed BOOLEAN DEFAULT FALSE,
  onboarded BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Setup:** Run `root/infra/supabase/CREATE_BUYERS_TABLE.sql` in your Supabase SQL Editor.

---

## Authentication Flow

### 1. Buyer Login (`/auth/buyer/login`)

- **Design:** Blue-themed login page (different from farmer's green theme)
- **Process:**
  - User enters phone number
  - Calls `/api/auth/buyer/send-otp`
  - OTP is generated and stored in `buyers` table
  - Redirects to `/auth/buyer/otp`

### 2. Buyer OTP Verification (`/auth/buyer/otp`)

- **Design:** Blue-themed OTP verification
- **Process:**
  - User enters 6-digit OTP
  - Calls `/api/auth/buyer/verify-otp`
  - Verifies OTP against `buyers` table
  - Stores buyer session in localStorage:
    - `kh_buyer_id`: Buyer's UUID
    - `kh_buyer_phone`: Phone number
    - `kh_buyer_profile`: Buyer profile data
    - `kh_role`: Set to "buyer"
  - Routes to buyer home or onboarding based on `onboarded` status

### 3. API Routes

#### `/api/auth/buyer/send-otp`
- Creates or updates buyer record in `buyers` table
- Generates 6-digit OTP
- Sets expiry time (10 minutes)
- In dev mode, returns OTP in response

#### `/api/auth/buyer/verify-otp`
- Validates OTP and expiry
- Clears OTP after successful verification
- Returns buyer session data

#### `/api/buyer/profile`
- **GET:** Fetches buyer profile by `buyerId`
- **POST:** Updates buyer profile information

---

## Onboarding Flow

### 1. Business Information (`/onboarding/buyer/business`)

**Step 1 of 2** - Collects:
- Organization name *
- Buyer type (Institutional, Retail Chain, Mandi Agent, Exporter)
- District/Location *

Saves to `buyers` table and proceeds to interest selection.

### 2. Buyer Interests (`/onboarding/buyer/interest`)

**Step 2 of 2** - Collects:
- Interested crops (Soybean, Mustard, Groundnut)
- Volume band (< 100 MT, 100–500 MT, > 500 MT)

Completes onboarding, sets `onboarded = true`, and redirects to `/buyer/home`.

---

## Buyer Dashboard

### Buyer Home (`/buyer/home`)

**Blue/slate theme** with:
- Welcome header with organization name
- Total market volume stats
- Settlement risk widget
- Market overview
- Order book access
- Active positions list

### Buyer Profile (`/buyer/profile`)

**Displays:**
- Organization name and buyer type
- Contact information (phone, location, GST number)
- Business information (interested crops, volume band)
- Quick links to:
  - My Contracts
  - Marketplace
  - Logout

### Buyer Contracts (`/buyer/contracts`)

- Lists all buyer's contracts
- Filters: All, Active, Settled
- Shows contract details (crop, quantity, price, status)
- Click to view contract details

---

## Routing & Navigation

### Splash Page (`/splash`)

Two separate buttons:
1. **Continue as Farmer** → `/auth/login` (green theme)
2. **Continue as Buyer** → `/auth/buyer/login` (blue theme)

### Bottom Navigation

The `BottomNav` component detects user role from `localStorage.getItem("kh_role")`:

**Buyer Navigation:**
- Home → `/buyer/home`
- Forecast → `/forecast`
- Contracts → `/buyer/contracts`
- Market → `/market`
- Profile → `/buyer/profile`

**Farmer Navigation:**
- Home → `/`
- Forecast → `/forecast`
- Contracts → `/contracts`
- Sandbox → `/sandbox`
- Profile → `/profile`

---

## Key Differences: Buyer vs Farmer

| Feature | Farmer | Buyer |
|---------|--------|-------|
| **Database** | `users` table | `buyers` table |
| **Theme** | Green/Emerald | Blue/Slate |
| **Login Route** | `/auth/login` | `/auth/buyer/login` |
| **OTP Route** | `/auth/otp` | `/auth/buyer/otp` |
| **API Routes** | `/api/auth/send-otp` | `/api/auth/buyer/send-otp` |
| **Home Page** | `/` | `/buyer/home` |
| **Profile** | `/profile` | `/buyer/profile` |
| **Contracts** | `/contracts` | `/buyer/contracts` |
| **LocalStorage Keys** | `kh_user_id`, `kh_phone` | `kh_buyer_id`, `kh_buyer_phone` |
| **Role Identifier** | `kh_role: "farmer"` | `kh_role: "buyer"` |

---

## Testing the Buyer Flow

### 1. Run Database Setup
```sql
-- In Supabase SQL Editor
-- Run: root/infra/supabase/CREATE_BUYERS_TABLE.sql
```

### 2. Test Authentication
1. Navigate to `/splash`
2. Click "Continue as Buyer"
3. Enter phone number (any 10 digits in dev mode)
4. Check console for OTP: `🔐 Buyer OTP: XXXXXX`
5. Enter OTP
6. Complete onboarding

### 3. Verify Separate Storage
Open browser DevTools → Application → Local Storage:
- `kh_buyer_id`: UUID of buyer
- `kh_buyer_phone`: Phone number
- `kh_buyer_profile`: Buyer profile JSON
- `kh_role`: "buyer"

### 4. Navigate Buyer Sections
- Dashboard shows buyer-specific stats
- Profile displays organization info
- Contracts filtered by buyer ID
- Bottom nav shows buyer routes

---

## File Structure

```
root/apps/pwa/src/
├── app/
│   ├── auth/
│   │   └── buyer/
│   │       ├── login/page.tsx        # Buyer login
│   │       └── otp/page.tsx          # Buyer OTP verification
│   ├── buyer/
│   │   ├── home/page.tsx             # Buyer dashboard
│   │   ├── profile/page.tsx          # Buyer profile
│   │   └── contracts/page.tsx        # Buyer contracts
│   ├── onboarding/
│   │   └── buyer/
│   │       ├── business/page.tsx     # Business info (Step 1)
│   │       └── interest/page.tsx     # Interests (Step 2)
│   └── api/
│       ├── auth/buyer/
│       │   ├── send-otp/route.ts     # Send buyer OTP
│       │   └── verify-otp/route.ts   # Verify buyer OTP
│       └── buyer/
│           └── profile/route.ts      # Buyer profile API
```

---

## Troubleshooting

### Buyer can't login
- Ensure `CREATE_BUYERS_TABLE.sql` has been run in Supabase
- Check Supabase connection in `.env.local`
- Verify RLS policies allow INSERT/UPDATE on `buyers` table

### OTP not working
- Check console for OTP in dev mode
- Verify `otp_expires_at` is in future
- Ensure phone number matches exactly

### Profile not loading
- Check `kh_buyer_id` exists in localStorage
- Verify `/api/buyer/profile` route is working
- Check browser console for errors

### Routing issues
- Verify `kh_role` is set to "buyer" in localStorage
- Check BottomNav is reading role correctly
- Ensure middleware doesn't redirect buyer routes

---

## Summary

✅ **Separate Database:** Buyers have their own `buyers` table
✅ **Separate Authentication:** Complete OTP flow for buyers
✅ **Separate Theme:** Blue/slate theme vs green theme for farmers
✅ **Separate Dashboard:** Buyer-specific home page and stats
✅ **Separate Profile:** Displays buyer/organization information
✅ **Separate Tracking:** All contracts, positions tracked separately
✅ **Role-based Navigation:** BottomNav adapts to user role

Both flows are **completely independent** and don't interfere with each other. A user can be a farmer OR a buyer, determined by which login path they choose from the splash screen.
