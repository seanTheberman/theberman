// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generateHomeownerAcceptanceEmail } from "./templates/homeowner-acceptance.ts";
import { generateContractorBookingEmail } from "./templates/contractor-booking.ts";
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
        const { assessmentId, quoteId, tenant = 'ireland' } = await req.json();

        if (!assessmentId || !quoteId) {
            throw new Error("assessmentId and quoteId are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Load tenant config
        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        // 1. Fetch Data
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, property_address')
            .eq('id', assessmentId)
            .eq('tenant', tenant)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('price, created_by, profiles!quotes_created_by_profile_fkey(full_name, email, phone)')
            .eq('id', quoteId)
            .eq('tenant', tenant)
            .single();

        if (quoteError || !quote) {
            throw new Error(`Failed to fetch quote: ${quoteError?.message}`);
        }

        const contractor = quote.profiles;

        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error(`[send-acceptance-notification] SMTP Secrets missing for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // 2. Notify Homeowner
            const homeownerHtml = generateHomeownerAcceptanceEmail(
                assessment.contact_name,
                contractor.full_name,
                quote.price,
                websiteUrl,
                promoHtml
            );
            await client.send(smtpFrom, assessment.contact_email, `Booking Confirmed - ${websiteUrl.replace('https://', '')}`, homeownerHtml);
            console.log(`[send-acceptance-notification] Notified homeowner: ${assessment.contact_email} (tenant: ${tenant})`);

            // 3. Notify Contractor
            const contractorHtml = generateContractorBookingEmail(
                contractor.full_name,
                assessment.contact_name,
                assessment.property_address,
                quote.price,
                websiteUrl,
                promoHtml
            );
            await client.send(smtpFrom, contractor.email, 'New Booking Confirmed!', contractorHtml);
            console.log(`[send-acceptance-notification] Notified contractor: ${contractor.email} (tenant: ${tenant})`);

            // SMS to homeowner
            await trySendSms(assessment.contact_phone, `Hi ${assessment.contact_name}, your BER booking with ${contractor.full_name} is confirmed! Amount: EUR ${quote.price}. View details at ${websiteUrl}`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            // SMS to contractor
            await trySendSms(contractor.phone, `Hi ${contractor.full_name}, new booking confirmed! Customer: ${assessment.contact_name}, Address: ${assessment.property_address}. Log in to ${websiteUrl.replace('https://', '')} for details.`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            await client.close();
            return new Response(JSON.stringify({ success: true, message: 'Acceptance notifications sent (email + SMS)', tenant }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error(`[send-acceptance-notification] SMTP ERROR (tenant: ${tenant})`, smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-acceptance-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
