# 🚀 Supabase Database Setup - Step by Step

## ⚠️ IMPORTANT: Fix for "column does not exist" Error

If you see the error: **"column 'user_type' does not exist"**, it means the profiles table already exists from a previous attempt. The updated SQL file now **drops and recreates** the tables cleanly.

## Step 1: Access Supabase SQL Editor

1. Open your browser and go to: **https://supabase.com/dashboard**
2. Sign in to your account
3. Select your project: **vcyiibnabiqeusuwedmo**
4. In the left sidebar, click: **SQL Editor**
5. Click: **New Query** button (top right)

## Step 2: Copy the SQL Code

1. Open the file: `SUPABASE_SQL_SCHEMA.sql` in this folder
2. **Select ALL the text** (Ctrl+A / Cmd+A)
3. **Copy it** (Ctrl+C / Cmd+C)

**OR** copy from here:

```sql
-- Copy everything from SUPABASE_SQL_SCHEMA.sql file
-- It starts with: CREATE TABLE IF NOT EXISTS public.profiles
-- It ends with: EXECUTE FUNCTION public.handle_updated_at();
```

## Step 3: Paste and Run

1. In Supabase SQL Editor, **paste the entire code** (Ctrl+V / Cmd+V)
2. Click the **"Run"** button (or press F5)
3. Wait for the query to complete (should take 2-5 seconds)
4. You should see: **"Success. No rows returned"**

## Step 4: Verify Tables Were Created

1. In Supabase, go to: **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `contracts` (if you included optional section)
3. Click on `profiles` table to see the columns

## Step 5: Get Your ANON Key

1. In Supabase, go to: **Settings** (gear icon) → **API**
2. Find the section: **Project API keys**
3. Copy the `anon` `public` key (long string starting with `eyJ...`)
4. Open: `root/apps/pwa/.env.local`
5. Replace this line:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
   With your actual key.

## Step 6: Restart Your Dev Server

```powershell
# If server is running, press Ctrl+C to stop
# Then restart:
cd root/apps/pwa
pnpm dev
```

## Step 7: Test Authentication

### Create Your First User

1. Navigate to: **http://localhost:3000/auth/signup**
2. Choose **"Farmer"**
3. Fill in Step 1:
   - Full Name: `Test Farmer`
   - Email: `test@example.com`
   - Phone: `9876543210`
   - State: `Punjab`
   - Password: `test123`
   - Confirm Password: `test123`
4. Click: **"Continue to Details"**
5. Fill in Step 2:
   - District: `Amritsar`
   - Village: `Test Village`
   - Pincode: `143001`
   - Land Size: `5`
   - Primary Crop: `Soybean`
   - Farming Experience: `10`
6. Check: **"I agree to the Terms..."**
7. Click: **"Create Account"**

### Expected Result:
- ✅ Account created successfully
- ✅ Redirected to dashboard (/)
- ✅ Data saved in Supabase

### Verify in Supabase:

1. Go to: **Authentication** → **Users**
2. You should see your new user with email: `test@example.com`
3. Go to: **Table Editor** → **profiles**
4. You should see one row with your profile data

### Test Login:

1. Navigate to: **http://localhost:3000/auth/login**
2. Enter:
   - Email: `test@example.com`
   - Password: `test123`
3. Click: **"Sign In"**
4. Should redirect to dashboard

## Troubleshooting

### ❌ Error: "syntax error at or near..."
**Solution:** Make sure you copied the ENTIRE SQL file, including all sections.

### ❌ Error: "relation 'profiles' does not exist"
**Solution:** Run the SQL schema again. The table wasn't created.

### ❌ Error: "Invalid API key"
**Solution:** 
1. Check you copied the correct ANON key from Supabase
2. Make sure it's in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart the dev server

### ❌ Error: "new row violates row-level security policy"
**Solution:** 
1. Make sure RLS policies were created (Step 3 of SQL)
2. Re-run the SQL schema
3. Check you're authenticated when inserting data

### ❌ Email verification required
**Solution (for development):**
1. Go to Supabase: **Authentication** → **Settings**
2. Scroll to: **Email Auth**
3. Toggle OFF: **"Confirm email"**
4. Save changes
5. Try signup again

### ❌ Profile not created after signup
**Solution:**
1. Check browser console for errors
2. Verify SQL trigger was created
3. Manually insert profile in Supabase Table Editor
4. Check `user_id` matches auth user ID

## Quick Commands Reference

```powershell
# Navigate to PWA directory
cd root/apps/pwa

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Check for errors
pnpm run type-check
```

## Files to Check

After setup, verify these files exist:

- ✅ `root/apps/pwa/.env.local` (with correct ANON key)
- ✅ `root/apps/pwa/src/lib/supabase/client.ts`
- ✅ `root/apps/pwa/src/lib/supabase/server.ts`
- ✅ `root/apps/pwa/src/app/auth/signup/page.tsx`
- ✅ `root/apps/pwa/src/app/auth/login/page.tsx`

## Success Checklist

- [ ] SQL schema ran without errors
- [ ] Tables visible in Supabase Table Editor
- [ ] ANON key updated in `.env.local`
- [ ] Dev server restarted
- [ ] Signup page loads at `/auth/signup`
- [ ] Test user created successfully
- [ ] User visible in Supabase Authentication
- [ ] Profile visible in Supabase profiles table
- [ ] Login works with test credentials
- [ ] Redirected to dashboard after login

## Next Steps

Once authentication is working:

1. ✅ Add logout button to your app
2. ✅ Protect routes that need authentication
3. ✅ Customize profile page
4. ✅ Add email verification
5. ✅ Implement password reset flow
6. ✅ Add phone OTP verification
7. ✅ Build KYC verification

---

**Need help?** Check:
- `AUTH_QUICKSTART.md` - Quick reference
- `AUTH_IMPLEMENTATION_GUIDE.md` - Detailed guide
- Browser console for errors
- Supabase logs: Dashboard → Logs → Postgres Logs
