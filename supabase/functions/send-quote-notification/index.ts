// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generateHomeownerQuoteEmail } from "./templates/homeowner-notification.ts";
import { generatePromoHtml } from "./templates/promo-section.ts";

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
        const { assessmentId, tenant = 'ireland' } = await req.json();

        if (!assessmentId) {
            throw new Error("assessmentId is required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Load tenant config
        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        // 1. Fetch Assessment & Homeowner Details
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, status')
            .eq('id', assessmentId)
            .eq('tenant', tenant)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error(`[send-quote-notification] SMTP Secrets missing for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // 2. Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // 3. Generate Email HTML
            const emailHtml = generateHomeownerQuoteEmail(assessment.contact_name, websiteUrl, promoHtml);

            // 4. Send Email
            await client.send(smtpFrom, assessment.contact_email, 'BER quote received.', emailHtml);

            // SMS to homeowner
            await trySendSms(assessment.contact_phone, `Hi ${assessment.contact_name}, great news! You've received a new BER quote on ${websiteUrl.replace('https://', '')}. Log in to review and compare prices: ${websiteUrl}`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            await client.close();
            console.log(`[send-quote-notification] SUCCESS: Notification sent to ${assessment.contact_email} (tenant: ${tenant})`);
            return new Response(JSON.stringify({ success: true, message: 'Notification email & SMS sent to homeowner', tenant }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error(`[send-quote-notification] SMTP ERROR (tenant: ${tenant})`, smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-quote-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
