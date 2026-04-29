// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generateContractorEmail } from "./templates/contractor-notification.ts";
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
        const { email, customerName, county, town, assessmentId, jobType, customerPhone, tenant = 'ireland', force = false } = await req.json();
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Load tenant config (SMTP/Twilio credentials)
        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        // Idempotency guard: only proceed if this assessment has not already been notified.
        // This prevents duplicate emails when the function is invoked twice (e.g. double-click,
        // race between admin Go-Live and a re-trigger, or retries).
        // When `force` is true (admin resend), bypass the guard entirely.
        if (assessmentId && !force) {
            const { data: existing, error: fetchErr } = await supabase
                .from('assessments')
                .select('id, status, job_live_email_sent, job_live_notified_at')
                .eq('id', assessmentId)
                .eq('tenant', tenant)
                .maybeSingle();

            if (fetchErr) {
                console.error(`[send-job-live-email] Error fetching assessment ${assessmentId}:`, fetchErr);
            }

            if (existing?.job_live_notified_at || existing?.job_live_email_sent) {
                console.log(`[send-job-live-email] Skipping ${assessmentId} – already notified at ${existing.job_live_notified_at}`);
                return new Response(
                    JSON.stringify({ success: true, skipped: true, reason: 'already_notified', assessmentId }),
                    { headers: responseHeaders },
                );
            }

            // Atomically claim the notification slot. If another concurrent invocation already set
            // job_live_notified_at, the WHERE clause will match 0 rows and we abort.
            const claimAt = new Date().toISOString();
            const { data: claimed, error: claimErr } = await supabase
                .from('assessments')
                .update({ status: 'live', job_live_notified_at: claimAt })
                .eq('id', assessmentId)
                .eq('tenant', tenant)
                .is('job_live_notified_at', null)
                .select('id');

            if (claimErr) {
                console.error(`[send-job-live-email] Error claiming assessment ${assessmentId}:`, claimErr);
            }

            if (!claimed || claimed.length === 0) {
                console.log(`[send-job-live-email] Skipping ${assessmentId} – lost claim race, another invocation already notified.`);
                return new Response(
                    JSON.stringify({ success: true, skipped: true, reason: 'race_lost', assessmentId }),
                    { headers: responseHeaders },
                );
            }
        }

        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error(`[send-job-live-email] SMTP Secrets missing for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const client = new CustomSmtpClient();

        const { data: sponsors } = await supabase
            .from('sponsors')
            .select('*')
            .eq('is_active', true)
            .eq('tenant', tenant)
            .limit(3);
        const promoHtml = generatePromoHtml(sponsors || []);

        let emailSent = false;
        let smsSent = false;
        let smtpReady = false;

        // Try SMTP connection — if it fails, SMS still sends
        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);
            smtpReady = true;
        } catch (smtpErr: any) {
            console.error(`[send-job-live-email] SMTP connection failed for tenant ${tenant}, SMS will still send:`, smtpErr?.message);
        }

        // 1. Notify Customer via email (only if SMTP is ready)
        if (smtpReady) {
            try {
                const customerHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                        <div style="background-color: #007F00; color: white; padding: 35px 20px; text-align: center;">
                            <img src="${websiteUrl}/logo.svg" alt="${config.display_name}" style="height: 30px; margin-bottom: 12px; filter: brightness(0) invert(1);">
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Your BER Request is Live!</h2>
                        </div>
                        <div style="padding: 35px 30px; color: #333;">
                            <p style="font-size: 17px; font-weight: 600; margin-top: 0;">Hi ${customerName},</p>
                            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                                Your request for a BER assessment in <strong>${town || county}</strong> is now active on our network.
                            </p>

                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h3 style="margin-top: 0; font-size: 15px; color: #007F00;">What happens next?</h3>
                                <ol style="padding-left: 20px; margin-bottom: 0; font-size: 14px; color: #555; line-height: 1.8;">
                                    <li>Registered assessors in <strong>${county}</strong> are being notified.</li>
                                    <li>You will receive quotes directly to your inbox.</li>
                                    <li>Compare prices and book your preferred date online.</li>
                                </ol>
                            </div>

                            <p style="font-size: 14px; color: #777;">
                                We'll send you another email as soon as your first quote arrives.
                            </p>

                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            ${promoHtml}
                        </div>
                        <div style="text-align: center; padding-bottom: 25px; font-size: 11px; color: #aaa;">
                            &copy; ${new Date().getFullYear()} ${config.display_name}. Supporting energy efficiency.
                        </div>
                    </div>
                `;
                await client.send(smtpFrom, email, `Your job is live on ${websiteUrl.replace('https://', '')}`, customerHtml);
                emailSent = true;
                console.log(`[send-job-live-email] Notified customer: ${email} (tenant: ${tenant})`);
            } catch (custErr) {
                console.error(`[send-job-live-email] [SMTP ERROR] Failed to notify customer ${email} (tenant: ${tenant}):`, custErr);
            }
        }

        // 2. SMS to customer (independent of SMTP)
        const smsPhone = customerPhone || (assessmentId ? (await supabase
            .from('assessments')
            .select('contact_phone')
            .eq('id', assessmentId)
            .eq('tenant', tenant)
            .single()).data?.contact_phone : null);
        const smsResult = await trySendSms(smsPhone, `Hi ${customerName}, your BER assessment request in ${town || county} is now live on ${websiteUrl.replace('https://', '')}! Assessors in your area are being notified. We'll let you know when quotes arrive.`, config.phone_country_code);
        smsSent = smsResult === true;
        console.log(`[send-job-live-email] Customer SMS to ${smsPhone}: ${smsSent ? 'sent' : 'failed'} (tenant: ${tenant})`);

        // 3. Notify Relevant Contractors
        console.log(`[send-job-live-email] Starting contractor notifications for ${town} (tenant: ${tenant})...`);
        
        const { data: existingQuotes } = await supabase
            .from('quotes')
            .select('created_by')
            .eq('assessment_id', assessmentId)
            .eq('tenant', tenant);

        const quotedContractorIds = new Set((existingQuotes || []).map(q => q.created_by));

        const { data: contractors } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone, preferred_towns, preferred_counties, assessor_type')
            .eq('role', 'contractor')
            .eq('is_active', true)
            .eq('tenant', tenant)
            .is('deleted_at', null)
            .in('registration_status', ['active', 'completed']);

        let contractorSmsSentCount = 0;
        let contractorEmailSentCount = 0;

        // Get assessment job_type and property_type for assessor type matching
        const { data: assessmentData } = await supabase
            .from('assessments')
            .select('job_type, property_type')
            .eq('id', assessmentId)
            .eq('tenant', tenant)
            .single();

        if (contractors && contractors.length > 0) {
            const norm = (s: any) => (typeof s === 'string' ? s.trim().toLowerCase() : '');
            const targetTown = norm(town);
            const targetCounty = norm(county);

            const relevantContractors = contractors.filter(c => {
                if (quotedContractorIds.has(c.id)) {
                    console.log(`[send-job-live-email] Skipping ${c.email}: already quoted on this assessment`);
                    return false;
                }

                // Must have at least one preference configured (towns or counties)
                const prefTownsNorm = Array.isArray(c.preferred_towns)
                    ? c.preferred_towns.map(norm).filter(Boolean)
                    : [];
                const prefCountiesNorm = Array.isArray(c.preferred_counties)
                    ? c.preferred_counties.map(norm).filter(Boolean)
                    : [];
                if (prefTownsNorm.length === 0 && prefCountiesNorm.length === 0) {
                    console.log(`[send-job-live-email] Skipping ${c.email}: no preferred_towns or preferred_counties configured`);
                    return false;
                }

                // Town match (preferred) or county fallback – case-insensitive
                const townMatches = prefTownsNorm.length > 0 && targetTown
                    ? prefTownsNorm.includes(targetTown)
                    : false;
                const countyMatches = prefCountiesNorm.length > 0 && targetCounty
                    ? prefCountiesNorm.includes(targetCounty)
                    : false;

                if (!townMatches && !countyMatches) {
                    console.log(`[send-job-live-email] Skipping ${c.email}: '${town || county}' not in preferred_towns [${prefTownsNorm.join(', ')}] or preferred_counties [${prefCountiesNorm.join(', ')}]`);
                    return false;
                }

                // Assessor type match - consistent with send-job-reminder-cron
                const assessorType = c.assessor_type || 'Domestic Assessor';
                const isDomesticAssessor = assessorType.includes('Domestic');
                const isCommercialAssessor = assessorType.includes('Commercial');
                const isTechnicalAssessor = assessorType.includes('Technical');

                const isCommercialJob = assessmentData?.job_type === 'commercial' ||
                    ['commercial', 'office', 'retail', 'industrial', 'warehouse'].some(type =>
                        (assessmentData?.property_type || '').toLowerCase().includes(type),
                    );
                const isTechnicalJob = assessmentData?.job_type === 'technical';

                if (isCommercialJob && !isCommercialAssessor) return false;
                if (isTechnicalJob && !isTechnicalAssessor) return false;
                if (!isCommercialJob && !isTechnicalJob && !isDomesticAssessor) return false;

                return true;
            });

            // Deduplicate by email (in case the same email exists on multiple contractor profiles)
            const seenEmails = new Set<string>();
            const dedupedContractors = relevantContractors.filter(c => {
                const key = norm(c.email);
                if (!key || seenEmails.has(key)) return false;
                seenEmails.add(key);
                return true;
            });

            console.log(`[send-job-live-email] Notifying ${dedupedContractors.length} contractors in ${town} (tenant: ${tenant}, total contractors scanned: ${contractors.length})`);

            // Get assessment details for Eircode
            const { data: assessmentDetails } = await supabase
                .from('assessments')
                .select('eircode, property_address')
                .eq('id', assessmentId)
                .eq('tenant', tenant)
                .single();

            for (const contractor of dedupedContractors) {
                const jobLocation = town || county;
                const assessorName = contractor.full_name || 'Assessor';
                const quoteLink = `${websiteUrl}/quote/${assessmentId}?phone=${encodeURIComponent(contractor.phone || '')}`;

                // Send email (only if SMTP is ready)
                if (smtpReady) {
                    try {
                        const contractorHtml = generateContractorEmail(
                            county, 
                            town, 
                            assessorName, 
                            promoHtml, 
                            websiteUrl, 
                            jobType,
                            assessmentDetails?.eircode,
                            assessmentDetails?.property_address,
                            assessmentId,
                            contractor.phone
                        );
                        await client.send(smtpFrom, contractor.email, `New ${jobType === 'commercial' ? 'Commercial' : 'Domestic'} BER Job in ${jobLocation}`, contractorHtml);
                        contractorEmailSentCount++;
                        console.log(`[send-job-live-email] Notified contractor via email: ${contractor.email} (tenant: ${tenant})`);
                    } catch (err) {
                        console.error(`[send-job-live-email] [SMTP ERROR] Failed to notify contractor ${contractor.email} (tenant: ${tenant}):`, err);
                    }
                }

                // Send SMS with direct quote link (always, independent of SMTP)
                if (contractor.phone) {
                    const smsMessage = `Hi ${assessorName}, new job in ${jobLocation}! Quote here: ${quoteLink}`;
                    const smsSentToContractor = await trySendSms(contractor.phone, smsMessage, config.phone_country_code);
                    if (smsSentToContractor) contractorSmsSentCount++;
                    console.log(`[send-job-live-email] SMS to contractor ${contractor.phone}: ${smsSentToContractor ? 'sent' : 'failed'} (tenant: ${tenant})`);
                }
            }
        }

        if (smtpReady) {
            try { await client.close(); } catch (_) { /* ignore */ }
        }

        console.log(`[send-job-live-email] Summary (tenant: ${tenant}): customerEmail=${emailSent}, customerSms=${smsSent}, contractorEmails=${contractorEmailSentCount}, contractorSms=${contractorSmsSentCount}`);

        // Write notification status back to assessment
        if (assessmentId) {
            await supabase.from('assessments').update({
                job_live_email_sent: emailSent || contractorEmailSentCount > 0,
                job_live_sms_sent: smsSent || contractorSmsSentCount > 0,
                job_live_notified_at: new Date().toISOString(),
            }).eq('id', assessmentId).eq('tenant', tenant);
        }

        return new Response(JSON.stringify({ success: true, emailSent, smsSent, contractorEmailSentCount, contractorSmsSentCount, message: 'Process completed', tenant }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[send-job-live-email] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
