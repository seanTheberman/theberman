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
        const { fullName, email, onboardingUrl, role, userId } = await req.json();

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
        const loginUrl = `${websiteUrl}/login`;
        const userIdParam = userId ? `?userId=${userId}` : '';
        const defaultPath = isBusiness ? '/business-onboarding' : '/assessor-onboarding';
        const finalOnboardingUrl = onboardingUrl || `${websiteUrl}${defaultPath}${userIdParam}`;

        const subject = isBusiness
            ? "Your Business Partner Login - The Berman"
            : "Your BER Assessor Login Credentials - The Berman";

        // Ultra-simple HTML to avoid spam filters + use user's preferred branding "The Berman"
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #2e7d32;">Welcome to The Berman</h2>
                <p>Hello ${fullName},</p>
                <p>Your account as a ${roleName} has been created. Please use the button below to log in and complete your registration:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${loginUrl}" style="height:45px;v-text-anchor:middle;width:220px;" arcsize="10%" strokecolor="#2e7d32" fillcolor="#2e7d32">
                    <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Login to Your Account</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;font-size:14px;mso-hide:all;">Login to Your Account</a>
                    <!--<![endif]-->
                </div>
                <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 12px;"><a href="${loginUrl}" style="color: #2e7d32;">${loginUrl}</a></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">The Berman - Registration Team</p>
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
