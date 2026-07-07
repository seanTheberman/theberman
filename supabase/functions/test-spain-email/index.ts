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
        const startDateStr = startDate.toLocaleDateString('es-ES', dateOptions);
        const endDateStr = endDate.toLocaleDateString('es-ES', dateOptions);

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
                <h1 style="color: #007F00; text-align: center;">¡Registro Completado!</h1>
                <p>Hola Usuario de Prueba,</p>
                <p>¡Enhorabuena! Tu registro como Certificador Energético en la plataforma Certificado Energético ya está completo y tu membresía está activa.</p>

                <div style="background-color: #f9fafb; padding: 15px; border-radius: 0.5rem; margin: 20px 0;">
                    <h2 style="font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Detalles de la Membresía</h2>
                    <p><strong>Estado:</strong> Activo</p>
                    <p><strong>Fecha de Inicio:</strong> ${startDateStr}</p>
                    <p><strong>Válida Hasta:</strong> ${endDateStr}</p>
                </div>

                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 0.5rem; margin: 20px 0; border: 1px solid #c8e6c9;">
                    <h2 style="font-size: 1.1rem; border-bottom: 1px solid #c8e6c9; padding-bottom: 10px; color: #007F00;">Tus Credenciales de Acceso</h2>
                    <p><strong>Correo:</strong> ${email}</p>
                    <p><strong>Contraseña:</strong> ${password || '(Usa la contraseña que estableciste durante el registro)'}</p>
                </div>

                <p>Ya puedes iniciar sesión en tu panel para gestionar tu perfil y ver las notificaciones de trabajos.</p>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${websiteUrl}/login" style="background-color: #007F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">Ir al Panel</a>
                </div>

                <p style="margin-top: 40px; font-size: 0.8rem; color: #6b7280; text-align: center;">
                    Si tienes alguna pregunta, contáctanos en ${config.smtp_from}
                </p>
            </div>
        `;

        const client = new CustomSmtpClient(config.domain);
        await client.connect(config.smtp_hostname, config.smtp_port);
        await client.authenticate(config.smtp_username, config.smtp_password);

        await client.send(
            config.smtp_from,
            email,
            'Correo de Prueba - Tenant España',
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
