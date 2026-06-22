
type TranslationValue = string | ((...args: any[]) => string);
const TRANSLATIONS: Record<string, Record<string, TranslationValue>> = {
  en: {
    title: (n: number) => `${n}x Jobs Still Available to Quote`,
    header: 'Submit Your Quotes',
    greeting: (name: string) => `Hi ${name},`,
    jobCount: (n: number) => `There are <strong>${n} jobs</strong> available that you have not yet quoted on.`,
    county: 'County',
    town: 'Town',
    type: 'Type',
    purpose: 'Purpose',
    quote: 'Quote',
    quoteHere: 'Quote Here',
    viewAllJobs: 'View All Jobs',
    bestRegards: 'Best Regards,',
    teamName: 'TheBerman Team',
    footer: (year: number) => `&copy; ${year} TheBerman.eu. All rights reserved.`,
  },
  es: {
    title: (n: number) => `${n} trabajos disponibles para presupuestar`,
    header: 'Envía tus Presupuestos',
    greeting: (name: string) => `Hola ${name},`,
    jobCount: (n: number) => `Hay <strong>${n} trabajos</strong> disponibles en los que aún no has presupuestado.`,
    county: 'Comunidad Autónoma',
    town: 'Municipio',
    type: 'Tipo',
    purpose: 'Finalidad',
    quote: 'Presupuesto',
    quoteHere: 'Presupuestar',
    viewAllJobs: 'Ver Todos los Trabajos',
    bestRegards: 'Un saludo,',
    teamName: 'El Equipo de TheBerman',
    footer: (year: number) => `&copy; ${year} TheBerman.eu. Todos los derechos reservados.`,
  },
  fr: {
    title: (n: number) => `${n} missions encore disponibles pour devis`,
    header: 'Soumettez vos Devis',
    greeting: (name: string) => `Bonjour ${name},`,
    jobCount: (n: number) => `Il y a <strong>${n} missions</strong> disponibles sur lesquelles vous n'avez pas encore devisé.`,
    county: 'Région',
    town: 'Ville',
    type: 'Type',
    purpose: 'Objectif',
    quote: 'Devis',
    quoteHere: 'Devis Ici',
    viewAllJobs: 'Voir Toutes les Missions',
    bestRegards: 'Cordialement,',
    teamName: "L'Équipe TheBerman",
    footer: (year: number) => `&copy; ${year} TheBerman.eu. Tous droits réservés.`,
  },
  pt: {
    title: (n: number) => `${n} trabalhos disponíveis para orçamento`,
    header: 'Envie os seus Orçamentos',
    greeting: (name: string) => `Olá ${name},`,
    jobCount: (n: number) => `Há <strong>${n} trabalhos</strong> disponíveis em que ainda não orçamentou.`,
    county: 'Região',
    town: 'Concelho',
    type: 'Tipo',
    purpose: 'Finalidade',
    quote: 'Orçamento',
    quoteHere: 'Orçamentar',
    viewAllJobs: 'Ver Todos os Trabalhos',
    bestRegards: 'Atenciosamente,',
    teamName: 'A Equipa TheBerman',
    footer: (year: number) => `&copy; ${year} TheBerman.eu. Todos os direitos reservados.`,
  },
};

function getLang(tenant: string): string {
  const map: Record<string, string> = { spain: 'es', france: 'fr', portugal: 'pt' };
  return map[tenant] || 'en';
}

function resolveT(val: TranslationValue, ...args: any[]): string {
  return typeof val === 'function' ? val(...args) : val;
}

export const generateDigestEmail = (
    contractorName: string,
    availableJobs: any[],
    websiteUrl: string,
    tenant: string = 'ireland'
): string => {
    const lang = getLang(tenant);
    const t = TRANSLATIONS[lang];

    const jobRows = availableJobs.map(job => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.county || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.town || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.property_type || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.ber_purpose || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        <a href="${websiteUrl}/contractor" style="background-color: #007F00; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block;">${t.quoteHere}</a>
      </td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${resolveT(t.title, availableJobs.length)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #333; margin: 0;">${resolveT(t.title, availableJobs.length)}</h1>
  </div>

  <div style="background-color: #007F00; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">${t.header}</h2>
  </div>

  <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p>${resolveT(t.greeting, contractorName)}</p>
    <p>${resolveT(t.jobCount, availableJobs.length)}</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
      <thead>
        <tr style="background-color: #666; color: white;">
          <th style="padding: 12px; text-align: left;">${t.county}</th>
          <th style="padding: 12px; text-align: left;">${t.town}</th>
          <th style="padding: 12px; text-align: left;">${t.type}</th>
          <th style="padding: 12px; text-align: left;">${t.purpose}</th>
          <th style="padding: 12px; text-align: center;">${t.quote}</th>
        </tr>
      </thead>
      <tbody>
        ${jobRows}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${websiteUrl}/contractor" style="background-color: #007F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">${t.viewAllJobs}</a>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
    <p>${resolveT(t.footer, new Date().getFullYear())}</p>
  </div>

</body>
</html>
  `;
};