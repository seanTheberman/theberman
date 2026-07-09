-- Security fix: prevent direct signups from being assigned the 'admin' role.
-- The handle_new_user trigger previously trusted raw_user_meta_data->>'role',
-- so anyone calling supabase.auth.signUp() with role='admin' could create an admin account.
-- This update forces unknown/disallowed roles to 'user' and explicitly blocks 'admin'.
-- Admin-created users (via the create-admin-user edge function, which now requires admin auth)
-- still get their intended role because that flow sets is_admin_created=true and is authorized separately.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requested_role text;
    safe_role public.app_role;
BEGIN
    requested_role := NEW.raw_user_meta_data->>'role';

    -- Only permit the metadata role if it is a valid, non-admin app_role value.
    -- Anything invalid or 'admin' falls back to 'user'.
    IF requested_role IS NOT NULL AND requested_role <> 'admin' THEN
        BEGIN
            safe_role := requested_role::public.app_role;
        EXCEPTION WHEN invalid_text_representation THEN
            safe_role := 'user'::public.app_role;
        END;
    ELSE
        safe_role := 'user'::public.app_role;
    END IF;

    INSERT INTO public.profiles (
        id,
        full_name,
        role,
        phone,
        registration_status,
        tenant
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        safe_role,
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'registration_status', 'active'),
        COALESCE(NEW.raw_user_meta_data->>'tenant', 'ireland')
    );

    RETURN NEW;
END;
$$;
