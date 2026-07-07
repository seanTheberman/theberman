export const generateHomeownerAcceptanceEmail = (customerName: string, contractorName: string, price: number, websiteUrl: string = "https://theberman.eu", promoHtml: string = "", tenant: string = 'ireland') => {
    const isSpanish = tenant === 'spain';
    const dashboardUrl = `${websiteUrl}/dashboard/user`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #eee; }
        .header { background-color: #58a25c; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .message { font-size: 16px; color: #555; margin-bottom: 25px; }
        .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .highlight-item { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 15px; }
        .highlight-label { color: #64748b; font-weight: 500; }
        .highlight-value { color: #1e293b; font-weight: 700; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #58a25c; color: white !important; padding: 16px 45px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px; display: inline-block; }
        .footer { padding: 30px; border-top: 1px solid #eee; font-size: 14px; color: #888; background-color: #ffffff; }
        .guarantee { font-size: 13px; color: #666; margin-top: 30px; line-height: 1.4; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isSpanish ? '¡Reserva Confirmada!' : 'Booking Confirmed!'}</h1>
        </div>
        <div class="content">
            <div class="greeting">${isSpanish ? 'Hola' : 'Hi'} ${customerName},</div>
            <div class="message">
                ${isSpanish ? `¡Buenas noticias! Tu reserva para el certificado energético ha sido confirmada con <strong>${contractorName}</strong>.` : `Great news! Your BER assessment booking has been confirmed with <strong>${contractorName}</strong>.`}
            </div>

            <div class="highlight-box">
                <div class="highlight-item">
                    <span class="highlight-label">${isSpanish ? 'Certificador' : 'Assessor'}</span>
                    <span class="highlight-value">${contractorName}</span>
                </div>
                <div class="highlight-item">
                    <span class="highlight-label">${isSpanish ? 'Precio Acordado' : 'Agreed Price'}</span>
                    <span class="highlight-value">€${price}</span>
                </div>
                <div class="highlight-item">
                    <span class="highlight-label">${isSpanish ? 'Estado del Pago' : 'Payment Status'}</span>
                    <span class="highlight-value">${isSpanish ? 'Depósito Pendiente / Pdte.' : 'Deposit Pending / TBC'}</span>
                </div>
            </div>

            <div class="message">
                <strong>${isSpanish ? '¿Qué ocurre ahora?' : 'What happens next?'}</strong><br>
                ${isSpanish ? `${contractorName} revisará los datos de tu propiedad y se pondrá en contacto contigo en breve para concretar la fecha y hora de la visita.` : `${contractorName} will review your property details and contact you shortly to finalize the inspection date and time.`}
            </div>

            <div class="button-container">
                <a href="${dashboardUrl}" class="button">${isSpanish ? 'Gestionar Reserva' : 'Manage Booking'}</a>
            </div>

            <div class="guarantee">
                ${isSpanish
                    ? 'No olvides nuestra <strong>GARANTÍA DE DEVOLUCIÓN DEL 100% SIN RIESGO</strong>. Si por cualquier motivo deseas cancelar antes de que el certificador visite tu propiedad, te reembolsaremos el depósito íntegro.'
                    : "Don't forget our <strong>100% NO-RISK MONEY-BACK GUARANTEE!</strong> If for any reason you wish to cancel before the assessor visits your home, we will refund your deposit in full."}
            </div>
        </div>
        <div class="footer">
            ${promoHtml}
            <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
                &copy; ${new Date().getFullYear()} ${isSpanish ? 'TheBerman' : 'TheBerman'}. ${isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'}
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};
