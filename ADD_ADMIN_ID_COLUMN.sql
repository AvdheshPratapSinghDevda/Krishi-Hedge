-- =====================================================
-- Add admin_id Column to admin_users Table
-- Run this in Supabase SQL Editor if you need admin ID verification
-- =====================================================

-- Add admin_id column if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users' 
        AND column_name = 'admin_id'
    ) THEN
        ALTER TABLE public.admin_users ADD COLUMN admin_id TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_admin_users_admin_id ON public.admin_users(admin_id);
        COMMENT ON COLUMN public.admin_users.admin_id IS 'Optional admin/FPO ID for verification system';
    END IF;
END $$;

-- The admin_id column is now available in the admin_users table
-- You can manually insert or update admin records with admin_id values

-- Example: Update existing admin with admin_id
-- UPDATE public.admin_users 
-- SET admin_id = 'ADMIN-001' 
-- WHERE email = 'your-email@example.com';

-- Example: Insert new admin with admin_id
-- INSERT INTO public.admin_users (email, password_hash, name, user_type, admin_id)
-- VALUES (
--   'newadmin@krishihedge.com',
--   '$2a$10$...',  -- Use bcrypt hashed password
--   'Admin Name',
--   'admin',
--   'ADMIN-002'
-- );
