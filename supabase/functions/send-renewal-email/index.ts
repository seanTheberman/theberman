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
        const { fullName, email, expiryDate, role, tenant = 'ireland' } = await req.json();

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

        const paymentUrl = `${websiteUrl}/membership-payment`;
        const roleName = role === 'business' ? 'Business Partner' : 'BER Assessor';

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Subscription Renewal</h2>
                <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    This is an automated reminder that your subscription as a <strong>${roleName}</strong> on The Berman platform
                    ${expiryDate ? `expired or is about to expire on <strong>${expiryDate}</strong>` : 'has expired'}.
                </p>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    To maintain your active status in our catalogue and continue receiving direct BER assessment leads in Ireland,
                    please renew your membership via the secure link below.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="${paymentUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Renew My Membership Now
                    </a>
                </div>

                <div style="background-color: #f0f7f0; padding: 20px; border-radius: 8px; border-left: 5px solid #2e7d32; margin-bottom: 30px;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #1b5e20;">Active Benefits:</h3>
                    <ul style="padding-left: 20px; margin-top: 10px; margin-bottom: 0; font-size: 14px; color: #2e7d32; line-height: 1.7;">
                        <li><strong>Stay Visible:</strong> Keep your business listing top-of-mind for homeowners.</li>
                        <li><strong>Live Job Alerts:</strong> Real-time notifications for BER requests in your area.</li>
                        <li><strong>Verified Status:</strong> Maintain your badge as a trusted Berman partner.</li>
                    </ul>
                </div>

                <p style="color: #666; font-size: 14px; text-align: center;">
                    If the button above does not work, copy and paste this link:<br>
                    <a href="${paymentUrl}" style="color: #2e7d32; word-break: break-all;">${paymentUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.5;">
                    &copy; ${new Date().getFullYear()} The Berman. Registered in Ireland.<br>
                    Supporting sustainable energy assessments across the nation.
                </p>
            </div>
        `;

        await client.send(
            smtpFrom,
            email,
            "Action Required: Your Berman Subscription Status",
            html
        )

        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: "Renewal email sent" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error("Error in send-renewal-email:", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
