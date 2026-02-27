// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
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
        const { assessmentId, quoteId } = await req.json();

        if (!assessmentId || !quoteId) {
            throw new Error("assessmentId and quoteId are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Fetch Data
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, property_address')
            .eq('id', assessmentId)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('price, created_by, profiles!quotes_created_by_profile_fkey(full_name, email)')
            .eq('id', quoteId)
            .single();

        if (quoteError || !quote) {
            throw new Error(`Failed to fetch quote: ${quoteError?.message}`);
        }

        const contractor = quote.profiles;

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[send-acceptance-notification] SMTP Secrets missing");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // 2. Notify Homeowner
            const homeownerHtml = generateHomeownerAcceptanceEmail(
                assessment.contact_name,
                contractor.full_name,
                quote.price,
                websiteUrl,
                promoHtml
            );
            await client.send(smtpFrom, assessment.contact_email, 'Booking Confirmed - TheBerman.eu', homeownerHtml);
            console.log(`[send-acceptance-notification] Notified homeowner: ${assessment.contact_email}`);

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
            console.log(`[send-acceptance-notification] Notified contractor: ${contractor.email}`);

            await client.close();
            return new Response(JSON.stringify({ success: true, message: 'Acceptance notifications sent' }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error("[send-acceptance-notification] SMTP ERROR", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-acceptance-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
