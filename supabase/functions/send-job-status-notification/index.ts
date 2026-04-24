// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generatePromoHtml } from "./templates/promo-section.ts";
import { generateStatusEmail } from "./templates/job-status-templates.ts";

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
        const { assessmentId, status, details, tenant = 'ireland' } = await req.json();

        if (!assessmentId || !status) {
            throw new Error("assessmentId and status are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Load tenant config
        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        // Fetch Assessment & Homeowner Details
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, town, county')
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
            console.error(`[send-job-status-notification] SMTP Secrets missing for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // Generate Email HTML
            const emailHtml = generateStatusEmail(
                assessment.contact_name,
                status,
                { ...details, town: assessment.town },
                promoHtml,
                websiteUrl
            );

            const subjectMap = {
                'scheduled': 'Your BER Inspection is Scheduled',
                'rescheduled': 'Your BER Inspection Date has Changed',
                'completed': 'Your BER Assessment is Complete'
            };

            // Send Email
            await client.send(smtpFrom, assessment.contact_email, subjectMap[status] || 'Update on your BER Assessment', emailHtml);

            // SMS to homeowner
            const displayDomain = websiteUrl.replace('https://', '');
            const smsMessages: Record<string, string> = {
                'scheduled': `Hi ${assessment.contact_name}, your BER inspection in ${assessment.town || assessment.county} has been scheduled${details?.date ? ' for ' + details.date : ''}. Check your email for details. - ${displayDomain}`,
                'rescheduled': `Hi ${assessment.contact_name}, your BER inspection date has changed${details?.date ? ' to ' + details.date : ''}. Check your email for updated details. - ${displayDomain}`,
                'completed': `Hi ${assessment.contact_name}, your BER assessment is complete! Log in to ${displayDomain} to view your results.`,
            };
            await trySendSms(assessment.contact_phone, smsMessages[status] || `Hi ${assessment.contact_name}, there's an update on your BER assessment. Check ${displayDomain} for details.`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            await client.close();
            console.log(`[send-job-status-notification] SUCCESS: Notification (${status}) sent to ${assessment.contact_email} (tenant: ${tenant})`);
            return new Response(JSON.stringify({ success: true, message: `Notification email + SMS (${status}) sent to homeowner`, tenant }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error(`[send-job-status-notification] SMTP ERROR (tenant: ${tenant})`, smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-job-status-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
