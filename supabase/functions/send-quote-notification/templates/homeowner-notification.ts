export const generateHomeownerQuoteEmail = (customerName: string, websiteUrl: string = "https://theberman.eu", promoHtml: string = "", tenant: string = 'ireland', displayName: string = 'The Berman') => {
    const isSpanish = tenant === 'spain';
    const isPortuguese = tenant === 'portugal';
    const brandName = displayName;
    const dashboardUrl = `${websiteUrl}/dashboard/user`;

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
            <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${isSpanish ? 'Has Recibido un Nuevo Presupuesto' : isPortuguese ? 'Recebeu um Novo Orçamento' : 'New BER Quote Received'}</h1>
        </div>

        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a;">${isSpanish ? 'Hola' : isPortuguese ? 'Olá' : 'Hi'} ${customerName},</p>

            <p style="font-size: 16px; color: #444; margin-bottom: 25px;">
                ${isSpanish ? '¡Buenas noticias! Un certificador energético local ha enviado un presupuesto profesional para tu propiedad.' : isPortuguese ? 'Boas notícias! Um perito certificador local enviou um orçamento profissional para o seu imóvel.' : 'Great news! A local BER Assessor has submitted a professional quote for your property assessment.'}
            </p>

            <div style="background-color: #f9fff9; border: 1px solid #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 15px; color: #155724; line-height: 1.5;">
                    <strong>${isSpanish ? 'Precio Transparente:' : isPortuguese ? 'Preço Transparente:' : 'Transparent Pricing:'}</strong> ${isSpanish ? 'Este presupuesto incluye todos los honorarios aplicables. El precio que ves es el precio final, sin extras ocultos.' : isPortuguese ? 'Este orçamento inclui todas as taxas aplicáveis. O preço que vê é o preço final — sem extras ocultos.' : 'This quote includes all applicable SEAI fees. The price you see is the final price you pay—no hidden extras.'}
                </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${dashboardUrl}" style="background-color: #007F00; color: #ffffff !important; padding: 18px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 12px rgba(0,127,0,0.2);">
                    ${isSpanish ? 'Revisar Detalles del Presupuesto' : isPortuguese ? 'Rever Detalhes do Orçamento' : 'Review Quote Details'}
                </a>
            </div>

            <p style="font-size: 15px; color: #555; margin-bottom: 25px;">
                ${isSpanish ? 'Puedes confirmar tu reserva al instante aceptando el presupuesto online. Un pequeño depósito asegura tu plaza en la agenda del certificador.' : isPortuguese ? 'Pode confirmar a sua reserva instantaneamente aceitando o orçamento online. Um pequeno depósito garante o seu lugar na agenda do perito certificador.' : "You can instantly confirm your booking by accepting the quote online. A small deposit secures your spot in the assessor's schedule."}
            </p>

            <div style="font-size: 13px; color: #666; line-height: 1.5; border-top: 1px solid #eee; padding-top: 25px; font-style: italic;">
                <strong>${isSpanish ? 'Garantía de Tranquilidad:' : isPortuguese ? 'Garantia de Confiança:' : 'Peace of Mind Guarantee:'}</strong> ${isSpanish ? 'Ofrecemos una garantía de devolución del 100%. Si necesitas cancelar por cualquier motivo antes de la visita, te reembolsaremos el depósito íntegro.' : isPortuguese ? 'Oferecemos uma garantia de reembolso de 100%. Se precisar de cancelar por qualquer motivo antes da visita, o depósito será reembolsado na íntegra.' : 'We offer a 100% money-back guarantee. If you need to cancel for any reason before the site visit, your deposit will be refunded in full.'}
            </div>
        </div>

        <div style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eee;">
            ${promoHtml}
            <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} ${brandName}. ${isSpanish ? 'Todos los derechos reservados.' : isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}<br>
                ${isSpanish ? 'Conectando propietarios con certificadores energéticos certificados en España.' : isPortuguese ? 'A ligar proprietários a peritos certificadores de energia em Portugal.' : 'Connecting homeowners with certified energy assessors across Ireland.'}
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};
