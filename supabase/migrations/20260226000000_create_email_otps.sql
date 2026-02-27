-- Create email_otps table to store verification codes
CREATE TABLE IF NOT EXISTS public.email_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS email_otps_email_idx ON public.email_otps(email);

-- Enable RLS
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Enable ALL for service-role" ON public.email_otps
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
