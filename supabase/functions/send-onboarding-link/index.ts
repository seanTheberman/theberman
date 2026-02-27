// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CustomSmtpClient } from "../shared/smtp.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { fullName, email, password, onboardingUrl, role, userId } = await req.json();

        if (!email || !fullName) {
            throw new Error("Missing recipient details");
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
        const smtpUsername = Deno.env.get('SMTP_USERNAME')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL')?.replace(/\/$/, '') || 'https://theberman.eu';
        const smtpFrom = `The Berman <${smtpUsername}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error('SMTP credentials missing');
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const isBusiness = role === 'business';
        const roleName = isBusiness ? 'Business Partner' : 'BER Assessor';

        // Use the magic link if provided, otherwise fallback to login page
        const actionUrl = onboardingUrl || `${websiteUrl}/login`;

        const subject = isBusiness
            ? "Your Business Partner Onboarding - The Berman"
            : "Your BER Assessor Onboarding - The Berman";

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #2e7d32; margin-top: 0;">Welcome to The Berman</h2>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>Your account as a <strong>${roleName}</strong> has been created. Please use the button below to log in automatically and complete your registration:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${actionUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:5px;font-weight:bold;font-size:16px;">Complete Your Registration</a>
                </div>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2e7d32;">
                    <h3 style="margin-top: 0; font-size: 14px; color: #333;">Your Login Credentials</h3>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                    ${password ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> ${password}</p>` : ''}
                    <p style="margin: 10px 0 0 0; font-size: 11px; color: #666; font-style: italic;">Note: The button above will log you in automatically without needing your password.</p>
                </div>

                <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 12px;"><a href="${actionUrl}" style="color: #2e7d32;">${actionUrl}</a></p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; margin-bottom: 0;">The Berman - Registration Team</p>
            </div>
        `;

        await client.send(smtpFrom, email, subject, html)
        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-onboarding-link] ERROR", err.message);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
