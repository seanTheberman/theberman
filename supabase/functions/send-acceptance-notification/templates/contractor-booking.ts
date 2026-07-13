export const generateContractorBookingEmail = (contractorName: string, customerName: string, customerAddress: string, price: number, websiteUrl: string = "https://theberman.eu", promoHtml: string = "", tenant: string = 'ireland', displayName: string = 'The Berman') => {
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const brandName = displayName;
    const certificateName = isSpanish ? 'certificado energético' : (isPortuguese ? 'certificado energético' : (isEngland ? 'EPC' : 'BER'));
    const dashboardUrl = `${websiteUrl}/dashboard/contractor`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #eee; }
        .header { background-color: #007F00; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .message { font-size: 16px; color: #555; margin-bottom: 25px; }
        .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .highlight-item { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 15px; }
        .highlight-label { color: #64748b; font-weight: 500; }
        .highlight-value { color: #1e293b; font-weight: 700; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #007F00; color: white !important; padding: 16px 45px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px; display: inline-block; }
        .footer { padding: 30px; border-top: 1px solid #eee; font-size: 14px; color: #888; background-color: #ffffff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isSpanish ? '¡Tienes un Nuevo Cliente!' : isPortuguese ? 'Tem um Novo Cliente!' : "You've Been Hired!"}</h1>
        </div>
        <div class="content">
            <div class="greeting">${isSpanish ? 'Hola' : isPortuguese ? 'Olá' : 'Hi'} ${contractorName},</div>
            <div class="message">
                ${isSpanish ? `¡Enhorabuena! <strong>${customerName}</strong> ha aceptado tu presupuesto para un certificado energético.` : isPortuguese ? `Parabéns! <strong>${customerName}</strong> aceitou o seu orçamento para um certificado energético.` : `Congratulations! <strong>${customerName}</strong> has accepted your quote for a ${certificateName} assessment.`}
            </div>

            <div class="highlight-box">
                <div class="highlight-item">
                    <span class="highlight-label">${isSpanish ? 'Cliente' : isPortuguese ? 'Cliente' : 'Customer'}</span>
                    <span class="highlight-value">${customerName}</span>
                </div>
                <div class="highlight-item">
                    <span class="highlight-label">${isSpanish ? 'Dirección de la Propiedad' : isPortuguese ? 'Morada do Imóvel' : 'Property Address'}</span>
                    <span class="highlight-value">${customerAddress}</span>
                </div>
                <div class="highlight-item">
                    <span class="highlight-label">${isSpanish ? 'Precio' : isPortuguese ? 'Preço' : 'Price'}</span>
                    <span class="highlight-value">€${price}</span>
                </div>
            </div>

            <div class="message">
                <strong>${isSpanish ? 'Siguiente Paso:' : isPortuguese ? 'Próximo Passo:' : 'Next Step:'}</strong><br>
                ${isSpanish ? 'Inicia sesión en tu panel para ver los datos de contacto completos y acordar la fecha de la visita con el cliente.' : isPortuguese ? 'Inicie sessão no seu painel para ver os dados de contacto completos e agendar a data da visita com o cliente.' : 'Please log in to your dashboard to view the full contact details and schedule the assessment date with the client.'}
            </div>

            <div class="button-container">
                <a href="${dashboardUrl}" class="button">${isSpanish ? 'Ir al Panel' : isPortuguese ? 'Ir para o Painel' : 'Go to Dashboard'}</a>
            </div>

            <div class="message">
                ${isSpanish ? `Un saludo,<br>El Equipo de ${brandName}` : isPortuguese ? `Com os melhores cumprimentos,<br>A Equipa ${brandName}` : `Best Regards,<br>${brandName} Team`}
            </div>
        </div>
        <div class="footer">
            ${promoHtml}
            <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
                &copy; ${new Date().getFullYear()} ${brandName}. ${isSpanish ? 'Todos los derechos reservados.' : isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};
