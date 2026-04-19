// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createTwilioClient, formatPhoneE164 } from "../shared/twilio.ts";

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
        const { phone, message } = await req.json();

        if (!phone || !message) {
            throw new Error("Phone and message are required");
        }

        const formatted = formatPhoneE164(phone);
        if (!formatted) {
            throw new Error(`Invalid phone number: ${phone}`);
        }

        const client = createTwilioClient();
        if (!client) {
            console.error("[send-sms] Twilio not configured");
            return new Response(
                JSON.stringify({ success: false, error: 'Twilio not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID' }),
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
