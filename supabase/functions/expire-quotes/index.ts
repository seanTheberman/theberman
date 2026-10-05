// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";

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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const body = await req.json().catch(() => ({}));
        const tenant = body.tenant || 'ireland';

        // Quotes should only expire when the job (assessment) itself has expired.
        // Jobs expire after 7 days of inactivity (no quotes, acceptances, or scheduling).
        // Find assessments that have expired, then expire their pending quotes.

        const EXPIRY_DAYS = 7;
        const OPEN_JOB_STATUSES = ['live', 'submitted', 'pending_quote'];

        // Fetch all open assessments with their quotes to determine which have expired
        const { data: openAssessments, error: assessError } = await supabase
            .from('assessments')
            .select(`
                id,
                status,
                created_at,
                scheduled_date,
                completed_at,
                quotes(id, status, created_at)
            `)
            .in('status', OPEN_JOB_STATUSES);

        if (assessError) {
            console.error('[expire-quotes] Error fetching assessments:', assessError);
            throw assessError;
        }

        // Determine which assessments have expired (7-day inactivity rule)
        const expiredAssessmentIds: string[] = [];
        for (const assess of (openAssessments || [])) {
            let lastActivity = new Date(assess.created_at).getTime();
            if (assess.scheduled_date) {
                const sd = new Date(assess.scheduled_date).getTime();
                if (sd > lastActivity) lastActivity = sd;
            }
            if (assess.quotes) {
                for (const q of assess.quotes) {
                    const qd = new Date(q.created_at).getTime();
                    if (qd > lastActivity) lastActivity = qd;
                }
            }
            const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity >= EXPIRY_DAYS) {
                expiredAssessmentIds.push(assess.id);
            }
        }

        // Also include assessments already marked as 'expired' in the DB
        const { data: dbExpiredAssessments } = await supabase
            .from('assessments')
            .select('id')
            .eq('status', 'expired');

        for (const a of (dbExpiredAssessments || [])) {
            expiredAssessmentIds.push(a.id);
        }

        if (expiredAssessmentIds.length === 0) {
            console.log('[expire-quotes] No expired assessments found');
            return new Response(
                JSON.stringify({ success: true, message: 'No expired quotes', count: 0 }),
                { headers: responseHeaders }
            );
        }

        // Fetch pending quotes belonging to expired assessments
        const { data: expiredQuotes, error: fetchError } = await supabase
            .from('quotes')
            .select(`
                id,
                assessment_id,
                created_by,
                price,
                created_at,
                contractor:profiles!quotes_created_by_profile_fkey(full_name, email),
                assessment:assessments(town, county, property_address, contact_name, job_type)
            `)
            .eq('status', 'pending')
            .in('assessment_id', expiredAssessmentIds);

        if (fetchError) {
            console.error('[expire-quotes] Error fetching expired quotes:', fetchError);
            throw fetchError;
        }

        if (!expiredQuotes || expiredQuotes.length === 0) {
            console.log('[expire-quotes] No expired quotes found');
            return new Response(
                JSON.stringify({ success: true, message: 'No expired quotes', count: 0 }),
                { headers: responseHeaders }
            );
        }

        console.log(`[expire-quotes] Found ${expiredQuotes.length} expired quote(s)`);

        // SMTP setup for notifications
        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const smtpFrom = config.smtp_from;
        const websiteUrl = config.website_url;
        const isSpanish = tenant === 'spain';
        const isPortuguese = tenant === 'portugal';
        const isFrench = tenant === 'france';
        const isEngland = tenant === 'england';

        let smtpClient: CustomSmtpClient | null = null;

        if (smtpHostname && smtpUsername && smtpPassword) {
            try {
                smtpClient = new CustomSmtpClient(config.domain);
                await smtpClient.connect(smtpHostname, smtpPort);
                await smtpClient.authenticate(smtpUsername, smtpPassword);
            } catch (smtpErr) {
                console.error('[expire-quotes] SMTP connection failed:', smtpErr);
                smtpClient = null;
            }
        }

        let expiredCount = 0;
        const assessmentsToRelist = new Set<string>();

        for (const quote of expiredQuotes) {
            try {
                // 1. Update quote status to 'expired'
                const { error: updateError } = await supabase
                    .from('quotes')
                    .update({ status: 'rejected' })
                    .eq('id', quote.id);

                if (updateError) {
                    console.error(`[expire-quotes] Failed to expire quote ${quote.id}:`, updateError);
                    continue;
                }

                expiredCount++;
                console.log(`[expire-quotes] Expired quote ${quote.id}`);

                // Track assessment for relisting
                if (quote.assessment_id) {
                    assessmentsToRelist.add(quote.assessment_id);
                }

                // 2. Notify the assessor via email
                if (smtpClient && quote.contractor) {
                    try {
                        const contractorName = quote.contractor.full_name || 'Assessor';
                        const contractorEmail = quote.contractor.email;
                        const town = quote.assessment?.town || 'Unknown';
                        const county = quote.assessment?.county || '';

                        const emailHtml = isFrench ? `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Devis Expiré</h1>
                                </div>

                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    Bonjour ${contractorName},
                                </p>

                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    Votre devis de <strong>€${quote.price + 10}</strong> pour le DPE à
                                    <strong>${town}${county ? ', ' + county : ''}</strong> a expiré car la mission
                                    n'est plus active.
                                </p>

                                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <p style="color: #666; font-size: 14px; margin: 0;">
                                        <strong>Que se passe-t-il maintenant ?</strong><br>
                                        La mission a expiré et n'est plus active sur la plateforme.
                                        De nouvelles missions sont publiées régulièrement — connectez-vous pour voir les missions disponibles.
                                    </p>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${websiteUrl}/login"
                                       style="display: inline-block; background: #007F00; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                                        Voir les Missions Disponibles
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    Ceci est une notification automatique de ${config.display_name}
                                </p>
                            </div>
                        ` : isPortuguese ? `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Orçamento Expirado</h1>
                                </div>

                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    Olá ${contractorName},
                                </p>

                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    O seu orçamento de <strong>€${quote.price + 10}</strong> para o certificado energético em
                                    <strong>${town}${county ? ', ' + county : ''}</strong> expirou porque o trabalho
                                    já não está ativo.
                                </p>

                                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <p style="color: #666; font-size: 14px; margin: 0;">
                                        <strong>O que acontece agora?</strong><br>
                                        O trabalho expirou e já não está ativo na plataforma.
                                        Novos trabalhos são publicados regularmente — inicie sessão para ver os trabalhos disponíveis.
                                    </p>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${websiteUrl}/login"
                                       style="display: inline-block; background: #007F00; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                                        Ver Trabalhos Disponíveis
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    Esta é uma notificação automática de ${config.display_name}
                                </p>
                            </div>
                        ` : isSpanish ? `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Presupuesto Caducado</h1>
                                </div>

                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    Hola ${contractorName},
                                </p>

                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    Tu presupuesto de <strong>€${quote.price + 10}</strong> para el certificado energético en
                                    <strong>${town}${county ? ', ' + county : ''}</strong> ha caducado porque el trabajo
                                    ya no está activo.
                                </p>

                                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <p style="color: #666; font-size: 14px; margin: 0;">
                                        <strong>¿Qué ocurre ahora?</strong><br>
                                        El trabajo ha caducado y ya no está activo en la plataforma.
                                        Se publican nuevos trabajos con regularidad — inicia sesión para ver los trabajos disponibles.
                                    </p>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${websiteUrl}/login"
                                       style="display: inline-block; background: #007F00; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                                        Ver Trabajos Disponibles
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    Esta es una notificación automática de ${config.display_name}
                                </p>
                            </div>
                        ` : `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Quote Expired</h1>
                                </div>

                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    Hi ${contractorName},
                                </p>

                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    Your quote of <strong>${isEngland ? '£' : '€'}${quote.price + 10}</strong> for the ${isEngland ? 'EPC' : 'BER'} assessment in
                                    <strong>${town}${county ? ', ' + county : ''}</strong> has expired as the job
                                    is no longer active.
                                </p>

                                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <p style="color: #666; font-size: 14px; margin: 0;">
                                        <strong>What happens next?</strong><br>
                                        The job has expired and is no longer active on the platform.
                                        New jobs are posted regularly — log in to see available jobs.
                                    </p>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${websiteUrl}/login"
                                       style="display: inline-block; background: #007F00; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                                        View Available Jobs
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    This is an automated notification from ${config.display_name}
                                </p>
                            </div>
                        `;

                        await smtpClient.send(
                            smtpFrom,
                            contractorEmail,
                            isSpanish ? `Presupuesto Caducado: Trabajo en ${town}` : isPortuguese ? `Orçamento Expirado: Trabalho em ${town}` : isFrench ? `Devis Expiré : Mission à ${town}` : `Quote Expired: ${isEngland ? 'EPC' : 'BER'} Job in ${town}`,
                            emailHtml
                        );
                        console.log(`[expire-quotes] Notified assessor: ${contractorEmail}`);
                    } catch (emailErr) {
                        console.error(`[expire-quotes] Failed to email assessor for quote ${quote.id}:`, emailErr);
                    }
                }
            } catch (quoteErr) {
                console.error(`[expire-quotes] Error processing quote ${quote.id}:`, quoteErr);
            }
        }

        // 3. Mark expired assessments as 'expired' — do NOT relist them
        for (const assessmentId of assessmentsToRelist) {
            try {
                // Check if there are any remaining pending or accepted quotes
                const { data: remainingQuotes } = await supabase
                    .from('quotes')
                    .select('id, status')
                    .eq('assessment_id', assessmentId)
                    .in('status', ['pending', 'accepted']);

                // If no active quotes remain, mark the assessment as expired
                if (!remainingQuotes || remainingQuotes.length === 0) {
                    const { error: expireError } = await supabase
                        .from('assessments')
                        .update({ status: 'expired' })
                        .eq('id', assessmentId)
                        .in('status', OPEN_JOB_STATUSES);

                    if (expireError) {
                        console.error(`[expire-quotes] Failed to mark assessment ${assessmentId} as expired:`, expireError);
                    } else {
                        console.log(`[expire-quotes] Marked assessment ${assessmentId} as expired`);
                    }
                }
            } catch (expireErr) {
                console.error(`[expire-quotes] Error expiring assessment ${assessmentId}:`, expireErr);
            }
        }

        if (smtpClient) {
            try { await smtpClient.close(); } catch (e) { }
        }

        console.log(`[expire-quotes] Complete: ${expiredCount} quotes expired, ${assessmentsToRelist.size} assessments marked as expired`);

        return new Response(
            JSON.stringify({
                success: true,
                message: `Expired ${expiredCount} quotes, marked ${assessmentsToRelist.size} assessments as expired`
            }),
            { headers: responseHeaders }
        );

    } catch (err: any) {
        console.error('[expire-quotes] GLOBAL ERROR:', err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Internal error' }),
            { status: 500, headers: responseHeaders }
        );
    }
});
