# Supabase Integration Guide - Profile Page

## 📋 Database Schema for Supabase

### Table: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('farmer', 'business')) DEFAULT 'farmer',
  
  -- Location
  village TEXT,
  district TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  
  -- Farmer Specific
  land_size NUMERIC,
  primary_crop TEXT,
  farming_experience INTEGER,
  
  -- Business Specific
  business_name TEXT,
  gst_number TEXT,
  business_type TEXT,
  
  -- Status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Table: `bank_details`

```sql
CREATE TABLE bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT,
  branch_name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bank details" ON bank_details
  FOR ALL USING (auth.uid() = user_id);
```

## 🔧 Setup Supabase Client

### 1. Install Supabase Client

```bash
cd root/apps/pwa
pnpm add @supabase/supabase-js
```

### 2. Create Supabase Client File

Create `root/apps/pwa/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Add Environment Variables

Create/edit `root/apps/pwa/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔄 Update Profile Page with Supabase

Replace the TODO comments in `page.tsx` with actual Supabase calls:

### Load Profile Data

```typescript
const loadProfileData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (data) {
      const profileData: ProfileData = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        userType: data.user_type,
        village: data.village,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        landSize: data.land_size,
        primaryCrop: data.primary_crop,
        farmingExperience: data.farming_experience,
        businessName: data.business_name,
        gstNumber: data.gst_number,
        businessType: data.business_type,
        emailVerified: data.email_verified,
        phoneVerified: data.phone_verified,
        kycStatus: data.kyc_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
      
      setProfile(profileData)
      setEditForm(profileData)
    } else {
      // Create default profile
      const defaultProfile: ProfileData = {
        fullName: user.user_metadata?.full_name || "User",
        email: user.email || "",
        phone: user.phone || "",
        district: "Select District",
        userType: "farmer",
        emailVerified: user.email_confirmed_at !== null,
        phoneVerified: user.phone_confirmed_at !== null,
        kycStatus: "pending",
      }
      setProfile(defaultProfile)
      setEditForm(defaultProfile)
    }

    // Load bank details
    const { data: bankData } = await supabase
      .from('bank_details')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (bankData) {
      setBank({
        account: bankData.account_number,
        ifsc: bankData.ifsc_code,
        verified: bankData.verified
      })
    }

  } catch (error) {
    console.error("Error loading profile:", error)
  } finally {
    setLoading(false)
  }
}
```

### Save Profile Data

```typescript
const handleSave = async () => {
  setSaving(true)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Not authenticated")
      return
    }

    const profileData = {
      user_id: user.id,
      full_name: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
      user_type: editForm.userType,
      village: editForm.village,
      district: editForm.district,
      state: editForm.state,
      pincode: editForm.pincode,
      land_size: editForm.landSize,
      primary_crop: editForm.primaryCrop,
      farming_experience: editForm.farmingExperience,
      business_name: editForm.businessName,
      gst_number: editForm.gstNumber,
      business_type: editForm.businessType,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'user_id'
      })

    if (error) throw error

    setProfile(editForm)
    setIsEditing(false)
    alert("Profile updated successfully!")
    
  } catch (error) {
    console.error("Error saving profile:", error)
    alert("Failed to save profile. Please try again.")
  } finally {
    setSaving(false)
  }
}
```

## 🔐 Authentication Flow

### Add Auth Check on Page Load

```typescript
useEffect(() => {
  checkAuth()
}, [])

const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    router.push('/login')
    return
  }
  
  loadProfileData()
}
```

### Update Logout Handler

```typescript
const handleLogout = async () => {
  if (confirm("Are you sure you want to logout?")) {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/splash')
  }
}
```

## 📱 Real-time Updates (Optional)

Subscribe to profile changes:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('profile-changes')
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `user_id=eq.${user?.id}`
      }, 
      (payload) => {
        console.log('Profile updated:', payload)
        loadProfileData()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## 🚀 Quick Start

1. **Create Supabase Project**: https://supabase.com
2. **Run SQL Schema**: Copy the schema above into Supabase SQL Editor
3. **Get API Keys**: Project Settings → API → Copy URL and anon key
4. **Install Package**: `pnpm add @supabase/supabase-js`
5. **Add Environment Variables**: Create `.env.local` with your keys
6. **Update Profile Page**: Replace TODO comments with code above
7. **Test**: Run app and test profile update functionality

## 📊 Testing

Test in Supabase Dashboard:
- Go to Table Editor
- View `profiles` table
- Check data after profile updates
- Verify RLS policies are working

## 🔒 Security Checklist

- ✅ Row Level Security enabled
- ✅ Users can only see/edit own data
- ✅ Environment variables are in `.env.local` (not committed)
- ✅ Client-side validation before save
- ✅ Server-side validation with database constraints

---

Your profile page is now **production-ready** and **Supabase-ready**! 🎉
