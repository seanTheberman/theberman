
export const generateCustomerEmail = (record: any, promoHtml: string, tenant: string = 'ireland', config?: any) => {
    const isSpanish = tenant === 'spain';
    const isPortuguese = tenant === 'portugal';
    const brandName = config?.display_name || 'The Berman';
    const websiteUrl = (config?.website_url || 'https://theberman.eu').replace(/\/$/, '');
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <div style="background-color: #007F00; padding: 35px 20px; text-align: center;">
            <img src="${websiteUrl}/logo.svg" alt="${brandName}" style="height: 32px; margin-bottom: 12px; filter: brightness(0) invert(1);">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">${isSpanish ? 'Consulta Recibida' : isPortuguese ? 'Pedido Recebido' : 'Request Received'}</h1>
        </div>

        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; font-weight: 600; margin-top: 0; color: #1a1a1a;">${isSpanish ? 'Hola' : isPortuguese ? 'Olá' : 'Hi'} ${record.name},</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                ${isSpanish
                    ? `¡Gracias por contactarnos! Hemos recibido tu consulta para un certificado energético en <strong>${record.town}</strong>. Nuestro equipo está revisando tus datos y te enviaremos presupuestos a medida en breve.`
                    : isPortuguese
                        ? `Obrigado por nos contactar! Recebemos o seu pedido de certificado energético em <strong>${record.town}</strong>. A nossa equipa está a rever os seus dados e enviar-lhe-emos orçamentos personalizados em breve.`
                        : `Thank you for reaching out! We've received your inquiry for a BER assessment in <strong>${record.town}</strong>. Our team is currently reviewing your details and we will get back to you with tailored quotes shortly.`}
            </p>

            <div style="background-color: #fdfdfd; border: 1px solid #eee; padding: 25px; border-radius: 10px; margin: 30px 0;">
                <h4 style="margin: 0 0 15px 0; color: #007F00; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">${isSpanish ? 'Resumen de Detalles:' : isPortuguese ? 'Resumo de Detalhes:' : 'Summary of Details:'}</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>${isSpanish ? 'Teléfono:' : isPortuguese ? 'Telefone:' : 'Phone:'}</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>${isSpanish ? 'Tipo de Propiedad:' : isPortuguese ? 'Tipo de Imóvel:' : 'Property Type:'}</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.property_type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>${isSpanish ? 'Propósito:' : isPortuguese ? 'Finalidade:' : 'Purpose:'}</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.purpose}</td>
                    </tr>
                    ${record.bedrooms ? `
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>${isSpanish ? 'Habitaciones:' : isPortuguese ? 'Quartos:' : 'Bedrooms:'}</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.bedrooms}</td>
                    </tr>
                    ` : ''}
                    ${record.property_size ? `
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>${isSpanish ? 'Tamaño de la Propiedad:' : isPortuguese ? 'Dimensão do Imóvel:' : 'Property Size:'}</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.property_size}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <p style="font-size: 15px; color: #666; text-align: center; margin-bottom: 30px;">
                ${isSpanish ? 'Recibirás una notificación por correo en cuanto nuestros certificadores envíen sus presupuestos.' : isPortuguese ? 'Receberá uma notificação por email assim que os nossos peritos enviarem os seus orçamentos.' : "You'll receive an email notification as soon as our assessors provide their quotes."}
            </p>

            <div style="text-align: center;">
                <a href="${websiteUrl}" style="background-color: #007F00; color: #ffffff !important; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; display: inline-block;">
                    ${isSpanish ? 'Visitar Nuestro Sitio Web' : isPortuguese ? 'Visitar o Nosso Site' : 'Visit Our Website'}
                </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
            ${promoHtml}
        </div>

        <div style="text-align: center; padding: 0 30px 35px 30px; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} ${brandName}. ${isSpanish ? 'Todos los derechos reservados.' : isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}<br/>
            ${isSpanish ? 'Promoviendo la eficiencia energética en España.' : isPortuguese ? 'Promovendo a eficiência energética em Portugal.' : 'Promoting energy efficiency across Ireland.'}
        </div>
    </div>
</body>
</html>
`;
};
