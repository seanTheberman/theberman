// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts"
import { getTenantConfig } from "../shared/tenant.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

function generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, tenant = 'ireland' } = await req.json()

        const isSpanish = tenant === 'spain';

        if (!email || !email.includes('@')) {
            throw new Error(isSpanish ? 'Se requiere un correo válido' : 'Valid email is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Check if user exists via profiles table (more reliable than paginated auth.listUsers)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
            // Don't reveal if email exists or not for security
            return new Response(
                JSON.stringify({ success: true, message: isSpanish ? 'Si este correo existe, se ha enviado un enlace de restablecimiento.' : 'If this email exists, a reset link has been sent.' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        console.log(`[send-password-reset] Found user profile: ${profile.id}`);

        // 2. Generate token and store in email_otps table
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

        const { error: otpError } = await supabase
            .from('email_otps')
            .insert({
                email: email.toLowerCase(),
                code: token,
                expires_at: expiresAt.toISOString(),
                verified: false
            });

        if (otpError) throw otpError;

        // 3. Get tenant config for SMTP
        const config = await getTenantConfig(supabase, tenant);
        if (!config.smtp_hostname || !config.smtp_username || !config.smtp_password) {
            throw new Error(isSpanish ? 'SMTP no configurado para este tenant' : 'SMTP not configured for this tenant');
        }

        // 4. Send email
        const resetUrl = `${config.website_url}/update-password?token=${token}&email=${encodeURIComponent(email)}`;
        const brandName = config.display_name || (isSpanish ? 'Certificado Energético' : 'The Berman');

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
                <h1 style="color: #007F00; text-align: center;">${isSpanish ? 'Solicitud de Restablecimiento de Contraseña' : 'Password Reset Request'}</h1>
                <p>${isSpanish ? 'Hola,' : 'Hi,'}</p>
                <p>${isSpanish ? `Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ${brandName}.` : `We received a request to reset your password for your ${brandName} account.`}</p>
                <p>${isSpanish ? 'Haz clic en el botón de abajo para establecer una nueva contraseña. Este enlace expirará en 1 hora.' : 'Click the button below to set a new password. This link will expire in 1 hour.'}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">${isSpanish ? 'Restablecer mi contraseña' : 'Reset My Password'}</a>
                </div>
                <p style="color: #6b7280; font-size: 0.9rem;">${isSpanish ? 'Si no solicitaste esto, puedes ignorar este correo de forma segura.' : "If you didn't request this, you can safely ignore this email."}</p>
                <p style="color: #6b7280; font-size: 0.9rem;">${isSpanish ? 'Si el botón no funciona, copia y pega este enlace:' : "If the button doesn't work, copy and paste this link:"}</p>
                <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${resetUrl}</p>
            </div>
        `;

        // 4. Send email via SMTP
        console.log(`[send-password-reset] Starting SMTP send to ${email}`);
        console.log(`[send-password-reset] SMTP config: host=${config.smtp_hostname}, port=${config.smtp_port}, from=${config.smtp_from}`);

        const client = new CustomSmtpClient(config.domain);
        try {
            console.log("[send-password-reset] Connecting to SMTP...");
            await client.connect(config.smtp_hostname, config.smtp_port);
            console.log("[send-password-reset] SMTP connected");

            console.log("[send-password-reset] Authenticating...");
            await client.authenticate(config.smtp_username, config.smtp_password);
            console.log("[send-password-reset] SMTP authenticated");

            console.log(`[send-password-reset] Sending email from ${config.smtp_from} to ${email}...`);
            await client.send(
                config.smtp_from,
                email,
                isSpanish ? `Restablecer contraseña - ${brandName}` : `Password Reset - ${brandName}`,
                emailHtml
            );
            console.log("[send-password-reset] SMTP send command completed");

            await client.close();
            console.log("[send-password-reset] SMTP connection closed successfully");
        } catch (smtpErr: any) {
            console.error("[send-password-reset] SMTP ERROR", smtpErr);
            throw new Error(`Failed to send email: ${smtpErr.message}`);
        }

        return new Response(
            JSON.stringify({ success: true, message: isSpanish ? 'Si este correo existe, se ha enviado un enlace de restablecimiento.' : 'If this email exists, a reset link has been sent.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("[send-password-reset] ERROR", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
})
