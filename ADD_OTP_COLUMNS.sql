-- Add OTP columns to profiles table for authentication
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- Create index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_otp 
ON profiles(phone, otp_code) 
WHERE otp_expires_at > NOW();

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('otp_code', 'otp_expires_at');
