// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { generateJobReminderEmail } from "./templates/job-reminder-template.ts";
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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `Theberman.eu <${smtpFromEnv}>`;
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[send-job-reminder-cron] SMTP Secrets missing");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');

        // 1. Fetch all active contractors and their preferences
        const { data: contractors, error: contractorsError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, preferred_counties, assessor_type')
            .eq('role', 'contractor');

        if (contractorsError) throw contractorsError;

        // 2. Fetch all live assessments
        const { data: assessments, error: assessmentsError } = await supabase
            .from('assessments')
            .select('*')
            .in('status', ['live', 'submitted', 'pending_quote']);

        if (assessmentsError) throw assessmentsError;

        // 3. Fetch all quotes to exclude jobs already quoted for
        const { data: allQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('assessment_id, created_by');

        if (quotesError) throw quotesError;

        // 4. Fetch Sponsors for Promo Section
        const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
        const promoHtml = generatePromoHtml(sponsors || []);

        const client = new CustomSmtpClient();
        await client.connect(smtpHostname, smtpPort);
        await client.authenticate(smtpUsername, smtpPassword);

        let sentCount = 0;
        console.log(`[send-job-reminder-cron] Processing reminders for ${contractors.length} contractors and ${assessments.length} potential jobs.`);

        for (const contractor of contractors) {
            // Filter jobs for this contractor
            const quotedIds = new Set(allQuotes?.filter(q => q.created_by === contractor.id).map(q => q.assessment_id) || []);

            // Start with jobs not already quoted
            let matchingJobs = assessments?.filter(j => !quotedIds.has(j.id)) || [];

            // 1. County filtering
            if (contractor.preferred_counties && contractor.preferred_counties.length > 0) {
                matchingJobs = matchingJobs.filter(job =>
                    contractor.preferred_counties.includes(job.county)
                );
            }

            // 2. Assessor Type filtering (Domestic vs Commercial)
            const assessorType = contractor.assessor_type || 'Domestic Assessor';
            const isDomesticAssessor = assessorType.includes('Domestic');
            const isCommercialAssessor = assessorType.includes('Commercial');

            matchingJobs = matchingJobs.filter(job => {
                const isCommercialJob = job.job_type === 'commercial' ||
                    ['commercial', 'office', 'retail', 'industrial', 'warehouse'].some(type =>
                        job.property_type?.toLowerCase().includes(type)
                    );

                if (isCommercialJob) return isCommercialAssessor;
                return isDomesticAssessor;
            });

            if (matchingJobs.length > 0) {
                try {
                    const emailHtml = generateJobReminderEmail(contractor.full_name, matchingJobs, promoHtml, websiteUrl);
                    await client.send(smtpFrom, contractor.email, `${matchingJobs.length}x Jobs Still Available to Quote`, emailHtml);
                    sentCount++;
                } catch (err) {
                    console.error(`[send-job-reminder-cron] Failed to send reminder to ${contractor.email}:`, err);
                }
            }
        }

        await client.close();
        console.log(`[send-job-reminder-cron] SUCCESS: Sent ${sentCount} reminders.`);

        return new Response(JSON.stringify({
            success: true,
            message: `Periodic reminders processed. Sent ${sentCount} emails.`
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[send-job-reminder-cron] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 500, headers: responseHeaders });
    }
});
