-- Migration: Add is_admin_created flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin_created BOOLEAN DEFAULT false;

-- Update existing profiles that were likely admin created (none specifically identifiable now, but default is false)
COMMENT ON COLUMN public.profiles.is_admin_created IS 'Flag to distinguish between self-signup and admin-created users';
