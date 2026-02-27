// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const body = await req.json();
        const email = body.email?.toLowerCase();
        const code = body.code;
        console.log(`[verify-otp] Request received for email: ${email}, code provided: ${code}`);

        if (!email || !code) {
            console.error('[verify-otp] Email or code missing in request');
            return new Response(JSON.stringify({ success: false, error: 'Email and code are required' }), { status: 400, headers: responseHeaders });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Find the latest unverified OTP for this email
        console.log(`[verify-otp] Looking for latest unverified OTP for ${email}...`);
        const { data, error: dbError } = await supabase
            .from('email_otps')
            .select('*')
            .eq('email', email)
            .eq('verified', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (dbError) {
            console.error('[verify-otp] DB query error:', dbError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to query verification code', details: dbError.message }), { status: 500, headers: responseHeaders });
        }

        if (!data) {
            console.warn(`[verify-otp] No active code found for ${email}`);
            return new Response(JSON.stringify({ success: false, error: 'No active code found for this email. Please request a new one.' }), { status: 400, headers: responseHeaders });
        }

        const isExpired = new Date(data.expires_at).getTime() < Date.now();
        if (isExpired) {
            console.warn(`[verify-otp] Code found but it has expired. Expired at: ${data.expires_at}`);
            return new Response(JSON.stringify({ success: false, error: 'Verification code has expired. Please request a new one.' }), { status: 400, headers: responseHeaders });
        }

        if (data.code !== code) {
            console.warn(`[verify-otp] Incorrect code provided for ${email}. Expected: ${data.code}, Got: ${code}`);
            return new Response(JSON.stringify({ success: false, error: 'Incorrect verification code. Please try again.' }), { status: 400, headers: responseHeaders });
        }

        // Mark as verified
        console.log(`[verify-otp] Code matches! Marking OTP record ${data.id} as verified...`);
        const { error: updateError } = await supabase
            .from('email_otps')
            .update({ verified: true })
            .eq('id', data.id);

        if (updateError) {
            console.error('[verify-otp] DB update error:', updateError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to complete verification status update', details: updateError.message }), { status: 500, headers: responseHeaders });
        }

        console.log(`[verify-otp] Email ${email} verified successfully`);
        return new Response(JSON.stringify({ success: true, message: 'Email verified successfully' }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[verify-otp] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
