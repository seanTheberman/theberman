const SPANISH_PURPOSES: Record<string, string> = {
    'Selling': 'Venta',
    'Letting': 'Alquiler',
    'Govt Grant': 'Subvención Pública',
    'Mortgage': 'Hipoteca',
    'New Build': 'Obra Nueva',
    'Personal Interest': 'Interés Personal',
    'Compliance requirement': 'Requisito de Cumplimiento',
    'Selling property': 'Venta de Propiedad',
    'Leasing property': 'Alquiler de Propiedad',
    'ESG reporting': 'Informe ESG',
    'Grant / funding': 'Subvención / Financiación',
    'Energy upgrade planning': 'Planificación de Mejora Energética',
};

export const generateJobReminderEmail = (
    contractorName: string,
    jobs: Array<{
        id: string;
        county: string;
        town: string;
        property_type: string;
        ber_purpose: string;
    }>,
    promoHtml: string,
    websiteUrl: string = "https://theberman.eu",
    contractorPhone?: string,
    isSpanish: boolean = false,
    displayName: string = 'The Berman',
) => {
    const brandName = displayName;
    const jobCount = jobs.length;
    const phoneParam = contractorPhone ? `?phone=${encodeURIComponent(contractorPhone)}` : '';
    const translatePurpose = (purpose: string) => isSpanish ? (SPANISH_PURPOSES[purpose] || purpose) : purpose;
    const translatePropertyType = (type: string) => {
        if (!isSpanish) return type;
        const map: Record<string, string> = {
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
        return map[type] || type;
    };

    const jobRows = jobs.map(job => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; font-size: 14px; color: #333;">${job.county}</td>
      <td style="padding: 12px; font-size: 14px; color: #333;">${job.town}</td>
      <td style="padding: 12px; font-size: 14px; color: #333;">${translatePropertyType(job.property_type)}</td>
      <td style="padding: 12px; font-size: 14px; color: #333;">${translatePurpose(job.ber_purpose)}</td>
      <td style="padding: 12px; text-align: center;">
        <a href="${websiteUrl}/quote/${job.id}${phoneParam}" style="background-color: #5CB85C; color: white !important; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block;">
          ${isSpanish ? 'Presupuestar' : 'Quote Here'}
        </a>
      </td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
        .header { background-color: #5CB85C; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .message { font-size: 14px; color: #555; margin-bottom: 25px; }
        .job-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .job-table th { background-color: #808080; color: white; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
        .footer { padding: 30px; border-top: 1px solid #eee; font-size: 14px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isSpanish ? 'Envía tus Presupuestos' : 'Submit Your Quotes'}</h1>
        </div>
        <div class="content">
            <div class="greeting">${isSpanish ? 'Hola' : 'Hi'} ${contractorName},</div>
            <div class="message">
                ${isSpanish ? `Hay <strong>${jobCount} trabajos</strong> disponibles en los que aún no has presupuestado.` : `There are <strong>${jobCount} jobs</strong> available that you have not yet quoted on.`}
            </div>
            
            <table class="job-table">
                <thead>
                    <tr>
                        <th>${isSpanish ? 'Provincia' : 'County'}</th>
                        <th>${isSpanish ? 'Municipio' : 'Town'}</th>
                        <th>${isSpanish ? 'Tipo' : 'Type'}</th>
                        <th>${isSpanish ? 'Finalidad' : 'Purpose'}</th>
                        <th>${isSpanish ? 'Presupuesto' : 'Quote'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobRows}
                </tbody>
            </table>

            <div class="message">
                ${isSpanish ? `Un saludo,<br>Equipo de ${brandName}` : `Best Regards,<br>${brandName} Team`}
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
