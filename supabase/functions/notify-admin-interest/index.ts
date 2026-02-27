// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { registrationData, type } = await req.json()
        const {
            user_full_name,
            user_email,
            companyName,
            phone,
            county
        } = registrationData

        // Initialize Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        // 1. Send Admin Notification Email
        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')!;
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
        const smtpUsername = Deno.env.get('SMTP_USERNAME')!;
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;

        const client = new CustomSmtpClient();
        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // Fetch admin email from settings or use fallback
            const { data: settings } = await supabase.from('app_settings').select('support_email').single();
            const adminEmail = settings?.support_email || 'hello@theberman.eu';

            const adminEmailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
                    <h1 style="color: #F59E0B; text-align: center;">New Interest: ${type === 'business' ? 'Business Registration' : 'Assessor Registration'}</h1>
                    <p>A new ${type} has started the registration process but has not completed payment yet.</p>
                    
                    <div style="background-color: #fffbeb; padding: 15px; border-radius: 0.5rem; margin: 20px 0; border: 1px solid #fef3c7;">
                        <h2 style="font-size: 1.1rem; border-bottom: 1px solid #fef3c7; padding-bottom: 10px;">Details Received</h2>
                        <p><strong>Name:</strong> ${user_full_name}</p>
                        <p><strong>Email:</strong> ${user_email}</p>
                        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                        <p><strong>County:</strong> ${county || 'N/A'}</p>
                    </div>

                    <p style="color: #6b7280; font-size: 0.9rem;">The user has been redirected to the payment page. You may want to follow up if they don't complete registration within 24 hours.</p>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://theberman.eu/admin" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">View Admin Dashboard</a>
                    </div>
                </div>
            `;

            await client.send(
                smtpFrom,
                adminEmail,
                `INTEREST: New ${type === 'business' ? 'Business' : 'Assessor'} signup started - ${companyName || user_full_name}`,
                adminEmailHtml
            );

            await client.close();
        } catch (smtpErr: any) {
            console.error("[notify-admin-interest] SMTP ERROR", smtpErr);
        }

        return new Response(
            JSON.stringify({ success: true, message: "Interest notification sent" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )

    } catch (error: any) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
