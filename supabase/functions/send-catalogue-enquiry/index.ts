// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { generateBusinessEmail } from "./templates/business-notification.ts"
import { generateCustomerConfirmationEmail } from "./templates/customer-confirmation.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const jsonBody = await req.json();
        const { record, businessEmail, businessName } = jsonBody;

        if (!record || !businessEmail) {
            throw new Error("Missing required fields: record or businessEmail");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
        const smtpUsername = Deno.env.get('SMTP_USERNAME')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[send-catalogue-enquiry] SMTP Secrets missing");
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        // 1. Send notification to the business
        const businessHtml = generateBusinessEmail(record, businessName || 'Service Provider')
        await client.send(smtpFrom!, businessEmail, `New Enquiry: ${record.name}`, businessHtml)
        console.log(`[send-catalogue-enquiry] Notified business: ${businessEmail}`);

        // 2. Send confirmation to the customer
        const customerHtml = generateCustomerConfirmationEmail(record, businessName || 'Service Provider')
        await client.send(smtpFrom!, record.email, `Enquiry Confirmation: ${businessName || 'Service Provider'}`, customerHtml)
        console.log(`[send-catalogue-enquiry] Notified customer: ${record.email}`);

        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: 'Enquiry sent successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-catalogue-enquiry] GLOBAL ERROR", err);
        return new Response(
            JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
