// Multi-tenant domain detection utility
// Maps frontend domain to tenant identifier

const DOMAIN_TO_TENANT: Record<string, string> = {
  // Ireland
  'theberman.eu': 'ireland',
  'www.theberman.eu': 'ireland',
  // Spain - Unicode versions (browser display)
  'certificadoenergético.eu': 'spain',
  'www.certificadoenergético.eu': 'spain',
  // Spain - Punycode versions (Vercel/DNS internal format)
  'xn--certificadoenergtico-9ec.eu': 'spain',
  'www.xn--certificadoenergtico-9ec.eu': 'spain',
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
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // Allow query param override for local testing ONLY: ?tenant=spain
  if (isLocalhost) {
    const urlParams = new URLSearchParams(window.location.search);
    const paramTenant = urlParams.get('tenant');
    if (paramTenant) {
      sessionStorage.setItem('dev_tenant_override', paramTenant);
      return paramTenant;
    }
    // Persist override across client-side navigation within the same tab only
    const storedTenant = sessionStorage.getItem('dev_tenant_override');
    if (storedTenant) return storedTenant;
  }

  return DOMAIN_TO_TENANT[hostname] || 'ireland';
}

export function getTenantDisplayName(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'The Berman',
    'spain': 'Certificado Energético',
    'england': 'EPC Cert',
  };
  return map[tenant] || tenant;
}

export function getTenantCurrency(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'EUR',
    'spain': 'EUR',
    'england': 'GBP',
  };
  return map[tenant] || 'EUR';
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
    return 'https://epccert.com';
  }
  return 'https://theberman.eu';
}

export function getTenantEmail(tenant: string): string {
  if (tenant === 'spain') {
    const host = getCurrentHostname();
    if (host && host.includes('certificado')) {
      const domain = host.replace(/^www\./, '');
      return `hola@${domain}`;
    }
    return 'hola@certificadoenergético.eu';
  }
  if (tenant === 'england') {
    return 'hello@epccert.com';
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
  return 'theberman.eu';
}
