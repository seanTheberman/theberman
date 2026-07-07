const SPANISH_PROPERTY_LABELS: Record<string, string> = {
    'Address': 'Dirección',
    'Eircode': 'Código Postal',
    'Bedrooms': 'Habitaciones',
    'Property Size': 'Tamaño',
    'Property Details': 'Detalles de la Propiedad',
};

const SPANISH_PROPERTY_TYPES: Record<string, string> = {
    'Semi-Detached': 'Adosado',
    'Mid-Terrace': 'Casa Pareada',
    'End-Terrace': 'Casa Extremo',
    'Apartment': 'Apartamento',
    'Piso': 'Piso',
    'Duplex': 'Dúplex',
    'Detached': 'Casa Aislada',
    'Bungalow': 'Bungalow',
    'Multi-Unit': 'Multi-Unidad',
    'Other': 'Otro',
    'Office': 'Oficina',
    'Retail / Shop': 'Tienda / Comercio',
    'Warehouse / Industrial': 'Almacén / Industrial',
    'Hospitality': 'Hostelería',
    'Healthcare': 'Salud / Sanitario',
    'Education': 'Educación',
    'Mixed-Use': 'Uso Mixto',
};

export const generateContractorEmail = (customerCounty: string, customerTown: string, contractorName: string, promoHtml: string, websiteUrl: string = "https://theberman.eu", jobType?: string, eircode?: string, propertyAddress?: string, assessmentId?: string, contractorPhone?: string, propertySize?: string, bedrooms?: number | string, isSpanish: boolean = false) => {
    const isCommercial = jobType === 'commercial';
    const jobTitle = isCommercial
        ? (isSpanish ? 'Certificado Energético Comercial' : 'Commercial BER Certificate')
        : (isSpanish ? 'Certificado Energético de Vivienda' : 'Domestic BER Certificate');
    const locationStr = isSpanish
        ? `${customerTown}${customerTown && customerCounty ? ', ' : ''}${customerCounty}`
        : `${customerTown}${customerTown && customerCounty ? ', Co. ' : ''}${customerCounty}`;
    const translatePropertyType = (type: string) => isSpanish ? (SPANISH_PROPERTY_TYPES[type] || type) : type;
    // Include ?phone so the assessor can submit without logging in — QuickQuotePage
    // auto-identifies them by phone and attaches the quote to their profile.
    const phoneParam = contractorPhone ? `?phone=${encodeURIComponent(contractorPhone)}` : '';
    const dashboardUrl = `${websiteUrl}/quote/${assessmentId || ''}${phoneParam}`;
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New ${isCommercial ? 'Commercial' : 'Domestic'} BER Job in ${locationStr}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <!-- GREEN HEADER BANNER -->
                    <tr>
                        <td style="background-color: #55a355; padding: 30px 30px; text-align: center;">
                            <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">
                                ${jobTitle}
                            </p>
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">
                                ${locationStr}
                            </h1>
                        </td>
                    </tr>

                    <!-- MAIN CONTENT -->
                    <tr>
                        <td style="padding: 40px 30px 20px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                ${isSpanish ? 'Hola' : 'Hi'} ${contractorName},
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.8;">
                                ${isSpanish ? `Un cliente en <strong>${locationStr}</strong> busca un <strong>${jobTitle}</strong>.` : `A client in <strong>${locationStr}</strong> is looking for a <strong>${jobTitle}</strong>.`}
                            </p>
                            ${(propertyAddress || propertySize || bedrooms) ? `
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007F00;">
                                <h4 style="margin: 0 0 15px 0; font-size: 15px; color: #007F00; font-weight: bold;">${isSpanish ? SPANISH_PROPERTY_LABELS['Property Details'] : 'Property Details'}</h4>
                                ${propertyAddress ? `
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                    <strong>${isSpanish ? SPANISH_PROPERTY_LABELS['Address'] : 'Address'}:</strong> ${propertyAddress}
                                </p>
                                ` : ''}
                                ${eircode ? `
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                    <strong>${isSpanish ? SPANISH_PROPERTY_LABELS['Eircode'] : 'Eircode'}:</strong> <span style="color: #007F00; font-weight: bold;">${eircode}</span>
                                </p>
                                ` : ''}
                                ${bedrooms ? `
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                    <strong>${isSpanish ? SPANISH_PROPERTY_LABELS['Bedrooms'] : 'Bedrooms'}:</strong> ${bedrooms}
                                </p>
                                ` : ''}
                                ${propertySize ? `
                                <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                    <strong>${isSpanish ? SPANISH_PROPERTY_LABELS['Property Size'] : 'Property Size'}:</strong> ${propertySize}
                                </p>
                                ` : ''}
                            </div>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- QUOTE NOW BUTTON -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color: #55a355; border-radius: 6px;">
                                        <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                                            ${isSpanish ? 'Presupuestar Ahora' : 'Quote Now'}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- BEST REGARDS -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <p style="margin: 0; font-size: 15px; color: #555555; line-height: 1.8;">
                                ${isSpanish ? 'Un saludo,<br>Equipo de Certificado Energético' : 'Best Regards,<br>TheBerman.eu'}
                            </p>
                        </td>
                    </tr>

                    <!-- SOLAR CROSS-PROMO -->
                    <tr>
                        <td style="padding: 0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: bold; color: #333333;">
                                            ${isSpanish ? '¿Considerando placas solares?' : 'Considering Solar Panels?'}
                                        </p>
                                        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #333333;">
                                            ${isSpanish ? 'Compara las mejores ofertas de energía solar en' : 'Compare the Best Solar Deals at'}
                                        </p>
                                        <a href="${isSpanish ? 'https://solarquotesspain.com' : 'https://solarquotesireland.com'}" target="_blank" style="display: inline-block; font-size: 15px; font-weight: bold; color: #1a73e8; text-decoration: none;">
                                            ${isSpanish ? 'SolarQuotesSpain.com' : 'SolarQuotesIreland.com'}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- SPONSORS / DYNAMIC PROMOS -->
                    ${promoHtml ? `
                    <tr>
                        <td style="padding: 20px 30px;">
                            ${promoHtml}
                        </td>
                    </tr>
                    ` : ''}

                    <!-- FOOTER -->
                    <tr>
                        <td style="padding: 25px 30px; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; color: #888888;">
                                W: <a href="${websiteUrl}" style="color: #1a73e8; text-decoration: none;">${websiteUrl.replace('https://', 'www.')}</a>
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 13px; color: #888888;">
                                E: <a href="mailto:${isSpanish ? 'info@certificadosenergeticos.eu' : 'info@theberman.eu'}" style="color: #1a73e8; text-decoration: none;">${isSpanish ? 'info@certificadosenergeticos.eu' : 'info@theberman.eu'}</a>
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #aaaaaa;">
                                &copy; ${currentYear} ${isSpanish ? 'Certificado Energético' : 'TheBerman.eu'}
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #aaaaaa; line-height: 1.6;">
                                ${isSpanish ? `Este correo se ha enviado porque estás registrado como certificador energético en ${websiteUrl}. Si no deseas recibir más avisos, puedes <a href="${websiteUrl}/unsubscribe" style="color: #888888; text-decoration: underline;">darte de baja aquí</a>. Dejarás de recibir notificaciones de trabajos, pero podrás seguir accediendo a tu cuenta iniciando sesión en la web con tu dirección de correo.` : `This email was sent because you are a registered BER assessor on TheBerman.eu. If you do not wish to receive updates you can <a href="${websiteUrl}/unsubscribe" style="color: #888888; text-decoration: underline;">unsubscribe here</a>. You will no longer receive job notifications, but you can still access your account by logging in at the website with your email address.`}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};
