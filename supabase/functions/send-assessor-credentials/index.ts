// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CustomSmtpClient } from "../shared/smtp.ts";
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
        const { fullName, email, password, loginUrl } = await req.json();

        if (!email || !fullName || !password) {
            throw new Error("Missing required fields: fullName, email, password");
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
        const smtpUsername = Deno.env.get('SMTP_USERNAME')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `Theberman.eu <${smtpFromEnv}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error('SMTP configuration missing in environment');
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const html = generateCredentialsHtml(fullName, email, password, loginUrl || 'https://theberman.eu/login')
        await client.send(smtpFrom!, email, `Your BER Assessor Login Credentials - The Berman`, html)

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
