// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";
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

        const body = await req.json().catch(() => ({}));
        const tenant = body.tenant || 'ireland';

        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const smtpFrom = config.smtp_from;
        const websiteUrl = config.website_url;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error(`[send-job-reminder-cron] SMTP not configured for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: `SMTP not configured for tenant ${tenant}` }), { status: 500, headers: responseHeaders });
        }

        // 1. Fetch all active contractors and their preferences
        const { data: contractors, error: contractorsError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, preferred_counties, assessor_type')
            .eq('role', 'contractor')
            .is('deleted_at', null);

        if (contractorsError) throw contractorsError;

        // 2. Fetch all live assessments (exclude jobs older than 15 days)
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        
        const { data: assessments, error: assessmentsError } = await supabase
            .from('assessments')
            .select('*')
            .in('status', ['live', 'submitted', 'pending_quote'])
            .gte('created_at', fifteenDaysAgo.toISOString());

        if (assessmentsError) throw assessmentsError;

        // 3. Auto-close jobs older than 15 days
        const { error: closeError } = await supabase
            .from('assessments')
            .update({ 
                status: 'completed', 
                completed_at: new Date().toISOString(),
                notes: 'Auto-completed - job older than 15 days'
            })
            .lt('created_at', fifteenDaysAgo.toISOString())
            .in('status', ['live', 'submitted', 'pending_quote']);

        if (closeError) {
            console.error('[send-job-reminder-cron] Error auto-closing old jobs:', closeError);
        } else {
            console.log(`[send-job-reminder-cron] Auto-closed jobs older than 15 days`);
        }

        // 4. Fetch all quotes to exclude jobs already quoted for
        const { data: allQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('assessment_id, created_by');

        if (quotesError) throw quotesError;

        // 5. Fetch Sponsors for Promo Section
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
