
export const generateCustomerConfirmationEmail = (record: any, businessName: string, tenant: string = 'ireland', websiteUrl: string = 'https://theberman.eu', brandName: string = 'The Berman') => {
    const isSpanish = tenant === 'spain';
    const catalogueName = `${brandName} Catalogue`;
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #1b6cb5;">
        <h1 style="color: #333; margin: 0; font-size: 24px;">${isSpanish ? 'Mensaje Enviado Correctamente' : 'Message Sent Successfully'}</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 16px;">${isSpanish ? 'Hola' : 'Hello'} <strong>${record.name}</strong>,</p>
        <p style="font-size: 16px;">${isSpanish ? 'Tu mensaje se ha enviado correctamente a' : 'Your message has been successfully sent to'} <strong>${businessName}</strong> ${isSpanish ? `a través del Catálogo de ${brandName}.` : `via ${catalogueName}.`}</p>

        <div style="background-color: #f1f7fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #555;"><strong>${isSpanish ? 'Tu Mensaje:' : 'Your Message:'}</strong></p>
          <p style="margin: 10px 0 0 0; font-style: italic; color: #666;">"${record.message || (isSpanish ? 'No se ha proporcionado ningún mensaje.' : 'No message provided.')}"</p>
        </div>

        <p style="font-size: 14px; color: #777;">${isSpanish ? 'El negocio revisará tu consulta y se pondrá en contacto contigo directamente en' : 'The business will review your enquiry and get back to you directly at'} <strong>${record.email}</strong>.</p>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        &copy; 2026 ${brandName}. ${isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'} <br/>
        <a href="${websiteUrl}" style="color: #1b6cb5; text-decoration: none;">${websiteUrl.replace('https://', '')}</a>
      </div>
    </div>
  `;
};
