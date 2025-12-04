-- RUN THIS IN SUPABASE TO FIX EMAIL CONFIRMATION ISSUE
-- This will disable email confirmations so users can login immediately

-- Check current auth settings
SELECT * FROM auth.config;

-- Or manually in Supabase Dashboard:
-- 1. Go to: Authentication → Settings → Email Auth
-- 2. Find: "Enable email confirmations"
-- 3. Toggle it OFF
-- 4. Click Save

-- Alternatively, run this to check existing users:
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- If users exist but email_confirmed_at is NULL, they need to confirm email
-- To manually confirm a user (for testing):
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'chandelhimansh@gmail.com';
