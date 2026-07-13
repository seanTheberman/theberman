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

        const client = new CustomSmtpClient(config.domain);

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            const isSpanish = tenant === 'spain';
            const isEngland = tenant === 'england';
            const isPortuguese = tenant === 'portugal';
            const certificateName = isSpanish ? 'certificado energético' : (isPortuguese ? 'certificado energético' : (isEngland ? 'EPC' : 'BER'));

            // 2. Notify Homeowner
            const homeownerHtml = generateHomeownerAcceptanceEmail(
                assessment.contact_name,
                contractor.full_name,
                quote.price,
                websiteUrl,
                promoHtml,
                tenant,
                config.display_name
            );
            await client.send(smtpFrom, assessment.contact_email, isSpanish ? `Reserva Confirmada - ${websiteUrl.replace('https://', '')}` : isPortuguese ? `Reserva Confirmada - ${websiteUrl.replace('https://', '')}` : `Booking Confirmed - ${websiteUrl.replace('https://', '')}`, homeownerHtml);
            console.log(`[send-acceptance-notification] Notified homeowner: ${assessment.contact_email} (tenant: ${tenant})`);

            // 3. Notify Contractor
            const contractorHtml = generateContractorBookingEmail(
                contractor.full_name,
                assessment.contact_name,
                assessment.property_address,
                quote.price,
                websiteUrl,
                promoHtml,
                tenant,
                config.display_name
            );
            await client.send(smtpFrom, contractor.email, isSpanish ? '¡Nueva Reserva Confirmada!' : isPortuguese ? 'Nova Reserva Confirmada!' : 'New Booking Confirmed!', contractorHtml);
            console.log(`[send-acceptance-notification] Notified contractor: ${contractor.email} (tenant: ${tenant})`);

            // SMS to homeowner
            await trySendSms(assessment.contact_phone, isSpanish
                ? `Hola ${assessment.contact_name}, tu reserva de certificado energético con ${contractor.full_name} está confirmada. Importe: EUR ${quote.price}. Ver detalles en ${websiteUrl}`
                : isPortuguese
                    ? `Olá ${assessment.contact_name}, a sua reserva de certificado energético com ${contractor.full_name} está confirmada. Valor: EUR ${quote.price}. Ver detalhes em ${websiteUrl}`
                    : `Hi ${assessment.contact_name}, your ${certificateName} booking with ${contractor.full_name} is confirmed! Amount: EUR ${quote.price}. View details at ${websiteUrl}`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            // SMS to contractor
            await trySendSms(contractor.phone, isSpanish
                ? `Hola ${contractor.full_name}, ¡nueva reserva confirmada! Cliente: ${assessment.contact_name}, Dirección: ${assessment.property_address}. Inicia sesión en ${websiteUrl.replace('https://', '')} para más detalles.`
                : isPortuguese
                    ? `Olá ${contractor.full_name}, nova reserva confirmada! Cliente: ${assessment.contact_name}, Morada: ${assessment.property_address}. Inicie sessão em ${websiteUrl.replace('https://', '')} para mais detalhes.`
                    : `Hi ${contractor.full_name}, new booking confirmed! Customer: ${assessment.contact_name}, Address: ${assessment.property_address}. Log in to ${websiteUrl.replace('https://', '')} for details.`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

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
