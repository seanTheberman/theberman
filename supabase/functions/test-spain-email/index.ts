import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts"
import { getTenantConfig } from "../shared/tenant.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, password } = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        const config = await getTenantConfig(supabase, 'spain');
        const websiteUrl = config.website_url || 'https://theberman.eu';

        // Assessor onboarding email template
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const startDateStr = startDate.toLocaleDateString('en-IE', dateOptions);
        const endDateStr = endDate.toLocaleDateString('en-IE', dateOptions);

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
                <h1 style="color: #007F00; text-align: center;">Registration Successful!</h1>
                <p>Hello Test User,</p>
                <p>Congratulations! Your registration as a BER Assessor on The Berman platform is now complete and your membership is active.</p>

                <div style="background-color: #f9fafb; padding: 15px; border-radius: 0.5rem; margin: 20px 0;">
                    <h2 style="font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Membership Details</h2>
                    <p><strong>Status:</strong> Active</p>
                    <p><strong>Start Date:</strong> ${startDateStr}</p>
                    <p><strong>Valid Until:</strong> ${endDateStr}</p>
                </div>

                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 0.5rem; margin: 20px 0; border: 1px solid #c8e6c9;">
                    <h2 style="font-size: 1.1rem; border-bottom: 1px solid #c8e6c9; padding-bottom: 10px; color: #007F00;">Your Login Credentials</h2>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${password || '(Use the password you set during registration)'}</p>
                </div>

                <p>You can now log in to your dashboard to manage your profile and view job notifications.</p>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${websiteUrl}/login" style="background-color: #007F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">Go to Dashboard</a>
                </div>

                <p style="margin-top: 40px; font-size: 0.8rem; color: #6b7280; text-align: center;">
                    If you have any questions, please contact us at ${config.smtp_from}
                </p>
            </div>
        `;

        const client = new CustomSmtpClient(config.domain);
        await client.connect(config.smtp_hostname, config.smtp_port);
        await client.authenticate(config.smtp_username, config.smtp_password);

        await client.send(
            config.smtp_from,
            email,
            'Test Email - Spain Tenant',
            emailHtml
        );

        await client.close();

        return new Response(
            JSON.stringify({ success: true, message: `Email sent to ${email}` }),
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
