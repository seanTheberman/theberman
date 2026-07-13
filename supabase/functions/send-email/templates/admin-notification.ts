
export const generateAdminEmail = (record: any, sponsors: any[], promoHtml: string, tenant: string = 'ireland', config?: any) => {
  const isSpanish = tenant === 'spain';
  const isPortuguese = tenant === 'portugal';
  const brandName = config?.display_name || 'The Berman';
  const websiteUrl = (config?.website_url || 'https://theberman.eu').replace(/\/$/, '');
  return `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">${isSpanish ? 'Nueva Consulta Recibida' : isPortuguese ? 'Novo Contacto Recebido' : 'New Lead Received'}</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                      <p style="font-size: 16px;">${isSpanish ? `Has recibido una nueva consulta desde el sitio web de <strong>${brandName}</strong>.` : isPortuguese ? `Recebeu um novo contacto a partir do site da <strong>${brandName}</strong>.` : `You have received a new inquiry from <strong>${brandName}</strong> website.`}</p>

                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">${isSpanish ? 'Nombre:' : isPortuguese ? 'Nome:' : 'Name:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${isSpanish ? 'Correo:' : isPortuguese ? 'Email:' : 'Email:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <a href="mailto:${record.email}" style="color: #007F00; text-decoration: none;">${record.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${isSpanish ? 'Teléfono:' : isPortuguese ? 'Telefone:' : 'Phone:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.phone}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${isSpanish ? 'Ubicación:' : isPortuguese ? 'Localização:' : 'Location:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.town}, ${record.county}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${isSpanish ? 'Tipo:' : isPortuguese ? 'Tipo:' : 'Type:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.property_type} (${record.purpose})</td>
                        </tr>
                        ${record.bedrooms ? `
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${isSpanish ? 'Habitaciones:' : isPortuguese ? 'Quartos:' : 'Bedrooms:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.bedrooms}</td>
                        </tr>
                        ` : ''}
                        ${record.property_size ? `
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${isSpanish ? 'Tamaño de la Propiedad:' : isPortuguese ? 'Dimensão do Imóvel:' : 'Property Size:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.property_size}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">${isSpanish ? 'Mensaje:' : isPortuguese ? 'Mensagem:' : 'Message:'}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; line-height: 1.5;">${record.message}</td>
                        </tr>
                      </table>

                      ${sponsors && sponsors.length > 0 ? `
                        <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
                            <p style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 5px;">${isSpanish ? 'Promoción enviada al cliente:' : isPortuguese ? 'Promoção enviada ao cliente:' : 'Promo sent to customer:'}</p>
                            ${promoHtml}
                        </div>
                      ` : ''}

                      <div style="margin-top: 30px; text-align: center;">
                        <p style="color: #6b7280; font-size: 0.9rem;">${isSpanish ? 'Inicia sesión en tu panel de administración para revisar esta consulta.' : isPortuguese ? 'Inicie sessão no seu painel de administração para rever este contacto.' : 'Please log in to your admin dashboard to review this lead.'}</p>
                      </div>
                    </div>
                    <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
                      &copy; ${new Date().getFullYear()} ${brandName}. ${isSpanish ? 'Todos los derechos reservados.' : isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'} <br/>
                      <a href="${websiteUrl}/" style="color: #007F00; text-decoration: none;">${isSpanish ? 'Visitar Sitio Web' : isPortuguese ? 'Visitar Site' : 'Visit Website'}</a>
                    </div>
                  </div>
                `;
};
