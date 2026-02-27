import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts"
import { generatePromoHtml } from "./templates/promo-section.ts"
import { generateAdminEmail } from "./templates/admin-notification.ts"
import { generateCustomerEmail } from "./templates/customer-confirmation.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { record } = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')!;
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
        const smtpUsername = Deno.env.get('SMTP_USERNAME')!;
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;

        // Fetch sponsors
        const { data: sponsors } = await supabase
            .from('sponsors')
            .select('*')
            .eq('is_active', true)
            .limit(3);

        const promoHtml = generatePromoHtml(sponsors || []);

        const client = new CustomSmtpClient();
        console.log(`[send-email] Attempting to send notifications for ${record.email}`);

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // 1. Admin Notification
            await client.send(
                smtpFrom,
                'hello@theberman.eu',
                `New Lead: ${record.name}`,
                generateAdminEmail(record, sponsors || [], promoHtml)
            );

            // 2. Customer Confirmation
            await client.send(
                smtpFrom,
                record.email,
                `Confirmation: We've received your inquiry`,
                generateCustomerEmail(record, promoHtml)
            );

            await client.close();
            console.log(`[send-email] SUCCESS: Emails sent for ${record.email}`);

            return new Response(
                JSON.stringify({ success: true, message: "Emails sent successfully" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
        } catch (smtpErr: any) {
            console.error("[send-email] SMTP ERROR", smtpErr);
            return new Response(
                JSON.stringify({ success: false, error: "SMTP Failed", details: smtpErr.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
    } catch (error: any) {
        console.error("[send-email] GLOBAL ERROR", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
