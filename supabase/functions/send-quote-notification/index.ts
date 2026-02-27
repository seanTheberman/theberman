// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { generateHomeownerQuoteEmail } from "./templates/homeowner-notification.ts";
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
        const { assessmentId } = await req.json();

        if (!assessmentId) {
            throw new Error("assessmentId is required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Fetch Assessment & Homeowner Details
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, status')
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
            console.error("[send-quote-notification] SMTP Secrets missing");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // 2. Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // 3. Generate Email HTML
            const emailHtml = generateHomeownerQuoteEmail(assessment.contact_name, websiteUrl, promoHtml);

            // 4. Send Email
            await client.send(smtpFrom, assessment.contact_email, 'BER quote received.', emailHtml);

            await client.close();
            console.log(`[send-quote-notification] SUCCESS: Notification sent to ${assessment.contact_email}`);
            return new Response(JSON.stringify({ success: true, message: 'Notification email sent to homeowner' }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error("[send-quote-notification] SMTP ERROR", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-quote-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
