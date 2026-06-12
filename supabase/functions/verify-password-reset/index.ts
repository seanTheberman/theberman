// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { token, email, password } = await req.json()

        if (!token || !email || !password) {
            throw new Error("Token, email, and password are required");
        }

        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Verify token from email_otps
        const { data: otpRecord, error: otpError } = await supabase
            .from('email_otps')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('code', token)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (otpError) throw otpError;
        if (!otpRecord) {
            throw new Error("Invalid or expired reset token");
        }

        // 2. Find the auth user
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) throw userError;

        const user = userData.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (!user) {
            throw new Error("User not found");
        }

        // 3. Update password via Admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: password,
            user_metadata: { requires_password_change: false },
            email_confirm: true, // Ensure email is confirmed
        });

        if (updateError) throw updateError;

        // 4. Mark token as verified/used
        const { error: markError } = await supabase
            .from('email_otps')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        if (markError) console.error("[verify-password-reset] Failed to mark token used:", markError);

        // 5. Clean up old tokens for this email
        await supabase
            .from('email_otps')
            .delete()
            .eq('email', email.toLowerCase())
            .lt('expires_at', new Date().toISOString());

        return new Response(
            JSON.stringify({ success: true, message: "Password updated successfully" }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("[verify-password-reset] ERROR", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
})
