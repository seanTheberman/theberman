// Multi-tenant domain detection utility
// Maps frontend domain to tenant identifier

const DOMAIN_TO_TENANT: Record<string, string> = {
  // Ireland
  'theberman.eu': 'ireland',
  'www.theberman.eu': 'ireland',
  // Spain - Unicode versions (browser display)
  'certificadoenergético.eu': 'spain',
  'www.certificadoenergético.eu': 'spain',
  // Spain - Punycode versions (needed because browsers / Googlebot report
  // internationalised domain names in ASCII/punycode form internally)
  'xn--certificadoenergtico-q2b.eu': 'spain',
  'www.xn--certificadoenergtico-q2b.eu': 'spain',
  // Spain - Other domains
  'certificadosenergetico.com': 'spain',
  'www.certificadosenergetico.com': 'spain',
  'certificadosenergetico.eu': 'spain',
  'www.certificadosenergetico.eu': 'spain',
  'certificadosenergetico.es': 'spain',
  'www.certificadosenergetico.es': 'spain',
  // England
  'epccert.com': 'england',
  'www.epccert.com': 'england',
  'epccert.be': 'england',
  'www.epccert.be': 'england',
  // France
  'dpefrance.eu': 'france',
  'www.dpefrance.eu': 'france',
  'diagnostic-france.eu': 'france',
  'www.diagnostic-france.eu': 'france',
  // Portugal
  'certificado-pt.eu': 'portugal',
  'www.certificado-pt.eu': 'portugal',
  'certificadopt.eu': 'portugal',
  'www.certificadopt.eu': 'portugal',
  // Local dev
  'localhost': 'ireland',
};

export function getTenantFromDomain(): string {
  // Clean up any stale override left in localStorage from older builds —
  // the override is now per-tab (sessionStorage) so it doesn't leak into Ireland URLs
  // when developers are testing Spain locally.
  if (typeof localStorage !== 'undefined' && localStorage.getItem('dev_tenant_override')) {
    localStorage.removeItem('dev_tenant_override');
  }

  const hostname = window.location.hostname;
  const domainTenant = DOMAIN_TO_TENANT[hostname];

  // Allow query param override when inside an iframe (admin visual editor preview)
  const urlParams = new URLSearchParams(window.location.search);
  const paramTenant = urlParams.get('tenant');
  const isInIframe = window.self !== window.top;

  if (paramTenant && isInIframe) {
    sessionStorage.setItem('dev_tenant_override', paramTenant);
    return paramTenant;
  }

  // On any known production domain (not localhost), trust the hostname
  // unconditionally. This prevents ?tenant=spain from leaking into real
  // tenant domains when visited directly by end users.
  if (domainTenant && hostname !== 'localhost') {
    return domainTenant;
  }

  // Allow query param override on localhost (dev testing)
  if (paramTenant) {
    sessionStorage.setItem('dev_tenant_override', paramTenant);
    return paramTenant;
  }

  // Persist override across client-side navigation within the same tab only
  const storedTenant = sessionStorage.getItem('dev_tenant_override');
  if (storedTenant) return storedTenant;

  return domainTenant || 'ireland';
}

export function getTenantDisplayName(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'The BER Man',
    'spain': 'Certificado Energético',
    'england': 'EPC Cert',
    'france': 'DPE France',
    'portugal': 'Certificado Energético',
  };
  return map[tenant] || tenant;
}

export function getTenantCurrency(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'EUR',
    'spain': 'EUR',
    'england': 'GBP',
    'france': 'EUR',
    'portugal': 'EUR',
  };
  return map[tenant] || 'EUR';
}

export function formatCurrency(amount: number | null | undefined, tenant?: string): string {
  const currency = getTenantCurrency(tenant || getTenantFromDomain());
  const value = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

function getCurrentHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.hostname.replace(/^www\./, '');
}

export function getTenantWebsiteUrl(tenant: string): string {
  if (tenant === 'spain') {
    const host = getCurrentHostname();
    if (host && host.includes('certificado')) return `https://${host}`;
    return 'https://certificadoenergético.eu';
  }
  if (tenant === 'england') {
    const host = getCurrentHostname();
    if (host && host.includes('epccert')) return `https://${host}`;
    return 'https://www.epccert.com';
  }
  if (tenant === 'france') {
    const host = getCurrentHostname();
    if (host && host.includes('france')) return `https://${host}`;
    return 'https://dpefrance.eu';
  }
  if (tenant === 'portugal') {
    const host = getCurrentHostname();
    if (host && host.includes('pt')) return `https://${host}`;
    return 'https://certificadopt.eu';
  }
  return 'https://www.theberman.eu';
}

export function getTenantEmail(tenant: string): string {
  if (tenant === 'spain') {
    return 'info@certificadoenergético.eu';
  }
  if (tenant === 'england') {
    return 'hello@epccert.com';
  }
  if (tenant === 'france') {
    return 'contact@dpefrance.eu';
  }
  if (tenant === 'portugal') {
    return 'contact@certificadopt.eu';
  }
  return 'hello@theberman.eu';
}

export function getTenantDomain(tenant: string): string {
  if (tenant === 'spain') {
    const host = getCurrentHostname();
    if (host && host.includes('certificado')) return host.replace(/^www\./, '');
    return 'certificadoenergético.eu';
  }
  if (tenant === 'england') {
    const host = getCurrentHostname();
    if (host && host.includes('epccert')) return host.replace(/^www\./, '');
    return 'epccert.com';
  }
  if (tenant === 'france') {
    const host = getCurrentHostname();
    if (host && host.includes('france')) return host.replace(/^www\./, '');
    return 'dpefrance.eu';
  }
  if (tenant === 'portugal') {
    const host = getCurrentHostname();
    if (host && host.includes('pt')) return host.replace(/^www\./, '');
    return 'certificadopt.eu';
  }
  return 'theberman.eu';
}
