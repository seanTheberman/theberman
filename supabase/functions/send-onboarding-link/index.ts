// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";

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
        const { fullName, email, password, onboardingUrl, role, userId, type, tenant = 'ireland' } = await req.json();

        if (!email || !fullName) {
            throw new Error("Missing recipient details");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const websiteUrl = (config.website_url || 'https://theberman.eu').replace(/\/$/, '');
        const smtpFrom = config.smtp_from || `${config.display_name} <${smtpUsername}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error(`SMTP credentials missing for tenant ${tenant}`);
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const isBusiness = role === 'business';
        const isApproval = type === 'approved';

        let subject: string;
        let html: string;

        if (isBusiness && isApproval) {
            // ─── APPROVAL EMAIL: sent after admin approves the business ───
            subject = "You're Approved! – The Berman Home Energy Catalogue";
            const loginUrl = `${websiteUrl}/login`;

            html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">You're Approved! 🎉</h2>
                <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Great news! Your registration has been reviewed and <strong>approved</strong>. 
                    Your business is now published in our Home Energy Catalogue.
                </p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    You can now log in to your Business Portal to edit your catalogue profile, 
                    update your photos, and manage your listing at any time.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Login to Your Dashboard
                    </a>
                </div>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 30px;">
                    <h3 style="margin-top: 0; font-size: 14px; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Details</h3>
                    <p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Login Email:</strong> ${email}</p>
                    ${password ? `<p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Password:</strong> <code style="background:#eee; padding:2px 4px; border-radius:3px;">${password}</code></p>` : ''}
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #777; line-height: 1.4;">
                        <em>You can change your password at any time from your dashboard.</em>
                    </p>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} The Berman. Registered in Ireland.<br>
                    Supporting sustainable energy goals through professional assessments.
                </p>
            </div>
            `;
        } else if (isBusiness) {
            // ─── WELCOME EMAIL: sent when admin manually signs up a business ───
            subject = "Welcome to The Berman – Complete Your Registration";

            // Use the magic link if provided, otherwise fallback to business-onboarding page
            const actionUrl = onboardingUrl || `${websiteUrl}/business-onboarding`;

            html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Welcome to The Berman</h2>
                <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Welcome to the Berman, click the link below to finish the registration form and be published in our home energy catalogue. 
                    We look forward to building a strong relationship with you.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="${actionUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Complete Registration Form
                    </a>
                </div>

                <p style="color: #888; font-size: 13px; text-align: center;">
                    Direct Link:<br>
                    <a href="${actionUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${actionUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} The Berman. Registered in Ireland.<br>
                    Supporting sustainable energy goals through professional assessments.
                </p>
            </div>
            `;
        } else {
            // ─── ASSESSOR EMAIL: unchanged ───
            const roleName = 'BER Assessor';
            const actionUrl = onboardingUrl || `${websiteUrl}/login`;

            subject = "Welcome! Set Your Password – The Berman BER Assessor";

            html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Welcome to The Berman</h2>
                <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Your account as a <strong>${roleName}</strong> has been successfully created.
                    We are excited to have you join our network of energy professionals in Ireland.
                </p>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Please click the button below to <strong>set your own password</strong> and access your dashboard.
                    For your security, this direct setup link is valid for <strong>7 days</strong>.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="${actionUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Set My Password &amp; Login
                    </a>
                </div>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 30px;">
                    <h3 style="margin-top: 0; font-size: 14px; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Fallback Credentials</h3>
                    <p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Login Email:</strong> ${email}</p>
                    ${password ? `<p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Temporary Password:</strong> <code style="background:#eee; padding:2px 4px; border-radius:3px;">${password}</code></p>` : ''}
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #777; line-height: 1.4;">
                        <em>If the button above has expired, you can still sign in manually at <strong>${websiteUrl}/login</strong> using these details.</em>
                    </p>
                </div>

                <p style="color: #888; font-size: 13px; text-align: center;">
                    Direct Link:<br>
                    <a href="${actionUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${actionUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} The Berman. Registered in Ireland.<br>
                    Supporting sustainable energy goals through professional assessments.
                </p>
            </div>
            `;
        }

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
