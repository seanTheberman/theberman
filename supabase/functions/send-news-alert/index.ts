import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { record, old_record } = await req.json()
        
        // Only fire if the article just went live
        const isNowLive = record.is_live === true && (!old_record || old_record.is_live === false);
        if (!isNowLive) {
            return new Response(JSON.stringify({ success: true, message: "Skipped: Not newly live" }), { headers: corsHeaders });
        }

        const tenant = record?.tenant || 'ireland';
        const isSpanish = tenant === 'spain';
        const brandName = isSpanish ? 'Certificado Energético' : 'The Berman';

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey!);

        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = parseInt(config.smtp_port || '587');
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const smtpFrom = config.smtp_from || `${config.display_name} <${smtpUsername}>`;
        const websiteUrl = (config.website_url || 'https://theberman.eu').replace(/\/$/, '');

        // Fetch subscribers scoped to tenant
        const { data: subscribers, error: subError } = await supabase
            .from('leads')
            .select('email')
            .eq('tenant', tenant)
            .in('purpose', ['News Subscription', 'Home Energy Guide']);

        if (subError) throw subError;
        if (!subscribers || subscribers.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "No subscribers found" }), { headers: corsHeaders });
        }

        if (smtpHostname && smtpUsername && smtpPassword) {
            const client = new CustomSmtpClient(config.domain);

            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${isSpanish ? 'Últimas Noticias' : 'Breaking News'}</h1>
                    </div>
                    <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                        <img src="${record.image_url}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 25px;" />
                        <h2 style="font-size: 26px; font-weight: 800; line-height: 1.2; margin-bottom: 15px; color: #111;">${record.title}</h2>
                        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">${record.excerpt}</p>
                        <div style="text-align: center;">
                            <a href="${websiteUrl}/news/${record.id}" style="display: inline-block; background-color: #007F00; color: white; padding: 15px 30px; border-radius: 12px; font-size: 16px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 15px rgba(0,127,0,0.2);">${isSpanish ? 'Leer Noticia Completa' : 'Read Full Story'}</a>
                        </div>
                    </div>
                    <div style="padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
                        <p>&copy; 2026 ${brandName}. ${isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
                        <p>${isSpanish ? 'Has recibido este correo porque te suscribiste a las actualizaciones de noticias de' : 'You received this because you subscribed to'} ${brandName} News Updates.</p>
                    </div>
                </div>
            `;

            for (const sub of subscribers) {
                try {
                    await client.send(smtpFrom, sub.email, `${isSpanish ? 'ÚLTIMA HORA' : 'BREAKING'}: ${record.title}`, emailHtml);
                } catch (sendErr) {
                    console.error(`Failed to send to ${sub.email}:`, sendErr);
                }
            }

            await client.close();
            return new Response(JSON.stringify({ success: true, message: `Sent to ${subscribers.length} subscribers` }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true, message: "Logged (dev mode)" }), { headers: corsHeaders });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: 'Failed', details: error.message }), { headers: corsHeaders });
    }
})
