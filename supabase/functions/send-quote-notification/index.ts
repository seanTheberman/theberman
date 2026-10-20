// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { trySendSms } from "../shared/twilio.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generateHomeownerQuoteEmail } from "./templates/homeowner-notification.ts";
import { generatePosterQuoteEmail } from "./templates/poster-notification.ts";
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
        const { assessmentId, tenant: passedTenant } = await req.json();

        if (!assessmentId) {
            throw new Error("assessmentId is required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Fetch Assessment & Homeowner Details (without tenant filter — derive tenant from the record)
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, status, posted_by, user_id, referred_by_listing_id, tenant')
            .eq('id', assessmentId)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        // Use the assessment's actual tenant, falling back to the passed tenant or 'ireland'
        const tenant = assessment.tenant || passedTenant || 'ireland';

        // Load tenant config
        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const logoUrl = config.logo_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error(`[send-quote-notification] SMTP Secrets missing for tenant ${tenant}`);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const client = new CustomSmtpClient(config.domain);

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // 2. Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
            const promoHtml = generatePromoHtml(sponsors || [], tenant);

            const isSpanish = tenant === 'spain';
            const isPortuguese = tenant === 'portugal';
            const isFrench = tenant === 'france';

            // 3. Generate Email HTML for homeowner
            const emailHtml = generateHomeownerQuoteEmail(assessment.contact_name, websiteUrl, promoHtml, tenant, config.display_name, logoUrl);

            // 4. Send Email to homeowner
            await client.send(smtpFrom, assessment.contact_email, isSpanish ? 'Has recibido un presupuesto.' : isPortuguese ? 'Recebeu um orçamento.' : isFrench ? 'Vous avez reçu un devis.' : tenant === 'england' ? 'EPC quote received.' : 'BER quote received.', emailHtml);

            // 4b. Send email to job poster (business or admin) if not posted by homeowner
            if (assessment.posted_by && assessment.posted_by !== 'homeowner') {
                let posterEmail: string | null = null;
                let posterName = '';
                try {
                    if (assessment.posted_by === 'business' && assessment.referred_by_listing_id) {
                        const { data: listing } = await supabase
                            .from('catalogue_listings')
                            .select('email, company_name')
                            .eq('id', assessment.referred_by_listing_id)
                            .maybeSingle();
                        if (listing) {
                            posterEmail = listing.email;
                            posterName = listing.company_name || '';
                        }
                    } else if (assessment.posted_by === 'admin') {
                        const { data: appSetting } = await supabase
                            .from('app_settings')
                            .select('support_email')
                            .eq('tenant', tenant)
                            .maybeSingle();
                        if (appSetting?.support_email) {
                            posterEmail = appSetting.support_email;
                            posterName = isSpanish ? 'Administrador' : isPortuguese ? 'Administrador' : isFrench ? 'Administrateur' : 'Admin';
                        }
                    }

                    if (posterEmail) {
                        const posterHtml = generatePosterQuoteEmail(posterName, websiteUrl, promoHtml, tenant, config.display_name, logoUrl);
                        await client.send(smtpFrom, posterEmail, isSpanish ? 'Nuevo presupuesto en tu trabajo publicado.' : isPortuguese ? 'Novo orçamento no seu trabalho publicado.' : isFrench ? 'Nouveau devis sur votre mission publiée.' : 'New quote on your posted job.', posterHtml);
                        console.log(`[send-quote-notification] Copied poster (${assessment.posted_by}): ${posterEmail} (tenant: ${tenant})`);
                    }
                } catch (posterErr) {
                    console.error(`[send-quote-notification] [SMTP ERROR] Failed to notify poster (${assessment.posted_by}):`, posterErr);
                }
            }

            // SMS to homeowner — link directly to their quotes dashboard
            const dashboardLink = `${websiteUrl}/dashboard/user`;
            await trySendSms(assessment.contact_phone, isSpanish
                ? `Hola ${assessment.contact_name}, ¡buenas noticias! Has recibido un nuevo presupuesto. Inicia sesión para revisarlo y comparar precios: ${dashboardLink}`
                : isPortuguese
                    ? `Olá ${assessment.contact_name}, boas notícias! Recebeu um novo orçamento. Inicie sessão para rever e comparar preços: ${dashboardLink}`
                    : isFrench
                        ? `Bonjour ${assessment.contact_name}, bonnes nouvelles ! Vous avez reçu un nouveau devis. Connectez-vous pour le consulter et comparer les prix : ${dashboardLink}`
                        : tenant === 'england'
                            ? `Hi ${assessment.contact_name}, great news! You've received a new EPC quote. Log in to review and compare prices: ${dashboardLink}`
                            : `Hi ${assessment.contact_name}, great news! You've received a new BER quote. Log in to review and compare prices: ${dashboardLink}`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);

            await client.close();

            // Mark the latest quote as notified
            const { data: latestQuote } = await supabase
                .from('quotes')
                .select('id')
                .eq('assessment_id', assessmentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (latestQuote) {
                await supabase.from('quotes').update({ notification_status: 'sent' }).eq('id', latestQuote.id);
            }

            console.log(`[send-quote-notification] SUCCESS: Notification sent to ${assessment.contact_email} (tenant: ${tenant})`);
            return new Response(JSON.stringify({ success: true, message: 'Notification email & SMS sent to homeowner', tenant }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error(`[send-quote-notification] SMTP ERROR (tenant: ${tenant})`, smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[send-quote-notification] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { status: 400, headers: responseHeaders });
    }
});
