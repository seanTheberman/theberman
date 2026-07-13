export const generateStatusEmail = (
    customerName: string,
    status: 'scheduled' | 'rescheduled' | 'completed',
    details: {
        inspectionDate?: string;
        contractorName?: string;
        certificateUrl?: string;
        town?: string;
    },
    promoHtml: string,
    websiteUrl: string = "https://theberman.eu",
    tenant: string = 'ireland',
    displayName: string = 'The Berman'
) => {
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const brandName = displayName;
    const certificateName = isSpanish ? 'certificado energético' : (isPortuguese ? 'certificado energético' : (isEngland ? 'EPC' : 'BER'));
    const inspectionName = isSpanish ? 'visita' : (isPortuguese ? 'visita' : (isEngland ? 'assessment' : 'inspection'));
    let title = "";
    let message = "";
    let buttonText = isSpanish ? "Ver Panel" : isPortuguese ? "Ver Painel" : "View Dashboard";
    let buttonUrl = `${websiteUrl}/dashboard`;

    if (status === 'scheduled') {
        title = isSpanish ? "Visita Programada" : isPortuguese ? "Visita Agendada" : `${inspectionName.charAt(0).toUpperCase() + inspectionName.slice(1)} Scheduled`;
        message = isSpanish
            ? `¡Buenas noticias! La visita para tu certificado energético en <strong>${details.town}</strong> ha sido programada para el <strong>${details.inspectionDate}</strong> por <strong>${details.contractorName}</strong>.`
            : isPortuguese
                ? `Boas notícias! A visita para o seu certificado energético em <strong>${details.town}</strong> foi agendada para <strong>${details.inspectionDate}</strong> por <strong>${details.contractorName}</strong>.`
                : `Good news! Your ${certificateName} ${inspectionName} for the property in <strong>${details.town}</strong> has been scheduled for <strong>${details.inspectionDate}</strong> by <strong>${details.contractorName}</strong>.`;
    } else if (status === 'rescheduled') {
        title = isSpanish ? "Visita Reprogramada" : isPortuguese ? "Visita Reagendada" : `${inspectionName.charAt(0).toUpperCase() + inspectionName.slice(1)} Rescheduled`;
        message = isSpanish
            ? `Ten en cuenta que la visita para tu certificado energético en <strong>${details.town}</strong> se ha reprogramado al <strong>${details.inspectionDate}</strong>.`
            : isPortuguese
                ? `Informamos que a visita para o seu certificado energético em <strong>${details.town}</strong> foi reagendada para <strong>${details.inspectionDate}</strong>.`
                : `Please note that your ${certificateName} ${inspectionName} for the property in <strong>${details.town}</strong> has been rescheduled to <strong>${details.inspectionDate}</strong>.`;
    } else if (status === 'completed') {
        title = isSpanish ? "Trabajo Completado" : isPortuguese ? "Trabalho Concluído" : "Job Completed";
        message = isSpanish
            ? `Tu certificado energético para la propiedad en <strong>${details.town}</strong> ya está listo. Puedes verlo y descargarlo usando el siguiente enlace.`
            : isPortuguese
                ? `O seu certificado energético para o imóvel em <strong>${details.town}</strong> já está pronto. Pode consultá-lo e descarregá-lo através do link abaixo.`
                : `Your ${certificateName} assessment for the property in <strong>${details.town}</strong> is now complete. You can view and download your certificate using the link below.`;
        buttonText = isSpanish ? "Ver Certificado" : isPortuguese ? "Ver Certificado" : "View Certificate";
        buttonUrl = details.certificateUrl || buttonUrl;
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
        .header { background-color: #007F00; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
        .message { font-size: 16px; color: #555; margin-bottom: 30px; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #007F00; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; }
        .footer { padding: 30px; border-top: 1px solid #eee; font-size: 14px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            <div class="greeting">${isSpanish ? 'Hola' : isPortuguese ? 'Olá' : 'Hi'} ${customerName},</div>
            <div class="message">
                ${message}
            </div>
            <div class="button-container">
                <a href="${buttonUrl}" class="button">${buttonText}</a>
            </div>
            <div class="message">
                ${isSpanish ? `Un saludo,<br>El Equipo de ${brandName}` : isPortuguese ? `Com os melhores cumprimentos,<br>A Equipa ${brandName}` : `Best Regards,<br>${brandName} Team`}
            </div>
        </div>
        <div class="footer">
            ${promoHtml}
        </div>
    </div>
</body>
</html>
    `.trim();
};
