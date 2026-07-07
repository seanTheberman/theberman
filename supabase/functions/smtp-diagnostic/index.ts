// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const logs: string[] = [];
    const logger = (msg: string) => {
        const entry = `[${new Date().toISOString()}] ${msg}`;
        console.log(entry);
        logs.push(entry);
    };

    try {
        const { testEmail, tenant = 'ireland' } = await req.json();

        if (!testEmail) {
            throw new Error("testEmail is required in the body");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const hostname = config.smtp_hostname;
        const port = parseInt(config.smtp_port || '587');
        const username = config.smtp_username;
        const password = config.smtp_password;
        const from = config.smtp_from || `${config.display_name} <${username}>`;
        const smtpDomain = config.domain;

        logger(`Diagnostic Start (tenant: ${tenant})`);
        logger(`SMTP_HOSTNAME: ${hostname || 'MISSING'}`);
        logger(`SMTP_PORT: ${port}`);
        logger(`SMTP_USERNAME: ${username ? 'PRESENT' : 'MISSING'}`);
        logger(`SMTP_PASSWORD: ${password ? 'PRESENT' : 'MISSING'}`);
        logger(`SMTP_FROM: ${from}`);

        if (!hostname || !username || !password) {
            throw new Error(`SMTP config missing for tenant ${tenant}.`);
        }

        const client = new CustomSmtpClient(smtpDomain);

        logger(`Connecting...`);
        await client.connect(hostname, port);
        logger(`Connected & Handshaked`);

        logger(`Authenticating...`);
        await client.authenticate(username, password);
        logger(`Authenticated`);

        logger(`Sending test email to ${testEmail}...`);
        await client.send(
            from,
            testEmail,
            "SMTP Diagnostic Test",
            `<h1>SMTP Diagnostic</h1><p>If you see this, the SMTP relay is working correctly for tenant ${tenant} from the Supabase Edge Function.</p>`
        );
        logger(`Email sent signal received`);

        await client.close();
        logger(`Connection closed`);

        return new Response(
            JSON.stringify({ success: true, logs }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        logger(`FATAL ERROR: ${err.message}`);
        return new Response(
            JSON.stringify({ success: false, error: err.message, logs }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
})
