# Supabase Authentication Setup Guide

## Database Schema

### 1. Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 2. Contracts Table (Optional - for full integration)

```sql
-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_number TEXT UNIQUE,
  commodity TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'quintals',
  strike_price NUMERIC NOT NULL,
  current_price NUMERIC,
  contract_type TEXT CHECK (contract_type IN ('buy', 'sell', 'hedge')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  premium NUMERIC,
  counterparty TEXT,
  profit_loss NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_commodity ON public.contracts(commodity);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Users can view own contracts"
  ON public.contracts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts"
  ON public.contracts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON public.contracts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_contracts_updated_at ON public.contracts;
CREATE TRIGGER set_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

## Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vcyiibnabiqeusuwedmo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Required NPM Packages

Install Supabase dependencies:

```bash
cd root/apps/pwa
pnpm add @supabase/ssr @supabase/supabase-js
```

## Authentication Flow

### 1. Sign Up
- User fills multi-step form (farmer or business)
- `supabase.auth.signUp()` creates auth user
- Profile created in `profiles` table with user_type
- User redirected to dashboard

### 2. Sign In
- User enters email/password
- `supabase.auth.signInWithPassword()` authenticates
- Session stored in cookies (managed by middleware)
- User profile fetched from `profiles` table
- Redirected to dashboard

### 3. Password Reset
- User requests reset at `/auth/forgot-password`
- `supabase.auth.resetPasswordForEmail()` sends email
- User clicks link in email → redirected to `/auth/reset-password`
- `supabase.auth.updateUser()` updates password

### 4. Session Management
- Middleware automatically refreshes sessions
- Protected routes check `supabase.auth.getUser()`
- Logout via `supabase.auth.signOut()`

## Protected Routes

Add authentication checks to your pages:

```typescript
// Example: In profile page
import { requireAuth } from '@/lib/auth/auth-helpers';

export default async function ProfilePage() {
  const user = await requireAuth(); // Redirects if not logged in
  
  // Your page code...
}
```

## Testing

### Create Demo User

Run in Supabase SQL Editor:

```sql
-- This will be created via signup page, but for testing:
-- 1. Sign up at /auth/signup
-- 2. Check email for verification
-- 3. Login at /auth/login
```

### Test Authentication Flow

1. **Sign Up**: Navigate to `/auth/signup`
2. **Email Verification**: Check email (or disable in Supabase settings for dev)
3. **Login**: Navigate to `/auth/login`
4. **Protected Route**: Navigate to `/profile` (should redirect if not logged in)
5. **Logout**: Implement logout button that calls `supabase.auth.signOut()`

## Troubleshooting

### Issue: "Invalid API key"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

### Issue: "Row Level Security" error
- Ensure RLS policies are created (run SQL above)
- Check user is authenticated: `supabase.auth.getUser()`

### Issue: Email not sending
- Check Supabase > Authentication > Email Templates
- For dev: Disable email confirmation in Supabase settings
- For prod: Configure SMTP in Supabase

### Issue: Profile not created
- Check SQL trigger/function is created
- Manually insert profile after signup if needed
- Check browser console for errors

## Next Steps

1. ✅ Database schema created
2. ✅ Auth pages implemented (signup, login, forgot/reset password)
3. ⏳ Add logout functionality
4. ⏳ Protect dashboard/profile/contracts pages
5. ⏳ Add email verification flow
6. ⏳ Implement session refresh
