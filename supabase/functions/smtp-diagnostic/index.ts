// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CustomSmtpClient } from "../shared/smtp.ts";

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
        const { testEmail } = await req.json();

        if (!testEmail) {
            throw new Error("testEmail is required in the body");
        }

        const hostname = Deno.env.get('SMTP_HOSTNAME');
        const port = parseInt(Deno.env.get('SMTP_PORT') || '587');
        const username = Deno.env.get('SMTP_USERNAME');
        const password = Deno.env.get('SMTP_PASSWORD');
        const from = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';

        logger(`Diagnostic Start`);
        logger(`SMTP_HOSTNAME: ${hostname || 'MISSING'}`);
        logger(`SMTP_PORT: ${port}`);
        logger(`SMTP_USERNAME: ${username ? 'PRESENT' : 'MISSING'}`);
        logger(`SMTP_PASSWORD: ${password ? 'PRESENT' : 'MISSING'}`);
        logger(`SMTP_FROM: ${from}`);

        if (!hostname || !username || !password) {
            throw new Error("One or more SMTP environment variables are missing.");
        }

        const client = new CustomSmtpClient();

        // We need to patch the client or just use it and rely on its own logging if it has any, 
        // but CustomSmtpClient logs to console.log which we can see in Supabase logs.

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
            "Berman SMTP Diagnostic Test",
            "<h1>SMTP Diagnostic</h1><p>If you see this, the SMTP relay is working correctly from the Supabase Edge Function.</p>"
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
