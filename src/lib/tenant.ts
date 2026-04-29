// Multi-tenant domain detection utility
// Maps frontend domain to tenant identifier

const DOMAIN_TO_TENANT: Record<string, string> = {
  'theberman.eu': 'ireland',
  'www.theberman.eu': 'ireland',
  'certificadoenergético.eu': 'spain',
  'www.certificadoenergético.eu': 'spain',
  'certificadosenergetico.com': 'spain',
  'www.certificadosenergetico.com': 'spain',
  'certificadosenergetico.eu': 'spain',
  'www.certificadosenergetico.eu': 'spain',
  'certificadosenergetico.es': 'spain',
  'www.certificadosenergetico.es': 'spain',
  'localhost': 'ireland', // default for local dev
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
  };
  return map[tenant] || tenant;
}

export function getTenantCurrency(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'EUR',
    'spain': 'EUR',
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
  return 'hello@theberman.eu';
}

export function getTenantDomain(tenant: string): string {
  if (tenant === 'spain') {
    const host = getCurrentHostname();
    if (host && host.includes('certificado')) return host.replace(/^www\./, '');
    return 'certificadoenergético.eu';
  }
  return 'theberman.eu';
}
