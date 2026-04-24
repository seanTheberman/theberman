// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createTwilioClient, formatPhoneE164 } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";

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
        const { phone, message, tenant = 'ireland' } = await req.json();

        if (!phone || !message) {
            throw new Error("Phone and message are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);

        const formatted = formatPhoneE164(phone, config.phone_country_code);
        if (!formatted) {
            throw new Error(`Invalid phone number: ${phone}`);
        }

        const client = createTwilioClient(
            config.twilio_account_sid,
            config.twilio_auth_token,
            config.twilio_messaging_service_sid,
        );
        if (!client) {
            console.error(`[send-sms] Twilio not configured for tenant ${tenant}`);
            return new Response(
                JSON.stringify({ success: false, error: `Twilio not configured for tenant ${tenant}` }),
                { status: 500, headers: responseHeaders },
            );
        }

        const result = await client.send(formatted, message);

        if (result.success) {
            return new Response(
                JSON.stringify({ success: true, sid: result.sid }),
                { headers: responseHeaders },
            );
        } else {
            return new Response(
                JSON.stringify({ success: false, error: result.error }),
                { status: 400, headers: responseHeaders },
            );
        }
    } catch (error: any) {
        console.error("[send-sms] ERROR:", error);
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            { status: 400, headers: responseHeaders },
        );
    }
});
