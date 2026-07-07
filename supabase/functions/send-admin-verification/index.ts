import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts"
import { getTenantConfig } from "../shared/tenant.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, code, subject, message } = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, 'ireland');

        if (!config.smtp_hostname || !config.smtp_username || !config.smtp_password) {
            console.error('[send-admin-verification] SMTP not configured');
            return new Response(
                JSON.stringify({ success: false, error: 'SMTP not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const client = new CustomSmtpClient(config.domain);
        console.log(`[send-admin-verification] Sending verification code to ${email}`);

        try {
            await client.connect(config.smtp_hostname, config.smtp_port);
            await client.authenticate(config.smtp_username, config.smtp_password);

            await client.send(
                config.smtp_from,
                email,
                subject || 'Admin Security Verification Code',
                message
            );

            await client.close();
            console.log(`[send-admin-verification] SUCCESS: Verification code sent to ${email}`);

            return new Response(
                JSON.stringify({ success: true, message: "Verification code sent successfully" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
        } catch (smtpErr: any) {
            console.error("[send-admin-verification] SMTP ERROR", smtpErr);
            return new Response(
                JSON.stringify({ success: false, error: "SMTP Failed", details: smtpErr.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
    } catch (error: any) {
        console.error("[send-admin-verification] GLOBAL ERROR", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
