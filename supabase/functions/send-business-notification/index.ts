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
        const { companyName, email, phone, address, website, catalogueUrl, adminName, registrationAmount, tenant = 'ireland' } = await req.json();

        if (!email || !companyName) {
            throw new Error("Missing required business details");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const smtpHostname = config.smtp_hostname;
        const smtpPort = parseInt(config.smtp_port || '587');
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;
        const websiteUrl = (config.website_url || 'https://theberman.eu').replace(/\/$/, '');
        const smtpFrom = config.smtp_from || `${config.display_name} <${smtpUsername}>`;
        const isSpanish = tenant === 'spain';
        const isPortuguese = tenant === 'portugal';
        const brandName = config.display_name;
        const catalogueName = `${brandName} Home Energy Catalogue`;
        const marketArea = isSpanish ? 'España' : isPortuguese ? 'Portugal' : 'Ireland';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error(`SMTP credentials missing for tenant ${tenant}`);
        }

        const client = new CustomSmtpClient(config.domain)
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const isFreeRegistration = registrationAmount === 0 || registrationAmount === undefined;
        const feeText = isFreeRegistration
            ? (isSpanish ? 'GRATIS' : isPortuguese ? 'GRÁTIS' : 'FREE')
            : `€${registrationAmount.toFixed(2)}`;

        const subject = isSpanish
            ? `¡Tu negocio ha sido añadido al Catálogo de ${brandName}!`
            : isPortuguese
                ? `O seu negócio foi adicionado ao Catálogo de ${brandName}!`
                : `Your Business Has Been Added to ${brandName} Catalogue!`;

        const html = isPortuguese ? `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Bem-vindo(a) ao ${catalogueName}!</h2>
                <p style="font-size: 16px; color: #333;">Estimada equipa da <strong>${companyName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Boas notícias! O seu negócio foi adicionado com sucesso ao ${catalogueName}, a plataforma de confiança em ${marketArea} para ligar proprietários a profissionais de energia certificados.
                </p>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #333;">Detalhes da sua Ficha:</h3>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Empresa:</strong></td>
                            <td style="padding: 5px 0;">${companyName}</td>
                        </tr>
                        ${email ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Email:</strong></td>
                            <td style="padding: 5px 0;">${email}</td>
                        </tr>` : ''}
                        ${phone ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Telefone:</strong></td>
                            <td style="padding: 5px 0;">${phone}</td>
                        </tr>` : ''}
                        ${address ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Morada:</strong></td>
                            <td style="padding: 5px 0;">${address}</td>
                        </tr>` : ''}
                        ${website ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Website:</strong></td>
                            <td style="padding: 5px 0;"><a href="${website}" style="color: #2e7d32; text-decoration: none;">${website}</a></td>
                        </tr>` : ''}
                    </table>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🎉 Oferta Especial de Registo!</h3>
                    <p style="font-size: 15px; color: #2e7d32; font-weight: bold; margin-bottom: 10px;">
                        Taxa de Registo do seu Negócio: <span style="font-size: 18px;">${feeText}</span>
                    </p>
                    <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0;">
                        ${isFreeRegistration
                            ? 'Foi selecionado para um <strong>registo de negócio GRÁTIS</strong>. Crie a sua conta hoje para reclamar a sua ficha e começar a receber consultas de clientes.'
                            : `Foi selecionado para uma taxa de registo especial de <strong>€${registrationAmount.toFixed(2)}</strong>. Esta é uma tarifa exclusiva para o seu negócio.`}
                    </p>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    A sua ficha está agora <strong>ativa e visível</strong> para proprietários em ${marketArea} que procuram serviços de melhoria energética. Isto significa que potenciais clientes já podem encontrá-lo e contactá-lo através da nossa plataforma.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${catalogueUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Ver a sua Ficha de Negócio
                    </a>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🚀 O que vem a seguir?</h3>
                    <ul style="font-size: 14px; color: #555; line-height: 1.6; padding-left: 20px;">
                        <li><strong>Reveja a sua ficha:</strong> Verifique se todos os dados estão corretos</li>
                        <li><strong>Reclame a sua ficha:</strong> Crie uma conta para gerir o perfil do seu negócio</li>
                        <li><strong>Receba consultas:</strong> Os proprietários podem contactá-lo diretamente a partir da plataforma</li>
                        <li><strong>Melhore o seu perfil:</strong> Adicione mais fotografias, serviços e testemunhos</li>
                    </ul>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Para ter o controlo total da sua ficha, acompanhar as consultas e atualizar a informação do seu negócio, recomendamos que crie uma conta de empresa.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${websiteUrl}/signup?role=business" target="_blank" style="display:inline-block;background-color:#1976d2;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Criar Conta de Empresa
                    </a>
                </div>

                <p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 30px;">
                    Esta ficha foi adicionada por <strong>${adminName || `A Equipa ${brandName}`}</strong>. Se tiver alguma dúvida ou precisar de atualizar a sua informação, não hesite em contactar-nos.
                </p>

                <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
                    Ver a sua ficha:<br>
                    <a href="${catalogueUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${catalogueUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} ${brandName}.<br>
                    A ligar proprietários a profissionais de energia de confiança em ${marketArea}.
                </p>
            </div>
        ` : isSpanish ? `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">¡Bienvenido al ${catalogueName}!</h2>
                <p style="font-size: 16px; color: #333;">Estimado equipo de <strong>${companyName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    ¡Buenas noticias! Tu negocio se ha añadido correctamente al ${catalogueName}, la plataforma de confianza en ${marketArea} para conectar a propietarios con profesionales energéticos certificados.
                </p>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #333;">Detalles de tu Ficha:</h3>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Empresa:</strong></td>
                            <td style="padding: 5px 0;">${companyName}</td>
                        </tr>
                        ${email ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Correo:</strong></td>
                            <td style="padding: 5px 0;">${email}</td>
                        </tr>` : ''}
                        ${phone ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Teléfono:</strong></td>
                            <td style="padding: 5px 0;">${phone}</td>
                        </tr>` : ''}
                        ${address ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Dirección:</strong></td>
                            <td style="padding: 5px 0;">${address}</td>
                        </tr>` : ''}
                        ${website ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Web:</strong></td>
                            <td style="padding: 5px 0;"><a href="${website}" style="color: #2e7d32; text-decoration: none;">${website}</a></td>
                        </tr>` : ''}
                    </table>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🎉 ¡Oferta Especial de Registro!</h3>
                    <p style="font-size: 15px; color: #2e7d32; font-weight: bold; margin-bottom: 10px;">
                        Tarifa de Registro de tu Negocio: <span style="font-size: 18px;">${feeText}</span>
                    </p>
                    <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0;">
                        ${isFreeRegistration
                            ? 'Has sido seleccionado para un <strong>registro de negocio GRATIS</strong>. Crea tu cuenta hoy para reclamar tu ficha y empezar a recibir consultas de clientes.'
                            : `Has sido seleccionado para una tarifa de registro especial de <strong>€${registrationAmount.toFixed(2)}</strong>. Esta es una tarifa exclusiva para tu negocio.`}
                    </p>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Tu ficha ya está <strong>activa y visible</strong> para propietarios en ${marketArea} que buscan servicios de mejora energética. Esto significa que los clientes potenciales ya pueden encontrarte y contactarte a través de nuestra plataforma.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${catalogueUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Ver tu Ficha de Negocio
                    </a>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🚀 ¿Qué sigue?</h3>
                    <ul style="font-size: 14px; color: #555; line-height: 1.6; padding-left: 20px;">
                        <li><strong>Revisa tu ficha:</strong> Comprueba que todos los datos sean correctos</li>
                        <li><strong>Reclama tu ficha:</strong> Crea una cuenta para gestionar el perfil de tu negocio</li>
                        <li><strong>Recibe consultas:</strong> Los propietarios pueden contactarte directamente desde la plataforma</li>
                        <li><strong>Mejora tu perfil:</strong> Añade más fotos, servicios y testimonios</li>
                    </ul>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Para tener el control total de tu ficha, seguir las consultas y actualizar la información de tu negocio, te recomendamos crear una cuenta de empresa.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${websiteUrl}/signup?role=business" target="_blank" style="display:inline-block;background-color:#1976d2;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Crear Cuenta de Empresa
                    </a>
                </div>

                <p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 30px;">
                    Esta ficha fue añadida por <strong>${adminName || `El Equipo de ${brandName}`}</strong>. Si tienes alguna pregunta o necesitas actualizar tu información, no dudes en contactarnos.
                </p>

                <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
                    Ver tu ficha:<br>
                    <a href="${catalogueUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${catalogueUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} ${brandName}.<br>
                    Conectando a propietarios con profesionales energéticos de confianza en ${marketArea}.
                </p>
            </div>
        ` : `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Welcome to ${catalogueName}!</h2>
                <p style="font-size: 16px; color: #333;">Dear <strong>${companyName}</strong> Team,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Great news! Your business has been successfully added to ${catalogueName} - ${marketArea}'s trusted platform for connecting homeowners with verified energy professionals.
                </p>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #333;">Your Business Listing Details:</h3>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Business Name:</strong></td>
                            <td style="padding: 5px 0;">${companyName}</td>
                        </tr>
                        ${email ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Email:</strong></td>
                            <td style="padding: 5px 0;">${email}</td>
                        </tr>` : ''}
                        ${phone ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Phone:</strong></td>
                            <td style="padding: 5px 0;">${phone}</td>
                        </tr>` : ''}
                        ${address ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Address:</strong></td>
                            <td style="padding: 5px 0;">${address}</td>
                        </tr>` : ''}
                        ${website ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Website:</strong></td>
                            <td style="padding: 5px 0;"><a href="${website}" style="color: #2e7d32; text-decoration: none;">${website}</a></td>
                        </tr>` : ''}
                    </table>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🎉 Special Registration Offer!</h3>
                    <p style="font-size: 15px; color: #2e7d32; font-weight: bold; margin-bottom: 10px;">
                        Your Business Registration Fee: <span style="font-size: 18px;">${feeText}</span>
                    </p>
                    <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0;">
                        ${isFreeRegistration 
                            ? 'You\'ve been selected for a <strong>FREE business registration</strong>! Create your account today to claim your listing and start receiving customer inquiries.'
                            : `You\'ve been selected for a special registration fee of <strong>€${registrationAmount.toFixed(2)}</strong>. This is a discounted rate exclusively for your business.`}
                    </p>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Your listing is now <strong>live and visible</strong> to homeowners across ${marketArea} who are looking for energy upgrade services. This means potential customers can already find and contact you through our platform.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${catalogueUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        View Your Business Listing
                    </a>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🚀 What's Next?</h3>
                    <ul style="font-size: 14px; color: #555; line-height: 1.6; padding-left: 20px;">
                        <li><strong>Review Your Listing:</strong> Check if all details are accurate</li>
                        <li><strong>Claim Your Listing:</strong> Create an account to manage your business profile</li>
                        <li><strong>Receive Inquiries:</strong> Homeowners can contact you directly through the platform</li>
                        <li><strong>Enhance Your Profile:</strong> Add more photos, services, and testimonials</li>
                    </ul>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    To take full control of your listing, track inquiries, and update your business information, we recommend creating a business account.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${websiteUrl}/signup?role=business" target="_blank" style="display:inline-block;background-color:#1976d2;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Create Business Account
                    </a>
                </div>

                <p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 30px;">
                    This listing was added by <strong>${adminName || `The ${brandName} Team`}</strong>. If you have any questions or need to update your information, please don't hesitate to contact us.
                </p>

                <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
                    View your listing:<br>
                    <a href="${catalogueUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${catalogueUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} ${brandName}.<br>
                    Connecting ${marketArea}'s homeowners with trusted energy professionals.
                </p>
            </div>
        `;

        await client.send(smtpFrom, email, subject, html)
        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: 'Business notification email sent' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-business-notification] ERROR", err.message);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})