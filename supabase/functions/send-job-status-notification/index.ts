// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generatePromoHtml } from "./templates/promo-section.ts";
import { generateStatusEmail } from "./templates/job-status-templates.ts";

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
        const { assessmentId, status, details, tenant = 'ireland' } = await req.json();

        if (!assessmentId || !status) {
            throw new Error("assessmentId and status are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Load tenant config
        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        // Fetch Assessment & Homeowner Details
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, town, county')
            .eq('id', assessmentId)
            .eq('tenant', tenant)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error(`[send-job-status-notification] SMTP Secrets missing for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const client = new CustomSmtpClient(config.domain);

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            const isSpanish = tenant === 'spain';
            const isPortuguese = tenant === 'portugal';

            // Generate Email HTML
            const emailHtml = generateStatusEmail(
                assessment.contact_name,
                status,
                { ...details, town: assessment.town },
                promoHtml,
                websiteUrl,
                tenant,
                config.display_name
            );

            const isEngland = tenant === 'england';
            const certificateName = isSpanish ? 'Certificación Energética' : (isPortuguese ? 'Certificado Energético' : (isEngland ? 'EPC' : 'BER'));
            const inspectionName = isSpanish ? 'Visita' : (isPortuguese ? 'Visita' : (isEngland ? 'Assessment' : 'Inspection'));
            const subjectMap = isSpanish ? {
                'scheduled': `Tu ${inspectionName} de ${certificateName} está Programada`,
                'rescheduled': `La Fecha de tu ${inspectionName} de ${certificateName} ha Cambiado`,
                'completed': 'Tu Certificado Energético está Listo'
            } : isPortuguese ? {
                'scheduled': `A sua ${inspectionName} de ${certificateName} está Agendada`,
                'rescheduled': `A Data da sua ${inspectionName} de ${certificateName} foi Alterada`,
                'completed': 'O seu Certificado Energético está Pronto'
            } : {
                'scheduled': `Your ${certificateName} ${inspectionName} is Scheduled`,
                'rescheduled': `Your ${certificateName} ${inspectionName} Date has Changed`,
                'completed': `Your ${certificateName} Assessment is Complete`
            };

            // Send Email
            await client.send(smtpFrom, assessment.contact_email, subjectMap[status] || (isSpanish ? 'Actualización de tu Certificado Energético' : isPortuguese ? `Atualização do seu ${certificateName}` : `Update on your ${certificateName} Assessment`), emailHtml);

            // SMS to homeowner
            const displayDomain = websiteUrl.replace('https://', '');
            const smsMessages: Record<string, string> = isSpanish ? {
                'scheduled': `Hola ${assessment.contact_name}, tu visita de certificación energética en ${assessment.town || assessment.county} ha sido programada${details?.date ? ' para el ' + details.date : ''}. Revisa tu correo para más detalles. - ${displayDomain}`,
                'rescheduled': `Hola ${assessment.contact_name}, la fecha de tu visita de certificación ha cambiado${details?.date ? ' al ' + details.date : ''}. Revisa tu correo para más detalles. - ${displayDomain}`,
                'completed': `Hola ${assessment.contact_name}, ¡tu certificado energético está listo! Inicia sesión en ${displayDomain} para ver los resultados.`,
            } : isPortuguese ? {
                'scheduled': `Olá ${assessment.contact_name}, a sua visita de certificado energético em ${assessment.town || assessment.county} foi agendada${details?.date ? ' para ' + details.date : ''}. Verifique o seu email para mais detalhes. - ${displayDomain}`,
                'rescheduled': `Olá ${assessment.contact_name}, a data da sua visita de certificado energético foi alterada${details?.date ? ' para ' + details.date : ''}. Verifique o seu email para detalhes atualizados. - ${displayDomain}`,
                'completed': `Olá ${assessment.contact_name}, o seu certificado energético está pronto! Inicie sessão em ${displayDomain} para ver os resultados.`,
            } : {
                'scheduled': `Hi ${assessment.contact_name}, your ${certificateName} ${inspectionName.toLowerCase()} in ${assessment.town || assessment.county} has been scheduled${details?.date ? ' for ' + details.date : ''}. Check your email for details. - ${displayDomain}`,
                'rescheduled': `Hi ${assessment.contact_name}, your ${certificateName} ${inspectionName.toLowerCase()} date has changed${details?.date ? ' to ' + details.date : ''}. Check your email for updated details. - ${displayDomain}`,
                'completed': `Hi ${assessment.contact_name}, your ${certificateName} assessment is complete! Log in to ${displayDomain} to view your results.`,
            };
            await trySendSms(assessment.contact_phone, smsMessages[status] || (isSpanish ? `Hola ${assessment.contact_name}, hay una actualización sobre tu certificado energético. Consulta ${displayDomain} para más detalles.` : isPortuguese ? `Olá ${assessment.contact_name}, há uma atualização sobre o seu certificado energético. Consulte ${displayDomain} para mais detalhes.` : `Hi ${assessment.contact_name}, there's an update on your ${certificateName} assessment. Check ${displayDomain} for details.`), config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            await client.close();
            console.log(`[send-job-status-notification] SUCCESS: Notification (${status}) sent to ${assessment.contact_email} (tenant: ${tenant})`);
            return new Response(JSON.stringify({ success: true, message: `Notification email + SMS (${status}) sent to homeowner`, tenant }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error(`[send-job-status-notification] SMTP ERROR (tenant: ${tenant})`, smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-job-status-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
