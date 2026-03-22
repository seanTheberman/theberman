// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
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
        const { email, customerName, county, town, assessmentId, jobType } = await req.json();
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Update assessment status
        if (assessmentId) {
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'live' })
                .eq('id', assessmentId);

            if (updateError) {
                console.error(`[send-job-live-email] Error updating assessment ${assessmentId}:`, updateError);
            }
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[send-job-live-email] SMTP Secrets missing");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // 1. Notify Customer
            try {
                const customerHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                        <div style="background-color: #007F00; color: white; padding: 35px 20px; text-align: center;">
                            <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 30px; margin-bottom: 12px; filter: brightness(0) invert(1);">
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
                            &copy; ${new Date().getFullYear()} The Berman. Supporting Ireland's energy efficiency.
                        </div>
                    </div>
                `;
                await client.send(smtpFrom, email, 'Your job is live on TheBerman.eu', customerHtml);
                console.log(`[send-job-live-email] Notified customer: ${email}`);
            } catch (custErr) {
                console.error(`[send-job-live-email] [SMTP ERROR] Failed to notify customer ${email}:`, custErr);
            }

            // 2. Notify Relevant Contractors - RE-ENABLED
            console.log(`[send-job-live-email] Starting contractor notifications for ${county}...`);
            
            const { data: existingQuotes } = await supabase
                .from('quotes')
                .select('created_by')
                .eq('assessment_id', assessmentId);

            const quotedContractorIds = new Set((existingQuotes || []).map(q => q.created_by));

            const { data: contractors } = await supabase
                .from('profiles')
                .select('id, email, full_name, preferred_counties')
                .eq('role', 'contractor')
                .eq('is_active', true)
                .is('deleted_at', null)
                .in('registration_status', ['active', 'completed']);

            if (contractors && contractors.length > 0) {
                const relevantContractors = contractors.filter(c => {
                    if (quotedContractorIds.has(c.id)) return false;
                    if (!c.preferred_counties || c.preferred_counties.length === 0) return true;
                    return c.preferred_counties.includes(county);
                });

                console.log(`[send-job-live-email] Notifying ${relevantContractors.length} contractors in ${county}`);

                // Get assessment details for Eircode
                const { data: assessmentDetails } = await supabase
                    .from('assessments')
                    .select('eircode, property_address')
                    .eq('id', assessmentId)
                    .single();

                for (const contractor of relevantContractors) {
                    try {
                        const contractorHtml = generateContractorEmail(
                            county, 
                            town, 
                            contractor.full_name, 
                            promoHtml, 
                            websiteUrl, 
                            jobType,
                            assessmentDetails?.eircode,
                            assessmentDetails?.property_address,
                            assessmentId
                        );
                        await client.send(smtpFrom, contractor.email, `New ${jobType === 'commercial' ? 'Commercial' : 'Domestic'} BER Job in ${town || county}`, contractorHtml);
                        console.log(`[send-job-live-email] Notified contractor: ${contractor.email}`);
                    } catch (err) {
                        console.error(`[send-job-live-email] [SMTP ERROR] Failed to notify contractor ${contractor.email}:`, err);
                    }
                }
            }

            await client.close();
            return new Response(JSON.stringify({ success: true, message: 'Process completed' }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error("[send-job-live-email] SMTP GLOBAL ERROR", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Connection Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-job-live-email] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
