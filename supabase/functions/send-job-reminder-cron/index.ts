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

const EXPIRY_DAYS = 7;

const getLastActivityTime = (job: any, quotes: any[] = []) => {
    let latest = new Date(job.created_at).getTime();

    for (const quote of quotes) {
        const quoteTime = new Date(quote.created_at).getTime();
        if (quoteTime > latest) latest = quoteTime;
    }

    if (job.scheduled_date) {
        const scheduledTime = new Date(job.scheduled_date).getTime();
        if (scheduledTime > latest) latest = scheduledTime;
    }

    return latest;
};

const isFreshJob = (job: any, quotes: any[] = []) => {
    const daysSinceActivity = Math.floor((Date.now() - getLastActivityTime(job, quotes)) / (1000 * 60 * 60 * 24));
    return daysSinceActivity < EXPIRY_DAYS;
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
        // If a specific tenant is provided, only process that one; otherwise run for every
        // active tenant configured in tenant_configurations.
        let tenants: string[];
        if (body.tenant) {
            tenants = [body.tenant];
        } else {
            const { data: tenantRows, error: tenantErr } = await supabase
                .from('tenant_configurations')
                .select('tenant')
                .eq('is_active', true);
            if (tenantErr) throw tenantErr;
            tenants = (tenantRows || []).map((r: any) => r.tenant).filter(Boolean);
            if (tenants.length === 0) tenants = ['ireland'];
        }

        // ---- Reminder cooldown: don't re-remind a contractor about the same job
        //      within this window. Prevents daily duplicate reminder spam. ----
        const REMINDER_COOLDOWN_HOURS = 72; // i.e. at most every 3 days per job
        const cooldownCutoffIso = new Date(Date.now() - REMINDER_COOLDOWN_HOURS * 3600 * 1000).toISOString();

        const norm = (s: any) => (typeof s === 'string' ? s.trim().toLowerCase() : '');

        const perTenantResults: Record<string, { sent: number; skipped: number }> = {};

        for (const tenant of tenants) {
            perTenantResults[tenant] = { sent: 0, skipped: 0 };

            let config;
            try {
                config = await getTenantConfig(supabase, tenant);
            } catch (e: any) {
                console.error(`[send-job-reminder-cron] Tenant config load failed for ${tenant}:`, e.message);
                continue;
            }
            const { smtp_hostname: smtpHostname, smtp_port: smtpPort, smtp_username: smtpUsername, smtp_password: smtpPassword, smtp_from: smtpFrom, website_url: websiteUrl } = config;

            if (!smtpHostname || !smtpUsername || !smtpPassword) {
                console.error(`[send-job-reminder-cron] SMTP not configured for tenant ${tenant}, skipping.`);
                continue;
            }

            // 1. Only active, fully-onboarded contractors for this tenant.
            const { data: contractors, error: contractorsError } = await supabase
                .from('profiles')
                .select('id, email, full_name, phone, preferred_counties, preferred_towns, assessor_type, is_active, registration_status')
                .eq('role', 'contractor')
                .eq('tenant', tenant)
                .eq('is_active', true)
                .is('deleted_at', null)
                .in('registration_status', ['active', 'completed']);
            if (contractorsError) throw contractorsError;

            if (!contractors || contractors.length === 0) {
                console.log(`[send-job-reminder-cron] No eligible contractors for tenant ${tenant}.`);
                continue;
            }

            // 2. Only currently live jobs in this tenant that are fresh by the same
            //    7-day inactivity rule used in the admin and contractor dashboards.
            //    `submitted` and `pending_quote` are NOT included – those aren't open-quote.
            const { data: liveAssessments, error: assessmentsError } = await supabase
                .from('assessments')
                .select('id, town, county, property_type, job_type, ber_purpose, eircode, created_at, scheduled_date, tenant')
                .eq('tenant', tenant)
                .eq('status', 'live')
                .is('completed_at', null);
            if (assessmentsError) throw assessmentsError;

            if (!liveAssessments || liveAssessments.length === 0) {
                console.log(`[send-job-reminder-cron] No live jobs for tenant ${tenant}.`);
                continue;
            }

            const liveAssessmentIds = liveAssessments.map(a => a.id);

            // 3. Quotes already made by these contractors on these jobs (so we exclude them).
            const { data: allJobQuotes, error: quotesError } = await supabase
                .from('quotes')
                .select('assessment_id, created_by, created_at, status')
                .in('assessment_id', liveAssessmentIds);
            if (quotesError) throw quotesError;

            const quotesByJob = new Map<string, any[]>();
            (allJobQuotes || []).forEach(q => {
                if (!quotesByJob.has(q.assessment_id)) {
                    quotesByJob.set(q.assessment_id, []);
                }
                quotesByJob.get(q.assessment_id)!.push(q);
            });

            const assessments = liveAssessments.filter(job => isFreshJob(job, quotesByJob.get(job.id) || []));
            const staleAssessmentIds = liveAssessments
                .filter(job => !isFreshJob(job, quotesByJob.get(job.id) || []))
                .map(job => job.id);

            if (staleAssessmentIds.length > 0) {
                const { error: closeError, count: closedCount } = await supabase
                    .from('assessments')
                    .update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        notes: `Auto-completed - no activity for ${EXPIRY_DAYS} days`,
                    }, { count: 'exact' })
                    .in('id', staleAssessmentIds)
                    .eq('tenant', tenant)
                    .eq('status', 'live');
                if (closeError) {
                    console.error(`[send-job-reminder-cron] Error auto-closing stale jobs for ${tenant}:`, closeError);
                } else {
                    console.log(`[send-job-reminder-cron] Auto-closed ${closedCount ?? 0} stale jobs for ${tenant}.`);
                }
            }

            if (assessments.length === 0) {
                console.log(`[send-job-reminder-cron] No fresh live jobs for tenant ${tenant}.`);
                continue;
            }

            const assessmentIds = assessments.map(a => a.id);

            // 4. Previous reminders within the cooldown window.
            const { data: recentReminders, error: remErr } = await supabase
                .from('job_reminder_log')
                .select('assessment_id, contractor_id, sent_at')
                .gte('sent_at', cooldownCutoffIso)
                .in('assessment_id', assessmentIds);
            if (remErr) {
                // Table may not exist on first run; just log and continue without dedup.
                console.warn('[send-job-reminder-cron] job_reminder_log unavailable, proceeding without cooldown dedup:', remErr.message);
            }
            const recentReminderKey = new Set(
                (recentReminders || []).map((r: any) => `${r.assessment_id}::${r.contractor_id}`),
            );

            // 5. Sponsors (per tenant) for the promo block.
            const { data: sponsors } = await supabase
                .from('sponsors')
                .select('*')
                .eq('is_active', true)
                .eq('tenant', tenant)
                .limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            const client = new CustomSmtpClient();
            try {
                await client.connect(smtpHostname, smtpPort);
                await client.authenticate(smtpUsername, smtpPassword);
            } catch (e: any) {
                console.error(`[send-job-reminder-cron] SMTP connect failed for tenant ${tenant}:`, e.message);
                continue;
            }

            console.log(`[send-job-reminder-cron] Tenant ${tenant}: processing ${contractors.length} contractors x ${assessments.length} live jobs.`);

            const remindersToLog: Array<{ assessment_id: string; contractor_id: string }> = [];

            for (const contractor of contractors) {
                const quotedIds = new Set(
                    (allJobQuotes || [])
                        .filter((q: any) => q.created_by === contractor.id)
                        .map((q: any) => q.assessment_id),
                );

                // Must have at least one preferred town configured. No town prefs = no reminders.
                const prefTownsNorm = Array.isArray(contractor.preferred_towns)
                    ? contractor.preferred_towns.map(norm).filter(Boolean)
                    : [];
                const prefCountiesNorm = Array.isArray(contractor.preferred_counties)
                    ? contractor.preferred_counties.map(norm).filter(Boolean)
                    : [];
                if (prefTownsNorm.length === 0 && prefCountiesNorm.length === 0) {
                    console.log(`[send-job-reminder-cron] Skipping ${contractor.email}: no preferred_towns/counties configured.`);
                    continue;
                }

                const assessorType = contractor.assessor_type || 'Domestic Assessor';
                const isDomesticAssessor = assessorType.includes('Domestic');
                const isCommercialAssessor = assessorType.includes('Commercial');
                const isTechnicalAssessor = assessorType.includes('Technical');

                const matchingJobs = (assessments || []).filter(job => {
                    if (quotedIds.has(job.id)) return false;

                    // Town match (preferred) or county fallback – case-insensitive.
                    const townMatches = prefTownsNorm.length > 0
                        ? prefTownsNorm.includes(norm(job.town))
                        : false;
                    const countyMatches = prefCountiesNorm.length > 0
                        ? prefCountiesNorm.includes(norm(job.county))
                        : false;
                    if (!townMatches && !countyMatches) return false;

                    // Assessor type match.
                    const isCommercialJob = job.job_type === 'commercial' ||
                        ['commercial', 'office', 'retail', 'industrial', 'warehouse'].some(type =>
                            (job.property_type || '').toLowerCase().includes(type),
                        );
                    const isTechnicalJob = job.job_type === 'technical';
                    if (isCommercialJob && !isCommercialAssessor) return false;
                    if (isTechnicalJob && !isTechnicalAssessor) return false;
                    if (!isCommercialJob && !isTechnicalJob && !isDomesticAssessor) return false;

                    // Cooldown: skip if this contractor was reminded about this job recently.
                    if (recentReminderKey.has(`${job.id}::${contractor.id}`)) return false;

                    return true;
                });

                if (matchingJobs.length === 0) {
                    perTenantResults[tenant].skipped++;
                    continue;
                }

                try {
                    const emailHtml = generateJobReminderEmail(
                        contractor.full_name,
                        matchingJobs,
                        promoHtml,
                        websiteUrl,
                        contractor.phone || undefined,
                    );
                    await client.send(
                        smtpFrom,
                        contractor.email,
                        `${matchingJobs.length}x Jobs Still Available to Quote`,
                        emailHtml,
                    );
                    perTenantResults[tenant].sent++;
                    for (const j of matchingJobs) {
                        remindersToLog.push({ assessment_id: j.id, contractor_id: contractor.id });
                    }
                } catch (err: any) {
                    console.error(`[send-job-reminder-cron] Failed to send reminder to ${contractor.email}:`, err.message);
                }
            }

            await client.close();

            // Persist reminder log so future runs respect the cooldown.
            if (remindersToLog.length > 0) {
                const { error: logErr } = await supabase
                    .from('job_reminder_log')
                    .insert(remindersToLog.map(r => ({ ...r, tenant })));
                if (logErr) console.warn('[send-job-reminder-cron] reminder log insert failed:', logErr.message);
            }

            console.log(`[send-job-reminder-cron] Tenant ${tenant}: sent=${perTenantResults[tenant].sent}, skipped=${perTenantResults[tenant].skipped}.`);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Reminders processed.',
            results: perTenantResults,
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[send-job-reminder-cron] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 500, headers: responseHeaders });
    }
});
