-- Add registration price columns to app_settings table
ALTER TABLE app_settings
ADD COLUMN IF NOT EXISTS domestic_assessor_price NUMERIC(10, 2) DEFAULT 250.00,
ADD COLUMN IF NOT EXISTS commercial_assessor_price NUMERIC(10, 2) DEFAULT 250.00,
ADD COLUMN IF NOT EXISTS bundle_assessor_price NUMERIC(10, 2) DEFAULT 350.00,
ADD COLUMN IF NOT EXISTS business_registration_price NUMERIC(10, 2) DEFAULT 300.00;

-- Update existing records if any
UPDATE app_settings
SET 
  domestic_assessor_price = 250.00,
  commercial_assessor_price = 250.00,
  bundle_assessor_price = 350.00,
  business_registration_price = 300.00
WHERE domestic_assessor_price IS NULL;
