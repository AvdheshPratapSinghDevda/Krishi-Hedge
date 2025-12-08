# 🚀 DEV MODE AUTHENTICATION GUIDE

## How It Works (No SMS Required!)

### 🔐 Development OTP System

**For Testing Without SMS Costs:**

1. **User enters phone number** → Click "Send OTP"
2. **System shows OTP in 2 places:**
   - 🖥️ **Browser Console** (F12 → Console tab)
   - 📱 **Alert Popup** (auto-appears after 100ms)
3. **User enters ANY 6-digit code** → System accepts it!
4. **Creates temporary session** → User logged in

### 🎯 Quick Test Flow

```bash
# 1. Start dev server
pnpm dev:pwa

# 2. Open browser: http://localhost:3000

# 3. Go to Splash → Choose role (e.g., Farmer)

# 4. Login page:
   - Enter phone: 9876543210
   - Click "Send OTP"
   - Check console or alert for OTP
   - Enter the OTP (or any 6 digits like 123456)
   - Click "Verify & Login"

# 5. You're logged in! 🎉
```

### 📱 Example Usage

**Scenario: Farmer Login**

1. Navigate to `/splash`
2. Click "Continue as Farmer"
3. Enter phone: `9876543210`
4. Console shows: `🔐 DEV MODE OTP for +919876543210: 543210`
5. Alert shows: `🔐 DEV OTP for +919876543210: 543210`
6. Enter OTP: `543210` (or literally any 6 digits)
7. Success! Redirected to farmer dashboard

### 🔧 Technical Details

**Files Modified:**
- ✅ `src/lib/auth/dev-otp-service.ts` - Temporary OTP handler
- ✅ `src/lib/auth/auth-service.ts` - Updated with dev mode checks
- ✅ `.env.local` - Added `NEXT_PUBLIC_USE_DEV_OTP=true`

**How Dev Mode Works:**

```typescript
// In auth-service.ts
const IS_DEV_MODE = process.env.NODE_ENV === 'development' || 
                     process.env.NEXT_PUBLIC_USE_DEV_OTP === 'true';

if (IS_DEV_MODE) {
  // Use fake OTP system (no Supabase phone auth)
  devOtpService.sendOtp(phone); // Shows OTP in console/alert
  devOtpService.verifyOtp(phone, otp); // Accepts ANY 6-digit code
  devOtpService.createTempSession(phone, role); // Creates mock session
}
```

### 🗄️ Session Storage

**LocalStorage Keys Created:**
- `dev_temp_session` - Mock user session
- `kh_user_id` - User ID (e.g., `dev_1733644800000_abc123`)
- `kh_phone` - Phone number
- `kh_role` - User role (farmer/buyer/fpo/admin)

### 🎨 What You'll See

**1. Send OTP:**
```
Console: 📱 DEV MODE: Sending fake OTP
Console: 🔐 DEV MODE OTP for +919876543210: 765432
Alert:   🔐 DEV OTP for +919876543210: 765432
         (Or enter any 6-digit code)
```

**2. Verify OTP:**
```
Console: 🔐 DEV MODE: Verifying fake OTP
Console: ✅ DEV MODE: Accepting OTP 123456 for +919876543210
Console: ✅ Created temp session: {userId: 'dev_...', phone: '+919876...', role: 'farmer'}
```

**3. Get Profile:**
```
Console: Returns mock profile:
{
  id: 'dev_1733644800000_abc123',
  user_type: 'farmer',
  phone: '+919876543210',
  full_name: 'Dev User',
  onboarded: false, // Forces onboarding flow
  ...
}
```

### 🔄 Production vs Development

| Feature | Development (Now) | Production (Later) |
|---------|-------------------|-------------------|
| Phone Auth | ❌ Fake OTP (no SMS) | ✅ Real Supabase SMS |
| OTP Code | Any 6 digits | Real code from SMS |
| Database | Mock profiles | Real Supabase DB |
| Cost | $0 | SMS costs apply |
| Speed | Instant | SMS delivery delay |

### 🚦 Environment Variables

**Current `.env.local`:**
```bash
# Supabase credentials (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://hzrbmprsyfcsioqyezzf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# DEV MODE (NO SMS REQUIRED!)
NEXT_PUBLIC_USE_DEV_OTP=true  # ← This enables fake OTP system
NODE_ENV=development           # ← Auto-set by Next.js
```

**To disable dev mode (use real Supabase):**
```bash
NEXT_PUBLIC_USE_DEV_OTP=false
```

### ✅ Testing Checklist

- [ ] Start dev server: `pnpm dev:pwa`
- [ ] Open http://localhost:3000
- [ ] Test Farmer login flow
- [ ] Test Buyer login flow
- [ ] Test FPO login flow
- [ ] Check console for OTP codes
- [ ] Try entering random 6-digit codes
- [ ] Verify session creation in localStorage
- [ ] Test logout (clears dev session)

### 🐛 Troubleshooting

**OTP not showing?**
- Open browser console (F12)
- Look for green `🔐 DEV MODE OTP` message
- Check if alert popup is blocked

**"Invalid OTP" error?**
- OTP must be exactly 6 digits
- Any 6-digit number works (123456, 000000, etc.)
- Check console for logs

**Stuck at login?**
- Clear localStorage (F12 → Application → Local Storage → Clear)
- Check `NEXT_PUBLIC_USE_DEV_OTP=true` in `.env.local`
- Restart dev server

### 🎯 Next Steps

**When ready for production:**

1. Set `NEXT_PUBLIC_USE_DEV_OTP=false`
2. Configure Supabase Phone Auth:
   - Enable Phone Auth in Supabase Dashboard
   - Set up SMS provider (Twilio/MessageBird)
   - Add phone auth settings
3. Run database schema in Supabase SQL Editor
4. Test real OTP flow

**For now (development):**
- ✅ Use fake OTP system
- ✅ Test all auth flows without SMS costs
- ✅ Build features with mock sessions
- ✅ No Supabase phone auth setup needed!

---

## 🎉 You're All Set!

Start the dev server and login with **any phone number** and **any 6-digit OTP**!

```bash
pnpm dev:pwa
# Open http://localhost:3000
# Login as Farmer: phone=9876543210, OTP=123456 (or any 6 digits)
```
