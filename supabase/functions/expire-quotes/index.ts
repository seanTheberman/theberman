// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";

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

        // Find all pending quotes older than 5 days
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

        const { data: expiredQuotes, error: fetchError } = await supabase
            .from('quotes')
            .select(`
                id,
                assessment_id,
                created_by,
                price,
                created_at,
                contractor:profiles!quotes_created_by_profile_fkey(full_name, email),
                assessment:assessments(town, county, property_address, contact_name, job_type)
            `)
            .eq('status', 'pending')
            .lt('created_at', fiveDaysAgo);

        if (fetchError) {
            console.error('[expire-quotes] Error fetching expired quotes:', fetchError);
            throw fetchError;
        }

        if (!expiredQuotes || expiredQuotes.length === 0) {
            console.log('[expire-quotes] No expired quotes found');
            return new Response(
                JSON.stringify({ success: true, message: 'No expired quotes', count: 0 }),
                { headers: responseHeaders }
            );
        }

        console.log(`[expire-quotes] Found ${expiredQuotes.length} expired quote(s)`);

        // SMTP setup for notifications
        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        let smtpClient: CustomSmtpClient | null = null;

        if (smtpHostname && smtpUsername && smtpPassword) {
            try {
                smtpClient = new CustomSmtpClient();
                await smtpClient.connect(smtpHostname, parseInt(smtpPortStr || '587'));
                await smtpClient.authenticate(smtpUsername, smtpPassword);
            } catch (smtpErr) {
                console.error('[expire-quotes] SMTP connection failed:', smtpErr);
                smtpClient = null;
            }
        }

        let expiredCount = 0;
        const assessmentsToRelist = new Set<string>();

        for (const quote of expiredQuotes) {
            try {
                // 1. Update quote status to 'expired'
                const { error: updateError } = await supabase
                    .from('quotes')
                    .update({ status: 'rejected' })
                    .eq('id', quote.id);

                if (updateError) {
                    console.error(`[expire-quotes] Failed to expire quote ${quote.id}:`, updateError);
                    continue;
                }

                expiredCount++;
                console.log(`[expire-quotes] Expired quote ${quote.id}`);

                // Track assessment for relisting
                if (quote.assessment_id) {
                    assessmentsToRelist.add(quote.assessment_id);
                }

                // 2. Notify the assessor via email
                if (smtpClient && quote.contractor) {
                    try {
                        const contractorName = quote.contractor.full_name || 'Assessor';
                        const contractorEmail = quote.contractor.email;
                        const town = quote.assessment?.town || 'Unknown';
                        const county = quote.assessment?.county || '';

                        const emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Quote Expired</h1>
                                </div>

                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    Hi ${contractorName},
                                </p>

                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    Your quote of <strong>€${quote.price + 10}</strong> for the BER assessment in 
                                    <strong>${town}${county ? ', ' + county : ''}</strong> has expired as the homeowner 
                                    did not respond within the 5-day acceptance window.
                                </p>

                                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <p style="color: #666; font-size: 14px; margin: 0;">
                                        <strong>What happens next?</strong><br>
                                        The job has been relisted on the platform so new assessors can quote. 
                                        You're welcome to submit a new quote if you're still interested.
                                    </p>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${websiteUrl}/login" 
                                       style="display: inline-block; background: #007F00; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                                        View Available Jobs
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    This is an automated notification from TheBerman.eu
                                </p>
                            </div>
                        `;

                        await smtpClient.send(
                            smtpFrom,
                            contractorEmail,
                            `Quote Expired: BER Job in ${town}`,
                            emailHtml
                        );
                        console.log(`[expire-quotes] Notified assessor: ${contractorEmail}`);
                    } catch (emailErr) {
                        console.error(`[expire-quotes] Failed to email assessor for quote ${quote.id}:`, emailErr);
                    }
                }
            } catch (quoteErr) {
                console.error(`[expire-quotes] Error processing quote ${quote.id}:`, quoteErr);
            }
        }

        // 3. Relist assessments - ensure they're set back to 'live' status
        for (const assessmentId of assessmentsToRelist) {
            try {
                // Check if there are any remaining pending or accepted quotes
                const { data: remainingQuotes } = await supabase
                    .from('quotes')
                    .select('id, status')
                    .eq('assessment_id', assessmentId)
                    .in('status', ['pending', 'accepted']);

                // If no active quotes remain, relist the job
                if (!remainingQuotes || remainingQuotes.length === 0) {
                    const { error: relistError } = await supabase
                        .from('assessments')
                        .update({ status: 'live' })
                        .eq('id', assessmentId);

                    if (relistError) {
                        console.error(`[expire-quotes] Failed to relist assessment ${assessmentId}:`, relistError);
                    } else {
                        console.log(`[expire-quotes] Relisted assessment ${assessmentId} for new quotes`);
                    }
                }
            } catch (relistErr) {
                console.error(`[expire-quotes] Error relisting assessment ${assessmentId}:`, relistErr);
            }
        }

        if (smtpClient) {
            try { await smtpClient.close(); } catch (e) { }
        }

        console.log(`[expire-quotes] Complete: ${expiredCount} quotes expired, ${assessmentsToRelist.size} assessments checked for relisting`);

        return new Response(
            JSON.stringify({
                success: true,
                message: `Expired ${expiredCount} quotes, checked ${assessmentsToRelist.size} assessments for relisting`
            }),
            { headers: responseHeaders }
        );

    } catch (err: any) {
        console.error('[expire-quotes] GLOBAL ERROR:', err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Internal error' }),
            { status: 500, headers: responseHeaders }
        );
    }
});
