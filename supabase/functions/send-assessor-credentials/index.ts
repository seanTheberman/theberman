// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generateCredentialsHtml } from "./templates/credentials-template.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { fullName, email, password, loginUrl, tenant = 'ireland' } = await req.json();

        if (!email || !fullName || !password) {
            throw new Error("Missing required fields: fullName, email, password");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const smtpFrom = config.smtp_from;
        const resolvedLoginUrl = loginUrl || `${config.website_url}/login`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error(`SMTP configuration missing for tenant ${tenant}`);
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const html = generateCredentialsHtml(fullName, email, password, resolvedLoginUrl)
        await client.send(smtpFrom!, email, `Your BER Assessor Login Credentials - ${config.display_name}`, html)

        await client.close()
        console.log(`[send-assessor-credentials] SUCCESS: Credentials email sent to ${email}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Credentials email sent successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-assessor-credentials] GLOBAL ERROR", err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
