// Vercel Edge Middleware — Multi-tenant SEO Fix
// Injects: canonical, title, meta description, OG tags, hreflang, JSON-LD schema
// Zero changes to the React app needed.

import { HOME_SEO, PAGE_SEO } from './seo-metadata.js';
import { SITEMAP_BY_TENANT } from './sitemap-data.js';

export const config = { matcher: '/((?!_next|assets|favicon|logo).*)' };

// ─── Tenant route isolation ───────────────────────────────────────────────────
// Prevents Google from indexing routes that belong to a different tenant.
// When Googlebot crawls epccert.com/sobre-nosotros, it gets a 301 redirect
// to epccert.com/about-us instead of indexing a Spanish page on an English domain.

// Tenant-specific static routes → equivalent route on other tenants
// Routes listed here are ONLY valid on the tenants in the 'tenants' array.
// On any other tenant, they get 301-redirected to the 'redirect' path.
const TENANT_SPECIFIC_ROUTES = {
  '/sobre-nosotros':      { tenants: ['spain'],            redirect: '/about-us' },
  '/servicios':           { tenants: ['spain'],            redirect: '/services' },
  '/precios':             { tenants: ['spain'],            redirect: '/pricing' },
  '/asesor-energetico':   { tenants: ['spain'],            redirect: '/energy-advisor' },
  '/ubicaciones':         { tenants: ['spain'],            redirect: '/locations' },
  '/tecnicos':            { tenants: ['spain'],            redirect: '/catalogue' },
  '/pedir-presupuesto':   { tenants: ['spain'],            redirect: '/get-quote' },
  '/registrate-tecnico':  { tenants: ['spain'],            redirect: '/hire-agent' },
  '/epc-faq':             { tenants: ['england'],          redirect: '/faq' },
  '/sobre-nos':           { tenants: ['portugal'],         redirect: '/about-us' },
  '/servicos':            { tenants: ['portugal'],         redirect: '/services' },
  '/precos':              { tenants: ['portugal'],         redirect: '/pricing' },
  '/catalogo':            { tenants: ['portugal'],         redirect: '/catalogue' },
  '/consultor-energetico':{ tenants: ['portugal'],         redirect: '/energy-advisor' },
  '/localizacoes':        { tenants: ['portugal'],         redirect: '/locations' },
  '/noticias':            { tenants: ['portugal'],         redirect: '/news' },
  '/faqs':                { tenants: ['portugal'],         redirect: '/faq' },
  '/contacto':            { tenants: ['spain', 'portugal'],redirect: '/contact-us' },
};

// Tenant-specific prefix routes → redirect the prefix and keep the rest
const TENANT_PREFIX_ROUTES = {
  '/directorio':            { tenants: ['spain'],    redirect: '/catalogue' },
  '/preguntas-frecuentes':  { tenants: ['spain'],    redirect: '/faq' },
};

// Location page prefixes — only valid on their own tenant
const LOCATION_PREFIXES = {
  spain:   '/certificado-energetico-',
  england: '/epc-assessment-',
};

// Dynamic route prefixes valid on all tenants (e.g. /blog/some-post)
const DYNAMIC_PREFIXES = new Set(['blog', 'news', 'catalogue', 'profiles', 'quote']);

// Shared static routes valid on all tenants
const SHARED_ROUTES = new Set([
  '/', '/about-us', '/about', '/services', '/pricing', '/contact-us',
  '/catalogue', '/catalogue/businesses', '/catalogue/ber-assessors',
  '/catalogue/epc-assessors', '/catalogue/epc-businesses',
  '/locations', '/blog', '/news', '/faq', '/ber-faqs', '/ber-faqs/',
  '/energy-advisor', '/hire-agent', '/privacy', '/terms', '/cookie-policy',
  '/assessor-terms', '/login', '/secure-admin-login', '/signup', '/subscribe',
  '/get-quote', '/forgot-password', '/update-password', '/auth/error',
  '/admin', '/secure-admin-portal', '/membership-payment', '/thank-you',
  '/registration-pending', '/dashboard/ber-assessor', '/dashboard/user',
  '/dashboard/business', '/assessor-onboarding', '/business-onboarding',
]);

function getTenantRedirect(path, tenant) {
  // Check exact tenant-specific routes
  const specific = TENANT_SPECIFIC_ROUTES[path];
  if (specific && !specific.tenants.includes(tenant)) {
    return specific.redirect;
  }

  // Check prefix-based tenant routes (e.g. /directorio/businesses → /catalogue/businesses)
  for (const [prefix, cfg] of Object.entries(TENANT_PREFIX_ROUTES)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      if (!cfg.tenants.includes(tenant)) {
        return cfg.redirect + path.slice(prefix.length);
      }
    }
  }

  // Check location prefixes from other tenants
  for (const [t, prefix] of Object.entries(LOCATION_PREFIXES)) {
    if (path.startsWith(prefix) && tenant !== t) {
      return '/locations';
    }
  }

  return null;
}

function isValidPath(path, tenant, sitemapUrls) {
  // Shared routes are always valid
  if (SHARED_ROUTES.has(path)) return true;

  // Tenant-specific routes — valid only on their tenants
  const specific = TENANT_SPECIFIC_ROUTES[path];
  if (specific) return specific.tenants.includes(tenant);

  // Tenant prefix routes
  for (const [prefix, cfg] of Object.entries(TENANT_PREFIX_ROUTES)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return cfg.tenants.includes(tenant);
    }
  }

  // Location prefixes — only valid on their tenant
  for (const [t, prefix] of Object.entries(LOCATION_PREFIXES)) {
    if (path.startsWith(prefix)) return tenant === t;
  }

  // Check sitemap for this tenant
  if (sitemapUrls && sitemapUrls.includes(path)) return true;

  // Dynamic routes (blog/:slug, news/:id, catalogue/:slug, etc.)
  const parts = path.replace(/^\//, '').split('/');
  if (parts.length >= 2 && DYNAMIC_PREFIXES.has(parts[0])) return true;

  // Check if first segment is a known location in the sitemap
  if (parts.length >= 1 && parts[0]) {
    if (sitemapUrls && sitemapUrls.includes(`/${parts[0]}`)) return true;
    if (parts.length >= 2 && sitemapUrls && sitemapUrls.includes(`/${parts[0]}/${parts[1]}`)) return true;
  }

  return false;
}

// Exact domain -> tenant map (matches src/lib/tenant.ts)
const DOMAIN_TO_TENANT = {
  'theberman.eu': 'ireland',
  'certificadoenergético.eu': 'spain',
  'www.certificadoenergético.eu': 'spain',
  'xn--certificadoenergtico-q2b.eu': 'spain',
  'www.xn--certificadoenergtico-q2b.eu': 'spain',
  'certificadosenergetico.com': 'spain',
  'www.certificadosenergetico.com': 'spain',
  'certificadosenergetico.eu': 'spain',
  'www.certificadosenergetico.eu': 'spain',
  'certificadosenergetico.es': 'spain',
  'www.certificadosenergetico.es': 'spain',
  'certificadosenergeticos.eu': 'spain',
  'www.certificadosenergeticos.eu': 'spain',
  'epccert.com': 'england',
  'www.epccert.com': 'england',
  'epccert.be': 'england',
  'www.epccert.be': 'england',
  'dpecert.fr': 'france',
  'www.dpecert.fr': 'france',
  'dpecert.com': 'france',
  'www.dpecert.com': 'france',
  'dpefrance.eu': 'france',
  'www.dpefrance.eu': 'france',
  'diagnostic-france.eu': 'france',
  'www.diagnostic-france.eu': 'france',
  'certificadoenergia.com': 'portugal',
  'www.certificadoenergia.com': 'portugal',
};

// ─── County display names (Ireland) ───────────────────────────────────────────
const COUNTY_NAMES = {
  carlow:'Carlow', cavan:'Cavan', clare:'Clare', cork:'Cork', donegal:'Donegal',
  dublin:'Dublin', galway:'Galway', kerry:'Kerry', kildare:'Kildare',
  kilkenny:'Kilkenny', laois:'Laois', leitrim:'Leitrim', limerick:'Limerick',
  longford:'Longford', louth:'Louth', mayo:'Mayo', meath:'Meath',
  monaghan:'Monaghan', offaly:'Offaly', roscommon:'Roscommon', sligo:'Sligo',
  tipperary:'Tipperary', waterford:'Waterford', westmeath:'Westmeath',
  wexford:'Wexford', wicklow:'Wicklow',
};

// ─── Tenant logo files (public/ is shared across all domains, so /logo.png is
// always the Berman logo — each tenant must reference its own file) ───────────
const TENANT_LOGOS = {
  ireland:  '/logo.png',
  spain:    '/og-spain.png',
  england:  '/og-england.png',
  france:   '/og-france.png',
  portugal: '/og-portugal.png',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getMeta(pathname, tenant) {
  const cleanPath = pathname.replace(/\/$/, ''); // strip trailing slash
  const activePath = cleanPath === '' ? '/' : cleanPath;

  const approved = PAGE_SEO[tenant]?.[activePath];
  if (approved) {
    return { ...approved, desc: approved.description };
  }

  const tenantSeo = PAGE_SEO[tenant] || PAGE_SEO.ireland;
  const homeSeo = tenantSeo['/'];

  if (tenant === 'spain') {
    // Check if it's a location page: /certificado-energetico-town
    const match = activePath.match(/^\/certificado-energetico-([a-z\-]+)$/);
    if (match) {
      const citySlug = match[1];
      let displayCity = toTitle(citySlug);
      if (citySlug === 'palma') displayCity = 'Palma de Mallorca';
      if (citySlug === 'las-palmas') displayCity = 'Las Palmas';
      if (citySlug === 'san-sebastian') displayCity = 'San Sebastián';
      
      return {
        title: `Certificado Energético ${displayCity} | Desde 60€ | Técnicos Acreditados`,
        desc: `Solicita tu certificado energético en ${displayCity}. Técnicos colegiados, visita presencial obligatoria incluida y entrega rápida en 24–48h. Compara presupuestos gratis.` 
      };
    }
    return { title: null, desc: homeSeo.description };
  }

  if (tenant === 'england') {
    // Check if it's an England location page: /epc-assessment-town
    const match = activePath.match(/^\/epc-assessment-([a-z\-]+)$/);
    if (match) {
      const citySlug = match[1];
      const displayCity = toTitle(citySlug);
      return {
        title: `EPC Certificate ${displayCity} | Domestic & Commercial EPC`,
        desc: `Need an EPC certificate in ${displayCity}? Compare quotes from local accredited assessors. Book your EPC assessment online with EPC Cert.` 
      };
    }
    return { title: null, desc: homeSeo.description };
  }

  // France
  if (tenant === 'france') {
    // Location page: /city or /city/town
    const parts = activePath.replace(/^\//, '').split('/');
    if (parts.length >= 1 && parts[0]) {
      const city = toTitle(parts[0]);
      return {
        title: `Diagnostiqueurs Certifiés à ${city} | DPE | DPE Cert France`,
        desc: `Trouvez des diagnostiqueurs certifiés à ${city}. Obtenez votre DPE avec des diagnostiqueurs certifiés locaux.`,
      };
    }
    return { title: homeSeo.title, desc: homeSeo.description };
  }

  // Portugal
  if (tenant === 'portugal') {
    // Location page: /city or /city/town
    const parts = activePath.replace(/^\//, '').split('/');
    if (parts.length >= 1 && parts[0]) {
      const city = toTitle(parts[0]);
      return {
        title: `Peritos Qualificados em ${city} | Certificado Energético`,
        desc: `Encontre peritos qualificados em ${city}. Obtenha o seu certificado energético com peritos qualificados locais.`,
      };
    }
    return { title: homeSeo.title, desc: homeSeo.description };
  }

  // Ireland
  const parts = activePath.replace(/^\//, '').split('/');
  const county = COUNTY_NAMES[parts[0]] || toTitle(parts[0]);

  if (parts.length === 1 && COUNTY_NAMES[parts[0]]) {
    return {
      title: `BER Certificate ${county} | Compare SEAI Assessors | The Berman`,
      desc:  `Get BER certificates in County ${county}, Ireland. Compare quotes from local SEAI-registered assessors and book online. Fast, affordable BER certificates with The Berman.`,
    };
  }

  if (parts.length === 2) {
    const town = toTitle(parts[1]);
    return {
      title: `BER Certificate ${town}, ${county} | Local SEAI Assessors | The Berman`,
      desc:  `Need a BER certificate in ${town}, ${county}? Compare quotes from SEAI-registered assessors near you. Book your BER assessment online with The Berman.`,
    };
  }

  return { title: null, desc: homeSeo.description };
}

// ─── Schema builders ─────────────────────────────────────────────────────────
function orgSchema(tenant) {
  if (tenant === 'spain') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#organization',
          name: 'Certificado Energético España',
          url: 'https://www.xn--certificadoenergtico-q2b.eu/',
          logo: 'https://www.xn--certificadoenergtico-q2b.eu/certificado-logo-trimmed.png',
          description: "La plataforma líder de España para conectar con técnicos acreditados en certificación energética. Desde 60€, visita incluida.",
          areaServed: { '@type': 'Country', name: 'España' },
          knowsAbout: ['Certificado de Eficiencia Energética','Calificación Energética','Etiqueta Energética','Eficiencia Energética'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Servicios de Certificación Energética',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificado Energético Vivienda', description: 'Certificación energética obligatoria para vender o alquilar pisos y casas.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificado Energético Local', description: 'Certificación energética obligatoria para vender o alquilar locales comerciales.' } },
            ]
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8', reviewCount: '1500', bestRating: '5', worstRating: '1',
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#website',
          url: 'https://www.xn--certificadoenergtico-q2b.eu/',
          name: 'Certificado Energético',
          description: "Plataforma líder en certificados de eficiencia energética en España.",
          publisher: { '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#organization' },
          inLanguage: 'es-ES',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.xn--certificadoenergtico-q2b.eu/directorio?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
  }

  if (tenant === 'england') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.epccert.com/#organization',
          name: 'EPC Cert',
          url: 'https://www.epccert.com/',
          logo: 'https://www.epccert.com/epc-logo-trimmed.png',
          description: "England's leading EPC certificate platform. Compare quotes from accredited Energy Performance Certificate assessors nationwide.",
          address: { '@type': 'PostalAddress', streetAddress: 'Kings Court, 33 King Street', addressLocality: 'Blackburn', postalCode: 'BB2 2DH', addressCountry: 'GB' },
          telephone: '+44 1217260031',
          email: 'hello@epccert.com',
          areaServed: { '@type': 'Country', name: 'England' },
          knowsAbout: ['EPC Certificate','Energy Performance Certificate','MEES','Domestic Energy Assessor','Commercial EPC'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'EPC Assessment Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Domestic EPC Certificate', description: 'Accredited EPC assessment for residential properties in England' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial EPC Certificate', description: 'Non-domestic EPC assessment for commercial properties in England' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Landlord EPC Certificate', description: 'EPC for rental properties to meet MEES Band E / Band C requirements' } },
            ]
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9', reviewCount: '1000', bestRating: '5', worstRating: '1',
          },
          sameAs: ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert'],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.epccert.com/#website',
          url: 'https://www.epccert.com/',
          name: 'EPC Cert',
          description: "England's leading EPC website.",
          publisher: { '@id': 'https://www.epccert.com/#organization' },
          inLanguage: 'en-GB',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.epccert.com/catalogue?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
  }

  if (tenant === 'france') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.dpecert.fr/#organization',
          name: 'DPE Cert France',
          url: 'https://www.dpecert.fr/',
          logo: 'https://www.dpecert.fr/dpecert-logo.png',
          description: "La plateforme de confiance pour le diagnostic de performance énergétique en France. Comparez les devis de diagnostiqueurs certifiés.",
          areaServed: { '@type': 'Country', name: 'France' },
          knowsAbout: ['DPE','Diagnostic de Performance Énergétique','Diagnostic Immobilier','Efficacité Énergétique'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Services de Diagnostic de Performance Énergétique',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'DPE Logement', description: 'Diagnostic de performance énergétique obligatoire pour vendre ou louer un bien résidentiel en France.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'DPE Bâtiment Commercial', description: 'Diagnostic de performance énergétique pour les locaux commerciaux en France.' } },
            ]
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8', reviewCount: '800', bestRating: '5', worstRating: '1',
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.dpecert.fr/#website',
          url: 'https://www.dpecert.fr/',
          name: 'DPE Cert France',
          description: "La plateforme de confiance pour le diagnostic de performance énergétique en France.",
          publisher: { '@id': 'https://www.dpecert.fr/#organization' },
          inLanguage: 'fr-FR',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.dpecert.fr/catalogue?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
  }

  if (tenant === 'portugal') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.certificadoenergia.com/#organization',
          name: 'Certificado Energia',
          url: 'https://www.certificadoenergia.com/',
          logo: 'https://www.certificadoenergia.com/certificado-energia-logo.png',
          description: "A plataforma líder de certificação energética em Portugal. Obtenha o seu certificado energético com peritos qualificados.",
          areaServed: { '@type': 'Country', name: 'Portugal' },
          knowsAbout: ['Certificado Energético','Eficiência Energética','Sistema de Certificação Energética','Edifícios'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Serviços de Certificação Energética',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificado Energético Residencial', description: 'Certificado energético obrigatório para vender ou arrendar propriedades residenciais em Portugal.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificado Energético Comercial', description: 'Certificado energético para espaços comerciais em Portugal.' } },
            ]
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8', reviewCount: '600', bestRating: '5', worstRating: '1',
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.certificadoenergia.com/#website',
          url: 'https://www.certificadoenergia.com/',
          name: 'Certificado Energia',
          description: "A plataforma líder de certificação energética em Portugal.",
          publisher: { '@id': 'https://www.certificadoenergia.com/#organization' },
          inLanguage: 'pt-PT',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.certificadoenergia.com/catalogue?q={search_term_string}' },
            'query-input': 'required name=search_string',
          },
        },
      ],
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.theberman.eu/#organization',
        name: 'The Berman',
        url: 'https://www.theberman.eu',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://www.theberman.eu/#logo',
          url: 'https://www.theberman.eu/logo.png',
          contentUrl: 'https://www.theberman.eu/logo.png',
          caption: 'The Berman',
        },
        description: "Ireland's largest BER certificate platform. Compare quotes from 100+ SEAI-registered assessors nationwide.",
        areaServed: { '@type': 'Country', name: 'Ireland', sameAs: 'https://www.wikidata.org/wiki/Q27' },
        knowsAbout: ['Building Energy Rating','BER Certificate Ireland','SEAI','Energy Efficiency','Home Energy Assessment'],
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'English', areaServed: 'IE' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Building Energy Rating Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Domestic BER Certificate', description: 'Mandatory Building Energy Rating for selling or renting a residential property in Ireland.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial BER Certificate', description: 'Mandatory Building Energy Rating for selling or renting a commercial property in Ireland.' } },
          ]
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1000',
          bestRating: '5',
          worstRating: '1',
        },
        sameAs: [
          'https://www.facebook.com/people/The-Berman/61578159843471/',
          'https://www.instagram.com/thebermanireland',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.theberman.eu/#website',
        url: 'https://www.theberman.eu/',
        name: 'The Berman',
        description: "Ireland's largest BER website.",
        publisher: { '@id': 'https://www.theberman.eu/#organization' },
        inLanguage: 'en-IE',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://www.theberman.eu/catalogue?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });
}

function faqSchema(tenant) {
  if (tenant === 'spain') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': "¿Qué Es un Certificado de Eficiencia Energética?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Un <strong>Certificado de Eficiencia Energética</strong> mide el consumo de energía de un inmueble y le asigna una calificación de la A (más eficiente) a la G (menos eficiente).</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuándo Es Obligatorio el Certificado Energético en España?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Es obligatorio al vender o alquilar cualquier vivienda o local en España. Debe figurar en el anuncio inmobiliario y es imprescindible para firmar ante notario. Desde agosto de 2025, también es necesario para tasaciones hipotecarias.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuánto Cuesta el Certificado Energético en España?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>El precio no está regulado y varía entre 60 € y 300 € según el tamaño, tipo de inmueble y ubicación. Comparar presupuestos te ayuda a encontrar la mejor opción.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuánto Tarda en Obtenerse el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>La mayoría de los certificados están disponibles en 24 a 72 horas desde la visita del técnico.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuánto Tiempo es Válido el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>La validez máxima es de 10 años. Excepción: los certificados con calificación G tienen una validez de solo 5 años.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Quién Puede Emitir el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Debe ser emitido por un técnico competente habilitado (arquitecto, ingeniero o técnico cualificado oficialmente reconocido).</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Qué Pasa si Vendo mi Casa sin Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sin el certificado no podrás formalizar la venta ante notario. Además, te expones a sanciones de 300 € hasta 6.000 €.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuáles son las Multas por No Tener el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Las sanciones por infracción leve van desde 300 € hasta 600 €. Las infracciones graves pueden llegar a 6.000 €.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Qué Significan las Letras del Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>La escala va de la A (máxima eficiencia) a la G (mínima eficiencia). La Directiva EPBD exige clase mínima E en 2030 para inmuebles en alquiler.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Es Necesario el Certificado Energético para Pedir una Hipoteca?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Desde agosto de 2025, la Orden ECM/599/2025 exige un certificado energético válido para realizar tasaciones hipotecarias en España.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cómo Puedo Mejorar la Calificación Energética de mi Vivienda?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Mejoras como el aislamiento de la cubierta, ventanas eficientes, sustitución de caldera o instalación de paneles solares pueden mejorar significativamente la calificación.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Incluye el Precio el Registro en la Comunidad Autónoma?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>No siempre. Algunas comunidades cobran tasas adicionales (Cataluña, Valencia, Andalucía). En Madrid el registro es gratuito. Pide siempre un presupuesto cerrado todo incluido.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Es Obligatorio el Certificado Energético para Alquilar?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Todo propietario que quiera poner un inmueble en alquiler debe disponer de un CEE vigente antes de publicar el anuncio.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Necesita el Técnico Visitar mi Vivienda?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Es obligatorio realizar una visita presencial al inmueble. Desconfía de ofertas que no incluyan visita; son ilegales.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Mejora la Calificación Energética el Valor de mi Inmueble?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Estudios muestran que una calificación alta puede aumentar el valor de venta o alquiler entre un 5% y un 25%.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuál es la Diferencia entre el Certificado Energético y la Cédula de Habitabilidad?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Son documentos distintos. La cédula acredita habitabilidad mínima. El certificado energético mide eficiencia energética. Ambos pueden ser necesarios simultáneamente.</p>"
          }
        }
      ]
    });
  }

  if (tenant === 'england') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is an EPC Certificate?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An EPC Certificate measures a property\'s energy efficiency and provides a rating from A to G. It also includes recommendations that may help improve energy performance.'
          }
        },
        {
          '@type': 'Question',
          'name': 'When Do I Need an EPC Certificate in England?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An EPC is required when selling, renting or building a property in England. Landlords must have a valid EPC before marketing a rental property. An EPC is also needed to access government energy improvement grants.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How Much Does an EPC Certificate Cost in England?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Domestic EPC assessments in England typically cost between £45 and £150, depending on property size, type and location. Commercial EPCs cost more — typically £150 to £1,500+. Compare quotes from multiple accredited assessors using EPC Cert to find the best price near you.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How Quickly Can I Get an EPC Certificate?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Many EPC assessments can be arranged within 1–3 days. Once the assessment is completed, the certificate is issued and lodged on the official government EPC register on the same day in most cases.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How Long Is an EPC Certificate Valid?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An EPC Certificate is generally valid for 10 years. If the certificate has expired, a new assessment will usually be required.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Who Can Carry Out an EPC Assessment?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'EPC assessments must be completed by a qualified and accredited energy assessor who is authorised to issue Energy Performance Certificates.'
          }
        }
      ]
    });
  }

  if (tenant === 'france') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        { '@type':'Question', name:"Qu'est-ce qu'un DPE ?", acceptedAnswer:{ '@type':'Answer', text:"Le Diagnostic de Performance Énergétique (DPE) évalue la consommation énergétique d'un bâtiment et lui attribue une étiquette de A (très économe) à G (très énergivore). Il est obligatoire en France pour la vente ou la location d'un bien immobilier." } },
        { '@type':'Question', name:'Quand le DPE est-il obligatoire en France ?', acceptedAnswer:{ '@type':'Answer', text:"Le DPE est obligatoire lors de la vente ou de la location d'un bien immobilier. Il doit être inclus dans le dossier de diagnostic technique (DDT) et remis à l'acquéreur ou au locataire." } },
        { '@type':'Question', name:'Combien coûte un DPE en France ?', acceptedAnswer:{ '@type':'Answer', text:"Le prix d'un DPE en France varie généralement entre 60€ et 250€ selon le type et la taille du bien. Comparez les devis de diagnostiqueurs certifiés sur DPE Cert France pour obtenir le meilleur prix." } },
        { '@type':'Question', name:'Quelle est la validité du DPE ?', acceptedAnswer:{ '@type':'Answer', text:"Le DPE est valable 10 ans. Toutefois, en cas de travaux modifiant significativement les performances énergétiques du bien, il est recommandé de le faire renouveler." } },
        { '@type':'Question', name:'Qui peut réaliser un DPE ?', acceptedAnswer:{ '@type':'Answer', text:"Le DPE doit être réalisé par un diagnostiqueur certifié par un organisme accrédité par le COFRAC. Tous les diagnostiqueurs de DPE Cert France sont certifiés et qualifiés." } },
        { '@type':'Question', name:'Quelle est la nouvelle méthode du DPE 2023 ?', acceptedAnswer:{ '@type':'Answer', text:"Depuis juillet 2021, la méthode de calcul du DPE a été réformée. Le nouveau DPE est calculé à partir des caractéristiques du bâtiment (isolation, chauffage, ventilation) et non plus à partir des factures énergétiques pour les logements." } },
      ]
    });
  }

  if (tenant === 'portugal') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        { '@type':'Question', name:'O que é o Certificado Energético?', acceptedAnswer:{ '@type':'Answer', text:"O Certificado Energético avalia a eficiência energética de um edifício e atribui uma classificação de A+ (mais eficiente) a G (menos eficiente). É obrigatório em Portugal para vender ou arrendar imóveis." } },
        { '@type':'Question', name:'Quando é obrigatório o Certificado Energético em Portugal?', acceptedAnswer:{ '@type':'Answer', text:"O certificado energético é obrigatório para vender ou arrendar qualquer imóvel em Portugal. Deve estar disponível antes da publicação do anúncio e ser entregue ao comprador ou inquilino." } },
        { '@type':'Question', name:'Quanto custa o Certificado Energético em Portugal?', acceptedAnswer:{ '@type':'Answer', text:"O preço do certificado energético em Portugal varia entre 60€ e 200€ conforme o tipo e dimensão do imóvel. Compare orçamentos de peritos qualificados no Certificado Energia para obter o melhor preço." } },
        { '@type':'Question', name:'Qual a validade do Certificado Energético?', acceptedAnswer:{ '@type':'Answer', text:"O certificado energético é válido por 10 anos a partir da data de emissão. Caso sejam realizadas obras que alterem significativamente o desempenho energético do edifício, recomenda-se a renovação." } },
        { '@type':'Question', name:'Quem pode emitir o Certificado Energético?', acceptedAnswer:{ '@type':'Answer', text:"O certificado energético deve ser emitido por um técnico qualificado certificado pela ADENE (Agência para a Energia). Todos os peritos do Certificado Energia são qualificados e certificados." } },
        { '@type':'Question', name:'Como posso melhorar a classificação energética do meu imóvel?', acceptedAnswer:{ '@type':'Answer', text:"Melhorias como isolamento térmico, janelas eficientes, substituição do sistema de aquecimento por bombas de calor ou instalação de painéis solares podem melhorar significativamente a classificação energética." } },
      ]
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://theberman.eu/faq#faqpage',
    mainEntity: [
      { '@type':'Question', name:'What is a BER certificate?', acceptedAnswer:{ '@type':'Answer', text:'A Building Energy Rating (BER) certificate rates the energy performance of a home on a scale from A0 (most efficient) to G (least efficient). It is issued by a SEAI-registered assessor and is legally required when selling or renting a property in Ireland.' } },
      { '@type':'Question', name:'How long is a BER certificate valid in Ireland?', acceptedAnswer:{ '@type':'Answer', text:'A BER certificate is valid for 10 years from the date of issue, provided no significant energy-related changes are made to the property.' } },
      { '@type':'Question', name:'How much does a BER certificate cost in Ireland?', acceptedAnswer:{ '@type':'Answer', text:'A BER certificate in Ireland typically costs between €150 and €300, depending on property size and assessor. Use The Berman to compare quotes from multiple SEAI-registered assessors.' } },
      { '@type':'Question', name:'Do I need a BER certificate to sell my house in Ireland?', acceptedAnswer:{ '@type':'Answer', text:'Yes. A BER certificate is a legal requirement when selling or renting a residential property in Ireland. The BER rating must be displayed in all property advertisements.' } },
      { '@type':'Question', name:'How do I find a SEAI-registered BER assessor near me?', acceptedAnswer:{ '@type':'Answer', text:'Use The Berman to instantly compare quotes from over 100 SEAI-registered BER assessors across all counties in Ireland. Enter your property details to receive quotes and book online.' } },
      { '@type':'Question', name:'How long does a BER assessment take?', acceptedAnswer:{ '@type':'Answer', text:'A BER assessment typically takes 30 minutes to 2 hours depending on property size. The assessor inspects insulation, windows, heating, ventilation and any renewable energy sources.' } },
      { '@type':'Question', name:'Can I get a BER certificate for a rental property?', acceptedAnswer:{ '@type':'Answer', text:'Yes. All residential rental properties in Ireland must have a valid BER certificate. Landlords must display the BER rating in all rental advertisements.' } },
      { '@type':'Question', name:'What BER rating scale does Ireland use?', acceptedAnswer:{ '@type':'Answer', text:'As of May 2026, Ireland uses an A0 to G scale aligned with EU standards. A0 represents the most energy-efficient near-zero emission buildings, G the least efficient.' } },
      { '@type':'Question', name:'How can I improve my BER rating?', acceptedAnswer:{ '@type':'Answer', text:'Common improvements include attic or wall insulation, upgrading to an A-rated boiler or heat pump, installing double or triple-glazed windows, fitting solar panels, and improving draught-proofing. SEAI grants may be available.' } },
      { '@type':'Question', name:'What documents do I need for a BER assessment?', acceptedAnswer:{ '@type':'Answer', text:'Useful items include: property floor area, insulation details (walls, roof, floor), window and door types, heating system details (boiler age, fuel type), hot water system info, and any renewable energy systems.' } },
    ],
  });
}

function locationSchema(pathname, tenant) {
  if (tenant === 'spain') {
    const cleanPath = pathname.replace(/\/$/, '');
    const match = cleanPath.match(/^\/certificado-energetico-([a-z\-]+)$/);
    const citySlug = match ? match[1] : 'madrid';
    let displayCity = toTitle(citySlug);
    if (citySlug === 'palma') displayCity = 'Palma de Mallorca';
    if (citySlug === 'las-palmas') displayCity = 'Las Palmas';
    if (citySlug === 'san-sebastian') displayCity = 'San Sebastián';

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Certificado Energético en ${displayCity}`,
      url: `https://www.xn--certificadoenergtico-q2b.eu${pathname}`,
      description: `Solicita tu certificado energético en ${displayCity}. Técnicos colegiados, visita presencial obligatoria incluida y entrega rápida en 24–48h.`,
      provider: { '@type': 'Organization', 'name': 'Certificado Energético España' },
      areaServed: {
        '@type': 'City',
        name: displayCity,
        containedInPlace: { '@type': 'Country', name: 'España' }
      },
      serviceType: 'Certificado de Eficiencia Energética',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '60', highPrice: '300' }
    });
  }

  if (tenant === 'england') {
    const cleanPath = pathname.replace(/\/$/, '');
    const match = cleanPath.match(/^\/epc-assessment-([a-z\-]+)$/);
    const citySlug = match ? match[1] : 'london';
    const displayCity = toTitle(citySlug);

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `EPC Certificate in ${displayCity}`,
      url: `https://www.epccert.com${pathname}`,
      description: `Need an EPC certificate in ${displayCity}? Compare quotes from local accredited assessors. Book online today with EPC Cert.`,
      provider: { '@type': 'Organization', 'name': 'EPC Cert' },
      areaServed: {
        '@type': 'City',
        name: displayCity,
        containedInPlace: { '@type': 'Country', name: 'England' }
      },
      serviceType: 'Energy Performance Certificate',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'GBP', lowPrice: '45', highPrice: '150' }
    });
  }

  if (tenant === 'france') {
    const parts = pathname.replace(/^\//, '').split('/');
    const county = toTitle(parts[0]);
    const town   = parts[1] ? toTitle(parts[1]) : null;
    const location = town ? `${town}, ${county}` : county;
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `DPE à ${location}`,
      url: `https://www.dpecert.fr${pathname}`,
      description: `Obtenez votre DPE à ${location}. Comparez les devis de diagnostiqueurs certifiés locaux.`,
      provider: { '@type': 'Organization', 'name': 'DPE Cert France' },
      areaServed: {
        '@type': town ? 'City' : 'AdministrativeArea',
        name: location,
        containedInPlace: { '@type': 'Country', name: 'France' },
      },
      serviceType: 'Diagnostic de Performance Énergétique',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '60', highPrice: '250' },
    });
  }

  if (tenant === 'portugal') {
    const parts = pathname.replace(/^\//, '').split('/');
    const county = toTitle(parts[0]);
    const town   = parts[1] ? toTitle(parts[1]) : null;
    const location = town ? `${town}, ${county}` : county;
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Certificado Energético em ${location}`,
      url: `https://www.certificadoenergia.com${pathname}`,
      description: `Obtenha o seu certificado energético em ${location}. Compare orçamentos de peritos qualificados locais.`,
      provider: { '@type': 'Organization', 'name': 'Certificado Energia' },
      areaServed: {
        '@type': town ? 'City' : 'AdministrativeArea',
        name: location,
        containedInPlace: { '@type': 'Country', name: 'Portugal' },
      },
      serviceType: 'Certificado Energético',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '60', highPrice: '200' },
    });
  }

  const parts = pathname.replace(/^\//, '').split('/');
  const county = COUNTY_NAMES[parts[0]] || toTitle(parts[0]);
  const town   = parts[1] ? toTitle(parts[1]) : null;
  const location = town ? `${town}, County ${county}` : `County ${county}`;
  const url = `https://www.theberman.eu${pathname}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `BER Certificate in ${location}`,
    url,
    description: `Get BER certificates in ${location}, Ireland. Compare quotes from SEAI-registered assessors. Book online today with The Berman.`,
    provider: { '@id': 'https://www.theberman.eu/#organization' },
    areaServed: {
      '@type': town ? 'City' : 'AdministrativeArea',
      name: location,
      containedInPlace: { '@type': 'Country', name: 'Ireland' },
    },
    serviceType: 'Building Energy Rating Certificate',
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '150', highPrice: '300' },
  });
}

function breadcrumbSchema(pathname, tenant) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return null;

  let siteUrl = 'https://www.theberman.eu';
  if (tenant === 'spain') siteUrl = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') siteUrl = 'https://www.epccert.com';
  else if (tenant === 'france') siteUrl = 'https://www.dpecert.fr';
  else if (tenant === 'portugal') siteUrl = 'https://www.certificadoenergia.com';

  const homeName = tenant === 'spain' ? 'Inicio' : tenant === 'france' ? 'Accueil' : tenant === 'portugal' ? 'Início' : 'Home';

  const items = [{ '@type':'ListItem', position:1, name: homeName, item: siteUrl + '/' }];
  let current = siteUrl;
  parts.forEach((p, i) => {
    current += '/' + p;
    let name = COUNTY_NAMES[p] || toTitle(p);
    if (tenant === 'spain') {
      if (p === 'sobre-nosotros') name = 'Sobre Nosotros';
      else if (p === 'contacto') name = 'Contacto';
      else if (p === 'directorio') name = 'Directorio';
      else if (p === 'preguntas-frecuentes') name = 'Preguntas Frecuentes';
      else if (p === 'asesor-energetico') name = 'Asesor Energético';
      else if (p === 'ubicaciones') name = 'Ubicaciones';
    } else if (tenant === 'england') {
      if (p === 'about-us') name = 'About Us';
      else if (p === 'epc-faq') name = 'FAQ';
    } else if (tenant === 'france') {
      if (p === 'about-us') name = 'À Propos';
      else if (p === 'ber-faqs') name = 'Questions Fréquentes';
      else if (p === 'contact-us') name = 'Contact';
      else if (p === 'catalogue') name = 'Catalogue';
      else if (p === 'hire-agent') name = 'Conseiller Énergétique';
      else if (p === 'locations') name = 'Localisations';
    } else if (tenant === 'portugal') {
      if (p === 'about-us') name = 'Sobre Nós';
      else if (p === 'faq') name = 'Perguntas Frequentes';
      else if (p === 'contact-us') name = 'Contacto';
      else if (p === 'catalogue') name = 'Catálogo';
      else if (p === 'hire-agent') name = 'Conselheiro Energético';
      else if (p === 'locations') name = 'Localizações';
    }
    items.push({ '@type':'ListItem', position: i + 2, name, item: current });
  });
  return JSON.stringify({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement: items });
}

// ─── Hreflang builder ────────────────────────────────────────────────────────
function hreflangTags(pathname, tenant) {
  const cleanPath = pathname === '/' ? '/' : pathname;
  const current = {
    ireland: { lang: 'en-IE', base: 'https://www.theberman.eu' },
    england: { lang: 'en-GB', base: 'https://www.epccert.com' },
    france: { lang: 'fr-FR', base: 'https://www.dpecert.fr' },
    spain: { lang: 'es-ES', base: 'https://www.xn--certificadoenergtico-q2b.eu' },
    portugal: { lang: 'pt-PT', base: 'https://www.certificadoenergia.com' },
  }[tenant] || { lang: 'en-IE', base: 'https://www.theberman.eu' };

  // These tenants are independent regional businesses, not translated copies
  // of one page. Never reference another tenant from the current site's source.
  return `<link rel="alternate" hreflang="${current.lang}" href="${current.base}${cleanPath}" />
  <link rel="alternate" hreflang="x-default" href="${current.base}${cleanPath}" />`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function middleware(req) {
  const url  = new URL(req.url);
  const path = url.pathname;

  // The Host header is the browser-facing domain on Vercel. x-forwarded-host
  // is used as a fallback. If a proxy supplies a comma-separated list, prefer
  // the first host that maps to a tenant other than the Ireland base domain,
  // then any known tenant, so dpecert.fr/spain/etc. don't inherit the Berman
  // default just because theberman.eu appears first in a forwarded list.
  const forwardedHost = req.headers.get('x-forwarded-host');
  const reqHost = req.headers.get('host') || url.hostname;
  const candidates = [reqHost, url.hostname, forwardedHost]
    .filter(Boolean)
    .flatMap(h => h.split(',').map(v => v.trim()));

  const mapped = candidates
    .map(h => ({ raw: h.replace(/:\d+$/, ''), clean: h.replace(/:\d+$/, '').replace(/^www\./, '').toLowerCase() }))
    .find(({ clean }) => DOMAIN_TO_TENANT[clean] && clean !== 'theberman.eu') ||
    candidates
    .map(h => ({ raw: h.replace(/:\d+$/, ''), clean: h.replace(/:\d+$/, '').replace(/^www\./, '').toLowerCase() }))
    .find(({ clean }) => DOMAIN_TO_TENANT[clean]);

  const cleanHost = mapped ? mapped.clean : (candidates[0] ? candidates[0].replace(/:\d+$/, '').replace(/^www\./, '').toLowerCase() : 'theberman.eu');
  const tenant = DOMAIN_TO_TENANT[cleanHost] || 'ireland';
  const hostname = mapped ? mapped.raw : (candidates[0] ? candidates[0].replace(/:\d+$/, '') : 'theberman.eu');



  // France: site under construction — block all access
  if (tenant === 'france') {
    if (path === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    const underConstructionHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>DPE Cert — Bientôt en ligne</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0c121d;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:2rem}
.wrap{max-width:600px}
.logo{font-size:2.5rem;font-weight:900;margin-bottom:1.5rem;letter-spacing:-1px}
.logo span{color:#9ACD32}
h1{font-size:1.8rem;font-weight:800;margin-bottom:1rem}
p{font-size:1.1rem;color:#94a3b8;line-height:1.6;margin-bottom:0.5rem}
.icon{font-size:4rem;margin-bottom:1.5rem}
</style>
</head>
<body>
<div class="wrap">
<div class="icon">🚧</div>
<div class="logo">DPE<span>Cert</span></div>
<h1>Site en construction</h1>
<p>Nous travaillons sur quelque chose de great.</p>
<p>Revenez bientôt !</p>
</div>
</body>
</html>`;
    return new Response(underConstructionHtml, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Retry-After': '86400',
      }
    });
  }

  // Handle redirects
  if (tenant === 'spain') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/sobre-nosotros`, 301);
    if (path === '/catalogue') return Response.redirect(`${url.protocol}//${hostname}/directorio`, 301);
    if (path === '/hire-agent') return Response.redirect(`${url.protocol}//${hostname}/asesor-energetico`, 301);
    if (path === '/contact-us') return Response.redirect(`${url.protocol}//${hostname}/contacto`, 301);
  } else if (tenant === 'ireland') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/about-us`, 301);
  } else if (tenant === 'england') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/about-us`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/epc-faq`, 301);
  } else if (tenant === 'portugal') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/sobre-nos`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/faqs`, 301);
    if (path === '/news') return Response.redirect(`${url.protocol}//${hostname}/noticias`, 301);
    if (path === '/locations') return Response.redirect(`${url.protocol}//${hostname}/localizacoes`, 301);
    if (path === '/energy-advisor') return Response.redirect(`${url.protocol}//${hostname}/consultor-energetico`, 301);
  }

  // Tenant route isolation: redirect wrong-tenant routes to the correct equivalent
  const tenantRedirect = getTenantRedirect(path, tenant);
  if (tenantRedirect) {
    return Response.redirect(`${url.protocol}//${hostname}${tenantRedirect}`, 301);
  }

  // Dynamic robots.txt per tenant
  if (path === '/robots.txt') {
    const requestHost = req.headers.get('host') || url.host;
    const robots = `User-agent: *\nAllow: /\n\nSitemap: ${url.protocol}//${requestHost}/sitemap.xml\n`;
    return new Response(robots, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
    });
  }

  // Dynamic Sitemap Interception
  if (path === '/sitemap.xml') {
    const sitemapData = SITEMAP_BY_TENANT[tenant] || SITEMAP_BY_TENANT.ireland;
    const urls = sitemapData || [];
    const requestHost = req.headers.get('host') || url.host;
    const sitemapBase = `${url.protocol}//${requestHost}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const today = new Date().toISOString().split('T')[0];

    // Add homepage if not in array
    if (!urls.includes('/')) {
        xml += `  <url>\n    <loc>${encodeURI(`${sitemapBase}/`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    }

    for (const u of urls) {
      const isHome = u === '/';
      const loc = encodeURI(isHome ? `${sitemapBase}/` : `${sitemapBase}${u}`);
      xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${isHome ? 'daily' : 'weekly'}</changefreq>\n    <priority>${isHome ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }
    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
    });
  }

  // Fetch original response (proxy pattern — works on Vercel; falls back gracefully on local dev)
  let res, html;
  try {
    res  = await fetch(req);
  } catch (_fetchErr) {
    // Local dev: no upstream to proxy → pass through without injecting tags
    return new Response('Middleware upstream unavailable', { status: 502 });
  }

  // Never process non-HTML responses (images, fonts, JS, JSON, sitemaps, etc.)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return res;
  }

  html = await res.text();

  // Replace the hardcoded html lang attribute per tenant
  const htmlLang = tenant === 'spain' ? 'es' : tenant === 'france' ? 'fr' : tenant === 'portugal' ? 'pt' : 'en';
  html = html.replace(/<html([^>]*)lang="en"/, '<html$1lang="' + htmlLang + '"');

  // If the response is not a usable HTML document, pass it through unchanged
  if (!html || !html.includes('</head>')) {
    return new Response(html, { status: res.status, headers: Object.fromEntries(res.headers) });
  }

  const pageMeta = getMeta(path, tenant);
  const { title: rawTitle, desc } = pageMeta;

  // Check if this path is valid for the current tenant
  const sitemapUrls = SITEMAP_BY_TENANT[tenant] || [];
  const pathValid = isValidPath(path, tenant, sitemapUrls);

  const existingTitleMatch = html.match(/<title>([^<]*)<\/title>/);
  const existingTitle = existingTitleMatch ? existingTitleMatch[1] : '';
  const title = rawTitle || existingTitle;
  
  let canonicalBase = 'https://www.theberman.eu';
  if (tenant === 'spain') canonicalBase = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') canonicalBase = 'https://www.epccert.com';
  else if (tenant === 'france') canonicalBase = 'https://www.dpecert.fr';
  else if (tenant === 'portugal') canonicalBase = 'https://www.certificadoenergia.com';
  
  const canonicalPath = pageMeta.canonical || (path === '/' ? '/' : path);
  const canonical = `${canonicalBase}${canonicalPath}`;
  
  const ogImage = `${canonicalBase}${TENANT_LOGOS[tenant] || TENANT_LOGOS.ireland}`;

  // Build all schemas
  const schemas = [];
  schemas.push(`<script type="application/ld+json">${orgSchema(tenant)}</script>`);

  // FAQ schema — fires on FAQ page URLs for all tenants
  if (path === '/faq' || path === '/preguntas-frecuentes' || path === '/epc-faq' || path === '/ber-faqs' || path === '/ber-faqs/')
    schemas.push(`<script type="application/ld+json">${faqSchema(tenant)}</script>`);

  const countyKeys = Object.keys(COUNTY_NAMES);
  const parts = path.replace(/^\//, '').split('/');
  
  const isLocationIE = tenant === 'ireland' && parts.length >= 1 && countyKeys.includes(parts[0]);
  const isLocationES = tenant === 'spain' && path.startsWith('/certificado-energetico-');
  const isLocationEN = tenant === 'england' && path.startsWith('/epc-assessment-');
  const isLocationFR = tenant === 'france' && parts.length >= 1 && !SHARED_ROUTES.has(path) && !DYNAMIC_PREFIXES.has(parts[0]) && sitemapUrls.includes(path);
  const isLocationPT = tenant === 'portugal' && parts.length >= 1 && !SHARED_ROUTES.has(path) && !DYNAMIC_PREFIXES.has(parts[0]) && sitemapUrls.includes(path);
  
  if (isLocationIE || isLocationES || isLocationEN || isLocationFR || isLocationPT)
    schemas.push(`<script type="application/ld+json">${locationSchema(path, tenant)}</script>`);

  // BlogPosting schema for blog posts
  const isBlogPost = parts[0] === 'blog' && parts.length === 2;
  if (isBlogPost) {
    const { title: postTitle, desc: postDesc } = getMeta(path, tenant);
    const blogSlug = parts[1];
    const blogPosting = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: postTitle,
      description: postDesc,
      url: `${canonicalBase}${path}`,
      datePublished: '2026-07-01',
      dateModified: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : tenant === 'france' ? 'DPE Cert France' : tenant === 'portugal' ? 'Certificado Energia' : tenant === 'spain' ? 'Certificado Energético' : 'The Berman', url: canonicalBase },
      publisher: {
        '@type': 'Organization',
        name: tenant === 'england' ? 'EPC Cert' : tenant === 'france' ? 'DPE Cert France' : tenant === 'portugal' ? 'Certificado Energia' : tenant === 'spain' ? 'Certificado Energético' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}${TENANT_LOGOS[tenant] || TENANT_LOGOS.ireland}` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${path}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : tenant === 'france' ? 'fr-FR' : tenant === 'portugal' ? 'pt-PT' : 'en-IE',
    };
    schemas.push(`<script type="application/ld+json">${JSON.stringify(blogPosting)}</script>`);
  }

  // Article schema for news posts
  const isNewsPost = parts[0] === 'news' && parts.length === 2;
  if (isNewsPost) {
    const { title: newsTitle, desc: newsDesc } = getMeta(path, tenant);
    const article = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: newsTitle,
      description: newsDesc,
      url: `${canonicalBase}${path}`,
      datePublished: '2026-07-01',
      dateModified: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : tenant === 'france' ? 'DPE Cert France' : tenant === 'portugal' ? 'Certificado Energia' : tenant === 'spain' ? 'Certificado Energético' : 'The Berman', url: canonicalBase },
      publisher: {
        '@type': 'Organization',
        name: tenant === 'england' ? 'EPC Cert' : tenant === 'france' ? 'DPE Cert France' : tenant === 'portugal' ? 'Certificado Energia' : tenant === 'spain' ? 'Certificado Energético' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}${TENANT_LOGOS[tenant] || TENANT_LOGOS.ireland}` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${path}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : tenant === 'france' ? 'fr-FR' : tenant === 'portugal' ? 'pt-PT' : 'en-IE',
    };
    schemas.push(`<script type="application/ld+json">${JSON.stringify(article)}</script>`);
  }

  const bc = breadcrumbSchema(path, tenant);
  if (bc) schemas.push(`<script type="application/ld+json">${bc}</script>`);

  const schemaBlock = schemas.join('\n  ');

  let locale = 'en_IE';
  let siteName = 'The Berman';
  if (tenant === 'spain') { locale = 'es_ES'; siteName = 'Certificado Energético'; }
  else if (tenant === 'england') { locale = 'en_GB'; siteName = 'EPC Cert'; }
  else if (tenant === 'france') { locale = 'fr_FR'; siteName = 'DPE Cert France'; }
  else if (tenant === 'portugal') { locale = 'pt_PT'; siteName = 'Certificado Energia'; }

  let gscCode = '';
  if (tenant === 'england') gscCode = 'uU6Ruam97ElN2rtvSBjwfgOUx93cCD93YRVyiBUePiw';
  else if (tenant === 'spain') gscCode = 'KoLJU_4hf55xdAgYYjqQ6ip3pK4huH5JPZj4Omhc30o';

  const gscMeta = gscCode ? `<meta name="google-site-verification" content="${gscCode}" />` : '';
  const FB_DOMAIN_VERIFICATION = {
    ireland: 'vzxrqz9dqomp4g8iphshju59so27v8',
    england: '3w7n74pjbj6sx5c8z2cxske6yuuv5r',
  };
  const fbToken = FB_DOMAIN_VERIFICATION[tenant];
  const fbMeta = fbToken ? `<meta name="facebook-domain-verification" content="${fbToken}" />` : '';

  // Meta Pixel is now managed via Google Tag Manager (GTM) per domain.
  // No server-side CAPI or pixel injection from middleware.
  const metaPixelSnippet = '';

  // GTM — inject for all tenants using each site\'s own container
  // IMPORTANT: Developer must remove GTM-57CD932S from the React app (it was the old hardcoded one)
  // This middleware now controls GTM for all three sites
  let gtmId = 'GTM-NK5NJ78J'; // Ireland (theberman.eu) — user\'s main container
  if (tenant === 'england') gtmId = 'GTM-NNLZTHX6';
  else if (tenant === 'spain') gtmId = 'GTM-TL8C5GNJ';

  // GTM — fires immediately on page load
  const gtmHead = gtmId ? `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':
new Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=
\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,\'script\',\'dataLayer\',\'${gtmId}\');</script>
<!-- End Google Tag Manager -->` : '';

  const gtmBody = gtmId ? `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->` : '';

  // ── Strip duplicate/unwanted scripts from the original HTML ─────────────────
  // 1. Remove GTM-57CD932S IIFE init (targets only the GTM init function, not other scripts)
  // 2. Remove GTM-57CD932S noscript iframe (targets specific iframe src, cannot match others)
  // 3. Remove cookie-consent-wrapped scripts (type="text/plain" + data-cookieconsent)
  const tenantSeoSlot = '<!-- tenant-seo-slot -->';
  let cleanHtml = html
    // Remove GTM-57CD932S by targeting the GTM IIFE signature — safe, cannot cross script blocks
    .replace(/\(function\(w,d,s,l,i\)\{[\s\S]*?\}\)\(window,document,\'script\',\'dataLayer\',\'GTM-57CD932S\'\);/g, '')
    // Remove GTM-57CD932S noscript — targets specific iframe src attribute, cannot match others
    .replace(/<noscript>\s*<iframe\s+src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-57CD932S"[^>]*><\/iframe>\s*<\/noscript>/gi, '')
    // Remove surrounding GTM-57CD932S HTML comments if present
    .replace(/<!--\s*Google Tag Manager \(noscript\)\s*-->\s*\n?\s*<!--\s*End Google Tag Manager \(noscript\)\s*-->/gi, '')
    // Remove any type="text/plain" cookie-consent scripts (pixel/GTM blocked by consent)
    // This uses anchored attributes so it cannot match normal scripts
    .replace(/<script\s[^>]*type="text\/plain"[^>]*data-cookieconsent[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\s[^>]*data-cookieconsent[^>]*type="text\/plain"[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove the cookie consent comment wrapper if present
    .replace(/<!--\s*Google Tag Manager \+ Meta Pixel[^-]*-->/gi, '')
    // Preserve the original title position as an insertion slot. Support both
    // the current marker and the older fallback comment still present in some
    // cached/deployed index files.
    .replace(/<!--\s*tenant-seo:start[\s\S]*?tenant-seo:end[^>]*-->/gi, tenantSeoSlot)
    .replace(/<!--\s*Fallback title[^>]*-->\s*<title(?:\s[^>]*)?>[\s\S]*?<\/title>/gi, tenantSeoSlot)
    // Strip every other pre-injected SEO element so exactly one tenant can own
    // the source HTML. This also removes tags captured by a previous prerender.
    .replace(/<title(?:\s[^>]*)?>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+[^>]*name=["']description["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:title["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:description["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:url["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:image["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:locale["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:site_name["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:type["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:card["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:title["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:description["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:image["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']author["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']google-site-verification["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']facebook-domain-verification["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*\/?>/gi, '')
    .replace(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);
  const safeOgTitle = escapeHtml(pageMeta.ogTitle || title);
  const safeOgDesc = escapeHtml(pageMeta.ogDescription || desc);
  const safeTwitterTitle = escapeHtml(pageMeta.twitterTitle || pageMeta.ogTitle || title);
  const safeTwitterDesc = escapeHtml(pageMeta.twitterDescription || pageMeta.ogDescription || desc);

  // If the path is not valid for this tenant, inject noindex to prevent
  // Google from indexing cross-tenant pages (e.g. Ireland location pages
  // showing up in epccert.com search results).
  if (!pathValid) {
    const noindexBlock = `  <!-- tenant-seo:start (${tenant}) noindex -->
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="${canonical}" />
  <!-- tenant-seo:end (${tenant}) -->`;
    let noindexHtml = cleanHtml;
    if (!noindexHtml.includes(tenantSeoSlot)) {
      noindexHtml = noindexHtml.replace('</head>', `${tenantSeoSlot}\n</head>`);
    }
    const finalNoindex = noindexHtml.replace(tenantSeoSlot, noindexBlock);
    return new Response(finalNoindex, {
      status: res.status,
      headers: {
        ...Object.fromEntries(res.headers),
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
        'vary': ['Host', 'X-Forwarded-Host', res.headers.get('vary')]
          .filter(Boolean)
          .join(', '),
      },
    });
  }

  const tenantSeoBlock = `  <!-- tenant-seo:start (${tenant}) -->
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="author" content="${siteName}" />
  <meta property="og:title" content="${safeOgTitle}" />
  <meta property="og:description" content="${safeOgDesc}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:locale" content="${locale}" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTwitterTitle}" />
  <meta name="twitter:description" content="${safeTwitterDesc}" />
  <meta name="twitter:image" content="${ogImage}" />
  ${gscMeta}
  ${fbMeta}
  ${hreflangTags(path, tenant)}
  ${schemaBlock}
  <!-- tenant-seo:end (${tenant}) -->`;

  // If an unusual upstream HTML file has no known title marker, retain a safe
  // fallback slot at the end of <head>. Normal builds replace the slot above.
  if (!cleanHtml.includes(tenantSeoSlot)) {
    cleanHtml = cleanHtml.replace('</head>', `${tenantSeoSlot}\n</head>`);
  }

  const injected = cleanHtml.replace(
    tenantSeoSlot,
    tenantSeoBlock
  ).replace(
    '</head>',
    `  ${gtmHead}\n  ${metaPixelSnippet}\n</head>`
  ).replace(
    /<body([^>]*)>/i,
    `<body$1>${gtmBody}` 
  );

  return new Response(injected, {
    status:  res.status,
    headers: {
      ...Object.fromEntries(res.headers),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
      'vary': ['Host', 'X-Forwarded-Host', res.headers.get('vary')]
        .filter(Boolean)
        .join(', '),
    },
  });
}
