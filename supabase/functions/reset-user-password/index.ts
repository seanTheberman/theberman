// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../shared/auth.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

function generateSecurePassword(length = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[randomBytes[i] % chars.length];
    }
    return password;
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Authorize: only authenticated admins may reset another user's password
        const { error: authError } = await requireAdmin(req, supabaseAdmin);
        if (authError) {
            console.warn('[reset-user-password] Authorization failed:', authError);
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
        }

        const { userId, email: requestedEmail, syncEmailOnly = false } = await req.json();

        if (!userId) {
            throw new Error("Missing required field: userId");
        }

        // The login email must always equal the email we show in admin and send credentials to.
        // Use the explicitly requested email (admin edit) or fall back to the profile email.
        let email = requestedEmail?.trim().toLowerCase();
        if (!email) {
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('email')
                .eq('id', userId)
                .maybeSingle();
            if (profileError) throw profileError;
            email = profile?.email?.trim().toLowerCase();
        }
        if (!email) {
            throw new Error("User has no email on file");
        }

        const newPassword = syncEmailOnly ? undefined : generateSecurePassword(14);

        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email,
            email_confirm: true,
            ...(newPassword ? { password: newPassword, user_metadata: { requires_password_change: true } } : {}),
        });

        if (error) throw error;

        // Keep the profile email normalised to the exact login email
        await supabaseAdmin.from('profiles').update({ email }).eq('id', userId);

        return new Response(
            JSON.stringify({ success: true, email, password: newPassword }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[reset-user-password] ERROR", err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
