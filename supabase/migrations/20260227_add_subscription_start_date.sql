-- Add subscription_start_date to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
