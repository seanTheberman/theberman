-- Add stripe_payment_id to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- Update comment for clarity
COMMENT ON COLUMN profiles.stripe_payment_id IS 'Stored ID of the Stripe Payment Intent for membership registration';
