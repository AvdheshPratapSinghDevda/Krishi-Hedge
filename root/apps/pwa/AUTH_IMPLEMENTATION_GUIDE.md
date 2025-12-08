# 🚀 Krishi Hedge - Auth System Overhaul Guide

## ⚠️ CRITICAL ISSUES FIXED

### Problems Found:
1. **Multiple competing auth systems** - Had custom OTP tables + Supabase Auth (not connected!)
2. **Role confusion** - Farmers/Buyers/FPOs/Admins all using different auth methods
3. **1018-line signup page** - Bloated, doesn't match login flow
4. **Cartoonish UI** - Excessive gradients, unprofessional design
5. **No unified profile system** - Data scattered across multiple tables

## ✅ SOLUTION IMPLEMENTED

### 1. Unified Database Schema
**File: `COMPLETE_DATABASE_SCHEMA.sql`**

- ✅ Single `profiles` table for ALL user types (farmer, buyer, fpo, admin)
- ✅ Integrated with Supabase Auth (auto-creates profile on signup)
- ✅ Row Level Security (RLS) policies
- ✅ Role-based access control
- ✅ Proper indexes for performance

**Action Required:**
```bash
# Go to your Supabase Dashboard → SQL Editor
# Copy and paste the entire COMPLETE_DATABASE_SCHEMA.sql file
# Click "Run" to execute
```

### 2. Auth Service Layer
**File: `src/lib/auth/auth-service.ts`**

Unified authentication handling:
- ✅ Phone OTP for Farmers & Buyers
- ✅ Email/Password for FPOs & Admins
- ✅ Centralized error handling
- ✅ Automatic profile creation
- ✅ Session management

### 3. Professional Login Page
**File: `src/app/auth/login/page.tsx`**

Features:
- ✅ Clean, modern design (no gradients!)
- ✅ Role selector (Farmer/Buyer/FPO/Admin)
- ✅ Dynamic auth method (OTP vs Email/Password)
- ✅ Proper error handling
- ✅ Loading states
- ✅ Professional typography and spacing

## 📋 SETUP INSTRUCTIONS

### Step 1: Configure Supabase

1. **Create `.env.local` file** in `root/apps/pwa/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

2. **Enable Phone Auth in Supabase**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Phone" provider
   - Configure SMS provider (Twilio recommended for production)
   - For development, Supabase provides test OTPs

3. **Run the Database Schema**:
   - Open Supabase Dashboard → SQL Editor
   - Paste content from `COMPLETE_DATABASE_SCHEMA.sql`
   - Execute

### Step 2: Update Existing Files

#### A. Update Splash Page
**File: `src/app/splash/page.tsx`**

Change the button routes:

```tsx
// OLD
<button onClick={() => router.push('/auth/login?role=farmer')}>

// NEW - Already correct!
<button onClick={() => router.push('/auth/login?role=farmer')}>
```

#### B. Remove Old Auth Files (IMPORTANT!)

Delete these legacy files:
```bash
# In PowerShell
Remove-Item -Force "d:\Folder A\SIH2025\TESTING-APP\root\apps\pwa\src\app\api\auth\send-otp\route.ts"
Remove-Item -Force "d:\Folder A\SIH2025\TESTING-APP\root\apps\pwa\src\app\api\auth\verify-otp\route.ts"
Remove-Item -Force "d:\Folder A\SIH2025\TESTING-APP\root\apps\pwa\src\app\api\auth\buyer\*" -Recurse
Remove-Item -Force "d:\Folder A\SIH2025\TESTING-APP\root\apps\pwa\src\app\auth\buyer-login\*" -Recurse
Remove-Item -Force "d:\Folder A\SIH2025\TESTING-APP\root\apps\pwa\src\app\auth\buyer-otp\*" -Recurse
Remove-Item -Force "d:\Folder A\SIH2025\TESTING-APP\root\apps\pwa\src\app\auth\phone-login\*" -Recurse
```

These are now handled by the unified auth service!

### Step 3: Update Signup Page

**File: `src/app/auth/signup/page.tsx`** (needs complete rewrite)

Current file is 1018 lines! We need to create a clean, professional version.

**TODO: Create new signup page** - I can help with this next!

### Step 4: Update AuthProvider

**File: `src/components/AuthProvider.tsx`**

Update to use new auth service:

```tsx
// Add this import
import { authService } from '@/lib/auth/auth-service';

// Update session check
useEffect(() => {
  const checkAuth = async () => {
    const { user, profile } = await authService.getCurrentUser();
    setUser(user);
    
    if (!user && !isPublicRoute) {
      router.push('/auth/login');
    }
    
    setLoading(false);
  };
  
  checkAuth();
}, [pathname, router]);
```

### Step 5: Create Professional Signup Page

Would you like me to create this? It should:
- Match the login page design
- Support all 4 user types
- Multi-step form for data collection
- Clean, professional UI

## 🎨 UI IMPROVEMENTS MADE

### Before (Problems):
- ❌ `bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50`
- ❌ `shadow-lg shadow-green-200 hover:shadow-green-300`
- ❌ Multiple inconsistent color schemes
- ❌ Cartoonish rounded corners (rounded-xl, rounded-2xl everywhere)
- ❌ Excessive animations

### After (Professional):
- ✅ Clean `bg-slate-50` backgrounds
- ✅ Subtle `shadow-sm` and `border-slate-200`
- ✅ Consistent emerald-600 primary color
- ✅ Professional spacing and typography
- ✅ Minimal, purposeful animations

## 🔒 SECURITY IMPROVEMENTS

1. **Proper RLS Policies**: Users can only see their own data
2. **Admin Access Control**: Admins can view all profiles
3. **Server-side Validation**: All auth goes through Supabase
4. **No Custom OTP Storage**: Using Supabase's built-in phone auth
5. **CSRF Protection**: Handled by Supabase Auth

## 📊 USER FLOW

### Farmers & Buyers:
1. Select role on login page
2. Enter phone number
3. Receive OTP via SMS
4. Verify OTP
5. → If new user: Onboarding
6. → If existing user: Dashboard

### FPOs & Admins:
1. Select role on login page
2. Enter email & password
3. → Dashboard

## 🧪 TESTING

### Test Accounts (After Setup):

```sql
-- Create in Supabase SQL Editor

-- 1. Test Farmer
INSERT INTO auth.users (id, phone, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  '+919876543210',
  '{"user_type": "farmer", "full_name": "Test Farmer"}'::jsonb
);

-- 2. Test Admin (with email/password)
-- Use Supabase Dashboard → Authentication → Users → Add User
-- Email: admin@test.com
-- Password: Test123!
-- Then update profile:
UPDATE profiles 
SET user_type = 'admin', admin_role = 'super_admin'
WHERE email = 'admin@test.com';
```

### Manual Testing:
1. **Farmer Login**: Use phone OTP (Supabase will log OTP in console for dev)
2. **Admin Login**: Use email/password
3. **Switch Roles**: Click different role buttons to test UI
4. **Error Handling**: Try invalid OTP, wrong password

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Run `COMPLETE_DATABASE_SCHEMA.sql` in Supabase
- [ ] Add Supabase credentials to `.env.local`
- [ ] Enable Phone Auth in Supabase Dashboard
- [ ] Configure SMS provider (Twilio for production)
- [ ] Delete old auth API routes
- [ ] Update AuthProvider component
- [ ] Create new signup page (see below)
- [ ] Test all user role flows
- [ ] Remove demo credentials before production

## 🆘 TROUBLESHOOTING

### "Supabase not configured" error:
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart dev server after adding env vars

### OTP not sending:
- Check Supabase Dashboard → Authentication → Providers → Phone is enabled
- For development, check browser console for test OTP
- For production, configure Twilio credentials in Supabase

### "Invalid OTP" error:
- OTPs expire after 10 minutes
- Make sure phone number includes +91 country code
- Check Supabase logs for errors

### Profile not created on signup:
- Verify database trigger is created (in schema)
- Check Supabase logs for trigger errors
- Manually check `profiles` table in Supabase Dashboard

## 📝 NEXT STEPS

1. **Create Professional Signup Page** - Want me to do this now?
2. **Update Onboarding Flows** - Streamline for each role
3. **Improve Dashboards** - Professional design for each role
4. **Add Profile Completion** - Required fields per role
5. **Email Verification** - For FPOs and Admins
6. **Phone Verification Badge** - Show verified status

## 💡 RECOMMENDATIONS

### Immediate (for hackathon):
1. ✅ Login page done - Clean and professional
2. 🔲 Create matching signup page (30 min)
3. 🔲 Run database schema in Supabase (5 min)
4. 🔲 Add environment variables (2 min)
5. 🔲 Test farmer login flow (10 min)

### Post-Hackathon:
- Implement proper SMS provider (Twilio)
- Add email verification
- Create admin panel
- Add analytics dashboard
- Implement KYC verification flow

---

## 🎯 READY TO CONTINUE?

I can now:
1. **Create the professional signup page** (matching login design)
2. **Update the splash page** with new design
3. **Fix the onboarding flows** for each role
4. **Remove all the cartoonish gradients** from other pages
5. **Create a proper admin dashboard**

What would you like me to tackle next? The signup page is critical and should take ~30 minutes to implement properly.
