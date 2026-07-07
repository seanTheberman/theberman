export const generatePosterQuoteEmail = (posterName: string, websiteUrl: string = "https://theberman.eu", promoHtml: string = "", tenant: string = 'ireland') => {
    const isSpanish = tenant === 'spain';
    const dashboardUrl = `${websiteUrl}/dashboard/business`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #007F00; color: white; padding: 40px 20px; text-align: center;">
            <img src="${websiteUrl}/logo.svg" alt="${isSpanish ? 'Certificado Energético' : 'The Berman'}" style="height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${isSpanish ? 'Nuevo Presupuesto en tu Trabajo Publicado' : 'New Quote on Your Posted Job'}</h1>
        </div>

        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a;">${isSpanish ? 'Hola' : 'Hi'} ${posterName},</p>

            <p style="font-size: 16px; color: #444; margin-bottom: 25px;">
                ${isSpanish ? 'Un certificador energético local ha enviado un presupuesto profesional en un trabajo que publicaste. El propietario también ha sido notificado.' : 'A local BER Assessor has submitted a professional quote on a job you posted. The homeowner has also been notified.'}
            </p>

            <div style="background-color: #f9fff9; border: 1px solid #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 15px; color: #155724; line-height: 1.5;">
                    <strong>${isSpanish ? 'Precio Transparente:' : 'Transparent Pricing:'}</strong> ${isSpanish ? 'Este presupuesto incluye todos los honorarios aplicables. El precio que ve el propietario es el precio final, sin extras ocultos.' : 'This quote includes all applicable SEAI fees. The price you see is the final price the homeowner pays—no hidden extras.'}
                </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${dashboardUrl}" style="background-color: #007F00; color: #ffffff !important; padding: 18px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 12px rgba(0,127,0,0.2);">
                    ${isSpanish ? 'Ver Trabajo y Presupuestos' : 'View Job & Quotes'}
                </a>
            </div>

            <p style="font-size: 15px; color: #555; margin-bottom: 25px;">
                ${isSpanish ? 'El propietario puede confirmar su reserva al instante aceptando el presupuesto online. Se te copiará en toda la actividad.' : 'The homeowner can instantly confirm their booking by accepting the quote online. You will be copied on all activity.'}
            </p>

            <div style="font-size: 13px; color: #666; line-height: 1.5; border-top: 1px solid #eee; padding-top: 25px; font-style: italic;">
                <strong>${isSpanish ? 'Garantía de Tranquilidad:' : 'Peace of Mind Guarantee:'}</strong> ${isSpanish ? 'Ofrecemos una garantía de devolución del 100%. Si el propietario necesita cancelar por cualquier motivo antes de la visita, se le reembolsará el depósito íntegro.' : 'We offer a 100% money-back guarantee. If the homeowner needs to cancel for any reason before the site visit, their deposit will be refunded in full.'}
            </div>
        </div>

        <div style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eee;">
            ${promoHtml}
            <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} ${isSpanish ? 'Certificado Energético' : 'The Berman'}. ${isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'}<br>
                ${isSpanish ? 'Conectando propietarios con certificadores energéticos certificados en España.' : 'Connecting homeowners with certified energy assessors across Ireland.'}
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};
