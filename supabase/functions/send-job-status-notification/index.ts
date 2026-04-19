// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
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
        const { assessmentId, status, details } = await req.json();

        if (!assessmentId || !status) {
            throw new Error("assessmentId and status are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Fetch Assessment & Homeowner Details
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, town, county')
            .eq('id', assessmentId)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[send-job-status-notification] SMTP Secrets missing");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
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
            const smsMessages: Record<string, string> = {
                'scheduled': `Hi ${assessment.contact_name}, your BER inspection in ${assessment.town || assessment.county} has been scheduled${details?.date ? ' for ' + details.date : ''}. Check your email for details. - TheBerman.eu`,
                'rescheduled': `Hi ${assessment.contact_name}, your BER inspection date has changed${details?.date ? ' to ' + details.date : ''}. Check your email for updated details. - TheBerman.eu`,
                'completed': `Hi ${assessment.contact_name}, your BER assessment is complete! Log in to TheBerman.eu to view your results.`,
            };
            await trySendSms(assessment.contact_phone, smsMessages[status] || `Hi ${assessment.contact_name}, there's an update on your BER assessment. Check TheBerman.eu for details.`);

            await client.close();
            console.log(`[send-job-status-notification] SUCCESS: Notification (${status}) sent to ${assessment.contact_email}`);
            return new Response(JSON.stringify({ success: true, message: `Notification email + SMS (${status}) sent to homeowner` }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error("[send-job-status-notification] SMTP ERROR", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-job-status-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
