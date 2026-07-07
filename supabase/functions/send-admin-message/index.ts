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
        const { to, subject, body, tenant = 'ireland', assessmentId } = await req.json()

        if (!to || !subject || !body) {
            return new Response(
                JSON.stringify({ success: false, error: "Missing required fields: to, subject, body" }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);

        if (!config.smtp_hostname || !config.smtp_username || !config.smtp_password) {
            console.error(`[send-admin-message] SMTP not configured for tenant ${tenant}`);
            return new Response(
                JSON.stringify({ success: false, error: `SMTP not configured for tenant ${tenant}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const client = new CustomSmtpClient(config.domain);
        console.log(`[send-admin-message] Tenant=${tenant}, sending to ${to}`);

        const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;line-height:1.6;">
            <div style="border-bottom:2px solid #007F00;padding-bottom:16px;margin-bottom:24px;">
                <h2 style="margin:0;color:#007F00;font-weight:700;">${config.display_name}</h2>
                <p style="margin:4px 0 0 0;font-size:13px;color:#666;">Platform Update</p>
            </div>
            <div style="white-space:pre-wrap;font-size:15px;">${body.replace(/\n/g, '<br>')}</div>
            <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#888;">
                <p style="margin:0;">Best regards,</p>
                <p style="margin:4px 0 0 0;font-weight:600;">The ${config.display_name} Team</p>
                <p style="margin:4px 0 0 0;"><a href="${config.website_url}" style="color:#007F00;text-decoration:none;">${config.website_url}</a></p>
                <p style="margin:4px 0 0 0;">Email: <a href="mailto:${config.smtp_from}" style="color:#007F00;text-decoration:none;">${config.smtp_from}</a></p>
            </div>
        </div>`;

        try {
            await client.connect(config.smtp_hostname, config.smtp_port);
            await client.authenticate(config.smtp_username, config.smtp_password);

            await client.send(
                config.smtp_from,
                to,
                subject,
                htmlBody
            );

            await client.close();
            console.log(`[send-admin-message] SUCCESS: Email sent to ${to} (tenant: ${tenant})`);

            return new Response(
                JSON.stringify({ success: true, message: "Email sent successfully" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
        } catch (smtpErr: any) {
            console.error("[send-admin-message] SMTP ERROR", smtpErr);
            return new Response(
                JSON.stringify({ success: false, error: "SMTP Failed", details: smtpErr.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
    } catch (error: any) {
        console.error("[send-admin-message] GLOBAL ERROR", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
