-- Fix: sync auth.users.email into public.profiles.email
-- and keep profiles.last_login in sync with auth.users.last_sign_in_at.

-- 1. Back-fill missing emails for all existing profiles.
--    Counts found: 32 contractors, 28 users, 5 businesses = 65 rows with NULL email.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL
  AND u.email IS NOT NULL;

-- 2. Back-fill missing last_login values from auth.users.last_sign_in_at.
UPDATE public.profiles p
SET last_login = u.last_sign_in_at
FROM auth.users u
WHERE p.id = u.id
  AND p.last_login IS NULL
  AND u.last_sign_in_at IS NOT NULL;

-- 3. Trigger function: keep public.profiles.email in sync with auth.users.email.
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only touch rows where the value actually differs (including NULL handling).
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.id
      AND email IS DISTINCT FROM NEW.email
  ) THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id
      AND email IS DISTINCT FROM NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Trigger function: keep public.profiles.last_login in sync with auth.users.last_sign_in_at.
CREATE OR REPLACE FUNCTION public.sync_profile_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_login = NEW.last_sign_in_at
    WHERE id = NEW.id
      AND last_login IS DISTINCT FROM NEW.last_sign_in_at;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Drop existing triggers if they exist so this migration is idempotent.
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON auth.users;
DROP TRIGGER IF EXISTS sync_profile_last_login_trigger ON auth.users;

-- 6. Create triggers on auth.users.
CREATE TRIGGER sync_profile_email_trigger
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_email();

CREATE TRIGGER sync_profile_last_login_trigger
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_last_login();
