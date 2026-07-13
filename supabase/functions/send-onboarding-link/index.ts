// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { fullName, email, password, onboardingUrl, role, userId, type, tenant = 'ireland' } = await req.json();

        if (!email || !fullName) {
            throw new Error("Missing recipient details");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const websiteUrl = (config.website_url || 'https://theberman.eu').replace(/\/$/, '');
        const logoUrl = config.logo_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${smtpUsername}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error(`SMTP credentials missing for tenant ${tenant}`);
        }

        const client = new CustomSmtpClient(config.domain)
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const isBusiness = role === 'business';
        const isApproval = type === 'approved';
        const isSpanish = tenant === 'spain';
        const isEngland = tenant === 'england';
        const isPortuguese = tenant === 'portugal';

        let subject: string;
        let html: string;

        if (isBusiness && isApproval) {
            // ─── APPROVAL EMAIL: sent after admin approves the business ───
            subject = isSpanish ? `¡Estás Aprobado! – ${config.display_name}` : isPortuguese ? `Está Aprovado! – ${config.display_name}` : `You're Approved! – ${config.display_name}`;
            const loginUrl = `${websiteUrl}/login`;

            if (isPortuguese) {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Está Aprovado! 🎉</h2>
                    <p style="font-size: 16px; color: #333;">Olá <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Boas notícias! O seu registo foi revisto e <strong>aprovado</strong>.
                        A sua empresa está agora publicada no nosso Catálogo de Certificados Energéticos.
                    </p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Agora pode iniciar sessão no seu Portal de Empresa para editar o perfil do catálogo,
                        atualizar as suas fotografias e gerir o seu anúncio a qualquer momento.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Iniciar Sessão
                        </a>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Os seus Dados de Acesso</h3>
                        <p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Palavra-passe:</strong> <code style="background:#eee; padding:2px 4px; border-radius:3px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 12px; color: #777; line-height: 1.4;">
                            <em>Pode alterar a sua palavra-passe em qualquer momento a partir do painel.</em>
                        </p>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Apoiando objetivos de energia sustentável através de certificações profissionais.
                    </p>
                </div>
                `;
            } else if (isSpanish) {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">¡Estás Aprobado! 🎉</h2>
                    <p style="font-size: 16px; color: #333;">Hola <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        ¡Buenas noticias! Tu registro ha sido revisado y <strong>aprobado</strong>.
                        Tu empresa ahora está publicada en nuestro Catálogo de Certificados Energéticos.
                    </p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Ahora puedes iniciar sesión en tu Portal de Negocios para editar tu perfil de catálogo,
                        actualizar tus fotos y gestionar tu listado en cualquier momento.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Iniciar Sesión
                        </a>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Tus Datos de Acceso</h3>
                        <p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Contraseña:</strong> <code style="background:#eee; padding:2px 4px; border-radius:3px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 12px; color: #777; line-height: 1.4;">
                            <em>Puedes cambiar tu contraseña en cualquier momento desde tu panel.</em>
                        </p>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Apoyando objetivos de energía sostenible a través de certificaciones profesionales.
                    </p>
                </div>
                `;
            } else {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="${logoUrl}" alt="${config.display_name}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                    </div>
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">You're Approved! 🎉</h2>
                    <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Great news! Your registration has been reviewed and <strong>approved</strong>.
                        Your business is now published in our catalogue.
                    </p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        You can now log in to your Business Portal to edit your catalogue profile,
                        update your photos, and manage your listing at any time.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Login to Your Dashboard
                        </a>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Details</h3>
                        <p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Login Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 14px; color: #555;"><strong>Password:</strong> <code style="background:#eee; padding:2px 4px; border-radius:3px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 12px; color: #777; line-height: 1.4;">
                            <em>You can change your password at any time from your dashboard.</em>
                        </p>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Supporting sustainable energy goals through professional assessments.
                    </p>
                </div>
                `;
            }
        } else if (isBusiness) {
            // ─── WELCOME EMAIL: sent when admin manually signs up a business ───
            subject = isSpanish ? `Bienvenido a ${config.display_name} – Completa Tu Registro` : isPortuguese ? `Bem-vindo à ${config.display_name} – Complete o Seu Registo` : `Welcome to ${config.display_name} – Complete Your Registration`;

            // Use the magic link if provided, otherwise fallback to business-onboarding page
            const actionUrl = onboardingUrl || `${websiteUrl}/business-onboarding`;
            const loginUrl = `${websiteUrl}/login`;

            if (isPortuguese) {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Bem-vindo à ${config.display_name}</h2>
                    <p style="font-size: 16px; color: #333;">Olá <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Bem-vindo à ${config.display_name}. Clique no link abaixo para preencher o formulário de registo e ser publicado no nosso catálogo.
                        Esperamos construir uma relação sólida consigo.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${actionUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Completar Formulário de Registo
                        </a>
                    </div>

                    <div style="background-color: #f1f8e9; padding: 22px; border-radius: 8px; border: 1px solid #c5e1a5; margin: 30px 0;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">Os seus Dados de Acesso</h3>
                        <p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Palavra-passe:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #ddd; font-size:15px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #555; line-height: 1.5;">
                            <strong>Importante:</strong> Utilize estes dados para iniciar sessão em <a href="${loginUrl}" style="color: #2e7d32;">${loginUrl}</a>
                        </p>
                    </div>

                    <p style="color: #888; font-size: 13px; text-align: center;">
                        Link Direto para o Formulário:<br>
                        <a href="${actionUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${actionUrl}</a>
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Apoiando objetivos de energia sustentável através de certificações profissionais.
                    </p>
                </div>
                `;
            } else if (isSpanish) {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Bienvenido a ${config.display_name}</h2>
                    <p style="font-size: 16px; color: #333;">Hola <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Bienvenido a ${config.display_name}. Haz clic en el enlace de abajo para completar el formulario de registro
                        y ser publicado en nuestro catálogo.
                        Esperamos construir una relación sólida contigo.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${actionUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Completar Formulario de Registro
                        </a>
                    </div>

                    <div style="background-color: #f1f8e9; padding: 22px; border-radius: 8px; border: 1px solid #c5e1a5; margin: 30px 0;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">Tus Datos de Acceso</h3>
                        <p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Contraseña:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #ddd; font-size:15px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #555; line-height: 1.5;">
                            <strong>Importante:</strong> Usa estos datos para iniciar sesión en <a href="${loginUrl}" style="color: #2e7d32;">${loginUrl}</a>
                        </p>
                    </div>

                    <p style="color: #888; font-size: 13px; text-align: center;">
                        Enlace Directo al Formulario:<br>
                        <a href="${actionUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${actionUrl}</a>
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Apoyando objetivos de energía sostenible a través de certificaciones profesionales.
                    </p>
                </div>
                `;
            } else {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="${logoUrl}" alt="${config.display_name}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                    </div>
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Welcome to ${config.display_name}</h2>
                    <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Welcome to ${config.display_name}. Click the link below to finish the registration form and be published in our catalogue.
                        We look forward to building a strong relationship with you.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${actionUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Complete Registration Form
                        </a>
                    </div>

                    <div style="background-color: #f1f8e9; padding: 22px; border-radius: 8px; border: 1px solid #c5e1a5; margin: 30px 0;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Details</h3>
                        <p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Password:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #ddd; font-size:15px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #555; line-height: 1.5;">
                            <strong>Important:</strong> Use these credentials to log in at <a href="${loginUrl}" style="color: #2e7d32;">${loginUrl}</a>
                        </p>
                    </div>

                    <p style="color: #888; font-size: 13px; text-align: center;">
                        Direct Form Link:<br>
                        <a href="${actionUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${actionUrl}</a>
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Supporting sustainable energy goals through professional assessments.
                    </p>
                </div>
                `;
            }
        } else {
            // ─── ASSESSOR EMAIL: credentials-first onboarding (FREE, no payment mentions) ───
            const roleName = isSpanish ? 'Certificador Energético' : (isPortuguese ? 'Perito Certificador' : (isEngland ? 'Domestic Energy Assessor' : 'BER Assessor'));
            const loginUrl = `${websiteUrl}/login`;

            subject = isSpanish ? `Bienvenido a ${config.display_name} – Tus Datos de Acceso` : isPortuguese ? `Bem-vindo à ${config.display_name} – Os seus Dados de Acesso` : `Welcome to ${config.display_name} – Your ${roleName} Login Details`;

            if (isPortuguese) {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Bem-vindo à ${config.display_name}</h2>
                    <p style="font-size: 16px; color: #333;">Olá <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        A sua conta como <strong>${roleName}</strong> foi criada com sucesso.
                        Estamos entusiasmados por tê-lo na nossa rede de profissionais de energia.
                    </p>

                    <div style="background-color: #f1f8e9; padding: 22px; border-radius: 8px; border: 1px solid #c5e1a5; margin: 30px 0;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">Os seus Dados de Acesso</h3>
                        <p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Palavra-passe Temporária:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #ddd; font-size:15px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #b71c1c; line-height: 1.5;">
                            <strong>⚠ Importante:</strong> Por favor altere esta palavra-passe após o primeiro início de sessão nas definições do seu painel, ou utilize "Esqueci-me da palavra-passe" na página de início de sessão a qualquer momento.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Iniciar Sessão
                        </a>
                    </div>

                    <p style="color: #888; font-size: 13px; text-align: center;">
                        URL de Início de Sessão:<br>
                        <a href="${loginUrl}" style="color: #2e7d32; text-decoration: none; font-size: 12px; word-break: break-all;">${loginUrl}</a>
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Apoiando objetivos de energia sustentável através de certificações profissionais.
                    </p>
                </div>
                `;
            } else if (isSpanish) {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Bienvenido a ${config.display_name}</h2>
                    <p style="font-size: 16px; color: #333;">Hola <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Tu cuenta como <strong>${roleName}</strong> ha sido creada exitosamente.
                        Estamos encantados de tenerte en nuestra red de profesionales de energía.
                    </p>

                    <div style="background-color: #f1f8e9; padding: 22px; border-radius: 8px; border: 1px solid #c5e1a5; margin: 30px 0;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">Tus Datos de Acceso</h3>
                        <p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Contraseña Temporal:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #ddd; font-size:15px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #b71c1c; line-height: 1.5;">
                            <strong>⚠ Importante:</strong> Por favor cambia esta contraseña después de tu primer inicio de sesión desde la configuración de tu panel, o usa "Olvidé mi contraseña" en la página de inicio de sesión en cualquier momento.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Iniciar Sesión
                        </a>
                    </div>

                    <p style="color: #888; font-size: 13px; text-align: center;">
                        URL de Inicio de Sesión:<br>
                        <a href="${loginUrl}" style="color: #2e7d32; text-decoration: none; font-size: 12px; word-break: break-all;">${loginUrl}</a>
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Apoyando objetivos de energía sostenible a través de certificaciones profesionales.
                    </p>
                </div>
                `;
            } else {
                html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="${logoUrl}" alt="${config.display_name}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                    </div>
                    <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Welcome to ${config.display_name}</h2>
                    <p style="font-size: 16px; color: #333;">Hello <strong>${fullName}</strong>,</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Your account as a <strong>${roleName}</strong> has been successfully created.
                        We are excited to have you join our network of energy professionals.
                    </p>

                    <div style="background-color: #f1f8e9; padding: 22px; border-radius: 8px; border: 1px solid #c5e1a5; margin: 30px 0;">
                        <h3 style="margin-top: 0; font-size: 14px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Details</h3>
                        <p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Email:</strong> ${email}</p>
                        ${password ? `<p style="margin: 10px 0; font-size: 15px; color: #333;"><strong>Temporary Password:</strong> <code style="background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #ddd; font-size:15px;">${password}</code></p>` : ''}
                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #b71c1c; line-height: 1.5;">
                            <strong>⚠ Important:</strong> Please change this password after your first login from your dashboard settings, or use "Forgot Password" on the login page anytime.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                            Login to Your Dashboard
                        </a>
                    </div>

                    <p style="color: #888; font-size: 13px; text-align: center;">
                        Login URL:<br>
                        <a href="${loginUrl}" style="color: #2e7d32; text-decoration: none; font-size: 12px; word-break: break-all;">${loginUrl}</a>
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} ${config.display_name}.<br>
                        Supporting sustainable energy goals through professional assessments.
                    </p>
                </div>
                `;
            }
        }

        await client.send(smtpFrom, email, subject, html)
        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-onboarding-link] ERROR", err.message);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
