// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";

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
        console.log(`[send-otp] Request received for email: ${email}`);

        if (!email) {
            console.error('[send-otp] Email is missing in request');
            return new Response(JSON.stringify({ success: false, error: 'Email is required' }), { status: 400, headers: responseHeaders });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
        console.log(`[send-otp] Generated code: ${code}, expires at: ${expiresAt}`);

        // Insert into database
        console.log('[send-otp] Inserting code into email_otps table...');
        const { error: dbError } = await supabase.from('email_otps').insert({
            email,
            code,
            expires_at: expiresAt
        });

        if (dbError) {
            console.error('[send-otp] DB Insertion Error:', dbError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to generate code in database', details: dbError.message }), { status: 500, headers: responseHeaders });
        }

        console.log('[send-otp] Successfully saved code to database');

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFrom = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        // Ensure we use the clean email address as the base sender to avoid alias issues
        const authenticatedEmail = smtpUsername || 'hello@theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[send-otp] SMTP Secrets missing (check SMTP_HOSTNAME, SMTP_USERNAME, SMTP_PASSWORD)");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing in project' }), { status: 500, headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        console.log(`[send-otp] Attempting SMTP connection to ${smtpHostname}:${smtpPort}...`);
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            console.log('[send-otp] Connected to SMTP server');
            await client.authenticate(smtpUsername, smtpPassword);
            console.log('[send-otp] Authenticated with SMTP server');

            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Verification Code</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0; background-color: #f9f9f9; width: 100% !important;">
                    <div style="display: none; max-height: 0px; overflow: hidden;">
                        Your 6-digit verification code is ${code}.
                    </div>
                    <center>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; padding: 40px 0;">
                            <tr>
                                <td align="center">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                                <h2 style="color: #007F00; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">The Berman</h2>
                                            </td>
                                        </tr>
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 0 40px 40px 40px; text-align: center;">
                                                <p style="color: #4A4A4A; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                                                    Please use the following verification code to complete your login.
                                                </p>
                                                <div style="background-color: #f0fdf4; border-radius: 8px; padding: 25px; display: inline-block; border: 1px solid #dcfce7;">
                                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #007F00; margin-left: 12px;">${code}</span>
                                                </div>
                                                <p style="color: #9B9B9B; font-size: 14px; margin: 30px 0 0 0;">
                                                    This code will expire in <strong>10 minutes</strong>.
                                                </p>
                                            </td>
                                        </tr>
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 20px 40px; background-color: #fcfcfc; border-top: 1px solid #eeeeee; text-align: center;">
                                                <p style="color: #9B9B9B; font-size: 12px; line-height: 18px; margin: 0;">
                                                    &copy; ${new Date().getFullYear()} The Berman. All rights reserved.<br>
                                                    Building Energy Rating Specialists, Ireland.
                                                </p>
                                                <p style="color: #CCCCCC; font-size: 10px; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                                                    This is an automated security message. Please do not reply.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </center>
                </body>
                </html>
            `;

            console.log(`[send-otp] Sending email from ${authenticatedEmail} to ${email}...`);
            await client.send(authenticatedEmail, email, 'Your Verification Code', emailHtml);
            console.log('[send-otp] Email sent successfully');
            await client.close();

            return new Response(JSON.stringify({ success: true, message: 'Code sent' }), { headers: responseHeaders });
        } catch (smtpErr: any) {
            console.error("[send-otp] SMTP ERROR:", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Send Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }
    } catch (err: any) {
        console.error("[send-otp] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
