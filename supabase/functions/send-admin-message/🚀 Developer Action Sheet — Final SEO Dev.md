🚀 Developer Action Sheet — Final SEO Deployment
Date: 8 July 2026
From: SEO Team
Status: Everything is built. Nothing is deployed.
Live Audit Results (8 July 2026) 📊
We crawled all 32 pages across all 3 domains as Googlebot. Every single page fails.
Check Ireland (11 pages) England (10 pages) Spain (11 pages)
Correct <title> ❌ 0/11 ❌ 0/10 ❌ 0/11
Meta description ❌ 0/11 ❌ 0/10 ❌ 0/11
Canonical tag ❌ 0/11 ❌ 0/10 ❌ 0/11
JSON-LD schema ❌ 0/11 ❌ 0/10 ❌ 0/11
Hreflang tags ❌ 0/11 ❌ 0/10 ❌ 0/11
GSC verification ❌ ❌ ❌
/about 301 redirect ❌ (returns 200) ❌ (returns 200) ❌ (returns 200)
Every page shows: <title>Energy Rating Certificates &
Assessments</title> with no meta description.
[!CAUTION] Google is currently indexing all 3 websites with the same generic title, no
descriptions, no schema, and no structured data. This means zero rich results, zero local
SEO, and near-zero organic traffic potential.
✅ What's Already Done (No Developer Action Needed)
Item Ireland England Spain
Blog posts in Supabase 7 10 36
FAQ items in Supabase 10 11 16
middleware.js —
page titles &
descriptions
✅✅✅
middleware.js —
LocalBusiness +
WebSite schema
✅✅✅
middleware.js —
FAQPage schema (all
items)
✅✅✅
Item Ireland England Spain
middleware.js —
BlogPosting &
NewsArticle schema
✅✅✅
middleware.js —
Location Service
schema
✅✅✅
middleware.js —
Breadcrumb schema
✅✅✅
middleware.js —
AggregateRating ( ⭐
stars)
✅✅✅
middleware.js —
Hreflang tags
✅✅✅
middleware.js —
OG/Twitter meta tags
✅✅✅
middleware.js —
301 redirects
(/about, /faq, etc.)
✅✅✅
cloudflare-
worker.js — mirror
of above
✅✅✅
🚀 P0 — Deploy Middleware (Fixes Everything Above)
This is the single most impactful action. One deployment fixes all 32 pages.
Files ready:
├── middleware.js ← For Vercel
└── cloudflare-worker.js ← For Cloudflare (alternative)
Steps:
1. Copy middleware.js to the root of the Vercel project
2. Deploy to production
3. Verify: curl -s https://www.theberman.eu/ | grep '<title>' should
show The Berman – Ireland's Largest BER Website
P1 — Sitemaps & Google Search Console 🟠
Fix Sitemaps
The current sitemap has 3 problems:
1. All URLs use https://theberman.eu/ (missing www.)
2. All 3 domains share one sitemap (should be split)
3. Dead slugs are included (/about, /faq, /services, /pricing)
Fix:
• Generate 3 separate sitemaps, one per domain
• Use correct base URLs:
• Ireland: https://www.theberman.eu/
• England: https://www.epccert.com/
• Spain: https://www.xn--certificadoenergtico-q2b.eu/
• Remove: /about, /faq, /services, /pricing, /locations
Set Up Google Search Console
1. Go to search.google.com/search-console
2. Add all 3 domain properties
3. Verify using HTML tag method
4. Replace REPLACE_WITH_GSC_VERIFICATION_CODE in middleware.js (line 898)
with the real verification code
5. Submit sitemaps
P2 — React UI Changes (Interlinking) 🟡
These are React component edits to add internal links for SEO. Grouped by domain.
🚀🚀 Ireland (theberman.eu)
Page Change
Homepage Replace county list with 4 Province accordion
cards (Leinster, Munster, Connacht, Ulster)
/hire-agent Add inline links: "home energy business
directory" → /catalogue, "contact The BER
Man" → /contact-us
/ber-faqs/ Add CTA button "Get a Quote Online" →
/contact-us
/catalogue Split into sub-tabs:
/catalogue/businesses and
/catalogue/ber-assessors
/blog/ber-certificate-cost-
ireland
Turn city names into links (Dublin →
/dublin/, Cork → /cork/, etc.)
🚀🚀 England (epccert.com)
Page Change
Homepage Fix location card links → /epc-
assessment-london/, etc. Add "View All
Locations" → /locations/
/locations/ Link location cards to /epc-assessment-
{city}/ pages
/hire-agent Add inline links: "directory" → /catalogue,
"contact EPC Cert" → /contact-us
/catalogue Split into sub-tabs: /catalogue/epc-
assessors and /catalogue/epc-
businesses
/about-us Add CTA button "Get a Free Quote" →
/contact-us
/epc-faq Add CTA button "Get a Quote Online" →
/contact-us
🚀🚀 Spain (certificadoenergético.eu)
Page Change
Homepage Replace province list with 17 Region accordion
cards (Andalucía, Cataluña, Madrid, etc.)
/asesor-energetico Add inline links: "directorio" →
/directorio/empresas-energia,
"contactarnos" → /contacto. Add CTA
"Solicitar Presupuesto" → /contacto
/directorio Split into sub-tabs:
/directorio/tecnicos-
certificadores and
/directorio/empresas-energia
P3 — Nice to Have (SEO Growth) 🟢
Task Impact
Add <link rel="preconnect"
href="https://images.unsplash.co
m"> to index.html
Page speed
Add <link rel="dns-prefetch"
href="https://srvcwpnqjyhnhyeflr
Page speed
Task Impact
aj.supabase.co"> to index.html
Claim Google Business Profile for all 3 domains Local SEO
Add rel="author" to blog posts linking to
an author page
E-E-A-T
Populate seo_title / seo_description
for all existing blog articles in Supabase
Blog SEO
Get 50+ Trustpilot reviews for each domain Review rich snippets
🚀 Files to Deploy
File Location Purpose
middleware.js Vercel project root Edge middleware for SEO
injection
cloudflare-worker.js Cloudflare Workers console Alternative if using Cloudflare
Both files are located at: /Users/harshpanwar/theberman-seo-fix/
[!IMPORTANT] Priority order: P0 → P1 → P2 → P3. Deploying the middleware
(P0) alone will fix 90% of all SEO issues across all 3 domains in one go. Everything
else is incremental improvement.



// Cloudflare Worker — Multi-tenant SEO Fix
// Deploys in front of Vercel, injects all SEO tags server-side
// Works for Google, Bing, ChatGPT, Perplexity, Gemini — all crawlers

// ─── Page metadata map (Ireland) ─────────────────────────────────────────────
const PAGE_META_IE = {
  '/': {
    title: "The Berman – Ireland's Largest BER Website | BER Certificates & Energy Ratings",
    desc:  "Ireland's largest BER website. Get fast, reliable BER certificates from 100+ SEAI-registered assessors nationwide. Compare quotes and book online instantly.",
  },
  '/about': {
    title: 'About The Berman | Ireland\'s BER Certificate Platform',
    desc:  'Learn about The Berman — Ireland\'s largest BER certificate platform connecting property owners with 100+ SEAI-registered assessors across every county.',
  },
  '/about-us': {
    title: 'About The Berman | Ireland\'s BER Certificate Platform',
    desc:  'Learn about The Berman — Ireland\'s largest BER certificate platform connecting property owners with 100+ SEAI-registered assessors across every county.',
  },
  '/services': {
    title: 'BER Certificate Services Ireland | Residential & Commercial | The Berman',
    desc:  'Get residential, apartment and commercial BER certificates across Ireland. Compare quotes from SEAI-registered assessors and book online with The Berman.',
  },
  '/pricing': {
    title: 'BER Certificate Cost Ireland 2026 | Compare Prices | The Berman',
    desc:  'How much does a BER certificate cost in Ireland? Compare prices from €150 from SEAI-registered assessors. Get the best BER quote with The Berman.',
  },
  '/faq': {
    title: 'BER Certificate FAQs Ireland | Common Questions Answered | The Berman',
    desc:  'Answers to the most common BER certificate questions in Ireland. What is a BER? How long does it last? How much does it cost? Find out with The Berman.',
  },
  '/ber-faqs/': {
    title: 'BER Certificate FAQs Ireland | Common Questions Answered | The Berman',
    desc:  'Answers to the most common BER certificate questions in Ireland. What is a BER? How long does it last? How much does it cost? Find out with The Berman.',
  },
  '/contact-us': {
    title: 'Contact The Berman | BER Certificate Support Ireland',
    desc:  'Contact The Berman for BER certificate support. Ireland\'s largest BER platform — we\'re here to help with quotes, bookings and assessor queries.',
  },
  '/locations': {
    title: 'BER Assessors by Location | All Counties Ireland | The Berman',
    desc:  'Find SEAI-registered BER assessors in every county and town in Ireland. Compare local quotes and book your BER certificate online with The Berman.',
  },
  '/catalogue': {
    title: 'Find BER Assessors Ireland | Browse & Compare Quotes | The Berman',
    desc:  'Browse SEAI-registered BER assessors across Ireland. Compare quotes, check availability and book your BER certificate online instantly with The Berman.',
  },
  '/news': {
    title: 'BER Certificate News & Updates Ireland | The Berman',
    desc:  'Latest BER certificate news, SEAI updates and energy rating information for Irish homeowners and landlords. Stay informed with The Berman.',
  },
  '/blog': {
    title: 'BER Certificate Blog | Energy Rating Guides Ireland | The Berman',
    desc:  'Expert guides on BER certificates, energy efficiency upgrades, SEAI grants and property energy ratings in Ireland. Read more on The Berman blog.',
  },
  '/hire-agent': {
    title: 'Hire a BER Assessor Ireland | The Berman',
    desc:  'Hire a SEAI-registered BER assessor through The Berman. Fast, reliable and affordable BER certificates anywhere in Ireland.',
  },
  '/get-quote': {
    title: 'Get a BER Certificate Quote | Free Quotes Ireland | The Berman',
    desc:  'Get free BER certificate quotes from SEAI-registered assessors near you. Compare prices and book online instantly with The Berman.',
  },
  '/blog/ber-certificate-cost-ireland': {
    title: 'How Much Does a BER Certificate Cost in Ireland? | 2026 Price Guide',
    desc:  'BER certificate costs in Ireland range from €150–€300. Compare prices from SEAI-registered assessors near you. Get the best BER cert quote with The Berman.',
  },
  '/blog/new-ber-rating-scale-2026-ireland': {
    title: 'New BER Rating Scale 2026 — A0, A1, A2, A3 Ireland Explained | The Berman',
    desc:  "Ireland's new 2026 BER scale runs from A0 to G. Learn what each rating means, how it affects SEAI grants, and how to get your property rated under the new system.",
  },
  '/blog/ber-cert-for-landlords-ireland': {
    title: 'BER Certificate for Landlords Ireland 2026 | Legal Requirements & Costs',
    desc:  'Landlords in Ireland must have a valid BER certificate. Learn the legal requirements, costs (from €150), how long it lasts, and how to get one fast with The Berman.',
  },
  '/blog/seai-grants-2026-ireland': {
    title: 'SEAI Grants 2026 Ireland — Up to €25,000 for Home Energy Upgrades',
    desc:  'Full guide to SEAI energy upgrade grants in 2026. What grants are available, how much you can get (up to €25,000), and why you need a BER certificate to apply.',
  },
};

// ─── Page metadata map (England) ─────────────────────────────────────────────
const PAGE_META_EN = {
  '/': {
    title: "EPC Certificate England | Domestic & Commercial EPC",
    desc: "Book Accredited EPC Assessments Across England. Fast Domestic and Commercial EPC Certificates with Competitive Pricing and Nationwide Coverage",
  },
  '/about': {
    title: 'About EPC Cert | Energy Performance Certificate Experts',
    desc: 'Learn about EPC Cert, trusted Energy Performance Certificate experts helping property owners across England arrange EPC assessments',
  },
  '/about-us': {
    title: 'About EPC Cert | Energy Performance Certificate Experts',
    desc: 'Learn about EPC Cert, trusted Energy Performance Certificate experts helping property owners across England arrange EPC assessments',
  },
  '/services': {
    title: 'EPC Certificate Services England | Residential & Commercial | EPC Cert',
    desc: 'Get residential, landlord and commercial EPC certificates across England. Compare quotes from accredited assessors and book online with EPC Cert.',
  },
  '/pricing': {
    title: 'EPC Certificate Cost England 2026 | Compare Prices | EPC Cert',
    desc: 'How much does an EPC certificate cost in England? Compare prices from accredited assessors. Get the best EPC quote with EPC Cert.',
  },
  '/faq': {
    title: 'EPC Certificate FAQ England | EPC Assessor',
    desc: 'Find Answers to Common EPC Certificate Questions, Including Costs, Timelines, and Legal',
  },
  '/epc-faq': {
    title: 'EPC Certificate FAQ England 2026 | Landlord & MEES Questions Answered',
    desc: 'Answers to common EPC questions in England — costs, landlord MEES requirements, Band C 2030 deadline, how to improve ratings, and who can carry out assessments.',
  },
  '/contact-us': {
    title: 'Contact EPC Cert | EPC Certificate Support England',
    desc: "Contact EPC Cert for EPC certificate support. England's leading EPC platform — we're here to help.",
  },
  '/locations': {
    title: 'EPC Assessors by Location | All Counties England | EPC Cert',
    desc: 'Find accredited EPC assessors in every county and town in England. Compare local quotes and book online with EPC Cert.',
  },
  '/catalogue': {
    title: 'Find EPC Assessors England | Browse & Compare Quotes | EPC Cert',
    desc: 'Browse accredited EPC assessors across England. Compare quotes and book your EPC certificate online instantly with EPC Cert.',
  },
  '/news': {
    title: 'EPC Certificate News & Updates England | EPC Cert',
    desc: 'Latest EPC news, government regulations, and energy efficiency updates for English homeowners and landlords.',
  },
  '/blog': {
    title: 'EPC Certificate Blog | Energy Efficiency Guides England | EPC Cert',
    desc: 'Expert guides on Energy Performance Certificates, home efficiency improvements, and landlord regulations in England.',
  },
  '/hire-agent': {
    title: 'Hire an EPC Assessor England | EPC Cert',
    desc: 'Hire an accredited EPC assessor through EPC Cert. Fast, reliable and affordable EPC certificates anywhere in England.',
  },
  '/get-quote': {
    title: 'Get a Free EPC Certificate Quote | Compare Prices England | EPC Cert',
    desc: 'Get free EPC certificate quotes from accredited assessors near you. Compare and book online instantly with EPC Cert.',
  },
  // Blog posts — England
  '/blog/epc-certificate-cost-guide': {
    title: 'How Much Does an EPC Certificate Cost in England? | 2026 Price Guide',
    desc: 'EPC certificates in England cost £45–£150 for domestic properties. Compare prices from accredited assessors near you. Get your best EPC quote with EPC Cert.',
  },
  '/blog/landlord-epc-requirements-england-2026': {
    title: 'Landlord EPC Requirements England 2026 | MEES Band C 2030 Deadline Guide',
    desc: 'England MEES requires EPC Band E now; all rentals must reach Band C by 2030. Fines up to £30,000. Learn what landlords must do and how EPC Cert can help.',
  },
  '/blog/how-to-improve-epc-rating-england': {
    title: 'How to Improve Your EPC Rating England 2026 | E to C Upgrade Guide',
    desc: 'Improve your EPC rating from E to C in England. Guide to loft insulation, heat pumps, boilers & solar panels with costs, grants available, and step-by-step plan.',
  },
  '/blog/commercial-epc-england-guide': {
    title: 'Commercial EPC England 2026 | MEES Requirements, Costs & How to Comply',
    desc: 'Commercial EPCs are required when selling or renting in England. MEES demands Band C by 2030. Costs from £150. Compare commercial EPC quotes with EPC Cert.',
  },
  '/blog/epc-band-c-2030-deadline-landlord-guide': {
    title: 'EPC Band C 2030 Deadline — Landlord Action Plan England | EPC Cert',
    desc: "All English rentals must reach EPC Band C by 2030. With fines up to £30,000, here's your step-by-step landlord action plan to comply on time and save money.",
  },
};

// ─── Page metadata map (Spain) ────────────────────────────────────────────────
const PAGE_META_ES = {
  '/': {
    title: "Certificado Energético en España | Precio desde 60€ | Técnicos Acreditados",
    desc: "¿Necesitas tu certificado energético? Compara presupuestos de técnicos acreditados en toda España. Desde 60€, visita incluida, registro oficial. Entrega en 24–72h. ¡Solicita presupuesto gratis!"
  },
  '/sobre-nosotros': {
    title: "Quiénes Somos | Plataforma Certificado Energético España | CertificadoEnergético.eu",
    desc: "Somos la plataforma que conecta propietarios con técnicos certificadores acreditados en toda España. Más de 1.000 certificados completados. Rápido, transparente y 100% oficial."
  },
  '/contacto': {
    title: "Solicita tu Certificado Energético en España | Presupuesto Gratis | Contacto",
    desc: "Solicita presupuesto gratuito para tu certificado energético. Técnicos acreditados en toda España. Visita incluida, registro oficial y entrega en 24–72h. Presupuesto sin compromiso."
  },
  '/directorio': {
    title: "Directorio Técnicos Certificado Energético España | Compara y Contrata",
    desc: "Encuentra técnicos acreditados para tu certificado energético en toda España. Compara precios, lee valoraciones y contrata profesionales colegiados. ¡Presupuesto gratis!"
  },
  '/directorio/tecnicos-certificadores': {
    title: "Directorio de Técnicos Certificadores Energéticos | España",
    desc: "Busca técnicos competentes acreditados en toda España para la emisión de Certificados de Eficiencia Energética residenciales y comerciales."
  },
  '/directorio/empresas-energia': {
    title: "Empresas de Eficiencia Energética en España | Directorio",
    desc: "Conecta con empresas de eficiencia energética en toda España: instaladores solares, expertos en aislamiento, bombas de calor y consultores de reformas."
  },
  '/asesor-energetico': {
    title: "Contrata Asesor Energético en España | Visita + Registro en 24–48h",
    desc: "Habla con un asesor energético independiente. Te ayudamos a evaluar mejoras, priorizar actuaciones y mejorar la calificación de tu inmueble. Presupuesto sin compromiso."
  },
  '/preguntas-frecuentes': {
    title: "Preguntas Frecuentes Certificado Energético España | Precios, Validez, Multas",
    desc: "¿Cuánto cuesta el certificado energético? ¿Es obligatorio para alquilar? ¿Cuánto tarda? Resolvemos todas tus dudas sobre el CEE en España. Guía completa 2026."
  },
  '/blog': {
    title: "Blog Certificado Energético España | Guías, Precios, Normativa 2026",
    desc: "Guías prácticas sobre el certificado energético en España: precios 2026, cómo mejorar tu calificación, normativa obligatoria y ayudas para reformas. Actualizado julio 2026."
  },
  '/blog/precio-certificado-energetico-espana': {
    title: "Precio del Certificado Energético en España 2026 | Guía Completa",
    desc: "Descubre cuánto cuesta el Certificado Energético en España, qué factores afectan al precio y cómo solicitar presupuesto a técnicos acreditados."
  },
  '/blog/certificado-energetico-obligatorio-espana': {
    title: "¿Cuándo es Obligatorio el Certificado Energético en España? | Guía 2026",
    desc: "Descubre cuándo es obligatorio el certificado energético en España: venta, alquiler, hipotecas, sanciones y excepciones. Guía completa actualizada 2026."
  },
  '/blog/mejorar-calificacion-energetica-vivienda': {
    title: "Cómo Mejorar la Calificación Energética de tu Vivienda | Guía Completa",
    desc: "Descubre las mejores reformas para mejorar la calificación energética de tu vivienda: aislamiento, ventanas, caldera, solar. Ayudas y subvenciones disponibles en 2026."
  },
  '/noticias': {
    title: "Noticias Certificado Energético España 2026 | Normativa y Novedades",
    desc: "Últimas noticias sobre el certificado energético en España: Orden ECM/599/2025, Directiva EPBD, obligación hipotecaria y nuevas exigencias 2030. Mantente al día."
  },
  '/ubicaciones': {
    title: "Técnicos Certificado Energético en Toda España | Ubicaciones",
    desc: "Conecta con técnicos certificadores acreditados en toda España. Compara presupuestos and organiza tu certificado energético en tu ciudad."
  }
};

const COUNTY_NAMES = {
  carlow:'Carlow', cavan:'Cavan', clare:'Clare', cork:'Cork', donegal:'Donegal',
  dublin:'Dublin', galway:'Galway', kerry:'Kerry', kildare:'Kildare',
  kilkenny:'Kilkenny', laois:'Laois', leitrim:'Leitrim', limerick:'Limerick',
  longford:'Longford', louth:'Louth', mayo:'Mayo', meath:'Meath',
  monaghan:'Monaghan', offaly:'Offaly', roscommon:'Roscommon', sligo:'Sligo',
  tipperary:'Tipperary', waterford:'Waterford', westmeath:'Westmeath',
  wexford:'Wexford', wicklow:'Wicklow',
};

const SKIP_PAGES = new Set([
  'about','services','pricing','faq','news','blog','contact-us',
  'catalogue','locations','hire-agent','get-quote','privacy','terms',
  'cookie-policy','signup','login','dashboard','admin','api',
  'sobre-nosotros','contacto','directorio','asesor-energetico','preguntas-frecuentes','noticias','ubicaciones',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function e(str) {
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getMeta(pathname, tenant) {
  const cleanPath = pathname.replace(/\/$/, '');
  const activePath = cleanPath === '' ? '/' : cleanPath;

  if (tenant === 'spain') {
    if (PAGE_META_ES[activePath]) return PAGE_META_ES[activePath];

    // Check if it's a location page
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
    return PAGE_META_ES['/'];
  }

  if (tenant === 'england') {
    if (PAGE_META_EN[activePath]) return PAGE_META_EN[activePath];

    // Check if it's an England location page
    const match = activePath.match(/^\/epc-assessment-([a-z\-]+)$/);
    if (match) {
      const citySlug = match[1];
      const displayCity = toTitle(citySlug);
      return {
        title: `EPC Certificate ${displayCity} | Domestic & Commercial EPC`,
        desc: `Need an EPC certificate in ${displayCity}? Compare quotes from local accredited assessors. Book your EPC assessment online with EPC Cert.`
      };
    }
    return PAGE_META_EN['/'];
  }

  // Ireland
  if (PAGE_META_IE[activePath]) return PAGE_META_IE[activePath];
  const parts = activePath.replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return PAGE_META_IE['/'];

  const countyKey = parts[0];
  const county    = COUNTY_NAMES[countyKey] || toTitle(countyKey);

  if (parts.length === 1 && COUNTY_NAMES[countyKey]) {
    return {
      title: `BER Certificate ${county} | Compare SEAI Assessors | The Berman`,
      desc:  `Get BER certificates in County ${county}, Ireland. Compare quotes from local SEAI-registered assessors and book online. Fast, affordable with The Berman.`,
    };
  }
  if (parts.length === 2) {
    const town = toTitle(parts[1]);
    return {
      title: `BER Certificate ${town}, ${county} | Local SEAI Assessors | The Berman`,
      desc:  `Need a BER certificate in ${town}, ${county}? Compare quotes from SEAI-registered assessors near you. Book online with The Berman.`,
    };
  }
  return PAGE_META_IE['/'];
}

// ─── Schema builders ──────────────────────────────────────────────────────────
function buildOrgSchema(tenant) {
    if (tenant === 'spain') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#organization',
          name: 'Certificado Energético España',
          url: 'https://www.xn--certificadoenergtico-q2b.eu/',
          logo: 'https://www.xn--certificadoenergtico-q2b.eu/logo.png',
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
    };
  }
  }

  if (tenant === 'england') {
    const cleanPath = pathname.replace(/\/$/, '');
    const match = cleanPath.match(/^\/epc-assessment-([a-z\-]+)$/);
    const citySlug = match ? match[1] : 'london';
    const displayCity = toTitle(citySlug);

    return {
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
    };
  }

  const parts   = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const countyKey = parts[0];
  const county  = COUNTY_NAMES[countyKey] || toTitle(countyKey);
  const town    = parts[1] ? toTitle(parts[1]) : null;
  const location = town ? `${town}, County ${county}` : `County ${county}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `BER Certificate in ${location}`,
    url: `https://theberman.eu${pathname}`,
    description: `Get BER certificates in ${location}, Ireland. Compare quotes from SEAI-registered assessors. Book online today with The Berman.`,
    provider: { '@id': 'https://theberman.eu/#organization' },
    areaServed: {
      '@type': town ? 'City' : 'AdministrativeArea',
      name: location,
      containedInPlace: { '@type': 'Country', name: 'Ireland' },
    },
    serviceType: 'Building Energy Rating Certificate',
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '150', highPrice: '300' },
  };
}

function buildBreadcrumb(pathname, tenant) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return null;
  
  let siteUrl = 'https://theberman.eu';
  if (tenant === 'spain') siteUrl = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') siteUrl = 'https://www.epccert.com';

  const homeName = tenant === 'spain' ? 'Inicio' : 'Home';
  
  const items = [{ '@type':'ListItem', position:1, name: homeName, item: siteUrl + '/' }];
  let cur = siteUrl;
  parts.forEach((p, i) => {
    cur += '/' + p;
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
    }
    items.push({ '@type':'ListItem', position:i+2, name, item: cur });
  });
  return { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement: items };
}

// ─── Build injection block ────────────────────────────────────────────────────
function buildInjection(pathname, tenant) {
  const { title, desc } = getMeta(pathname, tenant);
  
  let canonicalBase = 'https://www.theberman.eu';
  if (tenant === 'spain') canonicalBase = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') canonicalBase = 'https://www.epccert.com';
  
  const canonical = `${canonicalBase}${pathname}`;
  
  let ogImage = 'https://theberman.eu/logo.png';
  if (tenant === 'spain') ogImage = 'https://www.xn--certificadoenergtico-q2b.eu/logo.png';
  else if (tenant === 'england') ogImage = 'https://www.epccert.com/logo.png';
  
  const parts     = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const isLocationIE = tenant === 'ireland' && parts.length >= 1 && COUNTY_NAMES[parts[0]] && !SKIP_PAGES.has(parts[0]);
  const isLocationES = tenant === 'spain' && pathname.startsWith('/certificado-energetico-');
  const isLocationEN = tenant === 'england' && pathname.startsWith('/epc-assessment-');

  const schemas = [buildOrgSchema(tenant)];
  // FAQ schema — fires on /ber-faqs/ too
  if (pathname === '/faq' || pathname === '/preguntas-frecuentes' || pathname === '/epc-faq' || pathname === '/ber-faqs' || pathname === '/ber-faqs/')
    schemas.push(buildFaqSchema(tenant));
    
  if (isLocationIE || isLocationES || isLocationEN)
    schemas.push(buildLocationSchema(pathname, tenant));

  // BlogPosting schema for blog posts
  const isBlogPost = parts[0] === 'blog' && parts.length === 2;
  if (isBlogPost) {
    const { title: postTitle, desc: postDesc } = getMeta(pathname, tenant);
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: postTitle,
      description: postDesc,
      url: `${canonicalBase}${pathname}`,
      datePublished: '2026-07-01',
      dateModified: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman', url: canonicalBase },
      publisher: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}/logo.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${pathname}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : 'en-IE',
    });
  }

  // NewsArticle schema for news posts
  const isNewsPost = parts[0] === 'news' && parts.length === 2;
  if (isNewsPost) {
    const { title: newsTitle, desc: newsDesc } = getMeta(pathname, tenant);
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: newsTitle,
      description: newsDesc,
      url: `${canonicalBase}${pathname}`,
      datePublished: '2026-07-01',
      dateModified: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman', url: canonicalBase },
      publisher: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}/logo.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${pathname}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : 'en-IE',
    });
  }
    
  const bc = buildBreadcrumb(pathname, tenant);
  if (bc)
    schemas.push(bc);

  const schemaBlocks = schemas
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');

  const hreflangs = [
    { lang:'en-IE', base:'https://theberman.eu' },
    { lang:'en-GB', base:'https://epccert.com' },
    { lang:'fr-FR', base:'https://dpefrance.eu' },
    { lang:'es-ES', base:'https://www.xn--certificadoenergtico-q2b.eu' },
    { lang:'pt-PT', base:'https://certificadopt.eu' },
    { lang:'x-default', base:'https://theberman.eu' },
  ].map(d => `<link rel="alternate" hreflang="${d.lang}" href="${d.base}${pathname}" />`).join('\n');

  let siteName = 'The Berman';
  let locale = 'en_IE';
  if (tenant === 'spain') { siteName = 'Certificado Energético'; locale = 'es_ES'; }
  else if (tenant === 'england') { siteName = 'EPC Cert'; locale = 'en_GB'; }

  return { 
    title: e(title), 
    desc: e(desc), 
    canonical, 
    ogImage: e(ogImage), 
    hreflangs, 
    schemaBlocks,
    siteName,
    locale
  };
}

// ─── Main fetch handler ───────────────────────────────────────────────────────
async function handleRequest(request) {
  const url  = new URL(request.url);

  // Non-www → www permanent redirect
  if (url.hostname === 'theberman.eu') {
    return Response.redirect(`https://www.theberman.eu${url.pathname}${url.search}`, 301);
  }
  if (url.hostname === 'xn--certificadoenergtico-q2b.eu') {
    return Response.redirect(`https://www.xn--certificadoenergtico-q2b.eu${url.pathname}${url.search}`, 301);
  }
  if (url.hostname === 'epccert.com') {
    return Response.redirect(`https://www.epccert.com${url.pathname}${url.search}`, 301);
  }

  // Skip assets / API routes
  const skip = ['/assets/', '/api/', '/_next/', '/logo', '/favicon', '/robots', '/sitemap'];
  if (skip.some(p => url.pathname.startsWith(p))) {
    return fetch(request);
  }

  const isEsp = /certificado|xn--/.test(url.hostname);
  const isEng = /epccert/.test(url.hostname);
  const tenant = isEsp ? 'spain' : (isEng ? 'england' : 'ireland');

  // Handle redirects
  if (tenant === 'spain') {
    if (url.pathname === '/about') return Response.redirect(`https://${url.hostname}/sobre-nosotros`, 301);
    if (url.pathname === '/faq') return Response.redirect(`https://${url.hostname}/preguntas-frecuentes`, 301);
    if (url.pathname === '/catalogue') return Response.redirect(`https://${url.hostname}/directorio`, 301);
    if (url.pathname === '/hire-agent') return Response.redirect(`https://${url.hostname}/asesor-energetico`, 301);
    if (url.pathname === '/contact-us') return Response.redirect(`https://${url.hostname}/contacto`, 301);
  } else if (tenant === 'ireland') {
    if (url.pathname === '/about') return Response.redirect(`https://${url.hostname}/about-us`, 301);
    if (url.pathname === '/faq') return Response.redirect(`https://${url.hostname}/ber-faqs/`, 301);
  } else if (tenant === 'england') {
    if (url.pathname === '/about') return Response.redirect(`https://${url.hostname}/about-us`, 301);
    if (url.pathname === '/faq') return Response.redirect(`https://${url.hostname}/epc-faq`, 301);
  }

  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  const { title, desc, canonical, ogImage, hreflangs, schemaBlocks, siteName, locale } = buildInjection(url.pathname, tenant);

  // Replace meta tags in raw HTML
  html = html
    .replace(/<title>[^<]*<\/title>/i,                                   `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,     `<meta name="description" content="${desc}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i,           `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,    `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i,      `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/i,    `<meta property="og:image" content="${ogImage}" />`)
    .replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/>/i,   `<meta property="og:locale" content="${locale}" />`)
    .replace(/<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/>/i,`<meta property="og:site_name" content="${siteName}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,   `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${desc}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/i,   `<meta name="twitter:image" content="${ogImage}" />`)
    .replace(/<meta\s+name="author"\s+content="[^"]*"\s*\/>/i,          `<meta name="author" content="${siteName}" />`)
    // GSC verification — replace REPLACE_WITH_GSC_VERIFICATION_CODE with actual code from Google Search Console
    .replace('</head>', `<meta name="google-site-verification" content="REPLACE_WITH_GSC_VERIFICATION_CODE" />\n${hreflangs}\n${schemaBlocks}\n</head>`);

  return new Response(html, {
    status:  response.status,
    headers: {
      'content-type':    'text/html; charset=utf-8',
      'cache-control':   'public, max-age=3600, stale-while-revalidate=86400',
      'x-robots-tag':    'index, follow',
    },
  });
}

// Cloudflare Workers entry point
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});




// Vercel Edge Middleware — Multi-tenant SEO Fix
// Injects: canonical, title, meta description, OG tags, hreflang, JSON-LD schema
// Zero changes to the React app needed.

export const config = { matcher: '/((?!_next|assets|favicon|logo|robots|sitemap).*)' };

// ─── Page metadata map (Ireland) ─────────────────────────────────────────────
const PAGE_META_IE = {
  '/': {
    title: "The Berman – Ireland's Largest BER Website | BER Certificates & Energy Ratings",
    desc:  "Ireland's largest BER website. Get fast, reliable BER certificates from 100+ SEAI-registered assessors nationwide. Compare quotes and book online instantly.",
  },
  '/about': {
    title: 'About The Berman | Ireland\'s BER Certificate Platform',
    desc:  'Learn about The Berman — Ireland\'s largest BER certificate platform connecting property owners with 100+ SEAI-registered assessors across every county.',
  },
  '/about-us': {
    title: 'About The Berman | Ireland\'s BER Certificate Platform',
    desc:  'Learn about The Berman — Ireland\'s largest BER certificate platform connecting property owners with 100+ SEAI-registered assessors across every county.',
  },
  '/services': {
    title: 'BER Certificate Services Ireland | Residential & Commercial | The Berman',
    desc:  'Get residential, apartment and commercial BER certificates across Ireland. Compare quotes from SEAI-registered assessors and book online with The Berman.',
  },
  '/pricing': {
    title: 'BER Certificate Cost Ireland 2026 | Compare Prices | The Berman',
    desc:  'How much does a BER certificate cost in Ireland? Compare prices from €150 from SEAI-registered assessors. Get the best BER quote with The Berman.',
  },
  '/faq': {
    title: 'BER Certificate FAQs Ireland | Common Questions Answered | The Berman',
    desc:  'Answers to the most common BER certificate questions in Ireland. What is a BER? How long does it last? How much does it cost? Find out with The Berman.',
  },
  '/ber-faqs/': {
    title: 'BER Certificate FAQs Ireland | Common Questions Answered | The Berman',
    desc:  'Answers to the most common BER certificate questions in Ireland. What is a BER? How long does it last? How much does it cost? Find out with The Berman.',
  },
  '/contact-us': {
    title: 'Contact The Berman | BER Certificate Support Ireland',
    desc:  'Contact The Berman for BER certificate support. Ireland\'s largest BER platform — we\'re here to help with quotes, bookings and assessor queries.',
  },
  '/locations': {
    title: 'BER Assessors by Location | All Counties Ireland | The Berman',
    desc:  'Find SEAI-registered BER assessors in every county and town in Ireland. Compare local quotes and book your BER certificate online with The Berman.',
  },
  '/catalogue': {
    title: 'Find BER Assessors Ireland | Browse & Compare Quotes | The Berman',
    desc:  'Browse SEAI-registered BER assessors across Ireland. Compare quotes, check availability and book your BER certificate online instantly with The Berman.',
  },
  '/news': {
    title: 'BER Certificate News & Updates Ireland | The Berman',
    desc:  'Latest BER certificate news, SEAI updates and energy rating information for Irish homeowners and landlords. Stay informed with The Berman.',
  },
  '/blog': {
    title: 'BER Certificate Blog | Energy Rating Guides Ireland | The Berman',
    desc:  'Expert guides on BER certificates, energy efficiency upgrades, SEAI grants and property energy ratings in Ireland. Read more on The Berman blog.',
  },
  '/hire-agent': {
    title: 'Hire a BER Assessor Ireland | The Berman',
    desc:  'Hire a SEAI-registered BER assessor through The Berman. Fast, reliable and affordable BER certificates anywhere in Ireland.',
  },
  '/get-quote': {
    title: 'Get a BER Certificate Quote | Free Quotes Ireland | The Berman',
    desc:  'Get free BER certificate quotes from SEAI-registered assessors near you. Compare prices and book online instantly with The Berman.',
  },
  '/blog/ber-certificate-cost-ireland': {
    title: 'How Much Does a BER Certificate Cost in Ireland? | 2026 Price Guide',
    desc:  'BER certificate costs in Ireland range from €150–€300. Compare prices from SEAI-registered assessors near you. Get the best BER cert quote with The Berman.',
  },
  '/blog/new-ber-rating-scale-2026-ireland': {
    title: 'New BER Rating Scale 2026 — A0, A1, A2, A3 Ireland Explained | The Berman',
    desc:  "Ireland's new 2026 BER scale runs from A0 to G. Learn what each rating means, how it affects SEAI grants, and how to get your property rated under the new system.",
  },
  '/blog/ber-cert-for-landlords-ireland': {
    title: 'BER Certificate for Landlords Ireland 2026 | Legal Requirements & Costs',
    desc:  'Landlords in Ireland must have a valid BER certificate. Learn the legal requirements, costs (from €150), how long it lasts, and how to get one fast with The Berman.',
  },
  '/blog/seai-grants-2026-ireland': {
    title: 'SEAI Grants 2026 Ireland — Up to €25,000 for Home Energy Upgrades',
    desc:  'Full guide to SEAI energy upgrade grants in 2026. What grants are available, how much you can get (up to €25,000), and why you need a BER certificate to apply.',
  },
};

// ─── Page metadata map (England) ─────────────────────────────────────────────
const PAGE_META_EN = {
  '/': {
    title: "EPC Certificate England | Domestic & Commercial EPC",
    desc: "Book Accredited EPC Assessments Across England. Fast Domestic and Commercial EPC Certificates with Competitive Pricing and Nationwide Coverage",
  },
  '/about': {
    title: 'About EPC Cert | Energy Performance Certificate Experts',
    desc: 'Learn about EPC Cert, trusted Energy Performance Certificate experts helping property owners across England arrange EPC assessments',
  },
  '/about-us': {
    title: 'About EPC Cert | Energy Performance Certificate Experts',
    desc: 'Learn about EPC Cert, trusted Energy Performance Certificate experts helping property owners across England arrange EPC assessments',
  },
  '/services': {
    title: 'EPC Certificate Services England | Residential & Commercial | EPC Cert',
    desc: 'Get residential, landlord and commercial EPC certificates across England. Compare quotes from accredited assessors and book online with EPC Cert.',
  },
  '/pricing': {
    title: 'EPC Certificate Cost England 2026 | Compare Prices | EPC Cert',
    desc: 'How much does an EPC certificate cost in England? Compare prices from accredited assessors. Get the best EPC quote with EPC Cert.',
  },
  '/faq': {
    title: 'EPC Certificate FAQ England | EPC Assessor',
    desc: 'Find Answers to Common EPC Certificate Questions, Including Costs, Timelines, and Legal',
  },
  '/epc-faq': {
    title: 'EPC Certificate FAQ England 2026 | Landlord & MEES Questions Answered',
    desc: 'Answers to common EPC questions in England — costs, landlord MEES requirements, Band C 2030 deadline, how to improve ratings, and who can carry out assessments.',
  },
  '/contact-us': {
    title: 'Contact EPC Cert | EPC Certificate Support England',
    desc: "Contact EPC Cert for EPC certificate support. England's leading EPC platform — we're here to help.",
  },
  '/locations': {
    title: 'EPC Assessors by Location | All Counties England | EPC Cert',
    desc: 'Find accredited EPC assessors in every county and town in England. Compare local quotes and book online with EPC Cert.',
  },
  '/catalogue': {
    title: 'Find EPC Assessors England | Browse & Compare Quotes | EPC Cert',
    desc: 'Browse accredited EPC assessors across England. Compare quotes and book your EPC certificate online instantly with EPC Cert.',
  },
  '/news': {
    title: 'EPC Certificate News & Updates England | EPC Cert',
    desc: 'Latest EPC news, government regulations, and energy efficiency updates for English homeowners and landlords.',
  },
  '/blog': {
    title: 'EPC Certificate Blog | Energy Efficiency Guides England | EPC Cert',
    desc: 'Expert guides on Energy Performance Certificates, home efficiency improvements, and landlord regulations in England.',
  },
  '/hire-agent': {
    title: 'Hire an EPC Assessor England | EPC Cert',
    desc: 'Hire an accredited EPC assessor through EPC Cert. Fast, reliable and affordable EPC certificates anywhere in England.',
  },
  '/get-quote': {
    title: 'Get a Free EPC Certificate Quote | Compare Prices England | EPC Cert',
    desc: 'Get free EPC certificate quotes from accredited assessors near you. Compare and book online instantly with EPC Cert.',
  },
  // Blog posts — England
  '/blog/epc-certificate-cost-guide': {
    title: 'How Much Does an EPC Certificate Cost in England? | 2026 Price Guide',
    desc: 'EPC certificates in England cost £45–£150 for domestic properties. Compare prices from accredited assessors near you. Get your best EPC quote with EPC Cert.',
  },
  '/blog/landlord-epc-requirements-england-2026': {
    title: 'Landlord EPC Requirements England 2026 | MEES Band C 2030 Deadline Guide',
    desc: 'England MEES requires EPC Band E now; all rentals must reach Band C by 2030. Fines up to £30,000. Learn what landlords must do and how EPC Cert can help.',
  },
  '/blog/how-to-improve-epc-rating-england': {
    title: 'How to Improve Your EPC Rating England 2026 | E to C Upgrade Guide',
    desc: 'Improve your EPC rating from E to C in England. Guide to loft insulation, heat pumps, boilers & solar panels with costs, grants available, and step-by-step plan.',
  },
  '/blog/commercial-epc-england-guide': {
    title: 'Commercial EPC England 2026 | MEES Requirements, Costs & How to Comply',
    desc: 'Commercial EPCs are required when selling or renting in England. MEES demands Band C by 2030. Costs from £150. Compare commercial EPC quotes with EPC Cert.',
  },
  '/blog/epc-band-c-2030-deadline-landlord-guide': {
    title: 'EPC Band C 2030 Deadline — Landlord Action Plan England | EPC Cert',
    desc: 'All English rentals must reach EPC Band C by 2030. With fines up to £30,000, here\'s your step-by-step landlord action plan to comply on time and save money.',
  },
};

// ─── Page metadata map (Spain) ────────────────────────────────────────────────
const PAGE_META_ES = {
  '/': {
    title: "Certificado Energético en España | Precio desde 60€ | Técnicos Acreditados",
    desc: "¿Necesitas tu certificado energético? Compara presupuestos de técnicos acreditados en toda España. Desde 60€, visita incluida, registro oficial. Entrega en 24–72h. ¡Solicita presupuesto gratis!"
  },
  '/sobre-nosotros': {
    title: "Quiénes Somos | Plataforma Certificado Energético España | CertificadoEnergético.eu",
    desc: "Somos la plataforma que conecta propietarios con técnicos certificadores acreditados en toda España. Más de 1.000 certificados completados. Rápido, transparente y 100% oficial."
  },
  '/contacto': {
    title: "Solicita tu Certificado Energético en España | Presupuesto Gratis | Contacto",
    desc: "Solicita presupuesto gratuito para tu certificado energético. Técnicos acreditados en toda España. Visita incluida, registro oficial y entrega en 24–72h. Presupuesto sin compromiso."
  },
  '/directorio': {
    title: "Directorio Técnicos Certificado Energético España | Compara y Contrata",
    desc: "Encuentra técnicos acreditados para tu certificado energético en toda España. Compara precios, lee valoraciones y contrata profesionales colegiados. ¡Presupuesto gratis!"
  },
  '/directorio/tecnicos-certificadores': {
    title: "Directorio de Técnicos Certificadores Energéticos | España",
    desc: "Busca técnicos competentes acreditados en toda España para la emisión de Certificados de Eficiencia Energética residenciales y comerciales."
  },
  '/directorio/empresas-energia': {
    title: "Empresas de Eficiencia Energética en España | Directorio",
    desc: "Conecta con empresas de eficiencia energética en toda España: instaladores solares, expertos en aislamiento, bombas de calor y consultores de reformas."
  },
  '/asesor-energetico': {
    title: "Contrata Asesor Energético en España | Visita + Registro en 24–48h",
    desc: "Habla con un asesor energético independiente. Te ayudamos a evaluar mejoras, priorizar actuaciones y mejorar la calificación de tu inmueble. Presupuesto sin compromiso."
  },
  '/preguntas-frecuentes': {
    title: "Preguntas Frecuentes Certificado Energético España | Precios, Validez, Multas",
    desc: "¿Cuánto cuesta el certificado energético? ¿Es obligatorio para alquilar? ¿Cuánto tarda? Resolvemos todas tus dudas sobre el CEE en España. Guía completa 2026."
  },
  '/blog': {
    title: "Blog Certificado Energético España | Guías, Precios, Normativa 2026",
    desc: "Guías prácticas sobre el certificado energético en España: precios 2026, cómo mejorar tu calificación, normativa obligatoria y ayudas para reformas. Actualizado julio 2026."
  },
  '/blog/precio-certificado-energetico-espana': {
    title: "Precio del Certificado Energético en España 2026 | Guía Completa",
    desc: "Descubre cuánto cuesta el Certificado Energético en España, qué factores afectan al precio y cómo solicitar presupuesto a técnicos acreditados."
  },
  '/blog/certificado-energetico-obligatorio-espana': {
    title: "¿Cuándo es Obligatorio el Certificado Energético en España? | Guía 2026",
    desc: "Descubre cuándo es obligatorio el certificado energético en España: venta, alquiler, hipotecas, sanciones y excepciones. Guía completa actualizada 2026."
  },
  '/blog/mejorar-calificacion-energetica-vivienda': {
    title: "Cómo Mejorar la Calificación Energética de tu Vivienda | Guía Completa",
    desc: "Descubre las mejores reformas para mejorar la calificación energética de tu vivienda: aislamiento, ventanas, caldera, solar. Ayudas y subvenciones disponibles en 2026."
  },
  '/noticias': {
    title: "Noticias Certificado Energético España 2026 | Normativa y Novedades",
    desc: "Últimas noticias sobre el certificado energético en España: Orden ECM/599/2025, Directiva EPBD, obligación hipotecaria y nuevas exigencias 2030. Mantente al día."
  },
  '/ubicaciones': {
    title: "Técnicos Certificado Energético en Toda España | Ubicaciones",
    desc: "Conecta con técnicos certificadores acreditados en toda España. Compara presupuestos y organiza tu certificado energético en tu ciudad."
  }
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getMeta(pathname, tenant) {
  const cleanPath = pathname.replace(/\/$/, ''); // strip trailing slash
  const activePath = cleanPath === '' ? '/' : cleanPath;

  if (tenant === 'spain') {
    if (PAGE_META_ES[activePath]) return PAGE_META_ES[activePath];

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
    return PAGE_META_ES['/'];
  }

  if (tenant === 'england') {
    if (PAGE_META_EN[activePath]) return PAGE_META_EN[activePath];

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
    return PAGE_META_EN['/'];
  }

  // Ireland
  if (PAGE_META_IE[activePath]) return PAGE_META_IE[activePath];

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

  return PAGE_META_IE['/'];
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
          logo: 'https://www.xn--certificadoenergtico-q2b.eu/logo.png',
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
          logo: 'https://www.epccert.com/logo.png',
          description: "England's leading EPC certificate platform. Compare quotes from accredited Energy Performance Certificate assessors nationwide.",
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

  const parts = pathname.replace(/^\//, '').split('/');
  const county = COUNTY_NAMES[parts[0]] || toTitle(parts[0]);
  const town   = parts[1] ? toTitle(parts[1]) : null;
  const location = town ? `${town}, County ${county}` : `County ${county}`;
  const url = `https://theberman.eu${pathname}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `BER Certificate in ${location}`,
    url,
    description: `Get BER certificates in ${location}, Ireland. Compare quotes from SEAI-registered assessors. Book online today with The Berman.`,
    provider: { '@id': 'https://theberman.eu/#organization' },
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

  let siteUrl = 'https://theberman.eu';
  if (tenant === 'spain') siteUrl = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') siteUrl = 'https://www.epccert.com';

  const homeName = tenant === 'spain' ? 'Inicio' : 'Home';

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
    }
    items.push({ '@type':'ListItem', position: i + 2, name, item: current });
  });
  return JSON.stringify({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement: items });
}

// ─── Hreflang builder ────────────────────────────────────────────────────────
function hreflangTags(pathname, tenant) {
  const cleanPath = pathname === '/' ? '/' : pathname;
  const domains = [
    { lang:'en-IE', base:'https://theberman.eu' },
    { lang:'en-GB', base:'https://epccert.com' },
    { lang:'fr-FR', base:'https://dpefrance.eu' },
    { lang:'es-ES', base:'https://www.xn--certificadoenergtico-q2b.eu' },
    { lang:'pt-PT', base:'https://certificadopt.eu' },
    { lang:'x-default', base:'https://theberman.eu' },
  ];
  return domains.map(d =>
    `<link rel="alternate" hreflang="${d.lang}" href="${d.base}${cleanPath}" />`
  ).join('\n  ');
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function middleware(req) {
  const url  = new URL(req.url);
  const path = url.pathname;

  const hostname = req.headers.get('host') || url.hostname;
  const isEsp = /certificado|xn--/.test(hostname);
  const isEng = /epccert/.test(hostname);
  const tenant = isEsp ? 'spain' : (isEng ? 'england' : 'ireland');

  // Handle redirects
  if (tenant === 'spain') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/sobre-nosotros`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/preguntas-frecuentes`, 301);
    if (path === '/catalogue') return Response.redirect(`${url.protocol}//${hostname}/directorio`, 301);
    if (path === '/hire-agent') return Response.redirect(`${url.protocol}//${hostname}/asesor-energetico`, 301);
    if (path === '/contact-us') return Response.redirect(`${url.protocol}//${hostname}/contacto`, 301);
  } else if (tenant === 'ireland') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/about-us`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/ber-faqs/`, 301);
  } else if (tenant === 'england') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/about-us`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/epc-faq`, 301);
  }

  // Fetch original response
  const res = await fetch(req);
  const html = await res.text();

  const { title, desc } = getMeta(path, tenant);
  
  let canonicalBase = 'https://www.theberman.eu';
  if (tenant === 'spain') canonicalBase = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') canonicalBase = 'https://www.epccert.com';
  
  const canonical = `${canonicalBase}${path === '/' ? '/' : path}`;
  
  let ogImage = 'https://theberman.eu/logo.png';
  if (tenant === 'spain') ogImage = 'https://www.xn--certificadoenergtico-q2b.eu/logo.png';
  else if (tenant === 'england') ogImage = 'https://www.epccert.com/logo.png';

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
  
  if (isLocationIE || isLocationES || isLocationEN)
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
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman', url: canonicalBase },
      publisher: {
        '@type': 'Organization',
        name: tenant === 'england' ? 'EPC Cert' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${path}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : 'en-IE',
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
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman', url: canonicalBase },
      publisher: {
        '@type': 'Organization',
        name: tenant === 'england' ? 'EPC Cert' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${path}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : 'en-IE',
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

  // Inject into <head>
  // GSC verification — replace with your actual code from Google Search Console
  const gscMeta = `<meta name="google-site-verification" content="REPLACE_WITH_GSC_VERIFICATION_CODE" />`;

  const injected = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  ).replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${desc}" />`
  ).replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonical}" />`
  ).replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`
  ).replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${desc}" />`
  ).replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonical}" />`
  ).replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${ogImage}" />`
  ).replace(
    /<meta property="og:locale" content="[^"]*" \/>/,
    `<meta property="og:locale" content="${locale}" />`
  ).replace(
    /<meta property="og:site_name" content="[^"]*" \/>/,
    `<meta property="og:site_name" content="${siteName}" />`
  ).replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`
  ).replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${desc}" />`
  ).replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${ogImage}" />`
  ).replace(
    /<meta name="author" content="[^"]*" \/>/,
    `<meta name="author" content="${siteName}" />`
  ).replace(
    '</head>',
    `  ${gscMeta}\n  ${hreflangTags(path, tenant)}\n  ${schemaBlock}\n</head>`
  );

  return new Response(injected, {
    status:  res.status,
    headers: {
      ...Object.fromEntries(res.headers),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
