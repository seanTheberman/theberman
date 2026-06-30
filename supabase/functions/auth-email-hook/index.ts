// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";

/**
 * Supabase Auth "Send Email Hook"
 *
 * Replaces Supabase's built-in email service.
 * When Supabase needs to send an auth email (signup confirmation, password
 * reset, magic link, email change, etc.) it calls this edge function with
 * the user object + email_data (token, redirect_to, email_action_type, …).
 *
 * We look up the user's tenant from their metadata, fetch the tenant's SMTP
 * config from `tenant_configurations`, and send a branded email via our own
 * SMTP — with links pointing to the correct tenant website.
 *
 * Expected response: HTTP 200 with empty body on success.
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const hookSecret = (Deno.env.get('SEND_EMAIL_HOOK_SECRET') || '').replace('v1,whsec_', '');
const webhook = hookSecret ? new Webhook(hookSecret) : null;

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (!webhook) {
        console.error('[auth-email-hook] SEND_EMAIL_HOOK_SECRET not configured');
        return new Response(JSON.stringify({ error: 'Hook secret not configured' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Supabase signs the raw request body with the webhook secret.
        const rawBody = await req.text();
        const headers = Object.fromEntries(req.headers);

        let payload: any;
        try {
            payload = webhook.verify(rawBody, headers);
        } catch (verifyErr: any) {
            console.error('[auth-email-hook] Webhook verification failed:', verifyErr.message);
            return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const { user, email_data } = payload;

        if (!user || !email_data) {
            console.error('[auth-email-hook] Missing user or email_data in payload');
            return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const userEmail = user.email;
        const actionType = email_data.email_action_type || 'signup';
        const redirect_to = email_data.redirect_to || '';
        const tokenHash = email_data.token_hash || '';
        const token = email_data.token || '';

        // Determine tenant from user metadata
        const tenant = user.user_metadata?.tenant || user.app_metadata?.tenant || 'ireland';

        console.log(`[auth-email-hook] action=${actionType} tenant=${tenant} email=${userEmail}`);

        // Fetch tenant SMTP config
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        let config;
        try {
            config = await getTenantConfig(supabase, tenant);
        } catch (cfgErr) {
            console.error(`[auth-email-hook] Failed to load tenant config for "${tenant}":`, cfgErr.message);
            // Fallback to ireland
            config = await getTenantConfig(supabase, 'ireland');
        }

        if (!config.smtp_hostname || !config.smtp_username || !config.smtp_password) {
            console.error(`[auth-email-hook] SMTP not configured for tenant ${tenant}`);
            return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const websiteUrl = (config.website_url || `https://${config.domain}`).replace(/\/$/, '');
        const isSpanish = tenant === 'spain';
        const isEngland = tenant === 'england';
        const brandName = config.display_name;

        // Build the confirmation URL that Supabase will verify
        // The redirect_to from email_data is what we passed as emailRedirectTo in signUp()
        const effectiveRedirect = redirect_to || `${websiteUrl}/login`;
        const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${actionType === 'signup' ? 'signup' : 'recovery'}&redirect_to=${encodeURIComponent(effectiveRedirect)}`;

        // Build email subject + HTML based on action type
        let subject: string;
        let html: string;

        if (actionType === 'signup' || actionType === 'invite') {
            subject = isSpanish
                ? `Confirma tu cuenta – ${brandName}`
                : isEngland
                    ? `Confirm your account – ${brandName}`
                    : `Confirm your account – ${brandName}`;
            html = buildConfirmationEmail(userEmail, confirmationUrl, effectiveRedirect, websiteUrl, brandName, isSpanish, isEngland);
        } else if (actionType === 'recovery') {
            subject = isSpanish
                ? `Restablece tu contraseña – ${brandName}`
                : `Reset your password – ${brandName}`;
            html = buildRecoveryEmail(userEmail, confirmationUrl, effectiveRedirect, websiteUrl, brandName, isSpanish, isEngland);
        } else if (actionType === 'magiclink') {
            subject = isSpanish
                ? `Tu enlace de acceso – ${brandName}`
                : `Your sign-in link – ${brandName}`;
            html = buildMagicLinkEmail(userEmail, confirmationUrl, effectiveRedirect, websiteUrl, brandName, isSpanish, isEngland);
        } else if (actionType === 'email_change') {
            subject = isSpanish
                ? `Confirma tu nuevo email – ${brandName}`
                : `Confirm your new email – ${brandName}`;
            html = buildConfirmationEmail(userEmail, confirmationUrl, effectiveRedirect, websiteUrl, brandName, isSpanish, isEngland);
        } else {
            // Generic fallback
            subject = `${brandName} – Verification`;
            html = buildConfirmationEmail(userEmail, confirmationUrl, effectiveRedirect, websiteUrl, brandName, isSpanish, isEngland);
        }

        // Send via custom SMTP
        const client = new CustomSmtpClient();
        try {
            await client.connect(config.smtp_hostname, config.smtp_port);
            await client.authenticate(config.smtp_username, config.smtp_password);
            await client.send(config.smtp_from, userEmail, subject, html);
            await client.close();
            console.log(`[auth-email-hook] SUCCESS: ${actionType} email sent to ${userEmail} via tenant ${tenant} SMTP`);
        } catch (smtpErr: any) {
            console.error(`[auth-email-hook] SMTP ERROR:`, smtpErr.message);
            // Return 200 anyway so Supabase doesn't retry endlessly
            // The user can request another email if needed
        }

        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        console.error('[auth-email-hook] GLOBAL ERROR:', err.message);
        // Return 200 to prevent Supabase from retrying
        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
});

// ─── Email template builders ───────────────────────────────────────────

function buildConfirmationEmail(
    email: string,
    confirmationUrl: string,
    fallbackUrl: string,
    websiteUrl: string,
    brandName: string,
    isSpanish: boolean,
    isEngland: boolean
): string {
    if (isSpanish) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Confirma tu cuenta</h1>
            <p style="font-size: 16px; color: #333;">Hola,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Gracias por registrarte en <strong>${brandName}</strong>. Haz clic en el botón de abajo para confirmar tu cuenta y comenzar.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirmar mi cuenta</a>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">Si el botón no funciona, copia y pega este enlace:</p>
            <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${brandName}.<br>
                Apoyando objetivos de energía sostenible a través de certificaciones profesionales.
            </p>
        </div>`;
    }

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
        </div>
        <h1 style="color: #007F00; text-align: center; font-size: 24px;">Confirm your account</h1>
        <p style="font-size: 16px; color: #333;">Hi,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thanks for signing up with <strong>${brandName}</strong>. Click the button below to confirm your account and get started.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirm my account</a>
        </div>
        <p style="color: #6b7280; font-size: 0.9rem;">If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} ${brandName}.<br>
            Supporting sustainable energy goals through professional assessments.
        </p>
    </div>`;
}

function buildRecoveryEmail(
    email: string,
    confirmationUrl: string,
    fallbackUrl: string,
    websiteUrl: string,
    brandName: string,
    isSpanish: boolean,
    isEngland: boolean
): string {
    if (isSpanish) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Restablece tu contraseña</h1>
            <p style="font-size: 16px; color: #333;">Hola,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>${brandName}</strong>.
            </p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Haz clic en el botón de abajo para establecer una nueva contraseña. Este enlace expirará en 1 hora.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Restablecer contraseña</a>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            <p style="color: #6b7280; font-size: 0.9rem;">Si el botón no funciona, copia y pega este enlace:</p>
            <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${brandName}.
            </p>
        </div>`;
    }

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
        </div>
        <h1 style="color: #007F00; text-align: center; font-size: 24px;">Reset your password</h1>
        <p style="font-size: 16px; color: #333;">Hi,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
            We received a request to reset your password for your <strong>${brandName}</strong> account.
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Click the button below to set a new password. This link will expire in 1 hour.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset my password</a>
        </div>
        <p style="color: #6b7280; font-size: 0.9rem;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #6b7280; font-size: 0.9rem;">If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} ${brandName}.
        </p>
    </div>`;
}

function buildMagicLinkEmail(
    email: string,
    confirmationUrl: string,
    fallbackUrl: string,
    websiteUrl: string,
    brandName: string,
    isSpanish: boolean,
    isEngland: boolean
): string {
    if (isSpanish) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Tu enlace de acceso</h1>
            <p style="font-size: 16px; color: #333;">Hola,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Haz clic en el botón de abajo para iniciar sesión en <strong>${brandName}</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Iniciar sesión</a>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">Si no solicitaste este enlace, puedes ignorar este correo de forma segura.</p>
            <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} ${brandName}.</p>
        </div>`;
    }

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
        </div>
        <h1 style="color: #007F00; text-align: center; font-size: 24px;">Your sign-in link</h1>
        <p style="font-size: 16px; color: #333;">Hi,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Click the button below to sign in to <strong>${brandName}</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Sign in</a>
        </div>
        <p style="color: #6b7280; font-size: 0.9rem;">If you didn't request this link, you can safely ignore this email.</p>
        <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} ${brandName}.</p>
    </div>`;
}
